import { Attendee } from "@/entity/Attendee";
import { AttendeeRepository } from "./interface";

export class GetProfile {
  constructor(private readonly attendeeRepository: AttendeeRepository) {}

  async execute(token: string): Promise<Attendee | null> {
    return await this.attendeeRepository.findAttendeeByToken(token);
  }
}
