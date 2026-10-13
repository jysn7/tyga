import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

export function SidePanel({
  open,
  onOpenChange,
  title,
  description,
  header,
  children,
  footer,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  header?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 bg-secondary p-0 shadow-2xl data-[side=right]:w-full data-[side=right]:border-l-0 data-[side=right]:sm:max-w-3xl"
      >
        <div className="flex h-full w-full flex-col overflow-hidden">
          {header ? (
            <SheetHeader className="gap-0 p-0 text-left">
              <SheetTitle className="sr-only">{title}</SheetTitle>
              {description && (
                <SheetDescription className="sr-only">
                  {description}
                </SheetDescription>
              )}
              {header}
            </SheetHeader>
          ) : (
            <SheetHeader className="space-y-1 px-8 pt-8 pb-2 text-left">
              <SheetTitle className="text-xl font-semibold tracking-tight">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-sm text-muted-foreground">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>
          )}

          <div className="flex-1 overflow-y-auto px-2 py-6 md:px-8">
            {children}
          </div>

          {footer && <div className="px-8 pt-2 pb-8">{footer}</div>}
        </div>
      </SheetContent>
    </Sheet>
  )
}
