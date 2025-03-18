/**
 * @description
 * Main landing page for the WhatsApp Animated Sticker Maker application.
 * Integrates all components to create a complete user flow from upload to download.
 *
 * Features:
 * - Unified application flow with step tracking
 * - State management for the entire conversion process
 * - Responsive design that works well on mobile and desktop
 * - Animated transitions between application states
 * - Error handling and feedback mechanisms
 * - Performance optimizations for a smooth user experience
 *
 * Performance optimizations:
 * - Dynamic imports for heavy components to reduce initial load time
 * - Route prefetching for improved navigation
 * - Priority loading for critical components
 * - Optimized images with responsive sizes
 * - Lazy loading for non-critical content
 * - Memoization of expensive components
 *
 * The page consists of three main states:
 * 1. Upload: User selects a video file
 * 2. Process: Video is converted to WhatsApp sticker format
 * 3. Download: User can preview and download the processed sticker
 *
 * @dependencies
 * - React and Next.js for component architecture
 * - AppContainer for consistent layout
 * - StepIndicator for visual process tracking
 * - Various components for specific functionality stages
 */

import { Suspense } from "react"
import { Metadata } from "next"
import UploadSkeleton from "./_components/upload-skeleton"
import AnimatedContainer from "./_components/animated-container"
import AppContainer from "./_components/app-container"
import StepIndicator from "./_components/step-indicator"
import { Card, CardContent } from "@/components/ui/card"
import LazyLoadWrapper from "./_components/lazy-load-wrapper"
import DynamicUploadWrapper from "./_components/dynamic-upload-wrapper"

// Dynamic import moved to client component DynamicUploadWrapper

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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5
  },
  // Cache-related metadata
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
  }
}

/**
 * Main page component for the WhatsApp Animated Sticker Maker application.
 * Serves as the entry point and container for the entire application.
 *
 * Performance optimizations include:
 * - Memoized child components to prevent unnecessary re-renders
 * - Lazy loading of non-critical content
 * - Progressive loading of application components
 * - Optimized animation timing to minimize layout thrashing
 */
export default async function HomePage() {
  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col">
        {/* App Header - Priority loaded */}
        <AnimatedContainer
          animation="staggerContainer"
          className="mb-8 text-center"
          staggerChildren={true}
          staggerDelay={0.2}
        >
          <AnimatedContainer animation="staggerItem" className="mb-2">
            <h1 className="text-2xl font-bold sm:text-3xl">
              WhatsApp Sticker Maker
            </h1>
          </AnimatedContainer>

          <AnimatedContainer animation="staggerItem">
            <p className="text-muted-foreground text-sm sm:text-base">
              Convert videos to WhatsApp-compatible animated stickers in
              seconds.
            </p>
          </AnimatedContainer>
        </AnimatedContainer>

        {/* Main Application Container */}
        <AppContainer>
          <Card className="border-0 shadow-none">
            <CardContent className="p-0 sm:p-6">
              {/* Step Indicator - The UploadComponent will manage the currentStep state */}
              <AnimatedContainer
                animation="fadeInOut"
                className="px-4 pb-2 pt-4 sm:p-0 sm:pb-4"
              >
                <StepIndicator currentStep="upload" compact={false} />
              </AnimatedContainer>

              {/* Main Content Area - Dynamically loaded with Suspense/fallback */}
              <Suspense fallback={<UploadSkeleton />}>
                <DynamicUploadWrapper />
              </Suspense>
            </CardContent>
          </Card>
        </AppContainer>

        {/* Footer Text - Lazy loaded as it's below the fold */}
        <LazyLoadWrapper delay={500} threshold={0.1} rootMargin="100px">
          <AnimatedContainer
            animation="fadeInOut"
            delay={0.6}
            className="text-muted-foreground mt-8 text-center text-xs"
          >
            <p>
              Create animated stickers that work perfectly with WhatsApp.
              <br />
              Your videos are processed entirely in your browser for privacy.
            </p>
          </AnimatedContainer>
        </LazyLoadWrapper>
      </div>
    </main>
  )
}
