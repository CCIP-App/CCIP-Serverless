import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const attendees = sqliteTable("attendees", {
  token: text("token").primaryKey(),
  displayName: text("display_name"),
  firstUsedAt: integer("first_used_at", { mode: "timestamp" }),
  role: text("role", { enum: ["staff", "audience"] })
    .notNull()
    .default("audience"),
});

export const announcements = sqliteTable("announcements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  announcedAt: integer("announced_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
  message: text("message", { mode: "json" }).notNull().default("{}"),
  uri: text("uri"),
  roles: text("roles", { mode: "json" }).notNull().default("[]"),
});
