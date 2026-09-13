import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { VcImage } from '@/components/media/VcImage';
import { MediaLinkBadge } from '@/components/primitives/MediaLinkBadge';
import { Reveal } from '@/components/motion/Reveal';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { Band, Eyebrow, TagList } from '@/components/primitives';
import { featuredProjects, moreWorkItems } from '@/content/projects';
import { brand, primaryNav, secondaryNav, seo } from '@/content/site';
import { MEDIA_SIZES } from '@/lib/media';
import { pad2 } from '@/lib/utils';

export const metadata: Metadata = {
  title: `${secondaryNav[1].label} — ${seo.title}`,
  description: brand.definitionZh,
};

const technicalTags = new Set(['AI', 'VR', 'RAG', '3D', 'WEB']);

function TechnicalTags({ tags }: { tags: readonly string[] }) {
  const visibleTags = tags.filter((tag) => technicalTags.has(tag));
  if (!visibleTags.length) return null;
  return <TagList tags={visibleTags} size="sm" className="mt-6" />;
}

function IndexProjectRow({ project, index }: { project: (typeof featuredProjects)[number]; index: number }) {
  return (
    <Reveal variant="rise" delay={index * 90} distance={0.8}>
      <article
        className="relative grid min-w-0 gap-7 border-t border-[var(--tone-line)] py-[clamp(2.25rem,6vw,5.5rem)] md:grid-cols-12 md:gap-8"
        style={{ '--tone-accent': project.accent } as CSSProperties}
      >
        <div className="flex items-start justify-between gap-5 md:col-span-2 md:block">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--tone-accent)]" />
            <BiOnly zh={pad2(project.order)} en={pad2(project.order)} className="type-label tone-accent-text" />
          </div>
          <BiOnly zh={project.year} en={project.year} className="type-label-sm tone-mute mt-3 block" />
        </div>

        <div className="min-w-0 md:col-span-6">
          <h2>
            <Link
              href={`/work/${project.slug}`}
              className="link-underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--tone-accent)]"
              aria-label={`查看${project.titleZh}`}
            >
              <Bi
                zh={project.titleZh}
                en={project.title}
                as={null}
                primaryClassName="type-xl type-display tone-fg"
                secondaryClassName="type-label tone-mute"
              />
            </Link>
          </h2>
          <div className="mt-5 max-w-[48ch]">
            <Bi
              zh={project.taglineZh}
              en={project.tagline}
              primaryClassName="type-lead tone-fg-2"
              secondaryClassName="type-label-sm tone-mute"
            />
          </div>
          <TechnicalTags tags={project.tags} />
        </div>

        <div className="min-w-0 md:col-span-3 md:col-start-10 md:pt-1">
          <Link
            href={`/work/${project.slug}`}
            className="group/media block focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--tone-accent)]"
            aria-label={`打开${project.titleZh}详情`}
          >
            <div className="relative min-w-0">
              <VcImage
                media={project.cover}
                sizes={MEDIA_SIZES.inset}
                aspect={1.55}
                wrapperClassName="transition-transform duration-700 ease-[var(--ease-vc-out)] group-hover/media:scale-[1.012]"
              />
              {/* Same rule as the featured covers: the hint is present at rest. */}
              <MediaLinkBadge label="进入案例" />
            </div>
          </Link>
          <BiOnly
            zh={project.meta[0]?.value ?? ''}
            en={project.meta[0]?.label ?? ''}
            className="type-label-sm tone-mute mt-3 block"
          />
        </div>

        <ArrowLink
          href={`/work/${project.slug}`}
          variant="ghost"
          noArrow
          ariaLabel={`查看${project.titleZh}`}
          className="absolute right-0 top-5 text-xl md:top-8"
        >
          ↗
        </ArrowLink>
      </article>
    </Reveal>
  );
}

