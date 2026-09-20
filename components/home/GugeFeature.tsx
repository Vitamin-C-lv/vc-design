'use client';

import Link from 'next/link';
import { useRef, type CSSProperties } from 'react';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { TagList } from '@/components/primitives';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { VcImage } from '@/components/media/VcImage';
import { Reveal } from '@/components/motion/Reveal';
import type { MediaRef, Project } from '@/content/types';
import { headlineWeight, splitHeadline } from '@/lib/headline';
import { MEDIA_SIZES } from '@/lib/media';
import { cx, pad2 } from '@/lib/utils';

/**
 * The flagship's home-page mini case.
 *
 * Guge is the widest project on the site — field research, world building, 3D,
 * a running VR build, an AI guide, and the exhibition design that explains all
 * of it. One cover image cannot carry that: whichever frame is chosen, a visitor
 * can reasonably file the whole thing under "culture-themed VR project".
 *
 * So the home page shows three slices and stops. Each slice is a capability with
 * real evidence behind it and links straight to the chapter that proves it. The
 * promise is made here; the case page is where it is kept.
 *
 * This is deliberately the largest block on the home page — the brief calls for
 * Guge to take the most room of the four flagships — but "largest" is spent on
 * the hero plate and the slice row, not on more paragraphs.
 */
/**
 * The home-page plate uses the finished horizontal poster, not `project.cover`.
 *
 * The cover is a 3200x1002 strip lifted off an exhibition board — 3.19:1 — so
 * *every* plate shape cropped it badly: at the generic 1.55 it kept 48% of the
 * width and sliced the figure down the right edge, and 1.9 was still a
 * compromise. The poster is 3152x1330 (2.37:1) and was composed for a wide
 * plate in the first place: massif on the left, Meido and the butter lamp in
 * the middle, the gold 梦回古格 calligraphy on the right.
 *
 * The plate carries the image's own aspect, so nothing is cropped at all —
 * which is the whole point of putting a finished poster there.
 */
const POSTER_PLATE: MediaRef = {
  key: 'guge/hero/poster_key',
  alt: '《梦回古格》横版主视觉海报：古格王朝遗址土林山体、主角梅朵手持酥油灯的半身像，以及右侧的金色书法标题',
};

