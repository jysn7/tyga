"use client"

import { Database } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  ACTION_DOT,
  ACTION_LABELS,
  TABLE_LABELS,
  formatAuditTimestamp,
} from "./audit-labels"
import type { AuditEntry } from "./audit-row"

export function AuditDetailPanel({
  entry,
  onOpenChange,
}: {
  entry: AuditEntry | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={entry !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-none md:w-fit [&>button]:top-6 [&>button]:right-6 [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
        <DialogHeader className="flex flex-row items-center gap-3.5 space-y-0 p-0 pb-6 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
            <Database
              className="h-4.5 w-4.5 text-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground">
              {entry
                ? TABLE_LABELS[entry.tableName] || entry.tableName
                : "Audit Log Entry"}
            </DialogTitle>
            <span className="truncate text-xs text-muted-foreground">
              {entry ? formatAuditTimestamp(entry.createdAt) : ""}
            </span>
          </div>
        </DialogHeader>

        {entry && (
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col divide-y divide-border/60">
                <div className="flex items-center justify-between gap-8 py-2.5 text-sm">
                  <span className="shrink-0 text-muted-foreground">Actor</span>
                  <span className="text-foreground">{entry.actorName}</span>
                </div>
                <div className="flex items-center justify-between gap-8 py-2.5 text-sm">
                  <span className="shrink-0 text-muted-foreground">Role</span>
                  <span className="text-foreground">
                    {entry.actorRole || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-8 py-2.5 text-sm">
                  <span className="shrink-0 text-muted-foreground">Action</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${ACTION_DOT[entry.action]}`}
                    />
                    <span className="text-foreground">
                      {ACTION_LABELS[entry.action]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-8 py-2.5 text-sm">
                  <span className="shrink-0 text-muted-foreground">Record</span>
                  <span className="text-foreground">#{entry.recordId}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
                  Changed fields
                </span>
                {entry.changedFields && entry.changedFields.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.changedFields.map((field) => (
                      <span
                        key={field}
                        className="rounded-full border border-border bg-input px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No fields changed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {entry.oldData && Object.keys(entry.oldData).length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
                      Old data
                    </span>
                    <pre className="max-h-60 overflow-auto rounded-lg border border-border bg-input p-3 text-xs whitespace-pre text-foreground">
                      {JSON.stringify(entry.oldData, null, 2)}
                    </pre>
                  </div>
                )}

                {entry.newData && Object.keys(entry.newData).length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
                      New data
                    </span>
                    <pre className="max-h-60 overflow-auto rounded-lg border border-border bg-input p-3 text-xs whitespace-pre text-foreground">
                      {JSON.stringify(entry.newData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-8 flex flex-row items-center justify-end gap-3 p-0">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
