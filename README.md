# Tyga — Golf Academy Booking Platform

A booking platform for a golf academy client, split across three applications:
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
Supabase/Paystack credentials — never commit real keys):

\`\`\`
cp .env.example .env.local
\`\`\`

### 4. Run the dev server

\`\`\`
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000).

## Project Structure

\`\`\`
tyga/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                 # shadcn primitives — customized to match Figma
│   └── ...                 # custom app components (LessonCard, CoachCard, etc.)
├── lib/
│   └── supabaseClient.ts   # Supabase client setup
├── docs/
│   └── NAMING_CONVENTIONS.md
└── .env.example
\`\`\`

## Branching & Workflow

- `main` — production, protected, no direct pushes.
- `dev` — integration branch, all features merge here first.
- `feature/*`, `fix/*`, `docs/*`, `chore/*` — cut from `dev`.
- Every PR needs **two approvals** before merging to `dev`.
- See `docs/NAMING_CONVENTIONS.md` for full commit/branch/naming rules.

## Testing

\`\`\`bash
npm run test        # Jest unit tests
npm run test:e2e     # Playwright E2E tests
\`\`\`

## Deployment

Deployed via Vercel/Railway from the `main` branch. See
`docs/TECHNICAL_SETUP_GUIDE.md` for environment variable setup and deployment
steps (added in Week 9).

