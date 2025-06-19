export enum AnnouncementLocale {
  ZH_TW = "zh-TW",
  EN = "en",
}

export class Announcement {
  private messages: Map<AnnouncementLocale, string> = new Map();

  constructor(
    public readonly id: string,
    public readonly uri: string,
  ) {}

  setMessage(locale: AnnouncementLocale, content: string): void {
    this.messages.set(locale, content);
  }

  getMessage(locale: AnnouncementLocale): string | undefined {
    return this.messages.get(locale);
  }

  allMessages(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [locale, content] of this.messages) {
      result[locale] = content;
    }
    return result;
  }
}