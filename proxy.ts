import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

type Portal = "client" | "coach" | "admin"

const PORTAL_HOME: Record<Portal, string> = {
  client: "/dashboard",
  coach: "/coach/overview",
  admin: "/admin/overview",
}

// Paths a logged-in but not-yet-AAL2 user must be able to reach
const MFA_EXEMPT_PATHS = [
  "/auth/mfa/enroll",
  "/auth/mfa/challenge",
  "/auth/signin",
  "/auth/signout",
]

function isPortalPathAllowed(path: string, role: Portal): boolean {
  if (role === "admin") return true // admins can access anything
  if (role === "coach") return !path.startsWith("/admin")
  // role === "client"
  return !path.startsWith("/admin") && !path.startsWith("/coach")
}

function isMfaExempt(path: string) {
  return MFA_EXEMPT_PATHS.some((p) => path === p || path.startsWith(p + "/"))
}

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Public routes that don't need session checks
  const isHelpPage = path === "/help" || path.startsWith("/help/")
  const isCallback = path === "/auth/callback"
  const isWebhook = path.startsWith("/api/paystack/webhook")
  const isApiRoute = path.startsWith("/api/")
  const isOfflinePage = path === "/~offline" || path.startsWith("/~offline/")

  // PWA assets — must bypass auth or the SW/manifest fetch gets redirected
  const isManifest =
    path === "/manifest.json" || path === "/manifest.webmanifest"
  const isServiceWorker =
    path === "/sw.js" ||
    path.startsWith("/serwist/") ||
    path.startsWith("/workbox-")

  // Allow these to pass through without session check
  if (
    isOfflinePage ||
    isCallback ||
    isWebhook ||
    isApiRoute ||
    isManifest ||
    isServiceWorker
  ) {
    return response
  }

  // MFA-exempt pages: always let through. They handle their own auth state.
  // Without this, the isAuthPage redirect below would loop on the
  // challenge and enroll pages.
  if (isMfaExempt(path)) {
    return response
  }

  const isAuthPage = path.startsWith("/auth/")
  const isProtectedPage = !isAuthPage && !isHelpPage

  // Not signed in → kick to signin
  if (!session && isProtectedPage) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  // Signed in and we need to know the role (for auth page redirect
  // and for portal access checks). Fetch once if needed.
  if (session && (isAuthPage || !isHelpPage)) {
    const { data: account, error } = await supabase
      .rpc("get_my_account")
      .single<{ role: Portal }>()

    if (error || !account) {
      // If we can't figure out the role, safest is to let them through
      // to /dashboard and let the client-side auth handle it, or bounce to signin.
      // Letting through avoids a redirect loop if get_my_account is failing.
      return response
    }

    const home = PORTAL_HOME[account.role] ?? "/dashboard"

    // --- MFA enforcement (before the auth-page and portal redirects) ---
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    const mustVerify = aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2"
    const isPrivileged = account.role === "coach" || account.role === "admin"

    // Has a factor enrolled but hasn't verified → challenge
    if (mustVerify) {
      const challengeUrl = new URL("/auth/mfa/challenge", request.url)
      challengeUrl.searchParams.set("next", path)
      return NextResponse.redirect(challengeUrl)
    }

    // Privileged user with no factor enrolled → force enrollment.
    // Parents are skipped — MFA is optional for them.
    const hasNoFactor =
      aal?.currentLevel === "aal1" && aal?.nextLevel === "aal1"
    if (isPrivileged && hasNoFactor && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/mfa/enroll", request.url))
    }

    // Redirect signed-in users away from auth pages to their portal home
    if (isAuthPage) {
      return NextResponse.redirect(new URL(home, request.url))
    }

    // Block cross-portal access
    if (!isPortalPathAllowed(path, account.role)) {
      return NextResponse.redirect(new URL(home, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|serwist|workbox-|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
