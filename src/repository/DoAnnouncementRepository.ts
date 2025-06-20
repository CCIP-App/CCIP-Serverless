import { Announcement, AnnouncementLocale } from "@/entity/Announcement";
import { AttendeeRole } from "@/entity/Attendee";
import {
  DatabaseConnectionToken,
  IDatabaseConnection,
} from "@/infra/DatabaseConnection";
import { AnnouncementRepository } from "@/usecase/interface";
import { sql } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

type AnnouncementSchema = {
  id: number;
  announced_at: number;
  message: Record<string, string>;
  uri: string;
  roles: string[];
};

@injectable()
export class DoAnnouncementRepository implements AnnouncementRepository {
  constructor(
    @inject(DatabaseConnectionToken)
    private readonly connection: IDatabaseConnection,
  ) {}

  async findAnnouncementsByRole(role: AttendeeRole): Promise<Announcement[]> {
    const res = (await this.connection.executeAll(sql`
      SELECT * FROM announcements 
      WHERE json_array_length(roles) = 0 
         OR EXISTS (
           SELECT 1 FROM json_each(roles) 
           WHERE json_each.value = ${role}
         )
      ORDER BY announced_at DESC
    `)) as AnnouncementSchema[];

    return res.map((row) => this.mapToEntity(row));
  }

  async create(announcement: Announcement): Promise<void> {
    await this.connection.executeAll(sql`
      INSERT INTO announcements (id, announced_at, message, uri, roles)
      VALUES (
        ${announcement.id},
        ${announcement.publishedAt ? Math.floor(announcement.publishedAt.getTime() / 1000) : Math.floor(Date.now() / 1000)},
        ${JSON.stringify(announcement.allMessages())},
        ${announcement.uri},
        ${JSON.stringify(announcement.roles)}
      )
    `);
  }

  private mapToEntity(row: AnnouncementSchema): Announcement {
    const announcement = new Announcement(row.id.toString(), row.uri);

    // Set messages
    const messages =
      typeof row.message === "object"
        ? row.message
        : JSON.parse(row.message as string);
    if (messages["en-US"]) {
      announcement.setMessage(AnnouncementLocale.EN, messages["en-US"]);
    }
    if (messages["zh-TW"]) {
      announcement.setMessage(AnnouncementLocale.ZH_TW, messages["zh-TW"]);
    }

    // Set publication time
    announcement.publish(new Date(row.announced_at * 1000));

    // Set readable roles
    const rolesArray = Array.isArray(row.roles)
      ? row.roles
      : JSON.parse(row.roles as string);
    const attendeeRoles = rolesArray
      .map((role: string) =>
        role === "staff"
          ? AttendeeRole.STAFF
          : role === "audience"
            ? AttendeeRole.AUDIENCE
            : null,
      )
      .filter(
        (role: AttendeeRole | null): role is AttendeeRole => role !== null,
      );

    if (attendeeRoles.length > 0) {
      announcement.readableBy(...attendeeRoles);
    }

    return announcement;
  }
}
