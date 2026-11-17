import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { EnrollMFA } from "@/components/portals/shared/enroll-mfa"
import { cookies } from "next/headers"

const PORTAL_HOME: Record<string, string> = {
  admin: "/admin/overview",
  coach: "/coach/dashboard",
  parent: "/dashboard",
}

export default async function MfaEnrollPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/signin")

  // Use the same RPC your middleware uses — avoids RLS edge cases
  const { data: account } = await supabase
    .rpc("get_my_account")
    .single<{ role: string }>()

  const role = account?.role ?? "parent"
  const isPrivileged = role === "coach" || role === "admin"
  const home = PORTAL_HOME[role] ?? "/dashboard"

  // Check if they already have a verified factor
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const hasVerified = factors?.totp?.some((f) => f.status === "verified")

  // Parents can't land here — MFA is optional for them.
  // Privileged users with a verified factor have nothing to enroll.
  if (!isPrivileged || hasVerified) {
    redirect(home)
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-secondary px-4 py-12">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 h-40 w-40 rotate-12 rounded-3xl bg-muted" />
        <div className="absolute -right-10 bottom-16 h-52 w-52 rounded-full bg-muted" />
        <div className="absolute -bottom-20 left-1/4 h-32 w-32 -rotate-6 rounded-2xl bg-card" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Two-factor authentication required
          </h1>
          <p className="text-sm text-muted-foreground">
            As a {role}, you must enable two-factor authentication before
            accessing the academy.
          </p>
        </div>

        <EnrollMFA nextPath={home} />
      </div>
    </div>
  )
}
