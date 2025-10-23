import { useEffect, useMemo, useState } from "react";
import { detectApiBase } from "../lib/apiBase";
import { useRole } from "../context/RoleContext";
import { useRouter } from "next/router";

type Order = {
  id: string;
  partNumber: string;
  requiredThread: string;
  status: "QUEUED" | "IN_PROGRESS" | "DONE";
  createdAt?: string;
};

const THREAD_TYPES = [
  'EUE 8RD',
  'LTC 8RD',
  'BTC 8RD',
  'NPT',
  'NC',
  'Premium (placeholder)',
];

const NDT_TYPES = ['None', 'MPI', 'LPI', 'UT', 'VT'];

const PART_NUMBERS = [
  'PN-1001',
  'PN-1002',
  'PN-2001',
  'PN-3001',
];

export default function Dashboard() {
  const { role, setRole } = useRole();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [apiBase, setApiBase] = useState<string | null>(null);

  // inspector-only packet fields (dropdowns)
  const [selPart, setSelPart] = useState(PART_NUMBERS[0]);
  const [selThread, setSelThread] = useState(THREAD_TYPES[0]);
  const [selNdt, setSelNdt] = useState(NDT_TYPES[0]);
  const [blueprintUrl, setBlueprintUrl] = useState("");

  // search
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const base = await detectApiBase();
        setApiBase(base);
        const res = await fetch(`${base}/api/orders/today`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setMessage("Could not load orders. Is the server running?");
      }
    })();
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "o" || e.key === "O") setRole("OPERATOR");
      if (e.key === "i" || e.key === "I") setRole("INSPECTOR");
      if (e.key === "/") {
        e.preventDefault();
        (document.getElementById("orderSearch") as HTMLInputElement | null)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setRole]);

  const visibleOrders = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return orders;
    return orders.filter((o) =>
      [o.id, o.partNumber, o.requiredThread].join(" ").toLowerCase().includes(t)
    );
  }, [orders, q]);

  // inspector-only: create order + packet meta
  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiBase) return;

    try {
      const res = await fetch(`${apiBase}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partNumber: selPart,
          requiredThread: selThread,
          status: "QUEUED",
        }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const created: Order = await res.json();

      // stash packet meta locally so /report can show it
      localStorage.setItem(
        `inspectflow:packetmeta:${created.id}`,
        JSON.stringify({
          orderId: created.id,
          partNumber: selPart,
          requiredThread: selThread,
          ndtType: selNdt === "None" ? null : selNdt,
          blueprintUrl: blueprintUrl || null,
        })
      );

      setOrders((prev) => [created, ...prev]);
      setMessage(`Order #${created.id} created successfully`);
      // navigate directly to the report page
      router.push(`/report/${created.id}`);
    } catch {
      setMessage("Could not create order.");
    }
  };

  const goToReport = (id: string) => router.push(`/report/${id}`);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        {/* Header with role toggle */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">InspectFlow Dashboard</h1>
            <div className="text-xs text-gray-500 mt-1">
              {apiBase ? `API: ${apiBase}` : "Connecting to API..."}
            </div>
          </div>

          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              className={`px-3 py-1.5 text-sm ${
                role === "OPERATOR"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setRole("OPERATOR")}
              title="Press O"
            >
              Operator
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${
                role === "INSPECTOR"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setRole("INSPECTOR")}
              title="Press I"
            >
              Inspector
            </button>
          </div>
        </header>

        {message && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
            {message}
          </div>
        )}

        {/* Quick actions + search */}
        <section className="card flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-2 flex-wrap">
            <button className="btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Home
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                const first = visibleOrders[0];
                if (first) goToReport(first.id);
                else setMessage("No orders to open.");
              }}
            >
              {role === "OPERATOR" ? "Start Report" : "Open Packet"}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-80">
            <input
              id="orderSearch"
              className="input"
              placeholder="Search orders (/, id, part, thread)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </section>

        {/* Inspector-only: Create order/packet (dropdowns) */}
        {role === "INSPECTOR" && (
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Create Order & Packet</h2>
            <form onSubmit={createOrder} className="card grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Part Number</label>
                <select className="input" value={selPart} onChange={(e) => setSelPart(e.target.value)}>
                  {PART_NUMBERS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Thread Type</label>
                <select className="input" value={selThread} onChange={(e) => setSelThread(e.target.value)}>
                  {THREAD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">NDT</label>
                <select className="input" value={selNdt} onChange={(e) => setSelNdt(e.target.value)}>
                  {NDT_TYPES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Blueprint URL (PDF or Image)</label>
                <input
                  className="input"
                  value={blueprintUrl}
                  onChange={(e) => setBlueprintUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div className="md:col-span-6">
                <button className="btn btn-primary">Create & Open</button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              * Operators don’t create orders — inspectors/supervisors do. Operators go straight to the report.
            </p>
          </section>
        )}

        {/* Orders */}
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Today's Orders</h2>
          {visibleOrders.length === 0 ? (
            <div className="text-gray-500 text-sm">No orders match your search.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleOrders.map((o) => (
                <div key={o.id} className="card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-500">Order #{o.id}</div>
                      <span
                        className={`badge ${
                          o.status === "DONE"
                            ? "badge-ok"
                            : o.status === "IN_PROGRESS"
                            ? "badge-warn"
                            : "badge-danger"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-800">{o.partNumber}</div>
                    <div className="text-sm text-gray-600">Thread: {o.requiredThread}</div>
                  </div>
                  <div className="mt-3">
                    <button className="btn btn-primary w-full" onClick={() => goToReport(o.id)}>
                      {role === "OPERATOR" ? "Open Report" : "Open Packet"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
