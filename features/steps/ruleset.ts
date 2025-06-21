import { Given } from "@cucumber/cucumber";
import { World } from "../support/World";

Given(
  "there have a ruleset for {string} with name {string} and scenarios:",
  async function (
    this: World,
    eventId: string,
    name: string,
    scenariosJson: string,
  ) {
    // Parse the JSON scenarios
    const scenarios = JSON.parse(scenariosJson);

    // Store ruleset data in World for later use
    // This will be used by the mock scenario logic in the use case
    this.ruleset = {
      eventId,
      name,
      scenarios,
    };

    // For now, we'll just store this in the World instance
    // Later this will be replaced with actual Durable Object storage
  },
);
