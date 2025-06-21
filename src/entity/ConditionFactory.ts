import {
  AlwaysTrueCondition,
  AndCondition,
  AttributeCondition,
  ConditionNode,
  OrCondition,
  UsedRuleCondition,
} from "@/entity/Rule";

/**
 * Factory for creating condition nodes from JSON
 * Supports AlwaysTrue, Attribute, UsedRule, And, and Or condition types
 */
export class ConditionNodeFactory {
  static create(json: Record<string, unknown>): ConditionNode {
    const type = json.type as string;

    switch (type) {
      case "AlwaysTrue":
        return new AlwaysTrueCondition();
      case "Attribute":
        return new AttributeCondition(json.key as string, json.value as string);
      case "UsedRule":
        return new UsedRuleCondition(json.ruleId as string);
      case "And": {
        const children = (json.children as Array<Record<string, unknown>>).map(
          (childJson) => ConditionNodeFactory.create(childJson),
        );
        return new AndCondition(children);
      }
      case "Or": {
        const children = (json.children as Array<Record<string, unknown>>).map(
          (childJson) => ConditionNodeFactory.create(childJson),
        );
        return new OrCondition(children);
      }
      default:
        throw new Error(`Unknown condition type: ${type}`);
    }
  }
}
