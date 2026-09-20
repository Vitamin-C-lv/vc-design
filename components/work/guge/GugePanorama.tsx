'use client';

import { useRef } from 'react';
import { VcImage, MediaCaption } from '@/components/media/VcImage';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';
import { MEDIA_SIZES, resolveMedia } from '@/lib/media';
import { cx } from '@/lib/utils';
import type { CaseSection, MediaRef } from '@/content/types';

/**
 * The drifting scroll itself.
 *
 * Deliberately not `<VcImage>`: that primitive reserves a fixed aspect-ratio box
 * and pins a `object-fit: cover` bitmap into it, which is exactly right for a
 * plate and exactly wrong here — the scroll has to keep its own 4:1 proportions
 * at a fixed height and let its *width* be whatever that implies, because the
 * drift distance is that width minus the viewport. Reusing the primitive would
 * have cropped the artwork to the container and left nothing to drift.
 */
function ScrollStrip({ media, className }: { media: MediaRef; className?: string }) {
  const resolved = resolveMedia(media);
  if (resolved.missing) return null;

  return (
    <picture className="block">
      {resolved.avifSrcSet ? (
        <source type="image/avif" srcSet={resolved.avifSrcSet} sizes="240vw" />
      ) : null}
      {resolved.webpSrcSet ? (
        <source type="image/webp" srcSet={resolved.webpSrcSet} sizes="240vw" />
      ) : null}
      <img
        src={resolved.src}
        alt={resolved.alt}
        width={resolved.width}
        height={resolved.height}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cx('block w-auto max-w-none', className)}
      />
    </picture>
  );
}

/**
 * A WORLD OF PEOPLE — the character scroll.
 *
 * The artwork is a single 4:1 scroll: a statue, a mother, a grandmother with the
 * guowoqin, the court muralist, the girl, the border guard and finally the
 * player. It is the clearest statement of what this project actually built — not
 * a reconstruction of a ruin, but a world with people in it.
 *
 * ── Why this is not a pinned horizontal section ─────────────────────────────
 * Long horizontal scroll-jacking is exactly the failure the brief calls out:
 * the visitor stops feeling the page move forward. So the scroll drifts only
 * while the chapter itself is still travelling up the page. The track moves a
 * little under the reader, the chapter keeps leaving, and the page never stops
 * advancing. Total drift is bounded to roughly one screen of scrolling.
 *
 * ── Two presentations, one asset set ────────────────────────────────────────
 * Wide screens get the whole scroll in one piece, drifting. Phones get the same
 * artwork cut into four reading segments (faith, family, the pair, the player),
 * because a 5916px scroll scaled to 390px is a thumbnail, not an image.
 */

const MOBILE_SEGMENT_LIMIT = 4;

export function GugePanorama({ section }: { section: CaseSection }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { ready, reducedMotion } = useDeviceProfile();

  /* Reduced motion keeps the artwork reachable by dragging it directly. */
  const draggable = ready && reducedMotion;

  const rootRef = useGsapScope<HTMLDivElement>(
    ({ gsap, root }) => {
      const track = trackRef.current;
      if (!track) return;
      const viewport = root.querySelector<HTMLElement>('[data-panorama-viewport]');
      if (!viewport) return;

      const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
      if (distance() <= 0) return;

      gsap.fromTo(
        track,
        { x: 0 },
        {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { deps: [section.id], disabled: !ready || reducedMotion },
  );

  const [scrollMedia, ...segments] = section.media ?? [];
  const mobileSegments = segments.slice(0, MOBILE_SEGMENT_LIMIT);

  return (
    <div ref={rootRef} className="min-w-0">
      {/* Wide screens: the whole scroll, drifting. */}
      <div className="hidden lg:block">
        <div
          data-panorama-viewport="true"
          className={cx(
            'w-full',
            draggable ? 'overflow-x-auto no-scrollbar' : 'overflow-hidden',
          )}
        >
          <div ref={trackRef} className="w-max">
            {scrollMedia ? <ScrollStrip media={scrollMedia} className="h-[46vh]" /> : null}
          </div>
        </div>
        <MediaCaption>{scrollMedia?.caption}</MediaCaption>
      </div>

      {/* Phones: the same artwork as four reading segments. */}
      <div className="space-y-12 lg:hidden">
        {mobileSegments.map((media, index) => (
          <figure key={media.key} className="min-w-0">
            <p className="type-label tone-accent-text mb-3">
              {String(index + 1).padStart(2, '0')}
            </p>
            <VcImage
              media={media}
              sizes={MEDIA_SIZES.full}
              wrapperClassName="bg-transparent"
              imgClassName="w-full"
            />
            <MediaCaption>{media.caption}</MediaCaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
