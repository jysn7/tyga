"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { toast } from "@/components/ui/toast"
import { useUpdateMember } from "@/hooks/client/members/use-member-mutations"
import {
  memberEditSchema,
  type MemberEditValues,
} from "@/lib/validations/member"

const triggerStyles =
  "h-auto w-full justify-start border-none bg-transparent pl-2 text-[15px] font-normal text-foreground shadow-none hover:bg-transparent"

function Field({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 border-b border-border/60 pb-6 last:border-b-0 last:pb-0">
      <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

// Minimal shape the panel needs — matches MemberDetail["member"]
export type EditableMember = {
  id: number
  full_name: string
  dob: string
  gender: "male" | "female" | "any"
  medical_notes: string | null
  medical_aid_details: string | null
  doctor_contact: string | null
  emergency_contact_name: string | null
  emergency_contact_relationship: string | null
  emergency_contact_phone: string | null
  school_name: string | null
  school_grade: string | null
  id_or_birth_cert_number: string | null
  previous_club: string | null
  kit_size_top: string | null
  kit_size_bottom: string | null
  shoe_size: string | null
}

function toDefaultValues(member: EditableMember): MemberEditValues {
  return {
    fullName: member.full_name,
    dob: new Date(member.dob),
    gender: member.gender,
    medicalNotes: member.medical_notes ?? "",
    medicalAidDetails: member.medical_aid_details ?? "",
    doctorContact: member.doctor_contact ?? "",
    emergencyContactName: member.emergency_contact_name ?? "",
    emergencyContactRelationship: member.emergency_contact_relationship ?? "",
    emergencyContactPhone: member.emergency_contact_phone ?? "",
    schoolName: member.school_name ?? "",
    schoolGrade: member.school_grade ?? "",
    previousClub: member.previous_club ?? "",
    kitSizeTop: member.kit_size_top ?? "",
    kitSizeBottom: member.kit_size_bottom ?? "",
    shoeSize: member.shoe_size ?? "",
  }
}

interface EditMemberPanelProps {
  member: EditableMember
  /** Optional controlled open state. When omitted, the panel manages its own. */
  open?: boolean
  /** Optional controlled open setter. Pair with `open`. */
  onOpenChange?: (open: boolean) => void
  /**
   * When true, the built-in trigger button is not rendered.
   * Use this when an external control (e.g. a dropdown menu) opens the panel.
   */
  hideTrigger?: boolean
}

export function EditMemberPanel({
  member,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
}: EditMemberPanelProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled
    ? (controlledOnOpenChange ?? (() => {}))
    : setUncontrolledOpen

  const updateMember = useUpdateMember(member.id)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MemberEditValues>({
    resolver: zodResolver(memberEditSchema),
    defaultValues: toDefaultValues(member),
  })

  useEffect(() => {
    if (open) {
      reset(toDefaultValues(member))
    }
  }, [open, member, reset])

  const onSubmit = async (values: MemberEditValues) => {
    const toastId = "update-member-status"

    toast.add({
      id: toastId,
      title: "Saving changes...",
      description: "Please wait",
      type: "loading",
      timeout: 0,
    })

    try {
      await updateMember.mutateAsync(values)

      toast.add({
        id: toastId,
        title: "Member updated",
        description: `${values.fullName}'s details have been saved.`,
        type: "success",
        timeout: 5000,
      })

      setOpen(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong"

      toast.add({
        id: toastId,
        title: "Update failed",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <>
      {!hideTrigger && (
        <Button
          variant="secondary"
          className="w-full md:w-fit"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      )}

      <SidePanel
        open={open}
        onOpenChange={setOpen}
        title="Edit member"
        footer={
          <Button
            type="submit"
            form="edit-member-form"
            disabled={updateMember.isPending}
            className="w-full rounded-lg text-xs font-medium"
          >
            {updateMember.isPending ? "Saving..." : "Save changes"}
          </Button>
        }
      >
        <form
          id="edit-member-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {/* Identity */}
          <Section title="Identity">
            <Field label="Full name" error={errors.fullName?.message}>
              <Input {...register("fullName")} />
            </Field>

            <Field label="Date of birth" error={errors.dob?.message}>
              <Controller
                control={control}
                name="dob"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-9 w-full items-center gap-2 rounded-md border border-border bg-input px-2.5 text-sm text-foreground transition-colors hover:bg-accent/40 focus-visible:border-primary focus-visible:outline-none data-[state=open]:border-primary"
                      >
                        <CalendarIcon
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                        {field.value ? (
                          <span>{format(field.value, "PPP")}</span>
                        ) : (
                          <span className="text-muted-foreground">
                            Select date
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto border-border/60 p-0 shadow-md"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        captionLayout="dropdown"
                        startMonth={new Date(2005, 0, 1)}
                        endMonth={new Date(new Date().getFullYear(), 11, 31)}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </Field>

            <Field label="Gender" error={errors.gender?.message}>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </Section>

          {/* School */}
          <Section title="School">
            <Field label="School name">
              <Input {...register("schoolName")} />
            </Field>

            <Field label="School grade">
              <Input {...register("schoolGrade")} />
            </Field>

            <Field label="Previous team / club">
              <Input {...register("previousClub")} />
            </Field>
          </Section>

          {/* Emergency contact */}
          <Section title="Emergency contact">
            <Field
              label="Contact name"
              error={errors.emergencyContactName?.message}
            >
              <Input {...register("emergencyContactName")} />
            </Field>

            <Field
              label="Relationship to member"
              error={errors.emergencyContactRelationship?.message}
            >
              <Input {...register("emergencyContactRelationship")} />
            </Field>

            <Field
              label="Contact phone"
              error={errors.emergencyContactPhone?.message}
            >
              <Input type="tel" {...register("emergencyContactPhone")} />
            </Field>
          </Section>

          {/* Medical */}
          <Section title="Medical">
            <Field label="Medical notes">
              <Textarea
                className="min-h-20 resize-none"
                {...register("medicalNotes")}
              />
            </Field>

            <Field label="Medical aid details">
              <Input {...register("medicalAidDetails")} />
            </Field>

            <Field label="Doctor contact">
              <Input {...register("doctorContact")} />
            </Field>
          </Section>

          {/* Kit */}
          <Section title="Kit & sizes">
            <Field label="Kit size (top)">
              <Input {...register("kitSizeTop")} />
            </Field>

            <Field label="Kit size (bottom)">
              <Input {...register("kitSizeBottom")} />
            </Field>

            <Field label="Shoe size">
              <Input {...register("shoeSize")} />
            </Field>
          </Section>
        </form>
      </SidePanel>
    </>
  )
}
