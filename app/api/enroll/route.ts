import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

type EnrollmentRpcRow = {
  enrollment_id: number
  invoice_id: number
  total_amount: number | string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const memberId = Number(body.memberId)
    const programmeId = Number(body.programmeId)

    // Extract the promo code (will be null/undefined if not provided)
    const promoCode =
      typeof body.promoCode === "string" ? body.promoCode.trim() : null

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0 ||
      !Number.isInteger(programmeId) ||
      programmeId <= 0
    ) {
      return NextResponse.json(
        { error: "memberId and programmeId are required" },
        { status: 400 }
      )
    }

    // Verify caller is authenticated
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!paystackSecretKey || !siteUrl || !supabaseUrl || !serviceRoleKey) {
      console.error("Missing payment configuration")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Create the enrollment + invoice via RPC (user-scoped, so RLS applies)
    const { data: enrollmentRows, error: rpcError } = await supabase.rpc(
      "parent_create_enrollment",
      {
        p_member_id: memberId,
        p_programme_id: programmeId,
        p_promo_code: promoCode, // <--- Pass the promo code to the DB engine
      }
    )

    if (rpcError) {
      console.error("Enrollment RPC error:", rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 400 })
    }

    const enrollment = (enrollmentRows as EnrollmentRpcRow[] | null)?.[0]
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment failed" }, { status: 500 })
    }

    const { enrollment_id, invoice_id, total_amount } = enrollment

    const { data: account } = await supabase
      .from("accounts")
      .select("email")
      .eq("id", user.id)
      .single()

    const { data: programme } = await supabase
      .from("programmes")
      .select("name")
      .eq("id", programmeId)
      .single()

    if (!account?.email) {
      return NextResponse.json(
        { error: "Account has no email" },
        { status: 400 }
      )
    }

    // If the total is 0 (fully paid by discounts), skip Paystack and mark as paid
    if (Number(total_amount) <= 0) {
      const adminClient = createAdminClient(supabaseUrl, serviceRoleKey)

      await adminClient.from("payments").insert({
        invoice_id,
        amount: 0,
        method: "Discount",
        gateway_reference: `FREE-${invoice_id}`,
        status: "paid",
      })

      // The DB already sets the invoice to 'paid' and enrollment to 'active'
      // if net is 0, so we just redirect them to the success page.
      return NextResponse.json({
        authorization_url: `${siteUrl}/payment/callback?reference=FREE-${invoice_id}`,
        reference: `FREE-${invoice_id}`,
        enrollment_id,
        invoice_id,
      })
    }

    const reference = `tyga_${invoice_id}_${Date.now()}`

    // Initialize Paystack transaction
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: account.email,
          amount: Math.round(Number(total_amount) * 100),
          currency: "ZAR",
          reference,
          callback_url: `${siteUrl}/payment/callback`,
          metadata: {
            enrollment_id,
            invoice_id,
            programme_id: programmeId,
            member_id: memberId,
            programme_name: programme?.name ?? "Programme",
          },
        }),
      }
    )

    const paystackData = await paystackRes.json()

    if (
      !paystackRes.ok ||
      !paystackData.status ||
      !paystackData.data?.authorization_url
    ) {
      return NextResponse.json(
        { error: paystackData.message ?? "Payment initialization failed" },
        { status: 400 }
      )
    }

    // Record the pending payment with the admin client (bypasses RLS)
    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey)

    const { error: paymentError } = await adminClient.from("payments").insert({
      invoice_id,
      amount: total_amount,
      method: "Paystack",
      gateway_reference: reference,
      status: "pending",
    })

    if (paymentError) {
      console.error("Payment insert error:", paymentError)
      return NextResponse.json({ error: paymentError.message }, { status: 500 })
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference,
      enrollment_id,
      invoice_id,
    })
  } catch (err) {
    console.error("Enrollment API error:", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
