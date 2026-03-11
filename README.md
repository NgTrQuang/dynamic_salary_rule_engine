# Dynamic Salary Rule Engine

Ứng dụng web cho phép cấu hình và thực thi một **rule engine tính lương động** theo chuẩn payroll Việt Nam, hoàn toàn trên frontend — không cần backend, không cần database.

---

## Mục tiêu

Hệ thống cho phép người dùng định nghĩa các quy tắc tính lương dưới dạng công thức, sắp xếp thứ tự thực thi, và xem kết quả tính toán ngay lập tức. Công thức có thể tham chiếu kết quả của các rule trước đó, tạo thành một chuỗi tính toán linh hoạt — đủ để mô phỏng payroll thực tế bao gồm bảo hiểm bắt buộc và thuế thu nhập cá nhân lũy tiến.

---

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | React 18 + Vite |
| Styling | TailwindCSS 3 |
| Icons | Lucide React |
| Lưu trữ | In-memory (JSON object) |
| Backend | Không có |

---

## Cấu trúc dự án

```
dynamic_salary_rule_engine/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx                      # Layout chính, state management
    ├── index.css                    # TailwindCSS directives
    ├── data/
    │   └── defaultRules.js          # Rule set và context mặc định
    ├── engine/
    │   └── ruleEngine.js            # Logic tính toán + progressive_tax
    └── components/
        ├── RuleTable.jsx            # Bảng chỉnh sửa rule (inline edit)
        ├── ContextInput.jsx         # Form nhập biến đầu vào
        └── ResultPanel.jsx          # Kết quả tính toán theo nhóm
```

---

## Cấu trúc dữ liệu Rule

Mỗi rule gồm các trường sau:

| Trường | Kiểu | Mô tả |
|---|---|---|
| `code` | string | Mã định danh duy nhất (VD: `BASIC`, `GROSS`) |
| `name` | string | Tên hiển thị |
| `sequence` | number | Thứ tự thực thi (tăng dần) |
| `category` | string | Phân loại: `earning`, `deduction`, `summary`, `other` |
| `condition` | string | Điều kiện thực thi (để trống = luôn chạy) |
| `formula` | string | Công thức tính giá trị |

**Ví dụ:**

```json
{
  "code": "OVERTIME",
  "name": "Overtime Pay",
  "sequence": 4,
  "category": "earning",
  "condition": "overtime_hours > 0",
  "formula": "overtime_hours * hourly_rate * 1.5"
}
```

---

## Rule mặc định (Vietnamese Payroll)

### Nhóm 1 — Thu nhập (Earnings)

| Seq | Code | Công thức | Điều kiện |
|---|---|---|---|
| 1 | `BASIC` | `base_salary` | — |
| 2 | `LUNCH` | `730000` | — |
| 3 | `PHONE` | `200000` | — |
| 4 | `OVERTIME` | `overtime_hours * hourly_rate * 1.5` | `overtime_hours > 0` |
| 5 | `BONUS` | `bonus` | `bonus > 0` |
| 6 | `SALES_BONUS` | `sales_amount * 0.05` | `sales_amount > 0` |

### Nhóm 2 — Tổng thu nhập

| Seq | Code | Công thức |
|---|---|---|
| 10 | `GROSS` | `BASIC + LUNCH + PHONE + OVERTIME + BONUS + SALES_BONUS` |

### Nhóm 3 — Bảo hiểm bắt buộc (BHXH / BHYT / BHTN)

> Tính trên `INSURANCE_BASE = BASIC` (không tính phụ cấp)

| Seq | Code | Công thức | Tỷ lệ |
|---|---|---|---|
| 20 | `INSURANCE_BASE` | `BASIC` | — |
| 21 | `BHXH` | `INSURANCE_BASE * 0.08` | 8% |
| 22 | `BHYT` | `INSURANCE_BASE * 0.015` | 1.5% |
| 23 | `BHTN` | `INSURANCE_BASE * 0.01` | 1% |
| 24 | `TOTAL_INSURANCE` | `BHXH + BHYT + BHTN` | **10.5%** |

### Nhóm 4 — Thuế TNCN (Personal Income Tax)

> Theo quy định giảm trừ gia cảnh 2024–2026

| Seq | Code | Công thức | Ghi chú |
|---|---|---|---|
| 30 | `PERSONAL_DEDUCTION` | `11000000` | Giảm trừ bản thân |
| 31 | `DEPENDENT_DEDUCTION` | `dependents * 4400000` | Giảm trừ người phụ thuộc |
| 32 | `TAXABLE_INCOME` | `GROSS - TOTAL_INSURANCE - PERSONAL_DEDUCTION - DEPENDENT_DEDUCTION` | Thu nhập tính thuế |
| 40 | `PIT` | `progressive_tax(TAXABLE_INCOME)` | Thuế lũy tiến 7 bậc |

### Nhóm 5 — Lương thực lĩnh

| Seq | Code | Công thức |
|---|---|---|
| 50 | `NET` | `GROSS - TOTAL_INSURANCE - PIT` |

