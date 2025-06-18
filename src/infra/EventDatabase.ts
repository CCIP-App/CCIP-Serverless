import * as Schema from "@/db/schema";
import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import migrations from "../../drizzle/migrations";

export class EventDatabase extends DurableObject {
  private readonly _connection: DrizzleSqliteDODatabase<typeof Schema>;
  private readonly _storage: DurableObjectStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this._storage = ctx.storage;
    this._connection = drizzle(this._storage, { logger: false });

    ctx.blockConcurrencyWhile(async () => {
      await this._migrate();
    });
  }

  private async _migrate() {
    migrate(this._connection, migrations);
  }
}
