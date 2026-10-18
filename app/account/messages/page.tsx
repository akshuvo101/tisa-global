"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock3, MessageCircle, MessagesSquare } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import PortalPageHeader from "@/components/account/PortalPageHeader";
import PortalEmptyState from "@/components/account/PortalEmptyState";
import { getDestinationLabel } from "@/lib/data/destination-label";

type Message = { id: string; message: string; created_at: string; sender_id: string };
type RequestConversation = {
  id: string;
  destination_city: string | null;
  destination_country: string | null;
  request_messages: Message[];
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      try {
        const response = await fetch("/api/requests");
        const body = await response.json();
        if (!response.ok || !body.success) {
          throw new Error(body.error?.message || "Unable to load requests.");
        }
        const details = await Promise.all(
          (body.data as RequestConversation[]).map(async (request) => {
            const detailResponse = await fetch(`/api/requests/${request.id}`);
            const detail = await detailResponse.json();
            if (!detailResponse.ok || !detail.success) {
              throw new Error(detail.error?.message || "Unable to load conversations.");
            }
            return detail.data as RequestConversation;
          }),
        );
        if (active) setRequests(details);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load messages.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadConversations();
    return () => {
      active = false;
    };
  }, []);

  const conversations = useMemo(
    () =>
      requests
        .filter((request) => request.request_messages?.length)
        .map((request) => ({
          ...request,
          latest: request.request_messages[request.request_messages.length - 1],
        }))
        .sort((left, right) => new Date(right.latest.created_at).getTime() - new Date(left.latest.created_at).getTime()),
    [requests],
  );
  const totalMessages = conversations.reduce((total, request) => total + request.request_messages.length, 0);

  return (
    <main className="portal-page min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <PortalPageHeader
          eyebrow="TISA CONCIERGE"
          title="Messages"
          description="Every conversation stays connected to the journey it belongs to, so the right details are easy to find."
        >
          <div className="grid grid-cols-2 gap-2">
            <MiniStat icon={MessagesSquare} label="Conversations" value={loading ? "—" : String(conversations.length)} />
            <MiniStat icon={MessageCircle} label="Messages" value={loading ? "—" : String(totalMessages)} />
          </div>
        </PortalPageHeader>

        {error && (
          <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-700 dark:text-rose-200">
            <span>{error}</span>
            <button type="button" onClick={() => window.location.reload()} className="text-xs font-semibold underline underline-offset-4">Try again</button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading messages">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-[20px] border border-border bg-surface motion-reduce:animate-none" />)}
          </div>
        ) : conversations.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {conversations.map((conversation) => (
              <Link key={conversation.id} href={`/account/requests/${conversation.id}`} className="group rounded-[20px] border border-border bg-surface/90 p-4 shadow-[0_8px_24px_rgba(1,9,17,0.1)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 motion-reduce:transform-none sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-700 dark:text-violet-200">
                    <MessageCircle aria-hidden="true" className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                      {getDestinationLabel(conversation.destination_city, conversation.destination_country)}
                    </h2>
                    <p className="mt-1 text-[11px] text-muted">
                      {conversation.request_messages.length} message{conversation.request_messages.length === 1 ? "" : "s"} in this conversation
                    </p>
                  </div>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>

                <div className="mt-4 rounded-xl border border-border bg-background/45 p-3.5">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${conversation.latest.sender_id === user?.id ? "bg-primary-soft text-primary" : "bg-emerald-400/10 text-emerald-700 dark:text-emerald-200"}`}>
                      {conversation.latest.sender_id === user?.id ? "Your message" : "TISA team"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted">
                      <Clock3 aria-hidden="true" className="h-3 w-3" />
                      {new Date(conversation.latest.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                  <p className="line-clamp-3 break-words text-xs leading-5 text-foreground/85">{conversation.latest.message}</p>
                </div>
                <p className="mt-3 text-xs font-semibold text-primary">Open conversation <span aria-hidden="true">→</span></p>
              </Link>
            ))}
          </div>
        ) : (
          <PortalEmptyState
            icon={MessageCircle}
            emoji="💬"
            title="No conversations just yet"
            description="When you or the TISA team send a message about a request, the latest update will show here."
            action={{ label: "View my requests", href: "/account/requests" }}
          />
        )}
      </section>
    </main>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof MessagesSquare; label: string; value: string }) {
  return (
    <div className="flex min-w-[112px] items-center gap-2.5 rounded-xl border border-border bg-background/45 px-3 py-2.5">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
      <span><strong className="block text-sm font-semibold text-foreground">{value}</strong><span className="block text-[10px] text-muted">{label}</span></span>
    </div>
  );
}
