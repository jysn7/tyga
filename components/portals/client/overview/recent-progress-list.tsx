import { CheckCircle2 } from "lucide-react"
import type { ProgressItem } from "@/hooks/client/use-parent-overview"

export function RecentProgressList({ items }: { items: ProgressItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="px-1 text-sm font-medium text-foreground">
        Recent progress
      </h2>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-blue/10 py-10 text-center text-sm text-muted-foreground">
          No recent milestones
        </p>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl bg-blue/10 p-4">
          {items.map((p) => (
            <div key={p.id} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {p.childName}
                </p>
                <p className="text-xs text-muted-foreground">{p.milestone}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {p.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
