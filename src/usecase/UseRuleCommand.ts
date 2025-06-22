import { EvaluationContext } from "@/entity/EvaluationContext";
import {
  AttendeeRepository,
  AttendeeStatusPresenter,
  IDatetimeService,
  RuleEvaluationService,
  RulesetRepository,
} from "./interface";

/**
 * Use case for executing a rule action
 */
export class UseRuleCommand {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly rulesetRepository: RulesetRepository,
    private readonly evaluationService: RuleEvaluationService,
    private readonly datetimeService: IDatetimeService,
    private readonly presenter: AttendeeStatusPresenter,
  ) {}

  async execute(token: string, ruleId: string): Promise<void> {
    // Load attendee
    const attendee = await this.attendeeRepository.findAttendeeByToken(token);
    if (!attendee) {
      throw new Error("Attendee not found");
    }

    // Auto check-in logic
    if (!attendee.firstUsedAt) {
      attendee.checkIn(this.datetimeService.getCurrentTime());
      await this.attendeeRepository.save(attendee);
    }

    // Load ruleset
    const ruleset = await this.rulesetRepository.load();

    // Find the specific rule
    const rule = ruleset.getRule(ruleId);
    if (!rule) {
      throw new Error("invalid scenario");
    }

    // Create evaluation context
    const currentTime = this.datetimeService.getCurrentTime();
    const context = new EvaluationContext(attendee, currentTime, false);

    // Check if rule is visible
    if (!rule.isVisible(context)) {
      throw new Error("invalid scenario");
    }

    // Check if rule is usable
    if (!rule.isUsable(context)) {
      throw new Error("has been used");
    }

    // Execute rule action - mark as used
    const timestamp = Math.floor(currentTime.getTime() / 1000);
    attendee.setMetadata(`_rule_${ruleId}`, timestamp.toString());

    // Save attendee with updated metadata
    await this.attendeeRepository.save(attendee);

    // Generate new evaluation result and return status
    const evaluationResult = await this.evaluationService.evaluateForAttendee(
      ruleset,
      attendee,
      false,
    );

    this.presenter.setAttendee(attendee);
    this.presenter.setEvaluationResult(evaluationResult);
  }
}
