export default function GaugeChecklist({ gauges }: { gauges: any[] }) {
  if (!gauges?.length) {
    return <div className="card"><p className="text-sm text-gray-600">No gauges loaded yet.</p></div>;
  }
  return (
    <div className="space-y-2">
      {gauges.map(g => (
        <div key={g.id} className="card flex items-center justify-between">
          <div>
            <div className="font-medium">{g.name}</div>
            <div className="text-xs text-gray-600">Expires in {g.daysLeft} day(s)</div>
          </div>
          <span className={`badge ${g.status==='ok' ? 'badge-ok' : g.status==='due_soon' ? 'badge-warn' : 'badge-danger'}`}>
            {g.status==='ok' ? 'OK' : g.status==='due_soon' ? 'Due Soon' : 'Expired'}
          </span>
        </div>
      ))}
    </div>
  );
}
