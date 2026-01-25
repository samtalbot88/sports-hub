export default function HomePage() {
  return (
    <main className="min-h-screen p-6 flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">World Cup Hub</h1>
        <p className="mt-2 text-gray-600">
          Football games and challenges based on World Cup history.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">Games</h2>

        <ul className="mt-4">
          <li>
            <a href="/missing-11" className="text-blue-600 underline">
              Missing 11
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
