import { AnnouncementListPresenter, AnnouncementRepository, AttendeeRepository } from "@/usecase/interface";
import { AttendeeRole } from "@/entity/Attendee";

export class AllAnnouncementQuery {
  constructor(
    private readonly presenter: AnnouncementListPresenter,
    private readonly announcementRepository: AnnouncementRepository,
    private readonly attendeeRepository: AttendeeRepository,
  ) {}

  async execute(token?: string): Promise<void> {
    let role = AttendeeRole.AUDIENCE; // Default role for no token or nonexistent token
    
    if (token) {
      const attendee = await this.attendeeRepository.findAttendeeByToken(token);
      if (attendee) {
        // Use the attendee's actual role
        role = attendee.role;
      }
    }

    const announcements = await this.announcementRepository.findAnnouncementsByRole(role);
    
    // Sort by publication time in descending order
    announcements
      .sort((a, b) => {
        const aTime = a.publishedAt?.getTime() || 0;
        const bTime = b.publishedAt?.getTime() || 0;
        return bTime - aTime;
      })
      .forEach(announcement => this.presenter.addAnnouncement(announcement));
  }
}
