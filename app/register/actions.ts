'use server';

import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import z from "zod";

export const registerUser = async ({email, password, confirmPassword} : {email: string, password: string, confirmPassword: string}) => {
    const newUserSchema = z.object({
        email: z.email("Invalid email address"),
    }).and(passwordMatchSchema)

    const newUserValidation = newUserSchema.safeParse({email, password, confirmPassword});

    if (!newUserValidation.success) {
        return {
            error: true,
            message: newUserValidation.error.issues[0]?.message ?? "An error occurred",
        };
    }
};