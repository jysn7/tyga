import { z } from "zod"

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be at most 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email")
      .max(254, "Email must be at most 254 characters")
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SignUpValues = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(254, "Email must be at most 254 characters")
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
})
export type SignInValues = z.infer<typeof signInSchema>
