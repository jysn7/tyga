import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ error: rpcError.message }, { status: 400 })
  }

  // Send the invite email
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
    }
  )

  if (inviteError) {
    // Cleanup: revoke the invite record if the email failed
    await supabase.rpc("admin_revoke_coach_invite", { p_invite_id: inviteId })
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  return NextResponse.json({ inviteId })
}
