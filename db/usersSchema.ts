
import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    twoFactorAuthSecret: text("2fa_secret"),
    twoFactorAuthActivated: boolean("2fa_activated").default(false)
});