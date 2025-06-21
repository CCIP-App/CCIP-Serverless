import { Rule } from "@/entity/Rule";

/**
 * Ruleset entity - represents a collection of rules for an event
 * Pure domain entity that manages Rule objects without parsing concerns
 */
export class Ruleset {
  private readonly rules: Map<string, Rule>;

  constructor(rules: Map<string, Rule>) {
    this.rules = new Map(rules);
  }

  /**
   * Get all rules in this ruleset
   */
  getAllRules(): Map<string, Rule> {
    return new Map(this.rules);
  }

  /**
   * Get a specific rule by ID
   */
  getRule(ruleId: string): Rule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Check if ruleset has any rules
   */
  hasRules(): boolean {
    return this.rules.size > 0;
  }
}
