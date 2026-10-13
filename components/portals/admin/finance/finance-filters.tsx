"use client"

import { SearchInput } from "@/components/portals/shared/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  DisplayStatus,
  PaymentStatus,
} from "@/hooks/admin/use-admin-finance"
import { INVOICE_META, PAYMENT_META, MEMBERSHIP_META } from "./finance-badges"

interface InvoiceFiltersProps {
  searchInput: string
  onSearchChange: (v: string) => void
  status: DisplayStatus | null
  onStatusChange: (v: DisplayStatus | null) => void
}

export function InvoiceFiltersBar({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
}: InvoiceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput
        value={searchInput}
        onChange={onSearchChange}
        placeholder="Search invoices..."
        className="flex-1 sm:max-w-sm"
      />
      <Select
        value={status ?? "all"}
        onValueChange={(v) =>
          onStatusChange(!v || v === "all" ? null : (v as DisplayStatus))
        }
      >
        <SelectTrigger className="h-9 w-full text-sm sm:w-44">
          <SelectValue placeholder="Status">
            {status ? INVOICE_META[status].label : "All invoices"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All invoices</SelectItem>
          {(Object.keys(INVOICE_META) as DisplayStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {INVOICE_META[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface PaymentFiltersProps {
  searchInput: string
  onSearchChange: (v: string) => void
  status: PaymentStatus | null
  onStatusChange: (v: PaymentStatus | null) => void
}

export function PaymentFiltersBar({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
}: PaymentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput
        value={searchInput}
        onChange={onSearchChange}
        placeholder="Search payments..."
        className="flex-1 sm:max-w-sm"
      />
      <Select
        value={status ?? "all"}
        onValueChange={(v) =>
          onStatusChange(!v || v === "all" ? null : (v as PaymentStatus))
        }
      >
        <SelectTrigger className="h-9 w-full text-sm sm:w-44">
          <SelectValue placeholder="Status">
            {status ? PAYMENT_META[status].label : "All payments"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All payments</SelectItem>
          {(Object.keys(PAYMENT_META) as PaymentStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {PAYMENT_META[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface MembershipFiltersProps {
  status: string | null
  onStatusChange: (v: string | null) => void
}

export function MembershipFiltersBar({
  status,
  onStatusChange,
}: MembershipFiltersProps) {
  return (
    <Select
      value={status ?? "all"}
      onValueChange={(v) => onStatusChange(!v || v === "all" ? null : v)}
    >
      <SelectTrigger className="h-9 w-full text-sm sm:w-48">
        <SelectValue placeholder="Status">
          {status ? MEMBERSHIP_META[status]?.label : "All memberships"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All memberships</SelectItem>
        {Object.entries(MEMBERSHIP_META).map(([k, v]) => (
          <SelectItem key={k} value={k}>
            {v.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
