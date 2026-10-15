"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { RequestStatus } from "@/types/tisa";
import QuoteActions from "@/components/account/QuoteActions";
import RequestMessageComposer from "@/components/account/RequestMessageComposer";
import {
  getDestinationCountryLabel,
  getDestinationLabel,
} from "@/lib/data/destination-label";

type RequestDetail = {
  id: string;
  destination_country: string | null;
  destination_city: string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  traveler_count: number;
  priority: string;
  status: RequestStatus;
  description: string;
  created_at: string;
  request_services: Array<{ id: string; status: string; service_catalog: { name: string } | null }>;
  request_documents: Array<{ id: string; document_type: string; file_name: string | null; status: string; required: boolean; due_date: string | null; rejection_reason: string | null }>;
  request_messages: Array<{ id: string; sender_id: string; message: string; created_at: string }>;
  quotes: Array<{ id: string; quote_number: string; status: string; total_amount: number; currency: string; valid_until: string | null; subtotal:number; service_fee:number; discount:number; tax:number; quote_items:Array<{id:string;description:string;quantity:number;unit_price:number;total_price:number}> }>;
  bookings: Array<{ id: string; booking_reference: string | null; status: string }>;
};

const steps: RequestStatus[] = ["requested", "reviewing", "need_documents", "documents_received", "quoted", "quote_accepted", "processing", "confirmed", "completed"];
const labels: Record<string, string> = { requested: "Request received", reviewing: "TISA reviewing", need_documents: "Documents needed", documents_received: "Documents received", quoted: "Quote ready", quote_accepted: "Quote accepted", processing: "Processing", confirmed: "Confirmed", completed: "Completed" };

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/requests/${params.id}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message ?? "Unable to load request.");
        return result;
      })
      .then((result) => setRequest(result.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load request."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="min-h-screen bg-background text-foreground"><div className="mx-auto max-w-5xl px-6 py-20 text-sm text-slate-500">Loading request…</div></main>;
  if (error || !request) return <main className="min-h-screen bg-background text-foreground"><div className="mx-auto max-w-5xl px-6 py-20"><p className="text-sm text-red-300">{error || "Request not found."}</p><Link href="/account/requests" className="mt-5 inline-block text-sm text-sky-400">← Back to requests</Link></div></main>;

  const currentIndex = steps.indexOf(request.status);

  return (
    <main className="min-h-screen bg-background text-foreground">
      
      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        <Link href="/account/requests" className="text-sm text-slate-500 hover:text-white">← My Requests</Link>
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs uppercase tracking-[0.2em] text-sky-400">Request {request.id.slice(0, 8).toUpperCase()}</p><h1 className="mt-3 text-3xl font-semibold text-white">{getDestinationLabel(request.destination_city, request.destination_country)}</h1><p className="mt-2 text-sm text-slate-500">Created {new Date(request.created_at).toLocaleDateString()}</p></div><span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">{labels[request.status] ?? request.status}</span>
        </div>

        <div className="mt-10 overflow-x-auto pb-2"><div className="flex min-w-[760px] items-start">{steps.map((step, index) => <div key={step} className="flex min-w-[84px] flex-1 flex-col items-center text-center"><div className={`h-3 w-3 rounded-full ${index <= currentIndex ? "bg-sky-400" : "bg-white/10"}`} /><div className={`mt-3 text-[11px] leading-4 ${index <= currentIndex ? "text-slate-200" : "text-slate-600"}`}>{labels[step]}</div>{index < steps.length - 1 && <div className={`mt-[-19px] h-px w-full ${index < currentIndex ? "bg-sky-400/60" : "bg-white/10"}`} />}</div>)}</div></div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"><h2 className="text-lg font-semibold text-white">Services</h2><div className="mt-5 space-y-3">{request.request_services.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] p-4"><span className="text-sm text-slate-300">{item.service_catalog?.name ?? "Service"}</span><span className="text-xs text-slate-500">{item.status}</span></div>)}</div></section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"><h2 className="text-lg font-semibold text-white">Your request</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">{request.description}</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><Info label="Country" value={getDestinationCountryLabel(request.destination_country) || "Not specified"} /><Info label="Travelers" value={String(request.traveler_count)} /><Info label="Priority" value={request.priority} /></div></section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"><h2 className="text-lg font-semibold text-white">Documents</h2>{request.request_documents.length ? <div className="mt-4 space-y-3">{request.request_documents.map((doc) => <DocumentRow key={doc.id} doc={doc} />)}</div> : <p className="mt-3 text-sm text-slate-500">No documents have been requested yet.</p>}</section>
          </div>
          <aside className="space-y-6">
            {request.bookings?.length > 0 && <section className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.03] p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Travel fulfillment</h2><p className="mt-1 text-xs text-slate-500">Your TISA booking is being processed.</p></div></div><div className="mt-4 space-y-3">{request.bookings.map((booking)=><Link key={booking.id} href={`/account/bookings/${booking.id}`} className="block rounded-2xl border border-white/8 p-4"><div className="flex items-center justify-between gap-3"><span className="text-sm text-white">{booking.booking_reference || booking.id.slice(0,8)}</span><span className="text-xs capitalize text-slate-500">{booking.status.replaceAll("_"," ")}</span></div></Link>)}</div></section>}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"><h2 className="text-lg font-semibold text-white">Quotes</h2>{request.quotes.length ? <div className="mt-4 space-y-4">{request.quotes.map((quote) => <div key={quote.id} className="rounded-2xl border border-white/8 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-slate-600">{quote.quote_number}</p><p className="mt-2 text-sm capitalize text-slate-400">{quote.status.replaceAll("_"," ")}</p></div><p className="text-xl font-semibold text-white">{quote.currency} {Number(quote.total_amount).toLocaleString()}</p></div><div className="mt-4 space-y-2">{quote.quote_items?.map(item=><div key={item.id} className="flex justify-between gap-3 text-xs text-slate-500"><span>{item.description} × {item.quantity}</span><span>{quote.currency} {Number(item.total_price).toLocaleString()}</span></div>)}</div>{quote.valid_until&&<p className="mt-3 text-xs text-slate-600">Valid until {quote.valid_until}</p>}<QuoteActions quoteId={quote.id} status={quote.status}/></div>)}</div> : <p className="mt-3 text-sm leading-6 text-slate-500">TISA has not prepared a quote yet. We will notify you when it is ready.</p>}</section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Messages</h2><p className="mt-1 text-xs text-slate-600">Communicate directly with the TISA team.</p></div></div><div className="mt-4 space-y-3">{request.request_messages.length ? request.request_messages.map((message) => <div key={message.id} className="rounded-2xl bg-white/[0.03] p-4"><p className="text-sm leading-6 text-slate-300">{message.message}</p><p className="mt-2 text-[11px] text-slate-600">{new Date(message.created_at).toLocaleString()}</p></div>) : <p className="text-sm text-slate-500">No messages yet. Send a message below if you need help.</p>}</div><RequestMessageComposer requestId={request.id} onSent={(message)=>setRequest((current)=>current?{...current,request_messages:[...current.request_messages,message]}:current)}/></section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function DocumentRow({doc}:{doc:RequestDetail["request_documents"][number]}){const[busy,setBusy]=useState(false);const[file,setFile]=useState<File|null>(null);const[error,setError]=useState("");async function upload(){if(!file)return;setBusy(true);setError("");const form=new FormData();form.append("file",file);const r=await fetch(`/api/requests/${doc.id}/documents`,{method:"POST",body:form});const d=await r.json();setBusy(false);if(!r.ok||!d.success){setError(d.error?.message||"Upload failed.");return;}location.reload();}return <div className="rounded-2xl bg-white/[0.03] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm text-slate-300">{doc.document_type}</p><p className="mt-1 text-xs text-slate-600">{doc.file_name||"Upload required"}</p></div><span className="text-xs capitalize text-slate-500">{doc.status.replaceAll("_"," ")}</span></div>{["required","rejected"].includes(doc.status)&&<div className="mt-3 flex flex-wrap gap-2"><input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e=>setFile(e.target.files?.[0]||null)} className="max-w-full text-xs text-slate-400"/><button type="button" disabled={busy||!file} onClick={()=>void upload()} className="rounded-full bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 disabled:opacity-40">{busy?"Uploading…":"Upload"}</button></div>}{error&&<p className="mt-2 text-xs text-red-300">{error}</p>}</div>}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"><p className="text-[11px] uppercase tracking-[0.14em] text-slate-600">{label}</p><p className="mt-2 text-sm text-slate-300">{value}</p></div>;
}
