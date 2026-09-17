'use client';

import type { CSSProperties } from 'react';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { Band, Container, Eyebrow } from '@/components/primitives';
import { featuredProjects } from '@/content/projects';
import { FeaturedProjectBlock, type FeaturedProjectLayout } from '@/components/work/FeaturedProjectBlock';
import { Reveal } from '@/components/motion/Reveal';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';

const layouts: FeaturedProjectLayout[] = ['hero', 'split-left', 'split-right', 'wide'];

/** The home-page sales sequence: one dominant proof point, then three contrasts. */
export function FeaturedWorks() {
  const profile = useDeviceProfile();
  const curveMotion = profile.ready && !profile.static && profile.tier === 'high';
  const rootRef = useGsapScope<HTMLDivElement>(
    ({ gsap, root }) => {
      const curve = root.querySelector<HTMLElement>('.band-curve-top');
      if (!curve) return;

      /*
       * The arch grows as the light band gives way to the dark one.
       *
       * Two things matter here. The range is wide on purpose — 12svh to 28svh
       * is a 2.3× change, enough to read as "the arch is growing" rather than
       * as a slightly different curve. And the trigger ends at `top 55%`, so
       * the growth finishes while the seam is still in the lower half of the
       * viewport; ending it at `top 15%` (as it used to) meant the whole change
       * played out above the fold and the arch simply looked static.
       */
      gsap.fromTo(
        root,
        { '--band-curve-height': '12svh' },
        {
          '--band-curve-height': '28svh',
          ease: 'none',
          scrollTrigger: {
            trigger: curve,
            start: 'top bottom',
            end: 'top 55%',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { deps: [curveMotion], disabled: !curveMotion },
  );

  return (
    // 20svh sits mid-way through the 12→28svh scrub, so the resting state
    // (no JS, reduced motion, weak devices) is the neutral arch.
    // `curve-over-poster` lifts this band above the poster's positioned verbs and
    // drops its paper underlay, so the arch *covers* the finished poster instead
    // of the box's flat top edge slicing across it (see globals.css).
    <div
      ref={rootRef}
      className="curve-over-poster"
      style={{ '--band-curve-height': '20svh' } as CSSProperties}
    >
      <Band id="work" tone="ink" container={false} className="band-curve-top">
        <Container className="min-w-0">
          <div className="max-w-[68rem]">
            <Reveal variant="fade">
              <Eyebrow>
                <BiOnly zh="精选作品" en="SELECTED WORK" />
              </Eyebrow>
            </Reveal>
            <Reveal variant="masked" delay={75}>
              <Bi
                as="h2"
                zh="四个旗舰项目，四种问题意识；先看古格，再看 VC 如何把不同媒介做成真实体验。"
                en="FOUR PROJECTS. FOUR DIFFERENT PROBLEMS."
                hideSecondary
                primaryClassName="type-lg type-display tone-fg mt-7 block"
              />
            </Reveal>
            <Reveal variant="rise" delay={150}>
              <Bi
                as="p"
                zh="FOUR PROJECTS. FOUR DIFFERENT PROBLEMS."
                en="四个旗舰项目，四种问题意识；先看古格，再看 VC 如何把不同媒介做成真实体验。"
                hideSecondary
                primaryClassName="type-label tone-mute mt-5 block max-w-[70ch]"
              />
            </Reveal>
          </div>

          <div className="mt-[clamp(5rem,13vw,13rem)] grid gap-[clamp(9rem,19vw,22rem)]">
            {featuredProjects.map((project, index) => (
              <FeaturedProjectBlock
                key={project.slug}
                project={project}
                index={index}
                priority={index === 0}
                layout={layouts[index]}
              />
            ))}
          </div>
        </Container>
      </Band>
    </div>
  );
}
