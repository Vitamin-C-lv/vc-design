import localFont from 'next/font/local';

/**
 * Self-hosted webfonts.
 *
 * The WOFF2 files next to this module are vendored by
 * `node scripts/fetch-fonts.mjs`, so the running site makes **zero** third-party
 * font requests. That matters twice over: first paint on mainland-China networks
 * (no `fonts.gstatic.com` round trip), and WeChat WebView, which is slow and
 * inconsistent about external font hosts.
 *
 * Two deliberate choices:
 *
 * - **Latin only.** `latin-ext` is dead weight for an English + Chinese site.
 * - **No CJK webfont.** Chinese renders through the system stack declared in
 *   `globals.css` (PingFang SC / HarmonyOS Sans / Microsoft YaHei …). A full CJK
 *   face is several megabytes and would eat the entire mobile budget, while the
 *   system faces are the ones Chinese readers already see everywhere — and they
 *   hint better at small sizes.
 *
 * IMPORTANT — two constraints imposed by Next's font loader:
 *
 * 1. `localFont()` is a **compile-time** transform. It must be called at module
 *    scope and assigned to a `const`; it cannot be called inside a loop, a
 *    `.map()` or a function.
 * 2. `src` is resolved **relative to the file that calls it**, which is why this
 *    module lives in `app/fonts/` next to the `.woff2` files. Do not move these
 *    calls into `lib/`.
 */

/** Display face: English headlines, the `VC` wordmark, project titles. */
export const displayFont = localFont({
  src: './archivo-latin.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-vc-display',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: 'Arial',
});

/** Text face: UI, body copy and English accents. */
export const sansFont = localFont({
  src: './inter-latin.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-vc-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: 'Arial',
});

/** Mono face: eyebrows, tags, indices and metadata. */
export const monoFont = localFont({
  src: './jetbrains-mono-latin.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-vc-mono',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
  adjustFontFallback: 'Arial',
});

/** Space-separated `className` string applied to `<html>` in the root layout. */
export const fontVariables = [displayFont.variable, sansFont.variable, monoFont.variable].join(' ');

/** Per-family class names, for the rare case where only one face is wanted. */
export const fontClassNames = {
  display: displayFont.className,
  sans: sansFont.className,
  mono: monoFont.className,
} as const;
