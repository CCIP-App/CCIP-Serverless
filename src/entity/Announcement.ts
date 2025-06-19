import { AttendeeRole } from "./Attendee";

export enum AnnouncementLocale {
  ZH_TW = "zh-TW",
  EN = "en",
}

export class Announcement {
  private messages: Map<AnnouncementLocale, string> = new Map();
  private _publishedAt?: Date;
  private _readableByRoles: Set<AttendeeRole> = new Set();

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

  allMessages(): Record<AnnouncementLocale, string> {
    const result: Record<AnnouncementLocale, string> = {} as Record<AnnouncementLocale, string>;
    for (const [locale, content] of this.messages) {
      result[locale] = content;
    }
    return result;
  }

  publish(time: Date): void {
    this._publishedAt = time;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  readableBy(...roles: AttendeeRole[]): void {
    roles.forEach(role => this._readableByRoles.add(role));
  }

  isReadable(role: AttendeeRole): boolean {
    return this._readableByRoles.has(role);
  }

  get roles(): AttendeeRole[] {
    return Array.from(this._readableByRoles);
  }
}