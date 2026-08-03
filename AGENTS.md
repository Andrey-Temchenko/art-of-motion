<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Architecture & Guidelines (Art Of Motion)

## 1. Stack & Routing

- **Framework**: Next.js 16.2.0 (App Router exclusively).
- **Metadata**: We use File-based metadata (`icon.svg`, `apple-icon.png`, `manifest.json` in `src/app/`) and the `Metadata` API in `layout.tsx`. Do not hardcode `<meta>` or `<link>` tags in the HTML.
- **Route Segment Boundaries**: Every route segment that can fail or fetch data MUST provide the corresponding App Router boundary files where relevant:
  - `loading.tsx` for the segment's Suspense fallback (use skeleton components matching the final layout, not a generic spinner).
  - `error.tsx` (Client Component) for segment-level error boundaries. Never let a data-fetching failure crash the whole tree.
  - `not-found.tsx` where a resource lookup (e.g. by slug/id) can legitimately return nothing.
  - Do not swallow errors silently in `try/catch` inside Server Components just to avoid an `error.tsx` - let it throw and let the boundary handle it, unless there's a specific recoverable fallback UI.

## 2. Styling (Tailwind v4)

- We use **Tailwind CSS v4**.
- There is NO `tailwind.config.ts`. All tokens and design system variables are defined in `src/app/globals.css` inside the `@theme inline` directive.
- **Semantic Tokens**: Always use our custom semantic tokens for styling:
  - Colors: `text-brand-strength`, `bg-brand-mfr`, `border-brand-stretch`, `text-brand-balance`.
  - Spacing: `py-section`, `py-section-sm`.
  - Typography: `text-display`, `text-h1`, `text-h2`, `text-h3`.

## 3. UI Components

- **Component Naming Convention**: All React component files must be named using **PascalCase** (e.g., `HeroSection.tsx`, `LanguageSwitcher.tsx`). Do not use kebab-case for components.
- **Hook Naming Convention**: Custom hook files and function names MUST be written in **camelCase** (e.g., `useClientDictionary.ts`, `useWindowSize.ts`).
- **Helper & Service Naming Convention**: Helper and service files MUST be written in **camelCase** starting with a lowercase letter (e.g., `themeProvider.ts` instead of `theme-provider.ts`).
- **React Import Convention**: **NEVER** use `import * as React from 'react'` or call hooks via `React.useState`, `React.useEffect`. Always import React and named hooks explicitly in curly braces (e.g., `import React, { useState, useEffect, useCallback } from 'react';`).
- We use **Shadcn UI** (installed in `src/components/ui/`).
- When proposing UI changes, prioritize using or adding Shadcn components via `npx shadcn@latest add <component>`.
- **Separation of Concerns**: Do NOT mix raw database data parsing, complex formatting, or business logic (e.g., calculating remaining capacity, grouping by date, extracting titles from joined tables) directly inside UI Components or Page components. Perform data transformations in the service layer or Server Actions, and pass clean, strictly typed data to the UI.

### 3.1 Server vs Client Components

- **Default to Server Components.** Only add `'use client'` to a file when it genuinely needs interactivity, browser APIs, state, effects, or event handlers.
- **Push `'use client'` to the leaves.** Never mark an entire page or a large section as a Client Component just because one small piece inside it (e.g. a toggle button) needs interactivity. Extract that piece into its own small client component and keep the surrounding layout/data-fetching as a Server Component.
- Server Components fetch data directly (via the service layer, not Client-side `useEffect` + `fetch`). Do not fetch data in a Client Component when it could be fetched on the server and passed down as props.
- Pass only serializable data as props from Server to Client Components (no functions, class instances, or Supabase clients).

### 3.2 Component Decomposition & File Structure

