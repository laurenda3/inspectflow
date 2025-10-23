import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { detectApiBase } from "../../lib/apiBase";
import { useRole } from "../../context/RoleContext";
import EightRDInspectionReport from "../../components/EightRDInspectionReport";
import GaugesPicker from "../../components/GaugesPicker";
import BlueprintPreview from "../../components/BlueprintPreview";

type Packet = {
  orderId: string;
  sopLinks: string[];
  checklist: string[];
  partNumber?: string;
  requiredThread?: string;
  ndtType?: string | null;
  blueprintUrl?: string | null;
};

export default function OrderReportPage() {
  const router = useRouter();
  const { role } = useRole();
  const orderId = (router.query.orderId as string) || "";

  const [apiBase, setApiBase] = useState<string | null>(null);
  const [packet, setPacket] = useState<Packet | null>(null);
  const [tab, setTab] = useState<"overview" | "report" | "gauges" | "sops">("overview");
  const [message, setMessage] = useState<string | null>(null);
  const [fullWidth, setFullWidth] = useState<boolean>(true); // default to full width

  // prefer report for operators
  useEffect(() => {
    setTab(role === "OPERATOR" ? "report" : "overview");
  }, [role]);

  // detect API + load packet
  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const base = await detectApiBase();
        setApiBase(base);
        const res = await fetch(`${base}/api/packets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        if (!res.ok) throw new Error("Failed to open packet");
        const serverPacket = await res.json();

        const metaRaw = localStorage.getItem(`inspectflow:packetmeta:${orderId}`);
        const meta = metaRaw ? JSON.parse(metaRaw) : {};
        setPacket({ ...serverPacket, ...meta });
      } catch (e) {
        console.error(e);
        setMessage("Could not load packet. Is the server running?");
      }
    })();
  }, [orderId]);

  const headerMeta = useMemo(() => {
    if (!packet) return null;
    return {
      partNumber: packet.partNumber || "—",
      thread: packet.requiredThread || "—",
      ndt: packet.ndtType || "—",
      blueprintUrl: packet.blueprintUrl || undefined,
    };
  }, [packet]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* FULL WIDTH container */}
      <div className="w-full max-w-none p-4 md:p-6 space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{orderId} • Report Workspace</h1>
            <p className="text-xs text-gray-500">
              {apiBase ? `API: http://localhost:3001` : "Connecting to API…"} • Role: {role}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFullWidth((v) => !v)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50"
              title="Toggle full-width mode"
            >
              {fullWidth ? "Show Context" : "Full Width"}
            </button>
            <button
              onClick={() => router.push(`/report/${orderId}/print`)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Print 8-RD Report
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b text-sm font-medium">
          {(["overview", "report", "gauges", "sops"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 ${
                tab === t
                  ? "border-b-2 border-blue-600 text-blue-700 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t === "overview"
                ? "Overview"
                : t === "report"
                ? "Inspection Report"
                : t === "gauges"
                ? "Gauge Check"
                : "SOPs"}
            </button>
          ))}
        </div>

        {/* Layout grid: when fullWidth, hide the context column */}
        <div className={`grid gap-4 ${fullWidth ? "grid-cols-12" : "grid-cols-12"}`}>
          {!fullWidth && (
            <aside className="col-span-12 lg:col-span-4 space-y-4">
              <div className="card">
                <h3 className="font-semibold mb-2">Job Details</h3>
                <dl className="text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <dt className="text-gray-600">Part Number</dt>
                    <dd className="text-gray-900">{headerMeta?.partNumber}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <dt className="text-gray-600">Thread Type</dt>
                    <dd className="text-gray-900">{headerMeta?.thread}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-600">NDT</dt>
                    <dd className="text-gray-900">{headerMeta?.ndt}</dd>
                  </div>
                </dl>
              </div>

              <div className="card">
                <h3 className="font-semibold mb-2">Blueprint</h3>
                {headerMeta?.blueprintUrl ? (
                  <BlueprintPreview url={headerMeta.blueprintUrl} />
                ) : (
                  <p className="text-sm text-gray-600">
                    No blueprint attached. Inspectors can attach one during packet creation.
                  </p>
                )}
              </div>

              {packet?.checklist?.length ? (
                <div className="card">
                  <h3 className="font-semibold mb-2">Checklist</h3>
                  <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                    {packet.checklist.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          )}

          <section className={`${fullWidth ? "col-span-12" : "col-span-12 lg:col-span-8"}`}>
            {tab === "overview" && (
              <div className="card">
                <h3 className="font-semibold mb-2">Overview</h3>
                <p className="text-sm text-gray-700">
                  Use the tabs above to complete the 8-RD inspection report, verify gauges, and view SOPs.
                </p>
              </div>
            )}

            {tab === "report" && packet && (
              <div className="space-y-3">
                <EightRDInspectionReport orderId={packet.orderId} />
              </div>
            )}

            {tab === "gauges" && packet && <GaugesPicker orderId={packet.orderId} apiBase={apiBase} />}

            {tab === "sops" && (
              <div className="card">
                <h3 className="font-semibold mb-2">SOPs</h3>
                {packet?.sopLinks?.length ? (
                  <ul className="list-disc list-inside space-y-1">
                    {packet.sopLinks.map((l, i) => (
                      <li key={i}>
                        <a className="text-blue-700 hover:underline" href={l} target="_blank" rel="noreferrer">
                          {l.split("/").pop()}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No SOPs attached.</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
