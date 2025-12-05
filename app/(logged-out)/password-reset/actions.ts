"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

export const passwordReset = async (emailAddress: string) => {
    const session = await auth();

    if (!!session?.user?.id) {
        return {
            error: true,
            message: "You are already logged in. Please log out to reset your password."   
        }
    }

    const [user] = await db.select({
        id: users.id
    }).from(users).where(eq(users.email, emailAddress));

    if (!user) {
        return;
    }

    const passwordResetToken = randomBytes(32).toString("hex");
    console.log(`Password reset token for ${emailAddress}: ${passwordResetToken}`);
}