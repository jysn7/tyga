"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader } from "@/components/portals/shared/loader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMessageContacts, useStartDirect } from "@/hooks/shared/use-support"

export function NewMessageDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (id: number) => void
}) {
  const { data: contacts, isLoading } = useMessageContacts()
  const start = useStartDirect()
  const [to, setTo] = useState("")
  const [body, setBody] = useState("")

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>
            You can message people connected to your children&apos;s or your own
            programmes.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Loader />
        ) : !contacts?.length ? (
          <p className="text-sm text-muted-foreground">
            There is nobody to message yet. This opens once a child is enrolled
            in a programme.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div
              className="flex max-h-48 flex-col gap-1.5 overflow-y-auto"
              role="radiogroup"
              aria-label="Who to message"
            >
              {contacts.map((c) => (
                <button
                  key={c.accountId}
                  type="button"
                  role="radio"
                  aria-checked={to === c.accountId}
                  onClick={() => setTo(c.accountId)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    to === c.accountId
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/40"
                  }`}
                >
                  <span className="block text-foreground">{c.fullName}</span>
                  <span className="block text-xs text-muted-foreground">
                    {[c.programmes, c.children].filter(Boolean).join(" · ")}
                  </span>
                </button>
              ))}
            </div>

            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Write a message…"
              aria-label="Message"
              className="resize-none"
            />

            <p className="text-xs text-muted-foreground">
              Messages can be read by academy administrators.
            </p>
          </div>
        )}

        {start.error && (
          <p role="alert" className="text-xs text-destructive">
            {start.error.message}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={start.isPending || !to || !body.trim()}
            onClick={() =>
              start.mutate(
                { otherAccountId: to, body },
                {
                  onSuccess: (id) => {
                    setBody("")
                    setTo("")
                    onCreated(id)
                    onClose()
                  },
                }
              )
            }
          >
            {start.isPending ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
