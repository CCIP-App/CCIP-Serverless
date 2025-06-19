import { Announcement, AnnouncementLocale } from "@/entity/Announcement";
import { AnnouncementRepository } from "@/usecase/interface";

export class HardcodedAnnouncementRepository implements AnnouncementRepository {
  private announcements: Map<string, { announcement: Announcement; roles: string[] }> = new Map();

  constructor() {
    // Start with empty data - will be seeded by test scenarios when needed
  }

  private seedData(): void {
    // Announcement 1: audience only
    const announcement1 = new Announcement(
      "40422d68-405d-4142-979e-bce8003dcb18",
      "https://testability.opass.app/announcements/1"
    );
    announcement1.setMessage(AnnouncementLocale.EN, "hello world 1");
    announcement1.setMessage(AnnouncementLocale.ZH_TW, "世界你好 1");
    announcement1.publish(new Date("2023-08-29 00:00:00 GMT+0"));
    this.announcements.set(announcement1.id, { announcement: announcement1, roles: ["audience"] });

    // Announcement 2: audience and staff
    const announcement2 = new Announcement(
      "04058f51-09ad-4008-b767-e72086c37561",
      "https://testability.opass.app/announcements/2"
    );
    announcement2.setMessage(AnnouncementLocale.EN, "hello world 2");
    announcement2.setMessage(AnnouncementLocale.ZH_TW, "世界你好 2");
    announcement2.publish(new Date("2023-08-30 00:00:00 GMT+0"));
    this.announcements.set(announcement2.id, { announcement: announcement2, roles: ["audience", "staff"] });

    // Announcement 3: staff only
    const announcement3 = new Announcement(
      "a163302b-32d9-4e80-a0b3-7b8ee8b1e932",
      "https://testability.opass.app/announcements/3"
    );
    announcement3.setMessage(AnnouncementLocale.EN, "hello staff");
    announcement3.setMessage(AnnouncementLocale.ZH_TW, "工作人員你好");
    announcement3.publish(new Date("2023-08-31 01:00:00 GMT+0"));
    this.announcements.set(announcement3.id, { announcement: announcement3, roles: ["staff"] });
  }

  async findAnnouncementsByRoles(roles: string[]): Promise<Announcement[]> {
    const result: Announcement[] = [];
    
    for (const { announcement, roles: announcementRoles } of this.announcements.values()) {
      // Check if any of the provided roles match the announcement's roles
      if (roles.some(role => announcementRoles.includes(role))) {
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