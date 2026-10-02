export default function ClientLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar skeleton */}
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border/60 bg-card/40 p-4 md:flex">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>

        {/* Nav groups */}
        <div className="mt-4 flex flex-col gap-6">
          {[4, 3, 4].map((count, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-1.5">
              <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
              <div className="flex flex-col gap-1">
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-md px-2.5 py-2"
                  >
                    <div className="h-3.5 w-3.5 shrink-0 animate-pulse rounded bg-muted" />
                    <div
                      className="h-3 animate-pulse rounded bg-muted"
                      style={{ width: `${60 + ((i * 13) % 30)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main column */}
      <div className="relative flex flex-1 flex-col overflow-hidden shadow">
        {/* Header skeleton */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background px-4 sm:px-6">
          <div className="h-9 w-full max-w-md animate-pulse rounded-md bg-muted/60" />
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-9 w-9 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted/60" />
          </div>
        </header>

        {/* Main content skeleton — mirrors the dashboard */}
        <main className="relative z-10 flex-1 overflow-y-auto bg-background px-4 py-6 pt-8 md:px-6">
          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* Page header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-2">
                <div className="h-7 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
              </div>
              <div className="h-9 w-32 shrink-0 animate-pulse rounded-lg bg-muted" />
            </div>

            {/* Stats grid — 3 tiles, first full width */}
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <div className="h-24 animate-pulse rounded-xl bg-muted sm:col-span-2" />
              <div className="h-24 animate-pulse rounded-xl bg-muted" />
              <div className="h-24 animate-pulse rounded-xl bg-muted" />
            </div>

            {/* Two-column: main + sidebar */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main column */}
              <div className="flex flex-col gap-6 lg:col-span-2">
                {/* Card with image strip + rows (programme carousel-ish) */}
                <div className="h-56 animate-pulse rounded-xl bg-muted" />

                {/* Enrolled members grid */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="h-40 animate-pulse rounded-xl bg-muted" />
                  <div className="h-40 animate-pulse rounded-xl bg-muted" />
                </div>
              </div>

              {/* Sidebar column */}
              <div className="flex flex-col gap-6 lg:col-span-1">
                <div className="h-64 animate-pulse rounded-xl bg-muted" />
                <div className="h-40 animate-pulse rounded-xl bg-muted" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
