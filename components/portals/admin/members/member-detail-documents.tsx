"use client"

import { format } from "date-fns"
import { ExternalLink, Loader2 } from "lucide-react"
import { Section } from "./member-detail-sections"
import { EmptyCard } from "./member-detail-sections"
import { useSignedDocumentUrl } from "@/hooks/admin/use-document-url"

export function DocumentRow({
  doc,
}: {
  doc: { id: number; doc_type: string; file_url: string; uploaded_at: string }
}) {
  const signUrl = useSignedDocumentUrl()

  async function handleOpen() {
    if (doc.file_url.startsWith("http")) {
      window.open(doc.file_url, "_blank", "noopener,noreferrer")
      return
    }
    try {
      const url = await signUrl.mutateAsync(doc.file_url)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch {
      // handled by caller
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-foreground capitalize">
          {doc.doc_type.replace(/_/g, " ")}
        </span>
        <span className="text-xs text-muted-foreground">
          Uploaded {format(new Date(doc.uploaded_at), "d MMM yyyy, HH:mm")}
        </span>
      </div>
      <button
        type="button"
        onClick={handleOpen}
        disabled={signUrl.isPending}
        className="flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-input px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-40"
      >
        {signUrl.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
        ) : (
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
        Open
      </button>
    </div>
  )
}

export function DocumentsTab({
  documents,
}: {
  documents: {
    id: number
    doc_type: string
    file_url: string
    uploaded_at: string
  }[]
}) {
  if (documents.length === 0) {
    return (
      <EmptyCard
        title="No documents"
        description="No files have been uploaded for this member yet."
      />
    )
  }
  return (
    <Section
      title="Uploaded documents"
      description="Files stored in the documents bucket."
    >
      <div className="flex flex-col">
        {documents.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} />
        ))}
      </div>
    </Section>
  )
}
