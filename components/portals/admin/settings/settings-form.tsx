"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Loader } from "@/components/portals/shared/loader"
import { useAppSettings } from "@/hooks/lookups/use-academy-settings"
import { AcademyTab } from "./academy-tab"
import { SiteTab } from "./site-tab"
import { NotificationsTab } from "./notifications-tab"
import { PaymentsTab } from "./payments-tab"
import { MembershipTab } from "./membership-tab"

export function AdminSettingsForm() {
  const { data: settings, isLoading, error } = useAppSettings()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error?.message ?? "Could not load settings"}
      </div>
    )
  }

  return (
    <Tabs defaultValue="academy" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="academy">Academy</TabsTrigger>
        <TabsTrigger value="site">Site</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="membership">Membership</TabsTrigger>
      </TabsList>

      <TabsContent value="academy" className="mt-0">
        <AcademyTab settings={settings} />
      </TabsContent>

      <TabsContent value="site" className="mt-0">
        <SiteTab settings={settings} />
      </TabsContent>

      <TabsContent value="notifications" className="mt-0">
        <NotificationsTab settings={settings} />
      </TabsContent>

      <TabsContent value="payments" className="mt-0">
        <PaymentsTab settings={settings} />
      </TabsContent>

      <TabsContent value="membership" className="mt-0">
        <MembershipTab settings={settings} />
      </TabsContent>
    </Tabs>
  )
}
