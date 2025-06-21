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

/**
 * Checks if an attendee attribute matches an expected value
 */
export class AttributeCondition extends ConditionNode {
  constructor(
    private readonly attributeKey: string,
    private readonly expectedValue: string,
  ) {
    super();
  }

  evaluate(context: EvaluationContext): boolean {
    return (
      context.attendee.getMetadata(this.attributeKey) === this.expectedValue
    );
  }
}

/**
 * Checks if another rule has been used by the attendee
 */
export class UsedRuleCondition extends ConditionNode {
  constructor(private readonly ruleId: string) {
    super();
  }

  evaluate(context: EvaluationContext): boolean {
    return context.attendee.hasUsedRule(this.ruleId);
  }
}

/**
 * Composite condition that requires all children to be true (AND logic)
 */
export class AndCondition extends ConditionNode {
  constructor(private readonly children: ConditionNode[]) {
    super();
  }

  evaluate(context: EvaluationContext): boolean {
    return this.children.every((child) => child.evaluate(context));
  }
}

/**
 * Composite condition that requires at least one child to be true (OR logic)
 */
export class OrCondition extends ConditionNode {
  constructor(private readonly children: ConditionNode[]) {
    super();
  }

  evaluate(context: EvaluationContext): boolean {
    return this.children.some((child) => child.evaluate(context));
  }
}
