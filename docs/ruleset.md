# Ruleset System Design

## Overview

The Ruleset System is a flexible rule engine designed to manage event attendee interactions and resource allocation. It enables event organizers to create configurable rules that control what attendees can do, when they can do it, and how many times actions can be performed.

### Core Purpose

The system addresses common event management challenges:

- **Resource Control**: Prevent attendees from taking multiple lunch boxes, welcome kits, or other limited resources
- **Progressive Unlocking**: Create structured experiences where completing one action unlocks others (e.g., check-in before meal collection)
- **Role-Based Access**: Different attendee types (audience, speakers, staff) have different available actions
- **Conditional Logic**: Actions can be shown/hidden or enabled/disabled based on attendee attributes or previous actions

### Key Features

- **State Tracking**: Track when attendees perform actions to prevent duplicates
- **Conditional Visibility**: Rules can be shown/hidden based on attendee metadata or role
- **Dynamic Unlocking**: Actions can unlock other actions, creating workflow chains
- **Metadata Integration**: Attendee-specific information can be attached to actions (e.g., dietary preferences for meals)
- **Multi-language Support**: All display text supports internationalization
- **Time-based Availability**: Rules can have specific time windows for availability

### Real-World Examples

- **Meal Distribution**: "Lunch Box Collection" rule prevents taking multiple boxes, shows dietary information
- **Check-in Flow**: "Event Check-in" unlocks "Welcome Kit Collection" and "Networking Session Access"
- **Speaker Perks**: "Speaker Lounge Access" only visible to attendees with speaker role
- **Conditional Resources**: "Vegetarian Meal" only shown to attendees who specified dietary preferences

The system replaces hardcoded event logic with a flexible, configurable rule engine that can adapt to different event types and requirements.

## User Stories

### Resource Control

```gherkin
Feature: Meal Collection Control
  As an event organizer
  I want to prevent attendees from collecting multiple lunch boxes
  So that we have enough meals for everyone

  Scenario: Attendee collects lunch box for first time
    Given I am an attendee with a valid token
    And the "lunch_collection" rule is available
    When I use the lunch collection service
    Then my lunch box is marked as collected
    And I cannot collect another lunch box

  Scenario: Attendee tries to collect lunch box again
    Given I have already collected my lunch box
    When I try to use the lunch collection service again
    Then I should receive an error "already collected"
    And no additional lunch box is distributed
```

### Progressive Unlocking

```gherkin
Feature: Check-in Workflow
  As an event organizer
  I want attendees to check-in before accessing other services
  So that we can track attendance and control access

  Scenario: Attendee completes check-in process
    Given I am an attendee who hasn't checked in
    When I complete the event check-in
    Then my check-in is recorded
    And "welcome_kit" collection becomes available
    And "networking_session" access becomes available

  Scenario: Attendee tries to access services without check-in
    Given I haven't completed check-in yet
    When I try to collect my welcome kit
    Then I should receive an error "check-in required"
    And the welcome kit remains unavailable
```

### Role-Based Access

```gherkin
Feature: Speaker-Only Resources
  As an event organizer
  I want certain resources to be available only to speakers
  So that we can provide appropriate perks for different attendee types

  Scenario: Speaker accesses speaker lounge
    Given I am an attendee with "speaker" role
    When I view my available services
    Then I should see "speaker_lounge_access" option
    And I can use the speaker lounge service

  Scenario: Regular attendee cannot access speaker resources
    Given I am an attendee with "audience" role
    When I view my available services
    Then I should not see "speaker_lounge_access" option
    And I cannot access speaker-only resources
```

### Conditional Metadata Integration

```gherkin
Feature: Dietary Preference Meals
  As an event organizer
  I want to provide appropriate meals based on attendee dietary preferences
  So that everyone receives suitable food options

  Scenario: Vegetarian attendee sees vegetarian meal option
    Given I have dietary preference "vegetarian" in my profile
    When I view available meal options
    Then I should see "vegetarian_meal" collection option
    And the meal details should show "Vegetarian Option"

  Scenario: Attendee with no dietary restrictions sees standard meal
    Given I have no special dietary preferences
    When I view available meal options
    Then I should see "standard_meal" collection option
    And I should not see specialized meal options
```

## Workflow (with Diagram)

### Workflow 1: Config Ruleset (Organizer)

Organizers can add rulesets through an admin panel. The system supports legacy format conversion to maintain backward compatibility with existing test cases.

```
Legacy JSON Input → Migration Tool → AST Conversion → Event DO KV Storage
```

**Steps:**

1. Admin panel provides migration tool interface
2. Organizer inputs legacy scenario JSON format
3. Migration tool converts to AST-based structure
4. Store in Event's Durable Object KV: `eventDO.set("rulesets", { "rule1": [AST...], "rule2": [AST...] })` with role filtering via RoleCondition
5. Test cases use same migration tool for setup

