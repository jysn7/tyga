import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { SignInValues, SignUpValues } from "@/lib/validations/auth"

type SignUpPayload = Omit<SignUpValues, "confirmPassword">

export function useSignUp() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: SignUpPayload) => {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { full_name: values.fullName } },
      })
      if (error) throw error

      // Supabase returns an empty identities array when the email is
      // already registered, without setting `error`
      if (data.user?.identities?.length === 0) {
        throw new Error(
          "This email is already registered. Please sign in instead."
        )
      }

      return data
    },
  })
}

export function useSignIn() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: SignInValues) => {
      const { data, error } = await supabase.auth.signInWithPassword(values)
      if (error) {
        // Supabase surfaces banned/deactivated users in a few different
        // shapes depending on SDK version. Catch all of them so the user
        // gets a specific message instead of "Invalid email or password".
        const isBanned =
          error.code === "user_banned" ||
          error.code === "banned" ||
          /banned|deactivated|disabled/i.test(error.message)

        if (isBanned) {
          throw new Error(
            "This account has been deactivated. Please contact the academy if you believe this is a mistake."
          )
        }

        throw error
      }
      return data
    },
  })
}

export function useGoogleAuth() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    },
  })
}
