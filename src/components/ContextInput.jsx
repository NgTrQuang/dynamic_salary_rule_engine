import React from "react";
import { SlidersHorizontal, AlertTriangle } from "lucide-react";
import { MIN_WAGE_BY_REGION } from "../data/defaultRules";
import { InfoTip } from "./Tooltip";
import { useLang } from "../i18n/index.jsx";

function fmt(val) {
  if (val === null || val === undefined || val === "") return "";
  return Number(val).toLocaleString("vi-VN");
}

function NumberField({ label, fieldKey, value, description, tooltip, warning, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
        {tooltip && (
          <InfoTip size={12} info={{ title: label, explanation: tooltip, legal: "" }} />
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
  const { t } = useLang();

  const REGIONS = [
    { value: "I",   label: t.regionI },
    { value: "II",  label: t.regionII },
    { value: "III", label: t.regionIII },
    { value: "IV",  label: t.regionIV },
  ];

  function handleChange(key, val) {
    onChange({ ...context, [key]: val });
  }

  const minWage = MIN_WAGE_BY_REGION[context.region] ?? MIN_WAGE_BY_REGION["III"];
  const insuranceCap = (context.gov_base_salary ?? 2340000) * 20;
  const insuranceWarn =
    context.insurance_enabled && context.insurance_salary < minWage
      ? t.warnInsuranceBelowMin.replace("{region}", context.region).replace("{min}", fmt(minWage))
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">{t.contextInput}</h2>
      </div>

      {/* ── SALARY ── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">{t.groupSalary}</p>
        <div className="flex flex-col gap-3">
          <NumberField label={t.fieldGrossSalary}     fieldKey="base_salary"      value={context.base_salary}      description={t.fieldGrossSalaryDesc}     onChange={handleChange} />
          <NumberField label={t.fieldInsuranceSalary} fieldKey="insurance_salary" value={context.insurance_salary} description={t.fieldInsuranceSalaryDesc} tooltip={t.fieldInsuranceSalaryTip} warning={insuranceWarn} onChange={handleChange} />
          <NumberField label={t.fieldBonus}           fieldKey="bonus"            value={context.bonus}            description={t.fieldBonusDesc}           onChange={handleChange} />
          <NumberField label={t.fieldSalesAmount}     fieldKey="sales_amount"     value={context.sales_amount}     description={t.fieldSalesAmountDesc}     onChange={handleChange} />
        </div>
      </div>

      {/* ── OVERTIME ── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">{t.groupOvertime}</p>
        <div className="flex flex-col gap-3">
          <NumberField label={t.fieldOvertimeHours} fieldKey="overtime_hours" value={context.overtime_hours} description={t.fieldOvertimeHoursDesc} onChange={handleChange} />
          <NumberField label={t.fieldHourlyRate}    fieldKey="hourly_rate"    value={context.hourly_rate}    description={t.fieldHourlyRateDesc}    onChange={handleChange} />
        </div>
      </div>

      {/* ── ATTENDANCE ── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">{t.groupAttendance}</p>
        <div className="flex flex-col gap-3">
          <NumberField label={t.fieldWorkingDays} fieldKey="working_days" value={context.working_days} description={t.fieldWorkingDaysDesc} onChange={handleChange} />
          <NumberField label={t.fieldLeaveDays}   fieldKey="leave_days"   value={context.leave_days}   description={t.fieldLeaveDaysDesc}   onChange={handleChange} />
          <NumberField label={t.fieldLateMinutes} fieldKey="late_minutes" value={context.late_minutes} description={t.fieldLateMinutesDesc} onChange={handleChange} />
        </div>
      </div>

      {/* ── INSURANCE & TAX ── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">{t.groupInsuranceTax}</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t.fieldRegion}</label>
            <p className="text-xs text-gray-400">{t.fieldRegionDesc}</p>
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
              {t.fieldMinWageDisplay.replace("{region}", context.region)}{" "}
              <span className="font-semibold text-gray-700">{fmt(minWage)} ₫</span>
            </div>
          </div>
          <NumberField label={t.fieldGovBaseSalary} fieldKey="gov_base_salary" value={context.gov_base_salary ?? 2340000} description={t.fieldGovBaseSalaryDesc} onChange={handleChange} />
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1">
            {t.fieldInsuranceCap} <span className="font-semibold text-gray-700">{fmt(insuranceCap)} ₫</span>
          </div>
          <NumberField label={t.fieldDependents} fieldKey="dependents" value={context.dependents} description={t.fieldDependentsDesc} onChange={handleChange} />
          <ToggleField label={t.fieldInsuranceToggle} fieldKey="insurance_enabled" value={context.insurance_enabled} description={t.fieldInsuranceToggleDesc} onChange={handleChange} />
          <ToggleField label={t.fieldTaxToggle}       fieldKey="tax_enabled"       value={context.tax_enabled}       description={t.fieldTaxToggleDesc}       onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}
