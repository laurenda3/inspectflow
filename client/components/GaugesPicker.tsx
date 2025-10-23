import { useEffect, useMemo, useState } from "react";
import { useRole } from "../context/RoleContext";

type Gauge = {
  id: string;
  name: string;
  type: string;
  daysLeft: number; // from backend
  status: "ok" | "due_soon" | "expired" | "broken";
  location?: string;
};

type UseItem = {
  gaugeId: string;
  confirmedByOperatorAt?: string;
  verifiedByInspectorAt?: string;
  statusAtUse: "ok" | "due_soon" | "expired" | "broken";
};

export default function GaugesPicker({ orderId, apiBase }: { orderId: string; apiBase: string | null }) {
  const { role } = useRole();
  const storageKey = `inspectflow:gauges:${orderId}`;

  const [gauges, setGauges] = useState<Gauge[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ALL" | "OK" | "DUE" | "EXPIRED" | "BROKEN">("ALL");
  const [selected, setSelected] = useState<Record<string, UseItem>>({}); // by gaugeId

  // load catalog
  useEffect(() => {
    (async () => {
      try {
        if (!apiBase) return;
        const r = await fetch(`${apiBase}/api/gauges`);
        if (r.ok) setGauges(await r.json());
      } catch {}
    })();
  }, [apiBase]);

  // load/save selection
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) setSelected(JSON.parse(raw));
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(selected));
  }, [storageKey, selected]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return gauges.filter((g) => {
      const matchesText = !t || [g.name, g.type, g.location].join(" ").toLowerCase().includes(t);
      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "OK"
          ? g.status === "ok"
          : filter === "DUE"
          ? g.status === "due_soon"
          : filter === "EXPIRED"
          ? g.status === "expired"
          : g.status === "broken";
      return matchesText && matchesFilter;
    });
  }, [gauges, q, filter]);

  const toggle = (g: Gauge) => {
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[g.id]) {
        delete copy[g.id];
      } else {
        copy[g.id] = {
          gaugeId: g.id,
          statusAtUse: g.status,
          confirmedByOperatorAt: role === "OPERATOR" ? new Date().toISOString() : undefined,
          verifiedByInspectorAt: role === "INSPECTOR" ? new Date().toISOString() : undefined,
        };
      }
      return copy;
    });
  };

  const markVerify = (g: Gauge) => {
    setSelected((prev) => {
      const item = prev[g.id];
      if (!item) return prev;
      return {
        ...prev,
        [g.id]: { ...item, verifiedByInspectorAt: new Date().toISOString() },
      };
    });
  };

  const selectedList = useMemo(() => Object.values(selected), [selected]);
  const selectedIds = useMemo(() => new Set(Object.keys(selected)), [selected]);

  const statusChip = (s: Gauge["status"]) =>
    s === "ok"
      ? "bg-green-100 text-green-700"
      : s === "due_soon"
      ? "bg-yellow-100 text-yellow-700"
      : s === "expired"
      ? "bg-red-100 text-red-700"
      : "bg-gray-200 text-gray-700";

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "OK", "DUE", "EXPIRED", "BROKEN"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  filter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {f === "ALL" ? "All" : f === "OK" ? "OK" : f === "DUE" ? "Due Soon" : f}
              </button>
            ))}
          </div>
          <div className="w-full md:w-80">
            <input
              className="input"
              placeholder="Search gauges (name/type/location)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Catalog */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 border">Use</th>
              <th className="text-left px-3 py-2 border">Name</th>
              <th className="text-left px-3 py-2 border">Type</th>
              <th className="text-left px-3 py-2 border">Status</th>
              <th className="text-left px-3 py-2 border">Cal Due (days)</th>
              <th className="text-left px-3 py-2 border">Location</th>
              <th className="text-left px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 border">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(g.id)}
                    onChange={() => toggle(g)}
                    disabled={g.status === "expired" || g.status === "broken"}
                    title={
                      g.status === "expired"
                        ? "Expired — cannot use"
                        : g.status === "broken"
                        ? "Broken — cannot use"
                        : "Toggle selection"
                    }
                  />
                </td>
                <td className="px-3 py-2 border">{g.name}</td>
                <td className="px-3 py-2 border">{g.type}</td>
                <td className="px-3 py-2 border">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusChip(g.status)}`}>
                    {g.status === "ok" ? "OK" : g.status === "due_soon" ? "DUE SOON" : g.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-2 border">{g.daysLeft}</td>
                <td className="px-3 py-2 border">{g.location || "—"}</td>
                <td className="px-3 py-2 border">
                  {role === "INSPECTOR" && selectedIds.has(g.id) && (
                    <button
                      className="text-xs rounded-md border px-2 py-1 hover:bg-gray-50"
                      onClick={() => markVerify(g)}
                    >
                      Mark Verified
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-3 border text-center text-gray-500" colSpan={7}>
                  No gauges match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Selected summary */}
      <div className="card">
        <h3 className="font-semibold mb-2">Selected Gauges</h3>
        {selectedList.length === 0 ? (
          <p className="text-sm text-gray-600">None selected yet.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {selectedList.map((it) => {
              const g = gauges.find((x) => x.id === it.gaugeId);
              return (
                <li key={it.gaugeId} className="flex items-center justify-between">
                  <span>
                    {g?.name || it.gaugeId} • <span className="text-gray-600">{g?.type}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {it.confirmedByOperatorAt && "Operator confirmed • "}
                    {it.verifiedByInspectorAt && "Inspector verified"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="text-xs text-gray-500 mt-2">
          * Expired/Broken gauges are blocked. Due-soon allowed but flagged for review.
        </div>
      </div>
    </div>
  );
}
