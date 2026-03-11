# Dynamic Salary Rule Engine Web App

## Goal

Build a simple web application that allows users to configure and execute a dynamic salary rule engine.

The system should evaluate salary formulas dynamically based on configurable rules.

The application should run fully on the frontend with no backend or database required.

All data should be stored in memory or JSON objects.

---

# Tech Stack

Frontend only:

- React (or Vanilla JS)
- TailwindCSS
- No backend
- No database
- All rules stored in JSON

---

# Core Concept

A salary is calculated by executing multiple rules in sequence.

Each rule contains:

- code
- name
- sequence
- condition
- formula

The engine evaluates rules in order and stores the results.

Rules can reference results from previous rules.

Example:

BASIC = 10000000  
LUNCH = 730000  
PHONE = 200000  

GROSS = BASIC + LUNCH + PHONE  

INSURANCE = GROSS * 0.105  

NET = GROSS - INSURANCE

---

# Data Structure

## Salary Rule


{
code: "BASIC",
name: "Basic Salary",
sequence: 1,
category: "earning",
condition: "",
formula: "base_salary"
}


---

## Rule List Example


[
{
"code": "BASIC",
"name": "Basic Salary",
"sequence": 1,
"formula": "base_salary"
},
{
"code": "LUNCH",
"name": "Lunch Allowance",
"sequence": 2,
"formula": "730000"
},
{
"code": "PHONE",
"name": "Phone Allowance",
"sequence": 3,
"formula": "200000"
},
{
"code": "GROSS",
"name": "Gross Salary",
"sequence": 10,
"formula": "BASIC + LUNCH + PHONE"
},
{
"code": "INSURANCE",
"name": "Insurance",
"sequence": 20,
"formula": "GROSS * 0.105"
},
{
"code": "NET",
"name": "Net Salary",
"sequence": 30,
"formula": "GROSS - INSURANCE"
}
]


---

# Context Input

User should provide input values:


{
base_salary: 10000000,
overtime_hours: 10,
hourly_rate: 48000
}


---

# Rule Engine Logic

1. Load rule list
2. Sort rules by sequence
3. Evaluate condition (if exists)
4. Evaluate formula
5. Store result
6. Next rule

---

# Rule Engine Pseudocode


results = {}

for rule in rules_sorted:

if rule.condition exists:
    evaluate condition
    if false:
        continue

value = evaluate(rule.formula)

results[rule.code] = value

---

# Formula Evaluation

The engine must support formulas like:


BASIC + LUNCH + PHONE
GROSS * 0.105
overtime_hours * hourly_rate * 1.5


The engine should replace variable names with values before evaluation.

Example:


formula:
"GROSS * 0.105"

becomes:

11650000 * 0.105


---

# UI Requirements

The web page should have 3 main sections.

## 1 Rule Editor

A table that allows editing rules.

Columns:

- Code
- Name
- Sequence
- Condition
- Formula

Users can:

- add rule
- delete rule
- edit formula

---

## 2 Context Input

A form where users input variables:

- base_salary
- overtime_hours
- hourly_rate
- sales_amount

---

## 3 Result Panel

Displays rule execution results:

Example:


BASIC 10000000
LUNCH 730000
PHONE 200000
GROSS 10930000
INSURANCE 1147650
NET 9782350


---

# Features

Required:

- dynamic formula evaluation
- rule ordering
- rule dependency
- rule editing UI

Optional:

- JSON export
- JSON import
- rule validation
- circular rule detection

---

# Project Structure


src

components
RuleTable.jsx
ContextInput.jsx
ResultPanel.jsx

engine
ruleEngine.js

data
defaultRules.js

App.jsx


---

# Expected Output

The system should allow users to dynamically change formulas and instantly see salary calculation results.