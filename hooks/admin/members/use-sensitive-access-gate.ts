import { useState } from "react"
import { useLogSensitiveAccess } from "./use-member-detail"
import { toast } from "@/components/ui/toast"

export function useSensitiveAccessGate(memberId: number) {
  const [unlocked, setUnlocked] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const logAccess = useLogSensitiveAccess()

  function request() {
    if (unlocked) return
    setModalOpen(true)
  }

  async function confirm(reason: string) {
    try {
      await logAccess.mutateAsync({ memberId, reason })
      setUnlocked(true)
      setModalOpen(false)
      toast.add({
        title: "Access logged",
        description: "Sensitive data is now visible.",
        type: "success",
        timeout: 4000,
      })
    } catch (err) {
      toast.add({
        title: "Failed to log access",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  return {
    unlocked,
    modalOpen,
    setModalOpen,
    request,
    confirm,
    isPending: logAccess.isPending,
  }
}
