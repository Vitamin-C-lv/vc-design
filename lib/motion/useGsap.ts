'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, motionAllowed } from './gsap';

/** `useLayoutEffect` on the client, `useEffect` on the server (avoids the SSR warning). */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface GsapScope {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  /** The element the selectors are scoped to. */
  root: HTMLElement;
}

/**
 * Runs a GSAP setup inside a `gsap.context()` scoped to the returned ref.
 *
 * Why a context: it records every tween and ScrollTrigger created inside, so a
 * single `revert()` on unmount cleans all of them up. Without it, route changes
 * in the App Router leave orphaned ScrollTriggers behind, which is the classic
 * source of "the page jumps after navigating back".
 *
 * When animation is not allowed (reduced motion, weak device) the setup is never
 * called at all — components then render in their resting state, which is the
 * fully readable one.
 */
export function useGsapScope<T extends HTMLElement = HTMLDivElement>(
  setup: (scope: GsapScope) => void,
  options: { deps?: unknown[]; disabled?: boolean } = {},
) {
  const { deps = [], disabled = false } = options;
  const ref = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || disabled || !motionAllowed()) return;

    const ctx = gsap.context(() => {
      setup({ gsap, ScrollTrigger, root });
    }, root);

    // Fonts and the first images change layout height after mount; without a
    // refresh the pinned sections start at the wrong scroll position.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) void document.fonts.ready.then(refresh);

    return () => {
      ctx.revert();
    };
    // `setup` is intentionally excluded: callers pass an inline closure, so
    // including it would re-run every effect. Callers control re-execution
    // through `deps`, which is spread below.
  }, [disabled, ...deps]);

  return ref;
}
