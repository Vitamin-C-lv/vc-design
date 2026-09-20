'use client';

import type { ReactNode } from 'react';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { MetaGrid, TagList } from '@/components/primitives';
import { VcImage } from '@/components/media/VcImage';
import { Reveal } from '@/components/motion/Reveal';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';
import type { CaseSection, Project, MediaRef } from '@/content/types';
import { MEDIA_SIZES } from '@/lib/media';
import { cx } from '@/lib/utils';

/**
 * 00 — DREAM GUGE. The project's first real entrance.
 *
 * This is the chapter that has to catch the brand crescendo the home page ends
 * on (the arch closing MAKE / SOLVE / BUILD), so it opens as a film rather than
 * as a case-study header: one full-bleed plate, one wordmark, four tags, and a
 * scroll cue. No paragraph, no facts panel — those follow immediately below,
 * once the picture has done its work.
 *
 * ── Why the wordmark is not language-switched ───────────────────────────────
 * Every other headline on the site obeys the language toggle. A wordmark does
 * not: it is the project's name, and a name does not translate. So 梦回古格 and
 * DREAM GUGE are both always on screen, the way the studio's own lockup is.
 *
 * ── Mobile ──────────────────────────────────────────────────────────────────
 * The plate becomes its own block and the type sits under it on solid ink. The
 * brief is explicit that a phone should never be handed a busy image with type
 * laid over it, and the Chinese wordmark at this size needs a clean bed.
 */

/**
 * The project's name, in both scripts, always.
 *
 * `type-xl` rather than `type-hero` on purpose. `type-hero` is sized for a
 * two-character wordmark (the studio's own VC lockup); at four characters and
 * 21vw it ran to roughly 1300px and covered the character in the plate — the
 * one element in this frame that carries any feeling. `type-xl` is the size the
 * other case studies give their titles, so the flagship now matches the family
 * and the picture is allowed to do its job.
 */
function Wordmark() {
  return (
    <h1 className="tone-fg">
      <span className="type-xl type-display block">梦回古格</span>
      <span className="type-label mt-4 block tracking-[0.42em] tone-accent-text">DREAM GUGE</span>
    </h1>
  );
}

function Line({ zh, en, className }: { zh: ReactNode; en: ReactNode; className?: string }) {
  return (
    <Bi
      as="div"
      className={className}
      hideSecondary
      zh={
        <>
          <span className="block">{zh}</span>
          <span className="type-label-sm tone-mute mt-3 block">{en}</span>
        </>
      }
      en={
        <>
          <span className="block">{en}</span>
          <span className="type-label-sm tone-mute mt-3 block">{zh}</span>
        </>
      }
    />
  );
}

