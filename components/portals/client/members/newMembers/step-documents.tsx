"use client"

import { useRef } from "react"
import { FileText, Upload, X } from "lucide-react"
import { useMemberForm } from "@/context/new-member-form-context"
import { Label } from "@/components/ui/label"

type DocFieldName =
  | "birthCertificateFile"
  | "idCopyFile"
  | "registrationFormFile"
  | "proofOfPaymentFile"

const DOC_FIELDS: {
  name: DocFieldName
  label: string
  description: string
  required: boolean
}[] = [
  {
    name: "birthCertificateFile",
    label: "Birth certificate or ID",
    description: "Required for registration.",
    required: true,
  },
  {
    name: "idCopyFile",
    label: "Parent/guardian ID copy",
    description: "Optional if already on file.",
    required: false,
  },
  {
    name: "registrationFormFile",
    label: "Completed registration form",
    description: "Optional — upload if you have a signed physical copy.",
    required: false,
  },
  {
    name: "proofOfPaymentFile",
    label: "Proof of payment",
    description: "Optional — registration or membership fee.",
    required: false,
  },
]

function FileRow({ field }: { field: (typeof DOC_FIELDS)[number] }) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useMemberForm()
  const inputRef = useRef<HTMLInputElement>(null)

  const file = watch(field.name) as File | undefined
  const fieldError = errors[field.name]

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) {
      setValue(field.name, selected, { shouldValidate: true })
    }
  }

  function handleRemove() {
    setValue(field.name, undefined, { shouldValidate: true })
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <p className="text-xs text-muted-foreground">{field.description}</p>

      {!file ? (
        <label
          htmlFor={field.name}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <Upload className="h-4 w-4" />
          Click to upload
          <input
            ref={inputRef}
            id={field.name}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleChange}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="max-w-[220px] truncate">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {fieldError?.message && (
        <p className="text-xs text-destructive">{String(fieldError.message)}</p>
      )}
    </div>
  )
}

export function StepDocuments() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Upload the required paperwork. You can add the rest later from the
          member&apos;s profile.
        </p>
      </div>

      <div className="space-y-5">
        {DOC_FIELDS.map((field) => (
          <FileRow key={field.name} field={field} />
        ))}
      </div>
    </div>
  )
}