- **Single Responsibility**: A component should represent one coherent visual/logical unit. If a component's JSX mixes multiple distinct visual blocks (e.g. a header, a filter bar, and a list) or exceeds roughly 150-200 lines, split it into subcomponents.
- **Folder-per-component pattern** for components with meaningful internal structure:
  ```
  HeroSection/
    index.tsx              (or HeroSection.tsx - the composition/export)
    HeroSectionHeading.tsx
    HeroSectionActions.tsx
    useHeroSectionAnimation.ts
  ```
  Simple, self-contained components (no subcomponents, no local hook) can remain a single file under `src/components/`.
- **Presentational vs Container split**: where a component both fetches/derives data and renders significant UI, separate the two - a thin container (Server Component or hook) supplies data, a presentational component only renders it. This keeps presentational components easy to reuse and test.
- Avoid prop-drilling more than 2-3 levels deep; prefer composition (passing `children`/render slots) or, for genuinely cross-cutting state, a small context colocated with the feature.

### 3.3 Custom Hooks Extraction Rules

- Extract logic into a custom hook whenever a component contains: `useEffect` with subscriptions/timers/event listeners, synchronization with an external system (window size, media queries, websockets), or reusable stateful logic shared by 2+ components.
- **Avoid unnecessary `useEffect`.** Do not use an effect to compute a value that can be derived directly during render from props/state. Do not use an effect to reset state that can instead be controlled via a `key` prop. Reach for `useEffect` only for real synchronization with something outside React (DOM, browser APIs, subscriptions, network side effects that aren't data fetching already handled by Server Components).
- Custom hooks must have a single, clearly named responsibility (`useClientDictionary`, not `useMisc`), a strictly typed return value (prefer a typed object over a bare array for hooks returning more than 2 values), and no direct DOM manipulation outside of `ref`-based effects.

### 3.4 Props & Typing

- Every component's props MUST be typed via an explicit `interface ComponentNameProps` (not `type` aliases for props, for consistency; `type` is fine for unions/utility types elsewhere).
- Never use `any` in component props or hook signatures. Use `unknown` plus narrowing if the shape is genuinely not known ahead of time.
- Type `children` explicitly as `React.ReactNode` when accepted; do not accept `children` unless the component is designed to render them.
- Prefer **discriminated unions** over multiple optional boolean flags when a component has mutually exclusive visual states (e.g. `{ variant: 'loading' } | { variant: 'error'; message: string } | { variant: 'success'; data: X }` instead of `isLoading?: boolean; isError?: boolean; errorMessage?: string`).
- Do not export component prop interfaces from the component file unless another file genuinely needs to import them.

### 3.5 Forms

- All forms MUST use **`react-hook-form`** for form state and **`zod`** for schema validation, wired together via `@hookform/resolvers/zod`. Do not hand-roll controlled inputs with `useState` for forms with more than 1-2 fields.
- Validation schemas live alongside the form (or in `src/lib/validators/` if shared) and are the single source of truth for both client-side validation and, where applicable, Server Action input validation.
- Server Actions that receive form data MUST re-validate with the same (or an equivalent) zod schema server-side. Never trust client-side validation alone.
- **Zod v4 Methods**: We use Zod 4. Pay attention to deprecation warnings (e.g., use `z.url()` instead of `z.string().url()`, and `schema.extend(other.shape)` instead of `schema.merge(other)`). Always use up-to-date methods and libraries.

### 3.6 Memoization & Performance

- Do not reach for `useMemo`/`useCallback` by default. Use them only when profiling (or an obvious case, like passing a callback to a memoized child or an expensive computation) shows they matter. Premature memoization adds noise without benefit.
- Use `next/image` for all images (never a raw `<img>` tag) and `next/dynamic` for heavy, non-critical client components (e.g. charts, modals, rich text editors) to keep initial bundles small.
- Lists rendered from arrays must use stable, unique `key` props (database ids), never array index, unless the list is provably static and never reordered.

## 4. Tooling & Git Flow

- **Prettier**: `prettier-plugin-tailwindcss` is active. Let Prettier format and sort Tailwind classes automatically.
- **Commits**: We strictly use **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.). `commitlint` and `husky` are active and will reject badly formatted commit messages.
- **Validation**: AI Agents MUST run `npm run check` after performing any coding tasks. All TypeScript errors and ESLint warnings MUST be completely fixed before presenting the result to the user. A clean terminal is mandatory.
- **No Linter Bypassing (`eslint-disable`)**: **NEVER** use `eslint-disable`, `eslint-disable-next-line`, `@ts-ignore`, or similar linter suppression comments to mute warnings or errors (especially regarding React hooks or `useState` inside `useEffect`). All issues must be fixed cleanly according to React best practices.

