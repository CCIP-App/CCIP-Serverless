import { Ruleset } from "@/entity/Ruleset";
import {
  DatabaseConnectionToken,
  IKvDatabaseConnection,
} from "@/infra/DatabaseConnection";
import { RulesetRepository } from "@/usecase/interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class DoRulesetRepository implements RulesetRepository {
  constructor(
    @inject(DatabaseConnectionToken)
    private readonly connection: IKvDatabaseConnection,
  ) {}

  async load(): Promise<Ruleset> {
    // Load all rules from KV storage
    const ruleData =
      await this.connection.getValue<Record<string, unknown>>("rulesets");

    if (!ruleData) {
      return new Ruleset({});
    }

    // Return wrapped in Ruleset entity - just to replace 'any' types for now
    return new Ruleset(ruleData);
  }
}