```mermaid
sequenceDiagram
    participant Organizer
    participant AdminPanel
    participant MigrationTool
    participant EventDO

    Organizer->>AdminPanel: Input legacy JSON format
    AdminPanel->>MigrationTool: Convert legacy format
    MigrationTool->>MigrationTool: Parse to AST structure
    MigrationTool->>EventDO: set("rulesets", converted_data)
    EventDO-->>AdminPanel: Confirmation
    AdminPanel-->>Organizer: Ruleset configured
```

### Workflow 2: Use Ruleset (Attendee Action)

Attendees can execute specific rules through the use endpoint. The system evaluates conditions and updates attendee state accordingly.

```
Action Request → Load from Event DO KV → Load Attendee → Evaluate → Update Metadata → Return Result
```

**Steps:**

1. Attendee makes `/use/{rule_id}` request with token
2. Route to appropriate Event Durable Object
3. Load rulesets from KV: `eventDO.get("rulesets")`
4. Find ruleset by attendee role
5. Load Attendee entity with current metadata
6. `EvaluateService.execute(ruleset, attendee_context)`
7. Update attendee metadata: `_rule_{id}` timestamp
8. Return success/error result

```mermaid
sequenceDiagram
    participant Attendee
    participant API
    participant EventDO
    participant EvaluateService
    participant AttendeeEntity

    Attendee->>API: POST /use/{rule_id}?token=xxx
    API->>EventDO: Route to event instance
    EventDO->>EventDO: get("rulesets")
    EventDO->>AttendeeEntity: Load attendee data
    EventDO->>EvaluateService: execute(ruleset, attendee_context)
    EvaluateService->>EvaluateService: Evaluate conditions & actions
    EvaluateService->>AttendeeEntity: Update metadata (_rule_{id})
    AttendeeEntity-->>API: Updated attendee state
    API-->>Attendee: Success/Error response
```

### Workflow 3: Display Scenario (Status Check)

The status endpoint evaluates all applicable rules for an attendee and returns the complete scenario state including visibility, availability, and usage status.

```
Status Request → Load from Event DO KV → Load Attendee → Evaluate All → Format Response
```

**Steps:**

1. Attendee makes `/status` request with token
2. Route to appropriate Event Durable Object
3. Load rulesets from KV: `eventDO.get("rulesets")`
4. Find ruleset by attendee role
5. Load Attendee entity with current metadata
6. `EvaluateService.evaluateAll(ruleset, attendee_context)` - check visibility, availability, usage status
7. Format into API response with all rule states
8. Return complete scenario display

```mermaid
sequenceDiagram
    participant Attendee
    participant API
    participant EventDO
    participant EvaluateService
    participant AttendeeEntity
    participant Presenter

    Attendee->>API: GET /status?token=xxx
    API->>EventDO: Route to event instance
    EventDO->>EventDO: get("rulesets")
    EventDO->>AttendeeEntity: Load attendee data
    EventDO->>EvaluateService: evaluateAll(ruleset, attendee_context)
    EvaluateService->>EvaluateService: Check all rule conditions
    EvaluateService->>Presenter: Format evaluation results
    Presenter->>API: Formatted response with all scenarios
    API-->>Attendee: Complete scenario status
```

## Domain Model

The domain model uses Clean Architecture principles with an aggregate root pattern. It leverages Strategy and Composite patterns for flexible rule evaluation.

### Aggregate Root - Ruleset

The `Ruleset` is the aggregate root that manages a collection of rules. It provides the entry point for rule evaluation and ensures consistency across the rule collection.

```typescript
export class Ruleset {
  private readonly rules: Map<string, Rule>;

  constructor(rules: Map<string, Rule>) {
    this.rules = new Map(rules);
  }

  getAllRules(): Map<string, Rule> {
    return new Map(this.rules);
  }

  getRule(ruleId: string): Rule | null {
    return this.rules.get(ruleId) || null;
  }

  hasRules(): boolean {
    return this.rules.size > 0;
  }
}
```

### Core Entity - Rule

A `Rule` represents a single action or resource that attendees can access. It encapsulates all the logic for visibility, usability, and execution.

```typescript
export class Rule {
  constructor(
    public readonly id: string,
    public readonly order: number,
    public readonly messages: Map<string, LocalizedText>,
    public readonly timeWindow: TimeWindow,
    public readonly showCondition: ConditionNode,
    public readonly unlockCondition: ConditionNode,
    public readonly metadata: Map<string, unknown>,
  ) {}

  getMessage(messageId: string): LocalizedText | null {
    return this.messages.get(messageId) || null;
  }

  isVisible(context: EvaluationContext): boolean {
    return this.showCondition.evaluate(context);
  }

  isUsable(context: EvaluationContext): boolean {
    return (
      this.unlockCondition.evaluate(context) &&
      this.timeWindow.isAvailable(context.currentTime) &&
      !context.attendee.hasUsedRule(this.id)
    );
  }

  // ... (apply method will be implemented in future phases)
}
}
```

### Condition Nodes (Strategy + Composite Pattern)

Conditions form an Abstract Syntax Tree (AST) that can be evaluated to determine rule visibility and usability.

#### Base Condition

