// app/(protected)/settings/security/page.tsx
import { createClient } from "@/utils/supabase/server"
import { EnrollMFA } from "@/components/portals/shared/enroll-mfa"
import { DisableMFA } from "@/components/portals/shared/auth/disable-mfa"
import { cookies } from "next/headers"
import { ShieldCheck } from "lucide-react"

export default async function SecuritySettings() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  await supabase.auth.getUser()

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const verifiedFactor = factors?.totp?.find((f) => f.status === "verified")
  const hasMFA = Boolean(verifiedFactor)

  return (
    <div className="flex flex-col gap-6">
      {/* Two-factor authentication */}
      <section className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <ShieldCheck
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
          />
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Two-factor authentication
            </h2>
            <p className="text-xs text-muted-foreground">
              {hasMFA
                ? "An extra layer of security is active. You'll be asked for a code from your authenticator app at each login."
                : "Add an extra layer of security by requiring a code from your authenticator app at login. Optional, but recommended."}
            </p>
          </div>
        </div>

        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          {hasMFA ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-green" />
                <span className="text-sm font-medium text-foreground">
                  Enabled
                </span>
              </div>
              <DisableMFA factorId={verifiedFactor!.id} />
            </div>
          ) : (
            <EnrollMFA nextPath="/settings/security" />
          )}
        </div>
      </section>
    </div>
  )
}
