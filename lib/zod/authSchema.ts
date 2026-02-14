import { z } from "zod"

export const loginSchema = z.object({
    email:
        z.string()
            .email("Invalid email address")
            .trim(),

    password:
        z.string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[a-z]/, "Must contain a lowercase letter")
            .regex(/[A-Z]/, "Must contain an uppercase letter")
            .regex(/\d/, "Must contain a number")
            .regex(/[@$!%*?&]/, "Must contain a special character"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const signupSchema = z.object({
    email:
        z.string()
            .email("Invalid email address")
            .trim(),

    password:
        z.string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[a-z]/, "Must contain a lowercase letter")
            .regex(/[A-Z]/, "Must contain an uppercase letter")
            .regex(/\d/, "Must contain a number")
            .regex(/[@$!%*?&]/, "Must contain a special character"),

    confirmPassword:
        z.string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[a-z]/, "Must contain a lowercase letter")
            .regex(/[A-Z]/, "Must contain an uppercase letter")
            .regex(/\d/, "Must contain a number")
            .regex(/[@$!%*?&]/, "Must contain a special character"),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type SignupFormData = z.infer<typeof signupSchema>