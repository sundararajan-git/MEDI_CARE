import { z } from "zod";

export const medicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dosage: z.string().min(1, "Dosage is required"),
  reminder_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
});

export type MedicationFormData = z.infer<typeof medicationSchema>;

export const uuidSchema = z.string().uuid("Invalid ID format");
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)");
