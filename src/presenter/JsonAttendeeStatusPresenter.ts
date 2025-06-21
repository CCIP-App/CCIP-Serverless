import { Attendee } from "@/entity/Attendee";
import { AttendeeStatusPresenter } from "@/usecase/interface";

export interface AttendeeStatusData {
  public_token: string;
  user_id: string;
  first_use: number | null;
  role: string;
  scenario: Record<string, ScenarioData>;
  attr: Record<string, unknown>;
}

export interface ScenarioData {
  order: number;
  available_time: number;
  expire_time: number;
  display_text: Record<string, string>;
  used: number | null;
  disabled: string | null;
  attr: Record<string, unknown>;
}

export class JsonAttendeeStatusPresenter implements AttendeeStatusPresenter {
  private attendee?: Attendee;
  private scenarios: Record<string, ScenarioData> = {};

  setAttendee(attendee: Attendee): void {
    this.attendee = attendee;
  }

  setScenarios(scenarios: Record<string, ScenarioData>): void {
    this.scenarios = scenarios;
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
      scenario: this.scenarios,
      attr: this.getAttendeeAttributes(),
    };
  }

  private getAttendeeAttributes(): Record<string, unknown> {
    if (!this.attendee) return {};

    return this.attendee.metadata || {};
  }
}
