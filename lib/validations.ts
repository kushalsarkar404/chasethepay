import { z } from "zod";

export const chaseSendSchema = z.object({
  invoiceId: z.string().uuid(),
});

export const settingsUpdateSchema = z.object({
  sender_name: z.string().min(1, "Sender name is required").max(100),
  ai_tone: z.enum(["friendly", "professional", "firm"]).optional(),
  chase_frequency: z.enum(["1min", "1day", "3days", "weekly"]).optional(),
  max_chases: z.number().int().min(1).max(20).optional(),
  from_email: z.string().email().nullable().optional(),
});
