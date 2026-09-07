"use client"

import { useState } from "react"
import {
  CalendarPlus,
  Settings,
  Users,
  CalendarDays,
  BookOpen,
  ChevronRight,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { useUpdateProgramme } from "@/hooks/admin/programmes/use-programme-mutations"
import {
  useGetProgrammeCoaches,
  useGetSessions,
  useGetSessionModules,
} from "@/hooks/admin/programmes/use-programmes"
import type {
  AdminProgramme,
  ProgrammeType,
} from "@/hooks/admin/programmes/use-programmes"
import type { Level } from "@/hooks/admin/levels/use-levels"
import type { Venue } from "@/hooks/admin/programmes/use-venues"
import type { Coach } from "@/hooks/admin/use-coaches"
import { BasicInfoSection } from "./sections/basic-info-section"
import { CoachesSection } from "./sections/coaches-section"
import { SessionsSection } from "./sections/sessions-section"
import { CurriculumSection } from "./sections/curriculum-section"

const SECTIONS = [
  { id: "basic", label: "Basic Info", icon: Settings },
  { id: "coaches", label: "Coaches", icon: Users },
  { id: "sessions", label: "Sessions", icon: CalendarDays },
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

export function EditProgrammePanel({
  programme,
  levels,
  venues,
  coaches = [],
  open,
  onOpenChange,
}: {
  programme: AdminProgramme | null
  levels: Level[]
  venues: Venue[]
  coaches?: Coach[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [activeSection, setActiveSection] = useState<SectionId>("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Basic info fields
  const [name, setName] = useState(() => programme?.name ?? "")
  const [type, setType] = useState<string>(() => programme?.type ?? "")
  const [levelId, setLevelId] = useState(
    () => programme?.levelId?.toString() ?? ""
  )
  const [venueId, setVenueId] = useState(
    () => programme?.venueId?.toString() ?? ""
  )
  const [minAge, setMinAge] = useState(
    () => programme?.minAge?.toString() ?? ""
  )
  const [maxAge, setMaxAge] = useState(
    () => programme?.maxAge?.toString() ?? ""
  )
  const [genderRestriction, setGenderRestriction] = useState<string>(
    () => programme?.genderRestriction ?? "any"
  )
  const [recurrenceRule, setRecurrenceRule] = useState(
    () => programme?.recurrenceRule ?? ""
  )
  const [termStart, setTermStart] = useState(() => programme?.termStart ?? "")
  const [termEnd, setTermEnd] = useState(() => programme?.termEnd ?? "")
  const [price, setPrice] = useState(() => programme?.price?.toString() ?? "")
  const [capacity, setCapacity] = useState(
    () => programme?.capacity?.toString() ?? ""
  )
  const [maxRatio, setMaxRatio] = useState(
    () => programme?.maxRatio?.toString() ?? ""
  )

  const { data: assignedCoaches, refetch: refetchCoaches } =
    useGetProgrammeCoaches(programme?.id)
  const { data: sessions, refetch: refetchSessions } = useGetSessions(
    programme?.id
  )
  const { data: sessionModules, refetch: refetchModules } =
    useGetSessionModules(programme?.id)

  const updateProgramme = useUpdateProgramme()
  const isSaving = updateProgramme.isPending || isSubmitting

  const handleSaveBasic = async (data: {
    name: string
    type: string
    levelId: string
    venueId: string
    minAge: string
    maxAge: string
    genderRestriction: string
    recurrenceRule: string
    termStart: string
    termEnd: string
    price: string
    capacity: string
    maxRatio: string
  }) => {
    setIsSubmitting(true)
    const input = {
      name: data.name,
      type: data.type as ProgrammeType,
      levelId: Number(data.levelId) || null,
      venueId: Number(data.venueId),
      minAge: Number(data.minAge) || null,
      maxAge: Number(data.maxAge) || null,
      genderRestriction: data.genderRestriction as "male" | "female" | "any",
      recurrenceRule: data.recurrenceRule || null,
      termStart: data.termStart || null,
      termEnd: data.termEnd || null,
      price: data.price ? Number(data.price) : 0,
      capacity: data.capacity ? Number(data.capacity) : 0,
      maxRatio: data.maxRatio ? Number(data.maxRatio) : null,
    }
    try {
      await updateProgramme.mutateAsync({ ...input, id: programme!.id })
      toast.add({ title: "Programme updated", type: "success", timeout: 4000 })
      onOpenChange(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to update programme",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!programme) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-5xl overflow-hidden rounded-2xl border-0 bg-card p-0 shadow-2xl ring-0 sm:max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-input">
              <CalendarPlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-foreground">
                {programme.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Edit programme details
              </p>
            </div>
          </div>
        </div>

        {/* Main content: Left sidebar + Right content */}
        <div className="flex h-[75vh]">
          {/* Left sidebar - Folder-style navigation */}
          <div className="w-56 shrink-0 border-r border-border/60 p-3">
            <div className="flex flex-col gap-1">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.id
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    } `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{section.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeSection === "basic" && (
              <BasicInfoSection
                name={name}
                setName={setName}
                type={type}
                setType={setType}
                levelId={levelId}
                setLevelId={setLevelId}
                venueId={venueId}
                setVenueId={setVenueId}
                minAge={minAge}
                setMinAge={setMinAge}
                maxAge={maxAge}
                setMaxAge={setMaxAge}
                genderRestriction={genderRestriction}
                setGenderRestriction={setGenderRestriction}
                recurrenceRule={recurrenceRule}
                setRecurrenceRule={setRecurrenceRule}
                termStart={termStart}
                setTermStart={setTermStart}
                termEnd={termEnd}
                setTermEnd={setTermEnd}
                price={price}
                setPrice={setPrice}
                capacity={capacity}
                setCapacity={setCapacity}
                maxRatio={maxRatio}
                setMaxRatio={setMaxRatio}
                levels={levels}
                venues={venues}
                isSaving={isSaving}
                onSave={handleSaveBasic}
              />
            )}

            {activeSection === "coaches" && (
              <CoachesSection
                programmeId={programme.id}
                coaches={coaches}
                assignedCoaches={assignedCoaches}
                onCoachesChange={refetchCoaches}
              />
            )}

            {activeSection === "sessions" && (
              <SessionsSection
                programmeId={programme.id}
                sessions={sessions}
                onSessionsChange={refetchSessions}
              />
            )}

            {activeSection === "curriculum" && (
              <CurriculumSection
                levels={levels}
                sessions={sessions}
                sessionModules={sessionModules}
                onModulesChange={refetchModules}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
