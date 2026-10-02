"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Field, fieldStyles } from "@/components/portals/shared/field"
import {
  useUpdateAppSettings,
  type AppSettings,
} from "@/hooks/lookups/use-academy-settings"
import { SaveBar } from "./save-bar"

export function SiteTab({ settings }: { settings: AppSettings }) {
  const router = useRouter()
  const update = useUpdateAppSettings()
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const [siteName, setSiteName] = useState(settings.siteName)
  const [siteTagline, setSiteTagline] = useState(settings.siteTagline ?? "")
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "")
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl ?? "")
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor)
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail ?? "")
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone ?? "")
  const [whatsappNumber, setWhatsappNumber] = useState(
    settings.whatsappNumber ?? ""
  )
  const [termsUrl, setTermsUrl] = useState(settings.termsUrl ?? "")
  const [privacyUrl, setPrivacyUrl] = useState(settings.privacyUrl ?? "")
  const [cancellationPolicyText, setCancellationPolicyText] = useState(
    settings.cancellationPolicyText ?? ""
  )
  const [defaultConsentVersion, setDefaultConsentVersion] = useState(
    settings.defaultConsentVersion
  )

  function handleSave() {
    update.mutate(
      {
        site_name: siteName,
        site_tagline: siteTagline || null,
        logo_url: logoUrl || null,
        favicon_url: faviconUrl || null,
        primary_color: primaryColor,
        support_email: supportEmail || null,
        support_phone: supportPhone || null,
        whatsapp_number: whatsappNumber || null,
        terms_url: termsUrl || null,
        privacy_url: privacyUrl || null,
        cancellation_policy_text: cancellationPolicyText || null,
        default_consent_version: defaultConsentVersion,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Site settings saved",
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
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Branding
          </h2>
          <p className="text-xs text-muted-foreground">
            How TYGA appears in emails, exports, and PDFs
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field label="Site name">
            <Input
              className={fieldStyles}
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </Field>

          <Field label="Tagline" hint="Shown in email footers and metadata">
            <Input
              className={fieldStyles}
              value={siteTagline}
              onChange={(e) => setSiteTagline(e.target.value)}
            />
          </Field>

          <Field label="Logo URL">
            <Input
              className={fieldStyles}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>

          <Field label="Favicon URL">
            <Input
              className={fieldStyles}
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>

          <Field
            label="Primary colour"
            hint="Hex value, e.g. #1a1a1a — used in PDFs and exports"
          >
            <Input
              className={fieldStyles}
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#000000"
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Contact
          </h2>
          <p className="text-xs text-muted-foreground">
            Where parents and coaches reach the academy
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field label="Support email">
            <Input
              className={fieldStyles}
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </Field>

          <Field label="Support phone">
            <Input
              className={fieldStyles}
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
            />
          </Field>

          <Field label="WhatsApp number">
            <Input
              className={fieldStyles}
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Legal
          </h2>
          <p className="text-xs text-muted-foreground">
            Terms, privacy, and consent settings
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field label="Terms of service URL">
            <Input
              className={fieldStyles}
              value={termsUrl}
              onChange={(e) => setTermsUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>

          <Field label="Privacy policy URL">
            <Input
              className={fieldStyles}
              value={privacyUrl}
              onChange={(e) => setPrivacyUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>

          <Field
            label="Cancellation policy text"
            hint="Shown to parents when they cancel a booking"
          >
            <textarea
              value={cancellationPolicyText}
              onChange={(e) => setCancellationPolicyText(e.target.value)}
              className="min-h-24 w-full resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>

          <Field
            label="Consent version"
            hint="Bump when consent forms change, so parents can be asked to re-sign"
          >
            <Input
              className={fieldStyles}
              value={defaultConsentVersion}
              onChange={(e) => setDefaultConsentVersion(e.target.value)}
              placeholder="v1"
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
