import { Attendee, AttendeeRole } from "@/entity/Attendee";
import {
  DatabaseConnectionToken,
  IDatabaseConnection,
} from "@/infra/DatabaseConnection";
import { AttendeeRepository } from "@/usecase/interface";
import { createHash } from "crypto";
import { sql } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

type AttendeeSchema = {
  token: string;
  display_name: string;
  first_used_at: number | null;
  role: string;
  metadata: string;
};

@injectable()
export class DoAttendeeRepository implements AttendeeRepository {
  constructor(
    @inject(DatabaseConnectionToken)
    private readonly connection: IDatabaseConnection,
  ) {}

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
          role = ${attendee.role},
          metadata = ${JSON.stringify(attendee.metadata)}
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
      const originalDate = new Date(row.first_used_at * 1000);
      attendee.checkIn(originalDate);
    }

    if (row.metadata) {
      try {
        const parsedMetadata = JSON.parse(row.metadata);
        attendee.setAllMetadata(parsedMetadata);
      } catch {
        attendee.setAllMetadata({});
      }
    }

    return attendee;
  }
}
