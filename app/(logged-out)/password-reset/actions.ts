"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { passwordResetTokens, users } from "@/db/schema";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

export const passwordReset = async (emailAddress: string) => {
    const session = await auth();

    if (!!session?.user?.id) {
        return {
            error: true,
            message:
                "You are already logged in. Please log out to reset your password.",
        };
    }

    const [user] = await db
        .select({
            id: users.id,
        })
        .from(users)
        .where(eq(users.email, emailAddress));

    if (!user) {
        return;
    }

    const passwordResetToken = randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    await db
        .insert(passwordResetTokens)
        .values({
            userId: user.id,
            token: passwordResetToken,
            tokenExpiry,
        })
        .onConflictDoUpdate({
            target: passwordResetTokens.userId,
            set: {
                token: passwordResetToken,
                tokenExpiry,
            },
        });

    console.log(
        `Password reset token for ${emailAddress}: ${passwordResetToken}`
    );
};
