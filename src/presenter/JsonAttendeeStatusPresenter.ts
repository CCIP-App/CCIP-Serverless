import { Attendee } from "@/entity/Attendee";
import { AttendeeStatusPresenter } from "@/usecase/interface";

export interface AttendeeStatusData {
  public_token: string;
  user_id: string;
  first_use: number | null;
  role: string;
  scenario: Record<string, unknown>;
  attr: Record<string, unknown>;
}

export class JsonAttendeeStatusPresenter implements AttendeeStatusPresenter {
  private attendee?: Attendee;

  setAttendee(attendee: Attendee): void {
    this.attendee = attendee;
  }

  toJson(): AttendeeStatusData {
    if (!this.attendee) {
      throw new Error("No attendee set");
    }

    return {
      public_token: this.attendee.publicToken,
      user_id: this.attendee.displayName,
      first_use: this.attendee.firstUsedAt,
      role: this.attendee.role,
      scenario: {},
      attr: this.getAttendeeAttributes(),
    };
  }

  private getAttendeeAttributes(): Record<string, unknown> {
    if (!this.attendee) return {};

    return this.attendee.metadata || {};
  }
}
