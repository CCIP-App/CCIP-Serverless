import { ConditionNodeFactory } from "@/entity/ConditionFactory";
import { Locale, LocalizedText } from "@/entity/Locale";
import { Rule } from "@/entity/Rule";
import { TimeWindow } from "@/entity/TimeWindow";
import { injectable } from "tsyringe";

/**
 * Factory service for creating Rule entities from JSON data
 * Handles parsing and conversion of raw rule data to domain objects
 */
@injectable()
export class RuleFactory {
  /**
   * Create a Rule entity from raw JSON data
   */
  createRule(ruleId: string, ruleJson: Record<string, unknown>): Rule {
    // Parse messages
    const messagesData =
      (ruleJson.messages as Record<string, Record<string, string>>) || {};
    const messages = new Map<string, LocalizedText>();

    for (const [messageId, translations] of Object.entries(messagesData)) {
      const translationMap = new Map<Locale, string>();

      // Convert string keys to Locale enum values
      for (const [localeKey, text] of Object.entries(translations)) {
        const locale = this.parseLocale(localeKey);
        if (locale) {
          translationMap.set(locale, text);
        }
      }

      messages.set(messageId, new LocalizedText(translationMap));
    }

    // Parse time window
    const timeWindowData = (ruleJson.timeWindow as {
      start: string;
      end: string;
    }) || {
      start: "1970-01-01T00:00:00Z",
      end: "2099-12-31T23:59:59Z",
    };
    const timeWindow = new TimeWindow(
      new Date(timeWindowData.start),
      new Date(timeWindowData.end),
    );

    // Parse conditions
    const conditionsData =
      (ruleJson.conditions as Record<string, Record<string, unknown>>) || {};
    const showCondition = ConditionNodeFactory.create(
      conditionsData.show || { type: "AlwaysTrue" },
    );
    const unlockCondition = ConditionNodeFactory.create(
      conditionsData.unlock || { type: "AlwaysTrue" },
    );

    // Parse metadata
    const metadataData = (ruleJson.metadata as Record<string, unknown>) || {};
    const metadata = new Map(Object.entries(metadataData));

    // Create Rule entity
    return new Rule(
      ruleId,
      (ruleJson.order as number) || 0,
      messages,
      timeWindow,
      showCondition,
      unlockCondition,
      metadata,
    );
  }

  /**
   * Create multiple rules from a ruleset JSON object
   */
  createRulesFromRuleset(
    rulesetData: Record<string, unknown>,
  ): Map<string, Rule> {
    const rules = new Map<string, Rule>();

    for (const [ruleId, ruleData] of Object.entries(rulesetData)) {
      const rule = this.createRule(ruleId, ruleData as Record<string, unknown>);
      rules.set(ruleId, rule);
    }

    return rules;
  }

  /**
   * Parse string locale key to Locale enum value
   */
  private parseLocale(localeKey: string): Locale | null {
    switch (localeKey) {
      case "en-US":
        return Locale.EnUs;
      case "zh-TW":
        return Locale.ZhTw;
      default:
        return null;
    }
  }
}
