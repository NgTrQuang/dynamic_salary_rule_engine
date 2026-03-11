# PAYROLL ENGINE SPEC

## 1. Tổng quan

**Dynamic Payroll Engine** là hệ thống tính lương động cho phép:

- Cấu hình công thức tính lương theo rule (không cần code lại)
- Áp dụng cho nhiều chức vụ / nhiều nhân viên
- Tính lương hàng loạt theo kỳ lương
- Sinh payslip chi tiết
- Xuất báo cáo thuế và bảo hiểm

Kiến trúc cốt lõi: **Rule Engine** — mỗi thành phần lương là một rule có công thức, điều kiện, và thứ tự thực thi. Thay đổi luật lương chỉ cần sửa rule, không cần deploy lại hệ thống.

---

## 2. Kiến trúc tổng thể

```
Payroll System
│
├── Salary Structure        → Cấu trúc lương theo chức vụ
│
├── Position Config         → Cấu hình lương theo vị trí
│
├── Employee Salary Profile → Hồ sơ lương nhân viên
│
├── Payroll Period          → Kỳ tính lương
│
├── Payroll Input Data      → Biến đầu vào (context)
│
├── Rule Engine             → Thực thi công thức
│
├── Payroll Calculation     → Kết quả tính lương từng người
│
├── Payslip                 → Phiếu lương
│
└── Reports                 → Báo cáo thuế, bảo hiểm, tổng hợp
```

---

## 3. Core Concepts

### 3.1 Salary Structure

Định nghĩa cấu trúc lương dùng chung cho một nhóm chức vụ.

```json
{
  "id": "structure_staff",
  "name": "Staff Salary Structure",
  "currency": "VND",
  "ruleset": "vn_payroll_2024"
}
```

### 3.2 Position Salary Config

Mỗi chức vụ có cấu hình lương riêng.

```json
{
  "id": "position_staff",
  "name": "Staff",
  "base_salary": 10000000,
  "allowances": {
    "lunch": 730000,
    "phone": 200000
  },
  "insurance_applicable": true,
  "tax_applicable": true
}
```

| Position | Base Salary | Lunch | Phone |
|---|---|---|---|
| Intern | 5,000,000 | 500,000 | — |
| Staff | 10,000,000 | 730,000 | 200,000 |
| Manager | 20,000,000 | 1,000,000 | 500,000 |

### 3.3 Employee Salary Profile

Gán khi tạo nhân viên. Có thể override config của position.

```json
{
  "employee_id": "EMP001",
  "position": "staff",
  "base_salary": 10000000,
  "allowances": { "lunch": 730000, "phone": 200000 },
  "dependents": 1,
  "insurance_enabled": true,
  "tax_enabled": true
}
```

### 3.4 Payroll Period

```json
{
  "id": "2026-01",
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "status": "open"
}
```

---

## 4. Payroll Input Data (Context)

Các biến đầu vào được truyền vào Rule Engine cho mỗi lần tính lương.

| Biến | Kiểu | Mô tả |
|---|---|---|
| `base_salary` | number | Lương cơ bản tháng |
| `overtime_hours` | number | Số giờ làm thêm |
| `hourly_rate` | number | Đơn giá mỗi giờ |
| `bonus` | number | Thưởng một lần |
| `sales_amount` | number | Doanh số (tính hoa hồng) |
| `working_days` | number | Số ngày làm việc trong kỳ |
| `leave_days` | number | Số ngày nghỉ |
| `late_minutes` | number | Tổng phút đi muộn |
| `dependents` | number | Số người phụ thuộc |
| `insurance_enabled` | 0/1 | Bật/tắt BHXH/BHYT/BHTN |
| `tax_enabled` | 0/1 | Bật/tắt thuế TNCN |

---

## 5. Rule Data Structure

```json
{
  "code": "BHXH",
  "name": "Social Insurance (8%)",
  "sequence": 21,
  "category": "insurance",
  "condition": "insurance_enabled",
  "formula": "INSURANCE_BASE * 0.08"
}
```

| Trường | Mô tả |
|---|---|
| `code` | Mã định danh duy nhất — dùng làm biến cho rule sau |
| `name` | Tên hiển thị |
| `sequence` | Thứ tự thực thi (tăng dần) |
| `category` | Phân loại rule |
| `condition` | Điều kiện chạy (JS expression, để trống = luôn chạy) |
| `formula` | Công thức tính (JS expression) |

---

## 6. Rule Categories

| Category | Ý nghĩa | Màu hiển thị |
|---|---|---|
| `earning` | Thu nhập | 🟢 Xanh lá |
| `insurance` | Bảo hiểm bắt buộc | 🟠 Cam |
| `tax` | Thuế TNCN & giảm trừ | 🟣 Tím |
| `summary` | Tổng hợp (GROSS, NET) | 🔵 Xanh dương |
| `deduction` | Khoản trừ khác | 🔴 Đỏ |
| `other` | Biến trung gian | ⚪ Xám |

