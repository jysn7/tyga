import { Progress } from "@/components/ui/progress"

export interface FocusSplit {
  skills: number
  play: number
  fitness: number
}

export function FocusBreakdown({ focusSplit }: { focusSplit: FocusSplit }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Focus Breakdown</h2>
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Skills</span>
            <span className="font-medium text-foreground">
              {focusSplit.skills}%
            </span>
          </div>
          <Progress
            value={focusSplit.skills}
            className="h-1.5 bg-muted"
            indicatorClassName="bg-primary"
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Play</span>
            <span className="font-medium text-foreground">
              {focusSplit.play}%
            </span>
          </div>
          <Progress
            value={focusSplit.play}
            className="h-1.5 bg-muted"
            indicatorClassName="bg-primary"
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Fitness</span>
            <span className="font-medium text-foreground">
              {focusSplit.fitness}%
            </span>
          </div>
          <Progress
            value={focusSplit.fitness}
            className="h-1.5 bg-muted"
            indicatorClassName="bg-primary"
          />
        </div>
      </div>
    </div>
  )
}
