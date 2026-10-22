import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import { adminReplyToTicket } from "@/lib/functions/support"

export type TicketStatus = "open" | "waiting" | "resolved" | "closed"
export type TicketPriority = "low" | "normal" | "high" | "urgent"

export type ThreadMessage = {
  id: number
  body: string
  createdAt: string
  kind: "message" | "internal" | "system"
  senderName: string | null
  senderRole: string
  isMine: boolean
}

export type Thread = {
  id: number
  kind: "ticket" | "direct"
  subject: string
  category: string | null
  status: TicketStatus
  createdAt: string
  rating: number | null
  canReply: boolean
  replyBlockedReason: string | null
  other: { name: string; role: string; avatarUrl: string | null } | null
  messages: ThreadMessage[]
}

export type MyTicket = {
  id: number
  subject: string
  category: string
  status: TicketStatus
  createdAt: string
  lastMessageAt: string
  unread: boolean
  rating: number | null
}

export type DirectConversation = {
  id: number
  otherAccountId: string
  otherName: string
  otherAvatar: string | null
  otherRole: string
  lastMessage: string | null
  lastMessageAt: string
  unread: boolean
  status: string
  children: string | null
}

export type MessageContact = {
  accountId: string
  fullName: string
  avatarUrl: string | null
  role: string
  programmes: string | null
  children: string | null
}

/* ── raw row shapes returned by the RPCs ─────────────────────── */

type RawMessage = {
  id: number
  body: string
  created_at: string
  kind: ThreadMessage["kind"]
  sender_name: string | null
  sender_role: string
  is_mine: boolean | null
}

type RawThread = {
  id: number
  kind: Thread["kind"]
  subject: string
  category: string | null
  status: TicketStatus
  created_at: string
  rating: number | null
  can_reply: boolean | null
  reply_blocked_reason: string | null
  other: { name: string; role: string; avatar_url: string | null } | null
  messages: RawMessage[] | null
}

type RawMyTicket = {
  id: number
  subject: string
  category: string
  status: TicketStatus
  created_at: string
  last_message_at: string
  unread: boolean | null
  rating: number | null
}

type RawDirect = {
  id: number
  other_account_id: string
  other_name: string
  other_avatar: string | null
  other_role: string
  last_message: string | null
  last_message_at: string
  unread: boolean | null
  status: string
  children: string | null
}

type RawContact = {
  account_id: string
  full_name: string
  avatar_url: string | null
  role: string
  programmes: string | null
  children: string | null
}

type RawAdminTicket = {
  id: number
  kind: "ticket" | "direct"
  subject: string
  category: string | null
  status: TicketStatus
  priority: TicketPriority
  source: string
  requester_name: string | null
  requester_email: string | null
  assigned_to: string | null
  assigned_name: string | null
  created_at: string
  last_message_at: string
  preview: string | null
  needs_reply: boolean | null
  overdue: boolean | null
  total_count: number
}

type RawAdminConversation = {
  id: number
  kind: "ticket" | "direct"
  subject: string
  category: string | null
  status: TicketStatus
  priority: TicketPriority
  source: string
  created_at: string
  first_response_at: string | null
  resolved_at: string | null
  rating: number | null
  rating_comment: string | null
  assigned_to: string | null
  requester: {
    account_id: string | null
    name: string | null
    email: string | null
    phone: string | null
  } | null
  member: { id: number; name: string } | null
  programme: { id: number; name: string } | null
  participants: { account_id: string; name: string; role: string }[] | null
  messages: RawMessage[] | null
}

type RawAdminAccount = {
  id: string
  full_name: string | null
  email: string
  active: boolean | null
}

/* ── mappers ─────────────────────────────────────────────────── */

const mapMessage = (m: RawMessage): ThreadMessage => ({
  id: m.id,
  body: m.body,
  createdAt: m.created_at,
  kind: m.kind,
  senderName: m.sender_name,
  senderRole: m.sender_role,
  isMine: !!m.is_mine,
})

function mapThread(r: RawThread): Thread {
  return {
    id: r.id,
    kind: r.kind,
    subject: r.subject,
    category: r.category,
    status: r.status,
    createdAt: r.created_at,
    rating: r.rating,
    canReply: !!r.can_reply,
    replyBlockedReason: r.reply_blocked_reason ?? null,
    other: r.other
      ? {
          name: r.other.name,
          role: r.other.role,
          avatarUrl: r.other.avatar_url,
        }
      : null,
    messages: (r.messages ?? []).map(mapMessage),
  }
}

const KEY = ["support"] as const
const POLL_MS = 15_000

// ---------------- parents and coaches ----------------

