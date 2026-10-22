"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { submitPublicTicket } from "@/lib/functions/support"
import { TICKET_CATEGORIES } from "@/lib/constants/support"

const input =
  "rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"

export function PublicContactForm({ privacyUrl }: { privacyUrl?: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "enrolment",
    subject: "",
    body: "",
    website: "",
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<number | null>(null)

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const res = await submitPublicTicket(form)
    setBusy(false)
    if (res.error) return setError(res.error)
    setDone(res.id ?? 0)
  }

  if (done !== null) {
    return (
      <div
        className="flex flex-col items-center gap-2 rounded-2xl bg-card p-8 text-center shadow"
        role="status"
      >
        <CheckCircle2 className="h-8 w-8 text-green" strokeWidth={1.75} />
        <h2 className="text-lg font-semibold text-foreground">
          Thank you, we got your message
        </h2>
        <p className="text-sm text-muted-foreground">
          We have emailed you a confirmation
          {done ? ` (reference #${done})` : ""} and will reply within one
          working day.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Your name"
          aria-label="Your name"
          value={form.name}
          onChange={set("name")}
          maxLength={100}
          className={input}
        />
        <input
          required
          type="email"
          placeholder="Email"
          aria-label="Email"
          value={form.email}
          onChange={set("email")}
          className={input}
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          aria-label="Phone"
          value={form.phone}
          onChange={set("phone")}
          maxLength={30}
          className={input}
        />
        <select
          aria-label="Topic"
          value={form.category}
          onChange={set("category")}
          className={input}
        >
          {TICKET_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <input
        required
        placeholder="Subject"
        aria-label="Subject"
        value={form.subject}
        onChange={set("subject")}
        maxLength={150}
        className={input}
      />
      <textarea
        required
        rows={5}
        placeholder="How can we help?"
        aria-label="Message"
        value={form.body}
        onChange={set("body")}
        maxLength={4000}
        className={input}
      />

      {/* honeypot: hidden from people, visible to bots */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set("website")}
          />
        </label>
      </div>

      <p className="text-[11px] text-muted-foreground">
        We use your details only to answer you. Please do not send ID numbers or
        medical details.
        {privacyUrl && (
          <>
            {" "}
            <a href={privacyUrl} className="underline">
              Privacy policy
            </a>
            .
          </>
        )}
      </p>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="h-11 rounded-xl bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 sm:self-start"
      >
        {busy ? "Sending..." : "Send message"}
      </button>
    </form>
  )
}
