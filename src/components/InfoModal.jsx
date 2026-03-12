import React, { useState } from "react";
import { Info, X, Scale, Calculator, AlertTriangle } from "lucide-react";
import { useLang } from "../i18n/index.jsx";

const LEGAL_ITEMS = [
  {
    section: "PIT",
    items: [
      { law: "Luật Thuế TNCN 2025 (hiệu lực 01/07/2026)", desc: "Thay thế Luật TNCN 2007. Giảm biểu thuế từ 7 bậc xuống 5 bậc: 5%→10%→20%→30%→35%." },
      { law: "Thông tư 111/2013/TT-BTC", desc: "Hướng dẫn Luật TNCN 2007 — áp dụng đến 30/06/2026 (7 bậc: 5%→10%→15%→20%→25%→30%→35%)." },
      { law: "Nghị quyết 110/2025/UBTVQH15 (hiệu lực 01/01/2026)", desc: "Nâng giảm trừ bản thân: 11tr → 15,500,000 ₫/tháng. Giảm trừ người phụ thuộc: 4.4tr → 6,200,000 ₫/tháng." },
    ],
  },
  {
    section: "Lương tối thiểu vùng",
    items: [
      { law: "Nghị định 293/2025/NĐ-CP (hiệu lực 01/01/2026)", desc: "Vùng I: 5,310,000 · Vùng II: 4,730,000 · Vùng III: 4,140,000 · Vùng IV: 3,700,000 ₫ (tăng ~7%)." },
      { law: "Nghị định 74/2024/NĐ-CP (01/07/2024–31/12/2025)", desc: "Vùng I: 4,960,000 · Vùng II: 4,410,000 · Vùng III: 3,860,000 · Vùng IV: 3,450,000 ₫." },
    ],
  },
  {
    section: "Lương cơ sở (căn cứ trần BH)",
    items: [
      { law: "Nghị định 73/2024/NĐ-CP — H1 2026 (01/01–30/06/2026)", desc: "Lương cơ sở: 2,340,000 ₫. Trần đóng BH = 20 × 2,340,000 = 46,800,000 ₫." },
      { law: "Nghị định 73/2024/NĐ-CP — H2 2026 (từ 01/07/2026)", desc: "Lương cơ sở: 2,527,000 ₫. Trần đóng BH = 20 × 2,527,000 = 50,540,000 ₫." },
    ],
  },
  {
    section: "Bảo hiểm xã hội",
    items: [
      { law: "Luật BHXH 2014 Điều 85, 89", desc: "Người lao động đóng BHXH 8% lương đóng BH. Tối đa 20× lương cơ sở." },
      { law: "Nghị định 115/2015/NĐ-CP", desc: "Hướng dẫn xác định tiền lương làm căn cứ đóng BHXH." },
      { law: "Nghị định 146/2018/NĐ-CP", desc: "BHYT: người lao động đóng 1.5% lương đóng BH." },
      { law: "Nghị định 28/2015/NĐ-CP", desc: "BHTN: người lao động đóng 1% lương đóng BH." },
    ],
  },
];

