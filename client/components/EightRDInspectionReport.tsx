import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * 8-RD Inspection Report — Full-width, Compact, Tolerances in Headers
 * - Table fills container width (no wasted margins)
 * - Inputs are w-full so every column uses its share of space
 * - ± tolerances centered at 0 (e.g., L1 ±.002 → |value| ≤ .002)
 * - Ranges: Lead .002–.006, TaperAvg .061–.066, Thread Height .020–.030, ID 5.275–5.375, Standoff ±.125
 * - Sticky header + sticky first column
 * - Autosave to localStorage
 */

type Variant = "PIN" | "BOX";

type HeaderBlock = {
  company?: string;
  customer?: string;
  drawing?: string;
  part?: string;
  heat?: string;
  workOrder?: string;
  gaugeDoc?: string;
  description?: string;
};

type VisualChecks = {
  threads?: string;
  shoulder?: string;
  surface?: string;
  notes?: string;
};

type DimensionsRow = {
  serial?: string;
  l1?: string;
  lead?: string;
  taperA?: string;
  taperB?: string;
  taperC?: string;
  taperAvg?: string;
  threadHeight?: string;
  od?: string;
  id?: string;
  standoff?: string;
  l4?: string;
  sealFaceMinusL1?: string;
  overallLength?: string;
  remarks?: string;
  result?: "ACCEPT" | "REJECT" | "";
};

type ReportModel = {
  variant: Variant;
  header: HeaderBlock;
  visual: VisualChecks;
  dimensions: DimensionsRow[];
};

const th = "px-2 py-1.5 border text-[11px] md:text-xs font-semibold text-gray-700 whitespace-nowrap align-bottom";
const td = "px-1.5 py-1 border text-[11px] md:text-xs bg-white align-middle";

