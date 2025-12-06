import db from "@/db/drizzle";
import { passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function validateResetToken(token: string) {
    const [passwordResetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token));

    if (!passwordResetToken?.tokenExpiry) return false;

    const now = Date.now(); // OK here, this file is not a React component
    return now < passwordResetToken.tokenExpiry.getTime();
}
