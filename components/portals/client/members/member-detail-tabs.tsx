"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  CalendarDays,
  GraduationCap,
  Settings2,
  ShieldCheck,
  Activity,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  LogOut,
} from "lucide-react"
import type { MemberDetail } from "@/hooks/client/members/use-members"
import { WithdrawEnrollmentDialog } from "@/components/portals/client/programmes/withdraw-enrollment-dialog"

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
    <div className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
        <span className="min-w-0 text-right text-sm break-words text-foreground">
          {value}
        </span>
      </div>
      {hint && (
        <span className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {title}
        </h2>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="min-w-0 rounded-lg bg-card p-4 shadow">{children}</div>
    </div>
  )
}

function EmptyCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-secondary px-6 py-12 text-center">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  )
}

// shrink-0 so triggers keep their size inside the horizontal scroller
const TAB_TRIGGER_CLASS =
  "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:gap-2 sm:px-3"

export function MemberDetailTabs({ data }: { data: MemberDetail }) {
  const {
    member,
    level,
    consents,
    enrollments,
    progressions,
    attendance_summary,
    recent_attendance,
  } = data

  const isAssessed = member.current_level_id !== null

  const signedCount = consents.filter((c) => c.signed).length
  const totalCount = consents.length

  return (
    <Tabs
      defaultValue="overview"
      className="flex w-full min-w-0 flex-col gap-5"
    >
      <TabsList className="no-scrollbar h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg bg-input p-1">
        <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
          <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="attendance" className={TAB_TRIGGER_CLASS}>
          <Activity className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="inline">Attendance</span>
        </TabsTrigger>
        <TabsTrigger value="programmes" className={TAB_TRIGGER_CLASS}>
          <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="inline">Programmes</span>
        </TabsTrigger>
        <TabsTrigger value="levels" className={TAB_TRIGGER_CLASS}>
          <GraduationCap className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="inline">Levels</span>
        </TabsTrigger>
        <TabsTrigger value="consents" className={TAB_TRIGGER_CLASS}>
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="inline">Consents</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className={TAB_TRIGGER_CLASS}>
          <Settings2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="inline">Settings</span>
        </TabsTrigger>
      </TabsList>

      {/* ---------- Overview ---------- */}
      <TabsContent value="overview" className="mt-0 flex flex-col gap-6">
        <Section title="Member details" description="Basic information">
          <div className="flex flex-col">
            <Detail
              label="Date of birth"
              value={format(new Date(member.dob), "d MMMM yyyy")}
            />
            <Detail
              label="Gender"
              value={<span className="capitalize">{member.gender}</span>}
            />
            <Detail
              label="School"
              value={
                member.school_name
                  ? `${member.school_name}${
                      member.school_grade
                        ? ` · Grade ${member.school_grade}`
                        : ""
                    }`
                  : "Not provided"
              }
            />
            <Detail
              label="Previous team / club"
              value={member.previous_club ?? "None"}
            />
          </div>
        </Section>

        <Section title="Attendance summary" description="Across all programmes">
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
      </TabsContent>

      {/* ---------- Attendance ---------- */}
      <TabsContent value="attendance" className="mt-0">
        {recent_attendance.length === 0 ? (
          <EmptyCard
            title="No attendance yet"
            description="Attendance will appear here after sessions are marked."
          />
        ) : (
          <Section
            title="Recent attendance"
            description="Last 20 marked sessions"
          >
            <div className="flex flex-col">
              {recent_attendance.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {format(new Date(a.session_date), "EEE, d MMM")}
                      <span className="pl-2 text-xs text-muted-foreground">
                        {a.start_time?.slice(0, 5) ?? ""}
                        {a.end_time ? ` – ${a.end_time.slice(0, 5)}` : ""}
                      </span>
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {a.programme_name}
                      {a.venue_name ? ` · ${a.venue_name}` : ""}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium text-primary-foreground capitalize ${
                      a.status === "present"
                        ? "bg-green-light"
                        : a.status === "absent"
                          ? "bg-rose/80"
                          : a.status === "late"
                            ? "bg-orange-light"
                            : "bg-input text-muted-foreground"
                    }`}
                  >
                    {a.status ?? "Not marked"}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </TabsContent>

      {/* ---------- Programmes ---------- */}
      <TabsContent value="programmes" className="mt-0">
        {enrollments.length === 0 ? (
          <EmptyCard
            title="Not enrolled"
            description="This member isn't enrolled in any programmes yet."
          />
        ) : (
          <Section title="Enrolled programmes">
            <div className="flex flex-col">
              {enrollments.map((e) => {
                const isWithdrawn =
                  e.status === "cancelled" || e.status === "withdrawn"
                const canWithdraw = !isWithdrawn

                return (
                  <div
                    key={e.id}
                    className="flex min-w-0 flex-col gap-2 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <Link
                          href={`/programmes/${e.programme_id}`}
                          className="truncate text-sm font-medium text-foreground transition-colors hover:text-information hover:underline"
                        >
                          {e.programme_name}
                        </Link>
                        <span className="line-clamp-2 text-xs break-words text-muted-foreground">
                          {e.venue_name ?? "No venue"}
                          {e.joined_at &&
                            ` · Enrolled ${format(new Date(e.joined_at), "d MMM yyyy")}`}
                          {e.subsidised && ` · Subsidised`}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium text-primary-foreground capitalize ${
                          e.status === "active"
                            ? "bg-green-light"
                            : e.status === "cancelled" ||
                                e.status === "withdrawn"
                              ? "bg-rose/80"
                              : "bg-input text-muted-foreground"
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>

                    {canWithdraw && (
                      <WithdrawEnrollmentDialog
                        enrollmentId={e.id}
                        memberName={member.full_name}
                        programmeName={e.programme_name}
                        status={e.status}
                        trigger={
                          <button
                            type="button"
                            className="flex w-fit items-center gap-1.5 text-xs text-rose transition-colors hover:underline"
                          >
                            <LogOut className="h-3 w-3" strokeWidth={1.75} />
                            {e.status === "pending"
                              ? "Cancel enrolment"
                              : "Withdraw"}
                          </button>
                        }
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </Section>
        )}
      </TabsContent>

      {/* ---------- Levels ---------- */}
      <TabsContent value="levels" className="mt-0">
        {!isAssessed ? (
          <EmptyCard
            title="Not yet assessed"
            description="No level has been assigned to this member."
          />
        ) : (
          <div className="flex flex-col gap-6">
            <Section
              title="Current level"
              description="Where this member is right now"
            >
              <div className="flex flex-col">
                <div className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    {level?.name}
                  </span>
                  {level?.goal && (
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {level.goal}
                    </span>
                  )}
                </div>
                {level?.focus_summary && (
                  <Detail label="Focus" value={level.focus_summary} />
                )}
              </div>
            </Section>

            {progressions.length > 0 && (
              <Section
                title="Progression history"
                description="Every level change"
              >
                <div className="flex flex-col">
                  {progressions.map((p) => (
                    <div
                      key={p.id}
                      className="flex min-w-0 items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {p.from_level_name ?? "Unassessed"}
                          <span className="px-1.5 text-muted-foreground">
                            →
                          </span>
                          {p.to_level_name ?? "—"}
                        </span>
                        {p.notes && (
                          <span className="text-xs leading-relaxed text-muted-foreground">
                            {p.notes}
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                        {p.badge_complete && (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            Badge
                          </span>
                        )}
                        <span className="text-xs whitespace-nowrap text-muted-foreground">
                          {format(new Date(p.date), "d MMM yyyy")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </TabsContent>

      {/* ---------- Consents ---------- */}
      <TabsContent value="consents" className="mt-0 flex flex-col gap-6">
        {consents.length === 0 ? (
          <EmptyCard
            title="No consents recorded"
            description="No consents have been signed for this member."
          />
        ) : (
          <>
            <Section title="Consent status" description="Compliance overview">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green">
                  <ShieldCheck
                    className="h-5 w-5 text-secondary"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-2xl font-semibold tracking-tight text-foreground">
                    {signedCount}
                    <span className="text-base font-normal text-muted-foreground">
                      {" "}
                      of {totalCount}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {signedCount === totalCount
                      ? "All consents signed"
                      : `${totalCount - signedCount} pending`}
                  </span>
                </div>
              </div>
            </Section>

            <Section
              title="Consent records"
              description="POPIA consent history"
            >
              <div className="flex flex-col divide-y divide-border/60">
                {consents.map((c) => (
                  <div
                    key={c.id}
                    className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          c.signed ? "bg-green" : "bg-muted"
                        }`}
                      >
                        {c.signed ? (
                          <CheckCircle2
                            className="h-4 w-4 text-secondary"
                            strokeWidth={1.75}
                          />
                        ) : (
                          <XCircle
                            className="h-4 w-4 text-muted-foreground"
                            strokeWidth={1.75}
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium text-foreground capitalize">
                          {c.consent_type.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.signed
                            ? c.signed_at
                              ? `Signed ${format(new Date(c.signed_at), "d MMM yyyy")}`
                              : "Signed"
                            : "Not yet signed"}
                        </span>
                      </div>
                    </div>
                    {c.document_url && (
                      <a
                        href={c.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-input px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
      </TabsContent>

      {/* ---------- Settings ---------- */}
      <TabsContent value="settings" className="mt-0">
        <div className="flex flex-col gap-6">
          <Section
            title="Kit sizing"
            description="Sizes for uniform and equipment orders"
          >
            <div className="flex flex-col">
              <Detail
                label="Top"
                value={member.kit_size_top ?? "Not provided"}
              />
              <Detail
                label="Bottom"
                value={member.kit_size_bottom ?? "Not provided"}
              />
              <Detail
                label="Shoe size"
                value={member.shoe_size ?? "Not provided"}
              />
            </div>
          </Section>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <ShieldAlert
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
                strokeWidth={1.75}
              />
              <div className="flex flex-col gap-0.5">
                <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Sensitive info
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Visible only to coaches teaching this member — access is
                  logged.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-card p-4 shadow">
              <div className="flex flex-col">
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
      </TabsContent>
    </Tabs>
  )
}
