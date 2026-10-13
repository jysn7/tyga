import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export const PAGE_SIZE = 25

export type EnrollmentStatus =
  "pending" | "active" | "paused" | "withdrawn" | "cancelled" | "completed"

export type EnrollmentAction =
  "activate" | "cancel" | "pause" | "resume" | "withdraw"

export type PaymentFilter = "paid" | "unpaid" | "overdue"

export type EnrollmentSummary = {
  total: number
  active: number
  pending: number
  paused: number
  withdrawn: number
  completed: number
  cancelled: number
  refund_reviews: number
}

export type EnrollmentRow = {
  enrollment_id: number
  member_id: number
  member_name: string
  parent_name: string | null
  programme_id: number
  programme_name: string
  level_name: string | null
  status: EnrollmentStatus
  joined_at: string | null // YYYY-MM-DD
  subsidised: boolean
  invoice_id: number | null
  invoice_status: string | null // pending | paid | partially_paid | overdue | cancelled
  total_amount: number | null
  due_at: string | null
  is_overdue: boolean
  refund_review: boolean
  total_count: number
}

export type EnrollmentDetail = {
  enrollment_id: number
  status: EnrollmentStatus
  joined_at: string | null
  subsidised: boolean
  member: {
    id: number
    full_name: string
    dob: string | null
    archived: boolean
  }
  parent: {
    id: string | null
    full_name: string | null
    email: string | null
    phone: string | null
  }
  programme: {
    id: number
    name: string
    level_name: string | null
    capacity: number | null
    active_count: number
  }
  invoice: {
    id: number
    status: string
    total_amount: number | null
    due_at: string | null
    amount_paid: number
  } | null
  refund_review: boolean
  allowed_actions: EnrollmentAction[]
  history: {
    from_status: string | null
    to_status: string
    reason: string | null
    changed_by: string | null
    changed_at: string
  }[]
}

export type EnrollmentFilters = {
  status: EnrollmentStatus | null
  payment: PaymentFilter | null
  programmeId: number | null
  search: string
  page: number
}

const KEY = ["admin-enrollments"] as const

export function useEnrollmentSummary() {
  return useQuery({
    queryKey: [...KEY, "summary"],
    queryFn: async (): Promise<EnrollmentSummary> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_get_enrollment_summary")
      if (error) throw new Error(error.message)
      return data as EnrollmentSummary
    },
  })
}

export function useEnrollmentProgrammeOptions() {
  return useQuery({
    queryKey: [...KEY, "programmes"],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc(
        "admin_get_enrollment_programme_options"
      )
      if (error) throw new Error(error.message)
      return (data ?? []) as { programme_id: number; programme_name: string }[]
    },
    staleTime: 5 * 60_000,
  })
}

export function useAdminEnrollments(filters: EnrollmentFilters) {
  return useQuery({
    queryKey: [...KEY, "list", filters],
    queryFn: async (): Promise<EnrollmentRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_get_enrollments", {
        p_status: filters.status,
        p_programme_id: filters.programmeId,
        p_payment: filters.payment,
        p_search: filters.search.trim() || null,
        p_limit: PAGE_SIZE,
        p_offset: filters.page * PAGE_SIZE,
      })
      if (error) throw new Error(error.message)
      return (data ?? []) as EnrollmentRow[]
    },
    placeholderData: keepPreviousData,
  })
}

export function useEnrollmentDetail(enrollmentId: number | null) {
  return useQuery({
    queryKey: [...KEY, "detail", enrollmentId],
    queryFn: async (): Promise<EnrollmentDetail> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc(
        "admin_get_enrollment_detail",
        {
          p_enrollment_id: enrollmentId,
        }
      )
      if (error) throw new Error(error.message)
      return data as EnrollmentDetail
    },
    enabled: enrollmentId !== null,
  })
}

export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      enrollmentId: number
      action: EnrollmentAction
      reason?: string
    }) => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc(
        "admin_update_enrollment_status",
        {
          p_enrollment_id: input.enrollmentId,
          p_action: input.action,
          p_reason: input.reason?.trim() || null,
        }
      )
      if (error) throw new Error(error.message)
      return data as {
        enrollment_id: number
        status: EnrollmentStatus
        refund_review: boolean
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY })
      // schedules, rosters and notifications depend on the status
      queryClient.invalidateQueries({ queryKey: ["parent-schedule"] })
      queryClient.invalidateQueries({ queryKey: ["coach-roster"] })
    },
  })
}

export function useResolveRefundReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enrollmentId: number) => {
      const supabase = createClient()
      const { error } = await supabase.rpc("admin_resolve_refund_review", {
        p_enrollment_id: enrollmentId,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}
