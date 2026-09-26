"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react"
import type { ProgrammeListItem } from "@/lib/types"

export function ProgrammeCarousel({
  programmes,
  autoScroll = true,
  intervalMs = 5000,
}: {
  programmes: ProgrammeListItem[]
  autoScroll?: boolean
  intervalMs?: number
}) {
  // Cap at 3
  const items = programmes.slice(0, 3)
  const [active, setActive] = useState(0)

  // Autoscroll — pause on hover/tab-hidden, resume on leave/visible
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!autoScroll || items.length <= 1 || paused) return

    const id = setInterval(() => {
      setActive((current) => (current + 1) % items.length)
    }, intervalMs)

    return () => clearInterval(id)
  }, [autoScroll, intervalMs, items.length, paused])

  // Pause when the tab is hidden so it doesn't spin in the background
  useEffect(() => {
    function handleVisibility() {
      setPaused(document.hidden)
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border/60 bg-card">
        <p className="text-xs text-muted-foreground">No programmes yet</p>
      </div>
    )
  }

  function goTo(index: number) {
    setActive((index + items.length) % items.length)
  }

  function next() {
    goTo(active + 1)
  }

  function prev() {
    goTo(active - 1)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Slide viewport */}
      <div
        className="group relative overflow-hidden rounded-xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {items.map((p) => (
            <ProgrammeSlide key={p.id} programme={p} />
          ))}
        </div>

        {/* Prev / Next controls */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous"
              className="absolute top-1/2 left-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </>
        )}
      </div>

      {/* Dot switcher */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-5 bg-foreground"
                  : "w-1.5 bg-foreground/25 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProgrammeSlide({ programme: p }: { programme: ProgrammeListItem }) {
  return (
    <Link
      href={`/programmes/${p.id}`}
      className="group/slide relative block h-56 w-full shrink-0 overflow-hidden"
    >
      {/* Cover image */}
      {p.imageUrl ? (
        <Image
          src={p.imageUrl}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover transition-transform duration-500 group-hover/slide:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-light">
          <GraduationCap className="h-8 w-8 text-blue" strokeWidth={1.5} />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-900/85 via-foreground/40 to-transparent" />

      {/* Level chip top-left */}
      {p.levelName && (
        <div className="absolute top-3 left-3">
          <span className="rounded-md bg-background/85 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
            {p.levelName}
          </span>
        </div>
      )}

      {/* Price top-right */}
      <div className="absolute top-3 right-3 rounded-md bg-background/85 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
        R{p.price}
        <span className="text-foreground/80">/term</span>
      </div>

      {/* Name + description pinned to bottom */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
        <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-background dark:text-foreground">
          {p.name}
        </h3>
        {p.description && (
          <p className="line-clamp-2 text-xs leading-snug text-background/75 dark:text-foreground/75">
            {p.description}
          </p>
        )}
      </div>
    </Link>
  )
}
