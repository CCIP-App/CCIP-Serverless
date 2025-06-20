import { Announcement } from "@/entity/Announcement";
import { Attendee, AttendeeRole } from "@/entity/Attendee";

export const AttendeeRepositoryToken = Symbol("AttendeeRepository");

export interface AttendeeRepository {
  findAttendeeByToken(token: string): Promise<Attendee | null>;
  save(attendee: Attendee): Promise<void>;
}

export const AnnouncementRepositoryToken = Symbol("AnnouncementRepository");

export interface AnnouncementRepository {
  findAnnouncementsByRole(role: AttendeeRole): Promise<Announcement[]>;
}

export const AnnouncementListPresenterToken = Symbol(
  "AnnouncementListPresenter",
);

export interface AnnouncementListPresenter {
  addAnnouncement(announcement: Announcement): void;
}

export const AttendeeStatusPresenterToken = Symbol("AttendeeStatusPresenter");

export interface AttendeeStatusPresenter {
  setAttendee(attendee: Attendee): void;
}
