# Folder Structure

This project is currently organized around a single Next.js App Router application with reusable UI components and Supabase database migrations.

## Root

- `app/` — Next.js App Router files and route definitions.
- `components/` — reusable React components and UI primitives.
- `components/ui/` — shadcn-style UI primitives and custom wrappers.
- `docs/` — contributor and process documentation (branching, commit style, pull request guidance).
- `doc/` — developer-facing technical documentation (this folder).
- `lib/` — shared helpers and utility functions used across the app.
- `hooks/` — custom React hooks. Currently empty, but reserved for app-specific hooks.
- `stores/` — global state management (Zustand stores).
- `supabase/` — Supabase configuration and database migrations.
- `public/` — static assets served by Next.js.
- `next.config.ts` — Next.js configuration.
- `tsconfig.json` — TypeScript configuration and path aliases.
- `package.json` — npm scripts and dependency definitions.

## `app/`

The `app/` directory is the root of the App Router.

Current files:

- `app/layout.tsx` — root layout and shared providers.
- `app/page.tsx` — homepage component.
- `app/globals.css` — global CSS styles.
- `app/favicon.ico` — application favicon.

As the project grows, this directory will contain route folders such as `app/book-lesson/`, `app/dashboard/`, and `app/bookings/[id]/`.

## `components/`

The repository currently has:

- `components/theme-provider.tsx` — theme provider for light/dark mode.
- `components/ui/` — custom wrappers around `@base-ui/react` primitives.

### `components/ui/`

This directory contains UI primitive components that are built on top of the design system.

Common patterns in this folder:
- named exports for each primitive wrapper
- `cn(...)` for combining Tailwind classes
- `data-slot` attributes for debugging and styling
- portal wrappers for overlays such as dialogs and selects

Do not move or rename existing `components/ui/` primitive files unless you know how the design system is integrated.

## `lib/`

Contains shared helper utilities.

Current file:
- `lib/utils.ts` — exports the `cn()` helper to merge Tailwind classes.

## `stores/`

Contains global application state using Zustand.

Current file:
- `stores/useAppStore.ts`

## `supabase/`

Contains Supabase local development configuration and migration SQL.

Current files:
- `supabase/config.toml`
- `supabase/migrations/20260727204439_create_employees_table.sql`

## `public/`

Static assets served from the public root, including the favicon.

## `utils/`

`utils/` currently exists as a placeholder and is not used by the application. New helper modules are best placed under `lib/` for this codebase unless there is a specific reason to introduce a separate utility folder.

## Existing documentation locations

- `README.md` — project quick start and high-level overview.
- `docs/CONTRIBUTING.md` — contribution workflow and PR guidance.
- `docs/NAMING_CONVENTIONS.md` — naming and branch conventions.
- `doc/` — intended for developer onboarding and code structure documentation.
