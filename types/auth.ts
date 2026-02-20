import { z } from "zod";

// Login form schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

// Register form schema
export const registerSchema = z
  .object({
    full_name: z.string().min(5, "Name must be at least 5 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login form type
export type LoginFormData = z.infer<typeof loginSchema>;

// Register form type
export type RegisterFormData = z.infer<typeof registerSchema>;
