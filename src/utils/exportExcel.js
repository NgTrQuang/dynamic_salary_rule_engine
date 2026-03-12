import * as XLSX from "xlsx";
import { MIN_WAGE_BY_REGION } from "../data/defaultRules";
import { runEngine } from "../engine/ruleEngine";

/**
 * Column definitions for the payroll Excel export.
 * Each entry: { key, headerVI, headerEN, format }
 */
const INPUT_COLUMNS = [
  { key: "employee_id",       vi: "Mã NV",                   en: "Employee ID" },
  { key: "full_name",         vi: "Họ và tên",               en: "Full Name" },
  { key: "department",        vi: "Phòng ban",               en: "Department" },
  { key: "position",          vi: "Chức vụ",                 en: "Chức vụ / Position" },
  { key: "region",            vi: "Vùng lương",              en: "Wage Region" },
  { key: "base_salary",       vi: "Lương thực nhận (Gross)", en: "Gross Salary" },
  { key: "insurance_salary",  vi: "Lương đóng BH",           en: "Insurance Salary" },
  { key: "gov_base_salary",   vi: "Lương cơ sở NN",          en: "Gov. Base Salary" },
  { key: "bonus",             vi: "Thưởng",                  en: "Bonus" },
  { key: "sales_amount",      vi: "Doanh số",                en: "Sales Amount" },
  { key: "overtime_hours",    vi: "Giờ làm thêm",            en: "Overtime Hours" },
  { key: "hourly_rate",       vi: "Đơn giá/giờ",             en: "Hourly Rate" },
  { key: "working_days",      vi: "Ngày làm việc",           en: "Working Days" },
  { key: "leave_days",        vi: "Ngày nghỉ",               en: "Leave Days" },
  { key: "late_minutes",      vi: "Phút đi muộn",            en: "Late Minutes" },
  { key: "dependents",        vi: "Người phụ thuộc",         en: "Dependents" },
  { key: "insurance_enabled", vi: "Bảo hiểm (1/0)",          en: "Insurance (1/0)" },
  { key: "tax_enabled",       vi: "Thuế TNCN (1/0)",         en: "PIT (1/0)" },
];

const RESULT_CODES = [
  "BASIC", "LUNCH", "PHONE", "OVERTIME", "BONUS", "SALES_BONUS",
  "GROSS",
  "INSURANCE_BASE", "BHXH", "BHYT", "BHTN", "TOTAL_INSURANCE",
  "PERSONAL_DEDUCTION", "DEPENDENT_DEDUCTION", "TAXABLE_INCOME", "PIT",
  "NET",
];

const RESULT_LABELS_VI = {
  BASIC:               "Lương cơ bản",
  LUNCH:               "Phụ cấp ăn trưa",
  PHONE:               "Phụ cấp điện thoại",
  OVERTIME:            "Làm thêm giờ",
  BONUS:               "Thưởng",
  SALES_BONUS:         "Hoa hồng doanh số",
  GROSS:               "Tổng thu nhập (GROSS)",
  INSURANCE_BASE:      "Lương đóng BH (có trần)",
  BHXH:                "BHXH (8%)",
  BHYT:                "BHYT (1.5%)",
  BHTN:                "BHTN (1%)",
  TOTAL_INSURANCE:     "Tổng BH (10.5%)",
  PERSONAL_DEDUCTION:  "Giảm trừ bản thân",
  DEPENDENT_DEDUCTION: "Giảm trừ người phụ thuộc",
  TAXABLE_INCOME:      "Thu nhập tính thuế",
  PIT:                 "Thuế TNCN",
  NET:                 "LƯƠNG THỰC LĨNH (NET)",
};

