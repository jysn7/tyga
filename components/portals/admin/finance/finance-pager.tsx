// components/portals/admin/finance/finance-pager.tsx

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FINANCE_PAGE_SIZE } from "@/hooks/admin/use-admin-finance"

interface FinancePagerProps {
  page: number
  setPage: (fn: (p: number) => number) => void
  total: number
}

export function FinancePager({ page, setPage, total }: FinancePagerProps) {
  const from = total === 0 ? 0 : page * FINANCE_PAGE_SIZE + 1
  const to = Math.min((page + 1) * FINANCE_PAGE_SIZE, total)

  return (
    <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Next page"
          disabled={to >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  )
}
