import { Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface CurriculumModule {
  id: string
  name: string
  isMilestone?: boolean
}

export function CurriculumList({ modules }: { modules: CurriculumModule[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-foreground">Curriculum</h2>
      <div className="flex flex-wrap gap-1.5">
        {modules.map((module) => (
          <Badge
            key={module.id}
            className={`rounded-full border-0 px-2.5 py-1 text-[10px] font-medium ${
              module.isMilestone
                ? "border border-primary bg-primary text-primary-foreground"
                : "border border-border bg-input text-muted-foreground"
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
