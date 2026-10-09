// lib/auth/check-mfa.ts
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export type MfaPolicyResult =
  | { allowed: true; reason: "ok"; role: string; aal: string | null }
  | { allowed: false; reason: "no-session"; role: null; aal: null }
  | { allowed: false; reason: "mfa-required"; role: string; aal: string | null }

export async function checkMfaPolicy(): Promise<MfaPolicyResult> {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { allowed: false, reason: "no-session", role: null, aal: null }
  }

  // Use the same RPC the middleware uses — avoids RLS quirks on `accounts`
  const { data: account } = await supabase
    .rpc("get_my_account")
    .single<{ role: string }>()

  const role = account?.role ?? "parent"
  const isPrivileged = role === "coach" || role === "admin"

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const currentLevel = aal?.currentLevel ?? null
  const mfaVerified = currentLevel === "aal2"

  if (isPrivileged && !mfaVerified) {
    return { allowed: false, reason: "mfa-required", role, aal: currentLevel }
  }

  return { allowed: true, reason: "ok", role, aal: currentLevel }
}
