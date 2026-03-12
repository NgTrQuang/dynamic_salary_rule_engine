import React, { useState } from "react";
import { Calculator, AlertTriangle, MinusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { RULE_INFO } from "../data/ruleInfo";
import { InfoTip } from "./Tooltip";
import { useLang } from "../i18n/index.jsx";

function formatVND(val) {
  if (val === null || val === undefined) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(val);
}

const SECTIONS = [
  {
    key: "earnings",
    label: "Thu nhập (Earnings)",
    categories: ["earning"],
    headerCls: "bg-green-50 border-green-200 text-green-800",
    rowCls: "border-l-4 border-green-300 bg-green-50/70",
    valueCls: "text-green-800",
  },
  {
    key: "gross",
    label: "Tổng thu nhập (Gross)",
    codes: ["GROSS"],
    headerCls: "bg-blue-50 border-blue-200 text-blue-800",
    rowCls: "border-l-4 border-blue-400 bg-blue-50 font-semibold",
    valueCls: "text-blue-800",
  },
  {
    key: "insurance",
    label: "Bảo hiểm bắt buộc (BHXH / BHYT / BHTN)",
    categories: ["insurance"],
    headerCls: "bg-orange-50 border-orange-200 text-orange-800",
    rowCls: "border-l-4 border-orange-300 bg-orange-50/70",
    valueCls: "text-orange-800",
  },
  {
    key: "tax",
    label: "Thuế TNCN (Personal Income Tax)",
    categories: ["tax"],
    headerCls: "bg-purple-50 border-purple-200 text-purple-800",
    rowCls: "border-l-4 border-purple-300 bg-purple-50/70",
    valueCls: "text-purple-800",
  },
  {
    key: "net",
    label: "Lương thực lĩnh (Net Salary)",
    codes: ["NET"],
    headerCls: "bg-blue-100 border-blue-300 text-blue-900",
    rowCls: "border-l-4 border-blue-500 bg-blue-50 font-semibold",
    valueCls: "text-blue-900",
  },
];

const DEDUCTION_CODES = new Set(["BHXH", "BHYT", "BHTN", "TOTAL_INSURANCE", "PIT"]);
const MUTED_CODES = new Set(["INSURANCE_BASE", "PERSONAL_DEDUCTION", "DEPENDENT_DEDUCTION"]);

function ResultRow({ r, rowCls, valueCls }) {
  const isDeduction = DEDUCTION_CODES.has(r.code);
  const isMuted = MUTED_CODES.has(r.code);

  if (r.skipped && r.conditionFailed) {
    return (
      <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${rowCls} opacity-40`}>
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold text-gray-500">{r.code}</span>
          <span className="text-xs text-gray-400">{r.name}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 italic">
          <MinusCircle size={12} /> skipped
        </div>
      </div>
    );
  }

  if (r.error) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border-l-4 border-red-400 bg-red-50">
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold text-red-700">{r.code}</span>
          <span className="text-xs text-red-400">{r.error}</span>
        </div>
        <span className="text-xs text-red-500 font-mono">error</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${rowCls} ${isMuted ? "opacity-60" : ""}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`text-xs font-mono font-bold ${isMuted ? "text-gray-500" : valueCls}`}>{r.code}</span>
          <InfoTip size={11} info={RULE_INFO[r.code]} />
        </div>
        <span className="text-xs text-gray-500">{r.name}</span>
      </div>
      <span className={`text-sm font-mono font-semibold ${isDeduction ? "text-red-700" : isMuted ? "text-gray-500" : valueCls}`}>
        {isDeduction ? `\u2212\u00a0${formatVND(r.value)}` : formatVND(r.value)}
      </span>
    </div>
  );
}

function SectionBlock({ section, resultMap, allResults }) {
  const [open, setOpen] = useState(true);

  let rows;
  if (section.codes) {
    rows = section.codes.map((c) => resultMap[c]).filter(Boolean);
  } else {
    rows = allResults.filter((r) => section.categories && section.categories.includes(r._category));
  }

  if (rows.length === 0) return null;

  return (
    <div className={`rounded-xl border ${section.headerCls}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider border-b rounded-t-xl ${section.headerCls}`}
      >
        <span>{section.label}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="flex flex-col gap-1 p-2 bg-white rounded-b-xl">
          {rows.map((r) => (
            <ResultRow key={r.code} r={r} rowCls={section.rowCls} valueCls={section.valueCls} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultPanel({ results, rules, warnings = [] }) {
  const { t } = useLang();

  const SECTIONS = [
    { key: "earnings", label: t.sectionEarnings, categories: ["earning"],   headerCls: "bg-green-50 border-green-200 text-green-800",   rowCls: "border-l-4 border-green-300 bg-green-50/70",       valueCls: "text-green-800" },
    { key: "gross",    label: t.sectionGross,    codes: ["GROSS"],           headerCls: "bg-blue-50 border-blue-200 text-blue-800",     rowCls: "border-l-4 border-blue-400 bg-blue-50 font-semibold", valueCls: "text-blue-800" },
    { key: "insurance",label: t.sectionInsurance,categories: ["insurance"], headerCls: "bg-orange-50 border-orange-200 text-orange-800", rowCls: "border-l-4 border-orange-300 bg-orange-50/70",     valueCls: "text-orange-800" },
    { key: "tax",      label: t.sectionTax,      categories: ["tax"],       headerCls: "bg-purple-50 border-purple-200 text-purple-800", rowCls: "border-l-4 border-purple-300 bg-purple-50/70",    valueCls: "text-purple-800" },
    { key: "net",      label: t.sectionNet,      codes: ["NET"],             headerCls: "bg-blue-100 border-blue-300 text-blue-900",    rowCls: "border-l-4 border-blue-500 bg-blue-50 font-semibold", valueCls: "text-blue-900" },
  ];

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Calculator size={18} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">{t.results}</h2>
        </div>
        <p className="text-sm text-gray-400 italic">{t.noResults}</p>
      </div>
    );
  }

  const ruleMap = Object.fromEntries((rules || []).map((r) => [r.code, r]));

  // Attach category to each result for section lookup
  const enriched = results.map((r) => ({ ...r, _category: ruleMap[r.code]?.category || "other" }));
  const resultMap = Object.fromEntries(enriched.map((r) => [r.code, r]));

  const KNOWN_CATEGORIES = new Set(["earning", "insurance", "tax"]);
  const KNOWN_CODES = new Set(SECTIONS.flatMap((s) => s.codes || []));

  const earningRows = enriched.filter((r) => r._category === "earning");
  // Any rule not in a known category/code bucket → Other
  const otherRows = enriched.filter(
    (r) => !KNOWN_CATEGORIES.has(r._category) && !KNOWN_CODES.has(r.code)
  );

  const errors = enriched.filter((r) => r.error);
  const computed = enriched.filter((r) => !r.skipped && !r.error);
  const skipped = enriched.filter((r) => r.skipped);

  const netResult = resultMap["NET"];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Calculator size={18} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">{t.results}</h2>
        <span className="ml-auto text-xs text-gray-400">{computed.length} {t.computed} · {skipped.length} {t.skipped}</span>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-sm">
            <AlertTriangle size={15} /> {t.warnings}
          </div>
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-700">{w}</p>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-red-700 font-semibold text-sm">
            <AlertTriangle size={15} /> {t.errors}
          </div>
          {errors.map((r) => (
            <p key={r.code} className="text-xs text-red-600 font-mono">[{r.code}] {r.error}</p>
          ))}
        </div>
      )}

      {/* Earnings — dynamic by category */}
      {earningRows.length > 0 && (
        <SectionBlock section={SECTIONS[0]} resultMap={resultMap} allResults={earningRows} />
      )}

      {/* GROSS, Insurance, Tax, NET */}
      {SECTIONS.slice(1).map((section) => (
        <SectionBlock key={section.key} section={section} resultMap={resultMap} allResults={enriched} />
      ))}

      {/* Other rules not in any section */}
      {otherRows.length > 0 && (
        <SectionBlock
          section={{ key: "other", label: t.sectionOther, headerCls: "bg-gray-50 border-gray-200 text-gray-700", rowCls: "border-l-4 border-gray-300 bg-gray-50", valueCls: "text-gray-700" }}
          resultMap={resultMap}
          allResults={otherRows}
        />
      )}

      {/* NET highlight */}
      {netResult && !netResult.error && netResult.value !== null && (
        <div className="mt-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between shadow-md">
          <span className="text-white font-semibold text-sm">{t.netSalaryLabel}</span>
          <span className="text-white font-bold text-xl">{formatVND(netResult.value)}</span>
        </div>
      )}
    </div>
  );
}
