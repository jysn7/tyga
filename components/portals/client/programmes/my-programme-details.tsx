"use client"

import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import type { ProgrammeDetail } from "@/lib/data/programmes"

interface MyProgrammeDetailsProps {
  programme: ProgrammeDetail
}

const typeLabels: Record<ProgrammeDetail["type"], string> = {
  development: "Development",
  weekly_community: "Community",
  holiday_camp: "Holiday Camp",
  clinic: "Clinic",
  corporate: "Corporate",
  league: "League",
}

export function MyProgrammeDetails({ programme }: MyProgrammeDetailsProps) {
  const isFull = programme.enrolledCount >= programme.capacity
  const spotsLeft = programme.capacity - programme.enrolledCount
  const enrollmentPercentage =
    (programme.enrolledCount / programme.capacity) * 100

  const progressData = {
    attendance: 85,
    sessionsAttended: 8,
    totalSessions: 10,
    nextSession: "Tue, 15:30",
    curriculum: [
      { name: "Grip, Stance, Posture", status: "complete" },
      { name: "Full Swing with Irons", status: "complete" },
      { name: "Distance Control with Wedges", status: "in-progress" },
      { name: "Pre-shot Routine", status: "not-started" },
    ],
    levelProgress: 65,
    badges: ["Skills Badge", "Character Badge"],
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <Link
        href="/portal/client/programmes"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to programmes
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{typeLabels[programme.type]}</Badge>
              <Badge className="bg-emerald-600 hover:bg-emerald-700">
                Enrolled
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-500 text-amber-600"
              >
                {progressData.levelProgress}% Complete
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold">{programme.name}</h1>
            <p className="text-muted-foreground">
              {programme.levelName} · Ages {programme.minAge}–{programme.maxAge}
            </p>
          </div>

          {/* Programme Details */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Programme Details</h2>
            <div className="grid gap-2 rounded-xl border p-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{programme.venueName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{programme.recurrenceRule}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {programme.enrolledCount}/{programme.capacity} enrolled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {programme.termStart} – {programme.termEnd}
                </span>
              </div>
            </div>
          </div>

          {/* Your Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Your Progress</h2>
              <Link
                href="/portal/client/progress"
                className="text-sm text-emerald-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Attendance</span>
                <span className="text-sm font-medium">
                  {progressData.attendance}%
                </span>
              </div>
              <Progress value={progressData.attendance} className="h-2" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {progressData.sessionsAttended}/{progressData.totalSessions}{" "}
                  sessions attended
                </span>
                <span>Next: {progressData.nextSession}</span>
              </div>
            </div>
          </div>

          {/* Curriculum */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Curriculum</h2>
            <div className="space-y-2 rounded-xl border p-4">
              {progressData.curriculum.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={
                        item.status === "complete"
                          ? "text-muted-foreground line-through"
                          : ""
                      }
                    >
                      {item.name}
                    </span>
                    {item.status === "complete" && (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Complete
                      </Badge>
                    )}
                    {item.status === "in-progress" && (
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-600"
                      >
                        In Progress
                      </Badge>
                    )}
                    {item.status === "not-started" && (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        <Circle className="mr-1 h-3 w-3" />
                        Not Started
                      </Badge>
                    )}
                  </div>
                  {index < progressData.curriculum.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Enrolment Card */}
            <div className="space-y-4 rounded-xl border p-5">
              <div>
                <span className="text-2xl font-bold">R{programme.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">
                  / term
                </span>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span>
                    {programme.enrolledCount}/{programme.capacity}
                  </span>
                </div>
              </div>

              <Progress value={enrollmentPercentage} className="h-1.5" />

              <Button className="w-full" disabled>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Enrolled
              </Button>
            </div>

            {/* Badges */}
            {progressData.badges.length > 0 && (
              <div className="space-y-3 rounded-xl border p-5">
                <h3 className="text-sm font-semibold">Your Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {progressData.badges.map((badge) => (
                    <Badge
                      key={badge}
                      className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
                    >
                      🏅 {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2 rounded-xl border p-5">
              <h3 className="text-sm font-semibold">Quick Actions</h3>
              <div className="space-y-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm font-normal"
                >
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  View schedule
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm font-normal"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  View roster
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm font-normal"
                >
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  Contact coach
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
