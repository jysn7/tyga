"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, isToday, isYesterday, parseISO } from "date-fns"
import { MessageCircle, ArrowLeft, PenSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  useMyDirectConversations,
  useOpenConversation,
  useReplyToConversation,
} from "@/hooks/shared/use-support"
import { ConversationThread } from "@/components/portals/shared/support/conversation-thread"
import { NewMessageDialog } from "@/components/portals/shared/support/new-message-dialog"
import { useFullscreen } from "@/components/portals/shared/fullscreen-context"

const COACH_MESSAGES_ROUTE = "/coach/messages"

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

const chatTime = (iso: string) => {
  const d = parseISO(iso)
  if (isToday(d)) return format(d, "HH:mm")
  if (isYesterday(d)) return "Yesterday"
  return format(d, "d MMM")
}

function MessageList({
  selected,
  onSelect,
}: {
  selected: number | null
  onSelect: (id: number) => void
}) {
  const directs = useMyDirectConversations()

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center border-b border-border/60 px-2 py-3 sm:px-4">
        <h2 className="text-sm font-semibold text-foreground">Inbox</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {directs.isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader />
          </div>
        ) : !directs.data?.length ? (
          <div className="p-2 sm:p-4">
            <EmptyState
              icon={MessageCircle}
              title="No messages yet"
              description="Message your child's coach about sessions and progress."
            />
          </div>
        ) : (
          directs.data.map((c) => {
            const isActive = selected === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={isActive ? "true" : undefined}
                className={`flex w-full items-start gap-3 border-b border-border/40 px-2 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/40 sm:px-4 ${
                  isActive ? "bg-accent/40" : ""
                }`}
              >
                <Avatar className="h-9 w-9 shrink-0 rounded-full">
                  {c.otherAvatar && (
                    <AvatarImage src={c.otherAvatar} alt={c.otherName} />
                  )}
                  <AvatarFallback className="text-[11px] font-semibold">
                    {initials(c.otherName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={`truncate text-sm ${
                        c.unread || isActive
                          ? "font-semibold text-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {c.otherName}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      {chatTime(c.lastMessageAt)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className={`truncate text-xs ${
                        c.unread ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {c.lastMessage ?? "No messages yet"}
                    </span>
                    {c.unread && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

function MessagePane({ id, onBack }: { id: number; onBack: () => void }) {
  const { data, isLoading, error } = useOpenConversation(id)
  const reply = useReplyToConversation()

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="m-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive sm:m-4">
        {error?.message ?? "Could not load this conversation"}
      </div>
    )
  }

  const name = data.other?.name ?? "Conversation"

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* Header — fixed */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-2 py-3 sm:gap-3 sm:px-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Back to inbox"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </Button>
        <Avatar className="h-9 w-9 shrink-0 rounded-full">
          {data.other?.avatarUrl && (
            <AvatarImage src={data.other.avatarUrl} alt={name} />
          )}
          <AvatarFallback className="text-[11px] font-semibold">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {name}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {data.other?.role === "coach" ? "Coach" : "Parent"}
          </p>
        </div>
      </div>

      {/* Thread — flexes, scrolls internally, composer pinned at bottom */}
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <ConversationThread
          messages={data.messages}
          sending={reply.isPending}
          error={reply.error?.message}
          blockedReason={data.canReply ? null : data.replyBlockedReason}
          maxLength={2000}
          placeholder={`Message ${name.split(" ")[0]}…`}
          onSend={async ({ body }) => {
            await reply.mutateAsync({ id, body })
          }}
        />
      </div>
    </div>
  )
}

export default function CoachMessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null
  const [newMessage, setNewMessage] = useState(false)

  // Fullscreen only when a conversation is open.
  // Hides mobile nav + removes page padding so the chat fills the viewport.
  useFullscreen(id !== null)

  const composeButton = (
    <Button
      size="sm"
      variant="secondary"
      className="h-9 gap-1.5 text-xs"
      onClick={() => setNewMessage(true)}
    >
      <PenSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
      Compose
    </Button>
  )

  // Chat view — full viewport, no page header, only thread scrolls
  if (id !== null) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div className="grid min-h-0 w-full flex-1 grid-cols-1 overflow-hidden md:grid-cols-[20rem_1fr]">
          <div className="hidden min-h-0 w-full border-border/60 md:block md:border-r">
            <MessageList
              selected={id}
              onSelect={(mid) =>
                router.push(`${COACH_MESSAGES_ROUTE}?id=${mid}`)
              }
            />
          </div>

          <div className="flex min-h-0 w-full">
            <MessagePane
              key={id}
              id={id}
              onBack={() => router.push(COACH_MESSAGES_ROUTE)}
            />
          </div>
        </div>

        {newMessage && (
          <NewMessageDialog
            open={newMessage}
            onClose={() => setNewMessage(false)}
            onCreated={(newId) =>
              router.push(`${COACH_MESSAGES_ROUTE}?id=${newId}`)
            }
          />
        )}
      </div>
    )
  }

  // Inbox view — page header with compose action
  return (
    <div className="max-w-8xl mx-auto flex h-full w-full flex-col gap-6">
      <PageHeader
        title="Messages"
        description="Chat with parents and fellow coaches"
        action={composeButton}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[20rem_1fr]">
        <div className="min-h-0 w-full border-border/60 md:border-r">
          <MessageList
            selected={id}
            onSelect={(mid) => router.push(`${COACH_MESSAGES_ROUTE}?id=${mid}`)}
          />
        </div>

        <div className="hidden min-h-0 w-full md:flex">
          <div className="flex h-full w-full items-center justify-center">
            <EmptyState
              icon={MessageCircle}
              title="Select a conversation"
              description="Choose a chat on the left, or compose a new message."
            />
          </div>
        </div>
      </div>

      {newMessage && (
        <NewMessageDialog
          open={newMessage}
          onClose={() => setNewMessage(false)}
          onCreated={(newId) =>
            router.push(`${COACH_MESSAGES_ROUTE}?id=${newId}`)
          }
        />
      )}
    </div>
  )
}
