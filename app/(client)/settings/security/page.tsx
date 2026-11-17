"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ShieldCheck, ShieldOff, Smartphone, Trash2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { OtpInput } from "@/components/portals/shared/auth/otp-input"
import { QrSetup } from "@/components/portals/shared/auth/qr-setup"
import {
  MAX_AUTHENTICATORS,
  NeedsMfaError,
  useCancelTotpEnrollment,
  useMfaState,
  useRemoveMfaFactor,
  useStartTotpEnrollment,
  useStepUpMfa,
  useVerifyTotpEnrollment,
  type MfaFactor,
} from "@/hooks/shared/use-mfa"

const input =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"

// ---------- confirm it's you (needed before changing authenticators) ----------
function StepUp({
  factors,
  onUnlocked,
}: {
  factors: MfaFactor[]
  onUnlocked: () => void
}) {
  const stepUp = useStepUpMfa()
  const [code, setCode] = useState("")
  const [factorId, setFactorId] = useState(factors[0]?.id ?? "")

  function submit() {
    if (code.length !== 6 || stepUp.isPending) return
    stepUp.mutate(
      { code, factorId: factorId || undefined },
      {
        onSuccess: () => {
          setCode("")
          onUnlocked()
        },
        onError: () => setCode(""),
      }
    )
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <p className="text-sm font-medium text-foreground">
        Confirm it&apos;s you
      </p>
      <p className="text-xs text-muted-foreground">
        Enter the 6-digit code from one of your authenticator apps to change
        your security settings.
      </p>

      {factors.length > 1 && (
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Which authenticator?
          <select
            value={factorId}
            onChange={(e) => setFactorId(e.target.value)}
            className={`${input} sm:w-64`}
          >
            {factors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.friendlyName}
              </option>
            ))}
          </select>
        </label>
      )}

      <OtpInput
        value={code}
        onChange={setCode}
        disabled={stepUp.isPending}
        autoFocus
        invalid={!!stepUp.error}
      />
      {stepUp.error && (
        <p role="alert" className="text-center text-xs text-destructive">
          {stepUp.error.message}
        </p>
      )}

      <Button
        type="submit"
        size="sm"
        className="self-start"
        disabled={code.length !== 6 || stepUp.isPending}
      >
        {stepUp.isPending ? "Checking..." : "Continue"}
      </Button>
    </form>
  )
}

