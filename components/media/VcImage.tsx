'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaRef } from '@/content/types';
import { MEDIA_SIZES, resolveMedia } from '@/lib/media';
import { cx } from '@/lib/utils';

/**
 * The site's single image primitive.
 *
 * It renders a real `<picture>` element against the pre-generated AVIF/WebP/JPEG
 * derivatives rather than going through `next/image`. Two reasons:
 *
 * - the asset pipeline already produced exactly the widths and formats we want,
 *   so a second optimizer at request time would be pure overhead;
 * - the site must stay portable to Tencent EdgeOne Pages, where a Vercel-style
 *   image endpoint does not exist.
 *
 * CLS is prevented structurally: the wrapper always reserves space from the
 * intrinsic aspect ratio, and the LQIP is painted as a CSS background behind the
 * real bitmap so there is never an empty box.
 */
export interface VcImageProps {
  media: MediaRef;
  /** Responsive `sizes` hint. Use a `MEDIA_SIZES` preset or pass your own. */
  sizes?: string;
  className?: string;
  /** Wrapper class — the reserved-ratio box. */
  wrapperClassName?: string;
  /** Set on above-the-fold imagery only. */
  priority?: boolean;
  /** Override the derived aspect ratio. */
  aspect?: number;
  /**
   * How the bitmap fills its reserved box. Defaults to `cover`.
   *
   * `contain` exists for artwork whose whole frame IS the work — a phone UI
   * screenshot cropped to a landscape tile loses 70% of the interface, which is
   * the opposite of showing the work. The reserved box keeps its ratio and the
   * image sits inside it complete; the surrounding surface is the same paper the
   * screenshots were shot on, so it reads as one plane rather than a letterbox.
   */
  fit?: 'cover' | 'contain';
  /**
   * Art direction: a different asset for wide viewports.
   *
   * Emitted as `<source media="…">` inside the existing `<picture>`, so the
   * browser downloads exactly one of the two files. That matters here — the
   * alternative (two `<VcImage>`s toggled by `hidden`/`lg:block`) makes phones
   * fetch the desktop hero as well, on the LCP element.
   *
   * The reason it is needed at all: `guge/hero/site_and_meido` is a 3.19:1
   * banner, and the phone plate is a 54vh box (0.86:1). `cover` kept 27% of the
   * frame — a soft, characterless slice of rock with the protagonist outside it.
   */
  art?: { media: MediaRef; from: string };
  /** Fill the parent instead of reserving ratio (parent must be positioned). */
  fill?: boolean;
  /** Rounded corners etc. applied to the inner image. */
  imgClassName?: string;
}

