"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** vertical offset (px) to animate up from */
  y?: number;
  /** delay in seconds */
  delay?: number;
  /** duration in seconds */
  duration?: number;
}

/**
 * Lightweight scroll-reveal wrapper. Fades + lifts its children into view once.
 * Honours prefers-reduced-motion (renders a plain div, no animation).
 */
export function Reveal({ children, className, y = 16, delay = 0, duration = 0.6 }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
