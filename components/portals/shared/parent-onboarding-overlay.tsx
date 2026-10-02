"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { ChevronRight, Download, Share } from "lucide-react"
import { useInstallPrompt } from "@/lib/functions/use-install-prompt"

const slides = [
  {
    eyebrow: "Overview",
    title: "Everything at a glance.",
    description:
      "See your children's upcoming sessions, outstanding balances, and progress updates the moment you sign in.",
    illustration: "/onboarding/overview.svg",
  },
  {
    eyebrow: "Schedule",
    title: "Never miss a session.",
    description:
      "A shared calendar for every child in one place. View upcoming lessons, filter by programme, and sync directly to your phone.",
    illustration: "/onboarding/schedule.svg",
  },
  {
    eyebrow: "Progress",
    title: "Watch them level up.",
    description:
      "Track skill progression, see coach feedback, and celebrate milestones as your child moves through each level.",
    illustration: "/onboarding/progress.svg",
  },
  {
    eyebrow: "Programmes",
    title: "Enrol in seconds.",
    description:
      "Browse programmes, check eligibility against your child's age and level, and enrol with a single tap — no paperwork.",
    illustration: "/onboarding/programmes.svg",
  },
  {
    eyebrow: "Billing",
    title: "Payments, sorted.",
    description:
      "View invoices, settle balances, and download tax certificates. Everything you need, nothing you don't.",
    illustration: "/onboarding/billing.svg",
  },
  {
    eyebrow: "Install",
    title: "Take TYGA with you.",
    description:
      "Install the app for quick access from your home screen — check your child's schedule, pay invoices, and get updates without opening a browser.",
    illustration: "/onboarding/pwa.svg",
    isInstall: true,
  },
]

export function ParentOnboardingOverlay({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState(0)
  const { isInstalled, isIOS, canPromptInstall, promptInstall } =
    useInstallPrompt()

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  if (!open) return null

  const slide = slides[step] as (typeof slides)[number] & {
    isInstall?: boolean
  }
  const isLastStep = step === slides.length - 1
  const isInstallSlide = Boolean(slide.isInstall)

  function next() {
    if (isLastStep) {
      onClose()
      return
    }
    setStep((p) => Math.min(slides.length - 1, p + 1))
  }

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex h-svh flex-col overflow-hidden bg-background"
    >
      <div className="flex shrink-0 items-center justify-end px-6 pt-6 sm:px-10 sm:pt-8">
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-4 sm:px-10 lg:px-16">
        <div className="relative h-full w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px]">
          <Image
            key={slide.illustration}
            src={slide.illustration}
            alt=""
            fill
            priority={step === 0}
            sizes="(max-width: 640px) 280px, (max-width: 768px) 360px, (max-width: 1024px) 420px, 480px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="shrink-0 px-6 pb-8 sm:px-10 sm:pb-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col">
          <div className="flex flex-col lg:max-w-3xl">
            <span className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
              {slide.eyebrow}
            </span>

            <h2 className="mt-3 text-3xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {slide.title}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {slide.description}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-md transition-all duration-300 ${
                    i === step
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            {isInstallSlide ? (
              isInstalled ? (
                <button
                  type="button"
                  onClick={next}
                  className="group inline-flex h-11 items-center gap-1.5 rounded-md bg-pink px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  <span>Done</span>
                  <ChevronRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </button>
              ) : canPromptInstall ? (
                <button
                  type="button"
                  onClick={promptInstall}
                  className="group inline-flex h-11 items-center gap-1.5 rounded-md bg-pink px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  <Download className="h-4 w-4" strokeWidth={2} />
                  <span>Install app</span>
                </button>
              ) : isIOS ? (
                <div className="flex flex-col items-end gap-2">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    Tap <Share className="h-3.5 w-3.5" strokeWidth={2} /> then
                    Add to Home Screen
                  </p>
                  <button
                    type="button"
                    onClick={next}
                    className="text-xs font-medium text-foreground underline underline-offset-2"
                  >
                    Enter portal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={next}
                  className="group inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  <span>Enter portal</span>
                  <ChevronRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={next}
                className="group inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                <span>{isLastStep ? "Enter portal" : "Next"}</span>
                <ChevronRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
