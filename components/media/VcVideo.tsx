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
 * - on a `low` tier device, or with reduced motion, the poster is shown on its
 *   own and the video is never fetched at all.
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
  const { ready, tier, static: isStatic } = useDeviceProfile();

  const showVideo = ready && tier === 'high' && !isStatic;
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