```typescript
export abstract class ConditionNode {
  abstract evaluate(context: EvaluationContext): boolean;
}
```

#### Currently Implemented Conditions

**AlwaysTrueCondition**: A condition that always evaluates to true (for rules without conditions).

```typescript
export class AlwaysTrueCondition extends ConditionNode {
  evaluate(): boolean {
    return true;
  }
}
```

#### Planned Condition Types

The following condition types are planned for future implementation:

**AttributeCondition**: Checks if an attendee attribute matches an expected value.

```typescript
export class AttributeCondition extends ConditionNode {
  constructor(
    private readonly attributeKey: string,
    private readonly expectedValue: string,
  ) {}

  evaluate(context: EvaluationContext): boolean {
    return (
      context.attendee.getMetadata(this.attributeKey) === this.expectedValue
    );
  }
}
```

**UsedRuleCondition**: Checks if another rule has been used.

```typescript
export class UsedRuleCondition extends ConditionNode {
  constructor(private readonly ruleId: string) {}

  evaluate(context: EvaluationContext): boolean {
    return context.attendee.hasUsedRule(this.ruleId);
  }
}
```

**RoleCondition**: Checks if attendee has one of the allowed roles.

```typescript
export class RoleCondition extends ConditionNode {
  constructor(private readonly allowedRoles: string[]) {}

  evaluate(context: EvaluationContext): boolean {
    return this.allowedRoles.includes(context.attendee.role);
  }
}
```

**StaffCondition**: Checks if the query is in staff mode.

```typescript
export class StaffCondition extends ConditionNode {
  constructor(private readonly shouldBeStaff: boolean = true) {}

  evaluate(context: EvaluationContext): boolean {
    return context.isStaffQuery === this.shouldBeStaff;
  }
}
```

#### Composite Conditions

**AndCondition**: All child conditions must be true.

```typescript
export class AndCondition extends ConditionNode {
  constructor(private readonly children: ConditionNode[]) {}

  evaluate(context: EvaluationContext): boolean {
    return this.children.every((child) => child.evaluate(context));
  }
}
```

**OrCondition**: At least one child condition must be true.

```typescript
export class OrCondition extends ConditionNode {
  constructor(private readonly children: ConditionNode[]) {}

  evaluate(context: EvaluationContext): boolean {
    return this.children.some((child) => child.evaluate(context));
  }
}
```

### Action Nodes (Strategy Pattern)

Actions are executed when a rule is applied successfully.

#### Base Action

```typescript
export abstract class ActionNode {
  abstract execute(context: ExecutionContext): void;
}
```

#### Concrete Actions

**MarkUsedAction**: Marks a rule as used by storing a timestamp in attendee metadata.

```typescript
export class MarkUsedAction extends ActionNode {
  constructor(private readonly ruleId: string) {}

  execute(context: ExecutionContext): void {
    const timestamp = Math.floor(context.currentTime.getTime() / 1000);
    context.attendee.setMetadata(`_rule_${this.ruleId}`, timestamp.toString());
  }
}
```

#### Planned Action Types

Additional action types planned for future implementation:

- **SetMetadataAction**: Sets specific metadata values on the attendee
- **IncrementCounterAction**: Increments usage counters for resource tracking

### Supporting Value Objects

#### TimeWindow

Represents the availability period for a rule.

```typescript
export class TimeWindow {
  constructor(
    public readonly start: Date,
    public readonly end: Date,
  ) {}

  isAvailable(current: Date): boolean {
    return current >= this.start && current <= this.end;
  }
}
```

#### LocalizedText

Handles internationalized text with fallback support using Locale enum.

```typescript
export class LocalizedText {
  constructor(private readonly translations: Map<Locale, string>) {}

  getText(locale: string): string {
    return (
      this.translations.get(locale as Locale) ||
      this.translations.get(Locale.EnUs) ||
      ""
    );
  }

  getAllTranslations(): Map<Locale, string> {
    return new Map(this.translations);
  }
}
```

#### MetadataMapping

Maps attendee metadata to rule-specific display attributes for API responses.

```typescript
export class MetadataMapping {
  constructor(private readonly mappings: Map<string, string>) {}

  // Maps attendee metadata to scenario display format
  // e.g. attendee.metadata["飲食"] -> scenario.attr["diet"]
  applyToDisplay(attendeeMetadata: Map<string, any>): Map<string, any> {
    const result = new Map<string, any>();
    this.mappings.forEach((attendeeKey, displayKey) => {
      if (attendeeMetadata.has(attendeeKey)) {
        result.set(displayKey, attendeeMetadata.get(attendeeKey));
      }
    });
    return result;
  }
}
```

### Contexts

#### EvaluationContext

Provides the context needed for evaluating rule conditions.

```typescript
export class EvaluationContext {
  constructor(
    public readonly attendee: Attendee,
    public readonly currentTime: Date,
    public readonly isStaffQuery: boolean = false,
  ) {}
}
```

#### ExecutionContext

Provides the context needed for executing rule actions.

