import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export const MFA_KEY = ["mfa"] as const
export const MAX_AUTHENTICATORS = 5

export class NeedsMfaError extends Error {
  constructor(message = "Enter your authenticator code to continue.") {
    super(message)
    this.name = "NeedsMfaError"
  }
}

export const isAal2Error = (message?: string, code?: string) =>
  code === "insufficient_aal" || /aal2/i.test(message ?? "")

export type MfaFactor = {
  id: string
  friendlyName: string
  status: "verified" | "unverified"
  createdAt: string
}

export type MfaState = {
  factors: MfaFactor[] // verified authenticators
  pending: MfaFactor[] // started but never finished
  currentLevel: string | null
  nextLevel: string | null
  needsStepUp: boolean // has an authenticator but hasn't entered a code this session
}

// SVG markup or a data URL, depending on the Supabase version
export const qrSrc = (qr: string) =>
  qr.startsWith("data:")
    ? qr
    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`

export function useMfaState() {
  return useQuery({
    queryKey: MFA_KEY,
    queryFn: async (): Promise<MfaState> => {
      const supabase = createClient()
      const [factorsRes, aalRes] = await Promise.all([
        supabase.auth.mfa.listFactors(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      ])
      if (factorsRes.error) throw new Error(factorsRes.error.message)
      if (aalRes.error) throw new Error(aalRes.error.message)

      const totp = (factorsRes.data?.all ?? []).filter(
        (f) => f.factor_type === "totp"
      )
      const map = (f: (typeof totp)[number]): MfaFactor => ({
        id: f.id,
        friendlyName: f.friendly_name ?? "Authenticator",
        status: f.status === "verified" ? "verified" : "unverified",
        createdAt: f.created_at,
      })

      const aal = aalRes.data
      return {
        factors: totp.filter((f) => f.status === "verified").map(map),
        pending: totp.filter((f) => f.status !== "verified").map(map),
        currentLevel: aal?.currentLevel ?? null,
        nextLevel: aal?.nextLevel ?? null,
        needsStepUp: aal?.nextLevel === "aal2" && aal?.currentLevel !== "aal2",
      }
    },
    staleTime: 10_000,
  })
}

function useRefreshMfa() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: MFA_KEY })
    qc.invalidateQueries({ queryKey: ["my-settings"] })
  }
}

// Step 1 of adding an authenticator: returns the QR code and manual key
export function useStartTotpEnrollment() {
  return useMutation({
    mutationFn: async (input: { friendlyName?: string } = {}) => {
      const supabase = createClient()
      const { data: list, error: listError } =
        await supabase.auth.mfa.listFactors()
      if (listError) throw new Error(listError.message)

      const all = (list?.all ?? []).filter((f) => f.factor_type === "totp")
      const verified = all.filter((f) => f.status === "verified")
      if (verified.length >= MAX_AUTHENTICATORS) {
        throw new Error(
          `You can have up to ${MAX_AUTHENTICATORS} authenticators. Remove one first.`
        )
      }

      // clear abandoned attempts, otherwise a retry can fail
      for (const f of all.filter((f) => f.status !== "verified")) {
        try {
          await supabase.auth.mfa.unenroll({ factorId: f.id })
        } catch {
          /* ignore */
        }
      }

      const taken = new Set(
        verified.map((f) => (f.friendly_name ?? "").trim().toLowerCase())
      )
      let name = (input.friendlyName ?? "").trim()
      if (!name) {
        let n = verified.length + 1
        name = `Authenticator ${n}`
        while (taken.has(name.toLowerCase())) name = `Authenticator ${++n}`
      }
      if (name.length > 30)
        throw new Error("Name must be 30 characters or fewer")
      if (taken.has(name.toLowerCase()))
        throw new Error("You already have an authenticator with that name")

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: name,
      })
      if (error || !data) {
        if (isAal2Error(error?.message, error?.code)) throw new NeedsMfaError()
        throw new Error(error?.message ?? "Could not start setup")
      }

      return {
        factorId: data.id,
        name,
        qr: data.totp.qr_code,
        secret: data.totp.secret,
      }
    },
  })
}

// Step 2: the 6-digit code from the app turns it on
export function useVerifyTotpEnrollment() {
  const refresh = useRefreshMfa()
  return useMutation({
    mutationFn: async (input: { factorId: string; code: string }) => {
      const supabase = createClient()
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: input.factorId,
        code: input.code.trim(),
      })
      if (error)
        throw new Error(
          "That code didn't work. Use the newest code in your app."
        )
    },
    onSuccess: refresh,
  })
}

export function useCancelTotpEnrollment() {
  const refresh = useRefreshMfa()
  return useMutation({
    mutationFn: async (factorId: string) => {
      const supabase = createClient()
      await supabase.auth.mfa.unenroll({ factorId })
    },
    onSettled: refresh,
  })
}

// Enter a code for an existing authenticator, to unlock sensitive changes this session
export function useStepUpMfa() {
  const refresh = useRefreshMfa()
  return useMutation({
    mutationFn: async (input: { code: string; factorId?: string }) => {
      const supabase = createClient()
      let factorId = input.factorId
      if (!factorId) {
        const { data } = await supabase.auth.mfa.listFactors()
        factorId = data?.totp?.[0]?.id
      }
      if (!factorId) throw new Error("No authenticator found")

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: input.code.trim(),
      })
      if (error)
        throw new Error(
          "That code didn't work. Use the newest code in your app."
        )
    },
    onSuccess: refresh,
  })
}

// Staff must always keep at least one authenticator
export function useRemoveMfaFactor(isStaff: boolean) {
  const refresh = useRefreshMfa()
  return useMutation({
    mutationFn: async (factorId: string) => {
      const supabase = createClient()
      const { data: list } = await supabase.auth.mfa.listFactors()
      const verified = (list?.totp ?? []).length

      if (isStaff && verified <= 1) {
        throw new Error(
          "Staff accounts must keep at least one authenticator. Add another one first."
        )
      }

      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) {
        if (isAal2Error(error.message, error.code)) throw new NeedsMfaError()
        throw new Error(error.message)
      }
    },
    onSuccess: refresh,
  })
}