export function GugeFeature({ project, priority = false }: { project: Project; priority?: boolean }) {
  const slices = project.homeSlices ?? [];
  const titleLines = splitHeadline(project.titleZh || project.title);
  const longestLine = Math.max(...titleLines.map(headlineWeight), 1);

  /*
   * No scroll transform on the plate — deliberately.
   *
   * There used to be a Ken Burns here: `scale 1 -> 1.14` with a `yPercent` drift,
   * scrubbed off the scroll. On a `cover`-filled box any `scale > 1` overflows
   * the frame, so the scrub was quietly cropping 7% off every edge — and it ate
   * the first characters of the poster's own fine print. A finished poster is a
   * laid-out artefact: moving it is cropping it. The masked reveal below still
   * wipes the plate in; the poster itself holds still.
   */
  const rootRef = useRef<HTMLElement>(null);

  const toneStyle = { '--tone-accent': project.accent } as CSSProperties;

  return (
    <article ref={rootRef} style={toneStyle} className="min-w-0 grid gap-8 md:gap-12">
      {/*
       * `bleed` goes on the Reveal, not on the plate inside it.
       *
       * `masked` wipes by putting `clip-path` on an inner `[data-reveal-mask]`
       * div. That div has no width of its own, so it takes the shell width —
       * while `bleed` pulls the plate out by `--shell-pad` on each side. The
       * clip-path then trimmed the plate back to the shell: the poster lost
       * ~88px per edge, along with the first characters of its own fine print.
       * `clip-path` clips descendants regardless of `overflow`. With `bleed` on
       * the Reveal the mask box and the plate box are the same width, so the
       * wipe clips nothing.
       */}
      <Reveal variant="masked" duration={1.15} className="bleed">
        <div data-guge-home-plate className="relative min-w-0">
          <VcImage
            media={POSTER_PLATE}
            sizes={MEDIA_SIZES.full}
            priority={priority}
            aspect={3152 / 1330}
            wrapperClassName="bg-[var(--tone-surface)]"
          />
        </div>
      </Reveal>

      <div className="grid min-w-0 gap-9 md:grid-cols-12 md:gap-x-10 lg:gap-x-16">
        <Reveal className="md:col-span-7" variant="rise" distance={1.25}>
          <div className="[container-type:inline-size]" style={{ '--headline-weight': longestLine } as CSSProperties}>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="type-label tone-accent-text border-t border-[var(--tone-accent)] pt-2">
                {pad2(project.order)}
              </span>
              {project.badge ? (
                <span className="type-label-sm tone-mute border-l border-[var(--tone-line)] pl-5">
                  {project.badge}
                </span>
              ) : null}
            </div>

            <div role="heading" aria-level={3} className="mt-7 md:mt-9">
              {titleLines.map((line, index) => (
                <Reveal key={`${line}-${index}`} variant="masked" delay={index * 75} duration={1.05}>
                  <Link
                    href={`/work/${project.slug}`}
                    className="link-underline tone-fg focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--tone-accent)]"
                  >
                    <Bi
                      as="span"
                      zh={line}
                      en={index === 0 ? project.title : ''}
                      hideSecondary
                      primaryClassName="type-xl type-column-fit type-display tone-fg block"
                    />
                  </Link>
                </Reveal>
              ))}
              <Bi
                as="span"
                zh={project.title}
                en={project.titleZh}
                hideSecondary
                primaryClassName="type-label tone-mute mt-4 block"
              />
            </div>
          </div>
        </Reveal>

        <Reveal className="md:col-span-4 md:col-start-9 md:pt-5" variant="rise" delay={100} distance={1}>
          <div className="grid gap-8 md:gap-10">
            <div>
              <Bi
                as="p"
                zh={project.taglineZh}
                en={project.tagline}
                hideSecondary
                primaryClassName="type-lead tone-fg max-w-[48ch]"
              />
              <Bi
                as="p"
                zh={project.tagline}
                en={project.taglineZh}
                hideSecondary
                primaryClassName="type-label tone-mute mt-3 block max-w-[62ch]"
              />
            </div>
            <TagList tags={project.tags} size="sm" />
            <ArrowLink href={`/work/${project.slug}`} variant="outline">
              <BiOnly zh="查看完整案例" en="VIEW CASE" />
            </ArrowLink>
          </div>
        </Reveal>
      </div>

      {/*
        The three slices. They are the whole point of this block: the page states
        what the project can do, shows one piece of evidence per claim, and hands
        the reader a link to the chapter where the claim is actually argued.
      */}
      {slices.length ? (
        <div className={cx('grid min-w-0 gap-8 sm:grid-cols-2', slices.length >= 3 && 'lg:grid-cols-3')}>
          {slices.map((slice, index) => (
            <Reveal key={slice.label} variant="masked" delay={index * 110} className="min-w-0">
              <Link
                href={`/work/${project.slug}#${slice.anchor}`}
                className="group block min-w-0"
              >
                <VcImage
                  media={slice.media}
                  sizes={MEDIA_SIZES.card}
                  aspect={4 / 3}
                  wrapperClassName="bg-[var(--tone-surface)]"
                />
                <span className="type-label tone-accent-text mt-5 block">{slice.label}</span>
                <span className="type-label-sm tone-fg-2 mt-3 block max-w-[38ch]">{slice.zh}</span>
                <span className="type-label-sm tone-mute mt-4 inline-flex items-center gap-2">
                  <span className="link-underline">查看这一章</span>
                  <span aria-hidden className="transition-transform duration-700 ease-[var(--ease-vc-out)] group-hover:translate-x-1.5">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : null}
    </article>
  );
}
