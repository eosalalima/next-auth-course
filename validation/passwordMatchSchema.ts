import { z } from "zod";
import { passwordSchema } from "@/validation/passwordSchema";

export const passwordMatchSchema = z.object({
    password: passwordSchema,
    confirmPassword: z.string()
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirmPassword'],
            message: "Passwords do not match"
        });
    }
});