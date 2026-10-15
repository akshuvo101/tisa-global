import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ArticleNotFound() {
  return (
    <>
      <Navbar />
      <main className="grid min-h-[60vh] place-items-center bg-background px-5 py-16 text-foreground">
        <section className="max-w-lg text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-300">
            TISA Global Journal
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            This article isn’t available
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            It may have moved, or it may not be published yet.
          </p>
          <Link
            href="/articles"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950 hover:bg-sky-300"
          >
            Browse published articles
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
