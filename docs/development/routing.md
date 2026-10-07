# Routing

TYGA uses the Next.js App Router. Route files live under `app/`; a `page.tsx` defines a page, `layout.tsx` wraps a route segment, and `route.ts` defines an HTTP API handler.

## Route groups and portals

Parent-facing pages are organized under the `(client)` route group; the group name is omitted from public URLs. Coach and admin areas use `/coach/...` and `/admin/...` paths. Authentication and help pages are organized in their own route areas.

Examples of current route families include:

- `/dashboard` — parent home
- `/coach/overview` — coach home
- `/admin/overview` — admin home
- `/auth/signin` — sign-in
- `/api/...` — server-side route handlers

Check the current directory tree before choosing a route name; this list is illustrative rather than an exhaustive route inventory. Route details for product flows are in the [feature guides](../features/README.md).

## Adding a page

Add a `page.tsx` in the appropriate route directory. Keep shared portal behavior in its existing layout rather than duplicating it in each page. Use route groups to organize files when appropriate; a parenthesized group does not become part of the URL.

The App Router uses Server Components by default. Add `"use client"` only to files that need browser APIs, client-side state/effects, or client hooks. Keep data access on the server when practical, and follow the existing project patterns for hooks and Supabase clients.

## Adding an API handler

Create a `route.ts` in the matching `app/api/<resource>/` directory and export the HTTP method handlers the endpoint supports. Validate request data and authorize the caller on the server. RLS remains necessary for direct client/database access; a service-role client bypasses RLS and must only be used in trusted server code.

## Shared route files

Use the current App Router conventions for metadata and route states. Common colocated files include `loading.tsx`, `error.tsx`, `not-found.tsx` and `layout.tsx`; follow existing application examples when adding one.
