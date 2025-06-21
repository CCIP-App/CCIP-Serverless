import { AttendeeRole } from "./Attendee";
import { Locale } from "./Locale";

export class Announcement {
  private messages: Map<Locale, string> = new Map();
  private _publishedAt?: Date;
  private _readableByRoles: Set<AttendeeRole> = new Set();

  constructor(
    public readonly id: string,
    public readonly uri: string,
  ) {}

  setMessage(locale: Locale, content: string): void {
    this.messages.set(locale, content);
  }

  getMessage(locale: Locale): string | undefined {
    return this.messages.get(locale);
  }

  allMessages(): Record<Locale, string> {
    const result: Record<Locale, string> = {} as Record<
      Locale,
      string
    >;
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
    roles.forEach((role) => this._readableByRoles.add(role));
  }

  isReadable(role: AttendeeRole): boolean {
    return this._readableByRoles.has(role);
  }

  get roles(): AttendeeRole[] {
    return Array.from(this._readableByRoles);
  }
}