function TabContent({ tab, t }) {
  if (tab === "about") return (
    <div className="flex flex-col gap-4 text-sm text-gray-700">
      <p className="text-gray-600 leading-relaxed">
        <strong>Dynamic Salary Rule Engine</strong> là công cụ tính lương linh hoạt dựa trên
        bộ quy tắc (rule set) có thể tùy chỉnh. Mọi thành phần lương — từ BHXH, BHYT, BHTN
        đến thuế TNCN — đều được định nghĩa qua công thức JSON, phản ánh đúng quy định pháp luật
        Việt Nam hiện hành.
      </p>
      <div className="grid grid-cols-1 gap-2">
        {[
          ["Mục tiêu / Goal", "Hỗ trợ tính toán lương minh bạch, đúng luật, linh hoạt theo từng doanh nghiệp."],
          ["Kiến trúc / Stack", "Frontend-only · React 18 · TailwindCSS · No backend · Data stays in memory."],
          ["Dữ liệu / Data", "Rules và context có thể import/export JSON — không gửi lên server."],
          ["Cập nhật / Updated", "Luật Thuế TNCN 2025 (01/01/2026) · Nghị định 74/2024/NĐ-CP (01/07/2024)."],
        ].map(([title, desc]) => (
          <div key={title} className="bg-blue-50 rounded-lg px-3 py-2">
            <span className="font-semibold text-blue-800">{title}:</span>{" "}
            <span className="text-gray-700">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (tab === "legal") return (
    <div className="flex flex-col gap-4 text-sm">
      <p className="text-gray-500 italic">{t.legalBasisIntro}</p>

      {/* Timeline 2026 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-3">
        <p className="font-bold text-blue-800 text-xs uppercase tracking-widest mb-2">📅 {t.legalTimeline2026}</p>
        <div className="flex flex-col gap-1">
          {[
            { date: "01/01/2026", note: t.timeline1 },
            { date: "01/01/2026", note: t.timeline2 },
            { date: "01/07/2026", note: t.timeline3 },
            { date: "01/07/2026", note: t.timeline4 },
          ].map(({ date, note }, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="font-mono font-bold text-blue-700 shrink-0 w-24">{date}</span>
              <span className="text-blue-900">{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grouped legal sections */}
      {LEGAL_ITEMS.map(({ section, items }) => (
        <div key={section}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 border-b border-gray-100 pb-1">{section}</p>
          <div className="flex flex-col gap-1.5">
            {items.map(({ law, desc }) => (
              <div key={law} className="border border-gray-100 rounded-lg px-3 py-2">
                <p className="font-semibold text-gray-800 text-xs">{law}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (tab === "how") return (
    <div className="flex flex-col gap-4 text-sm text-gray-700">
      <p className="text-gray-500">{t.howTitle}</p>
      {[
        { step: "1", title: t.step1Title, desc: t.step1Desc, color: "bg-green-100 text-green-800 border-green-200" },
        { step: "2", title: t.step2Title, desc: t.step2Desc, color: "bg-blue-100 text-blue-800 border-blue-200" },
        { step: "3", title: t.step3Title, desc: t.step3Desc, color: "bg-orange-100 text-orange-800 border-orange-200" },
        { step: "4", title: t.step4Title, desc: t.step4Desc, color: "bg-purple-100 text-purple-800 border-purple-200" },
      ].map(({ step, title, desc, color }) => (
        <div key={step} className={`flex gap-3 rounded-xl border p-3 ${color}`}>
          <div className="text-2xl font-black opacity-30 leading-none">{step}</div>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="mt-0.5 text-xs opacity-80">{desc}</p>
          </div>
        </div>
      ))}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600">
        <strong>Ví dụ tham chiếu giữa rules:</strong><br />
        <code className="font-mono">INSURANCE_BASE = min(max(insurance_salary, min_wage), 36000000)</code><br />
        <code className="font-mono">BHXH = INSURANCE_BASE × 0.08</code><br />
        <code className="font-mono">TAXABLE_INCOME = max(0, GROSS − TOTAL_INSURANCE − PERSONAL_DEDUCTION − DEPENDENT_DEDUCTION)</code>
      </div>
    </div>
  );

  if (tab === "disclaimer") return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-amber-800 text-xs leading-relaxed">
          <p className="font-bold text-sm mb-2">{t.disclaimerTitle}</p>
          <p className="mb-2">{t.disclaimerBody1}</p>
          <p className="mb-2">{t.disclaimerBody2}</p>
          <p className="mb-2">{t.disclaimerBody3}</p>
          <p className="text-amber-600">{t.disclaimerBody4}</p>
        </div>
      </div>
      <div className="text-xs text-gray-400 text-center">{t.modalFooter}</div>
    </div>
  );

  return null;
}

export default function InfoModal() {
  const { t } = useLang();
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("disclaimer");

  const TABS = [
    { key: "about",      label: t.tabAbout,      icon: Info },
    { key: "legal",      label: t.tabLegal,      icon: Scale },
    { key: "how",        label: t.tabHow,        icon: Calculator },
    { key: "disclaimer", label: t.tabDisclaimer, icon: AlertTriangle },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm border border-gray-200 hover:border-blue-200"
        title="About & Legal Info"
      >
        <Info size={15} />
        <span className="hidden sm:inline text-xs font-medium">{t.btnLegalInfo}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">{t.modalTitle}</h2>
                <p className="text-xs text-gray-400">{t.modalSubtitle}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-5 gap-1 pt-2">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                    activeTab === key
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <TabContent tab={activeTab} t={t} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
