/**
 * Ruleset entity - represents a collection of rules for an event
 * Empty implementation for now to replace 'any' types
 */
export class Ruleset {
  constructor(private readonly ruleData: Record<string, unknown>) {}

  /**
   * Get all rules in this ruleset as raw data
   * TODO: Replace with proper Rule entities when needed
   */
  getAllRules(): Record<string, unknown> {
    return { ...this.ruleData };
  }

  /**
   * Check if ruleset has any rules
   */
  hasRules(): boolean {
    return Object.keys(this.ruleData).length > 0;
  }
}
