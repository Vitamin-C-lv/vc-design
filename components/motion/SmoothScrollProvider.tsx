'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, motionAllowed } from '@/lib/motion/gsap';
import { setLenis } from '@/lib/motion/lenis';
import { flushVisibleReveals } from '@/lib/motion/reveal';

/**
 * Pixels advanced in a single frame above which the scroll counts as a fling
 * rather than as reading.
 *
 * Measured on this site (3 runs each, median / 90th percentile / max px/frame):
 * a single wheel notch 2/7/12, four notches at 120ms 8/18/30, a hard fling
 * 68-125 / 538-633 / 2338-3687. The threshold sits in the empty band between 30
 * and 68, so it separates the two gestures with room on both sides rather than
 * sitting on a knife edge.
 */
const FLING_VELOCITY = 55;

/**
 * The single smooth-scroll engine for the whole site.
 *
 * Rules from the brief, implemented here:
 *
 * 1. **One implementation only.** Lenis is created once, at the root. Nothing
 *    else in the codebase may call `scroll-behavior: smooth` or create its own
 *    smoothing — `globals.css` explicitly sets `scroll-behavior: auto`.
 * 2. **Synced to the GSAP ticker.** Lenis is driven by `gsap.ticker`, not by its
 *    own rAF loop, so Lenis and ScrollTrigger advance on the same frame. Two
 *    loops would produce the drift that reads as "jittery" pinning.
 * 3. **Reduced motion wins.** If the visitor asked for reduced motion, Lenis is
 *    never instantiated and the page uses the browser's native scrolling.
 * 4. **Touch devices keep momentum.** Native touch scrolling feels better than
 *    anything we can synthesise, so `syncTouch` stays off and Lenis only takes
 *    over pointer/wheel input.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!motionAllowed()) {
      // Still flush any reveal that was mounted above the fold.
      const id = window.setTimeout(flushVisibleReveals, 400);
      return () => window.clearTimeout(id);
    }

    const lenis = new Lenis({
      duration: 1.05,
      // A gentle exponential ease-out: movement keeps a little weight at the end
      // instead of stopping dead, which is what makes the scroll feel physical.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Do not smooth touch — native momentum is better and WeChat WebView is
      // sensitive to synthetic scroll.
      syncTouch: false,
      autoRaf: false,
      anchors: false,
    });

    setLenis(lenis);

    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onLenisScroll);

    /*
     * Reveal watchdog.
     *
     * The IntersectionObserver in `lib/motion/reveal.ts` is the primary reveal
     * mechanism and is reliable — but it is also silently defeatable: give an
     * observed element a hidden state that changes its geometry (a `clip-path`
     * that collapses it, a zero-height wrapper) and the observer never fires.
     * The element then sits at opacity 0 forever, and the page looks broken in a
     * way that is invisible in code review.
     *
     * This is the backstop. `flushVisibleReveals` reveals anything already inside
     * the viewport using bounding boxes rather than intersection ratios, so a
     * defeated observer can no longer hide content permanently. It runs at most
     * once per 500px of travel and only inspects elements that are still hidden
     * (normally none), so it costs nothing while scrolling.
     */
    let lastFlush = 0;
    const onScrollWatchdog = (event: { scroll: number }) => {
      if (Math.abs(event.scroll - lastFlush) < 500) return;
      lastFlush = event.scroll;
      flushVisibleReveals();
    };
    lenis.on('scroll', onScrollWatchdog);

    /*
     * Fling detection, for the reveal animation's sake.
     *
     * Lenis reports `velocity` as pixels advanced in the last frame, so the
     * threshold below is "pixels per frame", not per second. A deliberate wheel
     * notch peaks well under it; a fling is an order of magnitude above.
     *
     * While the flag is on, `globals.css` drops the reveal transition entirely,
     * so content that flies past is simply there. A 0.9s crossfade that the
     * visitor scrolls through does not read as motion — it reads as text that has
     * not finished loading, which is what got reported.
     *
     * The flag is only cleared after the scroll settles, so an element the fling
     * revealed stays snapped rather than animating from a stop.
     */
    const root = document.documentElement;
    let instant = false;
    let settleTimer = 0;
    const setInstant = (next: boolean) => {
      if (next === instant) return;
      instant = next;
      if (next) root.dataset.revealInstant = 'true';
      else delete root.dataset.revealInstant;
    };
    const onScrollVelocity = (event: { velocity: number }) => {
      window.clearTimeout(settleTimer);
      if (Math.abs(event.velocity) >= FLING_VELOCITY) {
        setInstant(true);
        // Lenis stops emitting `scroll` once it has settled, so a fling that ends
        // on a fast frame would otherwise never be followed by the slow frame that
        // clears the flag — and the reveal animation would stay off for the rest
        // of the session. This fallback is re-armed by every fast frame, and the
        // 140ms clear below takes over as soon as one arrives under the threshold.
        settleTimer = window.setTimeout(() => setInstant(false), 400);
        return;
      }
      if (instant) settleTimer = window.setTimeout(() => setInstant(false), 140);
    };
    lenis.on('scroll', onScrollVelocity);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // GSAP's lag smoothing fights Lenis' own easing during long frames.
    gsap.ticker.lagSmoothing(0);

    // Images below the fold change document height as they load; refresh once
    // everything has settled so pinned sections measure correctly.
    const refresh = () => ScrollTrigger.refresh();
    const onLoad = () => {
      refresh();
      flushVisibleReveals();
    };
    window.addEventListener('load', onLoad);
    const loadedTimer = window.setTimeout(onLoad, 1500);

    return () => {
      window.clearTimeout(loadedTimer);
      window.clearTimeout(settleTimer);
      delete root.dataset.revealInstant;
      window.removeEventListener('load', onLoad);
      lenis.off('scroll', onLenisScroll);
      lenis.off('scroll', onScrollWatchdog);
      lenis.off('scroll', onScrollVelocity);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
