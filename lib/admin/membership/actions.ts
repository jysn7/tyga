"use server"

import { cookies } from "next/headers"
import { createClient as createServerClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

type Result = { error: string | null }

const service = () =>
  createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
    }
  )

async function paystack<T>(path: string, init?: RequestInit) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  })
  const json = await res.json().catch(() => null)
  return {
    ok: !!json?.status,
    message: (json?.message as string) ?? "Paystack error",
    data: (json?.data ?? null) as T | null,
  }
}

async function currentUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const { data } = await supabase.auth.getUser()
  return { supabase, user: data.user }
}

// Mirrors the return of membership_get_credentials() in SQL
type Credentials = {
  membership_id: number
  subscription_code: string
  email_token: string | null
  status: string
  current_period_end: string | null
}

async function credentials(accountId: string): Promise<Credentials | null> {
  const { data } = await service().rpc("membership_get_credentials", {
    p_account_id: accountId,
  })
  return ((data as Credentials[] | null) ?? [])[0] ?? null
}

// ---------- the parent ----------
export async function startMembership(): Promise<Result & { url?: string }> {
  const { user } = await currentUser()
  if (!user?.email) return { error: "Please sign in again" }

  const svc = service()
  const { data: blocked, error } = await svc.rpc("membership_can_start", {
    p_account_id: user.id,
  })
  if (error) return { error: error.message }
  if (blocked) return { error: blocked as string }

  const { data: s } = await svc
    .from("app_settings")
    .select("membership_plan_code, membership_fee_amount")
    .eq("id", 1)
    .single()

  if (!s?.membership_plan_code)
    return { error: "Membership is not set up yet. Please contact the academy" }

  const res = await paystack<{ authorization_url: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(Number(s.membership_fee_amount ?? 0) * 100),
        currency: "ZAR",
        plan: s.membership_plan_code,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/billing/membership?checkout=done`,
        metadata: { kind: "membership", account_id: user.id },
      }),
    }
  )
  if (!res.ok || !res.data)
    return { error: "We couldn't start the payment. Please try again" }
  return { error: null, url: res.data.authorization_url }
}

export async function cancelMyMembership(): Promise<Result> {
  const { user } = await currentUser()
  if (!user) return { error: "Please sign in again" }

  const c = await credentials(user.id)
  if (!c || !c.email_token)
    return {
      error: "We couldn't find your subscription. Please contact the academy",
    }

  const res = await paystack("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code: c.subscription_code, token: c.email_token }),
  })
  if (!res.ok)
    return {
      error:
        "We couldn't cancel it right now. Please try again or contact the academy",
    }

  await service().rpc("membership_mark_not_renewing", { p_account_id: user.id })
  return { error: null }
}

export async function resumeMyMembership(): Promise<Result> {
  const { user } = await currentUser()
  if (!user) return { error: "Please sign in again" }

  const c = await credentials(user.id)
  if (!c || !c.email_token)
    return {
      error: "We couldn't find your subscription. Please contact the academy",
    }
  if (c.status !== "non_renewing")
    return { error: "Your membership is already renewing" }

  const res = await paystack("/subscription/enable", {
    method: "POST",
    body: JSON.stringify({ code: c.subscription_code, token: c.email_token }),
  })
  if (!res.ok) {
    // If Paystack says the subscription is already active, treat it as success
    if (/already.*(enabled|active)/i.test(res.message)) {
      await service().rpc("membership_mark_resumed", { p_account_id: user.id })
      return { error: null }
    }
    return {
      error:
        "We couldn't resume it right now. Please try again or contact the academy",
    }
  }

  await service().rpc("membership_mark_resumed", { p_account_id: user.id })
  return { error: null }
}

export async function getCardUpdateLink(): Promise<Result & { url?: string }> {
  const { user } = await currentUser()
  if (!user) return { error: "Please sign in again" }

  const c = await credentials(user.id)
  if (!c)
    return {
      error: "We couldn't find your subscription. Please contact the academy",
    }

  const res = await paystack<{ link: string }>(
    `/subscription/${encodeURIComponent(c.subscription_code)}/manage/link`
  )
  if (!res.ok || !res.data?.link)
    return { error: "We couldn't open the card page. Please try again" }
  return { error: null, url: res.data.link }
}

// ---------- the administrator ----------
export async function adminCancelMembership(
  accountId: string,
  reason: string
): Promise<Result> {
  const { supabase } = await currentUser()

  const { error } = await supabase.rpc("admin_authorize_membership_action", {
    p_account_id: accountId,
    p_action: "cancel",
    p_reason: reason,
  })
  if (error) return { error: error.message }

  const c = await credentials(accountId)
  if (!c || !c.email_token) {
    return {
      error:
        "The subscription token is missing, so it cannot be cancelled from here. Cancel it in the Paystack dashboard, then use Sync",
    }
  }

  const res = await paystack("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code: c.subscription_code, token: c.email_token }),
  })
  if (!res.ok) return { error: `Paystack refused: ${res.message}` }

  await service().rpc("membership_mark_not_renewing", {
    p_account_id: accountId,
  })
  await supabase.rpc("admin_log_membership_action", {
    p_account_id: accountId,
    p_action: "membership_cancelled",
    p_reason: reason,
  })
  return { error: null }
}

// Pulls the truth from Paystack, for when a webhook was missed
export async function adminSyncMembership(accountId: string): Promise<Result> {
  const { supabase } = await currentUser()

  const { error } = await supabase.rpc("admin_authorize_membership_action", {
    p_account_id: accountId,
    p_action: "sync",
  })
  if (error) return { error: error.message }

  const c = await credentials(accountId)
  if (!c) return { error: "No open card subscription found" }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const res = await paystack<any>(
    `/subscription/${encodeURIComponent(c.subscription_code)}`
  )
  if (!res.ok || !res.data) return { error: `Paystack refused: ${res.message}` }
  const d = res.data

  const { data: applyData, error: applyError } = await service().rpc(
    "apply_membership_subscription_event",
    {
      p_event: "sync",
      p_account_id: accountId,
      p_customer_code: d.customer?.customer_code ?? null,
      p_email: d.customer?.email ?? null,
      p_subscription_code: c.subscription_code,
      p_plan_code: d.plan?.plan_code ?? null,
      p_email_token: d.email_token ?? null,
      p_status: d.status ?? null,
      p_amount_cents: d.amount ?? null,
      p_interval: d.plan?.interval ?? null,
      p_next_payment: d.next_payment_date ?? null,
      p_reference: null,
    }
  )
  if (applyError) return { error: applyError.message }

  // The RPC returns { applied: false, reason: "other_plan" } when the plan
  // code on Paystack doesn't match app_settings.membership_plan_code.
  // Without this check, the admin sees "synced" but nothing changed.
  const applied = (applyData as { applied?: boolean; reason?: string } | null)
    ?.applied
  if (applied === false) {
    const reason = (applyData as { reason?: string } | null)?.reason
    return {
      error: `Sync didn't apply: ${reason ?? "unknown reason"}. The Paystack plan may not match the configured plan.`,
    }
  }

  await supabase.rpc("admin_log_membership_action", {
    p_account_id: accountId,
    p_action: "membership_synced",
    p_reason: `Paystack status: ${d.status}`,
  })
  return { error: null }
}
