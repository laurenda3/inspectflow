import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PrintableEightRD, { PrintableEightRDProps } from "../../../components/PrintableEightRD";
import { detectApiBase } from "../../../lib/apiBase";

export default function PrintPage() {
  const router = useRouter();
  const orderId = (router.query.orderId as string) || "";
  const [apiBase, setApiBase] = useState<string | null>(null);
  const [data, setData] = useState<PrintableEightRDProps | null>(null);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const base = await detectApiBase();
      setApiBase(base);

      // pull packet basics
      const r = await fetch(`${base}/api/packets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const packet = r.ok ? await r.json() : { sopLinks: [], checklist: [] };

      // merge local meta saved during creation
      const metaRaw = localStorage.getItem(`inspectflow:packetmeta:${orderId}`);
      const meta = metaRaw ? JSON.parse(metaRaw) : {};

      // pull any report data you’ve saved locally (stub path)
      const reportRaw = localStorage.getItem(`inspectflow:8rd:${orderId}`);
      const report = reportRaw ? JSON.parse(reportRaw) : {};

      const payload: PrintableEightRDProps = {
        variant: "PIN", // or infer from thread/part if you like
        header: {
          company: report.company || meta.company || "",
          customer: report.customer || "",
          drawing: report.drawing || "",
          part: meta.partNumber || "",
          heat: report.heat || "",
          workOrder: report.workOrder || "",
          gaugeDoc: report.gaugeDoc || "",
          description: meta.requiredThread ? `${meta.partNumber || ""} ${meta.requiredThread}` : "",
        },
        visual: {
          threads: report.visualThreads || "",
          shoulder: report.visualShoulder || "",
          surface: report.visualSurface || "",
          notes: report.visualNotes || "",
        },
        dimensions: report.dimensions || [],
      };
      setData(payload);
    })();
  }, [orderId]);

  if (!orderId || !data) return <div className="p-6">Loading…</div>;

  return (
    <main className="bg-white min-h-screen p-4 print:p-0">
      <div className="max-w-[1100px] mx-auto">
        {/* Toolbar (hidden on print) */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <button
            onClick={() => router.back()}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Back
          </button>
          <div className="text-sm text-gray-600">Order #{orderId}</div>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white rounded px-3 py-1.5 text-sm hover:bg-blue-700"
          >
            Print
          </button>
        </div>

        <PrintableEightRD {...data} />
      </div>
    </main>
  );
}
