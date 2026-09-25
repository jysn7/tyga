import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Public routes that don't need session checks
  const isAuthPage = path.startsWith("/auth/")
  const isCallback = path === "/auth/callback"
  const isWebhook = path.startsWith("/api/paystack/webhook")
  const isApiRoute = path.startsWith("/api/")
  const isAdminPage = path.startsWith("/admin")

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

  const isProtectedPage = !isAuthPage

  if (!session && isProtectedPage) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (session && isAdminPage) {
    const { data: account, error } = await supabase
      .rpc("get_my_account")
      .single<{ role: string }>()

    if (error || !account || account.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|serwist|workbox-|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
