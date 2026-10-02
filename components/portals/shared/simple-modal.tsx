"use client"

import type { ReactNode } from "react"

type SimpleModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

// A minimal pop-up. Modals are for CREATING things (per the team's rule).
// Swap this for the team's shared modal later if one exists.
export function SimpleModal({ open, title, onClose, children }: SimpleModalProps) {
  if (!open) return null

  return (
    // Clicking the dark backdrop closes the modal...
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      {/* ...but clicking inside the white box must not, so we stop the click here */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
