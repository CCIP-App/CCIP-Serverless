import { Attendee } from "@/entity/Attendee";
import { Announcement } from "@/entity/Announcement";

export const AttendeeRepositoryToken = Symbol("AttendeeRepository");

export interface AttendeeRepository {
  findAttendeeByToken(token: string): Promise<Attendee | null>;
}

export const AnnouncementListPresenterToken = Symbol("AnnouncementListPresenter");

export interface AnnouncementListPresenter {
  addAnnouncement(announcement: Announcement): void;
}
