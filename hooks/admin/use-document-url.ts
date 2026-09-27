import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useSignedDocumentUrl() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (storagePath: string): Promise<string> => {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(storagePath, 60 * 60)
      if (error || !data)
        throw new Error(error?.message ?? "Failed to sign URL")
      return data.signedUrl
    },
  })
}