---

## 7. Rule Engine — Execution Flow

```
for rule in sorted(rules, by=sequence):

    variables = context + previous_results

    if condition:
        condResult = evaluate(condition, variables)
        if not condResult:
            store(rule.code, 0)   # skip, default to 0
            continue

    value = evaluate(formula, variables)
    store(rule.code, value)
```

### 7.1 Formula Evaluation

- Thay thế tất cả tên biến bằng giá trị số (ưu tiên tên dài trước để tránh thay nhầm substring)
- Tính toán bằng `Function()` trong JavaScript
- Built-in helpers được inject vào scope:

| Helper | Mô tả |
|---|---|
| `progressive_tax(income)` | Thuế TNCN lũy tiến 7 bậc |
| `min(a, b)` | Giá trị nhỏ hơn (dùng cho trần bảo hiểm) |
| `max(a, b)` | Giá trị lớn hơn (dùng cho `max(0, ...)`) |

---

## 8. Bộ Rule Mặc Định — Vietnamese Payroll 2024

### Nhóm 1: Earnings (seq 1–6)

| Seq | Code | Formula | Condition |
|---|---|---|---|
| 1 | `BASIC` | `base_salary` | — |
| 2 | `LUNCH` | `730000` | — |
| 3 | `PHONE` | `200000` | — |
| 4 | `OVERTIME` | `overtime_hours * hourly_rate * 1.5` | `overtime_hours > 0` |
| 5 | `BONUS` | `bonus` | `bonus > 0` |
| 6 | `SALES_BONUS` | `sales_amount * 0.05` | `sales_amount > 0` |

### Nhóm 2: Gross (seq 10)

| Seq | Code | Formula |
|---|---|---|
| 10 | `GROSS` | `BASIC + LUNCH + PHONE + OVERTIME + BONUS + SALES_BONUS` |

### Nhóm 3: Insurance — BHXH/BHYT/BHTN (seq 20–24)

> `INSURANCE_BASE` tính trên lương cơ bản, có trần **36,000,000 ₫** theo quy định hiện hành.

| Seq | Code | Formula | Rate |
|---|---|---|---|
| 20 | `INSURANCE_BASE` | `min(BASIC, 36000000)` | — |
| 21 | `BHXH` | `INSURANCE_BASE * 0.08` | 8% |
| 22 | `BHYT` | `INSURANCE_BASE * 0.015` | 1.5% |
| 23 | `BHTN` | `INSURANCE_BASE * 0.01` | 1% |
| 24 | `TOTAL_INSURANCE` | `BHXH + BHYT + BHTN` | **10.5%** |

Tất cả có condition: `insurance_enabled`

### Nhóm 4: Thuế TNCN (seq 30–40)

> Theo quy định giảm trừ gia cảnh 2024–2026

| Seq | Code | Formula | Condition |
|---|---|---|---|
| 30 | `PERSONAL_DEDUCTION` | `11000000` | `tax_enabled` |
| 31 | `DEPENDENT_DEDUCTION` | `dependents * 4400000` | `tax_enabled && dependents > 0` |
| 32 | `TAXABLE_INCOME` | `max(0, GROSS - TOTAL_INSURANCE - PERSONAL_DEDUCTION - DEPENDENT_DEDUCTION)` | `tax_enabled` |
| 40 | `PIT` | `progressive_tax(TAXABLE_INCOME)` | `tax_enabled` |

### Nhóm 5: Net (seq 50)

| Seq | Code | Formula |
|---|---|---|
| 50 | `NET` | `GROSS - TOTAL_INSURANCE - PIT` |

---

## 9. Progressive Tax — 7 Bậc (Thông tư 111/2013/TT-BTC)

```
progressive_tax(taxableIncome):
  bracket 1:   0 –  5,000,000  →  5%
  bracket 2:   5 – 10,000,000  → 10%
  bracket 3:  10 – 18,000,000  → 15%
  bracket 4:  18 – 32,000,000  → 20%
  bracket 5:  32 – 52,000,000  → 25%
  bracket 6:  52 – 80,000,000  → 30%
  bracket 7:  > 80,000,000     → 35%
```

Thuế = tổng cộng từng phần trong từng bậc (không phải áp toàn bộ mức cao nhất).

---

## 10. Payslip Data Model

```json
{
  "employee_id": "EMP001",
  "period": "2026-01",
  "gross": 11650000,
  "total_insurance": 1050000,
  "taxable_income": 0,
  "pit": 0,
  "net": 10600000,
  "details": {
    "BASIC": 10000000,
    "LUNCH": 730000,
    "PHONE": 200000,
    "OVERTIME": 720000,
    "BONUS": 0,
    "SALES_BONUS": 0,
    "GROSS": 11650000,
    "INSURANCE_BASE": 10000000,
    "BHXH": 800000,
    "BHYT": 150000,
    "BHTN": 100000,
    "TOTAL_INSURANCE": 1050000,
    "PERSONAL_DEDUCTION": 11000000,
    "DEPENDENT_DEDUCTION": 4400000,
    "TAXABLE_INCOME": 0,
    "PIT": 0,
    "NET": 10600000
  }
}
```

