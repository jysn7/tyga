# Naming conventions

These conventions summarize patterns already used in TYGA and provide defaults for new work. When a nearby module has an established local convention, follow it unless there is a reason to make the pattern consistent more broadly.

## Source files and symbols

| Item | Convention | Example |
| --- | --- | --- |
| React component names | PascalCase | `MemberCard` |
| React component files | Follow the local directory's established style | UI primitives commonly use kebab-case, while some application components use PascalCase. |
| Hooks | camelCase with a `use` prefix | `useAuth`, `useAdminOverview` |
| Functions and variables | camelCase | `getMemberDetails` |
| Types and interfaces | PascalCase | `MemberProfile` |
| App Router segments | lowercase, usually kebab-case where multiword | `app/auth/`, `app/api/invite-coach/` |
| Supabase tables and columns | snake_case | `programme_sessions`, `created_at` |

## Directories and imports

- Keep route-specific code close to its App Router segment.
- Reuse existing domain-oriented directories under `components/` and `hooks/`.
- Use the `@/` alias for imports from the project root where consistent with nearby code.
- Prefer focused modules and explicit exports over adding a barrel solely for convenience.

## API and environment naming

- Keep API route paths resource-oriented and consistent with the existing `app/api/` tree.
- Use `NEXT_PUBLIC_` only for values that must be available to browser code.
- Keep service credentials and private keys server-side, without the `NEXT_PUBLIC_` prefix.
- Never commit real environment values. This repository currently has no tracked `.env.example`; see [authentication and environment setup](../development/authentication.md).

## Branches and commits

This repository's docs do not enforce a particular branching model or commit format. As a readable default, use short, descriptive branch names and commit subjects such as `docs: consolidate project guides` or `fix(auth): handle missing account role`. Follow any additional conventions configured by the team or repository host.
