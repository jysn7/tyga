"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ProgrammePanel } from "@/components/portals/admin/programmes/programme-panel"
import { ProgrammesTab } from "@/components/portals/admin/programmes/programmes-tab"
import { RolloverView } from "@/components/portals/admin/programmes/rollover-view"
import { useLevels } from "@/hooks/admin/levels/use-levels"
import { useVenues } from "@/hooks/admin/programmes/use-venues"

export default function AdminProgrammesPage() {
  const [tab, setTab] = useState<"all" | "rollover">("all")
  const [createPanelOpen, setCreatePanelOpen] = useState(false)

  const { data: levels } = useLevels()
  const { data: venues } = useVenues()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Programmes"
        description="Enrollable programmes across venues and levels"
        action={
          <div className="flex items-center gap-4">
            <Link
              href="/admin/programmes/discounts"
              className="text-sm font-medium text-information underline underline-offset-4 hover:opacity-80"
            >
              Manage discounts
            </Link>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setCreatePanelOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New programme
            </Button>
          </div>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="flex flex-col gap-4"
      >
        <TabsList>
          <TabsTrigger value="all">All programmes</TabsTrigger>
          <TabsTrigger value="rollover">Roll over</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <ProgrammesTab />
        </TabsContent>

        <TabsContent value="rollover" className="mt-0">
          <RolloverView />
        </TabsContent>
      </Tabs>

      <ProgrammePanel
        key={`create-${createPanelOpen}`}
        programme={null}
        levels={levels ?? []}
        venues={venues ?? []}
        open={createPanelOpen}
        onOpenChange={setCreatePanelOpen}
      />
    </div>
  )
}
