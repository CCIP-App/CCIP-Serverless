import { AttendeeRepository, ProfilePresenter } from "./interface";

export class GetProfile {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly presenter: ProfilePresenter,
  ) {}

  async execute(token: string): Promise<void> {
    const attendee = await this.attendeeRepository.findAttendeeByToken(token);

    if (!attendee) {
      throw new Error("invalid token");
    }

    this.presenter.setAttendee(attendee);
  }
}
