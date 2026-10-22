// components/portals/shared/support/ticket-thread.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import { format, isToday, parseISO } from "date-fns"
import { Lock, Send, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ThreadMessage } from "@/hooks/shared/use-support"

const stamp = (iso: string) => {
  const d = parseISO(iso)
  return isToday(d) ? format(d, "HH:mm") : format(d, "d MMM yyyy, HH:mm")
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

export type SendPayload = { body: string; internal: boolean; resolve: boolean }

export function TicketThread({
  messages,
  onSend,
  sending,
  error,
  blockedReason,
  admin = false,
  canned = [],
  maxLength = 4000,
  placeholder = "Write a reply…",
  onBack,
  subject,
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
  onBack?: () => void
  subject?: string
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
      /* caller handles the error */
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* Ticket header */}
      {(subject || onBack) && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-2 py-3 sm:px-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground md:hidden"
              onClick={onBack}
              aria-label="Back to tickets"
            >
              <Ticket className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {subject ?? "Conversation"}
            </p>
          </div>
        </div>
      )}

      {/* Messages — ticket comments style */}
      <div
        className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-2 py-4 sm:px-4"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-muted-foreground">
            No messages yet. Write the first reply below.
          </p>
        ) : (
          <div className="flex flex-col">
            {messages.map((m, i) => {
              if (m.kind === "system") {
                return (
                  <div key={m.id} className="flex w-full justify-center py-3">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {m.body} · {stamp(m.createdAt)}
                    </span>
                  </div>
                )
              }

              const isInternal = m.kind === "internal"
              const name = m.isMine ? "You" : (m.senderName ?? "Someone")
              const prev = i > 0 ? messages[i - 1] : null
              const showDayBreak =
                !prev ||
                format(parseISO(prev.createdAt), "yyyy-MM-dd") !==
                  format(parseISO(m.createdAt), "yyyy-MM-dd")

              return (
                <div key={m.id}>
                  {showDayBreak && (
                    <div className="flex items-center gap-3 py-3">
                      <span className="h-px flex-1 bg-border/60" />
                      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                        {format(parseISO(m.createdAt), "EEEE, d MMM")}
                      </span>
                      <span className="h-px flex-1 bg-border/60" />
                    </div>
                  )}

                  <div
                    className={`flex gap-3 border-b border-border/40 py-4 last:border-b-0 ${
                      isInternal ? "bg-muted/40" : ""
                    }`}
                  >
                    {/* Author avatar */}
                    <div className="shrink-0">
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarFallback className="text-[11px] font-semibold">
                          {initials(name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {stamp(m.createdAt)}
                        </span>
                        {isInternal && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            <Lock className="h-2.5 w-2.5" strokeWidth={2} />
                            Internal note
                          </span>
                        )}
                        {m.isMine && !isInternal && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            You
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          isInternal
                            ? "text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {m.body}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Reply composer */}
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

          {/* Input row */}
          <div
            className={`flex w-full items-end gap-2 rounded-xl border bg-input px-3 py-2 transition-colors focus-within:border-primary/60 ${
              internal ? "border-dashed border-border" : "border-border/60"
            }`}
          >
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  submit()
                }
              }}
              rows={2}
              maxLength={maxLength}
              placeholder={
                internal
                  ? "Private note — only admins can see this"
                  : placeholder
              }
              aria-label="Reply"
              className="max-h-40 min-h-10 w-full flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-3 text-xs"
              disabled={!body.trim() || sending}
              onClick={submit}
              aria-label="Send reply"
            >
              <Send className="h-3 w-3" strokeWidth={2} />
              <span className="hidden sm:inline">
                {sending ? "Sending…" : internal ? "Add note" : "Reply"}
              </span>
            </Button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {admin && (
              <>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={internal}
                    onCheckedChange={(v) => setInternal(!!v)}
                  />
                  Internal note
                </label>
                {!internal && (
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      checked={resolve}
                      onCheckedChange={(v) => setResolve(!!v)}
                    />
                    Reply &amp; close
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
