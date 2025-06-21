export enum AttendeeRole {
  STAFF = "staff",
  AUDIENCE = "audience",
}

export type MetadataValue = string | number | boolean | null | undefined;

export class Attendee {
  private _role: AttendeeRole = AttendeeRole.AUDIENCE;
  private _firstUsedAt: number | null = null;
  private _metadata: Record<string, MetadataValue> = {};

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

  setMetadata(key: string, value: MetadataValue): void {
    this._metadata[key] = value;
  }

  getMetadata(key: string): MetadataValue {
    return this._metadata[key];
  }

  get metadata(): Record<string, MetadataValue> {
    return { ...this._metadata };
  }

  /**
   * Get metadata that should be visible to external systems
   * Filters out internal metadata (keys starting with "_")
   */
  visibleMetadata(): Record<string, MetadataValue> {
    const visible: Record<string, MetadataValue> = {};
    for (const [key, value] of Object.entries(this._metadata)) {
      if (!key.startsWith("_")) {
        visible[key] = value;
      }
    }
    return visible;
  }

  setAllMetadata(metadata: Record<string, MetadataValue>): void {
    this._metadata = metadata || {};
  }

  hasUsedRule(ruleId: string): boolean {
    const ruleKey = `_rule_${ruleId}`;
    return (
      this._metadata[ruleKey] !== undefined && this._metadata[ruleKey] !== null
    );
  }

  getRuleUsedAt(ruleId: string): Date | null {
    const ruleKey = `_rule_${ruleId}`;
    const timestamp = this._metadata[ruleKey];
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      return new Date(Number(timestamp) * 1000);
    }
    return null;
  }
}
