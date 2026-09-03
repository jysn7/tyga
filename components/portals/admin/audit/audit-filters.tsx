"use client"

import { SearchInput } from "@/components/portals/shared/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TABLE_OPTIONS, PAGE_SIZE_OPTIONS } from "./audit-labels"

export function AuditFilters({
  search,
  onSearchChange,
  tableFilter,
  onTableFilterChange,
  pageSize,
  onPageSizeChange,
}: {
  search: string
  onSearchChange: (value: string) => void
  tableFilter: string
  onTableFilterChange: (value: string) => void
  pageSize: number
  onPageSizeChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search by actor, table, or record ID..."
        className="flex-1 sm:max-w-sm"
      />

      <Select
        value={tableFilter}
        onValueChange={(value) => {
          if (value !== null) onTableFilterChange(value)
        }}
      >
        <SelectTrigger className="h-9 w-full border border-border bg-card text-sm sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TABLE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(pageSize)}
        onValueChange={(v) => onPageSizeChange(Number(v))}
      >
        <SelectTrigger className="h-9 w-full border border-border bg-card text-sm sm:w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={size}>
              {size} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
