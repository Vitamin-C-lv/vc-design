'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface NearViewportOptions {
  margin?: number;
}

export interface NearViewportResult<T extends HTMLElement> {
  ref: (node: T | null) => void;
  near: boolean;
}

/**
 * Latches once an element has reached the viewport's forward margin.
 *
 * IntersectionObserver alone is not sufficient for this boundary: during a
 * fast fling the browser may sample the element below the viewport on one
 * rendering update and above it on the next, so no sampled frame is
 * intersecting and no observer callback marks the element as reached. The
 * scroll/resize geometry check catches that skipped interval, while the
 * immediate check covers elements mounted after their scroll position is
 * already established.
 */
export function useNearViewport<T extends HTMLElement>({ margin = 400 }: NearViewportOptions = {}): NearViewportResult<T> {
  const [near, setNear] = useState(false);
  const [target, setTarget] = useState<T | null>(null);
  const threshold = Math.max(0, margin);
  const ref = useCallback((node: T | null) => setTarget(node), []);

  useIsomorphicLayoutEffect(() => {
    if (near) return;
    if (!target) return;

    let latched = false;
    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) latch();
      },
      { rootMargin: `${threshold}px 0px` },
    );

    const cleanup = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
    const latch = () => {
      if (latched) return;
      latched = true;
      cleanup();
      setNear(true);
    };
    const checkGeometry = () => {
      frame = 0;
      if (target.getBoundingClientRect().top <= window.innerHeight + threshold) latch();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(checkGeometry);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    // The geometry check must run before observing, because the element may
    // already be above the viewport by the time this effect is installed.
    checkGeometry();
    if (!latched) observer.observe(target);

    return cleanup;
  }, [near, target, threshold]);

  return { ref, near };
}
