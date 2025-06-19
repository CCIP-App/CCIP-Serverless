import { Announcement, AnnouncementLocale } from "@/entity/Announcement";
import { AnnouncementListPresenter } from "@/usecase/interface";

export type AnnouncementData = {
  datetime: number;
  msgEn: string;
  msgZh: string;
  uri: string;
};

export class JsonAnnouncementListPresenter
  implements AnnouncementListPresenter
{
  private announcements: Announcement[] = [];

  addAnnouncement(announcement: Announcement): void {
    this.announcements.push(announcement);
  }

  toJson(): AnnouncementData[] {
    return this.announcements.map((announcement) => ({
      datetime: announcement.publishedAt
        ? Math.floor(announcement.publishedAt.getTime() / 1000)
        : 0,
      msgEn: announcement.getMessage(AnnouncementLocale.EN) || "",
      msgZh: announcement.getMessage(AnnouncementLocale.ZH_TW) || "",
      uri: announcement.uri,
    }));
  }
}
