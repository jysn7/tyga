"use server"

import { headers, cookies } from "next/headers"
import { createHash } from "crypto"
import { Resend } from "resend"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/utils/supabase/server"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null
const FROM = process.env.FROM_EMAIL ?? "TYGA <team@tygachamps.co.za>"
const TEAM = process.env.SUPPORT_INBOX ?? "team@tygachamps.co.za"

async function send(
  to: string,
  subject: string,
  text: string,
  replyTo?: string
) {
  if (!resend) return
  try {
    await resend.emails.send({ from: FROM, to: [to], subject, text, replyTo })
  } catch (e) {
    console.error("Email failed:", subject, e instanceof Error ? e.message : e)
  }
}

export async function submitPublicTicket(input: {
  name: string
  email: string
  phone?: string
  category: string
  subject: string
  body: string
  website?: string
}): Promise<{ error: string | null; id?: number }> {
  if (input.website) return { error: null }

  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const ipHash = createHash("sha256")
    .update(`${ip}:${process.env.TICKET_IP_SALT ?? ""}`)
    .digest("hex")

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data, error } = await admin.rpc("public_create_ticket", {
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone ?? null,
    p_category: input.category,
    p_subject: input.subject,
    p_body: input.body,
    p_ip_hash: ipHash,
  })
  if (error) return { error: error.message }

  const id = (data as { id: number }).id

  await send(
    TEAM,
    `[Ticket #${id}] ${input.subject}`,
    `New website enquiry #${id}\nFrom: ${input.name} <${input.email}>${input.phone ? `\nPhone: ${input.phone}` : ""}\nTopic: ${input.category}\n\n${input.body}`,
    input.email
  )
  await send(
    input.email,
    `We received your message (#${id})`,
    `Hi ${input.name},\n\nThank you for contacting the Thipe Youth Golf Academy. We received your message "${input.subject}" and will reply within one working day.\n\nIf it is urgent, please phone us.\n\nReference: #${id}\n\nPlease do not include medical details or ID numbers in emails.`,
    TEAM
  )

  return { error: null, id }
}

export async function adminReplyToTicket(input: {
  id: number
  body: string
  internal: boolean
  resolve: boolean
}): Promise<{ error: string | null }> {
  const cookieStore = await cookies()
  const supabase = await createServerClient(cookieStore)
  const { data, error } = await supabase.rpc("admin_reply_conversation", {
    p_id: input.id,
    p_body: input.body,
    p_internal: input.internal,
    p_resolve: input.resolve,
  })
  if (error) return { error: error.message }

  const r = data as {
    notify_email: string | null
    requester_name: string | null
    subject: string
  } | null
  if (r?.notify_email) {
    await send(
      r.notify_email,
      `Re: ${r.subject} (#${input.id})`,
      `Hi ${r.requester_name ?? "there"},\n\n${input.body}\n\n${input.resolve ? "We have marked this as resolved. " : ""}You can reply to this email if you need anything else.\n\nThipe Youth Golf Academy`,
      TEAM
    )
  }
  return { error: null }
}
