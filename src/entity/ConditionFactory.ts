import { AlwaysTrueCondition, ConditionNode } from "@/entity/Rule";

/**
 * Factory for creating condition nodes from JSON
 * Minimal implementation supporting only AlwaysTrue for now
 */
export class ConditionNodeFactory {
  static create(json: Record<string, unknown>): ConditionNode {
    const type = json.type as string;

    switch (type) {
      case "AlwaysTrue":
        return new AlwaysTrueCondition();
      default:
        throw new Error(`Unknown condition type: ${type}`);
    }
  }
}
