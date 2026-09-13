'use client';

import type { ReactNode } from 'react';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { MetaGrid, TagList } from '@/components/primitives';
import { VcImage } from '@/components/media/VcImage';
import { Reveal } from '@/components/motion/Reveal';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';
import type { Project } from '@/content/types';
import { MEDIA_SIZES } from '@/lib/media';
import { pad2 } from '@/lib/utils';

function splitHeadline(value: string): string[] {
  const clauses = value.match(/[^，。！？；：]+[，。！？；：]?/g)?.filter(Boolean) ?? [value];
  const clean = (lines: string[]) => lines.map((line) => line.trim()).filter(Boolean);
  if (clauses.length === 2 || clauses.length === 3) return clean(clauses);
  if (clauses.length > 3) {
    const firstCut = Math.ceil(clauses.length / 3);
    const secondCut = Math.ceil((clauses.length * 2) / 3);
    return clean([clauses.slice(0, firstCut), clauses.slice(firstCut, secondCut), clauses.slice(secondCut)]
      .map((group) => group.join(''))
      .filter(Boolean));
  }

  const chars = Array.from(value);
  if (chars.length < 8) return [value];
  const midpoint = Math.ceil(chars.length / 2);
  return clean([chars.slice(0, midpoint).join(''), chars.slice(midpoint).join('')]);
}

function ChineseHeadline({ value, delay = 0 }: { value: string; delay?: number }) {
  const profile = useDeviceProfile();
  const motionDisabled = !profile.ready || profile.static || profile.tier === 'low' || profile.isCompact;

  return (
    <span className="block">
      {splitHeadline(value).map((line, index) =>
        motionDisabled ? (
          <span key={`${line}-${index}`} className="block">{line}</span>
        ) : (
          <Reveal key={`${line}-${index}`} variant="masked" delay={delay + index * 75} className="block">
            <span className="block">{line}</span>
          </Reveal>
        ),
      )}
    </span>
  );
}

function ProjectHeadline({ project }: { project: Project }) {
  const titleZh = project.titleZh || project.title;
  return (
    <h1 className="type-xl type-display tone-fg max-w-[12ch]">
      <Bi
        as={null}
        hideSecondary
        zh={
          <>
            <ChineseHeadline value={titleZh} />
            <span className="mt-5 block type-label-sm tone-mute max-w-[48ch]">{project.title}</span>
          </>
        }
        en={
          <>
            <span className="block">{project.title}</span>
            <span className="mt-4 block type-label-sm tone-mute max-w-[48ch]">{titleZh}</span>
          </>
        }
      />
    </h1>
  );
}

function ProjectLine({
  zh,
  en,
  className,
  echoClassName,
}: {
  zh: ReactNode;
  en: ReactNode;
  className?: string;
  echoClassName?: string;
}) {
  return (
    <Bi
      as="div"
      className={className}
      hideSecondary
      zh={
        <>
          <span className="block">{zh}</span>
          <span className={echoClassName ?? 'mt-3 block type-label-sm tone-mute'}>{en}</span>
        </>
      }
      en={
        <>
          <span className="block">{en}</span>
          <span className={echoClassName ?? 'mt-3 block type-label-sm tone-mute'}>{zh}</span>
        </>
      }
    />
  );
}

export function CaseHero({ project }: { project: Project }) {
  const profile = useDeviceProfile();
  const motionDisabled = !profile.ready || profile.static || profile.tier === 'low' || profile.isCompact;
  const heroRef = useGsapScope<HTMLElement>(
    ({ gsap, root }) => {
      const image = root.querySelector<HTMLElement>('[data-case-hero-media] img[data-vc-media]');
      const trigger = image?.closest('[data-case-hero-media]');
      if (!image || !trigger) return;

      gsap.fromTo(
        image,
        { scale: 1, yPercent: 8 },
        {
          scale: 1.1,
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.15,
          },
        },
      );
    },
    { deps: [motionDisabled, project.cover.key], disabled: motionDisabled },
  );

  const eyebrow = project.tags[0] ?? `FEATURED ${pad2(project.order)}`;

  return (
    <header ref={heroRef} className="space-y-14 md:space-y-20">
      <div className="flex items-center justify-between gap-6">
        <ArrowLink href="/work" variant="ghost" noArrow>
          <BiOnly zh="← 返回全部案例" en="← ALL WORK" />
        </ArrowLink>
        <span className="type-label tone-mute">{project.year}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-8">
          <Reveal variant="masked">
            <BiOnly zh={eyebrow} en={eyebrow} className="type-label tone-mute" as="span" />
            <ProjectHeadline project={project} />
          </Reveal>
          <Reveal delay={100} className="mt-7 max-w-2xl md:mt-9">
            <ProjectLine
              zh={project.taglineZh}
              en={project.tagline}
              className="type-lead tone-fg"
              echoClassName="mt-3 block type-label-sm tone-mute max-w-[58ch]"
            />
          </Reveal>
        </div>

        <div className="lg:col-span-4 lg:justify-self-end">
          <Reveal delay={180} className="space-y-6 lg:max-w-xs">
            {project.badge ? (
              <p
                className="type-label inline-flex border px-3 py-2"
                style={{
                  borderColor: 'var(--tone-accent)',
                  color: 'var(--tone-accent)',
                }}
              >
                {project.badge}
              </p>
            ) : null}
            {project.live?.length ? (
              <div className="flex flex-col items-start gap-3">
                {project.live.map((live) => (
                  <div key={live.url}>
                    <ArrowLink href={live.url} external variant="outline">
                      <BiOnly zh="打开项目" en={live.label} />
                    </ArrowLink>
                    {live.note ? <p className="type-label-sm tone-mute mt-3">{live.note}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>

      <div className="bleed" data-case-hero-media="true">
        <Reveal variant="masked" delay={120}>
          <VcImage
            media={project.cover}
            sizes={MEDIA_SIZES.full}
            priority
            wrapperClassName="bg-[var(--tone-surface)]"
            imgClassName="rounded-[2px]"
          />
        </Reveal>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal delay={100} className="lg:col-span-7">
          {project.summaryEn ? (
            <BiOnly zh={project.summaryEn} en={project.summaryEn} className="type-label-sm tone-mute max-w-[66ch]" as="p" />
          ) : null}
          <ProjectLine
            zh={project.summary}
            en={project.summaryEn ?? project.summary}
            className="type-lead tone-fg mt-6 max-w-[56ch]"
            echoClassName="mt-3 block type-label-sm tone-mute max-w-[66ch]"
          />
        </Reveal>
        <Reveal delay={180} className="lg:col-span-5 lg:col-start-8">
          <MetaGrid rows={project.meta} />
          <TagList tags={project.tags} size="sm" className="mt-8" />
        </Reveal>
      </div>
    </header>
  );
}
