"use client"

import { useEffect, useRef, useState } from "react"
import { format, isToday, parseISO } from "date-fns"
import { Send, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { ThreadMessage } from "@/hooks/shared/use-support"

const stamp = (iso: string) => {
  const d = parseISO(iso)
  return isToday(d) ? format(d, "HH:mm") : format(d, "d MMM, HH:mm")
}

export type SendPayload = { body: string; internal: boolean; resolve: boolean }

export function ConversationThread({
  messages,
  onSend,
  sending,
  error,
  blockedReason,
  admin = false,
  canned = [],
  maxLength = 4000,
  placeholder = "Write a message…",
}: {
  messages: ThreadMessage[]
  onSend: (p: SendPayload) => Promise<void> | void
  sending: boolean
  error?: string | null
  blockedReason?: string | null
  admin?: boolean
  canned?: { title: string; body: string }[]
  maxLength?: number
  placeholder?: string
}) {
  const [body, setBody] = useState("")
  const [internal, setInternal] = useState(false)
  const [resolve, setResolve] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [messages.length])

  async function submit() {
    const text = body.trim()
    if (!text || sending) return
    try {
      await onSend({ body: text, internal, resolve })
      setBody("")
      setResolve(false)
    } catch {
      /* caller handles the error; keep what was typed */
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* Messages */}
      <div
        className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto px-2 py-4 sm:px-4"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-muted-foreground">
            No messages yet. Say hello below.
          </p>
        ) : (
          messages.map((m) => {
            if (m.kind === "system") {
              return (
                <div key={m.id} className="flex w-full justify-center py-1">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {m.body} · {stamp(m.createdAt)}
                  </span>
                </div>
              )
            }

            const isInternal = m.kind === "internal"
            const mine = m.isMine

            return (
              <div
                key={m.id}
                className={`flex w-full flex-col ${
                  mine ? "items-end" : "items-start"
                }`}
              >
                <div className="mb-1 flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                  {isInternal ? (
                    <>
                      <Lock className="h-3 w-3" strokeWidth={2} />
                      <span>Internal note</span>
                    </>
                  ) : (
                    <>
                      <span>{mine ? "You" : (m.senderName ?? "Someone")}</span>
                      <span aria-hidden>·</span>
                      <span>{stamp(m.createdAt)}</span>
                    </>
                  )}
                </div>

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    isInternal
                      ? "rounded-bl-md border border-dashed border-border bg-muted text-foreground"
                      : mine
                        ? "rounded-br-md bg-foreground text-background"
                        : "rounded-bl-md bg-foreground/80 text-background"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      {blockedReason ? (
        <div className="w-full border-t border-border/60 px-2 py-3 sm:px-4">
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            {blockedReason}
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2 border-t border-border/60 px-2 py-3 sm:px-4">
          {admin && canned.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {canned.map((c) => (
                <button
                  key={c.title}
                  type="button"
                  onClick={() => setBody(c.body)}
                  className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-accent/40 hover:text-foreground"
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}

          {/* Input + send — flexbox aligned, no absolute positioning */}
          <div className="flex w-full items-end gap-2 rounded-xl border border-border/60 bg-input px-3 py-2 focus-within:border-primary/60">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  submit()
                }
              }}
              rows={1}
              maxLength={maxLength}
              placeholder={
                internal
                  ? "Private note — only admins can see this"
                  : placeholder
              }
              aria-label="Message"
              className="max-h-32 min-h-9 w-full flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-3 text-xs"
              disabled={!body.trim() || sending}
              onClick={submit}
              aria-label="Send message"
            >
              <Send className="h-3 w-3" strokeWidth={2} />
              <span className="hidden sm:inline">
                {sending ? "Sending…" : internal ? "Add note" : "Send"}
              </span>
            </Button>
          </div>

          {/* Meta row: counter + options */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {admin && (
              <>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={internal}
                    onCheckedChange={(v) => setInternal(!!v)}
                  />
                  Private note
                </label>
                {!internal && (
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      checked={resolve}
                      onCheckedChange={(v) => setResolve(!!v)}
                    />
                    Reply &amp; resolve
                  </label>
                )}
              </>
            )}
            <span className="ml-auto tabular-nums">
              {body.length}/{maxLength}
            </span>
          </div>

          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
