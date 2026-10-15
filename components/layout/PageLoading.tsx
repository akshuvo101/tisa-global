import { LoaderCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function PageLoading({ label }: { label: string }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section
        aria-busy="true"
        className="mx-auto min-h-[70vh] max-w-7xl px-6 py-16 lg:px-8"
      >
        <p role="status" className="flex items-center gap-2 text-sm font-medium text-muted">
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />
          {label}
        </p>
        <div aria-hidden="true" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="animate-pulse rounded-3xl border border-border bg-surface p-5 motion-reduce:animate-none">
              <div className="h-36 rounded-2xl bg-surface-light" />
              <div className="mt-5 h-4 w-2/3 rounded bg-surface-light" />
              <div className="mt-3 h-3 w-full rounded bg-surface-light" />
              <div className="mt-2 h-3 w-4/5 rounded bg-surface-light" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
