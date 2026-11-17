"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, ChevronDown, Sparkles } from "lucide-react"

import {
  useOnboardingPhase,
  useDismissChecklist,
} from "@/hooks/shared/use-onboarding-state"

import {
  STEP_CONFIG,
  getActiveMemberId,
  isMemberScopedStep,
} from "@/config/onboarding-config"

import type { OnboardingStep } from "@/hooks/shared/use-onboarding-state"

const CHECKLIST_STEPS: OnboardingStep[] = [
  "add-child",
  "book-assessment",
  "await-assessment",
  "pay-membership",
  "enrol",
]

export function OnboardingChecklist() {
  const { state, phase } = useOnboardingPhase()
  const dismiss = useDismissChecklist()
  const [expanded, setExpanded] = useState(false)

  if (phase !== "checklist" || !state) {
    return null
  }

  const rawIndex = CHECKLIST_STEPS.indexOf(state.nextStep)
  const currentIndex = rawIndex === -1 ? 0 : rawIndex
  const currentStep = STEP_CONFIG[state.nextStep]

  if (!currentStep) {
    return null
  }

  const memberId = isMemberScopedStep(state.nextStep)
    ? getActiveMemberId(state.nextStep, state)
    : undefined

  const total = CHECKLIST_STEPS.length
  const completed = currentIndex

  return (
    <section className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90" aria-hidden>
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              strokeWidth="3"
              className="stroke-muted"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(completed / total) * 94.2} 94.2`}
              className="stroke-primary transition-[stroke-dasharray] duration-500"
            />
          </svg>
          <span className="absolute text-[10px] font-semibold text-foreground tabular-nums">
            {completed}/{total}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            {expanded ? "Get started with TYGA" : currentStep.label}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {expanded
              ? `${completed} of ${total} steps complete`
              : currentStep.description}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Collapse" : "Expand"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
              strokeWidth={1.75}
            />
          </button>

          <button
            type="button"
            onClick={() => dismiss.mutate()}
            disabled={dismiss.isPending}
            title="Dismiss"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="text-[11px] font-medium">Skip</span>
          </button>
        </div>
      </div>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <div className="flex flex-col border-t border-border/40 px-4 pt-3 pb-4">
            <div className="flex flex-col">
              {CHECKLIST_STEPS.map((step, i) => {
                const config = STEP_CONFIG[step]

                if (!config) return null

                const isDone = i < completed
                const isCurrent = i === completed
                const isFuture = i > completed

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 py-2 ${
                      isFuture ? "opacity-40" : ""
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                            ? "border-2 border-primary"
                            : "border border-border"
                      }`}
                    >
                      {isDone && (
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      )}
                    </div>

                    <span
                      className={`flex-1 text-xs ${
                        isCurrent
                          ? "font-medium text-foreground"
                          : isDone
                            ? "text-muted-foreground line-through"
                            : "text-muted-foreground"
                      }`}
                    >
                      {config.label}
                    </span>

                    {isCurrent && (
                      <Sparkles
                        className="h-3 w-3 shrink-0 text-primary"
                        strokeWidth={1.75}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <Link
              href={currentStep.href(memberId)}
              className="group mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90"
            >
              <span>{currentStep.ctaLabel}</span>
              <ArrowRight
                className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
