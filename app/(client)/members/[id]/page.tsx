import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ChevronLeft, ShieldAlert } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/server"
import { EditMemberPanel } from "@/components/portals/client/members/edit-member-modal"

type MemberWithDetailsRow = {
  id: number
  full_name: string
  dob: string
  gender: "male" | "female" | "any"
  school_name: string | null
  school_grade: string | null
  id_or_birth_cert_number: string | null
  kit_size_top: string | null
  kit_size_bottom: string | null
  shoe_size: string | null
  previous_club: string | null
  medical_notes: string | null
  medical_aid_details: string | null
  doctor_contact: string | null
  emergency_contact_name: string | null
  emergency_contact_relationship: string | null
  emergency_contact_phone: string | null
  current_level_name: string | null
  next_session_label: string | null
  active_enrollment_count: number
  onboarding_complete: boolean
}

function getAge(dob: string) {
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

function Detail({
  label,
  value,
  hint,
}: {
  label: string
  value: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border/60 py-4 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-[15px] text-foreground">{value}</span>
      {hint && (
        <span className="pt-0.5 text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  )
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: member, error } = await supabase
    .rpc("get_my_members_with_details", { p_member_id: Number(id) })
    .single<MemberWithDetailsRow>()

  if (error || !member) {
    notFound()
  }

  // Audit log — this page surfaces dob, medical/medical_aid/doctor info,
  // and emergency contact details
  await Promise.all([
    supabase.rpc("log_sensitive_data_access", {
      p_member_id: member.id,
      p_field: "dob",
      p_reason: "Viewed member profile",
    }),
    supabase.rpc("log_sensitive_data_access", {
      p_member_id: member.id,
      p_field: "medical_notes",
      p_reason: "Viewed member profile",
    }),
    supabase.rpc("log_sensitive_data_access", {
      p_member_id: member.id,
      p_field: "medical_aid_details",
      p_reason: "Viewed member profile",
    }),
    supabase.rpc("log_sensitive_data_access", {
      p_member_id: member.id,
      p_field: "doctor_contact",
      p_reason: "Viewed member profile",
    }),
    supabase.rpc("log_sensitive_data_access", {
      p_member_id: member.id,
      p_field: "emergency_contact_name",
      p_reason: "Viewed member profile",
    }),
    supabase.rpc("log_sensitive_data_access", {
      p_member_id: member.id,
      p_field: "emergency_contact_phone",
      p_reason: "Viewed member profile",
    }),
    supabase.rpc("log_sensitive_data_access", {
      p_member_id: member.id,
      p_field: "id_or_birth_cert_number",
      p_reason: "Viewed member profile",
    }),
  ])

  const isAssessed = member.current_level_name !== null

  return (
    <div className="flex w-full flex-col gap-12">
      <Link
        href="/members"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to members
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 shrink-0 rounded-full">
          <AvatarFallback className="bg-pink text-xl font-medium text-background">
            {getInitials(member.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
            {member.full_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getAge(member.dob)} years old ·{" "}
            {isAssessed ? member.current_level_name : "Not yet assessed"} ·{" "}
            <span className="capitalize">{member.gender}</span>
          </p>
          {!member.onboarding_complete && (
            <p className="text-xs font-medium text-amber-600">
              Registration incomplete
            </p>
          )}
        </div>

        <div className="ml-auto">
          <EditMemberPanel
            member={{
              id: member.id,
              fullName: member.full_name,
              dob: member.dob,
              gender: member.gender === "any" ? "male" : member.gender,
              medicalNotes: member.medical_notes,
              medicalAidDetails: member.medical_aid_details ?? null,
              doctorContact: member.doctor_contact ?? null,
              emergencyContactName: member.emergency_contact_name,
              emergencyContactRelationship:
                member.emergency_contact_relationship,
              emergencyContactPhone: member.emergency_contact_phone,
              schoolName: member.school_name ?? null,
              schoolGrade: member.school_grade ?? null,
              idOrBirthCertNumber: member.id_or_birth_cert_number ?? null,
              previousClub: member.previous_club ?? null,
              kitSizeTop: member.kit_size_top ?? null,
              kitSizeBottom: member.kit_size_bottom ?? null,
              shoeSize: member.shoe_size ?? null,
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="rounded-xl bg-secondary p-4 shadow">
          <h2 className="pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Details
          </h2>
          <div className="flex flex-col">
            <Detail
              label="Date of birth"
              value={new Date(member.dob).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <Detail
              label="Active enrollments"
              value={member.active_enrollment_count}
            />
            <Detail
              label="Next session"
              value={member.next_session_label ?? "—"}
            />
            <Detail
              label="School"
              value={
                member.school_name
                  ? `${member.school_name}${member.school_grade ? ` · Grade ${member.school_grade}` : ""}`
                  : "Not provided"
              }
            />
            <Detail
              label="Previous team / club"
              value={member.previous_club ?? "None"}
            />
          </div>
        </div>

        <div className="rounded-xl bg-secondary p-4 shadow">
          <h2 className="pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Kit sizing
          </h2>
          <div className="flex flex-col">
            <Detail label="Top" value={member.kit_size_top ?? "Not provided"} />
            <Detail
              label="Bottom"
              value={member.kit_size_bottom ?? "Not provided"}
            />
            <Detail
              label="Shoe size"
              value={member.shoe_size ?? "Not provided"}
            />
          </div>
        </div>

        <div className="rounded-xl bg-secondary p-4 shadow">
          <div className="flex items-center gap-1.5 pb-1">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Sensitive info
            </h2>
            <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="pb-2 text-xs text-muted-foreground">
            Visible only to coaches teaching this member — access is logged.
          </p>
          <div className="flex flex-col">
            <Detail
              label="ID / birth certificate number"
              value={member.id_or_birth_cert_number ?? "Not provided"}
            />
            <Detail
              label="Emergency contact"
              value={
                member.emergency_contact_name
                  ? `${member.emergency_contact_name}${
                      member.emergency_contact_relationship
                        ? ` (${member.emergency_contact_relationship})`
                        : ""
                    }`
                  : "Not provided"
              }
            />
            <Detail
              label="Emergency contact phone"
              value={member.emergency_contact_phone ?? "Not provided"}
            />
            <Detail
              label="Medical notes"
              value={member.medical_notes ?? "None provided"}
            />
            <Detail
              label="Medical aid details"
              value={member.medical_aid_details ?? "Not provided"}
            />
            <Detail
              label="Doctor contact"
              value={member.doctor_contact ?? "Not provided"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
