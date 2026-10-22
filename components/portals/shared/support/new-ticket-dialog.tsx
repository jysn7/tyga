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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New support request</DialogTitle>
          <DialogDescription>
            We reply within one working day. For emergencies, please phone us.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
          {/* Left: category picker + child select */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-foreground">
                What is it about?
              </span>
              <div
                role="radiogroup"
                aria-label="Category"
                className="grid grid-cols-1 gap-1.5"
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
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        selected
                          ? "border-primary/60 bg-primary/5 text-foreground"
                          : "border-border/60 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          selected ? "border-primary" : "border-border"
                        }`}
                      >
                        {selected && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </span>
                      <span className="truncate">{c.label}</span>
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
                    <SelectValue />
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
          <div className="flex flex-col gap-4">
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
            </div>

            <div className="flex flex-col gap-1.5">
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
                rows={7}
                maxLength={4000}
                placeholder="Describe what's going on…"
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Please do not include ID numbers or medical details.
              </p>
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
