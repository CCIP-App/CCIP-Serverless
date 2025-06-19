import { AnnouncementListPresenter } from "@/usecase/interface";

export class AllAnnouncementQuery {
  constructor(private readonly presenter: AnnouncementListPresenter) {}

  async execute(token?: string): Promise<void> {
    // For now, just return empty array for the first scenario
    // In the future, query announcements and call presenter.addAnnouncement() for each
  }
}
