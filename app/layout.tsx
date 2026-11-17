import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toast"
import { Providers } from "@/components/provider"
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register"
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider"
import { ShortcutsModal } from "@/components/portals/shared/shortcuts-modal"

export const metadata: Metadata = {
  metadataBase: new URL("https://app.tygachamps.co.za"),
  title: {
    default: "TYGA Champs",
    template: "%s | TYGA Champs",
  },
  description:
    "The Thipe Youth Golf Academy portal for players, parents and coaches",
  applicationName: "TYGA Champs",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TYGA Champs",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1f1f1f",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", "font-sans")}
    >
      <body>
        <Toaster />
        <ServiceWorkerRegister />
        <Providers>
          <KeyboardShortcutsProvider>
            <ThemeProvider>
              {children}
              <ShortcutsModal />
            </ThemeProvider>
          </KeyboardShortcutsProvider>
        </Providers>
      </body>
    </html>
  )
}
