import { useEffect, useState } from 'react';

type Row = {
  slot: number;                // row number
  serial?: string;             // part serial or piece #
  measurement?: string;        // e.g. OD 2.375", pitch, etc.
  inSpec?: boolean;
  operatorInitials?: string;
  inspectorInitials?: string;
};

type Report = {
  orderId: string;
  rows: Row[];
  operatorName?: string;
  inspectorName?: string;
  operatorSignedAt?: string;
  inspectorSignedAt?: string;
  notes?: string;
};

const emptyRow = (i:number): Row => ({ slot: i });

export default function InspectionReportForm({ orderId }: { orderId: string }) {
  const key = `inspectflow:report:${orderId}`;
  const [report, setReport] = useState<Report>({ orderId, rows: [0,1,2,3,4].map(emptyRow) });

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) setReport(JSON.parse(raw));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(report));
  }, [key, report]);

  const updateRow = (i:number, patch: Partial<Row>) => {
    setReport(r => {
      const rows = [...r.rows];
      rows[i] = { ...rows[i], ...patch };
      return { ...r, rows };
    });
  };

  const addRow = () => setReport(r => ({ ...r, rows: [...r.rows, emptyRow(r.rows.length)] }));

  const signOperator = () =>
    setReport(r => ({ ...r, operatorSignedAt: new Date().toISOString() }));

  const signInspector = () =>
    setReport(r => ({ ...r, inspectorSignedAt: new Date().toISOString() }));

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold mb-3">Roles & Signatures</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Operator Name</label>
            <input className="input" value={report.operatorName ?? ''} onChange={e=>setReport(r=>({...r, operatorName: e.target.value}))}/>
            <button className="btn mt-2" onClick={signOperator}>
              {report.operatorSignedAt ? 'Re-sign (operator)' : 'Sign as Operator'}
            </button>
            {report.operatorSignedAt && <p className="text-xs text-gray-600 mt-1">Signed at {new Date(report.operatorSignedAt).toLocaleString()}</p>}
          </div>
          <div>
            <label className="label">Inspector Name</label>
            <input className="input" value={report.inspectorName ?? ''} onChange={e=>setReport(r=>({...r, inspectorName: e.target.value}))}/>
            <button className="btn mt-2" onClick={signInspector}>
              {report.inspectorSignedAt ? 'Re-sign (inspector)' : 'Sign as Inspector'}
            </button>
            {report.inspectorSignedAt && <p className="text-xs text-gray-600 mt-1">Signed at {new Date(report.inspectorSignedAt).toLocaleString()}</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Measurement Rows</h3>
          <button className="btn btn-primary" onClick={addRow}>Add Row</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1 text-left">#</th>
                <th className="border px-2 py-1 text-left">Serial / Piece</th>
                <th className="border px-2 py-1 text-left">Measurement</th>
                <th className="border px-2 py-1">In Spec</th>
                <th className="border px-2 py-1 text-left">Operator Init.</th>
                <th className="border px-2 py-1 text-left">Inspector Init.</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-2 py-1">{i+1}</td>
                  <td className="border px-2 py-1">
                    <input className="input" value={row.serial ?? ''} onChange={e=>updateRow(i, { serial: e.target.value })} />
                  </td>
                  <td className="border px-2 py-1">
                    <input className="input" value={row.measurement ?? ''} onChange={e=>updateRow(i, { measurement: e.target.value })} />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <input type="checkbox" checked={!!row.inSpec} onChange={e=>updateRow(i, { inSpec: e.target.checked })} />
                  </td>
                  <td className="border px-2 py-1">
                    <input className="input" value={row.operatorInitials ?? ''} onChange={e=>updateRow(i, { operatorInitials: e.target.value })} />
                  </td>
                  <td className="border px-2 py-1">
                    <input className="input" value={row.inspectorInitials ?? ''} onChange={e=>updateRow(i, { inspectorInitials: e.target.value })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <label className="label">Notes</label>
          <textarea className="input" rows={3} value={report.notes ?? ''} onChange={e=>setReport(r=>({...r, notes: e.target.value}))}/>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn btn-primary" onClick={() => alert('For M3, this will POST to /api/reports. Saved locally for now.')}>
          Save Report
        </button>
        <span className="text-xs text-gray-600">Autosaved to your browser; API save comes next.</span>
      </div>
    </div>
  );
}
