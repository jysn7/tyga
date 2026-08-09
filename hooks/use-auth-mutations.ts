import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { SignInValues, SignUpValues } from "@/lib/validations/auth"

export function useSignUp() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: SignUpValues) => {
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
      if (error) throw error
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
