import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().min(10, "Phone number is required"),
  role: z.enum(["USER", "OWNER"]).default("USER"),
  ownerType: z.enum(["INDIVIDUAL", "BROKER"]).optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
