import { Suspense } from "react"
import UploadComponent from "./_components/upload-component"
import UploadSkeleton from "./_components/upload-skeleton"

/**
 * Main landing page for the WhatsApp Animated Sticker Maker.
 * This server component uses Suspense to handle loading states
 * and provides a clean user experience.
 */
export default async function HomePage() {
  // Debug logging
  console.log("HomePage rendered")
  console.log("UploadComponent type:", typeof UploadComponent)
  console.log("UploadSkeleton type:", typeof UploadSkeleton)
  console.log("Suspense type:", typeof Suspense)

  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">WhatsApp Sticker Maker</h1>
          <p className="text-muted-foreground">
            Convert videos to WhatsApp-compatible animated stickers in seconds.
          </p>
        </div>

        <Suspense fallback={<UploadSkeleton />}>
          <UploadComponent />
        </Suspense>
      </div>
    </main>
  )
}
