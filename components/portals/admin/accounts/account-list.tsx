"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { AccountTableRow } from "./account-row"
import type { Account } from "@/hooks/admin/use-accounts"

const PAGE_SIZE = 10

export function AccountList({ accounts }: { accounts: Account[] }) {
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(accounts.length / PAGE_SIZE))
  const clampedPage = Math.min(page, pageCount - 1)

  const paginatedAccounts = useMemo(
    () =>
      accounts.slice(
        clampedPage * PAGE_SIZE,
        clampedPage * PAGE_SIZE + PAGE_SIZE
      ),
    [accounts, clampedPage]
  )

  if (accounts.length === 0) {
    return (
      <EmptyState
        title="No accounts found"
        description="No accounts match the current filter."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg bg-card shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-foreground/80 text-left text-[11px] font-medium tracking-wider text-card uppercase">
              <th className="px-4 py-2.5 font-medium">Account</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAccounts.map((account) => (
              <AccountTableRow key={account.id} account={account} />
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            Page {clampedPage + 1} of {pageCount} · {accounts.length} accounts
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={clampedPage === 0}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={clampedPage >= pageCount - 1}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
