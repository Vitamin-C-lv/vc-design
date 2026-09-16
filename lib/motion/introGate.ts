/**
 * The arrival gate — the single owner of two questions:
 *
 *   1. May the opening sequence play at all?
 *   2. Has it finished handing over to the hero?
 *
 * Both answers live on `<html data-intro>`, never in React state, mirroring the
 * language switch: the decision has to be made *before first paint* (see
 * `BOOT_SCRIPT` in `app/layout.tsx`), and a component that only learns about it
 * after hydration would paint the hero and then yank it away.
 *
 *   data-intro="playing"  a full opening sequence is running; the hero must stay
 *                         laid out but invisible (`[data-arrival-hidden]`).
 *   data-intro="done"     nothing to wait for — the hero plays its own reveal,
 *                         or sits in its steady state under reduced motion.
 *
 * The attribute is never removed, only flipped, and `BOOT_SCRIPT` arms a 4.5s
 * fuse that forces it to `done`: a bundle that fails to load can make the
 * opening sequence disappear, but it must never be able to leave the first
 * screen permanently blank.
 */

export const INTRO_ATTR = 'data-intro';
export const INTRO_DONE_EVENT = 'vc:intro-done';
export const INTRO_SEEN_KEY = 'vc-intro-seen';

export type IntroState = 'playing' | 'done';

/** SSR-safe read of the gate. Defaults to `done` so a server render never hides the hero. */
export function readIntroState(): IntroState {
  if (typeof document === 'undefined') return 'done';
  return document.documentElement.getAttribute(INTRO_ATTR) === 'playing' ? 'playing' : 'done';
}

/** Remember that this tab has already been through the opening sequence. */
export function markIntroSeen(): void {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    // Private mode / storage disabled: the sequence simply plays again next load.
  }
}

/**
 * Close the gate. Idempotent, and a no-op dispatch when it was already closed —
 * so the hero can subscribe without having to distinguish "skipped" from
 * "handed over".
 */
export function finishIntro(): void {
  if (typeof document === 'undefined') return;

  markIntroSeen();

  const root = document.documentElement;
  const wasOpen = root.getAttribute(INTRO_ATTR) !== 'done';
  root.setAttribute(INTRO_ATTR, 'done');

  if (wasOpen) {
    document.dispatchEvent(new CustomEvent(INTRO_DONE_EVENT));
  }
}

/**
 * Run `callback` once the gate is closed — on the next frame if it already is,
 * otherwise on the hand-off event. Returns the usual unsubscribe function.
 */
export function whenIntroDone(callback: () => void): () => void {
  if (typeof document === 'undefined') return () => {};

  if (readIntroState() === 'done') {
    const frame = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(frame);
  }

  const handler = () => callback();
  document.addEventListener(INTRO_DONE_EVENT, handler, { once: true });
  return () => document.removeEventListener(INTRO_DONE_EVENT, handler);
}

/** CSS custom properties the opening sequence publishes so the hero can FLIP from its wordmark. */
export const INTRO_BOX_VARS = {
  x: '--intro-vc-x',
  y: '--intro-vc-y',
  w: '--intro-vc-w',
  h: '--intro-vc-h',
} as const;

export type IntroBox = { x: number; y: number; w: number; h: number };

/** Publish the measured rectangle of the outgoing `VC.`, in viewport pixels. */
export function publishIntroBox(box: IntroBox): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty(INTRO_BOX_VARS.x, `${Math.round(box.x)}px`);
  root.style.setProperty(INTRO_BOX_VARS.y, `${Math.round(box.y)}px`);
  root.style.setProperty(INTRO_BOX_VARS.w, `${Math.round(box.w)}px`);
  root.style.setProperty(INTRO_BOX_VARS.h, `${Math.round(box.h)}px`);
}

/** Read it back, or `null` when nothing was published (fuse fired, reduced motion, …). */
export function readIntroBox(): IntroBox | null {
  if (typeof document === 'undefined') return null;

  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => Number.parseFloat(style.getPropertyValue(name));

  const x = read(INTRO_BOX_VARS.x);
  const y = read(INTRO_BOX_VARS.y);
  const w = read(INTRO_BOX_VARS.w);
  const h = read(INTRO_BOX_VARS.h);

  if (![x, y, w, h].every((value) => Number.isFinite(value) && value > 0)) return null;

  return { x, y, w, h };
}
