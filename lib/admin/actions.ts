"use server"

import { cookies } from "next/headers"
import { createClient as createServerClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

const RESET_PATH = "/auth/update-password" // adjust to your page

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

async function sc() {
  const cookieStore = await cookies()
  return createServerClient(cookieStore)
}

// SQL decides who may do this. The server only does what SQL can't: send email, call Supabase's admin API.
export async function sendPasswordReset(
  accountId: string
): Promise<{ error: string | null }> {
  const supabase = await sc()

  const { data: email, error } = await supabase.rpc(
    "admin_authorize_password_reset",
    {
      p_account_id: accountId,
    }
  )
  if (error || !email) return { error: error?.message ?? "Not allowed" }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? ""
  const { error: sendError } = await admin().auth.resetPasswordForEmail(
    email as string,
    {
      redirectTo: `${base}${RESET_PATH}`,
    }
  )
  if (sendError) return { error: sendError.message }

  await supabase.rpc("admin_log_account_action", {
    p_account_id: accountId,
    p_action: "password_reset_sent",
    p_reason: null,
  })
  return { error: null }
}

export async function removeAccountMfa(
  accountId: string,
  reason: string
): Promise<{ error: string | null }> {
  const supabase = await sc()

  const { error } = await supabase.rpc("admin_authorize_mfa_removal", {
    p_account_id: accountId,
    p_reason: reason,
  })
  if (error) return { error: error.message }

  const a = admin()
  const { data, error: listError } = await a.auth.admin.mfa.listFactors({
    userId: accountId,
  })
  if (listError) return { error: listError.message }

  for (const f of data?.factors ?? []) {
    const { error: delError } = await a.auth.admin.mfa.deleteFactor({
      id: f.id,
      userId: accountId,
    })
    if (delError) return { error: delError.message }
  }

  await supabase.rpc("admin_revoke_account_sessions", {
    p_account_id: accountId,
  })
  await supabase.rpc("admin_log_account_action", {
    p_account_id: accountId,
    p_action: "mfa_removed",
    p_reason: reason,
  })
  return { error: null }
}

// ---- anonymise: SQL does the data, this removes the files ----
function pathsFromUrls(urls: string[]) {
  return urls
    .map((u) => {
      const m =
        /\/object\/(?:sign|public|authenticated)\/documents\/([^?]+)/.exec(u)
      return m ? decodeURIComponent(m[1]) : null
    })
    .filter((p): p is string => !!p)
}

async function listAll(
  storage: ReturnType<ReturnType<typeof admin>["storage"]["from"]>,
  prefix: string,
  depth = 0
): Promise<string[]> {
  if (depth > 3) return []
  const { data } = await storage.list(prefix, { limit: 1000 })
  const out: string[] = []
  for (const item of data ?? []) {
    const path = `${prefix}/${item.name}`
    if (item.id === null)
      out.push(...(await listAll(storage, path, depth + 1))) // a folder
    else out.push(path)
  }
  return out
}

export async function anonymiseAccount(input: {
  accountId: string
  confirmEmail: string
  reason: string
}): Promise<{ error: string | null; warning?: string }> {
  const supabase = await sc()

  const { data, error } = await supabase.rpc("admin_anonymise_account", {
    p_account_id: input.accountId,
    p_confirm_email: input.confirmEmail,
    p_reason: input.reason,
  })
  if (error) return { error: error.message }

  try {
    const storage = admin().storage.from("documents")
    const known = pathsFromUrls((data?.document_urls ?? []) as string[])
    const folder = await listAll(storage, input.accountId) // everything uploaded under this account
    const paths = [...new Set([...known, ...folder])]
    if (paths.length) {
      const { error: rmError } = await storage.remove(paths)
      if (rmError) throw rmError
    }
  } catch {
    return {
      error: null,
      warning:
        "The account was anonymised, but some uploaded files could not be deleted. Remove them from storage by hand.",
    }
  }
  return { error: null }
}
