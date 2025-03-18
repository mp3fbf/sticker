import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/utilities/providers"
import TailwindIndicator from "@/components/utilities/tailwind-indicator"
import { cn } from "@/lib/utils"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { MediaProvider } from "./_components/mobile-layout"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

/**
 * Metadata for the WhatsApp Animated Sticker Maker application
 */
export const metadata: Metadata = {
  title: "WhatsApp Animated Sticker Maker",
  description:
    "Convert videos to WhatsApp-compatible animated stickers instantly.",
  keywords: [
    "WhatsApp",
    "sticker",
    "animated",
    "WebP",
    "converter",
    "mobile",
    "video to sticker"
  ],
  authors: [{ name: "Sticker Maker App" }],
  applicationName: "WhatsApp Sticker Maker",
  creator: "Sticker Maker Team",
  publisher: "Sticker Maker App",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false
  },
  manifest: "/site.webmanifest",
  category: "tools",
  openGraph: {
    type: "website",
    title: "WhatsApp Animated Sticker Maker",
    description: "Convert videos to WhatsApp stickers in seconds",
    siteName: "WhatsApp Sticker Maker",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WhatsApp Sticker Maker"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Animated Sticker Maker",
    description: "Convert videos to WhatsApp stickers in seconds",
    images: ["/twitter-image.jpg"]
  }
}

/**
 * Viewport configuration optimized for mobile devices
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ]
}

/**
 * Root layout component that wraps the entire application.
 * Provides theme context, fonts, and global UI elements.
 * Optimized for mobile devices with proper meta tags and responsive design.
 */
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Sticker Maker" />
        <meta name="application-name" content="WhatsApp Sticker Maker" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "WhatsApp Animated Sticker Maker",
              operatingSystem: "Web",
              applicationCategory: "UtilityApplication",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD"
              },
              description:
                "Convert videos to WhatsApp-compatible animated stickers instantly."
            })
          }}
        />
      </head>
      <body
        className={cn(
          "bg-background font-sans antialiased",
          "min-h-screen w-full",
          "flex flex-col",
          inter.className
        )}
      >
        <Providers
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <MediaProvider>
            <div className="flex flex-1 flex-col">{children}</div>

            <TailwindIndicator />
            <Toaster />
          </MediaProvider>
        </Providers>
      </body>
    </html>
  )
}
