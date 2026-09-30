# Search — README

Role-scoped global search with an advanced results page.

---

## Features

- **Header search bar** — click to open a grouped dropdown, debounced as you type
- **Role-scoped results**:
  - Parent: own members + all programmes
  - Coach: own roster + programmes they teach
  - Admin: users + coaches
- **Advanced search page** — same data, ungrouped, higher result limit, reads `?q=` from the URL
- **"See all results" link** — jumps from the dropdown to the advanced page with the query carried over

---

## Data model

No new tables — searches directly against `members`, `programmes`, `accounts`, `coaches` via `ILIKE`.

---

## RPCs

| Function | Summary |
|---|---|
| `parent_global_search` | Own members (by name) + all non-archived programmes (by name) |
| `coach_global_search` | Own roster (via active enrollments in taught programmes) + own programmes |
| `admin_global_search` | Users (name/email) + coaches (name) |

---

## Hooks

| File | Exports |
|---|---|
| `hooks/client/use-global-search.ts` | `useGlobalSearch` (debounced, role-parameterized) |

---

## Pages

| Route | Role | Purpose |
|---|---|---|
| (header dropdown, not a route) | All | Quick grouped results |
| `/search` (per portal) | All | Full advanced results, reads `?q=` |

---

## Key behaviours

| Rule | Where enforced |
|---|---|
| Query is debounced (250ms) before firing | `useGlobalSearch` |
| Query only fires once 2+ characters are typed | `enabled: debounced.trim().length > 1` |
| Results are grouped by type in the dropdown, not client-filtered again | `Command` rendered with `shouldFilter={false}` |
| A coach's search is scoped to programmes they're actually assigned to | `coach_global_search` joins through `programme_coaches` |
| Admin search intentionally excludes members/programmes | `admin_global_search` — users + coaches only, by design |

---

## Setup order

1. `01-search-rpcs.sql` — one function per role
2. `notify pgrst, 'reload schema';`
3. `npx shadcn@latest add command`

---

## Not implemented

- Full-text search / relevance ranking (current implementation is `ILIKE`-based)
- Fuzzy matching / typo tolerance
- Admin advanced search covering members/programmes (currently limited to users + coaches, matching the dropdown)
- Search result click-through analytics