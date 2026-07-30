import * as React from "react"

export interface PropertyItem {
  label: string
  content: React.ReactNode
}

export function PropertyGrid({ items }: { items: PropertyItem[] }) {
  return (
    <div className="bg-tertiary/40 rounded-md border border-border/60 p-3.5">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 md:grid-cols-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground/80">
              {item.label}
            </p>
            <div className="text-xs font-medium">{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