## 5. Localization (i18n)

- **Source of Truth**: All translations MUST be edited in `locales/dictionary.json`. This is the only file that should be modified manually or by agents.
- **Generated Files**: The `locales/generated/` folder contains split JSON files for each language (`uk.json`, `ru.json`, `en.json`). **DO NOT** edit these files manually or directly.
- **Script**: The split files are automatically generated by `scripts/split-locales.ts` via npm hooks (`predev`, `prebuild`). If you modify `dictionary.json` and need to update types/files immediately, run `npm run locales:split`.
- **Typings**: TypeScript infers localization keys directly from `dictionary.json` using a recursive utility type, so typings are always strictly up to date.

## 6. Global Constants & Configuration

- **Source of Truth**: All hardcoded links (social media, external URLs) and static project-wide configurations MUST be stored inside the `src/config/` directory (e.g., `src/config/site.ts`).
- **Typings**: The configuration must be strictly typed using TypeScript interfaces to ensure reliable IDE autocompletion across components.
- **Avoid Hardcoding**: Never hardcode external URLs, static identifiers, or display labels (e.g., "Club Alpha") directly into React components. Always import them from the appropriate config file in `@/config/*` or handle them via the localization dictionary (`locales/dictionary.json`).

## 7. Punctuation & Formatting Rules

- **No Em-Dashes (—)**: **NEVER** use em-dashes (`—`) anywhere in the project. Always use standard hyphens (`-`) instead. This applies strictly to all UI texts, content in `locales/dictionary.json`, code comments, documentation, metadata, and responses.

## 8. Database Types

- **Auto-generated file**: The file `src/types/database.types.ts` is automatically generated by the Supabase CLI (`npm run types:generate`).
- **DO NOT EDIT**: Agents MUST NOT manually edit or modify `src/types/database.types.ts` under any circumstances. If database schema changes are required, create a migration, push it, and regenerate the types using the script.
- **Strict Typing**: NEVER use `as unknown as Type` when fetching data from Supabase. Always use the generated types from `src/types/database.types.ts`. For complex joins, use Supabase's `QueryData<typeof query>` to infer the exact return type instead of manually declaring types with optional arrays or hacking around the types.
- **Database Enums**: NEVER hardcode enum values (e.g., `'alpha'`, `'top_gun'`) in UI components, actions, or forms. Always import them from the strictly typed constant files in `src/constants/*` (e.g., `CLUB_LOCATION`, `SLOT_STATUS`). Do not rely on the `database.types.ts` file for runtime constants. If a new database enum is introduced, you MUST create a corresponding constant file in `src/constants/` following the existing pattern (exporting an `as const` object and a derived type).

## 9. Testing Guidelines

- **Meaningful Tests**: AI Agents MUST write tests that genuinely verify logic, edge cases, error handling, and state changes. Do not write shallow tests simply for coverage (e.g., tests that only assert a component mounts without checking interactive behavior). Tests must contain robust assertions.
- **E2E Tests (Playwright)**: End-to-End tests verify the system as a whole and are located in the `e2e/` folder at the root of the project.
- **Unit Tests (Vitest)**: We strictly follow the **Colocation** pattern for unit tests. Test files (`.test.ts` or `.test.tsx`) MUST be placed directly alongside the files they test (e.g. `src/lib/validators/auth.ts` -> `src/lib/validators/auth.test.ts`).
- **Test Setup**: Use `auth.setup.ts` inside E2E to manage authenticated states efficiently instead of repeating login flows through the UI on every test.

