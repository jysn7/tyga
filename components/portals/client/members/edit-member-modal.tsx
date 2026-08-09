"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { createClient } from "@/utils/supabase/client"
import {
  memberEditSchema,
  toUpdateMemberInput,
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
  id: number
  fullName: string
  dob: string
  gender: "male" | "female"
  medicalNotes: string | null
  emergencyContact: string | null
}

export function EditMemberModal({ member }: { member: EditableMember }) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MemberEditValues>({
    resolver: zodResolver(memberEditSchema),
    defaultValues: {
      fullName: member.fullName,
      dob: new Date(member.dob),
      gender: member.gender,
      medicalNotes: member.medicalNotes ?? "",
      emergencyContact: member.emergencyContact ?? "",
    },
  })

  const onSubmit = async (values: MemberEditValues) => {
    setIsSaving(true)
    const toastId = "update-member-status"

    toast.add({
      id: toastId,
      title: "Saving changes...",
      description: "Please wait",
      type: "loading",
      timeout: 0,
    })

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc("update_member", {
        p_member_id: member.id,
        ...toUpdateMemberInput(values),
      })
      if (error) throw error

      toast.add({
        id: toastId,
        title: "Member updated",
        description: `${values.fullName}'s details have been saved.`,
        type: "success",
        timeout: 5000,
      })

      setOpen(false)
      router.refresh() // re-run the Server Component fetch on the detail page
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
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5 rounded-md text-xs font-medium"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="border-background bg-background ring-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <Field label="Full name" error={errors.fullName?.message}>
            <Input className={fieldStyles} {...register("fullName")} />
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
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Emergency contact">
            <Input className={fieldStyles} {...register("emergencyContact")} />
          </Field>

          <Field label="Medical notes">
            <Textarea
              className={`${fieldStyles} min-h-20 resize-none`}
              {...register("medicalNotes")}
            />
          </Field>

          <DialogFooter className="mt-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-lg text-xs font-medium"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