export function GugeHero({ project, section }: { project: Project; section: CaseSection }) {
  const profile = useDeviceProfile();
  const motionDisabled = !profile.ready || profile.static || profile.tier === 'low';
  const plate = section.media?.[0];
  /*
   * The narrow-viewport plate.
   *
   * `site_and_meido` is a 3200x1002 banner (3.19:1) composed as massif-left,
   * figure-right. Phones and tablets give the plate a viewport-height box
   * (54vh / 62vh ≈ 0.86:1 and 1.21:1), where `cover` kept 27% and 38% of it —
   * the phone hero was a soft slice of rock with Meido outside the frame
   * entirely, which is the protagonist of the whole project.
   *
   * This is a purpose-cut 0.86:1 window of the same source holding both the
   * figure and part of the massif, so the phone hero shows the artwork instead
   * of a fragment of it. It is wired through `<picture><source media>` rather
   * than two stacked `VcImage`s deliberately: a second `<img>` hidden with
   * `lg:hidden` would still be the LCP download on phones.
   */
  const plateNarrow: MediaRef = {
    key: 'guge/hero/site_and_meido_portrait',
    alt: '古格王朝遗址土林与主角梅朵：梅朵手持酥油灯的半身像，背景是土林山体与洞窟',
    focal: '60% 45%',
  };

  const heroRef = useGsapScope<HTMLElement>(
    ({ gsap, root }) => {
      const image = root.querySelector<HTMLElement>('[data-guge-plate] img[data-vc-media]');
      const trigger = image?.closest('[data-guge-plate]');
      if (!image || !trigger) return;

      /*
       * One slow push-in tied to scroll, not a looping animation: the frame keeps
       * moving as long as the visitor keeps moving, and stops the moment they do.
       */
      gsap.fromTo(
        image,
        { scale: 1, yPercent: 4 },
        {
          scale: 1.12,
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger, start: 'top top', end: 'bottom top', scrub: 1.05 },
        },
      );

      gsap.fromTo(
        root.querySelectorAll('[data-guge-hero-line]'),
        { yPercent: 22, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.15,
          ease: 'power3.out',
          stagger: 0.09,
          delay: 0.15,
        },
      );
    },
    { deps: [section.id, plate?.key], disabled: motionDisabled },
  );

  const eyebrow = `FEATURED WORK ${String(project.order).padStart(2, '0')}`;

  return (
    <header ref={heroRef} className="min-w-0">
      <div className="flex items-center justify-between gap-6 pb-8">
        <ArrowLink href="/work" variant="ghost" noArrow>
          <BiOnly zh="← 返回全部案例" en="← ALL WORK" />
        </ArrowLink>
        <span className="type-label tone-mute">{project.year}</span>
      </div>

      {/* The plate. Full-bleed on both breakpoints; its own block on phones. */}
      {plate ? (
      <div className="bleed">
        <div
          data-guge-plate="true"
          /* 1.9:1 是这一章主视觉的构图裁切，不是塞错框——见下面的注释。 */
          data-audit-crop="desktop-hero-1.9"
          /*
           * Phones and tablets size the plate off the viewport — a tall plate
           * reads as a cover. Desktop pins the aspect instead: the plate is
           * full-bleed, so at `86vh` on a 2560-wide window it landed at 1.39:1
           * and `cover` threw away 57% of the key art, slicing the figure down
           * the right edge. 1.9 keeps 60% of the 3.19:1 banner — the whole
           * massif, the mural and the complete figure — which is what the
           * artwork was composed for.
           */
          className="relative h-[54vh] overflow-hidden bg-[var(--tone-surface)] md:h-[62vh] lg:h-auto lg:aspect-[1.9]"
        >
          <VcImage
            media={plateNarrow}
            art={{ media: plate, from: '(min-width: 1024px)' }}
            sizes={MEDIA_SIZES.full}
            priority
            fill
            wrapperClassName="bg-[var(--tone-surface)]"
          />
          {/* A restrained scrim so the type stays legible over the brightest frame. */}
          <div
            aria-hidden
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                'linear-gradient(to top, rgb(15 15 15 / 0.92) 0%, rgb(15 15 15 / 0.55) 34%, rgb(15 15 15 / 0) 62%)',
            }}
          />
          <div className="shell absolute inset-x-0 bottom-0 hidden pb-14 lg:block">
            <p data-guge-hero-line className="type-label tone-fg-2">
              {eyebrow}
            </p>
            <div data-guge-hero-line className="mt-5">
              <Wordmark />
            </div>
            <div data-guge-hero-line className="mt-7 max-w-2xl">
              <Line
                zh="古格王朝 AI 智能交互 VR 体验"
                en="An AI-driven interactive VR experience of the Guge Kingdom"
                className="type-lead tone-fg"
              />
            </div>
            <div data-guge-hero-line className="mt-8">
              <TagList tags={project.tags} size="sm" />
            </div>
          </div>
        </div>
      </div>
      ) : null}

      {/* Phones and tablets: the wordmark on solid ink, under the picture. */}
      <div className="pt-10 lg:hidden">
        <p className="type-label tone-mute">{eyebrow}</p>
        <div className="mt-5">
          <Wordmark />
        </div>
        <Line
          zh="古格王朝 AI 智能交互 VR 体验"
          en="An AI-driven interactive VR experience of the Guge Kingdom"
          className="type-lead tone-fg mt-7"
        />
        <TagList tags={project.tags} size="sm" className="mt-8" />
      </div>

      <div className="grid gap-12 pt-14 lg:grid-cols-12 lg:gap-8 lg:pt-20">
        <Reveal delay={80} className="lg:col-span-7">
          <div className="flex items-baseline gap-4">
            {project.badge ? (
              <p
                className={cx('type-label inline-flex border px-3 py-2')}
                style={{ borderColor: 'var(--tone-accent)', color: 'var(--tone-accent)' }}
              >
                {project.badge}
              </p>
            ) : null}
          </div>
          {project.summaryEn ? (
            <BiOnly
              zh={project.summaryEn}
              en={project.summaryEn}
              className="type-label-sm tone-mute mt-8 block max-w-[66ch]"
              as="p"
            />
          ) : null}
          <Line
            zh={project.summary}
            en={project.summary}
            className="type-lead tone-fg mt-6 max-w-[58ch]"
          />
        </Reveal>

        <Reveal delay={160} className="lg:col-span-5 lg:col-start-8">
          <MetaGrid rows={project.meta} />
        </Reveal>
      </div>
    </header>
  );
}
