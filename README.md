# TYGA

TYGA is a web platform for Thipe Youth Golf Academy. It brings together family/member onboarding, programme enrollment, coaching operations, appointments, academy administration and payments in one application.

The application is a single Next.js App Router project with role-specific parent, coach and admin areas. Product behavior and implementation boundaries are documented in the [feature guide](./docs/features/README.md).

## Features

- Parent and member profiles, enrollment and programme discovery
- Coach and session administration, attendance, curriculum and progression tracking
- Appointment availability, assessment bookings and schedules
- Admin tools for accounts, coaches, academy settings, venues and events
- Supabase-backed authentication and data access
- Paystack checkout and webhook-based payment confirmation
- In-app notifications, optional web push and installable PWA support

See [feature documentation](./docs/features/README.md) for detailed coverage and known gaps.

## Tech stack

- Next.js App Router, React and TypeScript
- Tailwind CSS and reusable Base UI-based components
- Supabase Auth, PostgreSQL, Row Level Security and Storage
- TanStack Query and Zustand
- Paystack and Web Push
- Jest, ESLint and Prettier

Dependency ranges and available scripts are maintained in [`package.json`](./package.json).

## Prerequisites

- Node.js compatible with the installed Next.js version
- npm
- A Supabase project with the repository migrations applied

Optional integrations such as Paystack, Google Maps and Web Push need their own credentials and provider configuration.

## Getting started

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/jysn7/tyga.git
   cd tyga
   npm install
   ```

2. Create a local `.env.local` file and set the required Supabase values. Add server-only and optional integration settings as needed; see [authentication and environment setup](./docs/development/authentication.md). There is currently no tracked `.env.example` file.

3. Configure the Supabase Auth site URL and redirect URLs for the local app (`http://localhost:3000`), then apply the SQL migrations in `supabase/migrations/` using your project's Supabase workflow.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

Never commit `.env.local`, service-role keys, payment secrets, or VAPID private keys.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run build` | Build the production application |
| `npm run start` | Serve a production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm test` | Run the Jest test suite |
| `npm run format` | Format TypeScript and TSX files in place |

## Repository layout

```text
app/                 App Router pages, layouts and API route handlers
components/          Shared and portal-specific React components
hooks/               Feature and data hooks
lib/, utils/         Shared application logic and Supabase clients
stores/              Shared client state
supabase/            Supabase configuration and SQL migrations
public/              Static assets
docs/                Feature, development and contribution documentation
```

For details, see [repository structure](./docs/development/repository-structure.md) and [routing](./docs/development/routing.md).

## Documentation

- [Documentation index](./docs/README.md)
- [Features](./docs/features/README.md)
- [Development guides](./docs/development/README.md)
- [Contributing](./docs/project/contributing.md)
- [Naming conventions](./docs/project/naming-conventions.md)

## Contributing

Please read the [contribution guide](./docs/project/contributing.md) before opening a change. Keep pull requests focused, describe how they were validated, and update the relevant documentation when behavior changes.
