import { SQLWrapper } from "drizzle-orm";
import { SQLiteDialect, SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import {
  IKvDatabaseConnection,
  ISqlDatabaseConnection,
} from "./DatabaseConnection";

export interface DurableDatabase {
  executeAll<T>(raw: string): Promise<T[]>;
  getValue<T>(key: string): Promise<T | null>;
  setValue<T>(key: string, value: T): Promise<void>;
}

export class DatabaseConnector<
    T extends Rpc.DurableObjectBranded & DurableDatabase,
  >
  implements ISqlDatabaseConnection, IKvDatabaseConnection
{
  private readonly dialect: SQLiteDialect = new SQLiteSyncDialect();

  constructor(private readonly database: DurableObjectStub<T>) {}

  static build<T extends Rpc.DurableObjectBranded & DurableDatabase>(
    ns: DurableObjectNamespace<T>,
    name: string,
  ): DatabaseConnector<T> {
    const id = ns.idFromName(name);
    const stub = ns.get(id);
    return new DatabaseConnector<T>(stub);
  }

  async executeAll<T>(wrapper: SQLWrapper): Promise<T[]> {
    const theSQL = wrapper.getSQL();
    const { sql } = this.dialect.sqlToQuery(theSQL.inlineParams());

    return this.database.executeAll(sql);
  }

  async getValue<T>(key: string): Promise<T | null> {
    return this.database.getValue(key);
  }

  async setValue<T>(key: string, value: T): Promise<void> {
    return this.database.setValue(key, value);
  }
}
