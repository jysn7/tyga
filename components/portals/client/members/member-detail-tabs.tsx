"use client"

import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MemberProgramme } from "@/hooks/client/members/use-member-programmes"
import type { MemberProgression } from "@/hooks/client/members/use-member-progression"
import {
  ShieldAlert,
  User,
  CalendarDays,
  GraduationCap,
  Settings2,
} from "lucide-react"

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
    <div className="flex flex-col gap-0.5 border-b border-border/40 py-2 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
        <span className="text-right text-sm text-foreground">{value}</span>
      </div>
      {hint && (
        <span className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

type MemberDetail = {
  dob: string
  activeEnrollmentCount: number | null
  nextSessionLabel: string | null
  schoolName: string | null
  schoolGrade: string | null
  previousClub: string | null
  kitSizeTop: string | null
  kitSizeBottom: string | null
  shoeSize: string | null
  idOrBirthCertNumber: string | null
  emergencyContactName: string | null
  emergencyContactRelationship: string | null
  emergencyContactPhone: string | null
  medicalNotes: string | null
  medicalAidDetails: string | null
  doctorContact: string | null
}

export function MemberDetailTabs({
  member,
  programmes,
  progression,
}: {
  member: MemberDetail
  programmes: MemberProgramme[]
  progression: MemberProgression | null
}) {
  return (
    <Tabs defaultValue="overview" className="flex flex-col gap-5">
      <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit">
        <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
          <User className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="programmes" className={TAB_TRIGGER_CLASS}>
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Programmes</span>
        </TabsTrigger>
        <TabsTrigger value="levels" className={TAB_TRIGGER_CLASS}>
          <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Levels</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className={TAB_TRIGGER_CLASS}>
          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Settings</span>
        </TabsTrigger>
      </TabsList>

      {/* ---------- Overview ---------- */}
      <TabsContent value="overview" className="mt-0">
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Member details
            </h2>
            <p className="text-xs text-muted-foreground">
              Basic information and enrollment summary
            </p>
          </div>
          <div className="flex flex-col rounded-lg border border-border/60 bg-card p-4">
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
              value={member.activeEnrollmentCount ?? "—"}
              hint={
                member.activeEnrollmentCount === 0
                  ? "Not enrolled in any programmes yet."
                  : undefined
              }
            />
            <Detail
              label="Next session"
              value={member.nextSessionLabel ?? "—"}
              hint={
                !member.nextSessionLabel
                  ? "No sessions scheduled for this member."
                  : undefined
              }
            />
            <Detail
              label="School"
              value={
                member.schoolName
                  ? `${member.schoolName}${
                      member.schoolGrade ? ` · Grade ${member.schoolGrade}` : ""
                    }`
                  : "Not provided"
              }
            />
            <Detail
              label="Previous team / club"
              value={member.previousClub ?? "None"}
            />
          </div>
        </section>
      </TabsContent>

      {/* ---------- Programmes & sessions ---------- */}
      <TabsContent value="programmes" className="mt-0">
        {programmes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-card p-10 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
              <CalendarDays
                className="h-4.5 w-4.5 text-muted-foreground"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">
                Not enrolled
              </span>
              <span className="text-xs text-muted-foreground">
                This member isn&apos;t enrolled in any programmes yet.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {programmes.map((p) => (
              <section key={p.enrollmentId} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Link
                      href={`/programmes/${p.programmeId}`}
                      className="truncate text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary hover:underline"
                    >
                      {p.programmeName}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.venueName} · Enrolled {formatDate(p.joinedAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${
                      p.status === "active"
                        ? "bg-green/80 text-primary-foreground"
                        : p.status === "cancelled"
                          ? "bg-rose text-primary-foreground"
                          : "bg-blue text-primary-foreground"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="flex flex-col rounded-lg border border-border/60 bg-card p-4">
                  <Detail
                    label="Next session"
                    value={
                      p.nextSession
                        ? `${formatDate(p.nextSession.date)} · ${p.nextSession.startTime?.slice(
                            0,
                            5
                          )}–${p.nextSession.endTime?.slice(0, 5)}`
                        : "—"
                    }
                    hint={
                      !p.nextSession
                        ? "No upcoming sessions for this programme."
                        : undefined
                    }
                  />

                  {p.recentSessions?.length > 0 ? (
                    <div className="flex flex-col gap-2 pt-3">
                      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                        Recent attendance
                      </span>
                      <div className="flex flex-col">
                        {p.recentSessions.map((s, i) => (
                          <Link
                            key={i}
                            href="/schedule"
                            className="flex items-center justify-between border-b border-border/40 py-2 transition-colors last:border-b-0 last:pb-0 hover:text-foreground"
                          >
                            <span className="text-sm text-foreground">
                              {formatDate(s.date)}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {s.status ?? "Not marked"}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 pt-3">
                      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                        Recent attendance
                      </span>
                      <span className="text-xs text-muted-foreground">
                        No sessions have been recorded for this programme yet.
                      </span>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ---------- Levels & curriculum ---------- */}
      <TabsContent value="levels" className="mt-0">
        {!progression?.currentLevelId ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-card p-10 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
              <GraduationCap
                className="h-4.5 w-4.5 text-muted-foreground"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">
                Not yet assessed
              </span>
              <span className="text-xs text-muted-foreground">
                No level has been assigned to this member.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Current level
                </h2>
                <p className="text-xs text-muted-foreground">
                  Where this member is right now
                </p>
              </div>
              <div className="flex flex-col rounded-lg border border-border/60 bg-card p-4">
                <div className="flex flex-col gap-1 border-b border-border/40 py-2 first:pt-0">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    {progression.currentLevelName}
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {progression.currentLevelGoal}
                  </span>
                </div>
                <Detail
                  label="Focus"
                  value={progression.currentLevelFocus ?? "—"}
                  hint={
                    !progression.currentLevelFocus
                      ? "No focus areas defined for this level."
                      : undefined
                  }
                />
                {progression.latestProgressionDate && (
                  <Detail
                    label="Last progression"
                    value={
                      progression.latestBadgeComplete
                        ? "Badge complete"
                        : "In progress"
                    }
                    hint={progression.latestProgressionNotes ?? undefined}
                  />
                )}
              </div>
            </section>

            {progression.modulesCovered?.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Curriculum covered
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Modules this member has worked through
                  </p>
                </div>
                <div className="flex flex-col rounded-lg border border-border/60 bg-card p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {progression.modulesCovered.map((m) => (
                      <span
                        key={m.id}
                        className="rounded-md bg-input px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {progression.nextLevelId && (
              <section className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Next level
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    What this member is working toward
                  </p>
                </div>
                <div className="flex flex-col rounded-lg border border-border/60 bg-card p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                      {progression.nextLevelName}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {progression.nextLevelGoal}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </TabsContent>

      {/* ---------- Settings ---------- */}
      <TabsContent value="settings" className="mt-0">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Kit sizing
              </h2>
              <p className="text-xs text-muted-foreground">
                Sizes for uniform and equipment orders
              </p>
            </div>
            <div className="flex flex-col rounded-lg border border-border/60 bg-card p-4">
              <Detail label="Top" value={member.kitSizeTop ?? "Not provided"} />
              <Detail
                label="Bottom"
                value={member.kitSizeBottom ?? "Not provided"}
              />
              <Detail
                label="Shoe size"
                value={member.shoeSize ?? "Not provided"}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <ShieldAlert
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
                strokeWidth={1.75}
              />
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Sensitive info
                </h2>
                <p className="text-xs text-muted-foreground">
                  Visible only to coaches teaching this member — access is
                  logged.
                </p>
              </div>
            </div>
            <div className="flex flex-col rounded-lg border border-border/60 bg-card p-4">
              <Detail
                label="ID / birth certificate number"
                value={member.idOrBirthCertNumber ?? "Not provided"}
              />
              <Detail
                label="Emergency contact"
                value={
                  member.emergencyContactName
                    ? `${member.emergencyContactName}${
                        member.emergencyContactRelationship
                          ? ` (${member.emergencyContactRelationship})`
                          : ""
                      }`
                    : "Not provided"
                }
              />
              <Detail
                label="Emergency contact phone"
                value={member.emergencyContactPhone ?? "Not provided"}
              />
              <Detail
                label="Medical notes"
                value={member.medicalNotes ?? "None provided"}
              />
              <Detail
                label="Medical aid details"
                value={member.medicalAidDetails ?? "Not provided"}
              />
              <Detail
                label="Doctor contact"
                value={member.doctorContact ?? "Not provided"}
              />
            </div>
          </section>
        </div>
      </TabsContent>
    </Tabs>
  )
}
