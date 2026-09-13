'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Project } from '@/content/types';
import { VcImage } from '@/components/media/VcImage';
import { VcVideo } from '@/components/media/VcVideo';
import { ParticleVessel } from '@/components/qinghua/ParticleVessel';
import { EmbeddedProduct } from './EmbeddedProduct';
import { useDeviceProfile } from '@/lib/motion/device';
import { MEDIA_SIZES, getMedia, mediaUrl, resolveMedia } from '@/lib/media';
import { cx } from '@/lib/utils';
import { useNearViewport } from '@/lib/motion/nearViewport';

/**
 * The work itself, running on the home page.
 *
 * The sales argument is "we make things that actually work", and a still frame of
 * a product cannot make that argument — the reader has to take it on faith and
 * click to check. So where a project genuinely shipped something interactive, the
 * home page runs it: 观潮's real interface, 青花造境's live point cloud, 古格's
 * captured loop. The visitor operates the work before deciding to read about it.
 *
 * ── What keeps this from wrecking the home page ──────────────────────────────
 * Every heavy path is gated, using the same machinery the case pages already rely
 * on rather than a second set of rules:
 *
 * - **Nothing loads until it is nearly on screen.** A near-viewport latch flips
 *   `near`; only then is a particle runtime imported, an iframe `src` attached,
 *   or a video fetched. Until that moment this is a static cover, so the home
 *   page's first paint is unchanged.
 * - **Weak devices keep the cover, permanently.** The existing device profile
 *   classifies tier and reduced-motion. Below `high`, this never upgrades — asking
 *   a low-end phone for several WebGL canvases and a nested application is not a
 *   reasonable trade for a marketing page.
 * - **The cover is the loading state.** It paints first and stays if anything
 *   fails, so a project whose live surface cannot start degrades to exactly the
 *   picture the site shipped before, never to an empty box.
 * - **The route into the case study survives as a real link.** It sits above the
 *   live surface rather than wrapping it: wrapping would mean every attempt to
 *   operate the embedded product navigates away instead.
 *
 * ── Framing is per kind, not per layout ──────────────────────────────────────
 * Each artefact dictates its own frame. The particle vessel renders square by
 * construction (that is how its point cloud is projected). 观潮 is a
 * desktop-density dashboard that stops making sense when squeezed towards square.
 * The 古格 loop was cut for a wide hero. Forcing one ratio on all three would crop
 * the thing that is supposed to be the proof.
 */
export type LiveMediaKind = 'particle' | 'embed' | 'video';

/** The frame each kind wants, in width ÷ height. */
export const LIVE_ASPECT: Record<LiveMediaKind, number> = {
  particle: 1,
  embed: 1.6,
  video: 1.55,
};

/** Which live surface, if any, this project can run on the home page. */
export function liveMediaFor(project: Project): LiveMediaKind | null {
  if (project.particle) return 'particle';
  if (project.sections.some((section) => section.embed)) return 'embed';
  if (project.video) return 'video';
  return null;
}

/** The renderer's own fallback capture, when the project ships one. */
function particleFallback(project: Project): { src: string; alt: string } | undefined {
  const ref = project.particle?.fallback;
  if (!ref) return undefined;
  const entry = getMedia(ref.key);
  const src = entry
    ? mediaUrl(entry.webp[Math.min(2, entry.webp.length - 1)] ?? entry.fallback)
    : resolveMedia(ref).src;
  return src ? { src, alt: ref.alt } : undefined;
}

export function ProjectLiveMedia({
  project,
  kind,
  priority = false,
  sizes = MEDIA_SIZES.full,
  className,
}: {
  project: Project;
  kind: LiveMediaKind;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const profile = useDeviceProfile();
  const [liveReady, setLiveReady] = useState(false);

  // Below the top tier this stays a still image, on purpose. See the note above.
  const capable = profile.ready && !profile.static && profile.tier === 'high';
  const { ref: rootRef, near } = useNearViewport<HTMLDivElement>();

  useEffect(() => {
    if (kind !== 'particle' || !near || !capable) return;

    let cancelled = false;
    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const warmThree = () => {
      if (!cancelled) void import('three');
    };

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(warmThree);
    } else {
      timeoutId = window.setTimeout(warmThree, 800);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [capable, kind, near]);

  const embed = project.sections.find((section) => section.embed)?.embed;
  const live = near && capable;

  return (
    <div
      ref={rootRef}
      className={cx('relative min-w-0 overflow-hidden', className)}
      style={{ aspectRatio: String(LIVE_ASPECT[kind]) }}
    >
      {/* Base plate: this is both the first paint and the failure mode. */}
      <VcImage
        media={project.cover}
        sizes={sizes}
        priority={priority}
        fill
        imgClassName={cx(
          'transition-opacity duration-700',
          liveReady ? 'opacity-0' : 'opacity-100',
        )}
      />

      {live && kind === 'particle' && project.particle ? (
        <ParticleVessel
          model={project.particle.stages[0]?.model}
          stage={project.particle.stages[0]?.id}
          framing="wide"
          fallbackSrc={particleFallback(project)?.src}
          fallbackAlt={particleFallback(project)?.alt}
          onLive={() => setLiveReady(true)}
          // The vessel projects square; stretching the container would distort the
          // cloud, so it is centred at full height and allowed to letterbox.
          className="!aspect-auto absolute inset-0 m-auto h-full"
        />
      ) : null}

      {live && kind === 'embed' && embed ? (
        <EmbeddedProduct
          src={embed.src}
          title={embed.title}
          poster={embed.poster}
          openLabel={embed.openLabel}
          heightClassName="h-full"
          onLive={() => setLiveReady(true)}
          // The chrome (label + open link) belongs to the case page, not here.
          className="absolute inset-0 [&>div:first-child]:hidden"
        />
      ) : null}

      {live && kind === 'video' && project.video ? (
        <VcVideo
          video={project.video}
          sizes={sizes}
          onLive={() => setLiveReady(true)}
          className="absolute inset-0 h-full w-full"
        />
      ) : null}

      {/*
        A real link, on top of the live surface — so the case study is always one
        click away, and the live content underneath still receives its own pointer
        events everywhere the badge is not.
      */}
      <Link
        href={`/work/${project.slug}`}
        aria-label={`查看${project.titleZh}详情`}
        className="type-label-sm absolute right-3 top-3 z-10 inline-flex items-center gap-2 border border-[var(--tone-line)] bg-[var(--tone-bg)]/75 px-2.5 py-1.5 text-[var(--tone-fg)] backdrop-blur-sm transition-colors duration-500 hover:border-[var(--tone-accent)] hover:text-[var(--tone-accent)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--tone-accent)]"
      >
        进入案例
        <span aria-hidden>↗</span>
      </Link>
    </div>
  );
}
