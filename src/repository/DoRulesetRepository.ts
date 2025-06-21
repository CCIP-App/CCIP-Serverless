import { Ruleset } from "@/entity/Ruleset";
import {
  DatabaseConnectionToken,
  IKvDatabaseConnection,
} from "@/infra/DatabaseConnection";
import { RuleFactory } from "@/service/RuleFactory";
import { RuleFactoryToken, RulesetRepository } from "@/usecase/interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class DoRulesetRepository implements RulesetRepository {
  constructor(
    @inject(DatabaseConnectionToken)
    private readonly connection: IKvDatabaseConnection,
    @inject(RuleFactoryToken)
    private readonly ruleFactory: RuleFactory,
  ) {}

  async load(): Promise<Ruleset> {
    // Load all rules from KV storage
    const ruleData =
      await this.connection.getValue<Record<string, unknown>>("rulesets");

    if (!ruleData) {
      return new Ruleset(new Map());
    }

    // Use RuleFactory to parse JSON into Rule entities
    const rules = this.ruleFactory.createRulesFromRuleset(ruleData);
    return new Ruleset(rules);
  }
}
