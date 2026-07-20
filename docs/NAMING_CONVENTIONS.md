# Naming Conventions & Engineering Standards — Tyga

Agree on these before writing any code. Consistency here prevents merge
friction and makes the codebase easier to review and hand over across all
three apps (Marketing, Portal, Admin).

## 1. Git Branching Strategy

| Branch | Purpose & Rules |
|---|---|
| `main` | Production-ready code only. Protected — no direct pushes. Merges only from `dev` after full testing and two-reviewer approval. |
| `dev` | Integration branch. All features merge here first. Must pass CI before merging to `main`. |
| `feature/[name]` | Cut from `dev`. e.g. `feature/booking-flow`, `feature/coach-availability`, `feature/marketing-lessons-page`. Merged back via Pull Request. |
| `fix/[name]` | Bug fix branches. Cut from `dev`. Merged back after the fix is verified. |
| `docs/[name]` | Documentation-only changes. |
| `chore/[name]` | Non-functional changes: dependency bumps, config, tooling. e.g. `chore/update-eslint-config`. |

## 2. Commit Message Convention

Format: `type(scope): short description` — imperative mood, lower case, no full stop.

| Type | Used For | Example |
|---|---|---|
| `feat` | A new feature | `feat(booking): add slot availability check` |
| `fix` | A bug fix | `fix(auth): resolve session expiry bug` |
| `docs` | Documentation only | `docs(readme): add supabase setup steps` |
| `style` | Formatting, no logic change | `style(navbar): fix indentation` |
| `refactor` | Code change that isn't a fix or feature | `refactor(api): simplify booking query` |
| `test` | Adding or fixing tests | `test(bookings): add unit tests for status update` |
| `chore` | Tooling, deps, config | `chore(deps): bump next to 14.3` |

## 3. File & Folder Naming

| Item | Convention | Example |
|---|---|---|
| shadcn primitives | Live in `components/ui/` — do not rename or move | `components/ui/button.tsx` |
| Custom components | PascalCase, one component per file, in `components/` | `LessonCard.tsx`, `CoachCard.tsx`, `BookingSlotPicker.tsx` |
| Hooks | camelCase, prefixed with `use` | `useBookingFlow.ts`, `useAvailability.ts` |
| Utility/lib files | camelCase | `formatCurrency.ts`, `supabaseClient.ts` |
| Folders (app router) | kebab-case, matching route segments | `app/book-lesson/`, `app/my-bookings/` |
| Type definition files | camelCase, suffixed `.types.ts` | `booking.types.ts`, `coach.types.ts` |
| Test files | same name as file under test + `.test.ts(x)` | `LessonCard.test.tsx` |
| Environment variable files | never commit `.env.local`; commit `.env.example` instead | `.env.local` (ignored), `.env.example` (tracked) |

## 4. Database Naming (Supabase / PostgreSQL)

| Item | Convention | Example |
|---|---|---|
| Tables | snake_case, plural | `lesson_types`, `coaches`, `bookings` |
| Columns | snake_case | `created_at`, `unit_price_cents`, `coach_id` |
| Primary keys | `id` (UUID) | `id uuid primary key default gen_random_uuid()` |
| Foreign keys | `singular_table_id` | `booking_id`, `coach_id`, `lesson_type_id` |
| Indexes | `idx_[table]_[column(s)]` | `idx_bookings_coach_id` |
| RLS policies | `[table]_[action]_[role]` | `bookings_select_owner`, `lesson_types_select_public` |

## 5. API Route Naming (Next.js)

| Pattern | Example | Notes |
|---|---|---|
| Plural, kebab-case resource names | `/api/lesson-types`, `/api/bookings` | REST-style, resource-based, not verb-based. |
| Nested resources use path params | `/api/bookings/:id`, `/api/bookings/:id/status` | Avoid deeply nested routes beyond two levels. |
| Query params for filtering/sorting | `/api/bookings?status=confirmed&sort=date_asc` | Keep filter keys snake_case to match DB columns. |
| Admin-only routes prefixed | `/api/admin/bookings`, `/api/admin/coaches` | Makes RLS/auth checks obvious at a glance. |

## 6. Environment Variables

| Convention | Example |
|---|---|
| SCREAMING_SNAKE_CASE, prefixed by service | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `PAYSTACK_SECRET_KEY` |
| Public (client-exposed) vars prefixed per Next.js convention | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Server-only secret keys — never `NEXT_PUBLIC_` | `SUPABASE_SECRET_KEY` |
| Never commit real secrets | `.env.example` lists every required key with a placeholder value |

## 7. Design & Figma Naming

- Figma pages named by app: `01-Marketing`, `02-Portal`, `03-Admin`, `04-Design System`.
- Frames named by screen, matching the route: `Lesson Listing`, `Booking Flow`, `Admin Dashboard`.
- Design system components named to match the code component (`Button/Primary`) so devs can map Figma to code 1:1.

## 8. Document & Version Naming

- Working documents: `TYGA_[DocumentType]_v[major].[minor]` — e.g. `TYGA_SRS_v1.2.docx`.
- Meeting minutes: `TYGA_Minutes_[YYYY-MM-DD].docx`.
- Git release tags follow semantic versioning: `v0.1.0` (first internal build), `v0.5.0` (client demo), `v1.0.0` (final submission).

## 9. Definition of Done

A user story or feature is Done only when all of the following are true:

- [ ] Implemented as described in the acceptance criteria.
- [ ] Unit tests exist for new logic and pass in CI.
- [ ] PR created and approved by two reviewers.
- [ ] Branch merged into `dev` without conflicts.
- [ ] Deployed to staging and verified against acceptance criteria.
- [ ] Regression checklist run with no new failures.
- [ ] Relevant documentation/JSDoc updated.
- [ ] Board card moved to Done.