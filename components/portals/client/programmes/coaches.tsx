export interface ProgrammeCoach {
  id: string
  name: string
  role: string
  bio: string
}

export function CoachList({ coaches }: { coaches: ProgrammeCoach[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Coaches</h2>
      <div className="space-y-3">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-accent"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-xs font-semibold text-foreground/70">
              {coach.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {coach.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {coach.role} · {coach.bio}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
