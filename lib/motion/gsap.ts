'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Single GSAP entry point.
 *
 * ScrollTrigger must be registered exactly once per page. Registering it from
 * several components leads to duplicated instances and double-fired callbacks,
 * so every module imports `gsap` and `ScrollTrigger` from here instead of from
 * the packages directly.
 */
let registered = false;

if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  registered = true;

  // Pinned sections and ScrollTrigger's own measuring are wasted work when the
  // user asked for reduced motion — turn the whole subsystem off, not just the
  // tweens, so nothing reserves layout space either.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ScrollTrigger.config({ ignoreMobileResize: true });
  }
}

/** True when animation is allowed for this visitor right now. */
export function motionAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The viewport width at which compact layouts take over. Exported so JS
 * breakpoints match the CSS ones exactly (`lg` in Tailwind = 1024px).
 */
export const COMPACT_MAX_WIDTH = 1023;

export { gsap, ScrollTrigger };