function MoreWorkEntry({ item, index }: { item: (typeof moreWorkItems)[number]; index: number }) {
  return (
    <Reveal variant="rise" delay={index * 75} distance={0.65}>
      <article
        className="grid min-w-0 gap-7 border-t border-[var(--tone-line)] py-8 md:grid-cols-12 md:gap-8 md:py-10"
        style={{ '--tone-accent': item.accent } as CSSProperties}
      >
        <div className="flex items-start gap-3 md:col-span-2">
          <span aria-hidden className="mt-1.5 h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--tone-accent)]" />
          <BiOnly zh={pad2(index + 1)} en={pad2(index + 1)} className="type-label tone-accent-text" />
        </div>

        <div className="min-w-0 md:col-span-5">
          <Bi
            zh={item.titleZh}
            en={item.title}
            as="h3"
            primaryClassName="type-lg type-display tone-fg"
            secondaryClassName="type-label tone-mute"
          />
          <Bi
            zh={item.summary}
            en={item.role}
            className="mt-4 max-w-[48ch]"
            primaryClassName="type-body tone-fg-2"
            secondaryClassName="type-label-sm tone-mute"
          />
          <TechnicalTags tags={item.tags} />
        </div>

        <div className="min-w-0 md:col-span-3 md:col-start-8 md:pt-1">
          <BiOnly zh={item.roleZh} en={item.role} className="type-label tone-fg-2" />
          {item.media?.[0] ? (
            <VcImage media={item.media[0]} sizes={MEDIA_SIZES.half} aspect={1.58} wrapperClassName="mt-5" />
          ) : null}
        </div>
      </article>
    </Reveal>
  );
}

export default function WorkPage() {
  return (
    <main>
      <Band tone="paper" className="grid-field" innerClassName="min-h-[68svh] flex flex-col justify-center">
        <div className="meta-row meta-row-start">
          <BiOnly zh="全部作品" en="ALL WORK" className="type-label tone-mute" />
          <BiOnly zh={`${featuredProjects.length} 个旗舰项目`} en={`${featuredProjects.length} FLAGSHIPS`} className="type-label-sm tone-mute" />
        </div>

        <div className="mt-[clamp(3.5rem,8vw,8rem)] max-w-[74rem]">
          <Eyebrow>{brand.disciplineLine}</Eyebrow>
          <Reveal variant="masked" delay={0} duration={0.95} className="mt-7 md:mt-9">
            <Bi
              zh={secondaryNav[1].zh}
              en={secondaryNav[1].label}
              as="h1"
              primaryClassName="type-xl type-display tone-fg"
              secondaryClassName="type-label tone-mute"
            />
          </Reveal>
          <Reveal variant="rise" delay={120} distance={0.8} className="mt-7 md:mt-9">
            <Bi
              zh={brand.definitionZh}
              en={brand.definitionEn}
              primaryClassName="type-lead tone-fg-2 max-w-[42ch]"
              secondaryClassName="type-label-sm tone-mute max-w-[62ch]"
            />
          </Reveal>
        </div>
      </Band>

      <Band id="work-index" tone="paper">
        <div className="meta-row">
          <BiOnly zh="索引 / 继续探索" en="INDEX / EXPLORE FURTHER" className="type-label tone-mute" />
          <BiOnly zh="精选作品" en="SELECTED WORK" className="type-label-sm tone-mute" />
        </div>

        <div className="mt-[clamp(3rem,7vw,7rem)]">
          {featuredProjects.map((project, index) => (
            <IndexProjectRow key={project.slug} project={project} index={index} />
          ))}
        </div>
      </Band>

      <Band id="more-work" tone="ink" className="band-curve-top">
        <div className="meta-row">
          <BiOnly zh="能力 Reel" en="CAPABILITY REEL" className="type-label tone-mute" />
          <BiOnly zh="更多工作" en="MORE WORK" className="type-label-sm tone-mute" />
        </div>
        <Reveal variant="masked" delay={100} duration={0.9} className="mt-[clamp(3.5rem,8vw,8rem)] max-w-[56rem]">
          <Bi
            zh="不止一种做法，也不止一种交付方式。"
            en="BREADTH, WITHOUT THE NOISE."
            as="h2"
            primaryClassName="type-lg type-display tone-fg"
            secondaryClassName="type-label tone-mute"
          />
        </Reveal>
        <div className="mt-[clamp(4rem,9vw,9rem)]">
          {moreWorkItems.map((item, index) => (
            <MoreWorkEntry key={item.id} item={item} index={index} />
          ))}
        </div>
        <div className="mt-12 flex justify-end">
          <ArrowLink href="/#contact" variant="outline">
            <BiOnly zh={primaryNav[3].zh} en={primaryNav[3].label} />
          </ArrowLink>
        </div>
      </Band>
    </main>
  );
}
