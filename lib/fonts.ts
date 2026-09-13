/**
 * Re-export of the vendored font setup.
 *
 * The real module lives at `app/fonts/index.ts` because `next/font/local`
 * resolves font paths relative to the file that calls `localFont()` — the calls
 * have to sit next to the WOFF2 files. This shim exists so the rest of the app
 * can keep importing fonts from `@/lib/fonts`.
 */
export { fontVariables, fontClassNames, displayFont, sansFont, monoFont } from '@/app/fonts';
