import { inject, injectable } from 'tsyringe'
import { Command, Repository, getCurrentTime } from '@/core'
import { Announcement, LocalizedText } from '@/announcement'

export type CreateAnnouncementInput = {
  message: LocalizedText
  uri: string
  roles: string[]
}

@injectable()
export class CreateAnnouncement implements Command<CreateAnnouncementInput, void> {
  constructor(
    @inject('IAnnouncementRepository')
    private readonly announcementRepository: Repository<Announcement>
  ) {}

  public async execute(input: CreateAnnouncementInput): Promise<void> {
    const announcementId = crypto.randomUUID()
    const announcement = new Announcement({
      id: announcementId,
      announcedAt: getCurrentTime(),
      message: input.message,
      uri: input.uri,
      roles: input.roles,
    })
    await this.announcementRepository.save(announcement)
  }
}