// ---------- add an authenticator ----------
function AddAuthenticator({
  onFinished,
  onCancel,
  onNeedsCode,
}: {
  onFinished: (name: string) => void
  onCancel: () => void
  onNeedsCode: () => void
}) {
  const start = useStartTotpEnrollment()
  const verify = useVerifyTotpEnrollment()
  const cancel = useCancelTotpEnrollment()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")

  const setup = start.data
  const startError =
    start.error && !(start.error instanceof NeedsMfaError)
      ? start.error.message
      : null

  // Step 1: an optional name, so several authenticators can be told apart
  if (!setup) {
    return (
      <form
        className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4"
        onSubmit={(e) => {
          e.preventDefault()
          start.mutate(
            { friendlyName: name },
            {
              onError: (err) => {
                if (err instanceof NeedsMfaError) onNeedsCode()
              },
            }
          )
        }}
      >
        <p className="text-sm font-medium text-foreground">
          Add an authenticator
        </p>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Name (optional), for example &quot;My phone&quot;
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            className={`${input} sm:w-64`}
          />
        </label>
        {startError && (
          <p role="alert" className="text-xs text-destructive">
            {startError}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={start.isPending}>
            {start.isPending ? "Preparing..." : "Continue"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  // Step 2: scan, then confirm with a code
  return (
    <form
      className="flex flex-col gap-5 rounded-xl border border-border bg-muted/40 p-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (code.length !== 6 || verify.isPending) return
        verify.mutate(
          { factorId: setup.factorId, code },
          {
            onSuccess: async () => {
              await createClient().auth.refreshSession()
              onFinished(setup.name)
            },
            onError: () => setCode(""),
          }
        )
      }}
    >
      <QrSetup qr={setup.qr} secret={setup.secret} name={setup.name} />

      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-medium text-muted-foreground">
          Enter the 6-digit code
        </p>
        <OtpInput
          value={code}
          onChange={setCode}
          disabled={verify.isPending}
          autoFocus
          invalid={!!verify.error}
        />
        {verify.error && (
          <p role="alert" className="text-xs text-destructive">
            {verify.error.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={verify.isPending}
          onClick={() => {
            cancel.mutate(setup.factorId)
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={code.length !== 6 || verify.isPending}
        >
          {verify.isPending ? "Verifying…" : "Turn on"}
        </Button>
      </div>
    </form>
  )
}

// ---------- the page content ----------
export default function ManageMfa({
  isStaff,
  redirectTo,
}: {
  isStaff: boolean
  redirectTo?: string | null
}) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useMfaState()
  const remove = useRemoveMfaFactor(isStaff)

  const [adding, setAdding] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [forceStepUp, setForceStepUp] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  if (isLoading)
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader />
      </div>
    )
  if (error || !data) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-destructive">
          {error?.message ?? "Could not load your security settings"}
        </p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  const factors = data.factors
  const hasMfa = factors.length > 0
  const needsCode = hasMfa && (data.needsStepUp || forceStepUp)
  const lastOne = factors.length === 1
  const atLimit = factors.length >= MAX_AUTHENTICATORS
  const removeError =
    remove.error && !(remove.error instanceof NeedsMfaError)
      ? remove.error.message
      : null

  function afterChange(message: string) {
    setNotice(message)
    setAdding(false)
    setConfirmId(null)
    router.refresh() // the page and the middleware read the new state
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        {hasMfa ? (
          <ShieldCheck
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green"
            strokeWidth={1.75}
          />
        ) : (
          <ShieldOff
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
          />
        )}
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Two-factor authentication
          </h2>
          <p className="text-xs text-muted-foreground">
            {isStaff
              ? "Required for your role. After your password you enter a 6-digit code from an authenticator app."
              : "Add an extra layer of security by asking for a code from your authenticator app at sign-in. Optional, but recommended."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow">
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          <span
            className={`inline-flex h-2 w-2 rounded-full ${hasMfa ? "bg-green" : isStaff ? "bg-destructive" : "bg-muted-foreground"}`}
          />
          <span className="text-sm font-medium text-foreground">
            {hasMfa
              ? `On, with ${factors.length} authenticator${factors.length > 1 ? "s" : ""}`
              : isStaff
                ? "Required: not set up yet"
                : "Off"}
          </span>
        </div>

        {notice && (
          <p
            role="status"
            className="rounded-lg bg-green-light px-3 py-2 text-xs text-foreground"
          >
            {notice}
          </p>
        )}

        {isStaff && !hasMfa && (
          <p className="rounded-lg bg-yellow-light px-3 py-2 text-xs text-foreground">
            You need an authenticator to use the portal. Add one below to
            continue.
          </p>
        )}

        {needsCode && (
          <StepUp
            factors={factors}
            onUnlocked={() => {
              setForceStepUp(false)
              remove.reset()
            }}
          />
        )}

        {hasMfa && (
          <ul className="flex flex-col divide-y divide-border/60 rounded-lg border border-border/60">
            {factors.map((f) => (
              <li key={f.id} className="flex flex-col gap-3 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Smartphone
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {f.friendlyName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Authenticator app · added{" "}
                        {format(parseISO(f.createdAt), "d MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      needsCode || remove.isPending || (isStaff && lastOne)
                    }
                    title={
                      isStaff && lastOne
                        ? "Add another authenticator before removing this one"
                        : undefined
                    }
                    onClick={() => {
                      remove.reset()
                      setConfirmId(confirmId === f.id ? null : f.id)
                    }}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />{" "}
                    Remove
                  </Button>
                </div>

                {confirmId === f.id && (
                  <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-foreground">
                      {lastOne
                        ? "This is your only authenticator. Removing it turns two-step verification off for your account."
                        : `Remove "${f.friendlyName}"? You will still have ${factors.length - 1} other authenticator${factors.length - 1 > 1 ? "s" : ""}.`}
                    </p>
                    {removeError && (
                      <p role="alert" className="text-xs text-destructive">
                        {removeError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-destructive text-white hover:bg-destructive/90"
                        disabled={remove.isPending}
                        onClick={() =>
                          remove.mutate(f.id, {
                            onSuccess: () =>
                              afterChange(`"${f.friendlyName}" was removed.`),
                            onError: (err) => {
                              if (err instanceof NeedsMfaError)
                                setForceStepUp(true)
                            },
                          })
                        }
                      >
                        {remove.isPending ? "Removing..." : "Yes, remove"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={remove.isPending}
                        onClick={() => setConfirmId(null)}
                      >
                        Keep it
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {adding ? (
          <AddAuthenticator
            onNeedsCode={() => {
              setForceStepUp(true)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
            onFinished={(name) => {
              afterChange(`"${name}" was added. Two-step verification is on.`)
              if (!hasMfa && redirectTo) router.replace(redirectTo) // first-time setup sends you onward
            }}
          />
        ) : (
          <div className="flex flex-col items-start gap-1">
            <Button
              size="sm"
              disabled={needsCode || atLimit}
              onClick={() => {
                setNotice(null)
                setAdding(true)
              }}
            >
              {hasMfa ? "Add another authenticator" : "Set up an authenticator"}
            </Button>
            {atLimit && (
              <p className="text-xs text-muted-foreground">
                You can have up to {MAX_AUTHENTICATORS} authenticators. Remove
                one to add another.
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Tip: add a second authenticator, such as a phone and a tablet, so you
          are never locked out. If you lose all of them you cannot reset this
          yourself. Contact the academy, and an administrator will remove the
          old one after confirming who you are.
        </p>
      </div>
    </section>
  )
}
