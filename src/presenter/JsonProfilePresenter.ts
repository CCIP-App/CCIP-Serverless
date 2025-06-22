import { Attendee } from "@/entity/Attendee";
import { ProfilePresenter } from "@/usecase/interface";

/**
 * JSON presenter for attendee profile data
 */
export class JsonProfilePresenter implements ProfilePresenter {
  private attendee!: Attendee;

  setAttendee(attendee: Attendee): void {
    this.attendee = attendee;
  }

  toJson(): { nickname: string } {
    return {
      nickname: this.attendee.displayName,
    };
  }
}
