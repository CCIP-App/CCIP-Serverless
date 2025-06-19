import { AnnouncementListPresenter } from "@/usecase/interface";

export type AnnouncementData = {
  datetime: number;
  msgEn: string;
  msgZh: string;
  uri: string;
};

export class JsonAnnouncementListPresenter implements AnnouncementListPresenter<AnnouncementData> {
  private announcements: AnnouncementData[] = [];

  addAnnouncement(announcement: AnnouncementData): void {
    this.announcements.push(announcement);
  }

  toJson(): AnnouncementData[] {
    return this.announcements;
  }
}