```typescript
export class ExecutionContext {
  constructor(
    public readonly attendee: Attendee,
    public readonly currentTime: Date,
  ) {}
}
```

### Design Patterns Summary

- **Aggregate Pattern**: `Ruleset` as the aggregate root managing `Rule` entities
- **Strategy Pattern**: Different condition types (`AttributeCondition`, `UsedRuleCondition`, `RoleCondition`, `StaffCondition`) and action types (`MarkUsedAction`)
- **Composite Pattern**: `AndCondition` and `OrCondition` containing child conditions
- **Value Object Pattern**: Immutable objects (`TimeWindow`, `LocalizedText`, `MetadataMapping`) for data integrity

## Schema

The ruleset system stores all configuration in the Event Durable Object's KV storage. Each event has its own isolated storage instance.

### KV Storage Structure

Rulesets are stored under a single key for atomic updates:

```typescript
durableObject.set("rulesets", {
  /* ruleset data */
});
```

### Ruleset Schema

The ruleset uses a flat structure with rule IDs as keys, storing the full AST. Role filtering is handled by RoleCondition evaluation in the AST:

```json
{
  "day1checkin": {
    "version": "1.0",
    "order": 0,
    "messages": {
      "display": {
        "en-US": "Day 1 Check-in",
        "zh-TW": "第一天報到"
      },
      "locked": {
        "en-US": "Check-in not available",
        "zh-TW": "報到尚未開放"
      },
      "expired": {
        "en-US": "Check-in period has ended",
        "zh-TW": "報到時間已結束"
      },
      "already_used": {
        "en-US": "Already checked in",
        "zh-TW": "已完成報到"
      }
    },
    "timeWindow": {
      "start": "2023-08-26T00:00:00Z",
      "end": "2023-09-26T00:00:00Z"
    },
    "conditions": {
      "show": { "type": "AlwaysTrue" },
      "unlock": { "type": "AlwaysTrue" }
    },
    "actions": [{ "type": "MarkUsed", "ruleId": "day1checkin" }],
    "metadata": {}
  },
  "speaker_lounge": {
    "version": "1.0",
    "order": 1,
    "messages": {
      "display": {
        "en-US": "Speaker Lounge Access",
        "zh-TW": "講者休息室"
      }
    },
    "timeWindow": {
      "start": "2023-08-26T00:00:00Z",
      "end": "2023-09-26T00:00:00Z"
    },
    "conditions": {
      "show": {
        "type": "Role",
        "allowedRoles": ["speaker"]
      },
      "unlock": { "type": "AlwaysTrue" }
    },
    "actions": [{ "type": "MarkUsed", "ruleId": "speaker_lounge" }],
    "metadata": {}
  }
}
```

### Rule Schema

Each rule contains:

| Field        | Type   | Required | Description                                  |
| ------------ | ------ | -------- | -------------------------------------------- |
| `version`    | string | Yes      | Schema version for future migrations         |
| `order`      | number | Yes      | Display order (lower numbers appear first)   |
| `messages`   | object | Yes      | Map of message IDs to internationalized text |
| `timeWindow` | object | Yes      | Availability period with start/end dates     |
| `conditions` | object | Yes      | Show and unlock conditions                   |
| `actions`    | array  | Yes      | Actions to execute when rule is used         |
| `metadata`   | object | Yes      | Metadata mapping configuration               |

### Condition AST Schema

Conditions use a polymorphic structure with a `type` field:

#### Leaf Conditions

```json
// Always true (no conditions)
{ "type": "AlwaysTrue" }

// Check attendee attribute
{
  "type": "Attribute",
  "key": "個人贊助",
  "value": "Y"
}

// Check if another rule was used
{
  "type": "UsedRule",
  "ruleId": "checkin"
}

// Check attendee role
{
  "type": "Role",
  "allowedRoles": ["audience", "speaker"]
}

// Check staff query mode
{
  "type": "Staff",
  "shouldBeStaff": false
}
```

#### Composite Conditions

```json
// All conditions must be true
{
  "type": "And",
  "children": [
    { "type": "Attribute", "key": "tier", "value": "VIP" },
    { "type": "UsedRule", "ruleId": "checkin" }
  ]
}

// At least one condition must be true
{
  "type": "Or",
  "children": [
    { "type": "Attribute", "key": "early_bird", "value": "true" },
    { "type": "Attribute", "key": "tier", "value": "VIP" }
  ]
}
    { "type": "UsedRule", "ruleId": "checkin" }
  ]
}

// At least one condition must be true
{
  "type": "Or",
  "children": [
    { "type": "Attribute", "key": "early_bird", "value": "true" },
    { "type": "Attribute", "key": "tier", "value": "VIP" }
  ]
}
```

### Action AST Schema

Actions use the same polymorphic structure:

```json
// Mark rule as used
{
  "type": "MarkUsed",
  "ruleId": "checkin"
}
```

Future action types can be added:

```json
// Examples of potential future actions
{ "type": "SendNotification", "template": "welcome" }
{ "type": "GrantBadge", "badgeId": "early_bird" }
{ "type": "AddPoints", "amount": 100 }
```

