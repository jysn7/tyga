# Authentication & Onboarding Documentation

## Overview

TYGA Platform uses Supabase Auth for authentication with email/password and Google OAuth providers. The authentication flow is tightly integrated with the platform's role-based access control system.

## Table of Contents

- [Architecture](#architecture)
- [Authentication Flow](#authentication-flow)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Components](#frontend-components)
- [Protected Routes](#protected-routes)
- [Password Reset](#password-reset)
- [Toast Notifications](#toast-notifications)
- [Environment Variables](#environment-variables)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)
- [Quick Reference](#quick-reference)
- [Next Steps](#next-steps)
- [Additional Resources](#additional-resources)

## Architecture

### How Auth Works

1. The sign-in and sign-up pages call Supabase Auth directly from the browser client.
2. Email/password flows use the standard Supabase `signUp` and `signInWithPassword` methods.
3. Google OAuth uses `signInWithOAuth` and redirects back through the callback route.
4. The callback route exchanges the OAuth code for a session and redirects the user to the dashboard with a success toast flag.
5. Email sign-up routes users to the verification page until Supabase confirms the email address.

### Database Tables

```sql
-- Main account table (linked to auth.users)
accounts (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('parent', 'coach', 'admin')),
  full_name text,
  email text UNIQUE,
  phone text,
  address text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
)
```

### Auth Flow Diagram

```
Sign in / Sign up page
        ↓
Supabase Auth
        ↓
Email flow: /auth/verify-email
Google flow: /auth/callback → /dashboard?toast=auth-success
        ↓
Protected app routes / dashboard / portal layouts
```

## Authentication Flow

### Sign Up

#### Email/Password Signup

```tsx
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "securepassword123",
  options: {
    data: {
      full_name: "John Doe",
    },
  },
})
```

On success, the app redirects to the verification page:

```tsx
router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
```

#### Google OAuth Signup / Sign In

```tsx
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

The callback route then exchanges the code for a session and redirects to the dashboard with the `toast=auth-success` query parameter.

### Sign In

#### Email/Password Sign In

```tsx
const { error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "securepassword123",
})
```

After a successful sign-in the app redirects to `/dashboard?toast=auth-success`.

### Sign Out

```tsx
const { error } = await supabase.auth.signOut()
```

## Database Schema

### Accounts Table

The `accounts` table stores all user profile data and is the primary table for authorization.

```sql
accounts (
  id uuid PRIMARY KEY
  role text -- 'parent' | 'coach' | 'admin'
  full_name text
  email text UNIQUE
  phone text
  address text
  active boolean
  created_at timestamptz
)
```

> **Important:** The `id` column is a direct reference to `auth.users.id`, not a separate serial ID.

### Users vs Accounts

| `auth.users` | `accounts` |
| --- | --- |
| Authentication only | Application data |
| Email/password hashed | Role, full name, phone, address |
| Managed by Supabase | Managed by our app |
| Not directly queried | Directly queried |

## API Reference

### Hooks

#### `useAuth()`

Returns the authenticated user and authentication state.

```tsx
const { user, loading, authorized } = useAuth(options?)
```

**Parameters:**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `redirectTo` | `string` | `"/auth/signin"` | Where to redirect unauthenticated users |
| `redirectIfAuthenticated` | `boolean` | `false` | If true, redirects authenticated users |

**Returns:**

| Property | Type | Description |
| --- | --- | --- |
| `user` | `User \| null` | The authenticated user object |
| `loading` | `boolean` | True while checking authentication |
| `authorized` | `boolean` | True if user is authorized |

**Example:**

```tsx
"use client"

import { useAuth } from "@/hooks/useAuth"

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return <div>Welcome, {user.user_metadata.full_name}</div>
}
```

### Utility Functions

#### `get_my_members()`

Returns all members belonging to the current user (database function).

```sql
SELECT * FROM get_my_members()
```

#### `create_member()`

Creates a new member for the current user.

```sql
SELECT create_member(
  p_full_name text,
  p_dob date,
  p_gender text,
  p_medical_notes text DEFAULT NULL,
  p_emergency_contact text DEFAULT NULL,
  p_current_level_id int DEFAULT NULL
)
```

#### `log_sensitive_data_access()`

Logs access to sensitive member data for audit.

```sql
SELECT log_sensitive_data_access(
  p_member_id int,
  p_field text,
  p_reason text DEFAULT NULL
)
```

## Frontend Components

### Layout Structure

```
Root Layout (app/layout.tsx)
  ├── Toaster
  └── Page Content
      ├── Auth Pages (no wrapper)
      │   ├── Sign In
      │   ├── Sign Up
      │   ├── Forgot Password
      │   └── Update Password
      └── Protected Pages (with AppShell)
          ├── Client Layout → AppShell("client")
          ├── Coach Layout → AppShell("coach")
          └── Admin Layout → AppShell("admin")
```

### Protected Layouts

Each portal has its own layout that wraps authenticated pages:

```tsx
// app/(client)/layout.tsx
"use client"

import { AppShell } from "@/components/portals/shared/app-shell"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AppShell portal="client">{children}</AppShell>
}
```

### AppShell Component

The AppShell component provides the main layout structure and handles authentication:

```tsx
import { AppShell } from "@/components/portals/shared/app-shell"

<AppShell portal="client">
  {/* Page content goes here */}
</AppShell>
```

**Features:**

- ✅ Authentication check
- ✅ Loading state
- ✅ Role-based navigation
- ✅ Sidebar with search
- ✅ Header with user menu
- ✅ Member switcher

### Sidebar Navigation

Navigation is configured per portal:

```tsx
// config/nav-client.ts
export const clientNav = [
  { label: "Dashboard", href: "/client", icon: LayoutDashboard },
  { label: "Programmes", href: "/client/programmes", icon: Calendar },
  // ...
]
```

### Layout Components

| Component | Purpose |
| --- | --- |
| `AppShell` | Main layout wrapper with auth |
| `Sidebar` | Navigation sidebar |
| `LayoutHeader` | Top header with user menu |
| `Toaster` | Toast notification system |

## Protected Routes

### Current Pattern

The app currently protects routes with a client-side auth hook and portal layouts rather than a top-level Next.js middleware file.

```tsx
const { user, loading } = useAuth()

if (loading) return <div>Loading...</div>
if (!user) return null
```

Protected content is typically rendered inside the portal layouts under the app router, such as the client, coach, and admin portal wrappers.


## Password Reset

### Flow

```
1. User clicks "Forgot Password"
   ↓
2. Enters email
   ↓
3. Supabase sends email with reset link
   ↓
4. User clicks link
   ↓
5. Redirected to /auth/update-password
   ↓
6. Enters new password
   ↓
7. Password updated
   ↓
8. Redirected to sign in
```

### Implementation

```tsx
// 1. Request reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/update-password`,
})

// 2. Update password
await supabase.auth.updateUser({
  password: newPassword,
})
```

## Toast Notifications

### Basic Usage

```tsx
import { toast } from "@/components/ui/toast"

toast.add({
  title: "Success!",
  description: "Operation completed successfully",
  type: "success",
})
```

### Auth-Related Toasts

The app uses toasts for sign-in feedback and password-reset feedback.

```tsx
// Success after OAuth or email/password sign-in
toast.add({
  title: "Welcome back! 🎉",
  description: "You've been signed in successfully.",
  type: "success",
})
```

The dashboard reads the `toast=auth-success` query parameter from the callback redirect and shows the success toast once before clearing the query parameter from the URL.

### Toast Types

| Type | Icon | Use Case |
| --- | --- | --- |
| `success` | ✅ | Successful operations |
| `error` | ❌ | Errors and failures |
| `warning` | ⚠️ | Warnings and alerts |
| `info` | ℹ️ | Informational messages |
| `loading` | 🔄 | Loading states |

### Programmatic Updates

```tsx
const toastId = toast.add({ title: "Signing in...", type: "loading" })

toast.update(toastId, {
  title: "Sign in failed",
  type: "error",
})
```

## Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

### Supabase Dashboard Settings

| Setting | Location | Value |
| --- | --- | --- |
| Site URL | Authentication → URL Configuration | `http://localhost:3000` (dev) |
| Redirect URLs | Authentication → URL Configuration | `http://localhost:3000/auth/callback` |
| Email Confirmation | Authentication → Settings | Enabled/Disabled |

## Common Patterns

### Protecting a Page

```tsx
"use client"

import { useAuth } from "@/hooks/useAuth"

export default function ProtectedPage() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return null

  return <div>Protected content</div>
}
```

### Getting Current User Data

```tsx
const { user } = useAuth()

const fullName = user?.user_metadata?.full_name || "User"
const email = user?.email || ""
const avatarUrl = user?.user_metadata?.avatar_url
```

### Checking User Role

```tsx
const role = user?.user_metadata?.role || "parent"

if (role === "admin") {
  // Show admin features
}
```

### Creating a Member for a Parent

```tsx
// Using the database function
const { data, error } = await supabase.rpc("create_member", {
  p_full_name: "Child Name",
  p_dob: "2015-01-01",
  p_gender: "male",
})
```

### Logging Sensitive Data Access

```tsx
// Audit log for viewing medical notes
await supabase.rpc("log_sensitive_data_access", {
  p_member_id: 123,
  p_field: "medical_notes",
  p_reason: "Coach viewing for session planning",
})
```

## Troubleshooting

### Users Not Created in Accounts Table

**Issue:** User signs up but `accounts` row doesn't exist.

**Solution:** Check the `handle_new_user()` trigger:

```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check trigger function
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

### Google OAuth Not Working

**Issue:** "Invalid OAuth provider" or "Redirect URI mismatch"

**Solution:**

- Check Google Console redirect URIs
- Verify Supabase provider settings
- Ensure Site URL is set correctly

### "Invalid supabaseUrl" Error

**Issue:** Environment variables not loaded.

**Solution:**

- Create `.env.local` file
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Restart dev server

### Toast Not Showing

**Issue:** Toasts not visible.

**Solution:**

- Ensure `Toaster` is in root layout
- Check toast type is correct
- For navigation, show toast after redirect or use a different approach

## Security Best Practices

- Never trust client data - Always validate on server
- Use RLS policies - Enforce row-level security
- Audit sensitive access - Log medical notes, DOB, emergency contacts
- Email verification - Enable for production
- Strong passwords - Minimum 8 characters
- Session management - Use secure cookies
- Environment variables - Never commit secrets

## Quick Reference

### Key Files

| File | Purpose |
| --- | --- |
| `utils/supabase/client.ts` | Client-side Supabase instance |
| `utils/supabase/server.ts` | Server-side Supabase instance |
| `hooks/useAuth.ts` | Authentication hook |
| `app/auth/callback/route.ts` | OAuth callback exchange and redirect |
| `app/auth/verify-email/page.tsx` | Email confirmation guidance page |
| `components/ui/toast.tsx` | Toast notifications |
| `components/portals/shared/app-shell.tsx` | Main layout wrapper |

### Key Functions

| Function | Purpose |
| --- | --- |
| `createClient()` | Get Supabase client (client-side or server-side) |
| `useAuth()` | Get current user and auth state |
| `toast.add()` | Show a toast notification |
| `toast.update()` | Update an existing toast |

### Database Functions

| Function | Purpose |
| --- | --- |
| `handle_new_user()` | Auto-create account on signup |
| `create_member()` | Create a new member |
| `get_my_members()` | Get user's members |
| `log_sensitive_data_access()` | Audit logging |

## Next Steps

- ✅ Set up environment variables
- ✅ Configure Supabase providers
- ✅ Create auth pages
- ✅ Set up protected layouts
- ✅ Implement role-based navigation
- ✅ Test auth flows
- ✅ Enable email verification (production)
- ✅ Set up RLS policies

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)