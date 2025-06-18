import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";

export class EventDatabase extends DurableObject {
  private readonly _storage: DurableObjectStorage;
  private readonly _drizzle: DrizzleSqliteDODatabase;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this._storage = ctx.storage;
    this._drizzle = drizzle(this._storage, { logger: false });
  }
}
