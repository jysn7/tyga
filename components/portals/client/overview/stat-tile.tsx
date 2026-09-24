import type { LucideIcon } from "lucide-react"

type StatColor =
  "blue" | "green" | "yellow" | "red" | "purple" | "teal" | "orange" | "pink"

const colorMap: Record<StatColor, { bg: string; chip: string; icon: string }> =
  {
    blue: {
      bg: "bg-blue-light",
      chip: "bg-blue/50",
      icon: "text-blue-light",
    },
    green: {
      bg: "bg-green-light",
      chip: "bg-green/50",
      icon: "text-green-light",
    },
    yellow: {
      bg: "bg-yellow-light",
      chip: "bg-yellow/50",
      icon: "text-yellow-light",
    },
    red: {
      bg: "bg-red-light",
      chip: "bg-red/50",
      icon: "text-red-light",
    },
    purple: {
      bg: "bg-purple-light",
      chip: "bg-purple/50",
      icon: "text-purple-light",
    },
    teal: {
      bg: "bg-teal-light",
      chip: "bg-teal/50",
      icon: "text-teal-light",
    },
    orange: {
      bg: "bg-orange-light",
      chip: "bg-orange/50",
      icon: "text-orange-light",
    },
    pink: {
      bg: "bg-pink-light",
      chip: "bg-pink/50",
      icon: "text-pink-light",
    },
  }

export function StatTile({
  label,
  value,
  icon: Icon,
  color = "blue",
}: {
  label: string
  value: string
  icon: LucideIcon
  color?: StatColor
}) {
  const c = colorMap[color]

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl p-4 text-foreground shadow ${c.bg}`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.chip}`}
      >
        <Icon className={`h-4 w-4 ${c.icon}`} strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}
