export const defaultRules = [
  // ── EARNINGS ─────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    code: "BASIC",
    name: "Basic Salary",
    sequence: 1,
    category: "earning",
    condition: "",
    formula: "base_salary"
  },
  {
    id: crypto.randomUUID(),
    code: "LUNCH",
    name: "Lunch Allowance",
    sequence: 2,
    category: "earning",
    condition: "",
    formula: "0"
  },
  {
    id: crypto.randomUUID(),
    code: "PHONE",
    name: "Phone Allowance",
    sequence: 3,
    category: "earning",
    condition: "",
    formula: "0"
  },
  {
    id: crypto.randomUUID(),
    code: "OVERTIME",
    name: "Overtime Pay",
    sequence: 4,
    category: "earning",
    condition: "overtime_hours > 0",
    formula: "overtime_hours * hourly_rate * 1.5"
  },
  {
    id: crypto.randomUUID(),
    code: "BONUS",
    name: "Bonus",
    sequence: 5,
    category: "earning",
    condition: "bonus > 0",
    formula: "bonus"
  },
  {
    id: crypto.randomUUID(),
    code: "SALES_BONUS",
    name: "Sales Commission (5%)",
    sequence: 6,
    category: "earning",
    condition: "sales_amount > 0",
    formula: "sales_amount * 0.05"
  },
  // ── GROSS (thực nhận, dùng cho thuế) ────────────────────
  {
    id: crypto.randomUUID(),
    code: "GROSS",
    name: "Gross Salary (actual)",
    sequence: 10,
    category: "summary",
    condition: "",
    formula: "BASIC + LUNCH + PHONE + OVERTIME + BONUS + SALES_BONUS"
  },
  // ── INSURANCE BASE (lương đóng BH, có trần 36tr) ─────────
  // insurance_salary nhập từ context — là lương hợp đồng / lương đóng BH
  // có thể thấp hơn base_salary nhưng không thấp hơn lương tối thiểu vùng
  {
    id: crypto.randomUUID(),
    code: "INSURANCE_BASE",
    name: "Insurance Base (capped 20× base)",
    sequence: 20,
    category: "insurance",
    condition: "insurance_enabled",
    formula: "min(max(insurance_salary, min_wage), gov_base_salary * 20)"
  },
  {
    id: crypto.randomUUID(),
    code: "BHXH",
    name: "Social Insurance (8%)",
    sequence: 21,
    category: "insurance",
    condition: "insurance_enabled",
    formula: "INSURANCE_BASE * 0.08"
  },
  {
    id: crypto.randomUUID(),
    code: "BHYT",
    name: "Health Insurance (1.5%)",
    sequence: 22,
    category: "insurance",
    condition: "insurance_enabled",
    formula: "INSURANCE_BASE * 0.015"
  },
  {
    id: crypto.randomUUID(),
    code: "BHTN",
    name: "Unemployment Insurance (1%)",
    sequence: 23,
    category: "insurance",
    condition: "insurance_enabled",
    formula: "INSURANCE_BASE * 0.01"
  },
  {
    id: crypto.randomUUID(),
    code: "TOTAL_INSURANCE",
    name: "Total Insurance (10.5%)",
    sequence: 24,
    category: "insurance",
    condition: "insurance_enabled",
    formula: "BHXH + BHYT + BHTN"
  },
  // ── PERSONAL INCOME TAX (TNCN) — tính trên GROSS thực ───
  {
    id: crypto.randomUUID(),
    code: "PERSONAL_DEDUCTION",
    name: "Personal Tax Deduction",
    sequence: 30,
    category: "tax",
    condition: "tax_enabled",
    formula: "15500000"
  },
  {
    id: crypto.randomUUID(),
    code: "DEPENDENT_DEDUCTION",
    name: "Dependent Deduction",
    sequence: 31,
    category: "tax",
    condition: "tax_enabled && dependents > 0",
    formula: "dependents * 6200000"
  },
  {
    id: crypto.randomUUID(),
    code: "TAXABLE_INCOME",
    name: "Taxable Income",
    sequence: 32,
    category: "tax",
    condition: "tax_enabled",
    formula: "max(0, GROSS - TOTAL_INSURANCE - PERSONAL_DEDUCTION - DEPENDENT_DEDUCTION)"
  },
  {
    id: crypto.randomUUID(),
    code: "PIT",
    name: "Personal Income Tax (TNCN)",
    sequence: 40,
    category: "tax",
    condition: "tax_enabled",
    formula: "progressive_tax(TAXABLE_INCOME)"
  },
  // ── NET ──────────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    code: "NET",
    name: "Net Salary",
    sequence: 50,
    category: "summary",
    condition: "",
    formula: "GROSS - TOTAL_INSURANCE - PIT"
  }
];

// Lương tối thiểu vùng theo Nghị định 293/2025/NĐ-CP (hiệu lực 01/01/2026)
export const MIN_WAGE_BY_REGION = {
  I:   5310000,
  II:  4730000,
  III: 4140000,
  IV:  3700000,
};

// Lương tối thiểu vùng cũ theo Nghị định 74/2024/NĐ-CP (hiệu lực 1/7/2024 – 31/12/2025)
export const MIN_WAGE_BY_REGION_2024 = {
  I:   4960000,
  II:  4410000,
  III: 3860000,
  IV:  3450000,
};

/**
 * Hằng số Payroll Việt Nam 2026
 * H1: 01/01/2026 – 30/06/2026
 * H2: 01/07/2026 – 31/12/2026
 */
export const PAYROLL_CONSTANTS = {
  H1: {
    effective_from: "2026-01-01",
    effective_to:   "2026-06-30",
    personal_deduction:  15_500_000,  // NQ 110/2025/UBTVQH15
    dependent_deduction:  6_200_000,  // NQ 110/2025/UBTVQH15
    base_salary:          2_340_000,  // NĐ 73/2024/NĐ-CP
    pit_brackets: 7,                  // Biểu thuế 7 bậc cũ
    insurance_cap_multiplier: 20,     // 20 × lương cơ sở
    get insurance_cap() { return this.base_salary * this.insurance_cap_multiplier; }, // 46,800,000
  },
  H2: {
    effective_from: "2026-07-01",
    effective_to:   null,
    personal_deduction:  15_500_000,  // Luật Thuế TNCN 2025
    dependent_deduction:  6_200_000,  // Luật Thuế TNCN 2025
    base_salary:          2_527_000,  // NĐ 73/2024/NĐ-CP (cập nhật)
    pit_brackets: 5,                  // Biểu thuế 5 bậc mới (Luật PIT 2025)
    insurance_cap_multiplier: 20,
    get insurance_cap() { return this.base_salary * this.insurance_cap_multiplier; }, // 50,540,000
  },
};

export const defaultContext = {
  base_salary: 15000000,
  insurance_salary: 5000000,
  gov_base_salary: 2340000,
  region: "III",
  overtime_hours: 0,
  hourly_rate: 48000,
  sales_amount: 0,
  dependents: 1,
  bonus: 0,
  insurance_enabled: 1,
  tax_enabled: 1,
  working_days: 26,
  leave_days: 0,
  late_minutes: 0,
};
