import React, { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { RULE_INFO, CATEGORY_INFO } from "../data/ruleInfo";
import { InfoTip } from "./Tooltip";

const EMPTY_RULE = {
  code: "",
  name: "",
  sequence: 0,
  category: "earning",
  condition: "",
  formula: "",
};

const CATEGORIES = ["earning", "insurance", "tax", "deduction", "summary", "other"];

function formatVal(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "number") return val.toLocaleString("vi-VN") + " ₫";
  return String(val);
}

export default function RuleTable({ rules, onChange, results = [], context = {} }) {
  const [editingCell, setEditingCell] = useState(null); // { rowId, field }

  const sorted = [...rules].sort((a, b) => a.sequence - b.sequence);
  const resultMap = Object.fromEntries(results.map((r) => [r.code, r]));

  function updateRule(id, field, value) {
    onChange(rules.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function addRule() {
    const maxSeq = rules.length > 0 ? Math.max(...rules.map((r) => r.sequence)) : 0;
    const newRule = {
      ...EMPTY_RULE,
      id: crypto.randomUUID(),
      sequence: maxSeq + 1,
    };
    onChange([...rules, newRule]);
  }

  function deleteRule(id) {
    onChange(rules.filter((r) => r.id !== id));
  }

  function moveRule(id, direction) {
    const idx = sorted.findIndex((r) => r.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const seqA = sorted[idx].sequence;
    const seqB = sorted[swapIdx].sequence;
    onChange(
      rules.map((r) => {
        if (r.id === sorted[idx].id) return { ...r, sequence: seqB };
        if (r.id === sorted[swapIdx].id) return { ...r, sequence: seqA };
        return r;
      })
    );
  }

  function EditableCell({ rowId, field, value, type = "text", small = false }) {
    const isEditing = editingCell?.rowId === rowId && editingCell?.field === field;
    const [draft, setDraft] = useState(value);

    function commit() {
      const finalVal = type === "number" ? Number(draft) : draft;
      updateRule(rowId, field, finalVal);
      setEditingCell(null);
    }

    if (isEditing) {
      return (
        <input
          autoFocus
          type={type}
          value={draft}
          className={`w-full border border-blue-400 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${small ? "w-20" : ""}`}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditingCell(null);
          }}
        />
      );
    }

    return (
      <span
        className="cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 block truncate"
        title={String(value)}
        onClick={() => {
          setDraft(value);
          setEditingCell({ rowId, field });
        }}
      >
        {String(value) || <span className="text-gray-300 italic">—</span>}
      </span>
    );
  }

  function CategoryCell({ rowId, value }) {
    const isEditing = editingCell?.rowId === rowId && editingCell?.field === "category";
    if (isEditing) {
      return (
        <select
          autoFocus
          value={value}
          className="w-full border border-blue-400 rounded px-1 py-0.5 text-sm focus:outline-none bg-white"
          onChange={(e) => {
            updateRule(rowId, "category", e.target.value);
            setEditingCell(null);
          }}
          onBlur={() => setEditingCell(null)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      );
    }
    const colorMap = {
      earning:   "bg-green-100 text-green-800",
      insurance: "bg-orange-100 text-orange-800",
      tax:       "bg-purple-100 text-purple-800",
      deduction: "bg-red-100 text-red-800",
      summary:   "bg-blue-100 text-blue-800",
      other:     "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`cursor-pointer px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[value] || colorMap.other}`}
        onClick={() => setEditingCell({ rowId, field: "category" })}
      >
        {value}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Rule Editor</h2>
        <button
          onClick={addRule}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} /> Add Rule
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-gray-500 font-medium w-12 text-center">#</th>
              <th className="px-3 py-2 text-gray-500 font-medium w-20">Seq</th>
              <th className="px-3 py-2 text-gray-500 font-medium w-28">Code</th>
              <th className="px-3 py-2 text-gray-500 font-medium w-40">Name</th>
              <th className="px-3 py-2 text-gray-500 font-medium w-24">Category</th>
              <th className="px-3 py-2 text-gray-500 font-medium w-44">Condition</th>
              <th className="px-3 py-2 text-gray-500 font-medium">Formula</th>
              <th className="px-3 py-2 text-gray-500 font-medium w-36 text-right">Value</th>
              <th className="px-3 py-2 text-gray-500 font-medium w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((rule, idx) => (
              <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-1 py-1.5 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      onClick={() => moveRule(rule.id, -1)}
                      disabled={idx === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => moveRule(rule.id, 1)}
                      disabled={idx === sorted.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-1.5">
                  <EditableCell rowId={rule.id} field="sequence" value={rule.sequence} type="number" small />
                </td>
                <td className="px-3 py-1.5 font-mono text-xs font-semibold text-gray-800">
                  <div className="flex items-center gap-1.5">
                    <EditableCell rowId={rule.id} field="code" value={rule.code} />
                    <InfoTip size={13} info={RULE_INFO[rule.code] || CATEGORY_INFO[rule.category]} />
                  </div>
                </td>
                <td className="px-3 py-1.5 text-gray-600">
                  <EditableCell rowId={rule.id} field="name" value={rule.name} />
                </td>
                <td className="px-3 py-1.5" title={CATEGORY_INFO[rule.category]?.explanation ?? ""}>
                  <CategoryCell rowId={rule.id} value={rule.category} />
                </td>
                <td className="px-3 py-1.5 font-mono text-gray-600">
                  <EditableCell rowId={rule.id} field="condition" value={rule.condition} />
                </td>
                <td className="px-3 py-1.5 font-mono text-indigo-700">
                  <EditableCell rowId={rule.id} field="formula" value={rule.formula} />
                </td>
                <td className="px-3 py-1.5 text-right">
                  {(() => {
                    const r = resultMap[rule.code];
                    if (!r) {
                      // not yet computed — show context value if it's a direct context var
                      const ctxVal = context[rule.code];
                      if (ctxVal !== undefined) return <span className="text-xs font-mono text-gray-400">{formatVal(ctxVal)}</span>;
                      return <span className="text-gray-300 text-xs">—</span>;
                    }
                    if (r.skipped) return <span className="text-xs text-gray-400 italic">skipped</span>;
                    if (r.error)   return <span className="text-xs text-red-500 italic">error</span>;
                    const isDeduction = ["insurance", "deduction"].includes(rule.category) && r.value > 0;
                    return (
                      <span className={`text-xs font-mono font-semibold ${
                        isDeduction ? "text-red-600" : rule.category === "summary" ? "text-blue-700" : "text-gray-800"
                      }`}>
                        {isDeduction ? "− " : ""}{r.value?.toLocaleString("vi-VN")} ₫
                      </span>
                    );
                  })()}
                </td>
                <td className="px-3 py-1.5 text-center">
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 italic">
                  No rules defined. Click "Add Rule" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">Click any cell to edit. Press Enter or click away to confirm.</p>
    </div>
  );
}