---

## Biến đầu vào (Context)

### Salary & Allowances

| Biến | Mặc định | Mô tả |
|---|---|---|
| `base_salary` | 10,000,000 | Lương cơ bản |
| `overtime_hours` | 10 | Số giờ làm thêm |
| `hourly_rate` | 48,000 | Đơn giá mỗi giờ |
| `bonus` | 0 | Thưởng một lần |

### Tax & Deductions

| Biến | Mặc định | Mô tả |
|---|---|---|
| `dependents` | 1 | Số người phụ thuộc |
| `sales_amount` | 0 | Doanh số (để tính hoa hồng 5%) |

---

## Cách hoạt động của Rule Engine

**File:** `src/engine/ruleEngine.js`

1. **Sắp xếp** các rule theo `sequence` tăng dần.
2. **Đánh giá condition** (nếu có) — nếu `false`, rule bị bỏ qua (skip) và giá trị được đặt thành `0` để các rule sau không bị lỗi.
3. **Thay thế biến** trong formula: tên biến được thay bằng giá trị số tương ứng (ưu tiên tên dài hơn trước để tránh thay nhầm substring).
4. **Tính toán** bằng `Function()` với built-in helper `progressive_tax` được inject vào scope.
5. **Lưu kết quả** vào `variables` để các rule sau tham chiếu.

### Thuế lũy tiến 7 bậc (progressive_tax)

Hàm `progressive_tax(taxableIncome)` được tích hợp sẵn, theo Thông tư 111/2013/TT-BTC:

| Bậc | Thu nhập tính thuế (tháng) | Thuế suất |
|---|---|---|
| 1 | 0 – 5,000,000 ₫ | 5% |
| 2 | 5,000,001 – 10,000,000 ₫ | 10% |
| 3 | 10,000,001 – 18,000,000 ₫ | 15% |
| 4 | 18,000,001 – 32,000,000 ₫ | 20% |
| 5 | 32,000,001 – 52,000,000 ₫ | 25% |
| 6 | 52,000,001 – 80,000,000 ₫ | 30% |
| 7 | > 80,000,000 ₫ | 35% |

Dùng trực tiếp trong formula: `progressive_tax(TAXABLE_INCOME)`

---

## Giao diện

### 1. Rule Editor (Bảng trên cùng)

Hiển thị toàn bộ danh sách rule theo thứ tự sequence.

- **Click vào bất kỳ ô nào** để chỉnh sửa inline (Enter hoặc click ra ngoài để lưu)
- **Nút ▲ / ▼** để đổi thứ tự rule
- **Nút "+ Add Rule"** để thêm rule mới
- **Nút thùng rác** để xóa rule

Màu sắc category trong bảng:
- 🟢 `earning` — xanh lá
- 🔴 `deduction` — đỏ
- 🔵 `summary` — xanh dương
- ⚪ `other` — xám

### 2. Context Input (Dưới trái)

Form nhập biến đầu vào, chia 2 nhóm:
- **Salary & Allowances**: base_salary, overtime_hours, hourly_rate, bonus
- **Tax & Deductions**: dependents, sales_amount

Thay đổi giá trị sẽ tự động tính lại (nếu bật Auto-calculate).

### 3. Result Panel (Dưới phải)

Kết quả được hiển thị theo **5 section có thể collapse**:

| Section | Màu | Nội dung |
|---|---|---|
| Thu nhập (Earnings) | 🟢 Xanh lá | BASIC, LUNCH, PHONE, OVERTIME, BONUS, SALES_BONUS |
| Tổng thu nhập (Gross) | 🔵 Xanh dương | GROSS |
| Bảo hiểm bắt buộc | 🟠 Cam | BHXH, BHYT, BHTN, TOTAL_INSURANCE |
| Thuế TNCN | 🟣 Tím | TAXABLE_INCOME, PIT và các giảm trừ |
| Lương thực lĩnh | 🔵 Xanh đậm | NET |

- Rule bị skip hiển thị mờ với nhãn "skipped"
- Deduction hiển thị dấu `−` màu đỏ
- **NET SALARY** được highlight gradient ở cuối

---

## Tính năng

### Bắt buộc
- ✅ Dynamic formula evaluation (công thức tính toán động)
- ✅ Rule ordering (sắp xếp theo sequence)
- ✅ Rule dependency (rule sau tham chiếu rule trước)
- ✅ Rule editing UI (thêm / sửa / xóa / đổi thứ tự)

### Payroll Việt Nam
- ✅ BHXH 8% + BHYT 1.5% + BHTN 1% tính trên lương cơ bản
- ✅ Giảm trừ gia cảnh bản thân 11,000,000 ₫
- ✅ Giảm trừ người phụ thuộc 4,400,000 ₫/người
- ✅ Thuế TNCN lũy tiến 7 bậc (`progressive_tax`)
- ✅ Hoa hồng doanh số 5% (`SALES_BONUS`)

