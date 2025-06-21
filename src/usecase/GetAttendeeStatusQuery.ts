import {
  AttendeeRepository,
  AttendeeStatusPresenter,
  RuleEvaluationService,
  RulesetRepository,
} from "./interface";

export class GetAttendeeStatusQuery {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly rulesetRepository: RulesetRepository,
    private readonly ruleEvaluationService: RuleEvaluationService,
    private readonly presenter: AttendeeStatusPresenter,
  ) {}

  async execute(token: string, isStaffQuery = false): Promise<void> {
    const attendee = await this.attendeeRepository.findAttendeeByToken(token);

    if (!attendee) {
      throw new Error("Attendee not found");
    }

    if (!isStaffQuery && !attendee.firstUsedAt) {
      attendee.checkIn(new Date());
      await this.attendeeRepository.save(attendee);
    }

    // Load ruleset and generate evaluation result
    const ruleset = await this.rulesetRepository.load();
    const evaluationResult =
      await this.ruleEvaluationService.evaluateForAttendee(
        ruleset,
        attendee,
        isStaffQuery,
      );

    this.presenter.setAttendee(attendee);
    this.presenter.setEvaluationResult(evaluationResult);
  }
}
