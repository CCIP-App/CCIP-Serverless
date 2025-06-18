import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite", // 'mysql' | 'sqlite' | 'turso'
  driver: "durable-sqlite",
  schema: "./src/db/schema.ts",
});
