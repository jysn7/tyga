"use client"

import { Clock } from "lucide-react"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  ACTION_DOT,
  ACTION_LABELS,
  TABLE_LABELS,
  formatAuditTimestamp,
} from "./audit-labels"

export type AuditEntry = {
  id: number
  createdAt: string
  actorName: string
  actorRole: string | null
  action: "insert" | "update" | "delete"
  tableName: string
  recordId: string
  changedFields: string[] | null
  oldData: Record<string, unknown> | null
  newData: Record<string, unknown> | null
}

export function AuditRow({
  entry,
  onSelect,
}: {
  entry: AuditEntry
  onSelect: (entry: AuditEntry) => void
}) {
  return (
    <TableRow
      onClick={() => onSelect(entry)}
      className="cursor-pointer hover:bg-accent/40"
    >
      <TableCell className="whitespace-nowrap text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {formatAuditTimestamp(entry.createdAt)}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-foreground">
        {entry.actorName}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${ACTION_DOT[entry.action]}`}
          />
          <span className="text-muted-foreground">
            {ACTION_LABELS[entry.action]}
          </span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {TABLE_LABELS[entry.tableName] || entry.tableName}
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        #{entry.recordId}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {entry.changedFields && entry.changedFields.length > 0
          ? entry.changedFields.join(", ")
          : "—"}
      </TableCell>
    </TableRow>
  )
}
