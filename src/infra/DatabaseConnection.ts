import { SQLWrapper } from "drizzle-orm";

export const DatabaseConnectionToken = Symbol("DatabaseConnection");
export const KvDatabaseConnectionToken = Symbol("KvDatabaseConnection");

export interface ISqlDatabaseConnection {
  executeAll<T>(wrapper: SQLWrapper): Promise<T[]>;
}

export interface IKvDatabaseConnection {
  getValue<T>(key: string): Promise<T | null>;
  setValue<T>(key: string, value: T): Promise<void>;
}
