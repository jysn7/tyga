"use client"

import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useUploadEventImage() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop()
      const path = `${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from("event-images")
        .upload(path, file, { upsert: true })

      if (error) throw error

      const { data } = supabase.storage.from("event-images").getPublicUrl(path)
      return data.publicUrl
    },
  })
}
