'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from '@/lib/motion/gsap';
import { getLenis } from '@/lib/motion/lenis';
import { flushVisibleReveals } from '@/lib/motion/reveal';

/** Height of the fixed header, used to offset in-page anchor landings. */
const HEADER_OFFSET = -72;

/**
 * Keeps scroll state correct across App Router navigations.
 *
 * Next.js 16 no longer touches `scroll-behavior` during a client-side
 * navigation, and Lenis keeps its own notion of the current scroll offset — so
 * without this component, moving between a case study and the home page can land
 * you halfway down the new document, with every ScrollTrigger measuring against
 * the previous page's layout.
 *
 * It handles three cases on every pathname change:
 *
 * 1. a hash target exists on the new route → land on that section;
 * 2. otherwise → go to the top;
 * 3. always → re-measure ScrollTrigger and flush any reveal that is already
 *    inside the viewport (newly mounted sections would otherwise stay hidden
 *    until the visitor happens to scroll).
 */
export function RouteScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = getLenis();

    const apply = () => {
      const hash = window.location.hash;

      if (hash.length > 1) {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          if (lenis) {
            lenis.scrollTo(target, { offset: HEADER_OFFSET, immediate: true });
          } else {
            window.scrollTo({
              top: target.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET,
            });
          }
        }
      } else if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }

      ScrollTrigger.refresh();
      flushVisibleReveals();
    };

    // One frame lets the new route commit its DOM; a second pass after the
    // browser has laid out images catches late height changes.
    const frame = requestAnimationFrame(apply);
    const settle = window.setTimeout(() => {
      ScrollTrigger.refresh();
      flushVisibleReveals();
    }, 320);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [pathname]);

  return null;
}
