import { NextRequest, NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import crypto from "crypto"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const HARMLESS = [
  "already_paid",
  "already_processed",
  "unknown_reference",
  "other_plan",
]

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature") ?? ""

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex")

    const a = Buffer.from(hash, "hex")
    const b = Buffer.from(signature, "hex")
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    const type: string = event?.event ?? ""
    const data: any = event?.data ?? {}

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const run = async (fn: string, args: Record<string, unknown>) => {
      const { data: result, error } = await admin.rpc(fn, args)
      if (error) throw new Error(`${fn}: ${error.message}`)
      if (result?.applied === false && !HARMLESS.includes(result.reason)) {
        console.error("Paystack event NOT applied:", {
          type,
          reference: data.reference,
          ...result,
        })
      }
      return result
    }

    const accountId: string | null =
      typeof data.metadata?.account_id === "string" &&
      UUID.test(data.metadata.account_id)
        ? data.metadata.account_id
        : null

    // ---- enrollment (invoice) handler, inline, no extra RPC needed ----
    const applyEnrollmentCharge = async () => {
      if (!data.reference) return

      const { data: payment } = await admin
        .from("payments")
        .select("id, invoice_id, status")
        .eq("gateway_reference", data.reference)
        .single()

      if (!payment || payment.status === "paid") return // idempotent

      await admin
        .from("payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          paystack_transaction_id: data.id,
          channel: data.channel,
        })
        .eq("id", payment.id)

      await admin
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", payment.invoice_id)

      const { data: lineItem } = await admin
        .from("invoice_line_items")
        .select("reference_id")
        .eq("invoice_id", payment.invoice_id)
        .eq("item_type", "programme_fee")
        .maybeSingle()

      if (lineItem?.reference_id) {
        await admin
          .from("enrollments")
          .update({ status: "active" })
          .eq("id", lineItem.reference_id)
      }
    }

    const failEnrollmentCharge = async () => {
      if (!data.reference) return
      await admin
        .from("payments")
        .update({ status: "failed" })
        .eq("gateway_reference", data.reference)
    }

    // ---- dispatch ----
    switch (type) {
      case "charge.success": {
        const planCode: string | null = data.plan?.plan_code ?? null
        const isMembership = !!planCode || data.metadata?.kind === "membership"

        if (isMembership) {
          await run("apply_membership_charge", {
            p_account_id: accountId,
            p_customer_code: data.customer?.customer_code ?? null,
            p_email: data.customer?.email ?? null,
            p_subscription_code: data.subscription?.subscription_code ?? null,
            p_plan_code: planCode,
            p_reference: data.reference,
            p_transaction_id: data.id,
            p_amount_cents: data.amount,
            p_currency: data.currency ?? "ZAR",
            p_channel: data.channel ?? null,
            p_paid_at: data.paid_at ?? null,
            p_interval: data.plan?.interval ?? null,
            p_next_payment: null,
          })
        } else {
          await applyEnrollmentCharge()
        }
        break
      }

      case "charge.failed": {
        await failEnrollmentCharge()
        break
      }

      case "subscription.create":
      case "subscription.not_renew":
      case "subscription.disable": {
        await run("apply_membership_subscription_event", {
          p_event: type.split(".")[1],
          p_account_id: accountId,
          p_customer_code: data.customer?.customer_code ?? null,
          p_email: data.customer?.email ?? null,
          p_subscription_code: data.subscription_code ?? null,
          p_plan_code: data.plan?.plan_code ?? null,
          p_email_token: data.email_token ?? null,
          p_status: data.status ?? null,
          p_amount_cents: data.amount ?? null,
          p_interval: data.plan?.interval ?? null,
          p_next_payment: data.next_payment_date ?? null,
          p_reference: null,
        })
        break
      }

      case "invoice.payment_failed": {
        await run("apply_membership_subscription_event", {
          p_event: "payment_failed",
          p_account_id: accountId,
          p_customer_code: data.customer?.customer_code ?? null,
          p_email: data.customer?.email ?? null,
          p_subscription_code: data.subscription?.subscription_code ?? null,
          p_plan_code:
            data.plan?.plan_code ?? data.subscription?.plan?.plan_code ?? null,
          p_email_token: null,
          p_status: null,
          p_amount_cents: data.amount ?? null,
          p_interval: null,
          p_next_payment: null,
          p_reference: data.transaction?.reference ?? null,
        })
        break
      }

      default:
        break // invoice.create / invoice.update are ignored (renewal arrives as charge.success)
    }

    return NextResponse.json({ status: "ok" })
  } catch (err) {
    console.error("Webhook error:", err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
