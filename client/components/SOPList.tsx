export default function SOPList({ links }: { links: string[] }) {
  if (!links?.length) {
    return <div className="card"><p className="text-sm text-gray-600">No SOPs attached.</p></div>;
  }
  return (
    <div className="card">
      <ul className="space-y-2">
        {links.map((l, i) => (
          <li key={i}>
            <a className="text-blue-600 hover:underline" href={`#${l}`} onClick={(e)=>{e.preventDefault(); alert(`${l} would open here as a PDF viewer in M4.`);}}>
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
