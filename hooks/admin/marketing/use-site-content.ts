"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import {
  siteContentSchema,
  type SiteContentInput,
} from "@/lib/validations/marketing/site-content"

export type SiteContent = {
  id: number
  hero_eyebrow: string | null
  hero_heading: string | null
  hero_summary: string | null
  hero_cta_label: string | null
  hero_cta_url: string | null
  homepage_intro: string | null
  marketing_statements: string[]
  location: string | null
  parent_portal_url: string | null
  social_links: Record<string, string>
  seo_title: string | null
  seo_description: string | null
  updated_at: string
  updated_by: string | null
}

const KEY = "marketing-site-content"

export function useSiteContent() {
  const supabase = createClient()
  return useQuery({
    queryKey: [KEY],
    queryFn: async (): Promise<SiteContent | null> => {
      const { data, error } = await supabase.rpc("admin_get_site_content")
      if (error) throw new Error(error.message)
      return (data as SiteContent) ?? null
    },
  })
}

export function useUpdateSiteContent() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: SiteContentInput) => {
      const parsed = siteContentSchema.safeParse(input)
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid input")
      }
      const v = parsed.data

      const { error } = await supabase.rpc("admin_update_site_content", {
        p_hero_eyebrow: v.heroEyebrow || null,
        p_hero_heading: v.heroHeading || null,
        p_hero_summary: v.heroSummary || null,
        p_hero_cta_label: v.heroCtaLabel || null,
        p_hero_cta_url: v.heroCtaUrl || null,
        p_homepage_intro: v.homepageIntro || null,
        p_marketing_statements: v.marketingStatements,
        p_location: v.location || null,
        p_parent_portal_url: v.parentPortalUrl || null,
        p_social_links: v.socialLinks,
        p_seo_title: v.seoTitle || null,
        p_seo_description: v.seoDescription || null,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}
