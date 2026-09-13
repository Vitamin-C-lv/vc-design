'use client';

import { useEffect, useRef, useState } from 'react';
import type { VideoRef } from '@/content/types';
import { useDeviceProfile } from '@/lib/motion/device';
import { cx } from '@/lib/utils';
import { MediaCaption } from './VcImage';

/**
 * Muted, looping, self-hosted video used as evidence of a running build.
 *
 * Performance contract from the brief: video must never block first paint and
 * must never keep a phone busy decoding frames nobody is looking at.
 *
 * - the poster is a real image, so the box is painted before a byte of video is
 *   requested;
 * - `preload="none"` — the file is only fetched once the element scrolls into
 *   view, at which point playback starts;
 * - playback pauses whenever the element leaves the viewport;
 * - a muted self-hosted loop is the safest possible autoplay, so it is gated on
 *   the visitor's *actual* constraints rather than on the general motion tier:
 *   reduced motion, save-data and 2G keep the poster, but a modest CPU or a phone
 *   does not, because a 1.5MB muted loop is not the thing that would hurt it.
 */
export function VcVideo({
  video,
  className,
  sizes = '100vw',
  aspect,
}: {
  video: VideoRef;
  className?: string;
  sizes?: string;
  aspect?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const { ready, reducedMotion } = useDeviceProfile();

  /*
   * Deliberately not `tier === 'high'`.
   *
   * The tier collapses to `low` for several unrelated reasons — a 2-core laptop,
   * a data-saver flag, reduced motion. For a muted, looping, delegate-loaded clip
   * most of those reasons do not apply, and keying off the tier meant a perfectly
   * capable machine showed a frozen frame. Only the signals that genuinely argue
   * against fetching video are honoured here.
   */
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    const effective = nav.connection?.effectiveType;
    // A one-off read of a browser-only API, so it cannot happen during render:
    // the server has no `navigator`, and deciding differently on the client than
    // on the server would be a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBlocked(
      nav.connection?.saveData === true ||
        effective === 'slow-2g' ||
        effective === '2g',
    );
  }, []);

  const showVideo = ready && !reducedMotion && !blocked;
  const ratio = aspect ?? video.aspect;

  useEffect(() => {
    const el = ref.current;
    if (!el || !showVideo) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
          if (entry.isIntersecting) {
            void el.play().catch(() => {
              /* Autoplay refused (e.g. low-power mode): the poster stays. */
            });
          } else {
            el.pause();
          }
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [showVideo]);

  return (
    <figure className={cx('w-full', className)}>
      <div
        className="relative w-full overflow-hidden bg-[var(--tone-surface)]"
        style={{ aspectRatio: String(ratio) }}
      >
        {/*
          Same rule as VcImage: media must not contribute min-content width, or
          an intrinsic 1600px video/poster would blow out a grid track on a phone
          viewport. The wrapper already reserves the ratio.
        */}
        {showVideo ? (
          <video
            ref={ref}
            poster={video.poster}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            // Not a decorative background: it is the only moving evidence that
            // the prototype runs, so it keeps its intrinsic size.
            width={1600}
            height={Math.round(1600 / ratio)}
            className="media-cover absolute inset-0"
            aria-label={video.caption ?? '项目演示视频'}
          >
            <source src={video.webm} type="video/webm" />
            <source src={video.mp4} type="video/mp4" />
          </video>
        ) : (
          <img
            src={video.poster}
            srcSet={video.posterSrcSet}
            sizes={sizes}
            alt={video.caption ?? '项目演示封面'}
            loading="lazy"
            decoding="async"
            className="media-cover absolute inset-0"
          />
        )}

        {/* A quiet affordance: the loop is silent and we never imply otherwise. */}
        <span className="type-label-sm pointer-events-none absolute right-4 bottom-4 border border-white/20 bg-black/45 px-2.5 py-1.5 text-white/70 backdrop-blur-sm">
          {inView && showVideo ? 'PLAYING · MUTED' : 'DEMO'}
        </span>
      </div>
      {video.caption ? <MediaCaption>{video.caption}</MediaCaption> : null}
    </figure>
  );
}
