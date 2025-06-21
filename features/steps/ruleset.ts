import { Given } from "@cucumber/cucumber";
import { World } from "../support/World";

Given(
  "there have a ruleset for {string} with name {string} and scenarios:",
  async function (this: World, eventName: string, roleName: string, rulesetJson: string) {
    // Parse the ruleset JSON - eventName and roleName are ignored as per design
    const ruleset = JSON.parse(rulesetJson);

    // Get the database connection for the event
    const database = await this.getDatabase();

    // Store all rules together - role filtering happens via condition evaluation
    // The ruleset contains all rules for all roles, with RoleCondition handling access
    await database.setValue("rulesets", ruleset);
  },
);
