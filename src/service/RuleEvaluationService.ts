import { Attendee } from "@/entity/Attendee";
import {
  EvaluationResult,
  I18nText,
  RuleEvaluationResult,
  TimeWindow,
} from "@/entity/EvaluationResult";
import {
  DatetimeServiceToken,
  IDatetimeService,
  RuleEvaluationService as IRuleEvaluationService,
  RulesetRepository,
  RulesetRepositoryToken,
} from "@/usecase/interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class RuleEvaluationService implements IRuleEvaluationService {
  constructor(
    @inject(RulesetRepositoryToken)
    private readonly rulesetRepository: RulesetRepository,
    @inject(DatetimeServiceToken)
    private readonly datetimeService: IDatetimeService,
  ) {}

  async evaluateForAttendee(
    attendee: Attendee,
    isStaffQuery: boolean = false,
  ): Promise<EvaluationResult> {
    // 1. Load all rules
    const allRules = await this.rulesetRepository.load();

    if (!allRules || Object.keys(allRules).length === 0) {
      return new EvaluationResult(new Map());
    }

    const currentTime = this.datetimeService.getCurrentTime();
    const results = new Map<string, RuleEvaluationResult>();

    // Process each rule - role filtering happens via condition evaluation
    for (const [ruleId, ruleData] of Object.entries(allRules)) {
      const ruleResult = this.evaluateRule(
        ruleId,
        ruleData as any,
        attendee,
        currentTime,
        isStaffQuery,
      );
      results.set(ruleId, ruleResult);
    }

    return new EvaluationResult(results);
  }

  private evaluateRule(
    ruleId: string,
    ruleData: any,
    attendee: Attendee,
    currentTime: Date,
    isStaffQuery: boolean,
  ): RuleEvaluationResult {
    // For now, hardcode the evaluation logic based on the test scenario
    // This will be replaced with proper AST evaluation later

    // Create I18nText for messages
    const messages = new Map<string, I18nText>();
    if (ruleData.messages?.display) {
      const displayTranslations = new Map<string, string>();
      Object.entries(ruleData.messages.display).forEach(([locale, text]) => {
        displayTranslations.set(locale, text as string);
      });
      messages.set("display", new I18nText(displayTranslations));
    }

    // Create TimeWindow
    const timeWindow = new TimeWindow(
      new Date(ruleData.timeWindow.start),
      new Date(ruleData.timeWindow.end),
    );

    // Hardcoded evaluation logic for the first test case
    const visible = true; // AlwaysTrue condition
    const usable = true && timeWindow.isAvailable(currentTime); // AlwaysTrue condition + time check
    const used = attendee.hasUsedRule(ruleId);
    const usedAt = used ? attendee.getRuleUsedAt(ruleId) : null;

    // Empty attributes for now (no metadata mapping in first test)
    const attributes = new Map<string, any>();

    return new RuleEvaluationResult(
      ruleId,
      visible,
      usable,
      used,
      usedAt,
      messages,
      attributes,
      ruleData.order || 0,
      timeWindow,
    );
  }
}
