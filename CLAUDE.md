# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CCIP Serverless is the serverless OPass backend built on Cloudflare Workers with Durable Objects. This is a rewritten version from v1-legacy that will replace the old design. The application uses Hono.js for HTTP handling, Drizzle ORM for database operations, and TSyringe for dependency injection.

## Development Commands

### Build & Development

- `pnpm dev` - Start development server with Vite
- `pnpm build` - Build the project for production
- `pnpm deploy` - Build and deploy to Cloudflare Workers

### Code Quality

- `pnpm lint` - Run ESLint on src directory
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Run Prettier to format all files

### Testing

- `pnpm e2e` - Run Cucumber.js BDD tests

### Database & Code Generation

- `pnpm gen:migration` - Generate Drizzle ORM migrations
- `pnpm cf-typegen` - Generate Cloudflare Worker types (includes Env interface)

## Architecture

### Technology Stack

- **Runtime**: Cloudflare Workers with Durable Objects
- **Framework**: Hono.js with JSX runtime
- **Database**: SQLite via Drizzle ORM with Durable Objects storage
- **API Documentation**: Chanfana (OpenAPI integration)
- **Dependency Injection**: TSyringe with reflection support
- **Testing**: Cucumber.js for BDD testing

### Key Components

**Entry Points**:

- `src/index.tsx` - Main application entry with Hono app setup
- `src/renderer.tsx` - JSX renderer configuration

**Database Layer**:

- `src/infra/DatabaseConnector.ts` - Database connection abstraction pattern
- `src/infra/EventDatabase.ts` - Durable Object for database operations
- `src/db/schema.ts` - Drizzle database schema definitions

**Entity Layer**:

- `src/entity/` - Pure domain objects with business logic
- No framework dependencies or external imports
- Self-contained with all related behavior

**Repository Pattern**:

- `src/repository/DoAttendeeRepository.ts` - Attendee data access layer
- Uses DatabaseConnector for consistent data access

**Use Cases Layer**:

- `src/usecase/` - Business logic and use case implementations
- `src/usecase/interface.ts` - Repository interfaces and dependency injection tokens
- Use cases are plain classes without @injectable decorator (entities and use cases have no dependencies)

**Presenter Layer**:

- `src/presenter/` - Output formatters that define API response schemas
- Convert domain entities to API-specific data structures
- Implement presenter interfaces defined in use case layer

**API Controllers**:

- `src/handler/api/` - API route controllers using Chanfana OpenAPI
- Controllers extend OpenAPIRoute base class

### Database Schema

Current schema includes:

- **attendees**: `token` (PK), `display_name`, `first_used_at`, `role`

### Path Aliases

- `@/*` maps to `src/*` - use absolute imports for better maintainability

## Development Workflow

### Required Commands After Changes

**IMPORTANT**: After making code changes, you MUST run these commands in order:

1. `pnpm format` - Format code with Prettier
2. `pnpm tsc` - Check TypeScript types
3. `pnpm e2e` - Run BDD tests to verify functionality

This ensures code consistency and prevents breaking existing functionality.

## Development Patterns

### Database Access Pattern

Database connections are managed through dependency injection:

```typescript
// ✅ Correct - Container manages database connection
export function configureContainer(env: Env) {
  const dbConnection = DatabaseConnector.build(
    env.EVENT_DATABASE,
    "ccip-serverless",
  );
  container.register(DatabaseConnectionToken, { useValue: dbConnection });
  container.register(AttendeeRepositoryToken, {
    useClass: DoAttendeeRepository,
  });
}

// ❌ Wrong - Manual connection creation in controllers
const conn = DatabaseConnector.build(env.EVENT_DATABASE, "ccip-serverless");
const repository = new DoAttendeeRepository(conn);
```

### API Controller Pattern

Controllers extend OpenAPIRoute and use dependency injection:

```typescript
export class ExampleController extends OpenAPIRoute {
  schema = {
    /* OpenAPI schema */
  };

  async handle(c: Context<{ Bindings: Env }>) {
    // ✅ Correct - Use container.resolve()
    const repository = container.resolve<AttendeeRepository>(
      AttendeeRepositoryToken,
    );

    // Implementation using resolved dependencies
  }
}
```

