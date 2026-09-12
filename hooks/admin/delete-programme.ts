import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useDeleteProgramme() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (programmeId: number) => {
      const { error } = await supabase
        .from("programmes")
        .delete()
        .eq("id", programmeId)
      if (error) {
        if ((error as { code?: string }).code === "23503") {
          throw new Error(
            "Can't delete: this programme still has enrollments or other linked records."
          )
        }
        throw error
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-programmes"] }),
  })
}
