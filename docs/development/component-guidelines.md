# Component guidelines

The UI is built from shared primitives and domain/portal components. Follow established patterns in the nearest related component before introducing a new abstraction.

## Shared primitives

`components/ui/` contains reusable UI wrappers, including components built on `@base-ui/react`. Keep primitives broadly reusable, accessible and focused on presentation and interaction. Prefer extending the existing wrapper over introducing a competing primitive for the same purpose.

Use `cn` from `@/lib/utils` where conditional Tailwind classes need merging. Preserve existing component APIs and `data-slot` attributes when updating primitive wrappers.

## Application components

Place reusable application UI under `components/`, following existing domain and portal subfolders such as `components/portals/`. Use descriptive component names and keep each component focused. Keep route-specific composition in the route when there is no meaningful reuse.

Use the `@/` alias for project imports, as in:

```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

## Styling and state

- Use the established Tailwind CSS conventions and project tokens.
- Prefer semantic structure and accessible controls.
- Keep presentational components simple; move shared data behavior into hooks and shared client state into the existing stores where appropriate.
- Avoid duplicating API/data logic across components. Follow existing TanStack Query hooks for shared server state.
- Use a client component only when the component needs browser APIs, state/effects or client hooks.

## Tests

The repository exposes Jest through `npm test`. Add or update focused tests for behavior when practical, using the existing test setup and neighboring test patterns. Do not assume every component currently has a test.
