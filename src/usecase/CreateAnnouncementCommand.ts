import { Announcement } from "@/entity/Announcement";
import { AttendeeRole } from "@/entity/Attendee";
import { Locale } from "@/entity/Locale";
import { AnnouncementRepository, IDatetimeService } from "@/usecase/interface";
import { randomUUID } from "crypto";

export class CreateAnnouncementCommand {
  constructor(
    private readonly announcementRepository: AnnouncementRepository,
    private readonly datetimeService: IDatetimeService,
  ) {}

  async execute(
    msgEn: string,
    msgZh: string,
    uri: string,
    roles: string[],
  ): Promise<void> {
    const announcement = new Announcement(randomUUID(), uri);

    announcement.setMessage(Locale.EnUs, msgEn);
    announcement.setMessage(Locale.ZhTw, msgZh);

    const currentTime = this.datetimeService.getCurrentTime();
    announcement.publish(currentTime);

    const attendeeRoles = roles
      .map((role) => {
        if (role === "staff") return AttendeeRole.STAFF;
        if (role === "audience") return AttendeeRole.AUDIENCE;
        return null;
      })
      .filter((role): role is AttendeeRole => role !== null);

    if (attendeeRoles.length > 0) {
      announcement.readableBy(...attendeeRoles);
    }

    await this.announcementRepository.create(announcement);
  }
}
