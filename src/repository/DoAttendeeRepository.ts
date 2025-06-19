import { Attendee, AttendeeRole } from "@/entity/Attendee";
import { DatabaseConnector } from "@/infra/DatabaseConnector";
import { EventDatabase } from "@/infra/EventDatabase";
import { AttendeeRepository } from "@/usecase/interface";
import { sql } from "drizzle-orm";

type AttendeeSchema = {
  token: string;
  display_name: string;
  first_used_at: number;
  role: string;
};

export class DoAttendeeRepository implements AttendeeRepository {
  constructor(private readonly connection: DatabaseConnector<EventDatabase>) {}

  async findAttendeeByToken(token: string): Promise<Attendee | null> {
    const res = (await this.connection.executeAll(sql`
      SELECT * FROM attendees WHERE token = ${token} LIMIT 1
    `)) as AttendeeSchema[];

    return res.length > 0 ? this.mapToEntity(res[0]) : null;
  }

  private mapToEntity(row: AttendeeSchema): Attendee {
    const attendee = new Attendee(
      row.token,
      row.display_name,
      row.first_used_at,
    );
    const role =
      row.role === "staff" ? AttendeeRole.STAFF : AttendeeRole.AUDIENCE;
    attendee.setRole(role);
    return attendee;
  }
}
