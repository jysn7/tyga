import { PageHeader } from "@/components/portals/shared/page-header"
import { ProgrammeList } from "@/components/portals/client/programmes/programme-list"
import { getAllProgrammes } from "@/lib/data/programmes"

export default async function ProgrammesPage() {
  const programmes = await getAllProgrammes()

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <PageHeader
        title="Programmes"
        description="Programmes your children are eligible to enroll in"
      />
      <ProgrammeList programmes={programmes} />
    </div>
  )
}
