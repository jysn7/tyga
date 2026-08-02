import { notFound } from "next/navigation"
import { getProgrammeById } from "@/lib/data/programmes"
import type { Metadata } from "next"
import { ProgrammeDetail } from "@/components/portals/client/programmes/programme-detail"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const programme = await getProgrammeById(id)

  if (!programme) return { title: "Programme not found" }

  return {
    title: `${programme.name} · TYGA Golf Academy`,
    description: programme.description || "Golf programme at TYGA",
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const programme = await getProgrammeById(id)

  if (!programme) notFound()

  return <ProgrammeDetail programme={programme} />
}
