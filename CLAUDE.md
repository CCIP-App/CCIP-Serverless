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
- `pnpm cf-typegen` - Generate Cloudflare Worker types

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
2. `pnpm e2e` - Run BDD tests to verify functionality

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

  async handle(c: Context<Env>, env: Env, ctx: ExecutionContext, data: any) {
    // Implementation
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

### Dependency Injection Pattern

Use symbols for dependency injection tokens instead of hardcoded strings:

```typescript
// Define tokens and interfaces
export const AttendeeRepositoryToken = Symbol("AttendeeRepository");
export interface AttendeeRepository {
  findAttendeeByToken(token: string): Promise<Attendee | null>;
}

// Use case implementation (no @injectable decorator)
export class GetProfile {
  constructor(
    @inject(AttendeeRepositoryToken)
    private readonly attendeeRepository: AttendeeRepository,
  ) {}
}
```

## Configuration Files

- **wrangler.jsonc**: Cloudflare Workers config with Durable Objects binding
- **drizzle.config.ts**: Database ORM configuration
- **tsconfig.json**: TypeScript config with JSX support and experimental decorators

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
