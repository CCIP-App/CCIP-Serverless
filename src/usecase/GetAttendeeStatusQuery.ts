import { AttendeeRepository, AttendeeStatusPresenter } from "./interface";

export class GetAttendeeStatusQuery {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
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

    this.presenter.setAttendee(attendee);
  }
}
