import { Given } from "@cucumber/cucumber";
import { World } from "../support/World";

Given(
  "the ruleset config is:",
  async function (this: World, rulesetJson: string) {
    // Parse the ruleset JSON
    const ruleset = JSON.parse(rulesetJson);

    // Get the database connection for the event
    const database = await this.getDatabase();

    // Store the ruleset in KV storage with key "rulesets"
    await database.setValue("rulesets", ruleset);
  },
);

Given(
  "there have a ruleset for {string} with name {string} and scenarios:",
  async function (this: World, eventName: string, roleName: string, rulesetJson: string) {
    // Parse the ruleset JSON
    const ruleset = JSON.parse(rulesetJson);

    // Get the database connection for the event
    const database = await this.getDatabase();

    // Store the ruleset in KV storage with role-based structure
    // For now, we'll store it under "rulesets" key as expected by repository
    await database.setValue("rulesets", ruleset);
  },
);
