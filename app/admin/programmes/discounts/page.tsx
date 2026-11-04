"use client"

import { useState } from "react"
import { Percent, Plus, Pencil } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { SearchInput } from "@/components/portals/shared/search-input"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Button } from "@/components/ui/button"
import { DiscountPanel } from "@/components/portals/admin/programmes/discount-sheet"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  useDiscounts,
  useSetDiscountActive,
  type Discount,
  type DiscountStatus,
  type ConditionType,
} from "@/hooks/admin/programmes/use-discounts"

const money = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n
  )

const STATUS: Record<DiscountStatus, { label: string; cls: string }> = {
  live: { label: "Live", cls: "bg-green-light" },
  paused: { label: "Paused", cls: "bg-muted" },
  scheduled: { label: "Scheduled", cls: "bg-blue-light" },
  expired: { label: "Expired", cls: "bg-muted" },
  used_up: { label: "Used up", cls: "bg-orange-light" },
}

const CONDITIONS: Record<ConditionType, string> = {
  always: "Everyone",
  sibling: "Sibling",
  multi_programme: "Multi-programme",
  early_bird: "Early bird",
  membership: "Membership",
}

function Pill({ label, cls }: { label: string; cls: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium text-foreground ${cls}`}
    >
      {label}
    </span>
  )
}

const valueText = (d: Pick<Discount, "amountType" | "amountValue">) =>
  d.amountType === "percent" ? `${d.amountValue}%` : money(d.amountValue)

export default function AdminDiscountsPage() {
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput)

  const { data = [], isLoading, error, refetch } = useDiscounts()
  const toggle = useSetDiscountActive()

  const [editing, setEditing] = useState<Discount | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const given = data.reduce((s, d) => s + d.totalDiscounted, 0)

  const filtered = data.filter(
    (d) =>
      !debouncedSearch ||
      d.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.publicLabel.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  function openNew() {
    setEditing(null)
    setPanelOpen(true)
  }

  function openEdit(d: Discount) {
    setEditing(d)
    setPanelOpen(true)
  }

  function handlePanelOpenChange(open: boolean) {
    setPanelOpen(open)
    if (!open) {
      refetch()
      setEditing(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Discounts"
        description="Sibling discounts, promo codes, and financial aid"
        action={
          <Button variant="secondary" size="lg" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" />
            New discount
          </Button>
        }
      />

      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search discounts..."
          className="flex-1 sm:max-w-sm"
        />

        <p className="shrink-0 text-sm text-muted-foreground">
          {data.filter((d) => d.status === "live").length} live · {money(given)}{" "}
          given
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Error loading discounts: {error.message}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Percent}
          title="No discounts found"
          description={
            debouncedSearch
              ? "Try a different search term."
              : "Create a sibling, early bird or bursary discount."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th className="px-4 py-2.5 font-medium">Discount</th>
                  <th className="px-4 py-2.5 font-medium">Rule</th>
                  <th className="px-4 py-2.5 font-medium">Value</th>
                  <th className="px-4 py-2.5 font-medium">Used</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr
                    key={d.id}
                    tabIndex={0}
                    onClick={() => openEdit(d)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        openEdit(d)
                      }
                    }}
                    className="cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                  >
                    <td className="px-4 py-3">
                      <p className="text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.publicLabel}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {d.triggerType === "code"
                        ? `Code ${d.code}`
                        : d.triggerType === "granted"
                          ? "Granted by admin"
                          : CONDITIONS[d.conditionType ?? "always"]}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {valueText(d)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.redemptions}
                      {d.maxRedemptions ? ` / ${d.maxRedemptions}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <Pill {...STATUS[d.status]} />
                    </td>

                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={toggle.isPending}
                          onClick={() =>
                            toggle.mutate({ id: d.id, active: !d.active })
                          }
                        >
                          {d.active ? "Pause" : "Resume"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => openEdit(d)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DiscountPanel
        discount={editing}
        id={panelOpen ? (editing?.id ?? 0) : null}
        onClose={() => handlePanelOpenChange(false)}
      />
    </div>
  )
}
