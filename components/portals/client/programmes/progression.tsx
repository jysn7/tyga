import { Badge } from "@/components/ui/badge"

interface BadgeItem {
  id: string
  icon: string
  name: string
}

export function Progression({
  criteria,
  badges,
}: {
  criteria: string
  badges?: BadgeItem[]
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">
        Progression Requirements
      </h2>
      <div className="rounded-md border border-border p-4">
        <p className="text-sm text-muted-foreground">{criteria}</p>
        {badges && badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge
                key={badge.id}
                className="bg-tertiary hover:bg-tertiary/80 gap-1.5 rounded-md border-transparent px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-none transition-colors"
              >
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
