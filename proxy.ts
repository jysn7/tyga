import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

type Portal = "client" | "coach" | "admin"

const PORTAL_HOME: Record<Portal, string> = {
  client: "/dashboard",
  coach: "/coach/overview",
  admin: "/admin/overview",
}

function isPortalPathAllowed(path: string, role: Portal): boolean {
  if (role === "admin") return true // admins can access anything
  if (role === "coach") return !path.startsWith("/admin")
  // role === "client"
  return !path.startsWith("/admin") && !path.startsWith("/coach")
}

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Public routes that don't need session checks
  const isAuthPage = path.startsWith("/auth/")
  const isHelpPage = path === "/help" || path.startsWith("/help/")
  const isCallback = path === "/auth/callback"
  const isWebhook = path.startsWith("/api/paystack/webhook")
  const isApiRoute = path.startsWith("/api/")

  // PWA assets — must bypass auth or the SW/manifest fetch gets redirected
  const isManifest =
    path === "/manifest.json" || path === "/manifest.webmanifest"
  const isServiceWorker =
    path === "/sw.js" ||
    path.startsWith("/serwist/") ||
    path.startsWith("/workbox-")

  // Allow these to pass through without session check
  if (isCallback || isWebhook || isApiRoute || isManifest || isServiceWorker) {
    return response
  }

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