function isNumericLikeText(v?: string) {
  if (v === undefined || v === "") return true;
  if (v === "-" || v === "." || v === "-.") return true;
  return /^-?(?:\d+|\d*\.\d+)$/.test(v);
}
function toNum(v?: string): number | null {
  if (v === undefined || v === "" || v === "-" || v === "." || v === "-.") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function TextInput({
  value,
  onChange,
  placeholder,
  className = "",
  invalid = false,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  invalid?: boolean;
}) {
  return (
    <input
      className={`w-full border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-[11px] md:text-xs px-2 py-1 ${invalid ? "bg-red-50 border-red-300" : ""} ${className}`}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function NumericTextInput({
  value,
  onChange,
  className = "",
  outOfTol = false,
}: {
  value?: string;
  onChange: (v: string) => void;
  className?: string;
  outOfTol?: boolean;
}) {
  const invalid = !isNumericLikeText(value);
  return (
    <input
      type="text"
      inputMode="decimal"
      className={`font-mono w-full border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-[11px] md:text-xs px-2 py-1 ${invalid ? "bg-red-50 border-red-300" : ""} ${outOfTol ? "bg-red-50 border-red-300" : ""} ${className}`}
      value={value ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        if (/^-?(\d+|\d*\.)?\d*$/.test(val) || val === "-" || val === "." || val === "-.") {
          onChange(val);
        }
      }}
      onBlur={(e) => {
        const v = e.target.value;
        if (v === "-" || v === "." || v === "-.") onChange("");
      }}
    />
  );
}

export default function EightRDInspectionReport({ orderId }: { orderId: string }) {
  const storageKey = useMemo(() => `inspectflow:8rd:${orderId}`, [orderId]);

  const [model, setModel] = useState<ReportModel>({
    variant: "PIN",
    header: {},
    visual: {},
    dimensions: defaultRows(12),
  });

  // Load saved
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.dimensions)) {
          setModel((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    }
  }, [storageKey]);

  // Debounced autosave
  const saveTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(model));
    }, 250);
    return () => window.clearTimeout(saveTimer.current);
  }, [model, storageKey]);

  // helpers
  const setHeader = (k: keyof HeaderBlock, v: string) =>
    setModel((m) => ({ ...m, header: { ...m.header, [k]: v } }));
  const setVisual = (k: keyof VisualChecks, v: string) =>
    setModel((m) => ({ ...m, visual: { ...m.visual, [k]: v } }));
  const updateRow = (idx: number, patch: Partial<DimensionsRow>) =>
    setModel((m) => {
      const next = [...m.dimensions];
      next[idx] = { ...next[idx], ...patch };
      return { ...m, dimensions: next };
    });
  const addRow = () =>
    setModel((m) => ({
      ...m,
      dimensions: [...m.dimensions, { serial: String(m.dimensions.length + 1), result: "" }],
    }));
  const removeLastRow = () =>
    setModel((m) => (m.dimensions.length <= 1 ? m : { ...m, dimensions: m.dimensions.slice(0, -1) }));

  // Infer PIN/BOX from description (optional convenience)
  useEffect(() => {
    if (model.header.description) {
      if (/\bPIN\b/i.test(model.header.description)) setModel((m) => ({ ...m, variant: "PIN" }));
      if (/\bBOX\b/i.test(model.header.description)) setModel((m) => ({ ...m, variant: "BOX" }));
    }
  }, [model.header.description]);

  // Tolerance logic
  const isOOT = (key: keyof DimensionsRow, val?: string): boolean => {
    const n = toNum(val);
    if (n === null) return false;
    switch (key) {
      case "l1":         return Math.abs(n) > 0.002;         // ±.002 around 0
      case "lead":       return n < 0.002 || n > 0.006;
      case "taperAvg":   return n < 0.061 || n > 0.066;
      case "threadHeight": return n < 0.020 || n > 0.030;
      case "standoff":   return Math.abs(n) > 0.125;         // ±.125 around 0
      case "id":         return n < 5.275 || n > 5.375;
      default:           return false;
    }
  };

  // column model (tight labels + tolerances)
  const COLS: { key: keyof DimensionsRow; label: string; tol?: string }[] = [
    { key: "l1", label: "Pitch Dia (L1)", tol: "± .002" },
    { key: "lead", label: "Lead", tol: ".002 – .006" },
    { key: "taperA", label: "Taper A" },
    { key: "taperB", label: "Taper B" },
    { key: "taperC", label: "Taper C" },
    { key: "taperAvg", label: "Taper Avg", tol: ".061 – .066" },
    { key: "threadHeight", label: "Thread Height", tol: ".020 – .030" },
    { key: "od", label: "OD" },
    { key: "id", label: "ID", tol: "5.275 – 5.375" },
    { key: "standoff", label: "Standoff", tol: "± .125" },
    { key: "l4", label: "L4" },
    { key: "sealFaceMinusL1", label: "SF – L1" },
    { key: "overallLength", label: "OAL" },
  ];

  return (
    <div className="space-y-3">
      {/* Header blocks */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="card">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[11px] text-gray-600">Company</label>
              <TextInput value={model.header.company} onChange={(v) => setHeader("company", v)} />
            </div>
            <div><label className="text-[11px] text-gray-600">Customer</label>
              <TextInput value={model.header.customer} onChange={(v) => setHeader("customer", v)} />
            </div>
            <div><label className="text-[11px] text-gray-600">Drawing #</label>
              <TextInput value={model.header.drawing} onChange={(v) => setHeader("drawing", v)} />
            </div>
            <div><label className="text-[11px] text-gray-600">Part #</label>
              <TextInput value={model.header.part} onChange={(v) => setHeader("part", v)} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[11px] text-gray-600">Heat #</label>
              <TextInput value={model.header.heat} onChange={(v) => setHeader("heat", v)} />
            </div>
            <div><label className="text-[11px] text-gray-600">Work Order #</label>
              <TextInput value={model.header.workOrder} onChange={(v) => setHeader("workOrder", v)} />
            </div>
            <div><label className="text-[11px] text-gray-600">Gauge / Tool List Doc #</label>
              <TextInput value={model.header.gaugeDoc} onChange={(v) => setHeader("gaugeDoc", v)} />
            </div>
            <div><label className="text-[11px] text-gray-600">Description</label>
              <TextInput value={model.header.description} onChange={(v) => setHeader("description", v)} placeholder='e.g., 5-1/2" 8-RD L80 PIN' />
            </div>
          </div>
        </div>
      </section>

      {/* Visual checks */}
      <section className="card">
        <h3 className="font-semibold text-sm mb-2">Visual Checks</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div><label className="text-[11px] text-gray-600">Threads</label>
            <TextInput value={model.visual.threads} onChange={(v) => setVisual("threads", v)} placeholder="Pass / Fail / Notes" />
          </div>
          <div><label className="text-[11px] text-gray-600">Shoulder</label>
            <TextInput value={model.visual.shoulder} onChange={(v) => setVisual("shoulder", v)} placeholder="Pass / Fail / Notes" />
          </div>
          <div><label className="text-[11px] text-gray-600">Surface</label>
            <TextInput value={model.visual.surface} onChange={(v) => setVisual("surface", v)} placeholder="Pass / Fail / Notes" />
          </div>
          <div><label className="text-[11px] text-gray-600">Notes</label>
            <TextInput value={model.visual.notes} onChange={(v) => setVisual("notes", v)} />
          </div>
        </div>
      </section>

      {/* Dimensional checks — fills width */}
      <section className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Dimensional Checks (API 5B • 8-RD • {model.variant})</h3>
          <div className="flex gap-2">
            <button type="button" className="border border-gray-300 rounded px-2.5 py-1 text-[11px] hover:bg-gray-50" onClick={addRow}>+ Row</button>
            <button type="button" className="border border-gray-300 rounded px-2.5 py-1 text-[11px] hover:bg-gray-50" onClick={removeLastRow}>− Row</button>
          </div>
        </div>

        <div className="relative overflow-x-auto w-full">
          {/* full width table that shares columns */}
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-16" />{/* serial */}
              {COLS.map((_, i) => (<col key={i} />))}
              <col className="w-48 md:w-56 lg:w-64" />{/* remarks */}
              <col className="w-28" />{/* result */}
            </colgroup>

            <thead className="bg-gray-50 sticky top-0 z-20 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.05)]">
              <tr>
                <th className={`${th} sticky left-0 z-30 bg-gray-50`}>Serial</th>
                {COLS.map((c) => (
                  <th key={c.key} className={th}>
                    <div className="flex flex-col items-start leading-tight">
                      <span>{c.label}</span>
                      {c.tol ? <span className="text-[10px] text-gray-500">{c.tol}</span> : null}
                    </div>
                  </th>
                ))}
                <th className={th}>Remarks</th>
                <th className={th}>Accept/Reject</th>
              </tr>
            </thead>

            <tbody>
              {model.dimensions.map((r, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/40">
                  {/* sticky first col */}
                  <td className={`${td} sticky left-0 z-10 bg-white`}>
                    <TextInput value={r.serial} onChange={(v) => updateRow(idx, { serial: v })} />
                  </td>

                  {COLS.map((c) => {
                    const val = r[c.key];
                    const oot = isOOT(c.key, val);
                    return (
                      <td key={c.key} className={td}>
                        <NumericTextInput value={val} onChange={(v) => updateRow(idx, { [c.key]: v } as any)} outOfTol={oot} />
                      </td>
                    );
                  })}

                  <td className={td}>
                    <TextInput value={r.remarks} onChange={(v) => updateRow(idx, { remarks: v })} />
                  </td>
                  <td className={td}>
                    <select
                      className="w-full border border-gray-300 rounded px-2 py-1 text-[11px] md:text-xs focus:ring-2 focus:ring-blue-500"
                      value={r.result || ""}
                      onChange={(e) => updateRow(idx, { result: (e.target.value as DimensionsRow["result"]) || "" })}
                    >
                      <option value=""></option>
                      <option value="ACCEPT">ACCEPT</option>
                      <option value="REJECT">REJECT</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-[10px] md:text-xs text-gray-500">
          * ± tolerances are centered at 0 (e.g., L1 ±.002 → |value| ≤ .002). Range tolerances are min–max. Invalid numeric entries highlight lightly until corrected.
        </p>
      </section>
    </div>
  );
}

function defaultRows(n = 12): DimensionsRow[] {
  return Array.from({ length: n }, (_, i) => ({ serial: String(i + 1), result: "" }));
}
