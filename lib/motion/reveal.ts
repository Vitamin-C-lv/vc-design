'use client';

/**
 * One shared IntersectionObserver for every scroll reveal on the page.
 *
 * Reveals deliberately do **not** run through GSAP. An IntersectionObserver
 * cannot miss an element that a ScrollTrigger start position mis-measured, it
 * costs nothing during scroll, and it keeps the reveal system alive even if the
 * animation layer fails to boot. GSAP is reserved for the things only GSAP can
 * do: pinned storytelling, parallax and scrubbed sequences.
 *
 * The observer does exactly one thing: set `data-revealed="true"`, which the CSS
 * in `globals.css` transitions to the visible state.
 */

let observer: IntersectionObserver | null = null;

const REVEALED = 'true';

function getObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return null;
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealed = REVEALED;
        observer?.unobserve(entry.target);
      }
    },
    {
      // Fire slightly before the element's top edge reaches the fold so the
      // motion reads as "already arriving" rather than "triggered".
      rootMargin: '0px 0px -6% 0px',
      threshold: 0.01,
    },
  );

  return observer;
}

export function observeReveal(element: Element): () => void {
  // Reduced motion is handled purely in CSS (everything is visible), so there is
  // no reason to observe at all.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    (element as HTMLElement).dataset.revealed = REVEALED;
    return () => {};
  }

  const io = getObserver();
  if (!io) {
    // No IntersectionObserver: show the content rather than hiding it forever.
    (element as HTMLElement).dataset.revealed = REVEALED;
    return () => {};
  }

  io.observe(element);
  return () => io.unobserve(element);
}

/**
 * Safety net. Anything still hidden but already inside the viewport gets shown.
 * Runs once after load + a short delay, so a mis-measure can never leave a
 * section of the site permanently invisible.
 */
export function flushVisibleReveals(): void {
  if (typeof document === 'undefined') return;
  const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])');
  const limit = window.innerHeight * 1.1;
  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.top < limit && rect.bottom > -limit) {
      node.dataset.revealed = REVEALED;
    }
  });
}
