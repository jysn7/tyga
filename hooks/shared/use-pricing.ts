import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type PriceLine = { discount_id: number; label: string; amount: number }
export type CodeStatus =
  | "applied"
  | "invalid"
  | "not_started"
  | "expired"
  | "not_applicable"
  | "used_up"
  | "better_offer"

export type PricePreview = {
  base: number
  discount_total: number
  net: number
  lines: PriceLine[]
  code_status: CodeStatus | null
  code_message: string | null
}

export const money = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n
  )

// Debounce the code in the component before passing it in, so typing doesn't call the database on every key.
export function usePreviewPrice(
  memberId: number | null,
  programmeId: number,
  promoCode: string
) {
  return useQuery({
    queryKey: [
      "price-preview",
      memberId,
      programmeId,
      promoCode.trim().toLowerCase(),
    ],
    queryFn: async (): Promise<PricePreview> => {
      const { data, error } = await createClient().rpc(
        "parent_preview_enrollment_price",
        {
          p_member_id: memberId,
          p_programme_id: programmeId,
          p_promo_code: promoCode.trim() || null,
        }
      )
      if (error) throw new Error(error.message)
      return data as PricePreview
    },
    enabled: memberId !== null && Number.isInteger(programmeId),
    staleTime: 15_000,
  })
}

export type EnrollResult = {
  enrollmentId: number
  invoiceId: number
  totalAmount: number
  discountAmount: number
  isFree: boolean // nothing to pay: skip Paystack, the place is already confirmed
}

export function useCreateEnrollment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      memberId: number
      programmeId: number
      promoCode?: string
    }): Promise<EnrollResult> => {
      const { data, error } = await createClient().rpc(
        "parent_create_enrollment",
        {
          p_member_id: input.memberId,
          p_programme_id: input.programmeId,
          p_promo_code: input.promoCode?.trim() || null,
        }
      )
      if (error) throw new Error(error.message)
      const r = (Array.isArray(data) ? data[0] : data) as {
        enrollment_id: number
        invoice_id: number
        total_amount: number
        discount_amount: number
        is_free: boolean
      }
      return {
        enrollmentId: r.enrollment_id,
        invoiceId: r.invoice_id,
        totalAmount: Number(r.total_amount),
        discountAmount: Number(r.discount_amount),
        isFree: !!r.is_free,
      }
    },
    onSuccess: () => qc.invalidateQueries(),
  })
}

export type PublicDiscount = {
  id: number
  label: string
  description: string
  amountType: "percent" | "fixed"
  amountValue: number
  conditionType: string | null
  endsOn: string | null
}

// Type matching the raw SQL response (snake_case)
type RawPublicDiscount = {
  id: number
  label: string
  description: string
  amount_type: "percent" | "fixed"
  amount_value: number | string
  condition_type: string | null
  ends_on: string | null
}

export function usePublicDiscounts() {
  return useQuery({
    queryKey: ["public-discounts"],
    queryFn: async (): Promise<PublicDiscount[]> => {
      const { data, error } = await createClient().rpc("get_public_discounts")
      if (error) throw new Error(error.message)

      return ((data as RawPublicDiscount[]) ?? []).map((d) => ({
        id: d.id,
        label: d.label,
        description: d.description,
        amountType: d.amount_type,
        amountValue: Number(d.amount_value),
        conditionType: d.condition_type,
        endsOn: d.ends_on,
      }))
    },
    staleTime: 10 * 60_000,
  })
}
