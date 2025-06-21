import { Attendee } from "@/entity/Attendee";
import { EvaluationResult } from "@/entity/EvaluationResult";
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
  private evaluationResult?: EvaluationResult;

  setAttendee(attendee: Attendee): void {
    this.attendee = attendee;
  }

  setEvaluationResult(evaluationResult: EvaluationResult): void {
    this.evaluationResult = evaluationResult;
  }


  toJson(): AttendeeStatusData {
    if (!this.attendee) {
      throw new Error("No attendee set");
    }

    const scenarios = this.buildScenariosFromEvaluationResult();

    return {
      public_token: this.attendee.publicToken,
      user_id: this.attendee.displayName,
      first_use: this.attendee.firstUsedAt,
      role: this.attendee.role,
      scenario: scenarios,
      attr: this.getAttendeeAttributes(),
    };
  }

  private buildScenariosFromEvaluationResult(): Record<string, ScenarioData> {
    if (!this.evaluationResult) {
      return {};
    }

    const scenarios: Record<string, ScenarioData> = {};
    const visibleRules = this.evaluationResult.getVisibleRules();

    for (const ruleResult of visibleRules) {
      const displayMessage = ruleResult.getCurrentMessage("display");
      const displayText: Record<string, string> = {};
      
      if (displayMessage) {
        for (const [locale, text] of displayMessage.getAllTranslations()) {
          displayText[locale] = text;
        }
      }

      scenarios[ruleResult.ruleId] = {
        order: ruleResult.order,
        available_time: ruleResult.timeWindow.getStartTimestamp(),
        expire_time: ruleResult.timeWindow.getEndTimestamp(),
        display_text: displayText,
        used: ruleResult.used && ruleResult.usedAt ? Math.floor(ruleResult.usedAt.getTime() / 1000) : null,
        disabled: !ruleResult.usable ? "locked" : null,
        attr: Object.fromEntries(ruleResult.attributes),
      };
    }

    return scenarios;
  }

  private getAttendeeAttributes(): Record<string, unknown> {
    if (!this.attendee) return {};

    return this.attendee.metadata || {};
  }
}
