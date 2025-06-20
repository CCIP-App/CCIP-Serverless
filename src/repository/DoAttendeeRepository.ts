import { Attendee, AttendeeRole } from "@/entity/Attendee";
import { DatabaseConnector } from "@/infra/DatabaseConnector";
import { EventDatabase } from "@/infra/EventDatabase";
import { AttendeeRepository } from "@/usecase/interface";
import { createHash } from "crypto";
import { sql } from "drizzle-orm";

type AttendeeSchema = {
  token: string;
  display_name: string;
  first_used_at: number | null;
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

  async save(attendee: Attendee): Promise<void> {
    await this.connection.executeAll(sql`
      UPDATE attendees 
      SET display_name = ${attendee.displayName},
          first_used_at = ${attendee.firstUsedAt},
          role = ${attendee.role}
      WHERE token = ${attendee.token}
    `);
  }

  private mapToEntity(row: AttendeeSchema): Attendee {
    const publicToken = createHash("sha1").update(row.token).digest("hex");
    const attendee = new Attendee(row.token, row.display_name, publicToken);
    const role =
      row.role === "staff" ? AttendeeRole.STAFF : AttendeeRole.AUDIENCE;
    attendee.setRole(role);

    if (row.first_used_at) {
      attendee.checkIn(new Date(row.first_used_at * 1000));
    }

    return attendee;
  }
}
