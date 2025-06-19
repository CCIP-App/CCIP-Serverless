import { Attendee, AttendeeRole } from "@/entity/Attendee";
import { Announcement } from "@/entity/Announcement";

export const AttendeeRepositoryToken = Symbol("AttendeeRepository");

export interface AttendeeRepository {
  findAttendeeByToken(token: string): Promise<Attendee | null>;
}

export const AnnouncementRepositoryToken = Symbol("AnnouncementRepository");

export interface AnnouncementRepository {
  findAnnouncementsByRole(role: AttendeeRole): Promise<Announcement[]>;
}

export const AnnouncementListPresenterToken = Symbol("AnnouncementListPresenter");

export interface AnnouncementListPresenter {
  addAnnouncement(announcement: Announcement): void;
}
