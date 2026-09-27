"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader } from "@/components/portals/shared/loader"
import { useMemberDetail } from "@/hooks/admin/members/use-member-detail"
import { useSensitiveAccessGate } from "@/hooks/admin/members/use-sensitive-access-gate"

import {
  Detail,
  Section,
} from "@/components/portals/admin/members/member-detail-sections"
import { MemberDetailHeader } from "@/components/portals/admin/members/member-detail-header"
import { DocumentsTab } from "@/components/portals/admin/members/member-detail-documents"
import { ConsentsTab } from "@/components/portals/admin/members/member-detail-consents"
import { EnrollmentsTab } from "@/components/portals/admin/members/member-detail-enrollments"
import { ProgressTab } from "@/components/portals/admin/members/member-detail-progress"
import { AuditTab } from "@/components/portals/admin/members/member-detail-audit"
import {
  MemberErrorState,
  SensitiveGate,
} from "@/components/portals/admin/members/member-detail-gate"

export default function AdminMemberDetailPage() {
  const [today, setToday] = useState<number | null>(null)
  const params = useParams<{ id: string }>()
  const memberId = Number(params.id)

  useEffect(() => {
    const timer = window.setTimeout(() => setToday(Date.now()), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const gate = useSensitiveAccessGate(memberId)
  const { data, isLoading, error } = useMemberDetail(memberId, gate.unlocked)

  const memberName = data?.member.full_name ?? `Member #${memberId}`

  if (!gate.unlocked) {
    return (
      <SensitiveGate
        memberName={memberName}
        modalOpen={gate.modalOpen}
        setModalOpen={gate.setModalOpen}
        onConfirm={gate.confirm}
        isPending={gate.isPending}
        onRequest={gate.request}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error || !data) {
    return (
      <MemberErrorState
        message={
          error instanceof Error
            ? error.message
            : "This member doesn't exist or you don't have access."
        }
      />
    )
  }

  const {
    member,
    account,
    level,
    questionnaire,
    consents,
    documents,
    enrollments,
    progressions,
    attendance_summary,
    sensitive_access_history,
  } = data

  const age =
    today === null
      ? null
      : Math.floor(
          (today - new Date(member.dob).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
        )

  return (
    <div className="flex w-full flex-col gap-6">
      <MemberDetailHeader
        member={member}
        account={account}
        level={level}
        age={age}
      />

      <Tabs defaultValue="overview" className="flex flex-col gap-5">
        <TabsList className="no-scrollbar h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg bg-input p-1">
          {[
            ["overview", "Overview"],
            ["documents", `Documents (${documents.length})`],
            ["consents", `Consents (${consents.length})`],
            ["questionnaire", "Questionnaire"],
            ["enrollments", `Enrollments (${enrollments.length})`],
            ["progress", "Progress"],
            ["audit", `Access log (${sensitive_access_history.length})`],
          ].map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground sm:flex-initial"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-0 flex flex-col gap-6">
          <Section title="Basic details">
            <div className="flex flex-col">
              <Detail label="Full name" value={member.full_name} />
              <Detail
                label="Date of birth"
                value={`${format(new Date(member.dob), "d MMM yyyy")}${age === null ? "" : ` (${age} yrs)`}`}
              />
              <Detail
                label="Gender"
                value={<span className="capitalize">{member.gender}</span>}
              />
              <Detail
                label="ID / birth certificate"
                value={member.id_or_birth_cert_number ?? "Not provided"}
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
                label="Previous club"
                value={member.previous_club ?? "None"}
              />
            </div>
          </Section>

          <Section title="Guardian">
            {account ? (
              <div className="flex flex-col">
                <Detail label="Name" value={account.full_name} />
                <Detail label="Email" value={account.email} />
                <Detail label="Phone" value={account.phone ?? "—"} />
                <Detail label="Address" value={account.address ?? "—"} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No account linked.
              </p>
            )}
          </Section>

          <Section title="Attendance summary">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                {
                  label: "Total",
                  value: attendance_summary.total,
                  color: "text-foreground",
                },
                {
                  label: "Present",
                  value: attendance_summary.present,
                  color: "text-primary",
                },
                {
                  label: "Late",
                  value: attendance_summary.late,
                  color: "text-orange",
                },
                {
                  label: "Excused",
                  value: attendance_summary.excused,
                  color: "text-muted-foreground",
                },
                {
                  label: "Absent",
                  value: attendance_summary.absent,
                  color: "text-destructive",
                },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                    {s.label}
                  </span>
                  <span
                    className={`text-lg font-semibold tracking-tight ${s.color}`}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Health & safety">
            <div className="flex flex-col">
              <Detail
                label="Medical notes"
                value={member.medical_notes ?? "None provided"}
              />
              <Detail
                label="Medical aid"
                value={member.medical_aid_details ?? "Not provided"}
              />
              <Detail
                label="Doctor contact"
                value={member.doctor_contact ?? "Not provided"}
              />
              <Detail
                label="Emergency contact"
                value={member.emergency_contact_name ?? "Not provided"}
              />
              <Detail
                label="Relationship"
                value={member.emergency_contact_relationship ?? "—"}
              />
              <Detail
                label="Emergency phone"
                value={member.emergency_contact_phone ?? "—"}
              />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <DocumentsTab documents={documents} />
        </TabsContent>

        <TabsContent value="consents" className="mt-0">
          <ConsentsTab consents={consents} />
        </TabsContent>

        <TabsContent value="questionnaire" className="mt-0">
          {!questionnaire ? (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-secondary px-6 py-12 text-center">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  No questionnaire
                </span>
                <span className="text-xs text-muted-foreground">
                  This member hasn&apos;t submitted a questionnaire.
                </span>
              </div>
            </div>
          ) : (
            <Section
              title="Questionnaire"
              description={
                questionnaire.submitted_at
                  ? `Submitted ${format(new Date(questionnaire.submitted_at), "d MMM yyyy, HH:mm")}`
                  : "Not submitted"
              }
            >
              <div className="flex flex-col">
                <Detail
                  label="Self-reported skill level"
                  value={
                    questionnaire.self_reported_skill_level
                      ? questionnaire.self_reported_skill_level.replace(
                          /_/g,
                          " "
                        )
                      : "—"
                  }
                />
                <Detail
                  label="Availability"
                  value={
                    typeof questionnaire.availability === "object"
                      ? (questionnaire.availability?.availability ?? "—")
                      : (questionnaire.availability ?? "—")
                  }
                />
                <Detail
                  label="Interests"
                  value={
                    typeof questionnaire.interests === "object"
                      ? (questionnaire.interests?.interests ?? "—")
                      : (questionnaire.interests ?? "—")
                  }
                />
                <Detail
                  label="Gear owned"
                  value={
                    typeof questionnaire.gear_owned === "object"
                      ? (questionnaire.gear_owned?.gear_owned ?? "—")
                      : (questionnaire.gear_owned ?? "—")
                  }
                />
              </div>
            </Section>
          )}
        </TabsContent>

        <TabsContent value="enrollments" className="mt-0">
          <EnrollmentsTab enrollments={enrollments} />
        </TabsContent>

        <TabsContent value="progress" className="mt-0 flex flex-col gap-6">
          <ProgressTab level={level} progressions={progressions} />
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <AuditTab history={sensitive_access_history} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
