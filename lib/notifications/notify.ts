import { createClient } from "@/lib/supabase/server";
import type { NotificationChannel, NotificationInput } from "@/lib/notifications/types";
import { notificationProviders } from "@/lib/notifications/providers";

export async function notifyCustomer(input: NotificationInput) {
  const supabase = await createClient();
  const channels = input.channels ?? ["in_app"];
  const { data: profile } = await supabase.from("profiles").select("email,phone").eq("id", input.userId).single();
  const metadata = { ...(input.metadata ?? {}), email: profile?.email ?? null, phone: profile?.phone ?? null };
  const { data: preferences } = await supabase.from("notification_preferences").select("channel,enabled").eq("user_id", input.userId).eq("notification_type", input.type);
  const disabled = new Set((preferences ?? []).filter((item) => item.enabled === false).map((item) => item.channel));
  const effectiveChannels = channels.filter((channel) => !disabled.has(channel));

  const { data: notification, error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    related_request_id: input.relatedRequestId ?? null,
    metadata,
  }).select("id").single();
  if (error || !notification) throw error ?? new Error("Unable to create notification.");

  for (const channel of effectiveChannels) {
    const { data: delivery } = await supabase.from("notification_deliveries").insert({ notification_id: notification.id, channel, status: channel === "in_app" ? "delivered" : "queued" }).select("id").single();
    if (!delivery || channel === "in_app") continue;

    const provider = notificationProviders[channel as Exclude<NotificationChannel, "in_app">];
    if (!provider.configured()) {
      await supabase.from("notification_deliveries").update({ status: "not_configured", error_message: "Provider credentials are not configured.", completed_at: new Date().toISOString() }).eq("id", delivery.id);
      continue;
    }

    await supabase.from("notification_deliveries").update({ status: "processing", started_at: new Date().toISOString() }).eq("id", delivery.id);
    try {
      const status = await provider.send({ deliveryId: delivery.id, userId: input.userId, title: input.title, message: input.message, metadata });
      await supabase.from("notification_deliveries").update({ status, completed_at: new Date().toISOString() }).eq("id", delivery.id);
    } catch (providerError) {
      await supabase.from("notification_deliveries").update({ status: "failed", error_message: providerError instanceof Error ? providerError.message : "Provider delivery failed.", completed_at: new Date().toISOString() }).eq("id", delivery.id);
    }
  }

  return notification.id as string;
}
