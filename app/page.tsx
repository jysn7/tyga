import { EnrollButton } from "@/components/portals/shared/enroll-button"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-7xl font-bold tracking-widest text-foreground">
          TYGA
        </h1>
        <p className="text-sm text-muted-foreground">
          Click below to test the Payfast redirect.
        </p>

        <EnrollButton
          memberId={1}
          programmeId={1}
          email="test@example.com"
          amount={500}
        />

        <p className="font-mono text-xs text-muted-foreground">
          (Press <kbd className="rounded border px-1">d</kbd> to toggle dark
          mode)
        </p>
      </div>
    </div>
  )
}
