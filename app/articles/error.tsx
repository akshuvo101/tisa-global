"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ArticlesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Navbar />
      <main className="grid min-h-[60vh] place-items-center bg-background px-5 py-16 text-foreground">
        <section role="alert" className="max-w-lg text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-300">
            TISA Global Journal
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-white">
            Articles are temporarily unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            We couldn’t load the published articles just now. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950 hover:bg-sky-300"
          >
            Try again
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
}
