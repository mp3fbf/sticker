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
import UploadComponent from "./_components/upload-component"
import UploadSkeleton from "./_components/upload-skeleton"
import AnimatedContainer from "./_components/animated-container"
import AppContainer from "./_components/app-container"
import StepIndicator from "./_components/step-indicator"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "WhatsApp Animated Sticker Maker",
  description:
    "Convert videos to WhatsApp-compatible animated stickers instantly."
}

/**
 * Main page component for the WhatsApp Animated Sticker Maker application.
 * Serves as the entry point and container for the entire application.
 */
export default async function HomePage() {
  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col">
        {/* App Header */}
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
              {/* Step Indicator */}
              <AnimatedContainer
                animation="fadeInOut"
                className="px-4 pb-2 pt-4 sm:p-0 sm:pb-4"
              >
                <StepIndicator currentStep="upload" compact={false} />
              </AnimatedContainer>

              {/* Main Content Area - Starts with Upload Component */}
              <Suspense fallback={<UploadSkeleton />}>
                <UploadComponent />
              </Suspense>
            </CardContent>
          </Card>
        </AppContainer>

        {/* Footer Text */}
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
      </div>
    </main>
  )
}
