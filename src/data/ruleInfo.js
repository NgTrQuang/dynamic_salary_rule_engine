export const RULE_INFO = {
  BASIC: {
    title: "Basic Salary (Lương cơ bản)",
    explanation: "Lương cơ bản thực nhận hàng tháng — là lương thực tế, làm căn cứ tính thuế TNCN.",
    legal: "Bộ luật Lao động 2019 · Hợp đồng lao động",
  },
  LUNCH: {
    title: "Lunch Allowance (Phụ cấp ăn trưa)",
    explanation: "Phụ cấp ăn trưa không tính vào lương đóng bảo hiểm (nếu không ghi trong hợp đồng). Giới hạn miễn thuế TNCN: 730,000 ₫/tháng.",
    legal: "Thông tư 111/2013/TT-BTC Điều 2 · Công văn 801/TCT-TNCN",
  },
  PHONE: {
    title: "Phone Allowance (Phụ cấp điện thoại)",
    explanation: "Phụ cấp điện thoại được miễn thuế TNCN nếu có quy định trong hợp đồng lao động hoặc quy chế nội bộ.",
    legal: "Thông tư 111/2013/TT-BTC Điều 2 khoản 2",
  },
  OVERTIME: {
    title: "Overtime Pay (Làm thêm giờ)",
    explanation: "Tiền lương làm thêm giờ ngày thường = 150% đơn giá. Phần vượt lương giờ bình thường được miễn thuế TNCN.",
    legal: "Bộ luật Lao động 2019 Điều 98 · Thông tư 111/2013/TT-BTC Điều 2",
  },
  BONUS: {
    title: "Bonus (Thưởng)",
    explanation: "Khoản thưởng một lần. Thưởng theo Điều 104 BLLĐ 2019: cộng vào thu nhập chịu thuế TNCN.",
    legal: "Bộ luật Lao động 2019 Điều 104 · Thông tư 111/2013/TT-BTC",
  },
  SALES_BONUS: {
    title: "Sales Commission (Hoa hồng doanh số)",
    explanation: "Hoa hồng 5% trên doanh số. Là thu nhập từ tiền lương, tiền công — tính vào GROSS để tính thuế TNCN.",
    legal: "Thông tư 111/2013/TT-BTC Điều 2 khoản 2",
  },
  GROSS: {
    title: "Gross Salary (Tổng thu nhập trước khấu trừ)",
    explanation: "Tổng tất cả thu nhập thực nhận: lương cơ bản + phụ cấp + thưởng + làm thêm + hoa hồng. Đây là căn cứ tính thuế TNCN.",
    legal: "Luật Thuế TNCN 2007 (sửa đổi 2012, 2014) Điều 3",
  },
  INSURANCE_BASE: {
    title: "Insurance Base (Lương đóng bảo hiểm)",
    explanation: "Lương làm căn cứ đóng BHXH/BHYT/BHTN. = max(insurance_salary, lương tối thiểu vùng), không vượt 36,000,000 ₫ (20 × lương cơ sở).",
    legal: "Luật BHXH 2014 Điều 89 · Nghị định 115/2015/NĐ-CP · Nghị định 74/2024/NĐ-CP",
  },
  BHXH: {
    title: "BHXH — Bảo hiểm xã hội (8%)",
    explanation: "Người lao động đóng 8% lương đóng BH vào quỹ BHXH. Khoản này không chịu thuế TNCN.",
    legal: "Luật BHXH 2014 Điều 85 · Nghị định 115/2015/NĐ-CP",
  },
  BHYT: {
    title: "BHYT — Bảo hiểm y tế (1.5%)",
    explanation: "Người lao động đóng 1.5% lương đóng BH vào quỹ BHYT. Được trừ khỏi thu nhập trước khi tính thuế TNCN.",
    legal: "Luật BHYT 2008 (sửa đổi 2014) · Nghị định 146/2018/NĐ-CP",
  },
  BHTN: {
    title: "BHTN — Bảo hiểm thất nghiệp (1%)",
    explanation: "Người lao động đóng 1% lương đóng BH vào quỹ BHTN. Được trừ khỏi thu nhập trước khi tính thuế TNCN.",
    legal: "Luật Việc làm 2013 Điều 57 · Nghị định 28/2015/NĐ-CP",
  },
  TOTAL_INSURANCE: {
    title: "Total Insurance (Tổng bảo hiểm 10.5%)",
    explanation: "Tổng 3 khoản bảo hiểm bắt buộc người lao động đóng: BHXH 8% + BHYT 1.5% + BHTN 1% = 10.5% lương đóng BH.",
    legal: "Luật BHXH 2014 · Luật BHYT 2008 · Luật Việc làm 2013",
  },
  PERSONAL_DEDUCTION: {
    title: "Giảm trừ bản thân (15,500,000 ₫/tháng)",
    explanation: "Mức giảm trừ cho chính người nộp thuế: 15,500,000 ₫/tháng (186,000,000 ₫/năm). Nâng từ 11,000,000 ₫ theo Luật Thuế TNCN 2025, áp dụng từ 01/01/2026.",
    legal: "Luật Thuế TNCN 2025 — khoản 2 Điều 29 (áp dụng từ kỳ tính thuế 2026)",
  },
  DEPENDENT_DEDUCTION: {
    title: "Giảm trừ người phụ thuộc (6,200,000 ₫/người/tháng)",
    explanation: "Mỗi người phụ thuộc được đăng ký giảm trừ 6,200,000 ₫/tháng. Phải đăng ký với cơ quan thuế.",
    legal: "Nghị quyết 110/2025/UBTVQH15 (17/10/2025) · Luật Thuế TNCN 2025 Điều 29 — áp dụng từ 01/01/2026",
  },
  TAXABLE_INCOME: {
    title: "Thu nhập tính thuế (Taxable Income)",
    explanation: "= max(0, GROSS − Tổng BH − Giảm trừ bản thân − Giảm trừ người phụ thuộc). Không âm.",
    legal: "Luật Thuế TNCN Điều 21 · Thông tư 111/2013/TT-BTC Điều 9",
  },
  PIT: {
    title: "Thuế TNCN — Personal Income Tax",
    explanation: "Tính theo biểu thuế lũy tiến 7 bậc: 5%→10%→15%→20%→25%→30%→35%. Áp dụng trên thu nhập tính thuế sau khi giảm trừ.",
    legal: "Luật Thuế TNCN 2007 Điều 22 · Thông tư 111/2013/TT-BTC Phụ lục 01",
  },
  NET: {
    title: "NET Salary (Lương thực lĩnh)",
    explanation: "= GROSS − Tổng bảo hiểm − Thuế TNCN. Đây là số tiền thực tế người lao động nhận vào tài khoản.",
    legal: "Tổng hợp từ các quy định BHXH và Thuế TNCN hiện hành",
  },
};

export const CATEGORY_INFO = {
  earning: {
    title: "Thu nhập (Earnings)",
    explanation: "Các khoản thu nhập của người lao động trong kỳ lương.",
    legal: "Bộ luật Lao động 2019 · Thông tư 111/2013/TT-BTC",
  },
  insurance: {
    title: "Bảo hiểm bắt buộc",
    explanation: "Các khoản bảo hiểm bắt buộc người lao động phải đóng: BHXH 8% + BHYT 1.5% + BHTN 1%.",
    legal: "Luật BHXH 2014 · Luật BHYT 2008 · Luật Việc làm 2013",
  },
  tax: {
    title: "Thuế TNCN & Giảm trừ",
    explanation: "Các khoản giảm trừ và thuế thu nhập cá nhân tính theo biểu lũy tiến.",
    legal: "Luật Thuế TNCN · NQ 954/2020 · NQ 110/2025/UBTVQH15",
  },
  summary: {
    title: "Tổng hợp (Summary)",
    explanation: "Các chỉ số tổng hợp: GROSS (tổng thu nhập) và NET (lương thực lĩnh).",
    legal: "",
  },
};
