import { Attendee } from "@/entity/Attendee";
import { EvaluationContext } from "@/entity/EvaluationContext";
import {
  EvaluationResult,
  RuleEvaluationResult,
} from "@/entity/EvaluationResult";
import { Rule } from "@/entity/Rule";
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
    isStaffQuery: boolean = false,
  ): Promise<EvaluationResult> {
    if (!ruleset.hasRules()) {
      return new EvaluationResult(new Map());
    }

    const currentTime = this.datetimeService.getCurrentTime();
    const context = new EvaluationContext(attendee, currentTime, isStaffQuery);
    const results = new Map<string, RuleEvaluationResult>();

    // Process each rule using Rule entities
    for (const [ruleId, rule] of ruleset.getAllRules()) {
      const ruleResult = this.evaluateRule(rule, context);
      results.set(ruleId, ruleResult);
    }

    return new EvaluationResult(results);
  }

  private evaluateRule(
    rule: Rule,
    context: EvaluationContext,
  ): RuleEvaluationResult {
    // Use the Rule entity's evaluation methods
    const visible = rule.isVisible(context);
    const usable = rule.isUsable(context);
    const used = context.attendee.hasUsedRule(rule.id);
    const usedAt = used ? context.attendee.getRuleUsedAt(rule.id) : null;

    // Empty attributes for now (no metadata mapping in first test)
    const attributes = new Map<string, unknown>();

    return new RuleEvaluationResult(
      rule.id,
      visible,
      usable,
      used,
      usedAt,
      rule.messages,
      attributes,
      rule.order,
      rule.timeWindow,
    );
  }
}
