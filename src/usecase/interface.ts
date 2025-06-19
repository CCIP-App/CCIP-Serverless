import { Attendee } from "@/entity/Attendee";

export const AttendeeRepositoryToken = Symbol("AttendeeRepository");

export interface AttendeeRepository {
  findAttendeeByToken(token: string): Promise<Attendee | null>;
}

export const AnnouncementListPresenterToken = Symbol("AnnouncementListPresenter");

export interface AnnouncementListPresenter<T = unknown> {
  addAnnouncement(announcement: T): void;
}
