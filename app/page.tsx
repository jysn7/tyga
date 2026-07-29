import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-7xl font-bold tracking-widest text-foreground">
          TYGA
        </h1>
        <p className="text-sm text-muted-foreground">
          Project ready. You may now add components and start building.
        </p>
        <Button>Button</Button>
        <p className="font-mono text-xs text-muted-foreground">
          (Press <kbd className="rounded border px-1">d</kbd> to toggle dark
          mode)
        </p>
      </div>
    </div>
  )
}
