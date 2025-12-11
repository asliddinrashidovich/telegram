import { z } from "zod"

export const emailSchema = z.object({
  email: z.string().email({message: "Email is invalid"}),
})
export const oldEmailSchema = z.object({
  oldEmail: z.string().email({message: "Email is invalid"}),
}).merge(emailSchema)

export const otpSchema = z.object({
  otp: z.string().min(6, {message: "Maximum length must be 6 character"}),
}).merge(emailSchema)

export const messageSchema = z.object({
  text: z.string().min(1, {message: "Message cannot be empty"}),
  image: z.string().optional(),
})

export const profileSchema = z.object({
  firstName: z.string().min(2, {message: "First name cannot be empty"}),
  lastName: z.string().optional(),
  bio: z.string().optional()
})

export const confirmTextSchema = z.object({
  confirmText: z.string()
}).refine((data) => data.confirmText === "DELETE", {
  message: "Confirmation text does not match",
  path: ["confirmText"],
})