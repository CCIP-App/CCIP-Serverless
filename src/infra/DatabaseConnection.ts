import { SQLWrapper } from "drizzle-orm";

export const DatabaseConnectionToken = Symbol("DatabaseConnection");

export interface IDatabaseConnection {
  executeAll<T>(wrapper: SQLWrapper): Promise<T[]>;
}
