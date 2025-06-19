export type AnnouncementResult = {
  datetime: number;
  msgEn: string;
  msgZh: string;
  uri: string;
};

export class AllAnnouncementQuery {
  async execute(token?: string): Promise<AnnouncementResult[]> {
    // For now, just return empty array for the first scenario
    return [];
  }
}
