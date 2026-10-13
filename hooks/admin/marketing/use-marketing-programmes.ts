"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import {
  marketingProgrammeSchema,
  type MarketingProgrammeInput,
} from "@/lib/validations/marketing/marketing-programme"

export type MarketingProgramme = {
  id: number
  programme_id: number | null
  display_title: string
  eyebrow: string | null
  summary: string | null
  description: string | null
  bullets: string[]
  image_url: string | null
  cta_label: string
  cta_url: string | null
  price_override: number | null
  sort_order: number
  visibility: "draft" | "published" | "archived"
  published_at: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

const KEY = "marketing-programmes"

export function useMarketingProgrammes() {
  const supabase = createClient()
  return useQuery({
    queryKey: [KEY],
    queryFn: async (): Promise<MarketingProgramme[]> => {
      const { data, error } = await supabase.rpc(
        "admin_get_marketing_programmes"
      )
      if (error) throw new Error(error.message)
      return (data ?? []) as MarketingProgramme[]
    },
  })
}

export function useUpsertMarketingProgramme() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id?: number
      input: MarketingProgrammeInput
    }) => {
      const parsed = marketingProgrammeSchema.safeParse(input)
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid input")
      }
      const v = parsed.data

      const { data, error } = await supabase.rpc(
        "admin_upsert_marketing_programme",
        {
          p_id: id ?? null,
          p_programme_id: v.programmeId ?? null,
          p_display_title: v.displayTitle,
          p_eyebrow: v.eyebrow || null,
          p_summary: v.summary || null,
          p_description: v.description || null,
          p_bullets: v.bullets,
          p_image_url: v.imageUrl ?? null,
          p_cta_label: v.ctaLabel,
          p_cta_url: v.ctaUrl || null,
          p_price_override: v.priceOverride ?? null,
          p_sort_order: v.sortOrder,
          p_visibility: v.visibility,
        }
      )
      if (error) throw new Error(error.message)
      return data as number
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}

export function useDeleteMarketingProgramme() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("admin_delete_marketing_programme", {
        p_id: id,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}
