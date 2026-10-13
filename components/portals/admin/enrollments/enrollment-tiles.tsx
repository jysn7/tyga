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
      }
    | undefined
  currentStatus: EnrollmentStatus | null
  onSelectStatus: (status: EnrollmentStatus | null) => void
}

export function EnrollmentTiles({
  summary,
  currentStatus,
  onSelectStatus,
}: EnrollmentTilesProps) {
  const tiles: {
    key: EnrollmentStatus | null
    label: string
    value: number | undefined
    tint: string
  }[] = [
    { key: null, label: "All", value: summary?.total, tint: "bg-blue-light" },
    {
      key: "active",
      label: "Active",
      value: summary?.active,
      tint: "bg-green-light",
    },
    {
      key: "pending",
      label: "Pending",
      value: summary?.pending,
      tint: "bg-yellow-light",
    },
    {
      key: "paused",
      label: "Paused",
      value: summary?.paused,
      tint: "bg-purple-light",
    },
    {
      key: "withdrawn",
      label: "Withdrawn",
      value: summary?.withdrawn,
      tint: "bg-red-light",
    },
    {
      key: "completed",
      label: "Completed",
      value: summary?.completed,
      tint: "bg-purple-light",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
      {tiles.map((t) => (
        <button
          key={t.label}
          type="button"
          onClick={() => onSelectStatus(t.key)}
          className={`rounded-2xl p-4 text-left transition-shadow ${t.tint} ${
            currentStatus === t.key
              ? "ring-2 ring-foreground/70"
              : "hover:shadow"
          }`}
        >
          <p className="text-xl leading-none font-semibold text-foreground">
            {t.value ?? "–"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{t.label}</p>
        </button>
      ))}
    </div>
  )
}
