"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

type Service = { id: string; name: string; short_description: string | null };

export default function RequestPage() {
  const searchParams = useSearchParams();
  const presetService = searchParams.get("service");
  const presetEvent = searchParams.get("event");
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<string[]>(presetService ? [presetService] : []);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelerCount, setTravelerCount] = useState("1");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((result) => setServices(result.data ?? []))
      .catch(() => setMessage("Unable to load services."))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!selected.length) return setMessage("Please select at least one service.");
    if (description.trim().length < 10) return setMessage("Please tell us a little more about what you need.");

    setSubmitting(true);
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: presetEvent || null, service_ids: selected, description, destination_country: country || null, destination_city: city || null, travel_start_date: startDate || null, travel_end_date: endDate || null, traveler_count: Number(travelerCount) || 1, priority }),
    });
    const result = await response.json();
    setSubmitting(false);
    setMessage(result.success ? `Request created: ${result.data.id}` : result.error?.message ?? "Unable to submit request.");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Start My Journey</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Tell TISA what you need.</h1>
          <p className="mt-5 text-base leading-7 text-slate-400">Choose the services you need and describe your journey. Our team will review your request and guide you through the next steps.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-10">
          <div>
            <h2 className="text-lg font-semibold text-white">Services</h2>
            {loading ? <p className="mt-3 text-sm text-slate-500">Loading services…</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {services.map((service) => <button type="button" key={service.id} onClick={() => toggle(service.id)} className={`rounded-2xl border p-4 text-left transition ${selected.includes(service.id) ? "border-sky-400/50 bg-sky-400/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}><div className="font-medium text-white">{service.name}</div><div className="mt-1 text-xs leading-5 text-slate-500">{service.short_description}</div></button>)}
            </div>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Destination country<input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-sky-400/50" placeholder="e.g. Germany" /></label>
            <label className="text-sm text-slate-300">Destination city<input value={city} onChange={(e) => setCity(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-sky-400/50" placeholder="e.g. Berlin" /></label>
          </div>

          <div className="grid gap-5 sm:grid-cols-3"><label className="text-sm text-slate-300">Travel start<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white" /></label><label className="text-sm text-slate-300">Travel end<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white" /></label><label className="text-sm text-slate-300">Travelers<input type="number" min="1" max="50" value={travelerCount} onChange={(e) => setTravelerCount(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white" /></label></div>
          <label className="block text-sm text-slate-300">Priority<select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-sky-400/50"><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
          <label className="block text-sm text-slate-300">What do you need help with?<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white outline-none focus:border-sky-400/50" placeholder="Tell us about your event, visa, flight, destination, deadline, or anything else we should know." /></label>

          {message && <div role="status" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">{message}</div>}
          <button disabled={submitting} className="h-12 rounded-full bg-sky-400 px-7 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Submitting…" : "Submit assistance request"}</button>
        </form>
      </section>
    </main>
  );
}
