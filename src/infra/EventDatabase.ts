import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";

import * as schema from "@/db/schema";
import migrations from "../../drizzle/migrations";
import { DurableDatabase } from "./DatabaseConnector";

export class EventDatabase extends DurableObject implements DurableDatabase {
  private readonly _connection: DrizzleSqliteDODatabase<typeof schema>;
  private readonly _storage: DurableObjectStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this._storage = ctx.storage;
    this._connection = drizzle(this._storage, {
      schema: schema,
      logger: false,
    });

    ctx.blockConcurrencyWhile(async () => {
      await this._migrate();
    });
  }

  private async _migrate() {
    migrate(this._connection, migrations);
  }

  async executeAll<T>(rawSql: string): Promise<T[]> {
    return this._connection.all(rawSql);
  }
}
