import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference")
    if (!reference) {
      return NextResponse.json(
        { error: "reference is required" },
        { status: 400 }
      )
    }

    // Ensure caller is authenticated
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        cache: "no-store",
      }
    )

    const paystackData = await paystackRes.json()

    if (!paystackRes.ok || !paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message ?? "Verification failed" },
        { status: 400 }
      )
    }

    const tx = paystackData.data
    const success = tx.status === "success"

    // Look up the payment row (RLS-scoped to this user)
    const { data: payment } = await supabase
      .from("payments")
      .select("id, invoice_id, status")
      .eq("gateway_reference", reference)
      .single()

    return NextResponse.json({
      success,
      status: tx.status,
      reference,
      amount: tx.amount,
      currency: tx.currency,
      channel: tx.channel,
      paidAt: tx.paid_at,
      invoiceId: payment?.invoice_id ?? null,
      programmeId: tx.metadata?.programme_id ?? null,
      programmeName: tx.metadata?.programme_name ?? null,
      memberId: tx.metadata?.member_id ?? null,
    })
  } catch (err) {
    console.error("Verify error:", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
