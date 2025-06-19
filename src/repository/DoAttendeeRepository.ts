import { DatabaseConnector } from "@/infra/DatabaseConnector";
import { EventDatabase } from "@/infra/EventDatabase";
import { sql } from "drizzle-orm";

type AttendeeSchema = {
  token: string;
  display_name: string;
  first_used_at: number;
};

export class DoAttendeeRepository {
  constructor(private readonly connection: DatabaseConnector<EventDatabase>) {}

  async findAttendeeByToken(token: string): Promise<AttendeeSchema | null> {
    const res = (await this.connection.executeAll(sql`
      SELECT * FROM attendees WHERE token = ${token} LIMIT 1
    `)) as AttendeeSchema[];

    return res.length > 0 ? res[0] : null;
  }
}