export function useMyTickets() {
  return useQuery({
    queryKey: [...KEY, "my-tickets"],
    queryFn: async (): Promise<MyTicket[]> => {
      const { data, error } = await createClient().rpc("get_my_tickets")
      if (error) throw new Error(error.message)
      return ((data ?? []) as RawMyTicket[]).map((t) => ({
        id: t.id,
        subject: t.subject,
        category: t.category,
        status: t.status,
        createdAt: t.created_at,
        lastMessageAt: t.last_message_at,
        unread: !!t.unread,
        rating: t.rating,
      }))
    },
  })
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      subject: string
      category: string
      body: string
      memberId?: number | null
    }) => {
      const { data, error } = await createClient().rpc("create_my_ticket", {
        p_subject: input.subject,
        p_category: input.category,
        p_body: input.body,
        p_member_id: input.memberId ?? null,
        p_programme_id: null,
      })
      if (error) throw new Error(error.message)
      return (data as { id: number }).id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useOpenConversation(id: number | null) {
  return useQuery({
    queryKey: [...KEY, "thread", id],
    queryFn: async (): Promise<Thread> => {
      const { data, error } = await createClient().rpc("open_my_conversation", {
        p_id: id,
      })
      if (error) throw new Error(error.message)
      return mapThread(data as RawThread)
    },
    enabled: id !== null,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
  })
}

export function useReplyToConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: number; body: string }) => {
      const { error } = await createClient().rpc("reply_to_conversation", {
        p_id: input.id,
        p_body: input.body,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useResolveMyTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await createClient().rpc("resolve_my_ticket", {
        p_id: id,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useRateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: number
      rating: number
      comment?: string
    }) => {
      const { error } = await createClient().rpc("rate_my_ticket", {
        p_id: input.id,
        p_rating: input.rating,
        p_comment: input.comment ?? null,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUnreadMessages() {
  return useQuery({
    queryKey: [...KEY, "unread"],
    queryFn: async (): Promise<number> => {
      const { data, error } = await createClient().rpc("get_my_unread_count")
      if (error) throw new Error(error.message)
      return Number(data ?? 0)
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
}

export function useMyDirectConversations() {
  return useQuery({
    queryKey: [...KEY, "directs"],
    queryFn: async (): Promise<DirectConversation[]> => {
      const { data, error } = await createClient().rpc(
        "get_my_direct_conversations"
      )
      if (error) throw new Error(error.message)
      return ((data ?? []) as RawDirect[]).map((c) => ({
        id: c.id,
        otherAccountId: c.other_account_id,
        otherName: c.other_name,
        otherAvatar: c.other_avatar,
        otherRole: c.other_role,
        lastMessage: c.last_message,
        lastMessageAt: c.last_message_at,
        unread: !!c.unread,
        status: c.status,
        children: c.children,
      }))
    },
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
  })
}

export function useMessageContacts() {
  return useQuery({
    queryKey: [...KEY, "contacts"],
    queryFn: async (): Promise<MessageContact[]> => {
      const { data, error } = await createClient().rpc(
        "get_my_message_contacts"
      )
      if (error) throw new Error(error.message)
      return ((data ?? []) as RawContact[]).map((c) => ({
        accountId: c.account_id,
        fullName: c.full_name,
        avatarUrl: c.avatar_url,
        role: c.role,
        programmes: c.programmes,
        children: c.children,
      }))
    },
    staleTime: 60_000,
  })
}

export function useStartDirect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      otherAccountId: string
      body: string
      memberId?: number | null
    }) => {
      const { data, error } = await createClient().rpc(
        "start_direct_conversation",
        {
          p_other: input.otherAccountId,
          p_body: input.body,
          p_member_id: input.memberId ?? null,
        }
      )
      if (error) throw new Error(error.message)
      return (data as { id: number }).id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

// ---------------- admin ----------------

export type TicketSummary = {
  open: number
  waiting: number
  needs_reply: number
  unassigned: number
  urgent: number
  overdue: number
  resolved_7d: number
  avg_first_response_hours: number | null
  avg_rating: number | null
  direct_total: number
}

export type AdminTicketRow = {
  id: number
  kind: "ticket" | "direct"
  subject: string
  category: string | null
  status: TicketStatus
  priority: TicketPriority
  source: string
  requesterName: string | null
  requesterEmail: string | null
  assignedTo: string | null
  assignedName: string | null
  createdAt: string
  lastMessageAt: string
  preview: string | null
  needsReply: boolean
  overdue: boolean
  totalCount: number
}

export type AdminConversation = {
  id: number
  kind: "ticket" | "direct"
  subject: string
  category: string | null
  status: TicketStatus
  priority: TicketPriority
  source: string
  createdAt: string
  firstResponseAt: string | null
  resolvedAt: string | null
  rating: number | null
  ratingComment: string | null
  assignedTo: string | null
  requester: {
    accountId: string | null
    name: string | null
    email: string | null
    phone: string | null
  }
  member: { id: number; name: string } | null
  programme: { id: number; name: string } | null
  participants: { accountId: string; name: string; role: string }[]
  messages: ThreadMessage[]
}

export type AdminTicketFilters = {
  kind: "ticket" | "direct"
  status: TicketStatus | null
  category: string | null
  assigned: "me" | "unassigned" | null
  search: string
  needsReply: boolean
  page: number
}
export const ADMIN_PAGE_SIZE = 25

export function useTicketSummary() {
  return useQuery({
    queryKey: [...KEY, "admin-summary"],
    queryFn: async (): Promise<TicketSummary> => {
      const { data, error } = await createClient().rpc(
        "admin_get_ticket_summary"
      )
      if (error) throw new Error(error.message)
      return data as TicketSummary
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
}

export function useAdminTickets(f: AdminTicketFilters) {
  return useQuery({
    queryKey: [...KEY, "admin-list", f],
    queryFn: async (): Promise<AdminTicketRow[]> => {
      const { data, error } = await createClient().rpc("admin_get_tickets", {
        p_kind: f.kind,
        p_status: f.status,
        p_category: f.category,
        p_assigned: f.assigned,
        p_search: f.search.trim() || null,
        p_needs_reply: f.needsReply,
        p_limit: ADMIN_PAGE_SIZE,
        p_offset: f.page * ADMIN_PAGE_SIZE,
      })
      if (error) throw new Error(error.message)
      return ((data ?? []) as RawAdminTicket[]).map((r) => ({
        id: r.id,
        kind: r.kind,
        subject: r.subject,
        category: r.category,
        status: r.status,
        priority: r.priority,
        source: r.source,
        requesterName: r.requester_name,
        requesterEmail: r.requester_email,
        assignedTo: r.assigned_to,
        assignedName: r.assigned_name,
        createdAt: r.created_at,
        lastMessageAt: r.last_message_at,
        preview: r.preview,
        needsReply: !!r.needs_reply,
        overdue: !!r.overdue,
        totalCount: Number(r.total_count),
      }))
    },
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
}

export function useAdminConversation(id: number | null) {
  return useQuery({
    queryKey: [...KEY, "admin-thread", id],
    queryFn: async (): Promise<AdminConversation> => {
      const { data, error } = await createClient().rpc(
        "admin_get_conversation",
        { p_id: id }
      )
      if (error) throw new Error(error.message)
      const r = data as RawAdminConversation
      return {
        id: r.id,
        kind: r.kind,
        subject: r.subject,
        category: r.category,
        status: r.status,
        priority: r.priority,
        source: r.source,
        createdAt: r.created_at,
        firstResponseAt: r.first_response_at,
        resolvedAt: r.resolved_at,
        rating: r.rating,
        ratingComment: r.rating_comment,
        assignedTo: r.assigned_to,
        requester: {
          accountId: r.requester?.account_id ?? null,
          name: r.requester?.name ?? null,
          email: r.requester?.email ?? null,
          phone: r.requester?.phone ?? null,
        },
        member: r.member,
        programme: r.programme,
        participants: (r.participants ?? []).map((p) => ({
          accountId: p.account_id,
          name: p.name,
          role: p.role,
        })),
        messages: (r.messages ?? []).map(mapMessage),
      }
    },
    enabled: id !== null,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
  })
}

export function useAdminReply() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: number
      body: string
      internal: boolean
      resolve: boolean
    }) => {
      const res = await adminReplyToTicket(input)
      if (res.error) throw new Error(res.error)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: number
      patch: Partial<{
        status: TicketStatus
        priority: TicketPriority
        category: string
        assigned_to: string | null
      }>
    }) => {
      const { error } = await createClient().rpc("admin_update_ticket", {
        p_id: input.id,
        p_patch: input.patch,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useAdminStaff() {
  return useQuery({
    queryKey: [...KEY, "admins"],
    queryFn: async (): Promise<{ id: string; name: string }[]> => {
      const { data, error } = await createClient().rpc("admin_get_accounts", {
        p_role: "admin",
      })
      if (error) throw new Error(error.message)
      return ((data ?? []) as RawAdminAccount[])
        .filter((a) => !!a.active)
        .map((a) => ({ id: a.id, name: a.full_name ?? a.email }))
    },
    staleTime: 5 * 60_000,
  })
}
