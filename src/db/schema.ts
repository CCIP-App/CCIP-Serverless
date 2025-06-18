import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const attendees = sqliteTable("attendees", {
  token: text("token").primaryKey(),
  displayName: text("display_name"),
  firstUsedAt: integer("first_used_at", { mode: "timestamp" }),
});
