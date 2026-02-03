import FixturesShell from "../components/FixturesShell";

export default function FixturesPage() {
  return (
    <main className="bg-emerald-800 min-h-screen p-6 text-white">
      <a
        href="/"
        className="mb-2 inline-block text-sm font-semibold text-emerald-200 hover:text-white transition underline"
      >
        ← Back to Home
      </a>

      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl font-extrabold mb-4">
          World Cup Standings & Fixtures
        </h1>

        <FixturesShell />
      </div>
    </main>
  );
}
