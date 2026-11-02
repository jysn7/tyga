import { createClient } from "@/utils/supabase/client"

export async function uploadEventImage(file: File) {
  const supabase = createClient()

  // 1. Create a unique file name (e.g., 1698765432-my-image.jpg)
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  // 2. Upload the file to the 'event-images' bucket
  const { error: uploadError } = await supabase.storage
    .from("event-images")
    .upload(filePath, file)

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  // 3. Get the public URL
  const { data } = supabase.storage.from("event-images").getPublicUrl(filePath)

  return data.publicUrl
}
