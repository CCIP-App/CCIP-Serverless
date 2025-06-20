import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";

import * as schema from "@/db/schema";
import migrations from "../../drizzle/migrations";
import { DurableDatabase } from "./DatabaseConnector";

export class EventDatabase extends DurableObject implements DurableDatabase {
  private readonly _connection: DrizzleSqliteDODatabase<typeof schema>;
  private readonly _storage: DurableObjectStorage;
  private static readonly EXPIRATION_DAYS = 30;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this._storage = ctx.storage;
    this._connection = drizzle(this._storage, {
      schema: schema,
      logger: false,
    });

    ctx.blockConcurrencyWhile(async () => {
      await this._migrate();
      await this._setExpiration();
    });
  }

  private async _migrate() {
    migrate(this._connection, migrations);
  }

  private async _setExpiration() {
    // Always set/update expiration to 30 days from now
    const expirationTime =
      Date.now() + EventDatabase.EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

    // Update the alarm (replaces any existing alarm)
    await this._storage.setAlarm(expirationTime);
  }

  async alarm() {
    // When alarm triggers, simply cleanup
    // The database hasn't been accessed for 30 days
    await this._cleanup();
  }

  private async _cleanup() {
    // Delete all storage and the alarm
    await this._storage.deleteAlarm();
    await this._storage.deleteAll();
    // Object will be destroyed when it becomes idle
  }

  async executeAll<T>(rawSql: string): Promise<T[]> {
    // Simple execution without refreshing expiration
    return this._connection.all(rawSql);
  }
}
