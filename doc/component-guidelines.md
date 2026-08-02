# Component Guidelines

This project separates reusable UI primitives from app-specific components.

## `components/ui/`

`components/ui/` is reserved for shadcn-style primitive wrappers. These files are built on top of `@base-ui/react` and are intended to be reused across the app.

Current files include:

- `avatar.tsx`
- `badge.tsx`
- `button.tsx`
- `card.tsx`
- `checkbox.tsx`
- `dialog.tsx`
- `input.tsx`
- `label.tsx`
- `progress.tsx`
- `select.tsx`
- `separator.tsx`
- `tabs.tsx`
- `textarea.tsx`

### When to add or update files in `components/ui/`

- Add a new primitive wrapper when the UI element should be used across the app.
- Keep the wrapper focused on styling and accessibility.
- Reuse `cn(...)` from `@/lib/utils` to merge Tailwind class names.
- Keep the component API small and stable.
- Add `data-slot` attributes where appropriate for debugging and styling.

### Example

`components/ui/button.tsx` exports a styled `Button` wrapper that can be reused as:

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default">Save</Button>
```

## Custom components

Custom components should be created under `components/`.

Naming rules:

- Use `PascalCase` for component file names and component names.
- One component per file when possible.
- Use the component name directly: `LessonCard.tsx`, `CoachCard.tsx`, `BookingForm.tsx`.

### Import paths

- Use absolute path imports with `@/`.
- Prefer specific imports over broad barrel imports.

Example:

```tsx
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

## Styling approach

- Use Tailwind CSS classes for styling.
- Use `cn(...)` to combine classes and conditionally apply class names.
- Keep class lists readable by splitting long class expressions into multiple lines.
- Prefer semantic layout classes over custom inline styles.

## Example component structure

Create a presentational component like:

```tsx
import { cn } from "@/lib/utils"

interface LessonCardProps {
  title: string
  description: string
}

export function LessonCard({ title, description }: LessonCardProps) {
  return (
    <article className={cn("rounded-2xl border bg-white p-6 shadow-sm")}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </article>
  )
}
```

## Theme provider

The project includes a theme provider in `components/theme-provider.tsx`.

Use it in `app/layout.tsx` to enable light/dark mode support.

## Stateful UI

- Keep presentational components pure when possible.
- Move stateful logic into page components, hooks, or stores.
- Use `stores/useAppStore.ts` for global UI state, such as sidebar open/closed state.

## Component tests

There are no existing test files in the repository yet, but new component logic should be covered with Jest or React Testing Library if possible.

## Existing conventions

- `components/ui/` for design-system primitives.
- `components/` for app-level reusable components.
- `lib/` for small shared utilities.
- `stores/` for global state.

If the codebase grows, consider adding subfolders under `components/` for domains such as `components/bookings/`, `components/dashboard/`, or `components/layout/`.
