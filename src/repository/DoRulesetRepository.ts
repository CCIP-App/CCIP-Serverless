import { injectable, inject } from "tsyringe";
import { RulesetRepository } from "@/usecase/interface";
import { DatabaseConnectionToken, IKvDatabaseConnection } from "@/infra/DatabaseConnection";

@injectable()
export class DoRulesetRepository implements RulesetRepository {
  constructor(
    @inject(DatabaseConnectionToken)
    private readonly connection: IKvDatabaseConnection,
  ) {}

  async findRulesetByRole(eventName: string, role: string): Promise<any> {
    // Load ruleset from KV storage
    const rulesets = await this.connection.getValue<any>("rulesets");
    
    if (!rulesets) {
      return {};
    }

    // For now, return the entire ruleset as we're storing it flat
    // Later this should be organized by role: { "audience": {...}, "speaker": {...} }
    return rulesets;
  }
}