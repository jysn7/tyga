# Contributing

Contributions should be focused, understandable and consistent with the current application patterns.

## Before making a change

1. Check the existing routes, hooks, components and migrations related to the change.
2. Review the [development guides](../development/README.md) and relevant [feature documentation](../features/README.md).
3. Confirm the active branch and repository status so unrelated work is preserved.

## While working

- Keep changes scoped and follow established naming and architecture conventions.
- Do not commit `.env.local`, credentials or other secrets.
- Update the relevant documentation when behavior or setup changes.
- Add or adjust tests for changed behavior where an appropriate test setup exists.
- For database changes, add a migration under `supabase/migrations/` rather than relying on undocumented manual edits.

## Before opening a pull request

Run the checks relevant to the change. The repository currently provides:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Describe the user-visible change, summarize implementation choices, list the checks run and call out any configuration or migration steps. Link related issues or design context where available.

No branch-protection, reviewer-count or deployment policy is specified by these repository docs; follow the requirements configured for the target repository and team.
