import type { IntegrationSource } from "@/lib/integrations/types";
import { httpJsonEventProvider } from "@/lib/integrations/events/providers/http-json";

export const integrationSources: IntegrationSource[] = [
  { key: "http-json-events", name: "Configured Event API", kind: "events", enabled: true, configured: httpJsonEventProvider.configured(), description: "Source-backed event feed. Records are normalized and verified before publication." },
  { key: "email-resend", name: "Resend Email", kind: "email", enabled: true, configured: Boolean(process.env.RESEND_API_KEY), description: "Transactional email delivery through Resend when credentials are configured." },
  { key: "whatsapp-webhook", name: "WhatsApp Adapter", kind: "whatsapp", enabled: true, configured: Boolean(process.env.TISA_WHATSAPP_WEBHOOK_URL), description: "Provider-neutral WhatsApp delivery adapter; no message is sent without a configured provider." },
  { key: "flight-provider", name: "Flight Provider", kind: "flights", enabled: false, configured: Boolean(process.env.TISA_FLIGHT_PROVIDER_URL), description: "Future flight availability/pricing provider." },
  { key: "hotel-provider", name: "Hotel Provider", kind: "hotels", enabled: false, configured: Boolean(process.env.TISA_HOTEL_PROVIDER_URL), description: "Future hotel availability/pricing provider." },
  { key: "visa-provider", name: "Visa Provider", kind: "visa", enabled: false, configured: Boolean(process.env.TISA_VISA_PROVIDER_URL), description: "Future visa information/provider integration." },
];

export function getIntegrationSource(key: string) {
  return integrationSources.find((source) => source.key === key) ?? null;
}
