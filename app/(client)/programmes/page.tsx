"use client"

import { useState } from "react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { ProgrammeList } from "@/components/portals/client/programmes/programme-list"
import { EnrollModal } from "@/components/portals/client/programmes/enroll-modal"
import { Loader } from "@/components/portals/shared/loader"
import { useProgrammes } from "@/hooks/client/use-programmes"
import { useMembers } from "@/hooks/use-members"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProgrammeListItem } from "@/lib/types"

export default function ProgrammesPage() {
  const { data: members, isLoading: membersLoading } = useMembers()

  const [selectedMemberId, setSelectedMemberId] = useState<string>("all")
  const [enrollTarget, setEnrollTarget] = useState<ProgrammeListItem | null>(
    null
  )
  const [enrollOpen, setEnrollOpen] = useState(false)

  const allProgrammes = selectedMemberId === "all"
  const memberId = allProgrammes ? null : Number(selectedMemberId)

  const { data: programmes, isLoading: programmesLoading } = useProgrammes(
    memberId,
    allProgrammes
  )

  const selectedLabel =
    selectedMemberId === "all"
      ? "All programmes"
      : (members?.find((m) => String(m.id) === selectedMemberId)?.fullName ??
        "Select a member")

  function handleEnroll(programme: ProgrammeListItem) {
    setEnrollTarget(programme)
    setEnrollOpen(true)
  }

  const isLoading = membersLoading || programmesLoading

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Programmes"
        description={
          allProgrammes
            ? "All available programmes"
            : "Programmes your child is eligible to enroll in"
        }
        action={
          <Select
            value={selectedMemberId}
            onValueChange={(value) => {
              if (value !== null) setSelectedMemberId(value)
            }}
            disabled={membersLoading}
          >
            <SelectTrigger className="w-56">
              <SelectValue>{selectedLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All programmes</SelectItem>
              {(members ?? []).map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <ProgrammeList programmes={programmes ?? []} onEnroll={handleEnroll} />
      )}

      <EnrollModal
        programme={enrollTarget}
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
      />
    </div>
  )
}
