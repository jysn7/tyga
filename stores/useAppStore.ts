import { create } from "zustand"

export type Role = "parent" | "coach" | "admin"

export type Account = {
  id: string
  role: Role
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  active: boolean
  created_at: string
}

interface AppState {
  sidebarOpen: boolean
  toggleSidebar: () => void

  account: Account | null
  setAccount: (account: Account | null) => void

  shortcutsOpen: boolean
  setShortcutsOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  account: null,
  setAccount: (account) => set({ account }),

  shortcutsOpen: false,
  setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
}))
