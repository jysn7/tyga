// hooks/use-notifications.ts
"use client"

import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type Notification = {
  id: number
  type: string
  title: string
  body: string
  relatedType: string | null
  relatedId: number | null
  isRead: boolean
  createdAt: string
}

type NotificationRow = {
  id: number
  type: string
  title: string
  body: string
  related_type: string | null
  related_id: number | null
  is_read: boolean
  created_at: string
}

function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    relatedType: row.related_type,
    relatedId: row.related_id,
    isRead: row.is_read,
    createdAt: row.created_at,
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useNotifications(limit = 20, offset = 0) {
  const supabase = createClient()
  return useQuery({
    queryKey: ["notifications", limit, offset],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase.rpc("get_my_notifications", {
        p_limit: limit,
        p_offset: offset,
      })
      if (error) throw error
      return ((data ?? []) as NotificationRow[]).map(toNotification)
    },
    staleTime: 30_000,
  })
}

export function useUnreadCount() {
  const supabase = createClient()
  return useQuery({
    queryKey: ["notifications-unread"],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc("get_unread_count")
      if (error) throw error
      return data ?? 0
    },
    refetchInterval: 5 * 60_000,
  })
}

// ---------------------------------------------------------------------------
// Invalidation helpers
// ---------------------------------------------------------------------------

function useInvalidateNotifications() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ["notifications"] })
    qc.invalidateQueries({ queryKey: ["notifications-unread"] })
  }
}

/** Snapshot every cached notifications list so we can roll back on error. */
function snapshotNotifications(qc: ReturnType<typeof useQueryClient>) {
  return qc.getQueriesData<Notification[]>({ queryKey: ["notifications"] })
}

function restoreSnapshot(
  qc: ReturnType<typeof useQueryClient>,
  snapshot: [readonly unknown[], Notification[] | undefined][]
) {
  for (const [key, data] of snapshot) {
    qc.setQueryData(key, data)
  }
}

// ---------------------------------------------------------------------------
// Mutations (all optimistic)
// ---------------------------------------------------------------------------

export function useMarkRead() {
  const supabase = createClient()
  const qc = useQueryClient()
  const invalidate = useInvalidateNotifications()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("mark_read", { p_id: id })
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["notifications"] })
      await qc.cancelQueries({ queryKey: ["notifications-unread"] })

      const previousLists = snapshotNotifications(qc)
      const previousUnread = qc.getQueryData<number>(["notifications-unread"])

      // Flip isRead in every cached list
      qc.setQueriesData<Notification[]>(
        { queryKey: ["notifications"] },
        (old) => old?.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )

      // Optimistically decrement unread count
      if (typeof previousUnread === "number" && previousUnread > 0) {
        qc.setQueryData<number>(["notifications-unread"], previousUnread - 1)
      }

      return { previousLists, previousUnread }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previousLists) restoreSnapshot(qc, ctx.previousLists)
      if (ctx?.previousUnread !== undefined) {
        qc.setQueryData(["notifications-unread"], ctx.previousUnread)
      }
    },
    onSettled: invalidate,
  })
}

export function useMarkAllRead() {
  const supabase = createClient()
  const qc = useQueryClient()
  const invalidate = useInvalidateNotifications()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("mark_all_read")
      if (error) throw error
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["notifications"] })
      await qc.cancelQueries({ queryKey: ["notifications-unread"] })

      const previousLists = snapshotNotifications(qc)
      const previousUnread = qc.getQueryData<number>(["notifications-unread"])

      // Flip every item to read
      qc.setQueriesData<Notification[]>(
        { queryKey: ["notifications"] },
        (old) => old?.map((n) => ({ ...n, isRead: true }))
      )

      // Count is now zero
      qc.setQueryData<number>(["notifications-unread"], 0)

      return { previousLists, previousUnread }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousLists) restoreSnapshot(qc, ctx.previousLists)
      if (ctx?.previousUnread !== undefined) {
        qc.setQueryData(["notifications-unread"], ctx.previousUnread)
      }
    },
    onSettled: invalidate,
  })
}

export function useDeleteNotification() {
  const supabase = createClient()
  const qc = useQueryClient()
  const invalidate = useInvalidateNotifications()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("delete_notification", { p_id: id })
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["notifications"] })
      await qc.cancelQueries({ queryKey: ["notifications-unread"] })

      const previousLists = snapshotNotifications(qc)
      const previousUnread = qc.getQueryData<number>(["notifications-unread"])

      // Was this item unread? If so, decrement the count.
      let wasUnread = false
      for (const [, list] of previousLists) {
        const item = list?.find((n) => n.id === id)
        if (item && !item.isRead) {
          wasUnread = true
          break
        }
      }

      // Remove from every cached list
      qc.setQueriesData<Notification[]>(
        { queryKey: ["notifications"] },
        (old) => old?.filter((n) => n.id !== id)
      )

      if (
        wasUnread &&
        typeof previousUnread === "number" &&
        previousUnread > 0
      ) {
        qc.setQueryData<number>(["notifications-unread"], previousUnread - 1)
      }

      return { previousLists, previousUnread }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previousLists) restoreSnapshot(qc, ctx.previousLists)
      if (ctx?.previousUnread !== undefined) {
        qc.setQueryData(["notifications-unread"], ctx.previousUnread)
      }
    },
    onSettled: invalidate,
  })
}

// ---------------------------------------------------------------------------
// Realtime
// ---------------------------------------------------------------------------

export function useRealtimeNotifications(accountId: string | null) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!accountId) return

    const supabase = createClient()

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `account_id=eq.${accountId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["notifications"] })
          qc.invalidateQueries({ queryKey: ["notifications-unread"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [accountId, qc])
}
