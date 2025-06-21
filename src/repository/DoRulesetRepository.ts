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

  async load(): Promise<any> {
    // Load all rules from KV storage
    const rulesets = await this.connection.getValue<any>("rulesets");
    
    if (!rulesets) {
      return {};
    }

    // Return all rules - role filtering happens in service layer via RoleCondition evaluation
    return rulesets;
  }
}
