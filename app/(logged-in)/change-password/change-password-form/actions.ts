"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { passwordSchema } from "@/validation/passwordSchema";
import { error } from "console";
import z from "zod";
import { users } from "@/db/usersSchema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const ChangePassword = async ({
    currentPassword,
    password,
    passwordConfirm
} : {
    currentPassword: string,
    password: string,
    passwordConfirm: string
}) => {

    const session = await auth();

    if (!session?.user?.id) {
        return {
            error: true,
            message: "You must be logged in to change your password."
        };
    }

    const formSchema = z.object({
        currentPassword: passwordSchema
    }).and(passwordMatchSchema);

    const passwordValidation = formSchema.safeParse({
        currentPassword,
        password,
        confirmPassword: passwordConfirm
    });

    if (passwordValidation.error) {
        return {
            error: true,
            message: "Password validation failed.",
            errors: passwordValidation?.error.issues?.[0]?.message ?? "An error occurred"
        };
    }

    const [user] = await db.select().from(users).where(eq(users.id, parseInt(session.user.id)));

    if (!user) {
        return {
            error: true,
            message: "User not found."
        };
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
        return {
            error: true,
            message: "Current password is incorrect."
        };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, parseInt(session.user.id)));

    return {
        error: false,
        message: "Password changed successfully."
    };
}