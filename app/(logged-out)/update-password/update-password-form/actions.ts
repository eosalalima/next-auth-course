"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { passwordResetTokens, users } from "@/db/schema";
import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

export const updatePassword = async ({
    token,
    password,
    passwordConfirm,
}: {
    token: string;
    password: string;
    passwordConfirm: string;
}) => {
    console.log("raw values:", { token, password, passwordConfirm });

    const passwordValidation = passwordMatchSchema.safeParse({
        password,
        passwordConfirm,
    });

    console.log("Password validation result:", passwordValidation);

    if (!passwordValidation.success) {
        return {
            error: true,
            message:
                passwordValidation.error.issues[0]?.message ||
                "An error occurred.",
        };
    }

    const session = await auth();

    if (session?.user?.id) {
        return {
            error: true,
            message: "Already logged in. Please log out to resetyour password.",
        };
    }

    let tokenIsValid = false;

    console.log("Received token:", token);

    if (token) {
        const [passwordResetToken] = await db
            .select()
            .from(passwordResetTokens)
            .where(eq(passwordResetTokens.token, token));

        console.log("Checkpoint 1:", passwordResetToken);

        const now = Date.now();

        if (
            !!passwordResetToken?.tokenExpiry &&
            now < passwordResetToken.tokenExpiry.getTime()
        ) {
            tokenIsValid = true;
        }

        if (!tokenIsValid) {
            return {
                error: true,
                message: "Your token is invalid or has expired.",
                tokenInvalid: true,
            };
        }

        const hashedPassword = await hash(password, 10);
        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, passwordResetToken.userId!));

        console.log("Hashed Password:", hashedPassword);
    }
};
