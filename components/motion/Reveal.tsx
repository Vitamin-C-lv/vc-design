'use client';

import { useEffect, useRef } from 'react';
import { observeReveal } from '@/lib/motion/reveal';

/**
 * Scroll reveal wrapper.
 *
 * Deliberately CSS-transition based (see `lib/motion/reveal.ts` for the why).
 * The element is hidden by CSS only while `data-js="on"` is present on <html>,
 * so a visitor without scripting sees all content immediately.
 *
 * Reduced motion is handled in CSS: the element is simply visible, and no
 * observer is even created.
 *
 * ── Why `masked` renders an extra inner element ──────────────────────────────
 * The masked variant wipes content upward by clipping it. That clip must **not**
 * live on the observed element itself: `clip-path: inset(0 0 100% 0)` reduces the
 * element's intersection area to zero, so its IntersectionObserver ratio stays
 * at 0 forever, the threshold is never crossed and the reveal never fires.
 * Anything below the fold would then stay invisible permanently — above-the-fold
 * elements only looked correct because `flushVisibleReveals()` caught them.
 *
 * So the observed element keeps its normal geometry, and the clip is applied to
 * an inner wrapper matched by `[data-reveal-mask]` in globals.css.
 */
export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** `rise` fades + lifts; `masked` wipes upward; `fade` is opacity only. */
  variant?: 'rise' | 'masked' | 'fade';
  /** Stagger in milliseconds. */
  delay?: number;
  /** Seconds. Defaults are tuned per variant in globals.css. */
  duration?: number;
  /** Extra translate distance in rem (rise/fade only). */
  distance?: number;
}

export function Reveal({
  children,
  className,
  variant = 'rise',
  delay = 0,
  duration,
  distance,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeReveal(el);
  }, []);

  const style = {
    '--reveal-delay': `${delay}ms`,
    ...(duration ? { '--reveal-duration': `${duration}s` } : {}),
    ...(distance !== undefined ? { '--reveal-y': `${distance}rem` } : {}),
  } as React.CSSProperties;

  if (variant === 'masked') {
    return (
      <div ref={ref} data-reveal="masked" className={className} style={style}>
        <div data-reveal-mask>{children}</div>
      </div>
    );
  }

  return (
    <div ref={ref} data-reveal={variant} className={className} style={style}>
      {children}
    </div>
  );
}