---

## 11. Payroll Batch

Tính lương hàng loạt cho nhiều nhân viên trong một kỳ.

```
Payroll Batch (period: 2026-01)
│
├── EMP001  →  context₁  →  engine  →  payslip₁
├── EMP002  →  context₂  →  engine  →  payslip₂
└── EMP003  →  context₃  →  engine  →  payslip₃
```

**Batch lifecycle:**

| Trạng thái | Mô tả |
|---|---|
| `draft` | Đang tính, có thể sửa |
| `calculated` | Đã tính xong, chờ duyệt |
| `approved` | Đã duyệt |
| `locked` | Đã khóa, không thể sửa |
| `paid` | Đã thanh toán |

---

## 12. Reports

| Báo cáo | Nội dung |
|---|---|
| **Insurance Report** | BHXH / BHYT / BHTN theo từng nhân viên, tổng nộp |
| **Tax Report** | PIT theo từng nhân viên, tổng PIT trong kỳ |
| **Payroll Summary** | Tổng Gross / Insurance / Tax / Net toàn công ty |
| **Payslip** | Chi tiết từng dòng lương cho từng nhân viên |

---

## 13. Lưu trữ (Frontend-only)

Vì ứng dụng hiện tại chạy thuần frontend, data được lưu trong:

- **Memory** (React state) — trong phiên làm việc
- **JSON Export/Import** — để lưu và phục hồi cấu hình rule
- Có thể mở rộng sang `localStorage` hoặc `IndexedDB` khi cần persist

---

## 14. Cấu trúc Module Frontend

```
src/
│
├── engine/
│   └── ruleEngine.js       # Core engine: evaluate, progressive_tax, min, max
│
├── data/
│   └── defaultRules.js     # Rule set mặc định + default context
│
├── components/
│   ├── RuleTable.jsx        # Bảng chỉnh sửa rule (inline edit)
│   ├── ContextInput.jsx     # Form nhập biến đầu vào
│   └── ResultPanel.jsx      # Hiển thị kết quả theo nhóm section
│
└── App.jsx                  # Layout, state management, JSON import/export
```

---

## 15. Điểm mạnh

- **Thay đổi luật không cần deploy** — sửa rule là xong
- **Tham chiếu giữa rule** — rule sau dùng kết quả rule trước như biến
- **Condition linh hoạt** — bật/tắt từng nhóm (insurance, tax) theo profile
- **Helper function extensible** — có thể thêm `round()`, `if_else()`, v.v.
- **Frontend-only** — chạy được mà không cần backend

---

## 16. Hướng mở rộng

| Feature | Mô tả |
|---|---|
| Multi-employee batch | Tính lương hàng loạt, export bảng tổng hợp |
| Attendance integration | Tính lương theo ngày công thực tế |
| Insurance ceiling | Trần BHXH 36tr đã có, cần thêm trần BHTN |
| KPI bonus | Rule tính thưởng KPI theo % target |
| Late penalty | Phạt đi muộn theo `late_minutes` |
| Tax exemption allowance | Phụ cấp miễn thuế (điện thoại, xăng xe) |
| Multi-currency | Hỗ trợ USD/EUR cho nhân viên nước ngoài |
| Multi-country ruleset | Ruleset riêng cho từng quốc gia |
| localStorage persistence | Lưu cấu hình không mất khi reload |
| Backend API | REST API + database cho enterprise |

---

## 17. Công thức NET chuẩn

```
NET = GROSS - TOTAL_INSURANCE - PIT
```

Trong đó:

```
GROSS            = BASIC + LUNCH + PHONE + OVERTIME + BONUS + SALES_BONUS
TOTAL_INSURANCE  = BHXH + BHYT + BHTN                    (10.5% of INSURANCE_BASE)
INSURANCE_BASE   = min(BASIC, 36,000,000)                 (có trần)
TAXABLE_INCOME   = max(0, GROSS - TOTAL_INSURANCE - PERSONAL_DEDUCTION - DEPENDENT_DEDUCTION)
PIT              = progressive_tax(TAXABLE_INCOME)         (7 bậc lũy tiến)
```

---

## 18. Kết luận

```
Salary = Config + Rules + Engine
```

Tách biệt 4 lớp:

| Lớp | Vai trò |
|---|---|
| **UI** | Nhập liệu, hiển thị kết quả |
| **DATA** | Rule set, context, default values |
| **RULE** | Công thức, điều kiện, thứ tự |
| **ENGINE** | Thực thi, evaluate, inject helpers |

Đây là kiến trúc chuẩn của **enterprise payroll system** — linh hoạt, có thể mở rộng, và không phụ thuộc vào bất kỳ ngôn ngữ hay framework cụ thể nào.
