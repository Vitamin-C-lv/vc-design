'use client';

import { useEffect, useState } from 'react';

export type BandTone = 'ink' | 'paper';

/**
 * Detects which band is currently sitting underneath the fixed header.
 *
 * Why this exists: the header is `position: fixed`, so on a page that opens with
 * a light band the header's own light text ended up on a light background —
 * measurably invisible (text luminance 239 on a background of luminance 239 on
 * `/lab`). Rather than forcing every page to start dark, or giving the header a
 * permanent bar, the header now adapts to whatever it is floating over.
 *
 * The mechanism is cheap because the tone system already does the hard part:
 * `data-tone` re-points `--tone-fg`, `--tone-bg`, `--tone-line` and friends, so
 * flipping one attribute restyles the wordmark, nav, CTA and hairline together.
 *
 * Sampling uses `elementsFromPoint` at the header's vertical midline — a single
 * hit test, throttled to ~8/s, which is far cheaper than running an
 * IntersectionObserver per band and then arbitrating between the several that
 * always intersect a header-height strip.
 */
export function useBandTone(elementRef: React.RefObject<HTMLElement | null>): BandTone {
  /**
   * Starts on `paper`, not `ink`.
   *
   * Every page here opens on a light band, and this hook can only correct its
   * guess after hydration. Starting from the dark-band palette meant the first
   * paint — and with JavaScript disabled the *only* paint — put bone-white type
   * on a paper hero: the header was present but unreadable.
   */
  const [tone, setTone] = useState<BandTone>('paper');

  useEffect(() => {
    let frame = 0;
    let lastRun = 0;

    const sample = () => {
      const el = elementRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const probeY = Math.max(1, rect.height / 2);
      // Probe near the middle of the viewport width, away from the very edge
      // where a full-bleed element might not have painted yet.
      const probeX = Math.round(window.innerWidth / 2);

      let next: BandTone = 'ink';
      // `elementsFromPoint` returns the whole stack, topmost first, including
      // elements *behind* the header — which is exactly what we want.
      const stack = document.elementsFromPoint(probeX, probeY);
      for (const node of stack) {
        if (el.contains(node)) continue;
        const band = (node as HTMLElement).closest?.('[data-tone]');
        if (!band) continue;
        const value = band.getAttribute('data-tone');
        next = value === 'paper' ? 'paper' : 'ink';
        break;
      }

      setTone((current) => (current === next ? current : next));
    };

    const schedule = () => {
      const now = performance.now();
      if (now - lastRun < 120) return;
      lastRun = now;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sample);
    };

    sample();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [elementRef]);

  return tone;
}
