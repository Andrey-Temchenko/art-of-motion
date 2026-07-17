<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Architecture & Guidelines (Art Of Motion)

## 1. Stack & Routing

- **Framework**: Next.js 16.2.0 (App Router exclusively).
- **Metadata**: We use File-based metadata (`icon.svg`, `apple-icon.png`, `manifest.json` in `src/app/`) and the `Metadata` API in `layout.tsx`. Do not hardcode `<meta>` or `<link>` tags in the HTML.

## 2. Styling (Tailwind v4)

- We use **Tailwind CSS v4**.
- There is NO `tailwind.config.ts`. All tokens and design system variables are defined in `src/app/globals.css` inside the `@theme inline` directive.
- **Semantic Tokens**: Always use our custom semantic tokens for styling:
  - Colors: `text-brand-strength`, `bg-brand-mfr`, `border-brand-stretch`, `text-brand-balance`.
  - Spacing: `py-section`, `py-section-sm`.
  - Typography: `text-display`, `text-h1`, `text-h2`, `text-h3`.

## 3. UI Components

- We use **Shadcn UI** (installed in `src/components/ui/`).
- When proposing UI changes, prioritize using or adding Shadcn components via `npx shadcn@latest add <component>`.

## 4. Tooling & Git Flow

- **Prettier**: `prettier-plugin-tailwindcss` is active. Let Prettier format and sort Tailwind classes automatically.
- **Commits**: We strictly use **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.). `commitlint` and `husky` are active and will reject badly formatted commit messages.
