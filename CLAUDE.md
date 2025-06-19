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

**Repository Pattern**:

- `src/repository/DoAttendeeRepository.ts` - Attendee data access layer
- Uses DatabaseConnector for consistent data access

**Use Cases Layer**:

- `src/usecase/` - Business logic and use case implementations
- `src/usecase/interface.ts` - Repository interfaces and dependency injection tokens
- Use cases are plain classes without @injectable decorator (entities and use cases have no dependencies)

**API Controllers**:

- `src/handler/api/` - API route controllers using Chanfana OpenAPI
- Controllers extend OpenAPIRoute base class

### Database Schema

Current schema includes:

- **attendees**: `token` (PK), `display_name`, `first_used_at`

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

Use DatabaseConnector.build() to create connections:

```typescript
const conn = DatabaseConnector.build(env.EVENT_DATABASE, "ccip-serverless");
const repository = new DoAttendeeRepository(conn);
```

### API Controller Pattern

Controllers extend OpenAPIRoute and use schema validation:

```typescript
export class ExampleController extends OpenAPIRoute {
  schema = {
    /* OpenAPI schema */
  };

  async handle(c: Context<{ Bindings: Env }>) {
    // Implementation
    // Access environment via c.env
  }
}
```

### Repository Pattern

Repositories use DatabaseConnector and return typed results:

```typescript
async findByToken(token: string): Promise<Schema | null> {
  const res = await this.connection.executeAll(sql`SELECT * FROM table WHERE token = ${token}`);
  return res.length > 0 ? res[0] : null;
}
```

### Entity and Use Case Rules

**Entities and Use Cases are Framework-Free:**

- **Entities** (`src/entity/`): Pure domain objects with no dependencies
- **Use Cases** (`src/usecase/`): Business logic classes with constructor injection only
- **NO DI decorators**: Never use `@injectable` or `@inject` in entities or use cases
- **Controller responsibility**: Controllers resolve dependencies and manually create use case instances

```typescript
// ❌ Wrong - Don't use DI decorators in use cases
export class GetProfile {
  constructor(
    @inject(AttendeeRepositoryToken)  // ❌ Never do this
    private readonly attendeeRepository: AttendeeRepository,
  ) {}
}

// ✅ Correct - Pure constructor injection
export class GetProfile {
  constructor(private readonly attendeeRepository: AttendeeRepository) {}
}

// ✅ Controller handles DI
async handle(c: Context<{ Bindings: Env }>) {
  const attendeeRepository = container.resolve(AttendeeRepositoryToken);
  const getProfile = new GetProfile(attendeeRepository);  // Manual creation
  const result = await getProfile.execute(token);
}
```

### Dependency Injection Token Policy

**Always use symbols for dependency injection tokens:**

```typescript
// ✅ Correct - Symbol-based tokens
export const AttendeeRepositoryToken = Symbol("AttendeeRepository");
export interface AttendeeRepository {
  findAttendeeByToken(token: string): Promise<Attendee | null>;
}

// ❌ Wrong - String-based tokens
container.register("AttendeeRepository", { useValue: repository });
```

**Token naming convention:**

- Interface: `AttendeeRepository`
- Token: `AttendeeRepositoryToken`
- Both defined in `src/usecase/interface.ts`

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

## Configuration Files

- **wrangler.jsonc**: Cloudflare Workers config with Durable Objects binding
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
