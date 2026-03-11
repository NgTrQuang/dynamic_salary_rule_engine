import React, { useState, useCallback, useRef, useEffect } from "react";
import RuleTable from "./components/RuleTable";
import ContextInput from "./components/ContextInput";
import ResultPanel from "./components/ResultPanel";
import { runEngine } from "./engine/ruleEngine";
import { defaultRules, defaultContext } from "./data/defaultRules";
import { Download, Upload, Play, RefreshCw, Cpu } from "lucide-react";

export default function App() {
  const [rules, setRules] = useState(defaultRules);
  const [context, setContext] = useState(defaultContext);
  const [results, setResults] = useState([]);
  const [autoCalc, setAutoCalc] = useState(true);
  const fileInputRef = useRef(null);

  const calculate = useCallback((r, c) => {
    const res = runEngine(r ?? rules, c ?? context);
    setResults(res);
  }, [rules, context]);

  // Run calculation on initial load
  useEffect(() => {
    const res = runEngine(defaultRules, defaultContext);
    setResults(res);
  }, []);

  function handleRulesChange(newRules) {
    setRules(newRules);
    if (autoCalc) calculate(newRules, context);
  }

  function handleContextChange(newCtx) {
    setContext(newCtx);
    if (autoCalc) calculate(rules, newCtx);
  }

  function handleReset() {
    setRules(defaultRules);
    setContext(defaultContext);
    setResults([]);
  }

  // JSON Export
  function handleExport() {
    const data = { rules, context };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "salary_rules.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // JSON Import
  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.rules && Array.isArray(data.rules)) {
          const enriched = data.rules.map((r) => ({
            ...r,
            id: r.id ?? crypto.randomUUID(),
            category: r.category ?? "other",
            condition: r.condition ?? "",
          }));
          setRules(enriched);
          if (data.context) setContext(data.context);
          if (autoCalc) calculate(enriched, data.context ?? context);
        }
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl">
            <Cpu size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dynamic Salary Rule Engine</h1>
            <p className="text-xs text-gray-400">Configure and evaluate salary formulas dynamically</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-calculate toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none mr-2">
            <div
              onClick={() => setAutoCalc((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${autoCalc ? "bg-blue-500" : "bg-gray-300"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoCalc ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-xs text-gray-600 font-medium">Auto-calculate</span>
          </label>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Download size={14} /> Export JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Upload size={14} /> Import JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <RefreshCw size={14} /> Reset
          </button>

          {!autoCalc && (
            <button
              onClick={() => calculate()}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <Play size={14} /> Calculate
            </button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-screen-2xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        {/* Rule Editor — full width */}
        <section className="col-span-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <RuleTable rules={rules} onChange={handleRulesChange} />
        </section>

        {/* Context Input */}
        <section className="col-span-12 md:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <ContextInput context={context} onChange={handleContextChange} />
        </section>

        {/* Result Panel */}
        <section className="col-span-12 md:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <ResultPanel results={results} rules={rules} />
        </section>
      </main>
    </div>
  );
}
