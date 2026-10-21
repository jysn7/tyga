import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient as createBareClient } from "@supabase/supabase-js"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { createClient } from "@/utils/supabase/client"
import { isAal2Error, NeedsMfaError } from "@/hooks/shared/use-mfa"

const KEY = ["my-settings"] as const

export type MySettings = {
  id: string
  role: "parent" | "coach" | "admin"
  fullName: string
  email: string
  phone: string
  altPhone: string
  whatsappNumber: string
  area: string
  address: string
  relationshipToChild: string
  avatarUrl: string | null
  createdAt: string
  login: {
    providers: string[]
    hasPassword: boolean
    lastSignInAt: string | null
    emailConfirmed: boolean
  }
  mfaRequired: boolean
  sessions: {
    id: string
    userAgent: string | null
    createdAt: string
    lastActive: string | null
    aal: string | null
    isCurrent: boolean
  }[]
  childrenCount: number
  consents: {
    memberId: number
    memberName: string
    type: string
    signed: boolean
    signedAt: string | null
  }[]
  membership: {
    status: string
    amount: number
    interval: string
    nextChargeAt: string | null
    active: boolean
  } | null
  policy: {
    privacyUrl: string | null
    termsUrl: string | null
    cancellationText: string | null
    membershipRequired: boolean
  }
  contact: {
    email: string | null
    phone: string | null
    whatsapp: string | null
  }
  requests: {
    id: number
    kind: "export" | "deletion"
    status: "open" | "done" | "rejected" | "cancelled"
    createdAt: string
    handledAt: string | null
  }[]
  deletionBlockers: string[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toSettings(r: any): MySettings {
  return {
    id: r.id,
    role: r.role,
    fullName: r.full_name ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    altPhone: r.alt_phone ?? "",
    whatsappNumber: r.whatsapp_number ?? "",
    area: r.area ?? "",
    address: r.address ?? "",
    relationshipToChild: r.relationship_to_child ?? "",
    avatarUrl: r.avatar_url,
    createdAt: r.created_at,
    login: {
      providers: r.login?.providers ?? [],
      hasPassword: !!r.login?.has_password,
      lastSignInAt: r.login?.last_sign_in_at ?? null,
      emailConfirmed: !!r.login?.email_confirmed,
    },
    mfaRequired: !!r.mfa_required,
    sessions: (r.sessions ?? []).map((s: any) => ({
      id: s.id,
      userAgent: s.user_agent,
      createdAt: s.created_at,
      lastActive: s.last_active,
      aal: s.aal,
      isCurrent: !!s.is_current,
    })),
    childrenCount: Number(r.children_count ?? 0),
    consents: (r.consents ?? []).map((c: any) => ({
      memberId: c.member_id,
      memberName: c.member_name,
      type: c.type,
      signed: !!c.signed,
      signedAt: c.signed_at,
    })),
    membership: r.membership
      ? {
          status: r.membership.status,
          amount: Number(r.membership.amount),
          interval: r.membership.interval,
          nextChargeAt: r.membership.next_charge_at,
          active: !!r.membership.active,
        }
      : null,
    policy: {
      privacyUrl: r.policy?.privacy_url ?? null,
      termsUrl: r.policy?.terms_url ?? null,
      cancellationText: r.policy?.cancellation_text ?? null,
      membershipRequired: !!r.policy?.membership_required,
    },
    contact: {
      email: r.contact?.email ?? null,
      phone: r.contact?.phone ?? null,
      whatsapp: r.contact?.whatsapp ?? null,
    },
    requests: (r.requests ?? []).map((q: any) => ({
      id: q.id,
      kind: q.kind,
      status: q.status,
      createdAt: q.created_at,
      handledAt: q.handled_at,
    })),
    deletionBlockers: r.deletion_blockers ?? [],
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------- helpers ----------
export function normalisePhone(
  raw: string,
  required = true
): { ok: boolean; value: string | null; error?: string } {
  const t = raw.trim()
  if (!t) {
    return required
      ? { ok: false, value: null, error: "Phone number is required" }
      : { ok: true, value: null }
  }
  const parsed = parsePhoneNumberFromString(t, "ZA")
  if (!parsed || !parsed.isValid()) {
    return { ok: false, value: null, error: "Enter a valid phone number" }
  }
  return { ok: true, value: parsed.number }
}

// "Chrome on Windows" from a user-agent string
export function describeUserAgent(ua: string | null): string {
  if (!ua) return "Unknown device"
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Browser"
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/.test(ua)
        ? "iOS"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "an unknown system"
  return `${browser} on ${os}`
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ---------- reading ----------
export function useMySettings() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<MySettings> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("get_my_settings")
      if (error) throw new Error(error.message)
      return toSettings(data)
    },
    staleTime: 30_000,
  })
}

// ---------- profile ----------
export type ProfilePatch = Partial<{
  fullName: string
  phone: string
  altPhone: string
  whatsappNumber: string
  area: string
  address: string
  relationshipToChild: string
}>

export function useUpdateMySettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ProfilePatch) => {
      const patch: Record<string, string | null> = {}

      if (input.fullName !== undefined) patch.full_name = input.fullName.trim()

      for (const [field, key, required] of [
        ["phone", "phone", true],
        ["altPhone", "alt_phone", false],
        ["whatsappNumber", "whatsapp_number", false],
      ] as const) {
        const raw = input[field]
        if (raw === undefined) continue
        const p = normalisePhone(raw, required)
        if (!p.ok) throw new Error(p.error)
        patch[key] = p.value
      }

      if (input.area !== undefined) patch.area = input.area.trim() || null
      if (input.address !== undefined)
        patch.address = input.address.trim() || null
      if (input.relationshipToChild !== undefined) {
        patch.relationship_to_child = input.relationshipToChild || null
      }

      if (Object.keys(patch).length === 0) return

      const supabase = createClient()
      const { error } = await supabase.rpc("update_my_settings", {
        p_patch: patch,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

// ---------- profile photo ----------
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]
const AVATAR_MAX_BYTES = 2 * 1024 * 1024

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { file: File; userId: string }) => {
      const { file, userId } = input
      if (!AVATAR_TYPES.includes(file.type))
        throw new Error("Use a JPG, PNG or WEBP image")
      if (file.size > AVATAR_MAX_BYTES)
        throw new Error("The photo must be 2 MB or smaller")

      const supabase = createClient()
      const ext =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg"
      const fileName = `avatar-${Date.now()}.${ext}`
      const path = `${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file)
      if (uploadError) throw new Error(uploadError.message)

      const { data } = supabase.storage.from("avatars").getPublicUrl(path)
      const { error: rpcError } = await supabase.rpc("set_my_avatar", {
        p_avatar_url: data.publicUrl,
      })
      if (rpcError) throw new Error(rpcError.message)

      // best effort: remove earlier photos so old ones don't pile up
      try {
        const { data: files } = await supabase.storage
          .from("avatars")
          .list(userId)
        const old = (files ?? [])
          .filter((f) => f.name !== fileName)
          .map((f) => `${userId}/${f.name}`)
        if (old.length) await supabase.storage.from("avatars").remove(old)
      } catch {
        /* ignore */
      }
      return data.publicUrl
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

// ---------- password ----------
// Checks the current password on a throwaway client, so the signed-in session is untouched.
// If the account has an authenticator and this session hasn't entered a code,
// this throws NeedsMfaError: show the code step (useStepUpMfa) and call it again.
// Note: if you added CAPTCHA to sign-in, the current-password check needs a token too.
export function useChangePassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      email: string
      currentPassword: string
      newPassword: string
    }) => {
      if (input.newPassword.length < 8)
        throw new Error("The new password must be at least 8 characters")
      if (input.newPassword === input.currentPassword) {
        throw new Error(
          "The new password must be different from your current one"
        )
      }

      const supabase = createClient()

      const { data: aal } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2")
        throw new NeedsMfaError()

      const verifier = createBareClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      )
      const { error: verifyError } = await verifier.auth.signInWithPassword({
        email: input.email,
        password: input.currentPassword,
      })
      if (verifyError) throw new Error("Your current password is incorrect")

      const { error } = await supabase.auth.updateUser({
        password: input.newPassword,
      })
      if (error) {
        if (isAal2Error(error.message, error.code)) throw new NeedsMfaError()
        throw new Error(error.message)
      }

      // sign out every other device (also removes the temporary check session)
      await supabase.rpc("revoke_my_other_sessions")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

// ---------- devices ----------
export function useRevokeSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const supabase = createClient()
      const { error } = await supabase.rpc("revoke_my_session", {
        p_session_id: sessionId,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useRevokeOtherSessions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("revoke_my_other_sessions")
      if (error) throw new Error(error.message)
      return Number(data ?? 0)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

// ---------- your data (POPIA) ----------
export function useExportMyData() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("get_my_data_export")
      if (error) throw new Error(error.message)
      const stamp = new Date().toLocaleDateString("en-CA", {
        timeZone: "Africa/Johannesburg",
      })
      downloadJson(`tyga-my-data-${stamp}.json`, data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useRequestDeletion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (reason?: string) => {
      const supabase = createClient()
      const { error } = await supabase.rpc("request_account_deletion", {
        p_reason: reason?.trim() || null,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useCancelDeletionRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { error } = await supabase.rpc("cancel_my_deletion_request")
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
