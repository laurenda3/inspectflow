export default function BlueprintPreview({ url }: { url: string }) {
  const isPdf = url.toLowerCase().endsWith(".pdf");
  return (
    <div className="space-y-2">
      {isPdf ? (
        <iframe
          src={url}
          className="w-full h-64 border rounded-md"
          title="Blueprint PDF"
        />
      ) : (
        <img
          src={url}
          alt="Blueprint"
          className="w-full max-h-64 object-contain border rounded-md"
        />
      )}
      <div className="text-xs text-gray-500 truncate">
        Source:{" "}
        <a className="text-blue-700 hover:underline" href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      </div>
    </div>
  );
}
