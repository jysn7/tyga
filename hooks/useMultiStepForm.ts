import { useState } from "react"
import type { FieldValues, Path, UseFormTrigger } from "react-hook-form"

export function useMultiStepForm<T extends FieldValues>(
  totalSteps: number,
  stepFields: Record<number, Path<T>[]>,
  trigger: UseFormTrigger<T>
) {
  const [step, setStep] = useState(0)
  const isLastStep = step === totalSteps - 1

  async function next() {
    const fields = stepFields[step] ?? []
    const valid = fields.length > 0 ? await trigger(fields) : true
    if (!valid) return false

    if (!isLastStep) setStep((s) => s + 1)
    return true
  }

  function back() {
    setStep((s) => Math.max(0, s - 1))
  }

  return { step, isLastStep, next, back, setStep }
}