const SAMPLE_EMPLOYEES = [
  {
    employee_id: "NV001", full_name: "Nguyễn Văn An",   department: "Kỹ thuật",   position: "Senior Developer",
    region: "I",   base_salary: 25000000, insurance_salary: 15000000, gov_base_salary: 2340000,
    bonus: 2000000, sales_amount: 0,        overtime_hours: 8,  hourly_rate: 96154,
    working_days: 26, leave_days: 0, late_minutes: 0,  dependents: 1, insurance_enabled: 1, tax_enabled: 1,
  },
  {
    employee_id: "NV002", full_name: "Trần Thị Bình",   department: "Kinh doanh", position: "Sales Manager",
    region: "I",   base_salary: 20000000, insurance_salary: 12000000, gov_base_salary: 2340000,
    bonus: 0,       sales_amount: 150000000, overtime_hours: 0, hourly_rate: 76923,
    working_days: 26, leave_days: 1, late_minutes: 15, dependents: 2, insurance_enabled: 1, tax_enabled: 1,
  },
  {
    employee_id: "NV003", full_name: "Lê Minh Cường",   department: "Kế toán",    position: "Kế toán viên",
    region: "II",  base_salary: 12000000, insurance_salary: 8000000,  gov_base_salary: 2340000,
    bonus: 500000,  sales_amount: 0,        overtime_hours: 0,  hourly_rate: 46154,
    working_days: 26, leave_days: 0, late_minutes: 30, dependents: 0, insurance_enabled: 1, tax_enabled: 1,
  },
  {
    employee_id: "NV004", full_name: "Phạm Thị Dung",   department: "Hành chính", position: "Nhân viên HC",
    region: "III", base_salary: 7000000,  insurance_salary: 4140000,  gov_base_salary: 2340000,
    bonus: 0,       sales_amount: 0,        overtime_hours: 4,  hourly_rate: 26923,
    working_days: 24, leave_days: 2, late_minutes: 0,  dependents: 1, insurance_enabled: 1, tax_enabled: 1,
  },
  {
    employee_id: "NV005", full_name: "Hoàng Văn Em",    department: "Kho vận",    position: "Thủ kho",
    region: "IV",  base_salary: 5500000,  insurance_salary: 3700000,  gov_base_salary: 2340000,
    bonus: 0,       sales_amount: 0,        overtime_hours: 0,  hourly_rate: 21154,
    working_days: 26, leave_days: 0, late_minutes: 0,  dependents: 0, insurance_enabled: 1, tax_enabled: 1,
  },
  {
    employee_id: "NV006", full_name: "Võ Thị Phương",   department: "Kỹ thuật",   position: "Junior Developer",
    region: "I",   base_salary: 15000000, insurance_salary: 10000000, gov_base_salary: 2527000,
    bonus: 1000000, sales_amount: 0,        overtime_hours: 16, hourly_rate: 57692,
    working_days: 26, leave_days: 0, late_minutes: 0,  dependents: 0, insurance_enabled: 1, tax_enabled: 1,
  },
];

/**
 * Run engine for one employee row and extract result values by code.
 */
function computeRow(employee, rules) {
  const min_wage = MIN_WAGE_BY_REGION[employee.region] ?? MIN_WAGE_BY_REGION["III"];
  const ctx = { ...employee, min_wage };
  const results = runEngine(rules, ctx);
  const map = {};
  for (const r of results) map[r.code] = r.value ?? 0;
  return map;
}

/**
 * Build merged header row: Input fields | Computed fields
 */
function buildHeaders(lang = "vi") {
  const inputHeaders = INPUT_COLUMNS.map((c) => (lang === "vi" ? c.vi : c.en));
  const resultHeaders = RESULT_CODES.map((code) =>
    lang === "vi" ? (RESULT_LABELS_VI[code] ?? code) : code
  );
  return [...inputHeaders, ...resultHeaders];
}

/**
 * Build a data row merging input + computed values.
 */
function buildDataRow(employee, computed) {
  const inputValues = INPUT_COLUMNS.map((c) => employee[c.key] ?? "");
  const resultValues = RESULT_CODES.map((code) => computed[code] ?? 0);
  return [...inputValues, ...resultValues];
}

/**
 * Apply styles: bold headers, currency format for money columns,
 * highlight NET column in green.
 */
function styleSheet(ws, totalRows, inputColCount, resultColCount) {
  const totalCols = inputColCount + resultColCount;

  // Column widths
  const colWidths = [];
  for (let i = 0; i < inputColCount; i++) colWidths.push({ wch: i < 4 ? 20 : 16 });
  for (let i = 0; i < resultColCount; i++) colWidths.push({ wch: 22 });
  ws["!cols"] = colWidths;

  // Freeze top 3 rows + first 2 columns
  ws["!freeze"] = { xSplit: 2, ySplit: 3 };
}

/**
 * Main export function.
 * @param {Array} rules  - Current rule set from App state
 * @param {string} lang  - "vi" | "en"
 */
