# Repository structure

TYGA is a single Next.js application. The main areas of the repository are:

| Path | Responsibility |
| --- | --- |
| `app/` | App Router pages, nested layouts, loading/error boundaries and API route handlers. Route groups include client, admin, coach, auth and help areas. |
| `components/` | Shared UI and domain-specific components, including portal layouts and reusable primitives. |
| `hooks/` | React hooks for feature data access, mutations and shared UI behavior. |
| `lib/` | Shared application logic, utilities and typed domain helpers. |
| `utils/` | Supabase client factories and other infrastructure helpers. |
| `stores/` | Shared client-side state. |
| `supabase/` | Supabase local configuration and database migrations. |
| `public/` | Static files served by the application. |
| `docs/` | The unified documentation tree: features, development and project guides. |

## Application routes

The `app/` directory is organized by URL segment and route groups. Parenthesized route-group names organize code without adding that name to the URL. For example, client-facing routes are grouped under `(client)`, while coach and admin routes have their own segments.

API handlers use `route.ts` files under `app/api/`. See [routing](./routing.md) for examples and route-authoring guidance.

## Components and data access

- `components/ui/` contains shared UI primitives and wrappers.
- `components/portals/` contains portal-specific shells and shared portal UI.
- `hooks/` contains feature hooks, including query and mutation hooks.
- `utils/supabase/` centralizes browser, server, middleware and admin client creation.

See the [component guidelines](./component-guidelines.md) for UI patterns and [authentication guidance](./authentication.md) for Supabase client and authorization boundaries.

## Database

Supabase project configuration and schema changes are maintained in `supabase/`. Database behavior such as Row Level Security, triggers and RPCs is defined by the ordered SQL migrations. Do not treat an application hook or an older feature inventory as a replacement for the migration history.
