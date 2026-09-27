"use client"

import Link from "next/link"
import { AlertCircle, Lock, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SensitiveAccessModal } from "@/components/portals/shared/sensitive-access-modal"

export function SensitiveGate({
  memberName,
  modalOpen,
  setModalOpen,
  onConfirm,
  isPending,
  onRequest,
}: {
  memberName: string
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  onConfirm: (reason: string) => void
  isPending: boolean
  onRequest: () => void
}) {
  return (
    <>
      <div className="mx-auto flex max-w-md flex-col gap-6 py-16">
        <div className="flex flex-col items-center gap-4 rounded-xl bg-secondary p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
            <Lock
              className="h-5 w-5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Sensitive data
            </h1>
            <p className="text-xs leading-relaxed text-muted-foreground">
              This page contains medical, personal, and emergency contact
              information. To view it, you must provide a reason for access.
              Every access is logged.
            </p>
          </div>
          <Button size="lg" onClick={onRequest} className="gap-2">
            <ShieldAlert className="h-3.5 w-3.5" strokeWidth={1.75} />
            Provide reason & view
          </Button>
          <Link
            href="/admin/members"
            className="text-xs text-information underline hover:text-information/70"
          >
            Back to members
          </Link>
        </div>
      </div>

      <SensitiveAccessModal
        memberName={memberName}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={onConfirm}
        isPending={isPending}
      />
    </>
  )
}

export function MemberErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-16">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-secondary p-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
          <AlertCircle
            className="h-5 w-5 text-muted-foreground"
            strokeWidth={1.75}
          />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Member not available
          </h1>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
        <Link
          href="/admin/members"
          className="mt-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Back to members
        </Link>
      </div>
    </div>
  )
}
