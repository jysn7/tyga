import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { email, coachType, maxStudentRatio } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Verify the caller is an admin
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: account } = await supabase
      .from("accounts")
      .select("role")
      .eq("id", user.id)
      .single()

    if (account?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Record the invite
    const { data: inviteId, error: rpcError } = await supabase.rpc(
      "admin_record_coach_invite",
      {
        p_email: email,
        p_coach_type: coachType ?? null,
        p_max_student_ratio: maxStudentRatio ?? null,
      }
    )

    if (rpcError) {
      console.error("RPC error:", rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 400 })
    }

    // Env var checks
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!url || !serviceKey || !siteUrl) {
      console.error("Missing env vars:", {
        hasUrl: !!url,
        hasServiceKey: !!serviceKey,
        hasSiteUrl: !!siteUrl,
      })
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Send the invite email
    const adminClient = createAdminClient(url, serviceKey)

    const { error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/auth/update-password`,
      })

    if (inviteError) {
      console.error("Invite error:", inviteError)
      await supabase.rpc("admin_revoke_coach_invite", { p_invite_id: inviteId })
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    return NextResponse.json({ inviteId })
  } catch (err: unknown) {
    console.error("Unhandled error in invite-coach route:", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
