export interface ProgrammeCoach {
  id: string
  name: string
  role: string
  bio: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export function CoachList({ coaches }: { coaches: ProgrammeCoach[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow">
      <h2 className="text-sm font-medium text-foreground">Coaches</h2>
      <div className="flex flex-col gap-2">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="flex items-start gap-3 rounded-lg border border-border/40 px-3 py-2.5 transition-colors hover:bg-accent/40"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink text-xs font-medium text-primary-foreground">
              {getInitials(coach.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {coach.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {coach.role} · {coach.bio}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