### Repository Pattern

Repositories are injectable and use interface dependencies:

```typescript
@injectable()
export class DoAttendeeRepository implements AttendeeRepository {
  constructor(
    @inject(DatabaseConnectionToken)
    private readonly connection: IDatabaseConnection,
  ) {}

  async findByToken(token: string): Promise<Schema | null> {
    const res = await this.connection.executeAll(
      sql`SELECT * FROM table WHERE token = ${token}`,
    );
    return res.length > 0 ? res[0] : null;
  }
}
```

### Clean Architecture Principles

**CCIP Serverless follows Clean Architecture with strict layer separation:**

#### Layer Structure

1. **Entities** (`src/entity/`): Pure domain objects with business rules
2. **Use Cases** (`src/usecase/`): Application business logic
3. **Interface Adapters** (`src/presenter/`, `src/repository/`): Convert data between layers
4. **Frameworks & Drivers** (`src/handler/`, `src/infra/`): External concerns

#### Entity Layer Rules

- **Pure domain objects**: No framework dependencies or external imports
- **Business rules only**: Core domain logic and invariants
- **Self-contained**: All behavior related to the entity

```typescript
// ✅ Correct - Pure domain entity
export class Announcement {
  private messages: Map<AnnouncementLocale, string> = new Map();
  private _publishedAt?: Date;

  constructor(
    public readonly id: string,
    public readonly uri: string,
  ) {}

  setMessage(locale: AnnouncementLocale, content: string): void {
    this.messages.set(locale, content);
  }

  publish(time: Date): void {
    this._publishedAt = time;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }
}
```

#### Use Case Layer Rules

- **Application logic**: Orchestrate entities and repositories
- **Framework-free**: No DI decorators, pure constructor injection
- **Presenter pattern**: Use presenters for output formatting instead of returning data directly

```typescript
// ✅ Correct - Use case with presenter pattern
export class AllAnnouncementQuery {
  constructor(private readonly presenter: AnnouncementListPresenter) {}

  async execute(token?: string): Promise<void> {
    // Business logic here
    // Call presenter.addAnnouncement() for each result
  }
}

// ❌ Wrong - Use case returning data directly
export class AllAnnouncementQuery {
  async execute(token?: string): Promise<AnnouncementData[]> {
    return []; // Don't return API-specific data
  }
}
```

#### Presenter Pattern

- **API schema definition**: Presenters define output format, not use cases
- **Data transformation**: Convert domain entities to API responses
- **Layer separation**: Keep domain logic separate from presentation concerns

```typescript
// ✅ Correct - Presenter defines API schema
export class JsonAnnouncementListPresenter
  implements AnnouncementListPresenter
{
  private announcements: Announcement[] = [];

  addAnnouncement(announcement: Announcement): void {
    this.announcements.push(announcement);
  }

  toJson(): AnnouncementData[] {
    return this.announcements.map((announcement) => ({
      datetime: announcement.publishedAt
        ? Math.floor(announcement.publishedAt.getTime() / 1000)
        : 0,
      msgEn: announcement.getMessage(AnnouncementLocale.EN) || "",
      msgZh: announcement.getMessage(AnnouncementLocale.ZH_TW) || "",
      uri: announcement.uri,
    }));
  }
}
```

#### Controller Integration

- **Dependency resolution**: Controllers handle all DI and object creation
- **Use case orchestration**: Create presenters and inject into use cases
- **Response formatting**: Get final output from presenters

```typescript
// ✅ Correct - Controller orchestrates clean architecture
async handle(c: Context<{ Bindings: Env }>) {
  const presenter = new JsonAnnouncementListPresenter();
  const useCase = new AllAnnouncementQuery(presenter);
  await useCase.execute(query.token);
  return c.json(presenter.toJson());
}
```

### Dependency Injection Patterns

**Use symbols for dependency injection tokens:**

