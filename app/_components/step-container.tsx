"use client"

import { useState } from "react"
import StepIndicator, { AppStep } from "./step-indicator"
import UploadComponent from "./upload-component"
import AnimatedContainer from "./animated-container"
import { Suspense } from "react"
import UploadSkeleton from "./upload-skeleton"

/**
 * Client component that manages the step state and connects
 * the StepIndicator with the UploadComponent
 */
export default function StepContainer() {
  const [currentStep, setCurrentStep] = useState<AppStep>("upload")

  return (
    <>
      {/* Step Indicator */}
      <AnimatedContainer
        animation="fadeInOut"
        className="px-4 pb-2 pt-4 sm:p-0 sm:pb-4"
      >
        <StepIndicator currentStep={currentStep} compact={false} />
      </AnimatedContainer>

      {/* Main Content Area - Starts with Upload Component */}
      <Suspense fallback={<UploadSkeleton />}>
        <UploadComponent onStepChange={setCurrentStep} />
      </Suspense>
    </>
  )
}
