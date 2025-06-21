/**
 * Represents the availability period for a rule
 */
export class TimeWindow {
  constructor(
    public readonly start: Date,
    public readonly end: Date,
  ) {}

  isAvailable(current: Date): boolean {
    return current >= this.start && current <= this.end;
  }

  getStartTimestamp(): number {
    return Math.floor(this.start.getTime() / 1000);
  }

  getEndTimestamp(): number {
    return Math.floor(this.end.getTime() / 1000);
  }
}
