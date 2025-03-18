"use client"

/**
 * @description
 * Component that displays user instructions for using the WhatsApp Sticker Maker.
 * Provides step-by-step guidance, tips, and information about WhatsApp sticker requirements.
 *
 * Features:
 * - Expandable/collapsible sections for a clean UI
 * - Step-by-step instructions with visual indicators
 * - Tips for creating better stickers
 * - Information about WhatsApp sticker requirements
 * - Troubleshooting guidance
 * - FAQ section
 *
 * @dependencies
 * - instructions-content.ts: Contains the text content for instructions
 * - framer-motion: For animations
 * - lucide-react: For icons
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  FAQ_ITEMS,
  GENERAL_INSTRUCTIONS,
  STEP_INSTRUCTIONS,
  STICKER_TIPS,
  WHATSAPP_IMPORT_HELP,
  WHATSAPP_REQUIREMENTS
} from "@/lib/instructions-content"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  HelpCircle,
  Info,
  Lightbulb,
  Upload,
  X
} from "lucide-react"
import { useState } from "react"
import HelpTooltip from "./help-tooltip"

/**
 * Props for the Instructions component
 */
export interface InstructionsProps {
  /**
   * Current active step in the process
   * @default undefined - shows general instructions
   */
  currentStep?: "upload" | "process" | "download"

  /**
   * Optional class name for styling
   */
  className?: string

  /**
   * Whether the instructions should be initially expanded
   * @default false
   */
  initiallyExpanded?: boolean

  /**
   * Whether to show the tips section
   * @default true
   */
  showTips?: boolean

  /**
   * Whether to show the FAQ section
   * @default true
   */
  showFaq?: boolean

  /**
   * Whether to show the WhatsApp requirements section
   * @default true
   */
  showRequirements?: boolean

  /**
   * Whether to show the close button
   * @default true
   */
  showCloseButton?: boolean

  /**
   * Optional callback for when the component is closed
   */
  onClose?: () => void
}

/**
 * The main Instructions component that displays user guidance
 */
