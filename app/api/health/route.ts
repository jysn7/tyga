import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  const started = Date.now()
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
    const { error } = await supabase.rpc("health_ping")
    if (error) throw error
    return NextResponse.json({ ok: true, ms: Date.now() - started })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
