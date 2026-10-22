"use client"

import { useEffect, useRef, useState } from "react"
import { format, isToday, parseISO } from "date-fns"
import { Send, Lock, SmilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import EmojiPicker, { Theme } from "emoji-picker-react"
import { useTheme } from "next-themes"
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
  const [emojiOpen, setEmojiOpen] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { resolvedTheme } = useTheme()

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

  function insertEmoji(emoji: string) {
    const el = textareaRef.current
    if (!el) {
      setBody((b) => b + emoji)
      return
    }
    const start = el.selectionStart ?? body.length
    const end = el.selectionEnd ?? body.length
    const next = body.slice(0, start) + emoji + body.slice(end)
    setBody(next)
    // Restore cursor position after the inserted emoji
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + emoji.length
      el.setSelectionRange(pos, pos)
    })
    setEmojiOpen(false)
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
          <div className="flex w-full items-end gap-2 rounded-l-lg rounded-r-full border border-border/60 bg-input py-1 pr-2 pl-3 focus-within:border-primary/60">
            <Textarea
              ref={textareaRef}
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
              className="max-h-32 min-h-9 w-full flex-1 resize-none border-none bg-transparent px-0 py-0 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0"
            />

            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground"
                  aria-label="Add emoji"
                >
                  <SmilePlus className="h-4 w-4" strokeWidth={1.75} />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="top"
                className="w-auto border-0 p-0"
              >
                <EmojiPicker
                  onEmojiClick={(e) => insertEmoji(e.emoji)}
                  theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
                  lazyLoadEmojis
                  searchPlaceholder="Search emoji"
                  width={320}
                  height={400}
                  previewConfig={{ showPreview: false }}
                />
              </PopoverContent>
            </Popover>

            <Button
              size="sm"
              variant="secondary"
              className="h-8 shrink-0 gap-1.5 rounded-full px-3 text-xs"
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
            <span className="ml-auto pr-4 tabular-nums">
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
