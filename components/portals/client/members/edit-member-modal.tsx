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
    <div className="flex flex-col gap-1.5 border-b border-border/60 py-3 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}

const fieldStyles =
  "h-auto border-none bg-muted py-2 pl-2 shadow-none text-[15px] text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50"

const triggerStyles =
  "h-auto w-full justify-start border-none bg-transparent pl-2 text-[15px] font-normal text-foreground shadow-none hover:bg-transparent"

export type EditableMember = {
  id: number | string
  fullName: string
  dob: string
  gender: "male" | "female" | "any"
  medicalNotes: string | null
  medicalAidDetails: string | null
  doctorContact: string | null
  emergencyContactName: string | null
  emergencyContactRelationship: string | null
  emergencyContactPhone: string | null
  schoolName: string | null
  schoolGrade: string | null
  idOrBirthCertNumber: string | null
  previousClub: string | null
  kitSizeTop: string | null
  kitSizeBottom: string | null
  shoeSize: string | null
}

function toDefaultValues(member: EditableMember): MemberEditValues {
  return {
    fullName: member.fullName,
    dob: new Date(member.dob),
    gender: member.gender,
    medicalNotes: member.medicalNotes ?? "",
    medicalAidDetails: member.medicalAidDetails ?? "",
    doctorContact: member.doctorContact ?? "",
    emergencyContactName: member.emergencyContactName ?? "",
    emergencyContactRelationship: member.emergencyContactRelationship ?? "",
    emergencyContactPhone: member.emergencyContactPhone ?? "",
    schoolName: member.schoolName ?? "",
    schoolGrade: member.schoolGrade ?? "",
    idOrBirthCertNumber: member.idOrBirthCertNumber ?? "",
    previousClub: member.previousClub ?? "",
    kitSizeTop: member.kitSizeTop ?? "",
    kitSizeBottom: member.kitSizeBottom ?? "",
    shoeSize: member.shoeSize ?? "",
  }
}

export function EditMemberPanel({ member }: { member: EditableMember }) {
  const [open, setOpen] = useState(false)
  const updateMember = useUpdateMember(Number(member.id))

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
      <Button
        variant="secondary"
        size="sm"
        className="gap-1.5 rounded-md text-xs font-medium"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>

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
          className="flex flex-col"
        >
          <Field label="Full name" error={errors.fullName?.message}>
            <Input {...register("fullName")} />
          </Field>

          <Field
            label="Date of birth"
            error={errors.dob?.message as string | undefined}
          >
            <Controller
              control={control}
              name="dob"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 py-1 text-[15px] text-foreground"
                    >
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      {field.value ? format(field.value, "PPP") : "Select date"}
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
                  <SelectTrigger className={triggerStyles}>
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

          <Field label="School name">
            <Input {...register("schoolName")} />
          </Field>

          <Field label="School grade">
            <Input {...register("schoolGrade")} />
          </Field>

          <Field label="ID / birth certificate number">
            <Input disabled {...register("idOrBirthCertNumber")} />
          </Field>

          <Field label="Previous team / club">
            <Input {...register("previousClub")} />
          </Field>

          <Field
            label="Emergency contact name"
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
            label="Emergency contact phone"
            error={errors.emergencyContactPhone?.message}
          >
            <Input type="tel" {...register("emergencyContactPhone")} />
          </Field>

          <Field label="Medical notes">
            <Textarea
              className={`${fieldStyles} min-h-20 resize-none`}
              {...register("medicalNotes")}
            />
          </Field>

          <Field label="Medical aid details">
            <Input {...register("medicalAidDetails")} />
          </Field>

          <Field label="Doctor contact">
            <Input {...register("doctorContact")} />
          </Field>

          <Field label="Kit size (top)">
            <Input {...register("kitSizeTop")} />
          </Field>

          <Field label="Kit size (bottom)">
            <Input {...register("kitSizeBottom")} />
          </Field>

          <Field label="Shoe size">
            <Input {...register("shoeSize")} />
          </Field>
        </form>
      </SidePanel>
    </>
  )
}
