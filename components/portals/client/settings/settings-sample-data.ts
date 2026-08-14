import type { AccountSettings } from "@/components/portals/client/settings/settings-form"

export const sampleAccount: AccountSettings = {
  id: "1",
  fullName: "Thandiwe Mokoena",
  email: "thandiwe@example.com",
  phone: "071 234 5678",
  address: "12 Vilakazi Street, Soweto",
  avatarUrl: null,
  preferences: {
    session_reminder: true,
    payment_due: true,
    level_upgrade: true,
    parent_consultation_reminder: false,
    announcement: false,
  },
}
