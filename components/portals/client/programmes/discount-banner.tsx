"use client"

import { useState, useEffect } from "react"
import { Tag, X } from "lucide-react"
import { usePublicDiscounts } from "@/hooks/shared/use-pricing"

// Bump this version if you add a new promo that you want everyone to see again
const BANNER_VERSION = "v1"

export function DiscountBanner() {
  const { data = [] } = usePublicDiscounts()

  // Use lazy initialization to check localStorage on the first client render
  // This avoids calling setState inside a useEffect entirely.
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem(`tyga-discount-dismissed-${BANNER_VERSION}`)
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const isVisible = !isDismissed && data.length > 0

  // Auto-advance carousel
  useEffect(() => {
    if (!isVisible || data.length < 2 || isPaused) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isVisible, data.length, isPaused])

  if (!isVisible) return null

  function dismiss() {
    setIsDismissed(true)
    localStorage.setItem(`tyga-discount-dismissed-${BANNER_VERSION}`, "true")
  }

  const currentDiscount = data[currentIndex]
  if (!currentDiscount) return null

  return (
    <div
      className="relative flex flex-col gap-3 overflow-hidden rounded-lg bg-gradient-to-r from-green/70 to-green/40 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-500 ease-in-out dark:to-green/20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative background icon for subtle texture */}
      <div className="pointer-events-none absolute -top-4 -right-4 text-secondary/30 dark:text-primary/10">
        <Tag className="h-24 w-24 rotate-12" />
      </div>

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-foreground/80 shadow-sm dark:text-primary">
            <Tag className="h-4 w-4" strokeWidth={2.5} />
          </div>

          {/* Animated Content Container */}
          <div
            key={currentDiscount.id}
            className="flex animate-in flex-col gap-0.5 duration-500 fade-in slide-in-from-bottom-2"
          >
            <span className="text-[11px] font-semibold tracking-wider text-primary uppercase">
              {currentDiscount.amountType === "percent"
                ? `Save ${currentDiscount.amountValue}%`
                : `Save R${currentDiscount.amountValue}`}
            </span>
            <p className="font-medium text-foreground">
              {currentDiscount.label}
            </p>
            <p className="text-xs text-secondary">
              {currentDiscount.description}
              {currentDiscount.endsOn &&
                ` · Ends ${new Date(currentDiscount.endsOn + "T00:00:00").toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}`}
            </p>
          </div>
        </div>

        <button
          onClick={dismiss}
          className="z-20 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Minimalist Indicators */}
      {data.length > 1 && (
        <div className="relative z-10 flex items-center gap-1.5 pl-11">
          {data.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-4 bg-primary-foreground/60 shadow-sm dark:bg-primary"
                  : "w-1.5 bg-foreground/15 hover:bg-foreground/30"
              }`}
              aria-label={`Go to discount ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
