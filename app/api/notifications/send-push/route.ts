import { NextResponse } from "next/server"
import webpush from "web-push"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs" // web-push needs Node APIs

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret")
  if (secret !== process.env.NOTIFICATION_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: {
    account_id?: string
    title?: string
    body?: string
    url?: string
    tag?: string
  }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { account_id, title, body, url, tag } = payload
  if (!account_id || !title || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const { data: subs, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("account_id", account_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0, total: 0 })
  }

  const pushPayload = JSON.stringify({
    title,
    body,
    url: url ?? "/dashboard",
    tag,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  })

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        {
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        },
        pushPayload
      )
    )
  )

  // Clean up dead endpoints (410 Gone = device unsubscribed)
  const dead: string[] = []
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const reason = r.reason as { statusCode?: number }
      if (reason?.statusCode === 410 || reason?.statusCode === 404) {
        dead.push(subs[i].endpoint)
      }
    }
  })

  if (dead.length > 0) {
    await supabaseAdmin.from("push_subscriptions").delete().in("endpoint", dead)
  }

  const sent = results.filter((r) => r.status === "fulfilled").length

  return NextResponse.json({
    sent,
    failed: results.length - sent,
    cleaned: dead.length,
  })
}
