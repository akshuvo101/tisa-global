export type NotificationChannel = "in_app" | "email" | "whatsapp";
export type DeliveryStatus = "queued" | "processing" | "sent" | "delivered" | "failed" | "not_configured";

export type NotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedRequestId?: string | null;
  metadata?: Record<string, unknown>;
  channels?: NotificationChannel[];
};
