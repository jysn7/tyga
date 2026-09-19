// hooks/client/use-enroll.ts
"use client"

import { useMutation } from "@tanstack/react-query"

type EnrollResponse = {
  authorization_url: string
  reference: string
  enrollment_id: number
  invoice_id: number
}

function getErrorMessage(value: unknown): string | undefined {
  if (typeof value === "object" && value !== null && "error" in value) {
    const error = value.error
    return typeof error === "string" ? error : undefined
  }
  return undefined
}

export function useEnroll() {
  return useMutation({
    mutationFn: async ({
      memberId,
      programmeId,
    }: {
      memberId: number
      programmeId: number
    }) => {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, programmeId }),
      })

      const text = await res.text()
      let data: unknown = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        console.error("Non-JSON response from /api/enroll:", text)
        throw new Error(`Server error (${res.status})`)
      }

      if (!res.ok) {
        throw new Error(
          getErrorMessage(data) || `Request failed (${res.status})`
        )
      }

      return data as EnrollResponse
    },
  })
}
