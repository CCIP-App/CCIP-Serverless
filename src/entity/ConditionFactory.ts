import {
  AlwaysTrueCondition,
  AttributeCondition,
  ConditionNode,
  UsedRuleCondition,
} from "@/entity/Rule";

/**
 * Factory for creating condition nodes from JSON
 * Supports AlwaysTrue, Attribute, and UsedRule condition types
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
      default:
        throw new Error(`Unknown condition type: ${type}`);
    }
  }
}
