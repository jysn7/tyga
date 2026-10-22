"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateTicket } from "@/hooks/shared/use-support"
import { TICKET_CATEGORIES } from "@/lib/constants/support"
import { useMembers } from "@/hooks/use-members"

export function NewTicketDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (id: number) => void
}) {
  const create = useCreateTicket()
  const { data: members } = useMembers()
  const [category, setCategory] = useState<string>(
    TICKET_CATEGORIES[0]?.value ?? "other"
  )
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [memberId, setMemberId] = useState("none")

  function reset() {
    setCategory(TICKET_CATEGORIES[0]?.value ?? "other")
    setSubject("")
    setBody("")
    setMemberId("none")
  }

  function submit() {
    create.mutate(
      {
        subject,
        category,
        body,
        memberId: memberId === "none" ? null : Number(memberId),
      },
      {
        onSuccess: (id) => {
          reset()
          onCreated(id)
          onClose()
        },
      }
    )
  }

  const canSubmit =
    !create.isPending && subject.trim().length >= 3 && body.trim().length >= 5

  const selectedMemberName =
    memberId === "none"
      ? "Not about a specific child"
      : (members?.find((m) => String(m.id) === memberId)?.fullName ??
        "Select a child")

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New support request</DialogTitle>
          <DialogDescription>
            We reply within one working day. For emergencies, please phone us.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* Left: category chips + child select */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-foreground">
                What is it about?
              </span>
              <div
                role="radiogroup"
                aria-label="Category"
                className="flex flex-wrap gap-1.5"
              >
                {TICKET_CATEGORIES.map((c) => {
                  const selected = category === c.value
                  return (
                    <button
                      key={c.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setCategory(c.value)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/60 text-muted-foreground hover:border-border hover:bg-accent/40 hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-primary-foreground"
                            : "border-current"
                        }`}
                        aria-hidden
                      >
                        {selected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </span>
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {members && members.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ticket-member"
                  className="text-xs font-medium text-foreground"
                >
                  Which child?{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Select
                  value={memberId}
                  onValueChange={(v) => setMemberId(v ?? "none")}
                >
                  <SelectTrigger
                    id="ticket-member"
                    className="h-9 w-full text-sm"
                  >
                    <SelectValue>{selectedMemberName}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Not about a specific child
                    </SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Right: subject + message */}
          <div className="flex flex-col gap-4 md:border-l md:border-border/60 md:pl-6">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ticket-subject"
                className="text-xs font-medium text-foreground"
              >
                Subject
              </label>
              <Input
                id="ticket-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={150}
                placeholder="A short summary"
              />
              <p className="text-xs text-muted-foreground">
                {subject.length}/150
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <label
                htmlFor="ticket-body"
                className="text-xs font-medium text-foreground"
              >
                Message
              </label>
              <Textarea
                id="ticket-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                maxLength={4000}
                placeholder="Describe what's going on…"
                className="min-h-40 resize-none"
              />
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>
                  Please do not include ID numbers or medical details.
                </span>
                <span className="shrink-0 tabular-nums">
                  {body.length}/4000
                </span>
              </div>
            </div>

            {create.error && (
              <p role="alert" className="text-xs text-destructive">
                {create.error.message}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={!canSubmit} onClick={submit}>
            {create.isPending ? "Sending…" : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
