"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { toast } from "@/components/ui/toast"

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

  return <div>page</div>
}