### Metadata Mapping Schema

Maps attendee attributes to rule-specific display attributes:

```json
{
  "metadata": {
    "diet": { "key": "飲食" },
    "allergies": { "key": "過敏原" }
  }
}
```

This maps:

- `attendee.metadata["飲食"]` → `scenario.attr["diet"]`
- `attendee.metadata["過敏原"]` → `scenario.attr["allergies"]`

### Schema Design Principles

1. **Single KV Entry**: All rulesets stored under one key for atomic updates
2. **Flat Rule Structure**: Rules are stored as a flat object with rule IDs as keys
3. **Simple Time Format**: Store times as human-readable GMT strings
4. **Condition Args Array**: Use `args` array for condition parameters for flexibility
5. **Optional Fields**: Most fields are optional with sensible defaults
6. **Extensibility**: New condition types can be added without breaking existing data

## Technology Details

### AST Parser Implementation

The parser converts JSON schema to domain objects using a factory pattern:

```typescript
export class ConditionNodeFactory {
  static create(json: any): ConditionNode {
    switch (json.type) {
      case "AlwaysTrue":
        return new AlwaysTrueCondition();
      case "Attribute":
        return new AttributeCondition(json.key, json.value);
      case "UsedRule":
        return new UsedRuleCondition(json.ruleId);
      case "Role":
        return new RoleCondition(json.allowedRoles);
      case "Staff":
        return new StaffCondition(json.shouldBeStaff);
      case "And":
        return new AndCondition(
          json.children.map((child) => ConditionNodeFactory.create(child)),
        );
      case "Or":
        return new OrCondition(
          json.children.map((child) => ConditionNodeFactory.create(child)),
        );
      default:
        throw new Error(`Unknown condition type: ${json.type}`);
    }
  }
}

export class ActionNodeFactory {
  static create(json: any): ActionNode {
    switch (json.type) {
      case "MarkUsed":
        return new MarkUsedAction(json.ruleId);
      // TODO: Add more action types as needed
      default:
        throw new Error(`Unknown action type: ${json.type}`);
    }
  }
}
```

### Migration Tool

Converts legacy scenario format to new AST-based ruleset format:

```typescript
export class LegacyMigrationTool {
  static migrate(legacyScenarios: any): RulesetJson {
    // TODO: Implement conversion logic
    // - Convert available_time to timeWindow
    // - Convert conditions.show to showCondition AST
    // - Convert conditions.unlock to unlockCondition AST
    // - Generate default actions (MarkUsed)
    // - Handle metadata mappings
    // Note: Admin panel integration will be supported in future
  }

  static validate(ruleset: RulesetJson): ValidationResult {
    // TODO: Validate converted AST structure
    // - Check all required fields
    // - Validate condition references
    // - Ensure action consistency
  }
}
```

### Service Layer

#### RuleFactory

Factory service for creating Rule entities from JSON data:

```typescript
@injectable()
export class RuleFactory {
  createRule(ruleId: string, ruleJson: Record<string, unknown>): Rule {
    // Parse messages, timeWindow, conditions, metadata
    // ...
    return new Rule(
      ruleId,
      order,
      messages,
      timeWindow,
      showCondition,
      unlockCondition,
      metadata,
    );
  }

  createRulesFromRuleset(
    rulesetData: Record<string, unknown>,
  ): Map<string, Rule> {
    // ...
  }
}
```

#### Repository Interface

```typescript
export interface RulesetRepository {
  load(): Promise<Ruleset>;
}

@injectable()
export class DoRulesetRepository implements RulesetRepository {
  constructor(
    @inject(DatabaseConnectionToken)
    private readonly connection: IDatabaseConnection,
    @inject(RuleFactoryToken)
    private readonly ruleFactory: RuleFactory,
  ) {}

  async load(): Promise<Ruleset> {
    const ruleData =
      await this.connection.getValue<Record<string, unknown>>("rulesets");
    if (!ruleData) {
      return new Ruleset(new Map());
    }
    const rules = this.ruleFactory.createRulesFromRuleset(ruleData);
    return new Ruleset(rules);
  }
}
```

#### RuleEvaluationService

```typescript
@injectable()
export class RuleEvaluationService {
  evaluateForAttendee(
    ruleset: Ruleset,
    attendee: Attendee,
    currentTime: Date,
    isStaffQuery: boolean = false,
  ): EvaluationResult {
    // Create evaluation context and evaluate all rules
    // ...
  }
}
```

### EvaluationResult Value Objects

The ruleset system uses value objects to encapsulate rule evaluation state and provide type-safe access to scenario data.

