import { EnrollmentStatus } from "@/hooks/admin/use-admin-enrollments"

interface EnrollmentTilesProps {
  summary:
    | {
        total?: number
        active?: number
        pending?: number
        paused?: number
        withdrawn?: number
        completed?: number
        cancelled?: number
      }
    | undefined
  currentStatus?: EnrollmentStatus | null
  onSelectStatus?: (status: EnrollmentStatus | null) => void
}

export function EnrollmentTiles({ summary }: EnrollmentTilesProps) {
  const tiles: {
    key: string
    label: string
    value: number | undefined
    accent: string
  }[] = [
    { key: "all", label: "All", value: summary?.total, accent: "text-blue" },
    {
      key: "active",
      label: "Active",
      value: summary?.active,
      accent: "text-green",
    },
    {
      key: "pending",
      label: "Pending",
      value: summary?.pending,
      accent: "text-yellow",
    },
    {
      key: "paused",
      label: "Paused",
      value: summary?.paused,
      accent: "text-purple",
    },
    {
      key: "completed",
      label: "Completed",
      value: summary?.completed,
      accent: "text-teal",
    },
    {
      key: "withdrawn",
      label: "Withdrawn",
      value: summary?.withdrawn,
      accent: "text-orange",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: summary?.cancelled,
      accent: "text-muted-foreground",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {tiles.map((t) => (
        <div
          key={t.key}
          className="rounded-2xl border border-border/60 bg-card p-4"
        >
          <p
            className={`text-xl leading-none font-semibold tabular-nums ${t.accent}`}
          >
            {t.value ?? "–"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{t.label}</p>
        </div>
      ))}
    </div>
  )
}