```typescript
// ✅ Correct - Symbol-based tokens
export const AttendeeRepositoryToken = Symbol("AttendeeRepository");
export interface AttendeeRepository {
  findAttendeeByToken(token: string): Promise<Attendee | null>;
}

// ❌ Wrong - String-based tokens
container.register("AttendeeRepository", { useValue: repository });
```

**Token and interface placement by layer:**

- **Domain interfaces and tokens**: `src/usecase/interface.ts` (e.g., `AttendeeRepository`, `AttendeeRepositoryToken`)
- **Infrastructure interfaces and tokens**: `src/infra/` (e.g., `IDatabaseConnection`, `DatabaseConnectionToken`)

**Repository dependency injection:**

```typescript
// ✅ Correct - Injectable repository with interface dependency
@injectable()
export class DoAttendeeRepository implements AttendeeRepository {
  constructor(
    @inject(DatabaseConnectionToken)
    private readonly connection: IDatabaseConnection,
  ) {}
}
```

**Container registration patterns:**

```typescript
// ✅ Correct - Register infrastructure dependencies as useValue
container.register(DatabaseConnectionToken, { useValue: dbConnection });

// ✅ Correct - Register repositories as useClass for DI
container.register(AttendeeRepositoryToken, { useClass: DoAttendeeRepository });

// ❌ Wrong - Manual instantiation bypasses DI
container.register(AttendeeRepositoryToken, {
  useValue: new DoAttendeeRepository(connection),
});
```

**Controller dependency resolution:**

```typescript
// ✅ Correct - Use container.resolve() in controllers
const attendeeRepository = container.resolve<AttendeeRepository>(
  AttendeeRepositoryToken,
);

// ❌ Wrong - Manual instantiation in controllers
const connection = DatabaseConnector.build(c.env.EVENT_DATABASE, "name");
const attendeeRepository = new DoAttendeeRepository(connection);
```

## Type System

### Cloudflare Worker Types

**IMPORTANT**: The `Env` interface is auto-generated by `pnpm cf-typegen`, do NOT import from Hono:

```typescript
// ❌ Wrong - Will cause type check failures
import { Context, Env } from "hono";

// ✅ Correct - Import Context only, Env is globally available
import { Context } from "hono";

// Use correct type for controllers
async handle(c: Context<{ Bindings: Env }>) {
  // Access environment via c.env
  const database = c.env.EVENT_DATABASE;
}

// Env interface is automatically available and includes:
interface Env {
  EVENT_DATABASE: DurableObjectNamespace<EventDatabase>;
}
```

Run `pnpm cf-typegen` after changing `wrangler.jsonc` to regenerate types.

## API Development Workflow

### Adding New API Endpoints

When implementing new API endpoints, follow this systematic approach:

1. **Feature-Driven Development**: Start with BDD feature files to define expected behavior
2. **Clean Architecture Flow**: Implement layers in dependency order (Entity → Use Case → Presenter → Controller)
3. **Entity First**: Add business logic methods to entities (e.g., `checkIn()` for usage tracking)
4. **Repository Methods**: Add persistence methods like `save()` for entity state changes
5. **Use Case Implementation**: Orchestrate business logic without returning data directly
6. **Presenter Pattern**: Define API response format in presenters, not use cases
7. **Controller Integration**: Wire everything together following OpenAPI patterns

### Entity Design Patterns

**State Management in Entities:**

```typescript
// ✅ Correct - Private state with controlled access
export class Attendee {
  private _firstUsedAt: number | null = null;

  get firstUsedAt(): number | null {
    return this._firstUsedAt;
  }

  checkIn(time: Date): void {
    if (!this._firstUsedAt) {
      this._firstUsedAt = Math.floor(time.getTime() / 1000);
    }
  }
}
```

**External Dependencies in Entities:**

- Entities should NOT import external libraries (crypto, etc.)
- Complex computations should be handled in repository layer
- Public tokens, hashes, etc. calculated during entity construction

### Repository Implementation Guidelines

**Saving Entity Changes:**

