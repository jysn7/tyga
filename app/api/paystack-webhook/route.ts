import { NextRequest, NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature") ?? ""

    // Verify HMAC signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Look up the pending payment
    const { data: payment } = await adminClient
      .from("payments")
      .select("id, invoice_id, status")
      .eq("gateway_reference", event.data.reference)
      .single()

    // Idempotency — already processed or unknown reference
    if (!payment || payment.status === "paid") {
      return NextResponse.json({ status: "ok" })
    }

    if (event.event === "charge.success") {
      // 1. Mark payment as paid
      await adminClient
        .from("payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          paystack_transaction_id: event.data.id,
          channel: event.data.channel,
        })
        .eq("id", payment.id)

      // 2. Mark invoice as paid
      await adminClient
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", payment.invoice_id)

      // 3. Activate the enrollment
      const { data: lineItem } = await adminClient
        .from("invoice_line_items")
        .select("reference_id")
        .eq("invoice_id", payment.invoice_id)
        .eq("item_type", "programme_fee")
        .single()

      if (lineItem?.reference_id) {
        await adminClient
          .from("enrollments")
          .update({ status: "active" })
          .eq("id", lineItem.reference_id)
      }
    } else if (event.event === "charge.failed") {
      await adminClient
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id)
    }

    return NextResponse.json({ status: "ok" })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
