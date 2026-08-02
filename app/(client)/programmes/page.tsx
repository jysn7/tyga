import { PageHeader } from "@/components/portals/shared/page-header"
import { ProgrammeList } from "@/components/portals/client/programmes/programme-list"
import { getAllProgrammes } from "@/lib/data/programmes"

export default async function ProgrammesPage() {
  const programmes = await getAllProgrammes()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Programmes"
        description="Programmes your children are eligible to enroll in"
      />
      <ProgrammeList programmes={programmes} />
    </div>
  )
}
