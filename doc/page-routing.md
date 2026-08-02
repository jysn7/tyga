# Page Routing

This repository uses Next.js App Router conventions. The `app/` directory defines routes by file and folder structure.

## Current route setup

The current application has only the root route:

- `app/page.tsx` → `/`

Additional root-level files:

- `app/layout.tsx` — root layout used by all pages.
- `app/globals.css` — global CSS declarations.
- `app/favicon.ico` — application icon.

## Adding a new page

To add a new page, create a new folder inside `app/` and add a `page.tsx` file.

Example:

- `app/book-lesson/page.tsx`

This creates the URL:

- `/book-lesson`

### Example `page.tsx`

```tsx
export default function Page() {
  return <div>Book a lesson page</div>
}
```

## Nested routes

Nested folders create nested segments.

Example:

- `app/bookings/[id]/page.tsx` → `/bookings/:id`
- `app/dashboard/settings/page.tsx` → `/dashboard/settings`

## Route segment naming

Use `kebab-case` for route folder names and avoid spaces or camel case:

- good: `app/my-bookings/`
- bad: `app/myBookings/`

## Layouts

Use `layout.tsx` files to define shared wrappers for a route segment.

The root `app/layout.tsx` is the shared application shell. It can contain providers, layout HTML, theme providers, and common page structure.

Example nested layout:

- `app/dashboard/layout.tsx`
- `app/book-lesson/layout.tsx`

This wraps every page in that route segment.

## Client and server components

Next.js App Router renders components as server components by default.

If a page or component uses browser-only APIs, React state, or hooks such as `useEffect`, add `"use client"` at the top of the file.

Example:

```tsx
"use client"

import { useState } from "react"

export default function Page() {
  const [open, setOpen] = useState(false)
  return <div>{open ? "Yes" : "No"}</div>
}
```

## Loading, error, and metadata

Next.js supports route-specific files such as:

- `loading.tsx` — loading state for async pages
- `error.tsx` — error boundary for the route
- `head.tsx` or `metadata.ts` — page metadata

These files can be added in the same folder as `page.tsx`.

## API routes

This repository currently does not include API routes, but the App Router supports them in `app/api/`.

If you add server endpoints, use `app/api/resource/route.ts` and follow REST-style naming:

- `app/api/bookings/route.ts` → `/api/bookings`
- `app/api/bookings/[id]/route.ts` → `/api/bookings/:id`

## Summary

- add pages with `app/<route>/page.tsx`
- use `layout.tsx` for shared route wrappers
- use `kebab-case` for route directories
- add `"use client"` only when browser behavior is required
