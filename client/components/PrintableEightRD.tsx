import React from "react";
import clsx from "clsx";

type VisualChecks = {
  threads?: string;
  shoulder?: string;
  surface?: string;
  notes?: string;
};

type DimensionsRow = {
  serial?: string;         // optional serial/identifier if you want
  l1?: string;             // Pitch Dia (L1)
  lead?: string;
  taperA?: string;
  taperB?: string;
  taperC?: string;
  taperAvg?: string;
  threadHeight?: string;
  od?: string;             // Outside Dia (OD)
  id?: string;             // Inside Dia (ID)
  standoff?: string;
  l4?: string;
  sealFaceMinusL1?: string; // Seal Face – L1
  overallLength?: string;
  remarks?: string;
  result?: "ACCEPT" | "REJECT" | "" | undefined;
};

export type PrintableEightRDProps = {
  variant: "PIN" | "BOX";
  header: {
    company?: string;
    customer?: string;
    drawing?: string;
    part?: string;
    heat?: string;
    workOrder?: string;
    gaugeDoc?: string;     // Gauge / Tool List Document #
    description?: string;  // e.g., 5-1/2" 8-round L80 Pin
  };
  visual?: VisualChecks;
  dimensions: DimensionsRow[];    // rows of measurements
};

const th = "px-2 py-1 border text-xs font-semibold text-gray-700";
const td = "px-2 py-1 border text-xs text-gray-900";

export default function PrintableEightRD({ variant, header, visual, dimensions }: PrintableEightRDProps) {
  return (
    <div className="print:p-0 print:bg-white">
      {/* Header */}
      <section className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="border rounded p-2">
          <div className="flex justify-between"><span className="text-gray-600">Company:</span><strong>{header.company || "—"}</strong></div>
          <div className="flex justify-between"><span className="text-gray-600">Customer:</span><span>{header.customer || "—"}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Drawing #:</span><span>{header.drawing || "—"}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Part #:</span><span>{header.part || "—"}</span></div>
        </div>
        <div className="border rounded p-2">
          <div className="flex justify-between"><span className="text-gray-600">Heat #:</span><span>{header.heat || "—"}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Work Order #:</span><span>{header.workOrder || "—"}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Gauge / Tool List Doc #:</span><span>{header.gaugeDoc || "—"}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Description:</span><span>{header.description || `${variant} 8-Round`}</span></div>
        </div>
      </section>

      {/* Visual Checks */}
      <section className="mb-3">
        <div className="text-sm font-semibold mb-1">VISUAL CHECKS</div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>Visual: Threads</th>
              <th className={th}>Visual: Shoulder</th>
              <th className={th}>Visual: Surface</th>
              <th className={th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={td}>{visual?.threads || ""}</td>
              <td className={td}>{visual?.shoulder || ""}</td>
              <td className={td}>{visual?.surface || ""}</td>
              <td className={td}>{visual?.notes || ""}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Dimensional Checks */}
      <section>
        <div className="text-sm font-semibold mb-1">DIMENSIONAL CHECKS</div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Serial</th>
                <th className={th}>Pitch Dia (L1)</th>
                <th className={th}>Lead</th>
                <th className={th}>Taper A</th>
                <th className={th}>Taper B</th>
                <th className={th}>Taper C</th>
                <th className={th}>Taper Avg</th>
                <th className={th}>Thread Height</th>
                <th className={th}>Outside Dia (OD)</th>
                <th className={th}>Inside Dia (ID)</th>
                <th className={th}>Standoff</th>
                <th className={th}>L4</th>
                <th className={th}>Seal Face–L1</th>
                <th className={th}>Overall Length</th>
                <th className={th}>Remarks</th>
                <th className={th}>Accept/Reject</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((r, i) => (
                <tr key={i} className={clsx(i % 2 ? "bg-white" : "bg-gray-50")}>
                  <td className={td}>{r.serial || ""}</td>
                  <td className={td}>{r.l1 || ""}</td>
                  <td className={td}>{r.lead || ""}</td>
                  <td className={td}>{r.taperA || ""}</td>
                  <td className={td}>{r.taperB || ""}</td>
                  <td className={td}>{r.taperC || ""}</td>
                  <td className={td}>{r.taperAvg || ""}</td>
                  <td className={td}>{r.threadHeight || ""}</td>
                  <td className={td}>{r.od || ""}</td>
                  <td className={td}>{r.id || ""}</td>
                  <td className={td}>{r.standoff || ""}</td>
                  <td className={td}>{r.l4 || ""}</td>
                  <td className={td}>{r.sealFaceMinusL1 || ""}</td>
                  <td className={td}>{r.overallLength || ""}</td>
                  <td className={td}>{r.remarks || ""}</td>
                  <td className={td}>{r.result || ""}</td>
                </tr>
              ))}
              {dimensions.length === 0 && (
                <tr>
                  <td className={td} colSpan={16}>
                    (no rows yet)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
