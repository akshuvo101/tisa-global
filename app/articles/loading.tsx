export default function ArticlesLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading published articles"
      className="min-h-screen bg-background px-5 py-14 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-4 w-40 rounded bg-white/10" />
        <div className="mt-5 h-12 max-w-2xl rounded bg-white/10" />
        <div className="mt-3 h-5 max-w-xl rounded bg-white/[0.06]" />
        <div className="mt-10 h-16 rounded-2xl bg-white/[0.05]" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-white/10">
              <div className="aspect-[16/10] bg-white/[0.06]" />
              <div className="space-y-4 p-6">
                <div className="h-3 w-24 rounded bg-white/10" />
                <div className="h-6 rounded bg-white/10" />
                <div className="h-4 rounded bg-white/[0.06]" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading published articles...</span>
    </main>
  );
}
