"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useProgrammes } from "@/hooks/admin/programmes/use-programmes"
import {
  useUpsertMarketingProgramme,
  type MarketingProgramme,
} from "@/hooks/admin/marketing/use-marketing-programmes"
import { MARKETING_VISIBILITIES } from "@/lib/validations/marketing/marketing-programme"

const inputClass =
  "h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"

export function MarketingProgrammePanel({
  open,
  onOpenChange,
  programme,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  programme: MarketingProgramme | null
}) {
  if (!open) return null

  return (
    <MarketingProgrammePanelForm
      key={programme?.id ?? "new"}
      open={open}
      onOpenChange={onOpenChange}
      programme={programme}
    />
  )
}

function MarketingProgrammePanelForm({
  open,
  onOpenChange,
  programme,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  programme: MarketingProgramme | null
}) {
  const { data: programmes } = useProgrammes({})
  const upsert = useUpsertMarketingProgramme()

  const initialValues = programme
    ? {
        programmeId: programme.programme_id?.toString() ?? "",
        displayTitle: programme.display_title,
        eyebrow: programme.eyebrow ?? "",
        summary: programme.summary ?? "",
        description: programme.description ?? "",
        bullets: programme.bullets ?? [],
        ctaLabel: programme.cta_label,
        ctaUrl: programme.cta_url ?? "",
        priceOverride: programme.price_override?.toString() ?? "",
        sortOrder: programme.sort_order.toString(),
        visibility: programme.visibility,
      }
    : {
        programmeId: "",
        displayTitle: "",
        eyebrow: "",
        summary: "",
        description: "",
        bullets: [] as string[],
        ctaLabel: "Enrol",
        ctaUrl: "",
        priceOverride: "",
        sortOrder: "0",
        visibility: "draft",
      }

  const [programmeId, setProgrammeId] = useState(initialValues.programmeId)
  const [displayTitle, setDisplayTitle] = useState(initialValues.displayTitle)
  const [eyebrow, setEyebrow] = useState(initialValues.eyebrow)
  const [summary, setSummary] = useState(initialValues.summary)
  const [description, setDescription] = useState(initialValues.description)
  const [bullets, setBullets] = useState<string[]>(initialValues.bullets)
  const [ctaLabel, setCtaLabel] = useState(initialValues.ctaLabel)
  const [ctaUrl, setCtaUrl] = useState(initialValues.ctaUrl)
  const [priceOverride, setPriceOverride] = useState(
    initialValues.priceOverride
  )
  const [sortOrder, setSortOrder] = useState(initialValues.sortOrder)
  const [visibility, setVisibility] = useState(initialValues.visibility)
  const [error, setError] = useState<string | null>(null)

  function addBullet() {
    setBullets((prev) => [...prev, ""])
  }

  function updateBullet(i: number, value: string) {
    setBullets((prev) => prev.map((b, idx) => (idx === i ? value : b)))
  }

  function removeBullet(i: number) {
    setBullets((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    setError(null)
    try {
      await upsert.mutateAsync({
        id: programme?.id,
        input: {
          programmeId: programmeId ? Number(programmeId) : null,
          displayTitle,
          eyebrow,
          summary,
          description,
          bullets: bullets.filter((b) => b.trim() !== ""),
          imageUrl: programme?.image_url ?? null,
          ctaLabel,
          ctaUrl,
          priceOverride: priceOverride === "" ? null : Number(priceOverride),
          sortOrder: Number(sortOrder) || 0,
          visibility: visibility as never,
        },
      })

      toast.add({
        title: programme ? "Card updated" : "Card created",
        type: "success",
        timeout: 4000,
      })
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      setError(message)
      toast.add({
        title: "Failed to save",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  const linkedProgramme = programmes?.find(
    (p) => p.id.toString() === programmeId
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-xl">
        <DialogHeader className="p-0 pb-6 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {programme ? "Edit programme card" : "New programme card"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">
              Linked programme
            </label>
            <Select
              value={programmeId}
              onValueChange={(v) => setProgrammeId(v ?? "")}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select a programme" />
              </SelectTrigger>
              <SelectContent>
                {(programmes ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {linkedProgramme && (
              <p className="text-[11px] text-muted-foreground">
                Price, age range, and venue will be pulled from{" "}
                <strong>{linkedProgramme.name}</strong> unless overridden below.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">
              Display title
            </label>
            <Input
              value={displayTitle}
              onChange={(e) => setDisplayTitle(e.target.value)}
              placeholder="e.g. Little Birdies"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Eyebrow</label>
            <Input
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="Ages 4–6"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Summary</label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One-line pitch"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Bullets</label>
              <button
                type="button"
                onClick={addBullet}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Plus className="h-3 w-3" strokeWidth={1.75} />
                Add bullet
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={b}
                    onChange={(e) => updateBullet(i, e.target.value)}
                    placeholder="e.g. Small group sizes"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeBullet(i)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                Price override
              </label>
              <Input
                type="number"
                min={0}
                value={priceOverride}
                onChange={(e) => setPriceOverride(e.target.value)}
                placeholder="Leave blank to use programme price"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                Sort order
              </label>
              <Input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">CTA label</label>
              <Input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                CTA URL (optional)
              </label>
              <Input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="Falls back to /programmes/[id]"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Visibility</label>
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility(v ?? "draft")}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARKETING_VISIBILITIES.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={upsert.isPending}
            className="text-xs"
          >
            {upsert.isPending
              ? "Saving..."
              : programme
                ? "Save changes"
                : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
