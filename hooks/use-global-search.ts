import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type SearchResultType =
  | "member"
  | "programme"
  | "user"
  | "coach"
  | "invoice"
  | "assessment"
  | "session"
  | "event"
  | "level"
  | "module"
  | "venue"

export type SearchResult = {
  type: SearchResultType
  id: string
  title: string
  subtitle: string | null
  href: string
}

const FUNCTION_BY_ROLE = {
  parent: "parent_global_search",
  coach: "coach_global_search",
  admin: "admin_global_search",
} as const

export function useGlobalSearch(
  query: string,
  role: keyof typeof FUNCTION_BY_ROLE,
  limit = 5
) {
  const supabase = createClient()
  const [debounced, setDebounced] = useState(query.trim())

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  return useQuery({
    queryKey: ["global-search", role, debounced, limit],
    queryFn: async (): Promise<SearchResult[]> => {
      const { data, error } = await supabase.rpc(FUNCTION_BY_ROLE[role], {
        p_query: debounced,
        p_limit: limit,
      })
      if (error) throw new Error(error.message)
      return (data ?? []) as SearchResult[]
    },
    enabled: debounced.length > 1,
    staleTime: 30_000,
  })
}
