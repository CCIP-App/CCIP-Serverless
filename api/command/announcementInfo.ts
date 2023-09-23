import { Attendee, AttendeeRole } from '@/attendee'
import { Repository } from '@/core'
import { Announcement } from '@api/schema'
import { AnnouncementRepository } from './repository'

export type AnnouncementReply = Announcement[]

const defaultQueryRole = AttendeeRole.Audience

export class AnnouncementInfo {
  private readonly announcementRepository: AnnouncementRepository
  private readonly attendeeRepository: Repository<Attendee>

  constructor(
    announcementRepository: AnnouncementRepository,
    attendeeRepository: Repository<Attendee>
  ) {
    this.announcementRepository = announcementRepository
    this.attendeeRepository = attendeeRepository
  }

  public async byAttendee(token?: string | undefined): Promise<AnnouncementReply> {
    const attendee = await this.attendeeRepository.findById(token ?? '')
    const results = await this.announcementRepository.listByRole(attendee?.role ?? defaultQueryRole)
    return results.map(toAnnouncementData)
  }

  public async create(params: Record<string, unknown>): Promise<void> {
    await this.announcementRepository.create(params)
  }
}

const toAnnouncementData = (data: {
  announcedAt: Date
  messageEn: string | null
  messageZh: string | null
  uri: string
}): Announcement => ({
  announcedAt: data.announcedAt,
  messageEn: data.messageEn,
  messageZh: data.messageZh,
  uri: data.uri,
})
