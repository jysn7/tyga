export default function OfflinePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          You&apos;re offline
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Check your internet connection and try again. Cached pages are still
          available.
        </p>
      </div>
    </div>
  )
}
