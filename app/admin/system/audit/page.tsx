"use client"

import { useState } from "react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { AuditFilters } from "@/components/portals/admin/audit/audit-filters"
import { AuditList } from "@/components/portals/admin/audit/audit-list"
import { AuditDetailPanel } from "@/components/portals/admin/audit/audit-detail-panel"
import type { AuditEntry } from "@/components/portals/admin/audit/audit-row"
import { useAuditLog } from "@/hooks/admin/use-audit-log"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

export default function AuditPage() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [tableFilter, setTableFilter] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput)
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)

  const { data: entries, isLoading } = useAuditLog({
    tableName: tableFilter === "all" ? undefined : tableFilter,
    limit: pageSize,
    offset: page * pageSize,
  })

  const filteredEntries = (entries ?? []).filter((entry) => {
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return (
      entry.actorName.toLowerCase().includes(q) ||
      entry.tableName.toLowerCase().includes(q) ||
      entry.recordId.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        description="Complete history of all changes made across the platform"
      />

      <AuditFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        tableFilter={tableFilter}
        onTableFilterChange={setTableFilter}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <AuditList
          entries={filteredEntries}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onSelect={setSelectedEntry}
        />
      )}

      <AuditDetailPanel
        entry={selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />
    </div>
  )
}
