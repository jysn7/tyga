"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Keyboard } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { ShortcutsContent } from "./shortcuts-content"

export function ShortcutsModal() {
  const open = useAppStore((s) => s.shortcutsOpen)
  const setOpen = useAppStore((s) => s.setShortcutsOpen)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto p-0 md:w-[820px] md:max-w-[820px] md:min-w-[820px] lg:w-[960px] lg:max-w-[960px] lg:min-w-[960px]">
        <DialogHeader className="border-b border-border/60 px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Keyboard
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.75}
            />
            <DialogTitle>Keyboard shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Save time by keeping your hands on the keyboard.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <ShortcutsContent />
        </div>
      </DialogContent>
    </Dialog>
  )
}