```typescript
// ✅ Correct - Update all entity attributes
async save(attendee: Attendee): Promise<void> {
  await this.connection.executeAll(sql`
    UPDATE attendees
    SET display_name = ${attendee.displayName},
        first_used_at = ${attendee.firstUsedAt},
        role = ${attendee.role}
    WHERE token = ${attendee.token}
  `);
}
```

**Entity Mapping with External Dependencies:**

```typescript
// ✅ Correct - Calculate external dependencies in repository
private mapToEntity(row: AttendeeSchema): Attendee {
  const publicToken = createHash("sha1").update(row.token).digest("hex");
  const attendee = new Attendee(row.token, row.display_name, publicToken);

  // Restore state from database
  if (row.first_used_at) {
    attendee.checkIn(new Date(row.first_used_at * 1000));
  }

  return attendee;
}
```

### Compatibility Configuration

**Cloudflare Workers with Node.js APIs:**

When using Node.js built-ins (like `crypto`), ensure compatibility configuration is synchronized:

- **wrangler.jsonc**: Add `"compatibility_flags": ["nodejs_compat"]`
- **features/support/World.ts**: Add `compatibilityFlags: ["nodejs_compat"]` to Miniflare config

### Testing Strategy

**BDD Test Development:**

1. Start with passing scenarios to establish core functionality
2. Mark complex scenarios as `@wip` for future implementation
3. Add missing step definitions progressively
4. Ensure test environment matches production configuration

**Step Definition Patterns:**

```typescript
// Property validation steps
Then('the response json should have property {string} is not null', ...)
Then('the response json should have property {string} is null', ...)

// HTTP request steps
When('I make a GET request to {string}', ...)
When('I make a POST request to {string}:', ...)
```

### Mock Data and Test Environment

**Environment Variable Configuration:**

For test-specific behavior (like datetime mocking), use environment variables:

```typescript
// wrangler.jsonc - Production defaults
"vars": {
  "__TEST__": false,
  "__MOCK_DATETIME__": "2023-08-26T16:00:00.000Z"
}

// .dev.vars - Development overrides
__TEST__=true
__MOCK_DATETIME__=2023-08-26T16:00:00.000Z

// .dev.vars.example - Template for new developers
__TEST__=false
__MOCK_DATETIME__=2023-08-26T16:00:00.000Z
```

**Test Environment Setup (Miniflare):**

Configure test-specific environment in `features/support/World.ts`:

```typescript
// ✅ Correct - Use bindings for test environment variables
this._miniflare = new Miniflare({
  bindings: {
    __TEST__: "true",
    __MOCK_DATETIME__: "2023-08-26T16:00:00.000Z",
  },
  // ... other config
});

// ❌ Wrong - vars/envVars don't work for Cloudflare environment variables
// Use bindings instead
```

**Service Layer Mocking:**

Implement environment-aware services using `cloudflare:workers` env:

```typescript
// ✅ Correct - Environment-aware service
import { env } from "cloudflare:workers";

@injectable()
export class NativeDatetimeService implements IDatetimeService {
  getCurrentTime(): Date {
    // Check if we're in test mode and return mock datetime
    if (env.__TEST__ === "true" && env.__MOCK_DATETIME__) {
      return new Date(env.__MOCK_DATETIME__);
    }
    return new Date();
  }
}

// ❌ Wrong - Hardcoded or manual injection approaches
// Don't use globalThis or manual dependency injection for env vars
```

**Type Generation for Environment Variables:**

1. Add variables to `wrangler.jsonc` vars section
2. Create `.dev.vars` with string values for proper type inference
3. Run `pnpm cf-typegen` to regenerate types
4. Environment variables are always typed as `string` in Cloudflare Workers

**Testing Workflow with Mock Data:**

1. Define environment variables in `wrangler.jsonc` with production defaults
2. Override in `.dev.vars` for development/testing
3. Configure test bindings in `features/support/World.ts`
4. Implement conditional logic in services using `env` from `cloudflare:workers`
5. Verify tests pass with predictable mock data
6. Ensure TypeScript compilation succeeds with `pnpm tsc`

### Legacy Field Migration

When removing legacy fields (like `event_id`):

