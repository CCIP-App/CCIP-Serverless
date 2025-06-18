import { RpcTarget } from "cloudflare:workers";
import { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";

import * as Schema from "@/db/schema";

export class DoAttendeeRepository extends RpcTarget {
  constructor(
    private readonly connection: DrizzleSqliteDODatabase<typeof Schema>,
  ) {
    super();
  }

  async findAttendeeByToken(token: string) {
    return this.connection.query.attendees.findFirst({
      where: (attendee, { eq }) => eq(attendee.token, token),
    });
  }

  async save(attendee: { token: string; displayName: string }) {
    return this.connection.insert(Schema.attendees).values(attendee);
  }
}
