import {
  AttendeeRepository,
  AttendeeStatusPresenter,
  RuleEvaluationService,
} from "./interface";

export class GetAttendeeStatusQuery {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
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

    // Generate evaluation result
    const evaluationResult =
      await this.ruleEvaluationService.evaluateForAttendee(
        attendee,
        isStaffQuery,
      );

    this.presenter.setAttendee(attendee);
    this.presenter.setEvaluationResult(evaluationResult);
  }
}