```typescript
// Value object representing the result of evaluating a single rule
export class RuleEvaluationResult {
  constructor(
    public readonly ruleId: string,
    public readonly visible: boolean,
    public readonly usable: boolean,
    public readonly used: boolean,
    public readonly usedAt: Date | null,
    public readonly messages: Map<string, LocalizedText>,
    public readonly attributes: Map<string, any>, // Mapped metadata
    public readonly order: number,
    public readonly timeWindow: TimeWindow,
  ) {}

  // Get appropriate message based on current state
  getCurrentMessage(messageId: string): LocalizedText | null {
    if (this.used) return this.messages.get("already_used");
    if (!this.usable) return this.messages.get("locked");
    return this.messages.get(messageId) || this.messages.get("display");
  }
}

// Aggregate result for all rules evaluated for an attendee
export class EvaluationResult {
  constructor(private readonly results: Map<string, RuleEvaluationResult>) {}

  // Get all visible rules sorted by order
  getVisibleRules(): RuleEvaluationResult[] {
    return Array.from(this.results.values())
      .filter((result) => result.visible)
      .sort((a, b) => a.order - b.order);
  }

  // Get specific rule result
  getRule(ruleId: string): RuleEvaluationResult | null {
    return this.results.get(ruleId) || null;
  }

  // Check if any rules are available for use
  hasUsableRules(): boolean {
    return Array.from(this.results.values()).some(
      (result) => result.visible && result.usable,
    );
  }
}
```

### Use Case Implementation

```typescript
// Query for displaying available rules using EvaluationResult
export class GetAttendeeStatusQuery {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly rulesetRepository: RulesetRepository,
    private readonly evaluationService: RuleEvaluationService,
    private readonly presenter: AttendeeStatusPresenter,
  ) {}

  async execute(token: string, isStaffQuery = false): Promise<void> {
    // Load attendee
    const attendee = await this.attendeeRepository.findAttendeeByToken(token);
    if (!attendee) throw new Error("Attendee not found");

    // Auto check-in logic
    if (!isStaffQuery && !attendee.firstUsedAt) {
      attendee.checkIn(new Date());
      await this.attendeeRepository.save(attendee);
    }

    // Generate evaluation result
    const evaluationResult = await this.evaluationService.evaluateForAttendee(
      attendee,
      isStaffQuery,
    );

    // Pass to presenter
    this.presenter.setAttendee(attendee);
    this.presenter.setEvaluationResult(evaluationResult);
  }
}

// Command for using a rule
export class UseRuleCommand {
  constructor(
    private readonly repository: RulesetRepository,
    private readonly attendeeRepository: AttendeeRepository,
  ) {}

  async execute(attendeeToken: string, ruleId: string): Promise<void> {
    // TODO: Load attendee
    // TODO: Load ruleset
    // TODO: Find and validate rule
    // TODO: Apply rule actions
    // TODO: Save attendee state
  }
}
```

### Service Layer

```typescript
@injectable()
export class RuleEvaluationService {
  constructor(
    @inject(DatetimeServiceToken)
    private readonly datetimeService: IDatetimeService,
  ) {}

  async evaluateForAttendee(
    ruleset: Ruleset,
    attendee: Attendee,
    isStaffQuery: boolean = false,
  ): Promise<EvaluationResult> {
    if (!ruleset.hasRules()) {
      return new EvaluationResult(new Map()); // Empty result
    }

    // Create evaluation context
    const currentTime = this.datetimeService.getCurrentTime();
    const context = new EvaluationContext(attendee, currentTime, isStaffQuery);

    // Evaluate each rule in the ruleset
    const results = new Map<string, RuleEvaluationResult>();

    // Process each rule - role filtering happens via condition evaluation
    for (const [ruleId, ruleData] of Object.entries(ruleset.getAllRules())) {
      const ruleResult = this.evaluateRule(ruleId, ruleData, context);
      results.set(ruleId, ruleResult);
    }

    return new EvaluationResult(results);
  }

  private evaluateRule(
    ruleId: string,
    ruleData: Record<string, unknown>,
    context: EvaluationContext,
  ): RuleEvaluationResult {
    // For now, hardcode the evaluation logic (will be replaced with proper AST evaluation)
    const visible = true; // AlwaysTrue condition
    const usable = true; // Basic time window check would go here

    // Check usage status
    const used = context.attendee.hasUsedRule(ruleId);
    const usedAt = used ? context.attendee.getRuleUsedAt(ruleId) : null;

    // Parse messages and other data from raw rule data
    // (Implementation details for parsing JSON to domain objects)

    return new RuleEvaluationResult(
      ruleId,
      visible,
      usable,
      used,
      usedAt,
      /* parsed messages */,
      /* parsed attributes */,
      /* parsed order */,
      /* parsed timeWindow */,
    );
  }
}

@injectable()
export class DatetimeService implements IDatetimeService {
  getCurrentTime(): Date {
    // Check if we're in test mode and return mock datetime
    if (env.__TEST__ === "true" && env.__MOCK_DATETIME__) {
      return new Date(env.__MOCK_DATETIME__);
    }
    return new Date();
  }
}
```

### EvaluationResult Generation Flow

The `EvaluationResult` is generated through a systematic evaluation process that combines domain logic, AST evaluation, and metadata mapping.

#### Generation Process

