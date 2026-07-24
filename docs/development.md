# Development & Testing Guide

This document outlines the essential steps for local development and running tests.

## Prerequisites

- **Node.js**: Check `package.json` for the required version.
- **Docker**: Must be installed and running for the local Supabase instance.

## Local Environment Setup

1. **Environment Variables**:
   Copy the example file and fill in the required values (Supabase URLs, test users, etc.):
   ```bash
   cp .env.example .env.local
   cp .env.example .env.test # Used specifically for Playwright E2E tests
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start Local Supabase Stack**:
   Starts the local database, auth, and storage services.
   ```bash
   npx supabase start
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Architecture & Conventions

All project architectural guidelines, naming conventions, styling rules (Tailwind v4), and i18n instructions are documented in the **[`AGENTS.md`](../AGENTS.md)** file at the root of the project.

It serves as the single source of truth for both human developers and AI assistants. Please read it before making structural changes.

## Testing

### Unit Tests

Written using **Vitest** and colocated with their respective source files (e.g., `auth.test.ts` next to `auth.ts`).

```bash
npm run test:unit
```

### End-to-End (E2E) Tests

Written using **Playwright** in the `e2e/` folder. **Requires the local Supabase instance to be running.**

```bash
npm run test:e2e       # Run in headless mode
npm run test:e2e:ui    # Run with UI
```

## Common Commands

- `npm run check`: Runs TypeScript checks and ESLint. A clean output is mandatory before committing.
- `npm run format`: Formats code via Prettier.
- `npx supabase stop`: Stops the local Supabase services to free up resources.
