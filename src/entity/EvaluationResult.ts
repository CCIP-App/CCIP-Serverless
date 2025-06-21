/**
 * Value object representing the result of evaluating a single rule
 */
export class RuleEvaluationResult {
  constructor(
    public readonly ruleId: string,
    public readonly visible: boolean,
    public readonly usable: boolean,
    public readonly used: boolean,
    public readonly usedAt: Date | null,
    public readonly messages: Map<string, I18nText>,
    public readonly attributes: Map<string, unknown>, // Mapped metadata
    public readonly order: number,
    public readonly timeWindow: TimeWindow,
  ) {}

  /**
   * Get appropriate message based on current state
   */
  getCurrentMessage(messageId: string): I18nText | null {
    if (this.used) return this.messages.get("already_used") || null;
    if (!this.usable) return this.messages.get("locked") || null;
    return this.messages.get(messageId) || this.messages.get("display") || null;
  }
}

/**
 * Aggregate result for all rules evaluated for an attendee
 */
export class EvaluationResult {
  constructor(private readonly results: Map<string, RuleEvaluationResult>) {}

  /**
   * Get all visible rules sorted by order
   */
  getVisibleRules(): RuleEvaluationResult[] {
    return Array.from(this.results.values())
      .filter((result) => result.visible)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get specific rule result
   */
  getRule(ruleId: string): RuleEvaluationResult | null {
    return this.results.get(ruleId) || null;
  }

  /**
   * Check if any rules are available for use
   */
  hasUsableRules(): boolean {
    return Array.from(this.results.values()).some(
      (result) => result.visible && result.usable,
    );
  }
}

/**
 * Handles internationalized text with fallback support
 */
export class I18nText {
  constructor(private readonly translations: Map<string, string>) {}

  getText(locale: string): string {
    return (
      this.translations.get(locale) || this.translations.get("en-US") || ""
    );
  }

  getAllTranslations(): Map<string, string> {
    return new Map(this.translations);
  }
}

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
