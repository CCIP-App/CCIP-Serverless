export enum AttendeeRole {
  STAFF = "staff",
  AUDIENCE = "audience",
}

export class Attendee {
  private _role: AttendeeRole = AttendeeRole.AUDIENCE;

  constructor(
    public readonly token: string,
    public readonly displayName: string,
    public readonly firstUsedAt: number,
  ) {}

  setRole(role: AttendeeRole): void {
    this._role = role;
  }

  get role(): AttendeeRole {
    return this._role;
  }
}
