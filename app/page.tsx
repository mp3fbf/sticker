import { Suspense } from "react"
import { Metadata } from "next"
import UploadComponent from "./_components/upload-component"
import UploadSkeleton from "./_components/upload-skeleton"
import AnimatedContainer from "./_components/animated-container"

export const metadata: Metadata = {
  title: "WhatsApp Animated Sticker Maker",
  description:
    "Convert videos to WhatsApp-compatible animated stickers instantly."
}

/**
 * Main landing page for the WhatsApp Animated Sticker Maker.
 * This server component uses Suspense to handle loading states
 * and provides a clean user experience with animations.
 *
 * Key features:
 * - Suspense for loading state management
 * - Animated sections with staggered animations
 * - Responsive layout that works well on mobile and desktop
 *
 * @component
 */
export default async function HomePage() {
  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatedContainer
          animation="staggerContainer"
          className="mb-8 text-center"
          staggerChildren={true}
          staggerDelay={0.2}
        >
          <AnimatedContainer animation="staggerItem" className="mb-2">
            <h1 className="text-3xl font-bold">WhatsApp Sticker Maker</h1>
          </AnimatedContainer>

          <AnimatedContainer animation="staggerItem">
            <p className="text-muted-foreground">
              Convert videos to WhatsApp-compatible animated stickers in
              seconds.
            </p>
          </AnimatedContainer>
        </AnimatedContainer>

        <Suspense fallback={<UploadSkeleton />}>
          <UploadComponent />
        </Suspense>
      </div>
    </main>
  )
}
