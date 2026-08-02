# Contributing â€” Tyga

## Before you start
1. Pull the latest dev: git checkout dev && git pull 
2. Create your branch: git checkout -b feature/your-feature-name 
3. Review the developer docs in doc/README.md for current repository structure and conventions.

## While working
- Commit often, following the convention in `NAMING_CONVENTIONS.md`
  (`type(scope): description`).
- Keep PRs small and scoped to one feature/fix where possible.
- If you're touching a shadcn component in `components/ui/`, make sure
  you're intentionally customizing it to match Figma â€” not reverting
  someone else's styling changes.

## Opening a PR
1. Push your branch and open a PR into `dev` (never `main` directly).
2. Fill in what changed and link the related task/issue.
3. Request review from Jayson (primary reviewer) + that week's rotating
   second reviewer.
4. Two approvals required before merge.
5. Squash-merge into `dev` once approved.

## Definition of Done
Check `NAMING_CONVENTIONS.md` Section 9 before marking anything complete.
