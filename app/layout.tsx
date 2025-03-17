import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/utilities/providers"
import TailwindIndicator from "@/components/utilities/tailwind-indicator"
import { cn } from "@/lib/utils"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

/**
 * Metadata for the WhatsApp Animated Sticker Maker application
 */
export const metadata: Metadata = {
  title: "WhatsApp Animated Sticker Maker",
  description:
    "Convert videos to WhatsApp-compatible animated stickers instantly.",
  keywords: ["WhatsApp", "sticker", "animated", "WebP", "converter"],
  authors: [{ name: "Sticker Maker App" }]
}

/**
 * Viewport configuration
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
}

/**
 * Root layout component that wraps the entire application.
 * Provides theme context, fonts, and global UI elements.
 */
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background min-h-screen w-full antialiased",
          inter.className
        )}
      >
        <Providers
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}

          <TailwindIndicator />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
