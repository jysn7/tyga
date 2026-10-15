"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  CalendarDays,
  Clock,
  MapPin,
  Layers,
  Plus,
  Trash2,
  Play,
  Ban,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { toast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  useCoachRules,
  useArchiveAvailabilityRule,
  useApplyAvailabilityRule,
  useCoachBlocks,
  useAddBlock,
  useRemoveBlock,
  type AvailabilityRule,
  type CoachBlock,
} from "@/hooks/coach/use-coach-availability"
import { AddRuleDialog } from "@/components/portals/Coach/appointments/add-rule-dialog"

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function RecurringTab() {
  const {
    data: rules,
    isLoading: rulesLoading,
    error: rulesError,
  } = useCoachRules()
  const { data: blocks, isLoading: blocksLoading } = useCoachBlocks()

  const [addRuleOpen, setAddRuleOpen] = useState(false)
  const [addBlockOpen, setAddBlockOpen] = useState(false)
  const [archivingRule, setArchivingRule] = useState<AvailabilityRule | null>(
    null
  )
  const [removingBlock, setRemovingBlock] = useState<CoachBlock | null>(null)

  const archiveRule = useArchiveAvailabilityRule()
  const applyRule = useApplyAvailabilityRule()
  const removeBlock = useRemoveBlock()

  function handleApply(rule: AvailabilityRule) {
    applyRule.mutate(
      { ruleId: rule.id, weeksAhead: 6 },
      {
        onSuccess: (count) => {
          toast.add({
            title:
              count === 0
                ? "No new slots to generate"
                : `Generated ${count} slot${count === 1 ? "" : "s"}`,
            description:
              count === 0
                ? "Slots for this rule already exist in the next 6 weeks."
                : "Parents can now see and book these times.",
            type: "success",
            timeout: 4000,
          })
        },
        onError: (err) =>
          toast.add({
            title: "Failed to apply rule",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  function handleArchiveRule() {
    if (!archivingRule) return
    archiveRule.mutate(archivingRule.id, {
      onSuccess: () => {
        toast.add({ title: "Rule removed", type: "success", timeout: 3000 })
        setArchivingRule(null)
      },
      onError: (err) =>
        toast.add({
          title: "Failed to remove rule",
          description:
            err instanceof Error ? err.message : "Something went wrong",
          type: "error",
          timeout: 5000,
        }),
    })
  }

  function handleRemoveBlock() {
    if (!removingBlock) return
    removeBlock.mutate(removingBlock.id, {
      onSuccess: () => {
        toast.add({ title: "Block removed", type: "success", timeout: 3000 })
        setRemovingBlock(null)
      },
      onError: (err) =>
        toast.add({
          title: "Failed to remove block",
          description:
            err instanceof Error ? err.message : "Something went wrong",
          type: "error",
          timeout: 5000,
        }),
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ---------- Recurring rules ---------- */}

      <section className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Weekly schedule
            </h2>
            <p className="text-xs text-muted-foreground">
              Set your regular hours once. Apply them to open bookable slots.
            </p>
          </div>
          <Button
            onClick={() => setAddRuleOpen(true)}
            variant="secondary"
            size="lg"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Add rule
          </Button>
        </div>

        {rulesLoading ? (
          <div className="flex h-32 items-center justify-center rounded-xl bg-card shadow">
            <Loader />
          </div>
        ) : rulesError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {rulesError.message}
          </div>
        ) : !rules || rules.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
              <CalendarDays
                className="h-4.5 w-4.5 text-muted-foreground"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                No recurring schedule yet
              </span>
              <span className="text-xs text-muted-foreground">
                Add a rule to open your regular hours for booking.
              </span>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-card shadow">
            <div className="flex flex-col divide-y divide-border/60">
              {rules.map((rule) => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  onApply={() => handleApply(rule)}
                  onArchive={() => setArchivingRule(rule)}
                  isApplying={
                    applyRule.isPending &&
                    applyRule.variables?.ruleId === rule.id
                  }
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---------- Blocked times ---------- */}

      <section className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Blocked times
            </h2>
            <p className="text-xs text-muted-foreground">
              Holidays, competitions, or personal time. Blocks remove any
              unbooked slots in the window.
            </p>
          </div>
          <Button onClick={() => setAddBlockOpen(true)} variant="secondary">
            <Ban className="h-3.5 w-3.5" strokeWidth={1.75} />
            Block time
          </Button>
        </div>

        {blocksLoading ? (
          <div className="flex h-24 items-center justify-center rounded-xl bg-card shadow">
            <Loader />
          </div>
        ) : !blocks || blocks.length === 0 ? (
          <div className="rounded-xl bg-card p-6 text-center shadow">
            <p className="text-xs text-muted-foreground">
              No blocked times. You&apos;re available whenever your schedule
              says so.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-card shadow">
            <div className="flex flex-col divide-y divide-border/60">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Ban
                        className="h-3.5 w-3.5 text-muted-foreground"
                        strokeWidth={1.75}
                      />
                      {format(new Date(block.startsAt), "d MMM yyyy")} –{" "}
                      {format(new Date(block.endsAt), "d MMM yyyy")}
                    </span>
                    {block.reason && (
                      <span className="text-xs text-muted-foreground">
                        {block.reason}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRemovingBlock(block)}
                    className="h-8 shrink-0 gap-1 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---------- Dialogs ---------- */}

      <AddRuleDialog open={addRuleOpen} onOpenChange={setAddRuleOpen} />

      {addBlockOpen && (
        <AddBlockDialog
          open={true}
          onOpenChange={(open) => !open && setAddBlockOpen(false)}
        />
      )}

      {archivingRule && (
        <Dialog
          open={true}
          onOpenChange={(open) => !open && setArchivingRule(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Remove this rule?</DialogTitle>
              <DialogDescription>
                {DAY_NAMES[archivingRule.dayOfWeek]} ·{" "}
                {archivingRule.startTime.slice(0, 5)} –{" "}
                {archivingRule.endTime.slice(0, 5)} · {archivingRule.venueName}
              </DialogDescription>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">
              Existing slots already generated from this rule are not removed.
              Remove them individually from the One-off slots tab if needed.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setArchivingRule(null)}
                disabled={archiveRule.isPending}
              >
                Keep it
              </Button>
              <Button
                variant="destructive"
                onClick={handleArchiveRule}
                disabled={archiveRule.isPending}
              >
                {archiveRule.isPending ? "Removing…" : "Remove rule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {removingBlock && (
        <Dialog
          open={true}
          onOpenChange={(open) => !open && setRemovingBlock(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Remove this block?</DialogTitle>
              <DialogDescription>
                {format(new Date(removingBlock.startsAt), "d MMM yyyy")} –{" "}
                {format(new Date(removingBlock.endsAt), "d MMM yyyy")}
              </DialogDescription>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">
              Removing a block does not automatically re-open slots. Apply your
              rules again to generate them.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRemovingBlock(null)}
                disabled={removeBlock.isPending}
              >
                Keep it
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveBlock}
                disabled={removeBlock.isPending}
              >
                {removeBlock.isPending ? "Removing…" : "Remove block"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ---------- Rule row ----------

function RuleRow({
  rule,
  onApply,
  onArchive,
  isApplying,
}: {
  rule: AvailabilityRule
  onApply: () => void
  onArchive: () => void
  isApplying: boolean
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            Every {DAY_SHORT[rule.dayOfWeek]}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" strokeWidth={1.75} />
            {rule.startTime.slice(0, 5)} – {rule.endTime.slice(0, 5)}
          </span>
          <span className="rounded-md bg-input px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {rule.slotMinutes} min slots
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" strokeWidth={1.75} />
            {rule.venueName}
          </span>
          {rule.levelName && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" strokeWidth={1.75} />
              {rule.levelName}
            </span>
          )}
          {rule.capacity > 1 && (
            <span className="text-muted-foreground">
              Capacity {rule.capacity}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          onClick={onApply}
          disabled={isApplying}
          size="sm"
          className="h-8 gap-1 text-xs"
        >
          <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
          {isApplying ? "Applying…" : "Apply"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onArchive}
          className="h-8 gap-1 text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Remove
        </Button>
      </div>
    </div>
  )
}

// ---------- Add block dialog ----------

function AddBlockDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const addBlock = useAddBlock()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")

  function handleSubmit() {
    if (!startDate || !endDate) return

    const startsAt = new Date(`${startDate}T00:00`).toISOString()
    const endsAt = new Date(`${endDate}T23:59`).toISOString()

    addBlock.mutate(
      { startsAt, endsAt, reason: reason || undefined },
      {
        onSuccess: () => {
          toast.add({
            title: "Time blocked",
            description: "Unbooked slots in this window were removed.",
            type: "success",
            timeout: 4000,
          })
          onOpenChange(false)
        },
        onError: (err) =>
          toast.add({
            title: "Failed to block time",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  const canSubmit =
    !!startDate &&
    !!endDate &&
    new Date(startDate) <= new Date(endDate) &&
    !addBlock.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Block time off</DialogTitle>
          <DialogDescription>
            Parents won&apos;t be able to book you during this window.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                From
              </span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="h-11"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                To
              </span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().slice(0, 10)}
                className="h-11"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Reason (optional)
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Mid-term break, tournament…"
              className="min-h-20 resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={addBlock.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {addBlock.isPending ? "Blocking…" : "Block time"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
