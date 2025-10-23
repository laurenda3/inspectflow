import { useEffect, useState } from "react";
import EightRDInspectionReport from "./EightRDInspectionReport";
import { useRole } from "../context/RoleContext";

type Packet = {
  orderId: string;
  sopLinks: string[];
  checklist: string[];
};

export default function PacketPanel({
  open,
  onClose,
  packet,
}: {
  open: boolean;
  onClose: () => void;
  packet: Packet | null;
}) {
  const { role } = useRole();
  const [tab, setTab] = useState<"overview" | "report" | "gauges" | "sops">(
    "overview"
  );

  // smart default tab when panel opens
  useEffect(() => {
    if (!open || !packet) return;
    setTab(role === "OPERATOR" ? "report" : "overview");
  }, [open, packet, role]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !packet) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-sm">
      {/* Slide-over panel */}
      <div className="w-full max-w-3xl bg-white shadow-xl h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Packet • Order #{packet.orderId}
          </h2>
          <button
            onClick={onClose}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b text-sm font-medium">
          {(["overview", "report", "gauges", "sops"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 ${
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === "overview" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Checklist</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {packet.checklist.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                Open tabs above to fill the inspection report, verify gauges, or
                view SOPs.
              </p>
            </div>
          )}

          {/* 8RD Inspection Report */}
          {tab === "report" && (
            <EightRDInspectionReport orderId={packet.orderId} />
          )}

          {/* Gauge Check (placeholder for now) */}
          {tab === "gauges" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Gauge Verification</h3>
              <p className="text-sm text-gray-700">
                Track gauge calibration verification, standoff tool readings, and
                inspector confirmation here.
              </p>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm text-gray-600 mb-1">Notes</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter gauge verification notes..."
                />
              </div>
            </div>
          )}

          {/* SOPs */}
          {tab === "sops" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Standard Operating Procedures
              </h3>
              {packet.sopLinks.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  {packet.sopLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {link.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No SOPs attached for this packet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
