'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { MetaGrid, TagList } from '@/components/primitives';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { Reveal } from '@/components/motion/Reveal';
import type { Project } from '@/content/types';
import { MEDIA_SIZES } from '@/lib/media';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';
import { cx, pad2 } from '@/lib/utils';
import { ProjectCard } from './ProjectCard';

export type FeaturedProjectLayout = 'hero' | 'split-left' | 'split-right' | 'wide';

export interface FeaturedProjectBlockProps {
  project: Project;
  index: number;
  priority: boolean;
  layout?: FeaturedProjectLayout;
}

function getLayout(index: number, layout?: FeaturedProjectLayout): FeaturedProjectLayout {
  if (layout) return layout;
  if (index === 0) return 'hero';
  if (index === 1) return 'split-left';
  if (index === 2) return 'split-right';
  return 'wide';
}

function splitTitle(title: string) {
  return title.split(/(?=AI|Daily|VC-AI|·)/).filter(Boolean);
}

function MotionReveal({
  children,
  className,
  disabled,
  variant = 'rise',
  delay = 0,
  duration,
  distance,
}: {
  children: React.ReactNode;
  className?: string;
  disabled: boolean;
  variant?: 'rise' | 'masked' | 'fade';
  delay?: number;
  duration?: number;
  distance?: number;
}) {
  if (disabled) return <div className={className}>{children}</div>;
  return (
    <Reveal
      className={className}
      variant={variant}
      delay={delay}
      duration={duration}
      distance={distance}
    >
      {children}
    </Reveal>
  );
}

function BilingualEcho({
  zh,
  en,
  primaryClassName,
  secondaryClassName,
  as = 'div',
}: {
  zh: React.ReactNode;
  en: React.ReactNode;
  primaryClassName: string;
  secondaryClassName: string;
  as?: 'div' | 'p' | 'span';
}) {
  return (
    <>
      <Bi as={as} zh={zh} en={en} hideSecondary primaryClassName={primaryClassName} />
      <Bi as={as} zh={en} en={zh} hideSecondary primaryClassName={secondaryClassName} />
    </>
  );
}

function ProjectHeading({ project, motionDisabled }: { project: Project; motionDisabled: boolean }) {
  const titleLines = splitTitle(project.titleZh);

  return (
    <div>
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
          <MotionReveal
            key={`${line}-${index}`}
            disabled={motionDisabled}
            variant="masked"
            delay={index * 75}
            duration={1.05}
          >
            <Link
              href={`/work/${project.slug}`}
              className="link-underline tone-fg focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--tone-accent)]"
            >
              <Bi
                as="span"
                zh={line}
                en={index === 0 ? project.title : ''}
                hideSecondary
                primaryClassName="type-xl type-display tone-fg block"
              />
            </Link>
          </MotionReveal>
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
  );
}

function ProjectDetails({ project }: { project: Project }) {
  return (
    <div className="grid gap-8 md:gap-10">
      <BilingualEcho
        zh={project.taglineZh}
        en={project.tagline}
        primaryClassName="type-lead tone-fg max-w-[48ch]"
        secondaryClassName="type-label tone-mute mt-3 block max-w-[62ch]"
      />

      <TagList tags={project.tags} size="sm" />

      <div className="hairline pt-5">
        <BilingualEcho
          zh={project.summary}
          en={project.summaryEn ?? project.tagline}
          primaryClassName="type-body tone-fg-2 max-w-[62ch]"
          secondaryClassName="type-label tone-mute mt-5 block max-w-[62ch]"
        />
      </div>

      <MetaGrid rows={project.meta.slice(0, 2)} columns={1} />

      {project.live?.length ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          {project.live.map((live) => (
            <div key={live.url}>
              <ArrowLink href={live.url} external variant="outline">
                <BiOnly zh="打开体验" en={live.label} />
              </ArrowLink>
              {live.note ? <p className="type-label-sm tone-mute mt-3 max-w-[30ch]">{live.note}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** One editorially composed flagship block on the home page. */
export function FeaturedProjectBlock({ project, index, priority, layout: requestedLayout }: FeaturedProjectBlockProps) {
  const layout = getLayout(index, requestedLayout);
  const { ready, tier, isCompact, static: isStatic } = useDeviceProfile();
  const motionDisabled = !ready || isStatic || tier === 'low' || isCompact;
  const rootRef = useGsapScope<HTMLElement>(
    ({ gsap, root }) => {
      const image = root.querySelector<HTMLElement>('[data-vc-media]');
      const media = root.querySelector<HTMLElement>('[data-featured-media]');
      if (!image || !media) return;

      gsap.fromTo(
        image,
        { scale: 1, yPercent: -6 },
        {
          scale: 1.12,
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: media,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    },
    { deps: [project.slug], disabled: motionDisabled },
  );

  const toneStyle = { '--tone-accent': project.accent } as CSSProperties;

  if (layout === 'hero') {
    return (
      <article ref={rootRef} style={toneStyle} className="min-w-0 grid gap-8 md:gap-12">
        <MotionReveal disabled={motionDisabled} variant="masked" duration={1.15}>
          <div data-featured-media className="bleed relative min-w-0">
            <ProjectCard
              project={project}
              priority={priority}
              sizes={MEDIA_SIZES.full}
              showDetails={false}
              aspect={1.55}
            />
          </div>
        </MotionReveal>
        <div className="grid min-w-0 gap-9 md:grid-cols-12 md:gap-x-10 lg:gap-x-16">
          <MotionReveal className="md:col-span-7" disabled={motionDisabled} variant="rise" distance={1.25}>
            <ProjectHeading project={project} motionDisabled={motionDisabled} />
          </MotionReveal>
          <MotionReveal className="md:col-span-4 md:col-start-9 md:pt-5" disabled={motionDisabled} variant="rise" delay={100} distance={1}>
            <ProjectDetails project={project} />
          </MotionReveal>
        </div>
      </article>
    );
  }

  const imageFirst = layout === 'split-left';
  const wide = layout === 'wide';

  return (
    <article
      ref={rootRef}
      style={toneStyle}
      className={cx(
        'min-w-0 grid gap-9 md:grid-cols-12 md:gap-12',
        !wide && 'md:gap-x-10 lg:gap-x-16',
      )}
    >
      <MotionReveal
        disabled={motionDisabled}
        variant="masked"
        className={cx(
          'order-1 min-w-0',
          wide ? 'md:col-span-10 md:col-start-2' : 'md:col-span-7',
          !imageFirst && !wide && 'md:order-2 md:col-start-6 md:pt-20',
        )}
      >
        <div data-featured-media className="min-w-0">
          <ProjectCard
            project={project}
            priority={priority}
            sizes={wide ? MEDIA_SIZES.full : MEDIA_SIZES.half}
            showDetails={false}
            aspect={wide ? 2.25 : 1.34}
            mediaClassName={cx(wide ? 'aspect-[1.9] md:aspect-[2.25]' : 'aspect-[1.28] md:aspect-[1.34]')}
          />
        </div>
      </MotionReveal>

      <MotionReveal
        disabled={motionDisabled}
        variant="rise"
        delay={100}
        distance={1}
        className={cx(
          'order-2 self-center',
          wide ? 'md:col-span-8 md:col-start-3 md:pt-3' : 'md:col-span-4',
          imageFirst ? 'md:col-start-9 md:pt-16' : 'md:order-1 md:col-start-1 md:pt-3',
        )}
      >
        <ProjectHeading project={project} motionDisabled={motionDisabled} />
        <div className="mt-9 lg:mt-12">
          <ProjectDetails project={project} />
        </div>
      </MotionReveal>
    </article>
  );
}