export default function Instructions({
  currentStep,
  className,
  initiallyExpanded = false,
  showTips = true,
  showFaq = true,
  showRequirements = true,
  showCloseButton = true,
  onClose
}: InstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded)

  /**
   * Toggle expanded state of the instructions
   */
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev)
  }

  /**
   * Handle the close button click
   */
  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  /**
   * Get the icon for a step
   */
  const getStepIcon = (step: string) => {
    switch (step) {
      case "upload":
        return <Upload className="size-5" />
      case "process":
        return (
          <div className="relative size-5">
            <div className="absolute size-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )
      case "download":
        return <Download className="size-5" />
      default:
        return <Info className="size-5" />
    }
  }

  return (
    <Card className={cn("border-muted/50 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="text-primary size-5" />
          <CardTitle className="text-lg">Instructions</CardTitle>
        </div>
        <div className="flex gap-2">
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="size-8 p-0"
              aria-label="Close instructions"
            >
              <X className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="size-8 p-0"
            aria-label={
              isExpanded ? "Collapse instructions" : "Expand instructions"
            }
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Brief description always visible */}
      <CardContent className="pt-0">
        <CardDescription className="text-muted-foreground pb-2 text-sm">
          {GENERAL_INSTRUCTIONS.description}
        </CardDescription>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Step-by-step instructions */}
              <div className="mt-4 space-y-4">
                <h3 className="text-md font-medium">Step-by-Step Guide</h3>
                <div className="space-y-3">
                  {Object.entries(STEP_INSTRUCTIONS).map(
                    ([step, instruction], index) => (
                      <div
                        key={step}
                        className={cn(
                          "rounded-lg p-3 transition-colors",
                          currentStep === step
                            ? "bg-primary/10 border-primary/30 border"
                            : "bg-muted/30"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-full",
                              currentStep === step
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {getStepIcon(step)}
                          </div>
                          <div className="space-y-1">
                            <h4
                              className={cn(
                                "font-medium",
                                currentStep === step && "text-primary"
                              )}
                            >
                              {index + 1}. {instruction.title}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {instruction.description}
                            </p>
                            {instruction.tips && (
                              <div className="mt-2">
                                <HelpTooltip
                                  content={
                                    <ul className="list-inside list-disc space-y-1">
                                      {instruction.tips.map((tip, i) => (
                                        <li key={i} className="text-sm">
                                          {tip}
                                        </li>
                                      ))}
                                    </ul>
                                  }
                                  light
                                >
                                  <div className="text-primary flex items-center gap-1 text-xs font-medium">
                                    <Lightbulb className="size-3" />
                                    <span>Tips</span>
                                  </div>
                                </HelpTooltip>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Sticker tips section */}
                {showTips && (
                  <div className="mt-6">
                    <Separator className="mb-6" />
                    <div className="mb-3 flex items-center gap-2">
                      <Lightbulb className="text-primary size-5" />
                      <h3 className="text-md font-medium">
                        Tips for Great Stickers
                      </h3>
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {STICKER_TIPS.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                          <span className="text-muted-foreground text-sm">
                            {tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* WhatsApp requirements section */}
                {showRequirements && (
                  <div className="mt-6">
                    <Separator className="mb-6" />
                    <div className="mb-3 flex items-center gap-2">
                      <Info className="text-primary size-5" />
                      <h3 className="text-md font-medium">
                        {WHATSAPP_REQUIREMENTS.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm">
                      {WHATSAPP_REQUIREMENTS.description}
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {WHATSAPP_REQUIREMENTS.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                          <span className="text-muted-foreground text-sm">
                            {req}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Adding stickers to WhatsApp */}
                <div className="mt-6">
                  <Separator className="mb-6" />
                  <div className="mb-3 flex items-center gap-2">
                    <Download className="text-primary size-5" />
                    <h3 className="text-md font-medium">
                      {WHATSAPP_IMPORT_HELP.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm">
                    {WHATSAPP_IMPORT_HELP.description}
                  </p>

                  <div className="space-y-4">
                    {WHATSAPP_IMPORT_HELP.methods.map((method, index) => (
                      <div
                        key={index}
                        className="bg-muted/30 space-y-2 rounded-lg p-3"
                      >
                        <h4 className="font-medium">{method.title}</h4>
                        <ol className="list-inside list-decimal space-y-1">
                          {method.steps.map((step, stepIndex) => (
                            <li
                              key={stepIndex}
                              className="text-muted-foreground text-sm"
                            >
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ Section */}
                {showFaq && (
                  <div className="mt-6">
                    <Separator className="mb-6" />
                    <div className="mb-3 flex items-center gap-2">
                      <HelpCircle className="text-primary size-5" />
                      <h3 className="text-md font-medium">
                        Frequently Asked Questions
                      </h3>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      {FAQ_ITEMS.map((item, index) => (
                        <AccordionItem key={index} value={`faq-${index}`}>
                          <AccordionTrigger className="text-sm font-medium">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button at the bottom */}
        {!isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="mt-2 w-full"
          >
            Show detailed instructions
            <ChevronDown className="ml-2 size-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * A lightweight version of the Instructions component
 * Shows only the key steps in a simplified format
 */
export function SimpleInstructions({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 py-2", className)}>
      <h3 className="font-medium">How It Works</h3>
      <ol className="space-y-2">
        {GENERAL_INSTRUCTIONS.steps.map((step, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {index + 1}
            </div>
            <span className="text-muted-foreground text-sm">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/**
 * A mini version of the instructions that can be placed in a tooltip
 * or other space-constrained area
 */
export function MiniInstructions() {
  return (
    <div className="space-y-3 p-1">
      <p className="text-sm font-medium">Quick Steps:</p>
      <ol className="list-inside list-decimal space-y-0.5 text-xs">
        {GENERAL_INSTRUCTIONS.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </div>
  )
}
