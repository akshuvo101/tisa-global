import type { EventProvider } from "@/lib/integrations/types";
import { normalizeEvent } from "@/lib/integrations/events/normalize";

function configured() {
  return Boolean(process.env.TISA_EVENT_PROVIDER_URL);
}

export const httpJsonEventProvider: EventProvider = {
  key: "http-json-events",
  name: "Configured Event API",
  configured,
  async fetchEvents() {
    const url = process.env.TISA_EVENT_PROVIDER_URL;
    if (!url) return [];
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(process.env.TISA_EVENT_PROVIDER_API_KEY ? { Authorization: `Bearer ${process.env.TISA_EVENT_PROVIDER_API_KEY}` } : {}),
      },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Event provider returned HTTP ${response.status}`);
    const body = await response.json() as unknown;
    const rows = Array.isArray(body) ? body : (body && typeof body === "object" && Array.isArray((body as { events?: unknown[] }).events) ? (body as { events: unknown[] }).events : []);
    return rows.map((row) => row && typeof row === "object" ? normalizeEvent(row as Record<string, unknown>, { name: this.name, type: "api", url }) : null).filter((item): item is NonNullable<typeof item> => Boolean(item));
  },
};