```
1. Controller receives request
2. Use Case loads attendee + calls evaluation service
3. Service loads ruleset from repository
4. Service creates evaluation context
5. Service evaluates each rule:
   - Rule checks visibility (showCondition.evaluate())
   - Rule checks usability (unlockCondition.evaluate() + time + usage)
   - Service applies metadata mapping
   - Service creates RuleEvaluationResult
6. Service creates EvaluationResult from all rule results
7. Use Case passes EvaluationResult to presenter
8. Presenter converts to API format
```

#### Key Generation Components

**Context Creation**: Combines attendee state, current time, and staff query flag for rule evaluation.

```typescript
// Create evaluation context with all necessary data
const currentTime = this.datetimeService.getCurrentTime();
const context = new EvaluationContext(attendee, currentTime, isStaffQuery);
```

**AST Evaluation**: Each condition node evaluates against the context using the Strategy pattern.

```typescript
// Condition nodes implement evaluation logic
export class AttributeCondition extends ConditionNode {
  evaluate(context: EvaluationContext): boolean {
    return (
      context.attendee.getMetadata(this.attributeKey) === this.expectedValue
    );
  }
}

export class AndCondition extends ConditionNode {
  evaluate(context: EvaluationContext): boolean {
    return this.children.every((child) => child.evaluate(context));
  }
}
```

**State Aggregation**: Service combines visibility, usability, and usage status into immutable result objects.

```typescript
// Aggregate all evaluation states
return new RuleEvaluationResult(
  rule.id,
  visible, // Can attendee see this rule?
  usable, // Can attendee use this rule right now?
  used, // Has attendee already used this rule?
  usedAt, // When was it used (if applicable)?
  rule.messages, // All i18n messages for different states
  attributes, // Mapped metadata for display
  rule.order, // Display order
  rule.timeWindow, // Availability window
);
```

**Metadata Mapping**: Transforms attendee attributes to display format for API responses.

```typescript
// Apply metadata mapping for display
const attributes = rule.metadataMapping.applyToDisplay(
  context.attendee.getMetadata(),
);
// attendee.metadata["飲食"] -> scenario.attr["diet"]
```

#### Benefits of this Approach

- **Immutable Results**: `EvaluationResult` provides read-only access to computed state
- **Type Safety**: Eliminates `Record<string, any>` in favor of structured data
- **Domain Logic Encapsulation**: All rule evaluation logic stays in domain entities
- **Separation of Concerns**: Service orchestrates evaluation, entities handle business rules
- **Testability**: Each component can be tested independently with mock contexts

### API Integration

```typescript
// Status endpoint controller
export class StatusController extends OpenAPIRoute {
  schema = {
    // TODO: Define OpenAPI schema
  };

  async handle(c: Context<{ Bindings: Env }>) {
    const token = c.req.query("token");

    // Resolve dependencies
    const repository = container.resolve<RulesetRepository>(
      RulesetRepositoryToken,
    );
    const presenter = new JsonRuleListPresenter();

    // Execute query
    const query = new GetAvailableRulesQuery(repository, presenter);
    await query.execute(attendee, currentTime);

    return c.json(presenter.toJson());
  }
}

// Use rule endpoint controller
export class UseRuleController extends OpenAPIRoute {
  schema = {
    // TODO: Define OpenAPI schema
  };

  async handle(c: Context<{ Bindings: Env }>) {
    const { ruleId } = c.req.param();
    const token = c.req.query("token");

    try {
      // TODO: Execute UseRuleCommand
      return c.json({ success: true });
    } catch (error) {
      return c.json({ message: error.message }, 400);
    }
  }
}
```

### Testing Strategy

```typescript
// BDD step definition
Given("the ruleset is:", async function (rulesetJson: string) {
  // Parse the ruleset JSON
  const ruleset = JSON.parse(rulesetJson);

  // Get the database connection for the event
  const database = await this.getDatabase();

  // Store all rules together - role filtering happens via condition evaluation
  await database.setValue("rulesets", ruleset);
});

// Unit test example
describe("AndCondition", () => {
  it("should return true when all children are true", () => {
    const condition = new AndCondition([
      new AlwaysTrueCondition(),
      new AlwaysTrueCondition(),
    ]);

    const context = new EvaluationContext(attendee, new Date());
    expect(condition.evaluate(context)).toBe(true);
  });

  // TODO: Add more test cases
});
```

### Performance Considerations

```typescript
// KV Storage Optimization
class CachedRulesetRepository implements RulesetRepository {
  private cache: Map<string, Ruleset> | null = null;

  async load(): Promise<Map<string, Ruleset>> {
    if (this.cache) return this.cache;

    // TODO: Load from KV and cache
    // TODO: Implement cache invalidation strategy
  }
}

// Concurrent Request Handling
// Durable Objects handle concurrency automatically
// Each event has isolated storage and processing
```

## Example Usage

### Basic Check-in Flow