export function exportPayrollExcel(rules, lang = "vi") {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Payroll Data ────────────────────────────────────────────────
  const sheetData = [];

  // Row 1: Section labels
  const sectionRow = new Array(INPUT_COLUMNS.length + RESULT_CODES.length).fill("");
  sectionRow[0] = lang === "vi" ? "THÔNG TIN ĐẦU VÀO" : "INPUT DATA";
  sectionRow[INPUT_COLUMNS.length] = lang === "vi" ? "KẾT QUẢ TÍNH LƯƠNG" : "PAYROLL COMPUTED";
  sheetData.push(sectionRow);

  // Row 2: Note row
  const noteRow = new Array(INPUT_COLUMNS.length + RESULT_CODES.length).fill("");
  noteRow[0] = lang === "vi"
    ? "Cập nhật: NĐ 293/2025 (lương tối thiểu vùng) · NQ 110/2025 (giảm trừ PIT) · NĐ 73/2024 (lương cơ sở) · Luật PIT 2025 (từ 01/07/2026)"
    : "Updated: Decree 293/2025 (min wages) · NR 110/2025 (PIT deductions) · Decree 73/2024 (base salary) · PIT Law 2025 (from 01/07/2026)";
  sheetData.push(noteRow);

  // Row 3: Headers
  sheetData.push(buildHeaders(lang));

  // Data rows
  for (const emp of SAMPLE_EMPLOYEES) {
    const computed = computeRow(emp, rules);
    sheetData.push(buildDataRow(emp, computed));
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  styleSheet(ws, sheetData.length, INPUT_COLUMNS.length, RESULT_CODES.length);
  XLSX.utils.book_append_sheet(wb, ws, lang === "vi" ? "Bảng lương" : "Payroll");

  // ── Sheet 2: Schema Reference ────────────────────────────────────────────
  const schemaData = [
    [lang === "vi" ? "Trường dữ liệu" : "Field", lang === "vi" ? "Diễn giải" : "Description", lang === "vi" ? "Đơn vị" : "Unit", lang === "vi" ? "Ghi chú" : "Notes"],
    // Inputs
    ["employee_id",       lang === "vi" ? "Mã nhân viên"                   : "Employee ID",               "text",  ""],
    ["full_name",         lang === "vi" ? "Họ và tên"                       : "Full name",                 "text",  ""],
    ["department",        lang === "vi" ? "Phòng ban"                       : "Department",                "text",  ""],
    ["position",          lang === "vi" ? "Chức vụ"                         : "Position",                  "text",  ""],
    ["region",            lang === "vi" ? "Vùng lương tối thiểu (I/II/III/IV)" : "Min wage region (I–IV)", "I/II/III/IV", lang === "vi" ? "NĐ 293/2025/NĐ-CP" : "Decree 293/2025"],
    ["base_salary",       lang === "vi" ? "Lương thực nhận (dùng tính thuế)" : "Gross salary (for PIT)",  "VND/tháng", ""],
    ["insurance_salary",  lang === "vi" ? "Lương đóng BH (lương hợp đồng)"  : "Insurance salary",         "VND/tháng", lang === "vi" ? "Không thấp hơn min_wage" : "≥ min_wage"],
    ["gov_base_salary",   lang === "vi" ? "Lương cơ sở nhà nước"            : "Government base salary",   "VND",  lang === "vi" ? "H1: 2,340,000 · H2: 2,527,000 (NĐ 73/2024)" : "H1: 2,340,000 · H2: 2,527,000"],
    ["bonus",             lang === "vi" ? "Thưởng một lần"                  : "One-time bonus",            "VND",  ""],
    ["sales_amount",      lang === "vi" ? "Doanh số (hoa hồng 5%)"          : "Sales amount (5% comm.)",  "VND",  ""],
    ["overtime_hours",    lang === "vi" ? "Số giờ làm thêm"                 : "Overtime hours",            "giờ",  lang === "vi" ? "×1.5 đơn giá" : "×1.5 rate"],
    ["hourly_rate",       lang === "vi" ? "Đơn giá giờ làm thêm"            : "Overtime hourly rate",      "VND/giờ", ""],
    ["working_days",      lang === "vi" ? "Ngày làm việc trong kỳ"          : "Working days",              "ngày", ""],
    ["leave_days",        lang === "vi" ? "Ngày nghỉ"                       : "Leave days",                "ngày", ""],
    ["late_minutes",      lang === "vi" ? "Phút đi muộn"                    : "Late minutes",              "phút", ""],
    ["dependents",        lang === "vi" ? "Số người phụ thuộc"              : "Number of dependents",      "người", lang === "vi" ? "6,200,000 ₫/người — NQ 110/2025" : "6,200,000 ₫/person"],
    ["insurance_enabled", lang === "vi" ? "Bật bảo hiểm (1=có, 0=không)"   : "Insurance flag (1/0)",      "1/0",  ""],
    ["tax_enabled",       lang === "vi" ? "Bật thuế TNCN (1=có, 0=không)"   : "PIT flag (1/0)",            "1/0",  ""],
    ["", "", "", ""],
    // Computed
    [lang === "vi" ? "--- KẾT QUẢ TÍNH TOÁN ---" : "--- COMPUTED RESULTS ---", "", "", ""],
    ["BASIC",               lang === "vi" ? "Lương cơ bản (= base_salary)"          : "Basic salary",             "VND", ""],
    ["LUNCH",               lang === "vi" ? "Phụ cấp ăn trưa"                       : "Lunch allowance",          "VND", ""],
    ["PHONE",               lang === "vi" ? "Phụ cấp điện thoại"                    : "Phone allowance",          "VND", ""],
    ["OVERTIME",            lang === "vi" ? "Làm thêm giờ (hours × rate × 1.5)"     : "Overtime pay",             "VND", ""],
    ["BONUS",               lang === "vi" ? "Thưởng"                                : "Bonus",                    "VND", ""],
    ["SALES_BONUS",         lang === "vi" ? "Hoa hồng doanh số (5%)"                : "Sales commission (5%)",    "VND", ""],
    ["GROSS",               lang === "vi" ? "Tổng thu nhập (GROSS)"                 : "Gross income",             "VND", lang === "vi" ? "Căn cứ tính thuế TNCN" : "Base for PIT"],
    ["INSURANCE_BASE",      lang === "vi" ? "Lương đóng BH (có trần 20× cơ sở)"     : "Insurance base (cap 20×)", "VND", ""],
    ["BHXH",                lang === "vi" ? "BHXH người lao động (8%)"              : "Social insurance (8%)",    "VND", ""],
    ["BHYT",                lang === "vi" ? "BHYT người lao động (1.5%)"            : "Health insurance (1.5%)",  "VND", ""],
    ["BHTN",                lang === "vi" ? "BHTN người lao động (1%)"              : "Unemployment ins. (1%)",   "VND", ""],
    ["TOTAL_INSURANCE",     lang === "vi" ? "Tổng bảo hiểm (10.5%)"                : "Total insurance (10.5%)",  "VND", ""],
    ["PERSONAL_DEDUCTION",  lang === "vi" ? "Giảm trừ bản thân (15,500,000/tháng)" : "Personal deduction",       "VND", lang === "vi" ? "NQ 110/2025 · từ 01/01/2026" : "NR 110/2025 · from 01/01/2026"],
    ["DEPENDENT_DEDUCTION", lang === "vi" ? "Giảm trừ người phụ thuộc (6,200,000×n)" : "Dependent deduction",   "VND", lang === "vi" ? "NQ 110/2025 · từ 01/01/2026" : "NR 110/2025 · from 01/01/2026"],
    ["TAXABLE_INCOME",      lang === "vi" ? "Thu nhập tính thuế"                    : "Taxable income",           "VND", "GROSS - TOTAL_INSURANCE - deductions"],
    ["PIT",                 lang === "vi" ? "Thuế TNCN (progressive_tax)"           : "Personal income tax",      "VND", lang === "vi" ? "H1: 7 bậc · H2 (từ 01/07/2026): 5 bậc" : "H1: 7 brackets · H2: 5 brackets"],
    ["NET",                 lang === "vi" ? "LƯƠNG THỰC LĨNH = GROSS - BH - PIT"    : "NET salary = GROSS - INS - PIT", "VND", ""],
  ];

  const wsSchema = XLSX.utils.aoa_to_sheet(schemaData);
  wsSchema["!cols"] = [{ wch: 22 }, { wch: 50 }, { wch: 14 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsSchema, lang === "vi" ? "Schema" : "Schema");

  // ── Sheet 3: PIT Brackets ────────────────────────────────────────────────
  const pitData = [
    [lang === "vi" ? "BIỂU THUẾ LŨY TIẾN VIỆT NAM" : "VIETNAMESE PIT BRACKETS", "", "", "", ""],
    ["", "", "", "", ""],
    [
      lang === "vi" ? "Giai đoạn" : "Period",
      lang === "vi" ? "Bậc" : "Bracket",
      lang === "vi" ? "Thu nhập tính thuế / tháng" : "Taxable income / month",
      lang === "vi" ? "Thuế suất" : "Rate",
      lang === "vi" ? "Căn cứ pháp lý" : "Legal basis",
    ],
    // H1 (7 brackets)
    ["H1 2026\n(01/01–30/06)", "1", "0 – 5,000,000",          "5%",  "TT 111/2013/TT-BTC"],
    ["",                       "2", "5,000,001 – 10,000,000",  "10%", ""],
    ["",                       "3", "10,000,001 – 18,000,000", "15%", ""],
    ["",                       "4", "18,000,001 – 32,000,000", "20%", ""],
    ["",                       "5", "32,000,001 – 52,000,000", "25%", ""],
    ["",                       "6", "52,000,001 – 80,000,000", "30%", ""],
    ["",                       "7", "Trên 80,000,000",         "35%", ""],
    ["", "", "", "", ""],
    // H2 (5 brackets)
    ["H2 2026\n(từ 01/07)", "1", "0 – 10,000,000",           "5%",  "Luật Thuế TNCN 2025"],
    ["",                    "2", "10,000,001 – 30,000,000",   "10%", ""],
    ["",                    "3", "30,000,001 – 60,000,000",   "20%", ""],
    ["",                    "4", "60,000,001 – 100,000,000",  "30%", ""],
    ["",                    "5", "Trên 100,000,000",          "35%", ""],
    ["", "", "", "", ""],
    // Deductions
    [lang === "vi" ? "GIẢM TRỪ GIA CẢNH (từ 01/01/2026)" : "PERSONAL ALLOWANCES (from 01/01/2026)", "", "", "", ""],
    [lang === "vi" ? "Bản thân" : "Personal",        "", "15,500,000 ₫/tháng", "", "NQ 110/2025/UBTVQH15"],
    [lang === "vi" ? "Người phụ thuộc" : "Dependent", "", "6,200,000 ₫/người/tháng", "", "NQ 110/2025/UBTVQH15"],
    ["", "", "", "", ""],
    // Min wages
    [lang === "vi" ? "LƯƠNG TỐI THIỂU VÙNG 2026 (NĐ 293/2025)" : "MIN WAGES 2026 (Decree 293/2025)", "", "", "", ""],
    [lang === "vi" ? "Vùng I"   : "Region I",   "", "5,310,000 ₫", "", "Hà Nội, TP.HCM, ..."],
    [lang === "vi" ? "Vùng II"  : "Region II",  "", "4,730,000 ₫", "", ""],
    [lang === "vi" ? "Vùng III" : "Region III", "", "4,140,000 ₫", "", ""],
    [lang === "vi" ? "Vùng IV"  : "Region IV",  "", "3,700,000 ₫", "", ""],
    ["", "", "", "", ""],
    // Base salary
    [lang === "vi" ? "LƯƠNG CƠ SỞ NHÀ NƯỚC (NĐ 73/2024)" : "GOV. BASE SALARY (Decree 73/2024)", "", "", "", ""],
    ["H1 2026 (01/01–30/06)", "", "2,340,000 ₫", lang === "vi" ? "Trần BH = 46,800,000 ₫" : "Ins. cap = 46,800,000 ₫", ""],
    ["H2 2026 (từ 01/07)",    "", "2,527,000 ₫", lang === "vi" ? "Trần BH = 50,540,000 ₫" : "Ins. cap = 50,540,000 ₫", ""],
  ];

  const wsPIT = XLSX.utils.aoa_to_sheet(pitData);
  wsPIT["!cols"] = [{ wch: 22 }, { wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsPIT, lang === "vi" ? "Biểu thuế & Hằng số" : "Tax Brackets");

  // ── Write file ────────────────────────────────────────────────────────────
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const filename = `payroll_${stamp}.xlsx`;
  XLSX.writeFile(wb, filename);
}