export function VcImage({
  media,
  sizes = MEDIA_SIZES.full,
  className,
  wrapperClassName,
  priority = false,
  aspect,
  fill = false,
  fit = 'cover',
  art,
  imgClassName,
}: VcImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const resolved = resolveMedia(media);
  const wide = art ? resolveMedia(art.media) : null;
  const ratio = aspect ?? resolved.aspect;

  /*
   * Cached images never fire `onLoad`.
   *
   * When the bitmap is already in the HTTP cache (a re-visit, a client-side
   * navigation back to a page, or a second instance of the same asset) the
   * browser can complete it before React attaches the handler, so `onLoad` is
   * never called and the image stays at opacity 0 — the visitor sees the LQIP
   * blur forever while a perfectly good bitmap sits behind it.
   *
   * Checking `complete` on mount closes that hole.
   */
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [media.key]);

  // A missing manifest entry must never look like a bug to a visitor. It renders
  // as an intentional hairline plate carrying the image's description, which is
  // also what a screen reader would have heard anyway.
  if (resolved.missing) {
    return (
      <div
        className={cx(
          'flex items-end overflow-hidden border border-dashed border-[var(--tone-line)] bg-[var(--tone-surface)]',
          // Same mutual exclusion as the main branch below: never both.
          fill ? 'absolute inset-0' : 'relative w-full',
          wrapperClassName,
          className,
        )}
        style={fill ? undefined : { aspectRatio: String(ratio) }}
      >
        <div className="p-5 md:p-7">
          <p className="type-label-sm tone-mute">ASSET PENDING</p>
          <p className="type-body mt-2 max-w-[42ch] opacity-70">{media.alt}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        /*
         * `relative` and `absolute` are mutually exclusive, so only one of them
         * may ever be emitted.
         *
         * They used to both be present: the base list hard-coded `relative` while
         * the `fill` branch appended `absolute inset-0`. Which one wins is decided
         * by their order in Tailwind's output, not by the class string — and
         * `relative` won. A relatively positioned box with `inset: 0` is not
         * sized by it, and the only child is absolutely positioned (out of flow),
         * so the wrapper collapsed to height 0 and `fill` silently rendered
         * nothing. It went unnoticed because nothing used `fill` until the
         * filmstrip did.
         */
        'overflow-hidden bg-[var(--tone-surface)]',
        fill ? 'absolute inset-0' : 'relative w-full',
        wrapperClassName,
        className,
      )}
      style={
        fill
          ? undefined
          : {
              aspectRatio: String(ratio),
              ...(resolved.lqip
                ? {
                    backgroundImage: `url(${resolved.lqip})`,
                    backgroundSize: 'cover',
                    backgroundPosition: resolved.focal,
                  }
                : {}),
            }
      }
    >
      {/*
        The <picture> is taken out of flow and pinned to the ratio box.

        This is not cosmetic — it fixes a whole class of layout bug. A replaced
        element keeps its intrinsic width as its *min-content* contribution, and
        `max-width: 100%` does not constrain that (the containing block is
        indefinite during min-content sizing). So an `<img width={1600}>` inside a
        grid item made the track resolve to ~1100px inside a 390px viewport, and
        because the page sets `overflow-x: clip` the result was not a scrollbar
        but silently *cropped* content.

        An absolutely positioned replaced element is out of flow and contributes
        zero min-content, which kills the problem for every usage at once. The
        wrapper already reserves space with `aspect-ratio`, so nothing is lost.
      */}
      <picture className="absolute inset-0 block">
        {wide && art && wide.avifSrcSet ? (
          <source media={art.from} type="image/avif" srcSet={wide.avifSrcSet} sizes={sizes} />
        ) : null}
        {wide && art && wide.webpSrcSet ? (
          <source media={art.from} type="image/webp" srcSet={wide.webpSrcSet} sizes={sizes} />
        ) : null}
        {resolved.avifSrcSet ? (
          <source type="image/avif" srcSet={resolved.avifSrcSet} sizes={sizes} />
        ) : null}
        {resolved.webpSrcSet ? (
          <source type="image/webp" srcSet={resolved.webpSrcSet} sizes={sizes} />
        ) : null}
        <img
          ref={imgRef}
          src={resolved.src}
          alt={resolved.alt}
          width={resolved.width}
          height={resolved.height}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          // On failure the LQIP stays visible rather than the browser's broken
          // image glyph: the derivative 404ing means the LQIP is usually missing
          // too, and `_build/shoot.mjs` reports broken images separately.
          onError={() => setLoaded(false)}
          // The fade-in is driven entirely by CSS, gated on `[data-js='on']` and
          // this attribute. React must NOT emit an `opacity-0` class: the server
          // renders this markup, and a baked-in hidden state would make every
          // image on the site invisible to a visitor without scripting.
          data-vc-media=""
          data-loaded={loaded ? 'true' : undefined}
          style={{ objectPosition: resolved.focal, objectFit: fit }}
          className={cx('media-cover transition-opacity duration-[900ms] ease-[var(--ease-vc-out)]', imgClassName)}
        />
      </picture>
    </div>
  );
}

/** Optional Chinese caption rendered under an image. */
export function MediaCaption({ children, className }: { children: React.ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p className={cx('type-label-sm tone-mute mt-3 max-w-[52ch] leading-relaxed', className)}>
      {children}
    </p>
  );
}
