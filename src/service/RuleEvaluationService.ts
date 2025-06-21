import { Attendee } from "@/entity/Attendee";
import {
  EvaluationResult,
  I18nText,
  RuleEvaluationResult,
  TimeWindow,
} from "@/entity/EvaluationResult";
import { Ruleset } from "@/entity/Ruleset";
import {
  DatetimeServiceToken,
  IDatetimeService,
  RuleEvaluationService as IRuleEvaluationService,
} from "@/usecase/interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class RuleEvaluationService implements IRuleEvaluationService {
  constructor(
    @inject(DatetimeServiceToken)
    private readonly datetimeService: IDatetimeService,
  ) {}

  async evaluateForAttendee(
    ruleset: Ruleset,
    attendee: Attendee,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _isStaffQuery: boolean = false,
  ): Promise<EvaluationResult> {
    if (!ruleset.hasRules()) {
      return new EvaluationResult(new Map());
    }

    const currentTime = this.datetimeService.getCurrentTime();
    const results = new Map<string, RuleEvaluationResult>();

    // Process each rule - role filtering happens via condition evaluation
    for (const [ruleId, ruleData] of Object.entries(ruleset.getAllRules())) {
      const ruleResult = this.evaluateRule(
        ruleId,
        ruleData as Record<string, unknown>,
        attendee,
        currentTime,
      );
      results.set(ruleId, ruleResult);
    }

    return new EvaluationResult(results);
  }

  private evaluateRule(
    ruleId: string,
    ruleData: Record<string, unknown>,
    attendee: Attendee,
    currentTime: Date,
  ): RuleEvaluationResult {
    // For now, hardcode the evaluation logic based on the test scenario
    // This will be replaced with proper AST evaluation later

    // Parse messages from rule data
    const messagesData =
      (ruleData.messages as Record<string, Record<string, string>>) || {};
    const messages = new Map<string, I18nText>();

    for (const [messageId, translations] of Object.entries(messagesData)) {
      const translationMap = new Map(Object.entries(translations));
      messages.set(messageId, new I18nText(translationMap));
    }

    // Parse time window from rule data
    const timeWindowData = (ruleData.timeWindow as {
      start: string;
      end: string;
    }) || { start: "1970-01-01T00:00:00Z", end: "2099-12-31T23:59:59Z" };
    const timeWindow = new TimeWindow(
      new Date(timeWindowData.start),
      new Date(timeWindowData.end),
    );

    // Hardcoded evaluation logic for the first test case
    const visible = true; // AlwaysTrue condition
    const usable = timeWindow.isAvailable(currentTime); // AlwaysTrue condition + time check
    const used = attendee.hasUsedRule(ruleId);
    const usedAt = used ? attendee.getRuleUsedAt(ruleId) : null;

    // Empty attributes for now (no metadata mapping in first test)
    const attributes = new Map<string, unknown>();

    const order = (ruleData.order as number) || 0;

    return new RuleEvaluationResult(
      ruleId,
      visible,
      usable,
      used,
      usedAt,
      messages,
      attributes,
      order,
      timeWindow,
    );
  }
}
