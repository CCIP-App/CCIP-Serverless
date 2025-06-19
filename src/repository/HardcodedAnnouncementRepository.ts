import { Announcement, AnnouncementLocale } from "@/entity/Announcement";
import { AttendeeRole } from "@/entity/Attendee";
import { AnnouncementRepository } from "@/usecase/interface";

export class HardcodedAnnouncementRepository implements AnnouncementRepository {
  private announcements: Map<string, Announcement> = new Map();

  constructor() {
    // Start with empty data - will be seeded by test scenarios when needed
  }

  private seedData(): void {
    // Announcement 1: audience (staff can also read audience announcements)
    const announcement1 = new Announcement(
      "40422d68-405d-4142-979e-bce8003dcb18",
      "https://testability.opass.app/announcements/1"
    );
    announcement1.setMessage(AnnouncementLocale.EN, "hello world 1");
    announcement1.setMessage(AnnouncementLocale.ZH_TW, "世界你好 1");
    announcement1.publish(new Date("2023-08-29 00:00:00 GMT+0"));
    announcement1.readableBy(AttendeeRole.AUDIENCE, AttendeeRole.STAFF);
    this.announcements.set(announcement1.id, announcement1);

    // Announcement 2: audience and staff (staff can read audience announcements)
    const announcement2 = new Announcement(
      "04058f51-09ad-4008-b767-e72086c37561",
      "https://testability.opass.app/announcements/2"
    );
    announcement2.setMessage(AnnouncementLocale.EN, "hello world 2");
    announcement2.setMessage(AnnouncementLocale.ZH_TW, "世界你好 2");
    announcement2.publish(new Date("2023-08-30 00:00:00 GMT+0"));
    announcement2.readableBy(AttendeeRole.AUDIENCE, AttendeeRole.STAFF);
    this.announcements.set(announcement2.id, announcement2);

    // Announcement 3: staff only
    const announcement3 = new Announcement(
      "a163302b-32d9-4e80-a0b3-7b8ee8b1e932",
      "https://testability.opass.app/announcements/3"
    );
    announcement3.setMessage(AnnouncementLocale.EN, "hello staff");
    announcement3.setMessage(AnnouncementLocale.ZH_TW, "工作人員你好");
    announcement3.publish(new Date("2023-08-31 01:00:00 GMT+0"));
    announcement3.readableBy(AttendeeRole.STAFF);
    this.announcements.set(announcement3.id, announcement3);
  }

  async findAnnouncementsByRole(role: AttendeeRole): Promise<Announcement[]> {
    const result: Announcement[] = [];
    
    for (const announcement of this.announcements.values()) {
      // Check if the provided role can read this announcement
      if (announcement.isReadable(role)) {
        result.push(announcement);
      }
    }
    
    return result;
  }

  // Method for testing - seed hardcoded data
  seedTestData(): void {
    this.seedData();
  }
}