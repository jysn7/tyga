"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface EnrollButtonProps {
  memberId: number
  programmeId: number
  email: string
  amount: number
  itemName?: string
}

export function EnrollButton({
  memberId,
  programmeId,
  email,
  amount,
  itemName,
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleEnrollment = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          programmeId,
          email,
          amount,
          itemName,
        }),
      })

      const data = await res.json()

      if (data.payfastUrl && data.formData) {
        // Dynamically create a hidden form to submit directly to Payfast Sandbox
        const form = document.createElement("form")
        form.method = "POST"
        form.action = data.payfastUrl

        for (const key in data.formData) {
          if (data.formData.hasOwnProperty(key)) {
            const input = document.createElement("input")
            input.type = "hidden"
            input.name = key
            input.value = data.formData[key]
            form.appendChild(input)
          }
        }

        document.body.appendChild(form)
        form.submit()
      } else {
        alert("Payment initialization failed.")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error during enrollment", error)
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleEnrollment} disabled={loading} className="w-full">
      {loading ? "Redirecting to Payfast..." : "Enroll & Pay via Payfast"}
    </Button>
  )
}
