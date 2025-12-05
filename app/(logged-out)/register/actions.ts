'use server';

import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { z } from "zod";
import { hash } from "bcryptjs";
import db from "@/db/drizzle";
import { users } from "@/db/schema";

export const registerUser = async ({email, password, confirmPassword} : {email: string, password: string, confirmPassword: string}) => {
    try {
        const newUserSchema = z.object({
            email: z.string().email("Invalid email address"),
        }).and(passwordMatchSchema);
    
        const newUserValidation = newUserSchema.safeParse({email, password, confirmPassword});
    
        if (!newUserValidation.success) {
            return {
                error: true,
                message: newUserValidation.error.issues[0]?.message ?? "An error occurred",
            };
        }
        
        const hashedPassword = await hash(password, 10);
    
        await db.insert(users).values({
            email,
            password: hashedPassword,
        });
    } catch (e: any) {
        if (e?.code === "23505") {
            return {
                error: true,
                message: "User with this email already exists",
            };
        }

        return {            
            error: true,
            message: "An unexpected error occurred",
        }
    }
};