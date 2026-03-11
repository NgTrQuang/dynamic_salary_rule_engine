/**
 * Vietnamese PIT progressive tax (7 brackets, Circular 111/2013/TT-BTC).
 * Income unit: VND/month (taxable income after all deductions).
 */
function progressive_tax(taxableIncome) {
  if (!taxableIncome || taxableIncome <= 0) return 0;

  const brackets = [
    { limit: 5_000_000,  rate: 0.05 },
    { limit: 10_000_000, rate: 0.10 },
    { limit: 18_000_000, rate: 0.15 },
    { limit: 32_000_000, rate: 0.20 },
    { limit: 52_000_000, rate: 0.25 },
    { limit: 80_000_000, rate: 0.30 },
    { limit: Infinity,   rate: 0.35 },
  ];

  let tax = 0;
  let remaining = taxableIncome;
  let prev = 0;

  for (const { limit, rate } of brackets) {
    const slab = Math.min(remaining, limit - prev);
    if (slab <= 0) break;
    tax += slab * rate;
    remaining -= slab;
    prev = limit;
    if (remaining <= 0) break;
  }

  return Math.round(tax);
}

/**
 * Evaluates a formula/condition string by replacing all known variable names
 * with their current values from the context + results map, then using
 * the Function constructor for safe arithmetic evaluation.
 * Built-in helpers (progressive_tax) are injected into scope.
 */
function evaluate(expression, variables) {
  if (!expression || expression.trim() === "") return null;

  // Sort variable names by length descending to avoid partial replacements
  const sortedKeys = Object.keys(variables).sort((a, b) => b.length - a.length);

  let expr = expression.trim();
  for (const key of sortedKeys) {
    const val = variables[key];
    // Replace whole-word occurrences only
    const regex = new RegExp(`\\b${key}\\b`, "g");
    expr = expr.replace(regex, val);
  }

  try {
    // eslint-disable-next-line no-new-func
    return Function(
      "progressive_tax", "min", "max",
      `"use strict"; return (${expr})`
    )(progressive_tax, Math.min, Math.max);
  } catch {
    return null;
  }
}

/**
 * Runs the rule engine.
 * @param {Array} rules - Array of rule objects
 * @param {Object} context - Input variable map { base_salary, overtime_hours, ... }
 * @returns {Array} results - Array of { code, name, value, skipped, error }
 */
export function runEngine(rules, context) {
  const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);
  const results = [];
  const variables = { ...context };
  const seen = new Set();

  // Detect circular dependencies (simple: check if a code appears in its own formula chain)
  // We use a lightweight topological check by tracking which codes are defined
  const definedCodes = new Set();

  for (const rule of sortedRules) {
    const variables_snapshot = { ...variables };

    // Evaluate condition
    if (rule.condition && rule.condition.trim() !== "") {
      const condResult = evaluate(rule.condition, variables_snapshot);
      if (!condResult) {
        results.push({
          code: rule.code,
          name: rule.name,
          sequence: rule.sequence,
          value: null,
          skipped: true,
          conditionFailed: true,
          error: null,
        });
        // Set to 0 so dependent rules don't break
        variables[rule.code] = 0;
        definedCodes.add(rule.code);
        continue;
      }
    }

    // Check for circular reference
    if (seen.has(rule.code)) {
      results.push({
        code: rule.code,
        name: rule.name,
        sequence: rule.sequence,
        value: null,
        skipped: true,
        conditionFailed: false,
        error: "Duplicate code detected",
      });
      continue;
    }
    seen.add(rule.code);

    // Evaluate formula
    const value = evaluate(rule.formula, variables_snapshot);

    if (value === null || value === undefined || typeof value !== "number" || isNaN(value)) {
      results.push({
        code: rule.code,
        name: rule.name,
        sequence: rule.sequence,
        value: null,
        skipped: false,
        conditionFailed: false,
        error: `Cannot evaluate formula: "${rule.formula}"`,
      });
      variables[rule.code] = 0;
    } else {
      results.push({
        code: rule.code,
        name: rule.name,
        sequence: rule.sequence,
        value,
        skipped: false,
        conditionFailed: false,
        error: null,
      });
      variables[rule.code] = value;
    }

    definedCodes.add(rule.code);
  }

  return results;
}
