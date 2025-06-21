import { EvaluationContext } from "@/entity/EvaluationContext";
import { LocalizedText } from "@/entity/Locale";
import { TimeWindow } from "@/entity/TimeWindow";

/**
 * Rule entity - represents a single action/resource that attendees can access
 * Minimal implementation to support basic evaluation
 */
export class Rule {
  constructor(
    public readonly id: string,
    public readonly order: number,
    public readonly messages: Map<string, LocalizedText>,
    public readonly timeWindow: TimeWindow,
    public readonly showCondition: ConditionNode,
    public readonly unlockCondition: ConditionNode,
    public readonly metadata: Map<string, unknown>,
  ) {}

  /**
   * Check if this rule is visible to the attendee
   */
  isVisible(context: EvaluationContext): boolean {
    return this.showCondition.evaluate(context);
  }

  /**
   * Check if this rule can be used by the attendee
   */
  isUsable(context: EvaluationContext): boolean {
    return (
      this.unlockCondition.evaluate(context) &&
      this.timeWindow.isAvailable(context.currentTime) &&
      !context.attendee.hasUsedRule(this.id)
    );
  }

  /**
   * Get message for a specific message ID
   */
  getMessage(messageId: string): LocalizedText | null {
    return this.messages.get(messageId) || null;
  }
}

/**
 * Base class for condition evaluation
 */
export abstract class ConditionNode {
  abstract evaluate(context: EvaluationContext): boolean;
}

/**
 * Always returns true - for rules without conditions
 */
export class AlwaysTrueCondition extends ConditionNode {
  evaluate(): boolean {
    return true;
  }
}
