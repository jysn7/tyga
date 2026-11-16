import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

type Portal = "client" | "coach" | "admin"

const PORTAL_HOME: Record<Portal, string> = {
  client: "/dashboard",
  coach: "/coach/overview",
  admin: "/admin/overview",
}

// Paths a logged-in but not-yet-AAL2 user must be able to reach.
const MFA_EXEMPT_PATHS = [
  "/auth/mfa/enroll",
  "/auth/mfa/challenge",
  "/auth/signin",
  "/auth/signout",
]

// Skip MFA enforcement entirely outside production.
const MFA_ENFORCED = process.env.NODE_ENV === "production"

function isPortalPathAllowed(path: string, role: Portal): boolean {
  if (role === "admin") return true
  if (role === "coach") return !path.startsWith("/admin")
  return !path.startsWith("/admin") && !path.startsWith("/coach")
}

function isMfaExempt(path: string) {
  return MFA_EXEMPT_PATHS.some((p) => path === p || path.startsWith(p + "/"))
}

/**
 * Redirect helper that preserves any cookies the Supabase client wrote
 * onto the current response (rotated tokens, cleared cookies, etc.).
 * Without this, a redirect silently discards the refreshed session and
 * the browser keeps sending the stale token on the next request.
 */
function redirectWithCookies(
  url: URL | string,
  source: NextResponse
): NextResponse {
  const redirect = NextResponse.redirect(url)
  source.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie)
  })
  return redirect
}

export async function proxy(request: NextRequest) {
  const { supabase, response: getResponse } = createClient(request)
  const path = request.nextUrl.pathname

  // ---- Public / pass-through routes ----
  const isHelpPage = path === "/help" || path.startsWith("/help/")
  const isCallback = path === "/auth/callback"
  const isWebhook = path.startsWith("/api/paystack/webhook")
  const isApiRoute = path.startsWith("/api/")
  const isOfflinePage = path === "/~offline" || path.startsWith("/~offline/")

  const isManifest =
    path === "/manifest.json" || path === "/manifest.webmanifest"
  const isServiceWorker =
    path === "/sw.js" ||
    path.startsWith("/serwist/") ||
    path.startsWith("/workbox-")

  if (
    isOfflinePage ||
    isCallback ||
    isWebhook ||
    isApiRoute ||
    isManifest ||
    isServiceWorker
  ) {
    return getResponse()
  }

  // MFA-exempt pages handle their own auth state. Without this, the
  // isAuthPage redirect below would loop on challenge and enroll.
  if (isMfaExempt(path)) {
    return getResponse()
  }

  const isAuthPage = path.startsWith("/auth/")
  const isProtectedPage = !isAuthPage && !isHelpPage

  // ---- Verify the session server-side ----
  // getUser() refreshes the token if needed and writes the rotated
  // cookies through setAll. Unlike getSession(), it verifies with the
  // auth server and returns { user, error } instead of throwing on a
  // stale refresh token — which is exactly what we need here.
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      // refresh_token_not_found, expired token, revoked session, etc.
      // Treat as signed out; getUser will have written cookie clears
      // onto the current response, which we preserve below.
      user = null
    } else {
      user = data.user
    }
  } catch {
    // Network failure or unexpected throw — treat as signed out.
    user = null
  }

  // Not signed in → sign-in page for protected routes
  if (!user && isProtectedPage) {
    return redirectWithCookies(
      new URL("/auth/signin", request.url),
      getResponse()
    )
  }

  // ---- Signed-in branch: role, portal, MFA ----
  if (user && (isAuthPage || !isHelpPage)) {
    const { data: account, error } = await supabase
      .rpc("get_my_account")
      .single<{ role: Portal }>()

    if (error || !account) {
      // Role lookup failed. Fall through rather than loop — client-side
      // auth will handle the state.
      return getResponse()
    }

    const home = PORTAL_HOME[account.role] ?? "/dashboard"

    // ---- MFA enforcement (production only) ----
    if (MFA_ENFORCED) {
      const { data: aal } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

      const mustVerify =
        aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2"
      const isPrivileged = account.role === "coach" || account.role === "admin"

      // Factor enrolled but not verified → challenge
      if (mustVerify) {
        const challengeUrl = new URL("/auth/mfa/challenge", request.url)
        challengeUrl.searchParams.set("next", path)
        return redirectWithCookies(challengeUrl, getResponse())
      }

      // Privileged user with no factor enrolled → force enrollment.
      // Parents are exempt — MFA is optional for them.
      const hasNoFactor =
        aal?.currentLevel === "aal1" && aal?.nextLevel === "aal1"
      if (isPrivileged && hasNoFactor && !isAuthPage) {
        return redirectWithCookies(
          new URL("/auth/mfa/enroll", request.url),
          getResponse()
        )
      }
    }

    // Signed-in users landing on an auth page → their portal home
    if (isAuthPage) {
      return redirectWithCookies(new URL(home, request.url), getResponse())
    }

    // Block cross-portal access (e.g. a parent hitting /admin)
    if (!isPortalPathAllowed(path, account.role)) {
      return redirectWithCookies(new URL(home, request.url), getResponse())
    }
  }

  return getResponse()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|serwist|workbox-|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
