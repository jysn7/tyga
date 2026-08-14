import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth/")
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
