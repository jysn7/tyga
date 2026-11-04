import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type TriggerType = "auto" | "code" | "granted"
export type ConditionType =
  "always" | "sibling" | "multi_programme" | "early_bird" | "membership"
export type DiscountStatus =
  "live" | "paused" | "scheduled" | "expired" | "used_up"

export type Discount = {
  id: number
  name: string
  publicLabel: string
  publicDescription: string | null
  triggerType: TriggerType
  conditionType: ConditionType | null
  conditionValue: number | null
  code: string | null
  amountType: "percent" | "fixed"
  amountValue: number
  programmeIds: number[] | null
  programmeTypes: string[] | null
  startsOn: string | null
  endsOn: string | null
  maxRedemptions: number | null
  maxPerAccount: number | null
  stackable: boolean
  priority: number
  active: boolean
  notes: string | null
  redemptions: number
  totalDiscounted: number
  grants: number
  status: DiscountStatus
}

export type DiscountInput = Omit<
  Discount,
  "id" | "redemptions" | "totalDiscounted" | "grants" | "status"
>

export type Usage = {
  redeemedAt: string
  accountName: string
  memberName: string
  programmeName: string
  enrollmentStatus: string
  amount: number
}

export type Grant = {
  id: number
  accountName: string | null
  memberName: string | null
  programmeName: string | null
  expiresOn: string | null
  reason: string
  grantedByName: string | null
  createdAt: string
  revokedAt: string | null
  isActive: boolean
}

const KEY = ["admin-discounts"] as const

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useDiscounts() {
  return useQuery({
    queryKey: [...KEY, "list"],
    queryFn: async (): Promise<Discount[]> => {
      const { data, error } = await createClient().rpc("admin_get_discounts")
      if (error) throw new Error(error.message)
      return (data ?? []).map((d: any) => ({
        id: d.id,
        name: d.name,
        publicLabel: d.public_label,
        publicDescription: d.public_description,
        triggerType: d.trigger_type,
        conditionType: d.condition_type,
        conditionValue: d.condition_value,
        code: d.code,
        amountType: d.amount_type,
        amountValue: Number(d.amount_value),
        programmeIds: d.programme_ids,
        programmeTypes: d.programme_types,
        startsOn: d.starts_on,
        endsOn: d.ends_on,
        maxRedemptions: d.max_redemptions,
        maxPerAccount: d.max_per_account,
        stackable: d.stackable,
        priority: d.priority,
        active: d.active,
        notes: d.notes,
        redemptions: Number(d.redemptions),
        totalDiscounted: Number(d.total_discounted),
        grants: Number(d.grants),
        status: d.status,
      }))
    },
  })
}

export function useDiscountUsage(id: number | null) {
  return useQuery({
    queryKey: [...KEY, "usage", id],
    queryFn: async (): Promise<Usage[]> => {
      const { data, error } = await createClient().rpc(
        "admin_get_discount_usage",
        { p_id: id }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map((u: any) => ({
        redeemedAt: u.redeemed_at,
        accountName: u.account_name,
        memberName: u.member_name,
        programmeName: u.programme_name,
        enrollmentStatus: u.enrollment_status,
        amount: Number(u.amount),
      }))
    },
    enabled: id !== null,
  })
}

export function useDiscountGrants(id: number | null) {
  return useQuery({
    queryKey: [...KEY, "grants", id],
    queryFn: async (): Promise<Grant[]> => {
      const { data, error } = await createClient().rpc(
        "admin_get_discount_grants",
        { p_discount_id: id }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map((g: any) => ({
        id: g.id,
        accountName: g.account_name,
        memberName: g.member_name,
        programmeName: g.programme_name,
        expiresOn: g.expires_on,
        reason: g.reason,
        grantedByName: g.granted_by_name,
        createdAt: g.created_at,
        revokedAt: g.revoked_at,
        isActive: !!g.is_active,
      }))
    },
    enabled: id !== null,
  })
}

export function useProgrammeOptions() {
  return useQuery({
    queryKey: [...KEY, "programmes"],
    queryFn: async (): Promise<
      { id: number; name: string; type: string }[]
    > => {
      // Fetch the marketing programmes so we see the public-facing titles
      const { data, error } = await createClient().rpc(
        "admin_get_marketing_programmes"
      )
      if (error) throw new Error(error.message)

      // Map to the real programme_id, which is what the engine checks against!
      return (data ?? [])
        .filter((p: any) => p.programme_id != null) // Ignore purely custom marketing rows with no linked programme
        .map((p: any) => ({
          id: p.programme_id, // <--- THE REAL ID
          name: p.display_title,
          type: p.type ?? "programme",
        }))
    },
    staleTime: 5 * 60_000,
  })
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function useRefresh() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: KEY })
}

export function useSaveDiscount() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: { id: number | null; data: DiscountInput }) => {
      const d = input.data
      const payload = {
        name: d.name,
        public_label: d.publicLabel,
        public_description: d.publicDescription,
        trigger_type: d.triggerType,
        condition_type: d.conditionType,
        condition_value: d.conditionValue,
        code: d.code,
        amount_type: d.amountType,
        amount_value: d.amountValue,
        programme_ids: d.programmeIds,
        programme_types: d.programmeTypes,
        starts_on: d.startsOn,
        ends_on: d.endsOn,
        max_redemptions: d.maxRedemptions,
        max_per_account: d.maxPerAccount,
        stackable: d.stackable,
        priority: d.priority,
        active: d.active,
        notes: d.notes,
      }
      const { data, error } = await createClient().rpc("admin_save_discount", {
        p_id: input.id,
        p_data: payload,
      })
      if (error) throw new Error(error.message)
      return data as number
    },
    onSuccess: refresh,
  })
}

export function useSetDiscountActive() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: { id: number; active: boolean }) => {
      const { error } = await createClient().rpc("admin_set_discount_active", {
        p_id: input.id,
        p_active: input.active,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: refresh,
  })
}

export function useDeleteDiscount() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await createClient().rpc("admin_delete_discount", {
        p_id: id,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: refresh,
  })
}

export function useGrantDiscount() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: {
      discountId: number
      accountId: string | null
      memberId: number | null
      programmeId: number | null
      expiresOn: string | null
      reason: string
    }) => {
      const { error } = await createClient().rpc("admin_grant_discount", {
        p_discount_id: input.discountId,
        p_account_id: input.accountId,
        p_member_id: input.memberId,
        p_programme_id: input.programmeId,
        p_expires_on: input.expiresOn,
        p_reason: input.reason,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: refresh,
  })
}

export function useRevokeGrant() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (grantId: number) => {
      const { error } = await createClient().rpc(
        "admin_revoke_discount_grant",
        { p_grant_id: grantId }
      )
      if (error) throw new Error(error.message)
    },
    onSuccess: refresh,
  })
}
