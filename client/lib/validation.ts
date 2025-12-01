import { z } from "zod"

export const emailSchema = z.object({
  email: z.string().email({message: "Email is invalid"}),
})

export const otpSchema = z.object({
  otp: z.string().min(6, {message: "Maximum length must be 6 character"}),
}).merge(emailSchema)