"use client"

import { SearchInput } from "@/components/portals/shared/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  EnrollmentStatus,
  PaymentFilter,
} from "@/hooks/admin/use-admin-enrollments"
import { STATUS_META } from "./enrollment-badges"

interface EnrollmentFiltersProps {
  searchInput: string
  onSearchChange: (v: string) => void
  status: EnrollmentStatus | null
  onStatusChange: (v: EnrollmentStatus | null) => void
  payment: PaymentFilter | null
  onPaymentChange: (v: PaymentFilter | null) => void
  programmeId: number | null
  onProgrammeChange: (v: number | null) => void
  programmes: { programme_id: number; programme_name: string }[]
}

export function EnrollmentFiltersBar({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  payment,
  onPaymentChange,
  programmeId,
  onProgrammeChange,
  programmes,
}: EnrollmentFiltersProps) {
  const selectClass = "h-9 w-full text-sm sm:w-44"

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput
        value={searchInput}
        onChange={onSearchChange}
        placeholder="Search member or parent..."
        className="flex-1 sm:max-w-sm"
      />

      <Select
        value={status ?? "all"}
        onValueChange={(v) =>
          onStatusChange(!v || v === "all" ? null : (v as EnrollmentStatus))
        }
      >
        <SelectTrigger className={selectClass}>
          <SelectValue placeholder="Status">
            {status ? STATUS_META[status].label : "All statuses"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {(Object.keys(STATUS_META) as EnrollmentStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_META[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={payment ?? "all"}
        onValueChange={(v) =>
          onPaymentChange(!v || v === "all" ? null : (v as PaymentFilter))
        }
      >
        <SelectTrigger className={selectClass}>
          <SelectValue placeholder="Payment">
            {payment === "paid"
              ? "Paid"
              : payment === "unpaid"
                ? "Unpaid"
                : payment === "overdue"
                  ? "Overdue"
                  : "Any payment"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any payment</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={programmeId?.toString() ?? "all"}
        onValueChange={(v) =>
          onProgrammeChange(!v || v === "all" ? null : Number(v))
        }
      >
        <SelectTrigger className="h-9 w-full text-sm sm:w-56">
          <SelectValue placeholder="Programme">
            {programmeId
              ? programmes.find((p) => p.programme_id === programmeId)
                  ?.programme_name
              : "All programmes"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All programmes</SelectItem>
          {programmes.map((p) => (
            <SelectItem key={p.programme_id} value={p.programme_id.toString()}>
              {p.programme_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
