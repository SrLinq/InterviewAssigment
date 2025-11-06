# Menu Management API

Node.js + Express backend for managing restaurant-style menus. The API handles categories, sub-categories, and products (items) with TypeORM and PostgreSQL.

## Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL instance reachable from your machine

## Setup
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Configure database connection by copying `.env.example` to `.env` and updating credentials.
3. Build TypeScript sources:
   ```bash
   pnpm build
   ```
4. Start the server:
   ```bash
   pnpm start
   ```
   Default port is `3000` (configurable via `.env`).

For development with auto-reload, use:
```bash
pnpm run start:dev
```

## Database Choice
- **PostgreSQL** was chosen for its reliability, strong relational features, and native support in TypeORM.

## API Highlights
- Categories: create, list, search (by id/name), update.
- Sub-categories: create, list (all or by category), search (by id/name), update.
- Products: create, list, search (by id/name/category/sub-category), update.
- All payloads enforce validation rules like tax applicability and pricing constraints.

## Lessons Learned
1. How to structure TypeORM entity relations to support flexible lookups.
2. Building reusable response mappers keeps route handlers lean and consistent.
3. Validating dependent attributes (tax vs. taxApplicability) is simpler when centralized inside services.

## Challenges
- Synchronizing the inheritance logic for tax defaults across create and update flows required careful handling to avoid inconsistent states.

## If Given More Time
- Add request validation middleware (e.g., zod) and automated tests for services and routes.
- Produce OpenAPI documentation and seed scripts for demo data.
