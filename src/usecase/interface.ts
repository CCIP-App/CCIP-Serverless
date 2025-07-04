import { Announcement } from "@/entity/Announcement";
import { Attendee, AttendeeRole } from "@/entity/Attendee";
import { EvaluationResult } from "@/entity/EvaluationResult";
import { Ruleset } from "@/entity/Ruleset";

export const AttendeeRepositoryToken = Symbol("AttendeeRepository");

export interface AttendeeRepository {
  findAttendeeByToken(token: string): Promise<Attendee | null>;
  save(attendee: Attendee): Promise<void>;
}

export const AnnouncementRepositoryToken = Symbol("AnnouncementRepository");

export interface AnnouncementRepository {
  findAnnouncementsByRole(role: AttendeeRole): Promise<Announcement[]>;
  create(announcement: Announcement): Promise<void>;
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
  setEvaluationResult(evaluationResult: EvaluationResult): void;
}

export const RulesetRepositoryToken = Symbol("RulesetRepository");

export interface RulesetRepository {
  load(): Promise<Ruleset>;
}

export const RuleEvaluationServiceToken = Symbol("RuleEvaluationService");

export interface RuleEvaluationService {
  evaluateForAttendee(
    ruleset: Ruleset,
    attendee: Attendee,
    isStaffQuery: boolean,
  ): Promise<EvaluationResult>;
}

export const DatetimeServiceToken = Symbol("DatetimeService");

export interface IDatetimeService {
  getCurrentTime(): Date;
}

export const RuleFactoryToken = Symbol("RuleFactory");

export const ProfilePresenterToken = Symbol("ProfilePresenter");

export interface ProfilePresenter {
  setAttendee(attendee: Attendee): void;
}
