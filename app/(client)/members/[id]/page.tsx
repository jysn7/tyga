import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { MemberDetailClient } from "@/components/portals/client/members/MemberDetailClient"

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const memberId = Number(id)

  // Logging still happens server-side, on first page load, before any
  // client-side data fetching begins — access is recorded regardless
  // of whether the hooks below succeed, fail, or get cached client-side later.
  await Promise.all(
    [
      "dob",
      "medical_notes",
      "medical_aid_details",
      "doctor_contact",
      "emergency_contact_name",
      "emergency_contact_phone",
      "id_or_birth_cert_number",
    ].map((field) =>
      supabase.rpc("log_sensitive_data_access", {
        p_member_id: memberId,
        p_field: field,
        p_reason: "Viewed member profile",
      })
    )
  )

  return <MemberDetailClient memberId={id} />
}
