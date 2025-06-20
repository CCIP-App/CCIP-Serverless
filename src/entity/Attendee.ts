export enum AttendeeRole {
  STAFF = "staff",
  AUDIENCE = "audience",
}

export class Attendee {
  private _role: AttendeeRole = AttendeeRole.AUDIENCE;
  private _firstUsedAt: number | null = null;

  constructor(
    public readonly token: string,
    public readonly displayName: string,
    public readonly publicToken: string,
  ) {}

  setRole(role: AttendeeRole): void {
    this._role = role;
  }

  get role(): AttendeeRole {
    return this._role;
  }

  get firstUsedAt(): number | null {
    return this._firstUsedAt;
  }

  checkIn(time: Date): void {
    if (!this._firstUsedAt) {
      this._firstUsedAt = Math.floor(time.getTime() / 1000);
    }
  }
}
