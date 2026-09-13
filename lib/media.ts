import mediaJson from '@/content/media.json';
import type { MediaRef } from '@/content/types';

/**
 * Media resolution.
 *
 * The asset pipeline emits `public/works/_manifest.json`, which
 * `scripts/sync-manifest.mjs` copies to `content/media.json` so it can be
 * statically imported. This module turns a manifest key into everything
 * `<VcImage>` needs: a `<picture>` source set, a fallback, an LQIP and an aspect
 * ratio for CLS-free layout.
 *
 * The manifest is a **static JSON import**, not a `readFileSync`. That is
 * deliberate: `VcImage` is a client component, so anything this module touches
 * ships to the browser. Reading the file with `node:fs` would drag Node builtins
 * into the client graph and break the Turbopack build outright. The tradeoff is
 * ~20 KB of path data in the client bundle (a few KB gzipped), which is the price
 * of resolving responsive sources without a server round trip.
 *
 * A missing key is not a crash: `VcImage` renders a labelled placeholder, which
 * keeps previews buildable while assets are still being produced.
 */

export interface ManifestEntry {
  src: string;
  original: { width: number; height: number; bytes: number };
  aspect: number;
  widths: number[];
  webp: string[];
  avif: string[];
  lqip: string;
  fallback: string;
}

export type MediaManifest = Record<string, ManifestEntry>;

export const mediaManifest = mediaJson as MediaManifest;

/** Path prefix for everything the asset pipeline writes. */
export const WORKS_BASE = '/works';

export function getMedia(key: string): ManifestEntry | undefined {
  return mediaManifest[key];
}

export function hasMedia(key: string): boolean {
  return key in mediaManifest;
}

export function mediaUrl(relativePath: string): string {
  return `${WORKS_BASE}/${relativePath.replace(/^\/+/, '')}`;
}

/** `srcset` string for one format, e.g. `…-480.webp 480w, …-768.webp 768w`. */
export function buildSrcSet(entry: ManifestEntry, format: 'webp' | 'avif'): string | undefined {
  const files = format === 'webp' ? entry.webp : entry.avif;
  if (!files?.length) return undefined;
  return files
    .map((file, i) => {
      const width = entry.widths[i] ?? entry.original.width;
      return `${mediaUrl(file)} ${width}w`;
    })
    .join(', ');
}

export interface ResolvedMedia {
  key: string;
  alt: string;
  caption?: string;
  focal: string;
  aspect: number;
  width: number;
  height: number;
  webpSrcSet?: string;
  avifSrcSet?: string;
  src: string;
  lqip?: string;
  /** True when the manifest has no entry and a placeholder must be drawn. */
  missing: boolean;
}

/**
 * Resolves a `MediaRef` into render-ready props. Always returns a value so that
 * components never have to branch on missing assets.
 */
export function resolveMedia(ref: MediaRef): ResolvedMedia {
  const entry = getMedia(ref.key);
  const fallbackAspect = ref.aspect ?? 16 / 9;

  if (!entry) {
    return {
      key: ref.key,
      alt: ref.alt,
      caption: ref.caption,
      focal: ref.focal ?? '50% 50%',
      aspect: fallbackAspect,
      width: 1600,
      height: Math.round(1600 / fallbackAspect),
      src: '',
      missing: true,
    };
  }

  const aspect = ref.aspect ?? entry.aspect ?? fallbackAspect;
  const width = entry.original.width;
  const height = entry.original.height || Math.round(width / aspect);

  return {
    key: ref.key,
    alt: ref.alt,
    caption: ref.caption,
    focal: ref.focal ?? '50% 50%',
    aspect,
    width,
    height,
    webpSrcSet: buildSrcSet(entry, 'webp'),
    avifSrcSet: buildSrcSet(entry, 'avif'),
    src: mediaUrl(entry.fallback),
    lqip: entry.lqip ? mediaUrl(entry.lqip) : undefined,
    missing: false,
  };
}

/** Default `sizes` per usage pattern — keeps srcset selection honest. */
export const MEDIA_SIZES = {
  /** Full-bleed hero / full-width band. */
  full: '100vw',
  /** Half-width column that stacks to full width on mobile. */
  half: '(max-width: 768px) 100vw, 50vw',
  /** Card in a 2-up grid. */
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  /** Small offset image. */
  inset: '(max-width: 768px) 100vw, 38vw',
  /** Fixed-ish thumbnail in the capability reel. */
  reel: '(max-width: 640px) 78vw, (max-width: 1280px) 42vw, 30vw',
} as const;
