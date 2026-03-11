import React from "react";
import { SlidersHorizontal } from "lucide-react";

const FIELD_GROUPS = [
  {
    group: "Salary & Allowances",
    fields: [
      { key: "base_salary",    label: "Base Salary",      type: "number", description: "L\u01b0\u01a1ng c\u01a1 b\u1ea3n (monthly)" },
      { key: "overtime_hours", label: "Overtime Hours",   type: "number", description: "S\u1ed1 gi\u1edd l\u00e0m th\u00eam" },
      { key: "hourly_rate",    label: "Hourly Rate",      type: "number", description: "\u0110\u01a1n gi\u00e1/gi\u1edd" },
      { key: "bonus",          label: "Bonus",            type: "number", description: "Th\u01b0\u1edfng m\u1ed9t l\u1ea7n" },
      { key: "sales_amount",   label: "Sales Amount",     type: "number", description: "Doanh s\u1ed1 (hoa h\u1ed3ng 5%)" },
    ],
  },
  {
    group: "Attendance",
    fields: [
      { key: "working_days",   label: "Working Days",     type: "number", description: "S\u1ed1 ng\u00e0y l\u00e0m vi\u1ec7c trong k\u1ef3" },
      { key: "leave_days",     label: "Leave Days",       type: "number", description: "S\u1ed1 ng\u00e0y ngh\u1ec9" },
      { key: "late_minutes",   label: "Late Minutes",     type: "number", description: "T\u1ed5ng ph\u00fat \u0111i mu\u1ed9n" },
    ],
  },
  {
    group: "Tax & Insurance",
    fields: [
      { key: "dependents",       label: "Dependents",      type: "number",  description: "S\u1ed1 ng\u01b0\u1eddi ph\u1ee5 thu\u1ed9c" },
      { key: "insurance_enabled", label: "Insurance",      type: "toggle",  description: "\u00c1p d\u1ee5ng BHXH/BHYT/BHTN" },
      { key: "tax_enabled",       label: "Income Tax",     type: "toggle",  description: "\u00c1p d\u1ee5ng thu\u1ebf TNCN" },
    ],
  },
];

function formatNumber(val) {
  if (val === "" || val === null || val === undefined) return "";
  return Number(val).toLocaleString("vi-VN");
}

export default function ContextInput({ context, onChange }) {
  function handleChange(key, raw) {
    const num = raw === "" ? 0 : parseFloat(raw.replace(/[^0-9.-]/g, ""));
    onChange({ ...context, [key]: isNaN(num) ? 0 : num });
  }

  function handleToggle(key) {
    onChange({ ...context, [key]: context[key] ? 0 : 1 });
  }

  const NUMBER_KEYS = new Set(["base_salary", "overtime_hours", "hourly_rate", "bonus", "sales_amount", "working_days", "leave_days", "late_minutes"]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Context Input</h2>
      </div>

      <div className="flex flex-col gap-4">
        {FIELD_GROUPS.map(({ group, fields }) => (
          <div key={group}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">{group}</p>
            <div className="flex flex-col gap-3">
              {fields.map(({ key, label, description, type }) => (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
                    {type === "toggle" && (
                      <div
                        onClick={() => handleToggle(key)}
                        className={`cursor-pointer relative w-9 h-5 rounded-full transition-colors ${
                          context[key] ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          context[key] ? "translate-x-4" : "translate-x-0.5"
                        }`} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{description}</p>
                  {type !== "toggle" && (
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={context[key] ?? 0}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                      />
                      {NUMBER_KEYS.has(key) && (context[key] ?? 0) >= 1000 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                          {formatNumber(context[key])}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
