import { Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface CurriculumModule {
  id: string
  name: string
  isMilestone?: boolean
}

export function CurriculumList({ modules }: { modules: CurriculumModule[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Curriculum</h2>
      <div className="flex flex-wrap gap-2">
        {modules.map((module) => (
          <Badge
            key={module.id}
            variant={module.isMilestone ? "default" : "outline"}
            className={`text-[10px] font-medium ${
              module.isMilestone
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {module.isMilestone && <Award className="mr-1 h-3 w-3" />}
            {module.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}
