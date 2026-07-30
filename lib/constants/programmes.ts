import type { Programme } from "@/components/portals/client/programmes/programme-card"

export const TYPE_COLORS: Record<Programme["type"], string> = {
  development: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  weekly_community: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  holiday_camp: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  clinic: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  corporate: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  league: "bg-rose-500/10 text-rose-600 border-rose-500/20",
}

export const TYPE_LABELS: Record<Programme["type"], string> = {
  development: "Development",
  weekly_community: "Community",
  holiday_camp: "Holiday Camp",
  clinic: "Clinic",
  corporate: "Corporate",
  league: "League",
}
