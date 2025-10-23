import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>InspectFlow</h1>
      <p>Human-centered inspection helper.</p>
      <Link href="/dashboard">Go to Dashboard →</Link>
    </main>
  );
}
