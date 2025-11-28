'use server';

import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { z } from "zod";

const newUserSchema = z
    .object({
        email: z.string().email("Invalid email address"),
    })
    .and(passwordMatchSchema);

export const registerUser = async ({
    email,
    password,
    confirmPassword,
}: {
    email: string;
    password: string;
    confirmPassword: string;
}) => {
    const newUserValidation = newUserSchema.safeParse({ email, password, confirmPassword });

    if (!newUserValidation.success) {
        return {
            error: true,
            message: newUserValidation.error.issues[0]?.message ?? "An error occurred",
        } as const;
    }

    return { success: true } as const;
};
