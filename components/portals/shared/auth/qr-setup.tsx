"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Copy } from "lucide-react"
import { qrSrc } from "@/hooks/shared/use-mfa"

export function QrSetup({
  qr,
  secret,
  name,
}: {
  qr: string
  secret: string
  name?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable: the key is on screen, so it can be typed instead
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center rounded-lg bg-white p-3">
        <Image
          src={qrSrc(qr)}
          alt={`Authenticator QR code${name ? ` for ${name}` : ""}`}
          width={176}
          height={176}
          unoptimized
        />
      </div>
      <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
        Scan this code with Google Authenticator, Microsoft Authenticator,
        Authy, 1Password, or any TOTP-compatible app.
      </p>

      <div className="flex w-full max-w-xs flex-col items-center gap-2">
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Can&apos;t scan? Enter this key manually:
        </p>
        <button
          type="button"
          onClick={copySecret}
          aria-label="Copy setup key"
          className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted"
        >
          <code className="min-w-0 flex-1 truncate font-mono text-[11px] tracking-wider text-foreground">
            {secret}
          </code>
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
            {copied ? (
              <>
                <Check className="h-3 w-3" strokeWidth={2} />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" strokeWidth={1.75} />
                Copy
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  )
}
