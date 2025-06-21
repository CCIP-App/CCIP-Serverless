import { Given } from "@cucumber/cucumber";
import { World } from "../support/World";

Given("the ruleset is:", async function (this: World, rulesetJson: string) {
  // Parse the ruleset JSON
  const ruleset = JSON.parse(rulesetJson);

  // Get the database connection for the event
  const database = await this.getDatabase();

  // Store all rules together - role filtering happens via condition evaluation
  // The ruleset contains all rules for all roles, with RoleCondition handling access
  await database.setValue("rulesets", ruleset);
});
