"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { toast } from "@/components/ui/toast"
// Corrected import path to match your folder structure
import { EnrollButton } from "@/components/portals/shared/enroll-button"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasShownToastRef = useRef(false)

  useEffect(() => {
    if (hasShownToastRef.current) return

    if (searchParams.get("toast") !== "auth-success") return

    hasShownToastRef.current = true

    toast.add({
      title: "Welcome back! 🎉",
      description: "You've been signed in successfully.",
      type: "success",
    })

    router.replace("/dashboard")
  }, [router, searchParams])

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="max-w-sm rounded-xl border bg-card p-6 shadow">
        <h2 className="mb-2 font-semibold">Test Paystack Integration</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Clicking this will trigger the API route and redirect you to the
          secure checkout.
        </p>

        <EnrollButton
          memberId={1}
          programmeId={1}
          email="emmanueladenegan@gmail.com"
          amount={500}
        />
      </div>
    </div>
  )
}
