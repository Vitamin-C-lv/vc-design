import type Lenis from 'lenis';

/**
 * Module-level handle on the single Lenis instance.
 *
 * The brief is explicit: exactly one smooth-scroll implementation, and Lenis
 * must be driven by the GSAP ticker. Keeping the instance in a module (rather
 * than in React context) means anchor links, the header and the mobile menu can
 * all request a programmatic scroll without threading a provider through the
 * tree, and there is no chance of two instances existing at once.
 */

let instance: Lenis | null = null;

export function setLenis(next: Lenis | null): void {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}

/**
 * Scrolls to a hash target, using Lenis when it is active and falling back to
 * `scrollIntoView` when it is not (reduced motion, JS-degraded, or before the
 * provider has mounted).
 */
export function scrollToHash(hash: string, offset = 0): void {
  if (typeof window === 'undefined') return;
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.15 });
    return;
  }
  const top = target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: 'auto' });
}

/** Returns true when the URL hash points at an element on the current page. */
export function hasHashTarget(href: string): boolean {
  if (typeof window === 'undefined') return false;
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) return false;
  const path = href.slice(0, hashIndex);
  // Only treat it as local when the path is empty or points at the home page.
  if (path !== '' && path !== '/' && path !== window.location.pathname) return false;
  return Boolean(document.getElementById(href.slice(hashIndex + 1)));
}
