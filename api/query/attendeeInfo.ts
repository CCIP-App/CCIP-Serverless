import { inject, injectable } from 'tsyringe'
import { Repository, Query } from '@/core'
import { Attendee } from '@/attendee'

export type AttendeeScenario = {
  order: number
  displayText: Record<string, string>
  locked: boolean
  lockReason: string | null
}

export type AttendeeInfoInput = {
  token: string
}

export type AttendeeInfoOutput = {
  eventId: string
  publicToken: string
  displayName: string
  firstUsedAt: Date | null
  role: string
  scenario?: Record<string, AttendeeScenario>
  metadata: Record<string, any>
} | null

@injectable()
export class AttendeeInfo implements Query<AttendeeInfoInput, AttendeeInfoOutput> {
  constructor(
    @inject('IAttendeeRepository')
    private readonly attendees: Repository<Attendee>
  ) {}

  public async execute(input: AttendeeInfoInput): Promise<AttendeeInfoOutput> {
    const attendee = await this.attendees.findById(input.token)
    if (!attendee) {
      return null
    }

    return {
      eventId: attendee.eventId,
      publicToken: attendee.publicToken,
      displayName: attendee.displayName,
      firstUsedAt: attendee.firstUsedAt,
      role: attendee.role,
      metadata: attendee.metadata,
    }
  }
}
