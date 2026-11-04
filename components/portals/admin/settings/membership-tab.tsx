"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { Field, fieldStyles } from "@/components/portals/shared/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useUpdateMembershipSettings,
  type AppSettings,
} from "@/hooks/lookups/use-academy-settings"
import { SaveBar } from "@/components/portals/admin/settings/save-bar"

const INTERVALS = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
  { value: "one_time", label: "One-time" },
] as const

export function MembershipTab({ settings }: { settings: AppSettings }) {
  const router = useRouter()
  const update = useUpdateMembershipSettings()
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const [required, setRequired] = useState(settings.membershipRequired)
  const [feeAmount, setFeeAmount] = useState(
    settings.membershipFeeAmount.toString()
  )
  const [feeInterval, setFeeInterval] = useState(settings.membershipFeeInterval)
  const [feeDescription, setFeeDescription] = useState(
    settings.membershipFeeDescription ?? ""
  )
  const [planCode, setPlanCode] = useState(settings.membershipPlanCode ?? "")
  const [graceDays, setGraceDays] = useState(
    settings.membershipGraceDays.toString()
  )

  function handleSave() {
    update.mutate(
      {
        required,
        feeAmount: Number(feeAmount),
        feeInterval,
        feeDescription: feeDescription.trim() || null,
        planCode: planCode.trim() || null,
        graceDays: Number(graceDays),
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Membership settings saved",
            type: "success",
            timeout: 4000,
          })
          setSavedAt(Date.now())
          router.refresh()
        },
        onError: (err) =>
          toast.add({
            title: "Save failed",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Access */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Access
          </h2>
          <p className="text-xs text-muted-foreground">
            Whether parents must have a membership to enrol their children
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0">
            <div className="flex flex-col gap-0.5 pr-4">
              <span className="text-sm text-foreground">
                Require membership before enrolment
              </span>
              <span className="text-[11px] text-muted-foreground">
                When on, parents must subscribe before enrolling a child.
              </span>
            </div>
            <Switch checked={required} onCheckedChange={setRequired} />
          </div>
        </div>
      </section>

      {/* Fee */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Fee
          </h2>
          <p className="text-xs text-muted-foreground">
            What parents pay, and how often
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount (ZAR)">
              <Input
                className={fieldStyles}
                type="number"
                min="0"
                step="0.01"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                placeholder="100.00"
              />
            </Field>

            <Field label="Interval">
              <Select
                value={feeInterval}
                onValueChange={(value) =>
                  value !== null && setFeeInterval(value)
                }
              >
                <SelectTrigger className={fieldStyles}>
                  <SelectValue>
                    {INTERVALS.find((i) => i.value === feeInterval)?.label ??
                      "Monthly"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INTERVALS.map((i) => (
                    <SelectItem key={i.value} value={i.value}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field
            label="Description (shown to parents)"
            hint="A short line explaining what the membership unlocks"
          >
            <Input
              className={fieldStyles}
              value={feeDescription}
              onChange={(e) => setFeeDescription(e.target.value)}
              placeholder="TYGA monthly membership"
            />
          </Field>
        </div>
      </section>

      {/* Paystack */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Paystack
          </h2>
          <p className="text-xs text-muted-foreground">
            Links the fee to a recurring plan. Without a plan code, parents
            can&apos;t subscribe.
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field
            label="Plan code"
            hint="Copy from Paystack → Plans. Starts with PLN_."
          >
            <Input
              className={fieldStyles}
              value={planCode}
              onChange={(e) => setPlanCode(e.target.value)}
              placeholder="PLN_xxxxxxxxxxxxxxxx"
            />
          </Field>

          {!planCode && (
            <p className="mt-2 flex items-start gap-2 rounded-lg bg-yellow-light px-3 py-2 text-xs leading-relaxed text-foreground">
              <span className="shrink-0 font-medium">Note:</span>
              <span>
                Parents won&apos;t see a &quot;Start membership&quot; button
                until you add a plan code.
              </span>
            </p>
          )}
        </div>
      </section>

      {/* Failed payment */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Failed payments
          </h2>
          <p className="text-xs text-muted-foreground">
            What happens when a parent&apos;s card is declined
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field
            label="Grace period (days)"
            hint="How long a parent keeps access after a failed payment before losing it"
          >
            <Input
              className={fieldStyles}
              type="number"
              min="0"
              max="60"
              value={graceDays}
              onChange={(e) => setGraceDays(e.target.value)}
            />
          </Field>
        </div>
      </section>

      <SaveBar
        onSave={handleSave}
        isSaving={update.isPending}
        savedAt={savedAt}
      />
    </div>
  )
}
