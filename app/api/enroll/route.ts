import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email, amount, itemName } = await req.json()

    const mockInvoiceId = 9999

    const merchant_id = process.env.PAYFAST_MERCHANT_ID!
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY!
    const passphrase = process.env.PAYFAST_PASSPHRASE!
    const return_url = "http://localhost:3000/dashboard?toast=payment-success"
    const cancel_url = "http://localhost:3000/dashboard"

    const pfData: Record<string, string> = {
      merchant_id: merchant_id,
      merchant_key: merchant_key,
      return_url: return_url,
      cancel_url: cancel_url,
      email_address: email,
      m_payment_id: mockInvoiceId.toString(),
      amount: amount.toFixed(2),
      item_name: itemName || "TYGA Golf Programme Enrolment",
    }

    let pfOutput = ""
    for (const key in pfData) {
      if (Object.prototype.hasOwnProperty.call(pfData, key)) {
        if (pfData[key] !== "") {
          pfOutput += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`
        }
      }
    }
    pfOutput = pfOutput.slice(0, -1)
    if (passphrase !== "") {
      pfOutput += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
    }

    const signature = crypto.createHash("md5").update(pfOutput).digest("hex")
    pfData["signature"] = signature

    return NextResponse.json({
      payfastUrl: process.env.PAYFAST_URL,
      formData: pfData,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Server error"
    console.error("Payfast enrollment crash:", error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
