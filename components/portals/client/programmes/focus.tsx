import { Progress } from "@/components/ui/progress"

export interface FocusSplit {
  skills: number
  play: number
  fitness: number
}

const FOCUS_ROWS: { key: keyof FocusSplit; label: string }[] = [
  { key: "skills", label: "Skills" },
  { key: "play", label: "Play" },
  { key: "fitness", label: "Fitness" },
]

export function FocusBreakdown({ focusSplit }: { focusSplit: FocusSplit }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-foreground">Focus breakdown</h2>
      <div className="flex flex-col gap-3.5">
        {FOCUS_ROWS.map((row) => (
          <div key={row.key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-foreground">
                {focusSplit[row.key]}%
              </span>
            </div>
            <Progress
              value={focusSplit[row.key]}
              className="h-1.5 bg-input"
              indicatorClassName="bg-primary"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
