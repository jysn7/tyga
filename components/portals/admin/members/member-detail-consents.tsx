"use client"

import { format } from "date-fns"
import { CheckCircle2, ExternalLink, XCircle } from "lucide-react"
import { EmptyCard, Section } from "./member-detail-sections"

export function ConsentsTab({
  consents,
}: {
  consents: {
    id: number
    consent_type: string
    signed: boolean
    signed_at: string | null
    document_url: string | null
  }[]
}) {
  if (consents.length === 0) {
    return (
      <EmptyCard
        title="No consents recorded"
        description="No consents have been signed for this member."
      />
    )
  }
  return (
    <Section
      title="Consents"
      description="POPIA consent records with timestamps."
    >
      <div className="flex flex-col">
        {consents.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-input">
                {c.signed ? (
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-primary"
                    strokeWidth={1.75}
                  />
                ) : (
                  <XCircle
                    className="h-3.5 w-3.5 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-foreground capitalize">
                  {c.consent_type.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {c.signed
                    ? c.signed_at
                      ? `Signed ${format(new Date(c.signed_at), "d MMM yyyy, HH:mm")}`
                      : "Signed"
                    : "Not signed"}
                </span>
              </div>
            </div>
            {c.document_url && (
              <a
                href={c.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-input px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                View
              </a>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}
