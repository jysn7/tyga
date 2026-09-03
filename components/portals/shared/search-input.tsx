"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  maxLength = 100,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  maxLength?: number
}) {
  return (
    <div
      className={`relative rounded-lg border border-border bg-input active:border-primary ${className}`}
    >
      <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        className="h-9 border-none bg-transparent pr-8 pl-8 text-sm shadow-none focus-visible:ring-0"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
