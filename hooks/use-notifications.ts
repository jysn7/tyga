import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type Notification = {
  id: number
  type: string
  title: string
  body: string
  related_type: string | null
  related_id: number | null
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch all notifications for the user
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase.rpc("get_my_notifications", {
        p_limit: 50,
        p_offset: 0,
      })
      if (error) throw new Error(error.message)
      return data || []
    },
  })

  // Fetch the unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc("get_unread_count")
      if (error) throw new Error(error.message)
      return data || 0
    },
  })

  // Mutation to mark a single notification as read
  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("mark_read", { p_id: id })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      // Instantly refresh the UI when successfully marked as read
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      })
    },
  })

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: (id: number) => markReadMutation.mutate(id),
  }
}
