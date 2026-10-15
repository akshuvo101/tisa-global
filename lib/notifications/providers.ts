import type { NotificationChannel, DeliveryStatus } from "@/lib/notifications/types";

export type DeliveryContext = {
  deliveryId: string;
  userId: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
};

export type NotificationProvider = {
  channel: NotificationChannel;
  configured(): boolean;
  send(context: DeliveryContext): Promise<DeliveryStatus>;
};

const emailProvider: NotificationProvider = {
  channel: "email",
  configured: () => Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
  async send(context) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) return "not_configured";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [String(context.metadata.email ?? "")], subject: context.title, text: context.message }),
    });
    return response.ok ? "sent" : "failed";
  },
};

const whatsappProvider: NotificationProvider = {
  channel: "whatsapp",
  configured: () => Boolean(process.env.TISA_WHATSAPP_WEBHOOK_URL),
  async send(context) {
    const url = process.env.TISA_WHATSAPP_WEBHOOK_URL;
    if (!url) return "not_configured";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.TISA_WHATSAPP_WEBHOOK_SECRET ? { "x-tisa-webhook-secret": process.env.TISA_WHATSAPP_WEBHOOK_SECRET } : {}) },
      body: JSON.stringify({ delivery_id: context.deliveryId, to: context.metadata.phone ?? null, title: context.title, message: context.message }),
    });
    return response.ok ? "sent" : "failed";
  },
};

export const notificationProviders: Record<Exclude<NotificationChannel, "in_app">, NotificationProvider> = {
  email: emailProvider,
  whatsapp: whatsappProvider,
};
