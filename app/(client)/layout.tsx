import { AppShell } from "@/components/portals/shared/app-shell"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell portal="client">{children}</AppShell>
}