```typescript
// 1. Configure ruleset for event
const checkInRuleset = {
  "audience": {
    "version": "1.0",
    "rules": [
      {
        "id": "checkin",
        "order": 0,
        "displayText": {
          "en-US": "Event Check-in",
          "zh-TW": "活動報到"
        },
        "timeWindow": {
          "start": "2024-03-01T08:00:00Z",
          "end": "2024-03-01T18:00:00Z"
        },
        "conditions": {
          "show": { "type": "AlwaysTrue" },
          "unlock": { "type": "AlwaysTrue" }
        },
        "lockedMessage": {
          "en-US": "Check-in is not available",
          "zh-TW": "報到尚未開放"
        },
        "actions": [
          { "type": "MarkUsed", "ruleId": "checkin" }
        ],
        "metadata": {}
      }
    ]
  }
}

// 2. Attendee views available scenarios
// GET /status?token=xxx
{
  "scenario": {
    "checkin": {
      "order": 0,
      "available_time": 1709280000,
      "expire_time": 1709316000,
      "display_text": {
        "en-US": "Event Check-in",
        "zh-TW": "活動報到"
      },
      "used": null,
      "disabled": null,
      "attr": {}
    }
  }
}

// 3. Attendee performs check-in
// GET /use/checkin?token=xxx
{
  "success": true,
  "scenario": {
    "checkin": {
      "used": 1709290000,
      // ... other fields
    }
  }
}
```

### Progressive Unlocking Example

```typescript
// Ruleset with dependencies
const progressiveRuleset = {
  audience: {
    version: "1.0",
    rules: [
      {
        id: "checkin",
        order: 0,
        displayText: {
          "en-US": "Check-in",
          "zh-TW": "報到",
        },
        conditions: {
          show: { type: "AlwaysTrue" },
          unlock: { type: "AlwaysTrue" },
        },
        // ... other fields
      },
      {
        id: "welcome_kit",
        order: 1,
        displayText: {
          "en-US": "Welcome Kit",
          "zh-TW": "迎賓袋",
        },
        conditions: {
          show: { type: "AlwaysTrue" },
          unlock: { type: "UsedRule", ruleId: "checkin" },
        },
        lockedMessage: {
          "en-US": "Please check-in first",
          "zh-TW": "請先完成報到",
        },
        // ... other fields
      },
      {
        id: "lunch",
        order: 2,
        displayText: {
          "en-US": "Lunch Box",
          "zh-TW": "午餐",
        },
        conditions: {
          show: { type: "AlwaysTrue" },
          unlock: {
            type: "And",
            children: [
              { type: "UsedRule", ruleId: "checkin" },
              { type: "Attribute", key: "meal_ticket", value: "Y" },
            ],
          },
        },
        // ... other fields
      },
    ],
  },
};
```

### Conditional Access Example

```typescript
// VIP-only scenarios
const vipRuleset = {
  audience: {
    version: "1.0",
    rules: [
      {
        id: "vip_lounge",
        order: 0,
        displayText: {
          "en-US": "VIP Lounge Access",
          "zh-TW": "VIP 休息室",
        },
        conditions: {
          show: {
            type: "Attribute",
            key: "tier",
            value: "VIP",
          },
          unlock: { type: "AlwaysTrue" },
        },
        // ... other fields
      },
      {
        id: "special_gift",
        order: 1,
        displayText: {
          "en-US": "Special Gift",
          "zh-TW": "特別禮品",
        },
        conditions: {
          show: {
            type: "Or",
            children: [
              { type: "Attribute", key: "tier", value: "VIP" },
              { type: "Attribute", key: "speaker", value: "Y" },
            ],
          },
          unlock: { type: "UsedRule", ruleId: "checkin" },
        },
        // ... other fields
      },
    ],
  },
};
```

### Metadata Mapping Example

```typescript
// Dietary preference display
const mealRuleset = {
  "audience": {
    "version": "1.0",
    "rules": [
      {
        "id": "lunch",
        "order": 0,
        "displayText": {
          "en-US": "Lunch",
          "zh-TW": "午餐"
        },
        "conditions": {
          "show": { "type": "AlwaysTrue" },
          "unlock": { "type": "UsedRule", "ruleId": "checkin" }
        },
        "metadata": {
          "diet": { "key": "飲食" },
          "allergies": { "key": "過敏原" }
        },
        // ... other fields
      }
    ]
  }
}

// Attendee with metadata
{
  "token": "xxx",
  "metadata": {
    "飲食": "素食",
    "過敏原": "花生"
  }
}

// Status response shows mapped metadata
{
  "scenario": {
    "lunch": {
      "display_text": {
        "en-US": "Lunch",
        "zh-TW": "午餐"
      },
      "attr": {
        "diet": "素食",
        "allergies": "花生"
      }
      // ... other fields
    }
  }
}
```

### Error Handling Examples

```typescript
// Attempting to use locked scenario
// GET /use/welcome_kit?token=xxx (without check-in)
{
  "message": "Please check-in first"
}

// Attempting to use already-used scenario
// GET /use/checkin?token=xxx (second attempt)
{
  "message": "has been used"
}

// Attempting to use invisible scenario
// GET /use/vip_lounge?token=xxx (non-VIP attendee)
{
  "message": "invalid scenario"
}
```
