import type { Transition, Variants } from "motion/react";

export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  spring: [0.34, 1.36, 0.64, 1] as [number, number, number, number],
};

export const dur = {
  fast: 0.14,
  base: 0.22,
  slow: 0.34,
};

export const tFast: Transition = { duration: dur.fast, ease: ease.out };
export const tBase: Transition = { duration: dur.base, ease: ease.out };
export const tSlow: Transition = { duration: dur.slow, ease: ease.out };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: tBase },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: tBase },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: tBase },
};

export const stagger = (delay = 0.05): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: 0.04 } },
});

export const drawerVariants: Variants = {
  hidden: { x: "-100%", transition: { duration: dur.base, ease: ease.inOut } },
  show: { x: 0, transition: { duration: dur.base, ease: ease.out } },
};

export const drawerRightVariants: Variants = {
  hidden: { x: "100%", transition: { duration: dur.base, ease: ease.inOut } },
  show: { x: 0, transition: { duration: dur.base, ease: ease.out } },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0, transition: tFast },
  show: { opacity: 1, transition: tBase },
};

export const accordionVariants: Variants = {
  hidden: { height: 0, opacity: 0, transition: tFast },
  show: { height: "auto", opacity: 1, transition: tBase },
};
