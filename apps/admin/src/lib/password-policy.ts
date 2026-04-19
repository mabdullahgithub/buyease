import { z } from "zod";

/**
 * Strong password rules for super-admin accounts.
 */
export const adminPasswordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

export type AdminPasswordInput = z.infer<typeof adminPasswordSchema>;
