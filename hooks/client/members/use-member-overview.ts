import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { MemberQuestionnaire } from "@/lib/types"

export type MemberOverview = {
  questionnaire: MemberQuestionnaire | null
  consents: {
    id: number
    consent_type: string
    signed: boolean
    signed_at: string | null
    document_url: string | null
  }[]
  documents: {
    id: number
    doc_type: string
    file_url: string
    uploaded_at: string
  }[]
}

export function useMemberOverview(memberId: string | number) {
  const supabase = createClient()
  const id = typeof memberId === "string" ? Number(memberId) : memberId

  return useQuery({
    queryKey: ["member-overview", id],
    enabled: Number.isFinite(id) && id > 0,
    queryFn: async (): Promise<MemberOverview> => {
      const { data, error } = await supabase.rpc("parent_get_member_overview", {
        p_member_id: id,
      })
      if (error) throw new Error(error.message)
      return data as MemberOverview
    },
    staleTime: 30_000,
  })
}
