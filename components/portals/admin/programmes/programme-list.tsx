"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Pencil,
  Archive,
  ArchiveRestore,
  GraduationCap,
  CalendarDays,
} from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { toast } from "@/components/ui/toast"
import { useToggleProgrammeArchive } from "@/hooks/admin/programmes/use-programme-mutations"
import type { AdminProgramme } from "@/hooks/admin/programmes/use-programmes"

const TYPE_LABELS: Record<AdminProgramme["type"], string> = {
  development: "Development",
  weekly_community: "Community",
  holiday_camp: "Holiday Camp",
  clinic: "Clinic",
  corporate: "Corporate",
  league: "League",
}

const TYPE_STYLES: Record<AdminProgramme["type"], string> = {
  development: "bg-yellow",
  weekly_community: "bg-green",
  holiday_camp: "bg-orange",
  clinic: "bg-purple",
  corporate: "bg-teal",
  league: "bg-pink",
}

export function ProgrammeList({
  programmes,
  onEdit,
  onManageSessions,
}: {
  programmes: AdminProgramme[]
  onEdit: (programme: AdminProgramme) => void
  onManageSessions: (programme: AdminProgramme) => void
}) {
  const toggleArchive = useToggleProgrammeArchive()
  const [togglingId, setTogglingId] = useState<number | null>(null)

  async function handleToggleArchive(programme: AdminProgramme) {
    setTogglingId(programme.id)
    try {
      await toggleArchive.mutateAsync({
        id: programme.id,
        archived: programme.archivedAt !== null,
      })
      toast.add({
        title: programme.archivedAt
          ? "Programme restored"
          : "Programme archived",
        type: "success",
        timeout: 4000,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to update programme",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setTogglingId(null)
    }
  }

  if (programmes.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No programmes found"
        description="Create your first programme to start enrolling members."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-card shadow">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b border-border/60 bg-foreground/80 text-left text-[11px] font-medium tracking-wider text-background uppercase">
            <th className="px-4 py-2.5 font-medium">Programme</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Level</th>
            <th className="px-4 py-2.5 font-medium">Venue</th>
            <th className="px-4 py-2.5 font-medium">Enrolled</th>
            <th className="px-4 py-2.5 font-medium">Price</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {programmes.map((programme) => {
            const isArchived = programme.archivedAt !== null
            const isFull = programme.enrolledCount >= programme.capacity
            const fillPercentage = Math.min(
              100,
              Math.round(
                (programme.enrolledCount / Math.max(1, programme.capacity)) *
                  100
              )
            )
            return (
              <tr
                key={programme.id}
                className={`border-b border-border/60 text-sm transition-colors last:border-b-0 hover:bg-accent/40 ${
                  isArchived ? "opacity-50" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Image thumbnail */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-blue-light">
                      {programme.imageUrl ? (
                        <Image
                          src={programme.imageUrl}
                          alt={programme.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <GraduationCap
                          className="h-4 w-4 text-blue"
                          strokeWidth={1.75}
                        />
                      )}
                    </div>

                    {/* Name + description + ages */}
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                        {programme.name}
                      </p>
                      {programme.description ? (
                        <p className="line-clamp-1 max-w-md text-xs text-muted-foreground">
                          {programme.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic">
                          No description
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        Ages {programme.minAge}–{programme.maxAge}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-secondary ${TYPE_STYLES[programme.type]}`}
                  >
                    {TYPE_LABELS[programme.type]}
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {programme.levelName ?? "—"}
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {programme.venueName ?? "—"}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      <span className="text-muted-foreground">
                        {programme.enrolledCount}/{programme.capacity}
                      </span>
                      <span
                        className={
                          isFull
                            ? "font-medium text-destructive"
                            : "text-muted-foreground"
                        }
                      >
                        {isFull
                          ? "Full"
                          : `${programme.capacity - programme.enrolledCount} left`}
                      </span>
                    </div>
                    <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isFull ? "bg-destructive" : "bg-foreground"
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                    {isArchived && (
                      <span className="mt-0.5 inline-block w-fit rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        Archived
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  R{programme.price}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onManageSessions(programme)}
                      title="Sessions"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <CalendarDays
                        className="h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(programme)}
                      title="Edit"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(programme)}
                      disabled={togglingId === programme.id}
                      title={isArchived ? "Restore" : "Archive"}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                    >
                      {isArchived ? (
                        <ArchiveRestore
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <Archive className="h-3.5 w-3.5" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