### Tuỳ chọn
- ✅ JSON Export — tải xuống toàn bộ rules + context thành file `.json`
- ✅ JSON Import — tải lên file `.json` để khôi phục cấu hình
- ✅ Rule validation — báo lỗi khi công thức không hợp lệ
- ✅ Condition support — rule có thể có điều kiện thực thi
- ✅ Duplicate code detection — phát hiện trùng mã rule
- ✅ Auto-calculate toggle — bật/tắt tính toán tự động

---

## Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18

### Các bước

```bash
# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
```

Mở trình duyệt tại: **http://localhost:5173**

```bash
# Build production
npm run build

# Preview bản build
npm run preview
```

---

## Hướng dẫn sử dụng

### Tính lương cơ bản

1. Mở ứng dụng — kết quả hiển thị ngay với dữ liệu mặc định.
2. Nhập **Base Salary** trong phần Context Input.
3. Kết quả cập nhật tức thì ở phần Results.

### Khai báo người phụ thuộc

Nhập số người phụ thuộc vào ô **Dependents**. Hệ thống tự động tính:
- `DEPENDENT_DEDUCTION = dependents * 4,400,000`
- Trừ vào thu nhập tính thuế → giảm PIT

### Khai báo hoa hồng doanh số

Nhập **Sales Amount** → `SALES_BONUS = sales_amount * 5%` tự động được cộng vào GROSS.  
Có thể thay đổi tỷ lệ bằng cách click vào ô Formula của rule `SALES_BONUS`.

### Thêm rule mới

1. Nhấn **+ Add Rule** ở góc phải bảng Rule Editor.
2. Click ô **Code** → nhập mã (VD: `KPI_BONUS`).
3. Click ô **Formula** → nhập công thức (VD: `base_salary * 0.2`).
4. Điều chỉnh **Sequence** để xác định thứ tự.
5. Nhập **Condition** nếu rule chỉ chạy có điều kiện.
6. Thêm mã rule vào formula của `GROSS` nếu cần gộp vào lương.

### Condition syntax

Condition dùng cú pháp JavaScript thuần, có thể tham chiếu cả biến context lẫn kết quả rule trước:

```
overtime_hours > 0
sales_amount >= 10000000
TAXABLE_INCOME > 0
dependents > 0
```

### Tham chiếu giữa các rule

Rule sau có thể dùng **code** của rule trước làm biến trong formula:

```
GROSS = BASIC + LUNCH + PHONE + OVERTIME + BONUS + SALES_BONUS
NET   = GROSS - TOTAL_INSURANCE - PIT
```

> Rule được tham chiếu phải có **sequence nhỏ hơn**.

### Export / Import cấu hình

- **Export JSON**: Lưu rules + context thành file `salary_rules.json`.
- **Import JSON**: Tải lên file `.json` để khôi phục cấu hình.

Format file JSON:

```json
{
  "rules": [ ... ],
  "context": {
    "base_salary": 10000000,
    "overtime_hours": 10,
    "hourly_rate": 48000,
    "bonus": 0,
    "sales_amount": 0,
    "dependents": 1
  }
}
```

### Tắt Auto-calculate

Toggle **Auto-calculate** trên header → tắt tính toán tự động, nút **Calculate** xuất hiện để tính thủ công.

---

## Ví dụ kết quả tính toán

Với dữ liệu mặc định (`base_salary = 10,000,000` · `overtime_hours = 10` · `hourly_rate = 48,000` · `dependents = 1`):

| Code | Tên | Giá trị |
|---|---|---|
| BASIC | Basic Salary | 10,000,000 ₫ |
| LUNCH | Lunch Allowance | 730,000 ₫ |
| PHONE | Phone Allowance | 200,000 ₫ |
| OVERTIME | Overtime Pay | 720,000 ₫ |
| BONUS | Bonus | *(skipped)* |
| SALES_BONUS | Sales Commission | *(skipped)* |
| **GROSS** | **Gross Salary** | **11,650,000 ₫** |
| INSURANCE_BASE | Insurance Base | 10,000,000 ₫ |
| BHXH | Social Insurance 8% | − 800,000 ₫ |
| BHYT | Health Insurance 1.5% | − 150,000 ₫ |
| BHTN | Unemployment Ins. 1% | − 100,000 ₫ |
| TOTAL_INSURANCE | Total Insurance 10.5% | − 1,050,000 ₫ |
| PERSONAL_DEDUCTION | Personal Deduction | 11,000,000 ₫ |
| DEPENDENT_DEDUCTION | Dependent (1 người) | 4,400,000 ₫ |
| TAXABLE_INCOME | Thu nhập tính thuế | − 4,800,000 ₫ → 0 |
| PIT | Thuế TNCN | 0 ₫ |
| **NET** | **Lương thực lĩnh** | **10,600,000 ₫** |

> Với ví dụ này TAXABLE_INCOME âm → PIT = 0, lương thực lĩnh = GROSS − TOTAL_INSURANCE.