## 10. Project Documentation

- **Docs Folder**: For detailed setup, development workflows, and testing instructions, always refer to the files in the `docs/` directory (e.g., `docs/development.md`). AI Agents must use this folder to understand local environment requirements (like Docker and Supabase) before attempting to run complex tasks or E2E tests.

## 11. Navigation & Routing

- **No Hardcoded Routes**: NEVER hardcode routing paths or URLs directly in components. All internal navigation routes must be defined in `src/config/navigation.ts`.
- **Navigation Config**: Always use the `ROUTES` object and helpers (e.g. `buildRoute`, `getDefaultDashboardRoute`) from `src/config/navigation.ts` to construct navigation links and redirect paths.

## 12. Backend Architecture (Actions, Services & Repositories)

- **Strict Layering**: Server Actions/Components call Services. Services call Repositories. Do not put database calls directly in Server Actions or UI components.
- **Server Actions (Entry Points)**:
  - **Location**: MUST be placed in `src/actions/` (never adjacent to page or component files).
  - **Authorization**: MUST independently verify the caller's session and permissions.
  - **Validation**: MUST validate input with a `zod` schema before touching the database.
  - **Return Values**: Should return a strictly typed result object (e.g. `{ success: true; data: X } | { success: false; error: string }`) rather than throwing raw errors across the server/client boundary.
- **Service Layer (Domain Logic)**: All business logic, complex data transformations (e.g., grouping dates, calculating capacity), and domain error translation MUST reside in `src/services/`.
- **Repository Layer (Data Access)**: `src/repositories/` must ONLY execute queries and return raw data. No domain logic, no complex data mapping. Throw raw database errors for the service to intercept.
- **Dependency Injection (Testing Seam)**: Services must accept a repository registry as a default argument to allow easy mocking in unit tests (e.g., `export async function bookSlot(slotId, repos = getRepositories())`).
- **Colocation of Types**: Interfaces and types specific to a layer MUST be colocated in a `types.ts` file within that layer's folder (e.g., `src/repositories/types.ts`, `src/services/types.ts`). Do not place them in the global `src/types/` folder, which is strictly reserved for auto-generated database types.

## 13. Environment Variables

- All environment variables MUST be declared and validated in a single typed schema (e.g. via `zod` in `src/env.ts` or `@t3-oss/env-nextjs`), split into server-only and client-exposed (`NEXT_PUBLIC_*`) groups.
- Never access `process.env.X` directly inside components, actions, or services. Import the validated, typed `env` object instead, so missing/misconfigured variables fail fast at build/startup rather than silently at runtime.

## 14. Accessibility (a11y)

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<label>`, etc.) instead of `<div>`/`<span>` with click handlers wherever a native element covers the use case.
- All interactive Shadcn/Radix-based components must keep their built-in ARIA attributes and keyboard interactions intact - do not override `role`, `tabIndex`, or ARIA props unless there's a specific, documented reason.
- Every form input must have an associated, visible or `sr-only` `<Label>` (never a placeholder used as the only label).
- Images MUST have meaningful `alt` text (or `alt=""` for purely decorative images) - never omit `alt` on `next/image`.

## 15. Date Formatting

- **Centralized Formatting**: NEVER use `date-fns` formatting methods (like `format()`) directly inside UI components or services. Always use the centralized wrapper `formatDate()` from `src/lib/utils/date.ts` to ensure consistent localization behavior.
- **Format Constants**: NEVER hardcode date format string literals (e.g., `'yyyy-MM-dd'`, `'PPP'`) in components. Always import them from `src/constants/dateFormats.ts` (e.g., `DATE_FORMATS.ISO_DATE`, `DATE_FORMATS.DISPLAY_DATE_LONG`).
