# Thipe Youth Golf Academy Platform

A booking and enrollment platform for a golf academy client, split across three applications:
a public marketing site, an authenticated customer portal, and an internal
admin application.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **State:** Zustand (client-side booking flow state)
- **Payments:** Paystack
- **Testing:** Jest (unit) + Playwright (E2E)
- **Hosting:** Vercel / Railway
- **CI/CD:** GitHub Actions

## Getting Started

### 1. Clone the repo

\`\`\`
git clone https://github.com/jysn7/tyga.git
cd tyga
\`\`\`

### 2. Install dependencies

\`\`\`
npm install
\`\`\`

### 3. Set up environment variables

Copy the example file and fill in real values (ask a team member for the
Supabase/Paystack credentials â€” never commit real keys):

\`\`\`
cp .env.example .env.local
\`\`\`

### 4. Run the dev server

\`\`\`
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000).

## Project Structure

```
tyga/
├── app/                    # Next.js App Router pages
├── components/             # reusable app components and UI primitives
│   ├── portals/            # route-specific layout and portal components
│   ├── ui/                 # shadcn primitive wrappers and primitives
│   └── theme-provider.tsx  # light/dark theme provider
├── lib/                    # shared helper utilities
│   └── utils.ts            # Tailwind class merge helper
├── supabase/               # local Supabase config and migrations
├── docs/                   # contributor and workflow documentation
│   └── NAMING_CONVENTIONS.md
├── doc/                    # developer-facing technical documentation
└── .env.example
```

## Branching & Workflow

- `main` â€” production, protected, no direct pushes.
- `dev` â€” integration branch, all features merge here first.
- `feature/*`, `fix/*`, `docs/*`, `chore/*` â€” cut from `dev`.
- Every PR needs **two approvals** before merging to `dev`.
- See `docs/NAMING_CONVENTIONS.md` for full commit/branch/naming rules.

## Testing

```bash
npm run test        # Jest unit tests
```

Playwright/E2E tests are not configured in this repository yet.

## Deployment

Deployed via Vercel/Railway from the `main` branch. Current environment setup documentation is not included in this repository.

## Developer Documentation

This repository also includes developer-facing documentation in the `doc/` folder:

- `doc/README.md`
- `doc/folder-structure.md`
- `doc/page-routing.md`
- `doc/component-guidelines.md`
- `doc/portals.md`
- `doc/improvements.md`

