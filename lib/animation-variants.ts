/**
 * @description
 * Animation variants for use with Framer Motion.
 * Defines reusable animation configurations for various UI elements.
 *
 * These variants can be used with Framer Motion's variants prop to create
 * consistent animations across the application.
 *
 * @example
 * ```tsx
 * import { motion } from 'framer-motion'
 * import { fadeInOut } from '@/lib/animation-variants'
 *
 * <motion.div
 *   variants={fadeInOut}
 *   initial="hidden"
 *   animate="visible"
 *   exit="exit"
 * >
 *   Content
 * </motion.div>
 * ```
 */

/**
 * Fade in/out animation variant
 * Opacity transition with a slight scale effect
 */
export const fadeInOut = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

/**
 * Fade up animation variant
 * Combines opacity with upward movement
 */
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

/**
 * Scale animation variant
 * Simple scale effect with spring physics
 */
export const scale = {
  hidden: { scale: 0.8 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: {
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

/**
 * Staggered children animation variant
 * Parent container for staggered child animations
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

/**
 * Staggered item animation variant
 * To be used by children of a staggerContainer
 */
export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

/**
 * Slide in from right animation variant
 * For UI elements entering from the right side
 */
export const slideInRight = {
  hidden: { x: 50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    x: 50,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}

/**
 * Bounce animation variant
 * Adds a playful bounce effect with spring physics
 */
export const bounce = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  }
}
