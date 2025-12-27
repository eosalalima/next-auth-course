"use server";

import { auth } from "@/auth";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authenticator } from "otplib";
import db from "@/db/drizzle";

export const get2faSecret = async () => {
    const session = await auth();

    if (!session?.user?.id) {
        return {
            error: true,
            message: "Unauthorized",
        };
    }

    const [user] = await db
        .select({
            twoFactorAuthSecret: users.twoFactorAuthSecret,
        })
        .from(users)
        .where(eq(users.id, parseInt(session.user.id)));

    if (!user) {
        return {
            error: true,
            message: "User not found",
        };
    }

    let twoFactorSecret = user.twoFactorAuthSecret;

    if (!twoFactorSecret) {
        twoFactorSecret = authenticator.generateSecret();
        await db
            .update(users)
            .set({
                twoFactorAuthSecret: twoFactorSecret,
            })
            .where(eq(users.id, parseInt(session.user.id)));
    }

    return {
        twoFactorSecret: authenticator.keyuri(
            session.user.email ?? "",
            "NextAuthCourse",
            twoFactorSecret
        ),
    };
};

export const activate2fa = async (token: string) => {
    const session = await auth();

    if (!session?.user?.id) {
        return {
            error: true,
            message: "Unauthorized",
        };
    }

    const [user] = await db
        .select({
            twoFactorAuthSecret: users.twoFactorAuthSecret,
        })
        .from(users)
        .where(eq(users.id, parseInt(session.user.id)));

    if (!user) {
        return {
            error: true,
            message: "User not found",
        };
    }

    if (user.twoFactorAuthSecret) {
        const tokenValid = authenticator.check(token, user.twoFactorAuthSecret);

        if (!tokenValid) {
            return {
                error: true,
                message: "Invalid OTP",
            };
        }

        await db
            .update(users)
            .set({
                twoFactorAuthActivated: true,
            })
            .where(eq(users.id, parseInt(session.user.id)));
    }
};

export const disable2fa = async () => {
    const session = await auth();

    if (!session?.user?.id) {
        return {
            error: true,
            message: "Unauthorized",
        };
    }

    await db
        .update(users)
        .set({
            twoFactorAuthActivated: false,
        })
        .where(eq(users.id, parseInt(session.user.id)));
};
