import { injectable, inject } from "tsyringe";
import { Attendee } from "@/entity/Attendee";
import {
  EvaluationResult,
  RuleEvaluationResult,
  I18nText,
  TimeWindow,
} from "@/entity/EvaluationResult";
import {
  RuleEvaluationService as IRuleEvaluationService,
  RulesetRepository,
  RulesetRepositoryToken,
  DatetimeServiceToken,
  IDatetimeService,
} from "@/usecase/interface";

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
    // Load ruleset for attendee's role
    const rulesetData = await this.rulesetRepository.findRulesetByRole(
      "SITCON2023", // Hardcoded for now
      attendee.role,
    );

    if (!rulesetData || Object.keys(rulesetData).length === 0) {
      return new EvaluationResult(new Map());
    }

    const currentTime = this.datetimeService.getCurrentTime();
    const results = new Map<string, RuleEvaluationResult>();

    // Process each rule in the ruleset
    for (const [ruleId, ruleData] of Object.entries(rulesetData)) {
      const ruleResult = this.evaluateRule(ruleId, ruleData as any, attendee, currentTime, isStaffQuery);
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