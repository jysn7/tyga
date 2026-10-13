"use client"

import { useState } from "react"
import { Loader2, Plus, Save, X } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { fieldStyles, Field } from "@/components/portals/shared/field"
import {
  useSiteContent,
  useUpdateSiteContent,
  type SiteContent,
} from "@/hooks/admin/marketing/use-site-content"

function createSiteContentState(data?: SiteContent | null) {
  return {
    heroEyebrow: data?.hero_eyebrow ?? "",
    heroHeading: data?.hero_heading ?? "",
    heroSummary: data?.hero_summary ?? "",
    heroCtaLabel: data?.hero_cta_label ?? "",
    heroCtaUrl: data?.hero_cta_url ?? "",
    homepageIntro: data?.homepage_intro ?? "",
    statements: data?.marketing_statements ?? [],
    location: data?.location ?? "",
    parentPortalUrl: data?.parent_portal_url ?? "",
    socials: data?.social_links ?? {},
    seoTitle: data?.seo_title ?? "",
    seoDescription: data?.seo_description ?? "",
  }
}

function SiteContentSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 animate-pulse rounded-md bg-muted" />
        <div className="h-20 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-20 animate-pulse rounded-md bg-muted" />
        <div className="h-10 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}

function SiteContentEditor({ data }: { data?: SiteContent | null }) {
  const update = useUpdateSiteContent()

  const [heroEyebrow, setHeroEyebrow] = useState(
    () => createSiteContentState(data).heroEyebrow
  )
  const [heroHeading, setHeroHeading] = useState(
    () => createSiteContentState(data).heroHeading
  )
  const [heroSummary, setHeroSummary] = useState(
    () => createSiteContentState(data).heroSummary
  )
  const [heroCtaLabel, setHeroCtaLabel] = useState(
    () => createSiteContentState(data).heroCtaLabel
  )
  const [heroCtaUrl, setHeroCtaUrl] = useState(
    () => createSiteContentState(data).heroCtaUrl
  )
  const [homepageIntro, setHomepageIntro] = useState(
    () => createSiteContentState(data).homepageIntro
  )
  const [statements, setStatements] = useState<string[]>(
    () => createSiteContentState(data).statements
  )
  const [location, setLocation] = useState(
    () => createSiteContentState(data).location
  )
  const [parentPortalUrl, setParentPortalUrl] = useState(
    () => createSiteContentState(data).parentPortalUrl
  )
  const [socials, setSocials] = useState<Record<string, string>>(
    () => createSiteContentState(data).socials
  )
  const [seoTitle, setSeoTitle] = useState(
    () => createSiteContentState(data).seoTitle
  )
  const [seoDescription, setSeoDescription] = useState(
    () => createSiteContentState(data).seoDescription
  )

  async function handleSave() {
    try {
      await update.mutateAsync({
        heroEyebrow,
        heroHeading,
        heroSummary,
        heroCtaLabel,
        heroCtaUrl,
        homepageIntro,
        marketingStatements: statements.filter((s) => s.trim() !== ""),
        location,
        parentPortalUrl,
        socialLinks: Object.fromEntries(
          Object.entries(socials).filter(([, v]) => v.trim() !== "")
        ) as never,
        seoTitle,
        seoDescription,
      })
      toast.add({
        title: "Site content saved",
        type: "success",
        timeout: 4000,
      })
    } catch (err) {
      toast.add({
        title: "Failed to save",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Hero
          </h2>
          <p className="text-xs text-muted-foreground">
            Main introduction area at the top of the homepage
          </p>
        </div>

        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Eyebrow">
              <Input
                value={heroEyebrow}
                onChange={(e) => setHeroEyebrow(e.target.value)}
                placeholder="Ages 4–18"
                className={fieldStyles}
              />
            </Field>

            <Field label="CTA label">
              <Input
                value={heroCtaLabel}
                onChange={(e) => setHeroCtaLabel(e.target.value)}
                placeholder="Enrol now"
                className={fieldStyles}
              />
            </Field>
          </div>

          <Field label="Heading">
            <Input
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              placeholder="Where young golfers grow"
              className={fieldStyles}
            />
          </Field>

          <Field label="Summary">
            <Textarea
              value={heroSummary}
              onChange={(e) => setHeroSummary(e.target.value)}
              rows={3}
              className={`${fieldStyles} min-h-[80px] resize-none py-2`}
            />
          </Field>

          <Field label="CTA URL">
            <Input
              value={heroCtaUrl}
              onChange={(e) => setHeroCtaUrl(e.target.value)}
              placeholder="/enrol"
              className={fieldStyles}
            />
          </Field>
        </div>
      </section>

      {/* Homepage Copy Section */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Homepage copy
          </h2>
          <p className="text-xs text-muted-foreground">
            Introductory text and key marketing highlights
          </p>
        </div>

        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field label="Intro">
            <Textarea
              value={homepageIntro}
              onChange={(e) => setHomepageIntro(e.target.value)}
              rows={3}
              className={`${fieldStyles} min-h-[80px] resize-none py-2`}
            />
          </Field>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                Marketing statements
              </span>
              <button
                type="button"
                onClick={() => setStatements((p) => [...p, ""])}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" strokeWidth={1.75} />
                Add statement
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {statements.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={s}
                    onChange={(e) =>
                      setStatements((prev) =>
                        prev.map((x, idx) => (idx === i ? e.target.value : x))
                      )
                    }
                    placeholder="e.g. Small group sizes"
                    className={fieldStyles}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setStatements((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Links Section */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Contact & links
          </h2>
          <p className="text-xs text-muted-foreground">
            Location information, portal links, and social channels
          </p>
        </div>

        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Location">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cape Town"
                className={fieldStyles}
              />
            </Field>

            <Field label="Parent portal URL">
              <Input
                value={parentPortalUrl}
                onChange={(e) => setParentPortalUrl(e.target.value)}
                placeholder="https://portal.tyga.academy"
                className={fieldStyles}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            {["facebook", "instagram", "tiktok", "x", "youtube"].map(
              (platform) => (
                <Field key={platform} label={platform} className="capitalize">
                  <Input
                    value={socials[platform] ?? ""}
                    onChange={(e) =>
                      setSocials((prev) => ({
                        ...prev,
                        [platform]: e.target.value,
                      }))
                    }
                    placeholder={`https://${platform}.com/tyga`}
                    className={fieldStyles}
                  />
                </Field>
              )
            )}
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            SEO
          </h2>
          <p className="text-xs text-muted-foreground">
            Search engine optimization titles and metadata descriptions
          </p>
        </div>

        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field label="Title">
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="TYGA — Youth Golf Academy"
              className={fieldStyles}
            />
          </Field>

          <Field
            label="Description"
            hint={`${seoDescription.length} / 160 characters`}
          >
            <Textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              maxLength={160}
              className={`${fieldStyles} min-h-[70px] resize-none py-2`}
            />
          </Field>
        </div>
      </section>

      {/* Action Bar */}
      <div className="flex items-center justify-end">
        <Button
          size="sm"
          className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
          disabled={update.isPending}
          onClick={handleSave}
        >
          {update.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
          )}
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  )
}

export default function SiteContentPage() {
  const { data, isLoading } = useSiteContent()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Site Content"
        description="Homepage copy, contact details, and SEO"
      />
      {isLoading ? (
        <SiteContentSkeleton />
      ) : (
        <SiteContentEditor key={JSON.stringify(data ?? null)} data={data} />
      )}
    </div>
  )
}
