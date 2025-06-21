import { SQLWrapper } from "drizzle-orm";
import { SQLiteDialect, SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import { IDatabaseConnection } from "./DatabaseConnection";

export interface DurableDatabase {
  executeAll<T>(raw: string): Promise<T[]>;
}

export class DatabaseConnector<
  T extends Rpc.DurableObjectBranded & DurableDatabase,
> implements IDatabaseConnection
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
}
