import { z } from "zod";

export const createRequestSchema = z.object({
  event_id: z.string().uuid().nullable().optional(),
  destination_country: z.string().trim().max(120).nullable().optional(),
  destination_city: z.string().trim().max(120).nullable().optional(),
  travel_start_date: z.string().date().nullable().optional(),
  travel_end_date: z.string().date().nullable().optional(),
  traveler_count: z.number().int().min(1).max(50).default(1),
  priority: z.enum(["normal", "high", "urgent"]).default("normal"),
  description: z.string().trim().min(10).max(5000),
  service_ids: z.array(z.string().uuid()).min(1).max(20),
}).superRefine((value, ctx) => {
  if (value.travel_start_date && value.travel_end_date && value.travel_end_date < value.travel_start_date) {
    ctx.addIssue({ code: "custom", path: ["travel_end_date"], message: "Travel end date cannot be before the start date." });
  }
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
