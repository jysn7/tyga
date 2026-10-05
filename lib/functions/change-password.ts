import { createClient } from "@/utils/supabase/client"

export async function changeMyPassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string
  newPassword: string
}) {
  const supabase = createClient()

  // 1. Get the current user's email so we can re-authenticate.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user?.email) {
    throw new Error("Not authenticated")
  }

  // 2. Verify the current password by signing in with it.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) {
    throw new Error("Current password is incorrect")
  }

  // 3. Apply the new password.
  const { data, error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (updateError) {
    throw new Error(updateError.message)
  }

  // Guard against a crossed session (shouldn't happen, but cheap insurance).
  if (data.user?.id !== user.id) {
    throw new Error("Session mismatch — please sign in again")
  }
}
