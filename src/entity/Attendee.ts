export class Attendee {
  constructor(
    public readonly token: string,
    public readonly displayName: string,
    public readonly firstUsedAt: number,
  ) {}
}
