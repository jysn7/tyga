import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Initializes Supabase using your .env.local keys
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-paystack-signature")

  // Verify the security signature to ensure it's actually from Paystack
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex")

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body)

  // If the payment was successful, update the database
  if (event.event === "charge.success") {
    const { invoice_id, enrollment_id } = event.data.metadata

    // Update Invoice to Paid
    await supabase
      .from("invoices")
      .update({ status: "paid" })
      .eq("id", invoice_id)

    // Update Enrollment to Active
    await supabase
      .from("enrollments")
      .update({ status: "active" })
      .eq("id", enrollment_id)

    // Create Payment Record for audit
    await supabase.from("payments").insert([
      {
        invoice_id: invoice_id,
        amount: event.data.amount / 100,
        gateway_reference: event.data.reference,
        status: "success",
      },
    ])
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
