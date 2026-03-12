import React, { useState } from "react";
import { SlidersHorizontal, Info, AlertTriangle } from "lucide-react";
import { MIN_WAGE_BY_REGION } from "../data/defaultRules";

const REGIONS = [
  { value: "I",   label: "Vùng I — 4,960,000 ₫ (HN, HCM, ...)" },
  { value: "II",  label: "Vùng II — 4,410,000 ₫" },
  { value: "III", label: "Vùng III — 3,860,000 ₫" },
  { value: "IV",  label: "Vùng IV — 3,450,000 ₫" },
];

function fmt(val) {
  if (val === null || val === undefined || val === "") return "";
  return Number(val).toLocaleString("vi-VN");
}

function NumberField({ label, fieldKey, value, description, tooltip, warning, onChange }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
        {tooltip && (
          <div className="relative">
            <Info
              size={12}
              className="text-gray-400 cursor-pointer hover:text-blue-500"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
            />
            {showTip && (
              <div className="absolute left-4 top-0 z-10 w-56 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      {description && <p className="text-xs text-gray-400">{description}</p>}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value ?? 0}
          onChange={(e) => {
            const num = e.target.value === "" ? 0 : parseFloat(e.target.value.replace(/[^0-9.-]/g, ""));
            onChange(fieldKey, isNaN(num) ? 0 : num);
          }}
          className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:border-transparent bg-white ${
            warning ? "border-amber-400 focus:ring-amber-400" : "border-gray-200 focus:ring-blue-400"
          }`}
        />
        {(value ?? 0) >= 1000 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {fmt(value)}
          </span>
        )}
      </div>
      {warning && (
        <div className="flex items-start gap-1 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span className="text-xs">{warning}</span>
        </div>
      )}
    </div>
  );
}

function ToggleField({ label, fieldKey, value, description, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
        <div
          onClick={() => onChange(fieldKey, value ? 0 : 1)}
          className={`cursor-pointer relative w-9 h-5 rounded-full transition-colors ${value ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
        </div>
      </div>
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
  );
}

export default function ContextInput({ context, onChange }) {
  function handleChange(key, val) {
    onChange({ ...context, [key]: val });
  }

  const minWage = MIN_WAGE_BY_REGION[context.region] ?? MIN_WAGE_BY_REGION["III"];
  const insuranceWarn =
    context.insurance_enabled && context.insurance_salary < minWage
      ? `Dưới lương tối thiểu vùng ${context.region} (${fmt(minWage)} ₫). Hệ thống tự dùng mức tối thiểu.`
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Context Input</h2>
      </div>

      {/* ── LƯƠNG ───────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">Lương</p>
        <div className="flex flex-col gap-3">
          <NumberField
            label="Gross Salary"
            fieldKey="base_salary"
            value={context.base_salary}
            description="Lương thực nhận — dùng tính thuế TNCN"
            onChange={handleChange}
          />
          <NumberField
            label="Insurance Salary"
            fieldKey="insurance_salary"
            value={context.insurance_salary}
            description="Lương đóng bảo hiểm (lương hợp đồng)"
            tooltip="Lương ghi trong hợp đồng dùng để đóng BHXH/BHYT/BHTN. Không thấp hơn lương tối thiểu vùng. Tối đa 36,000,000 ₫ (20× lương cơ sở). Nghị định 74/2024/NĐ-CP."
            warning={insuranceWarn}
            onChange={handleChange}
          />
          <NumberField
            label="Bonus"
            fieldKey="bonus"
            value={context.bonus}
            description="Thưởng một lần (cộng vào GROSS)"
            onChange={handleChange}
          />
          <NumberField
            label="Sales Amount"
            fieldKey="sales_amount"
            value={context.sales_amount}
            description="Doanh số — hoa hồng 5% cộng vào GROSS"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* ── LÀNG GIỜ THÊM ───────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">Làm thêm giờ</p>
        <div className="flex flex-col gap-3">
          <NumberField
            label="Overtime Hours"
            fieldKey="overtime_hours"
            value={context.overtime_hours}
            description="Số giờ làm thêm trong kỳ"
            onChange={handleChange}
          />
          <NumberField
            label="Hourly Rate"
            fieldKey="hourly_rate"
            value={context.hourly_rate}
            description="Đơn giá giờ làm thêm (×1.5 tự động)"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* ── CHẤM CÔNG ────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">Chấm công</p>
        <div className="flex flex-col gap-3">
          <NumberField label="Working Days"  fieldKey="working_days"  value={context.working_days}  description="Số ngày làm việc trong kỳ" onChange={handleChange} />
          <NumberField label="Leave Days"    fieldKey="leave_days"    value={context.leave_days}    description="Số ngày nghỉ" onChange={handleChange} />
          <NumberField label="Late Minutes"  fieldKey="late_minutes"  value={context.late_minutes}  description="Tổng phút đi muộn" onChange={handleChange} />
        </div>
      </div>

      {/* ── BẢO HIỂM & THUẾ ─────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">Bảo hiểm & Thuế</p>
        <div className="flex flex-col gap-3">
          {/* Region dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Vùng lương tối thiểu</label>
            <p className="text-xs text-gray-400">Theo Nghị định 74/2024/NĐ-CP (hiệu lực 1/7/2024)</p>
            <select
              value={context.region}
              onChange={(e) => handleChange("region", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1">
              Lương tối thiểu vùng {context.region}:{" "}
              <span className="font-semibold text-gray-700">{fmt(minWage)} ₫</span>
            </div>
          </div>

          <NumberField
            label="Dependents"
            fieldKey="dependents"
            value={context.dependents}
            description="Số người phụ thuộc (giảm trừ 4,400,000 ₫/người)"
            onChange={handleChange}
          />
          <ToggleField label="Insurance (BHXH/BHYT/BHTN)" fieldKey="insurance_enabled" value={context.insurance_enabled} description="Bật = áp dụng bảo hiểm bắt buộc" onChange={handleChange} />
          <ToggleField label="Income Tax (TNCN)"          fieldKey="tax_enabled"       value={context.tax_enabled}       description="Bật = tính thuế thu nhập cá nhân" onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}
