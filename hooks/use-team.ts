import { createClient } from "@supabase/supabase-js"

export type TeamMember = {
  id: number
  name: string
  role: string
  bio: string | null
  image_url: string | null
  sort_order: number
}

export function useTeam() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const getTeam = async (): Promise<TeamMember[]> => {
    const { data, error } = await supabase.rpc("admin_get_team")
    if (error) throw new Error(error.message)
    return data || []
  }

  const addTeamMember = async (
    name: string,
    role: string,
    bio: string,
    imageUrl: string,
    sortOrder: number = 0
  ) => {
    const { error } = await supabase.rpc("admin_add_team_member", {
      p_name: name,
      p_role: role,
      p_bio: bio,
      p_image_url: imageUrl,
      p_sort_order: sortOrder,
    })
    if (error) throw new Error(error.message)
  }

  const deleteTeamMember = async (id: number) => {
    const { error } = await supabase.rpc("admin_delete_team_member", {
      p_id: id,
    })
    if (error) throw new Error(error.message)
  }

  return { getTeam, addTeamMember, deleteTeamMember }
}
