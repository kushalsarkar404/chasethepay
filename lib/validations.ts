import { z } from "zod";

export const chaseSendSchema = z.object({
  invoiceId: z.string().uuid(),
});

export const settingsUpdateSchema = z.object({
  sender_name: z.string().min(1, "Sender name is required").max(100),
  ai_tone: z.enum(["friendly", "professional", "firm"]).optional(),
  chase_frequency: z.enum(["1min", "1day", "3days", "weekly"]).optional(),
  max_chases: z.number().int().min(1).max(20).optional(),
  reply_to_email: z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : v),
      z.union([z.string().email("Invalid email").max(255), z.null()])
    )
    .optional(),
});