1. Update feature files to remove deprecated columns
2. Update expected JSON responses
3. Avoid adding fields to database schema if not needed in current phase
4. Use presenter layer for backward compatibility if required

## Configuration Files

- **wrangler.jsonc**: Cloudflare Workers config with Durable Objects binding and compatibility flags
- **drizzle.config.ts**: Database ORM configuration
- **tsconfig.json**: TypeScript config with JSX support and experimental decorators
- **worker-configuration.d.ts**: Auto-generated Cloudflare Worker types (do not edit)

## Testing

BDD testing with Cucumber.js:

- Feature files in `features/` directory
- Step definitions in `features/steps/`
- World setup in `features/support/World.ts`
- Test categories: landing, attendee import, puzzles, scenarios

## Code Quality

- **ESLint**: TypeScript and React configurations
- **Prettier**: With organize-imports plugin
- **Path aliases**: Use `@/` prefix for src imports

## Complex Feature Design: Ruleset System

The ruleset system is one of the most complex features in CCIP Serverless. It implements a flexible rule engine for event attendee interactions using an AST-based approach.

### Understanding the Design

**Core Concept**: The system replaces hardcoded event logic with configurable rules that control what attendees can do, when they can do it, and how many times actions can be performed.

**Key Components**:

- **Ruleset**: Aggregate root that manages a collection of rules
- **Rule**: Individual action/resource with visibility and usability logic
- **Conditions**: AST nodes implementing Strategy + Composite patterns
- **Actions**: Operations executed when rules are used

### Architectural Decisions

**1. AST-Based Condition System**:

- Uses polymorphic JSON structure with `type` field
- Factory pattern for creating condition nodes from JSON
- Supports complex logic with And/Or composite conditions
- Extensible for future condition types

**2. Flexible Message System**:

- Rules use `messages: Map<string, I18nText>` instead of fixed fields
- Different messages for different states (display, locked, expired, etc.)
- All locales returned in API responses

**3. State Storage in Attendee Metadata**:

- Rule usage tracked via `_rule_{id}` keys in attendee metadata
- Denormalized for performance (no separate state table)
- Atomic updates with attendee data

**4. Durable Object KV Storage**:

- Each event has isolated ruleset storage
- Single KV entry for atomic updates: `durableObject.set("rulesets", data)`
- Role-based organization at top level

### Implementation Guidance

**When implementing the ruleset system:**

1. **Start with the Domain Model**: Implement entities before infrastructure
2. **Use Factory Pattern**: ConditionNodeFactory for parsing JSON to domain objects
3. **Leverage DI**: RulesetRepository as interface with DO implementation
4. **Follow Clean Architecture**: Use cases orchestrate, presenters format output
5. **Test with BDD**: Missing step definition for ruleset setup needs implementation

**Key Condition Types**:

- `AlwaysTrue`: No conditions
- `Attribute`: Check attendee metadata
- `UsedRule`: Check if another rule was used
- `Role`: Check attendee role
- `Staff`: Check if staff query mode
- `And`/`Or`: Composite conditions

**Critical Patterns**:

```typescript
// Evaluation context includes staff query flag
const context = new EvaluationContext(attendee, currentTime, isStaffQuery);

// Rules evaluate visibility and usability separately
if (rule.isVisible(context) && rule.isUsable(context)) {
  rule.apply(new ExecutionContext(attendee, currentTime));
}

// State stored in attendee metadata
attendee.setMetadata(`_rule_${ruleId}`, timestamp.toString());
```

### Common Pitfalls to Avoid

1. **Don't hardcode messages**: Use flexible message system with IDs
2. **Don't forget staff mode**: Include isStaffQuery in evaluation context
3. **Don't mix concerns**: Keep AST parsing separate from domain logic
4. **Don't skip factory pattern**: Always use factories for JSON→Domain conversion

### Testing Considerations

- The `@wip` tag on scenario features indicates work in progress
- Legacy format migration tool needed for test compatibility
- Mock datetime crucial for predictable test results
- Step definition uses simplified format: `"the ruleset is:"` without event/role parameters

For detailed design documentation, see `docs/ruleset.md`.
