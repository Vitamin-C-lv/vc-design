'use client';

import { Bi, BiOnly } from '@/components/i18n/Bi';
import { ChapterMark, Eyebrow } from '@/components/primitives';
import { VcImage, MediaCaption } from '@/components/media/VcImage';
import { Reveal } from '@/components/motion/Reveal';
import { Diagram } from '@/components/diagrams/Diagram';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';
import type { CaseSection, MediaRef } from '@/content/types';
import { MEDIA_SIZES } from '@/lib/media';
import { cx } from '@/lib/utils';

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

function ChineseHeadline({ value }: { value: string }) {
  const profile = useDeviceProfile();
  const motionDisabled = !profile.ready || profile.static || profile.tier === 'low' || profile.isCompact;

  return (
    <span className="block">
      {splitHeadline(value).map((line, index) =>
        motionDisabled ? (
          <span key={`${line}-${index}`} className="block">{line}</span>
        ) : (
          <Reveal key={`${line}-${index}`} variant="masked" delay={index * 75} className="block">
            <span className="block">{line}</span>
          </Reveal>
        ),
      )}
    </span>
  );
}

function ChapterHeader({ section, total }: { section: CaseSection; total: number }) {
  return (
    <div className="flex items-center gap-4">
      <ChapterMark index={section.index} total={total} />
      <Eyebrow marker={false}>
        <BiOnly zh={section.eyebrow} en={section.eyebrow} />
      </Eyebrow>
      <span aria-hidden className="h-px flex-1 bg-[var(--tone-line)]" />
    </div>
  );
}

function ChapterText({
  section,
  titleClassName,
  titleId,
}: {
  section: CaseSection;
  titleClassName?: string;
  titleId?: string;
}) {
  const titleZh = section.titleZh || section.title;

  return (
    <div>
      <h2 id={titleId} className={cx('type-lg type-display tone-fg max-w-[20ch]', titleClassName)}>
        <Bi
          as={null}
          hideSecondary
          zh={
            <>
              <ChineseHeadline value={titleZh} />
              <span className="mt-5 block type-label-sm tone-mute max-w-[62ch]">{section.title}</span>
            </>
          }
          en={
            <>
              <span className="block">{section.title}</span>
              <span className="mt-4 block type-label-sm tone-mute max-w-[62ch]">{titleZh}</span>
            </>
          }
        />
      </h2>
      <div className="type-body tone-fg-2 mt-8 max-w-[68ch] space-y-5">
        {section.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

function SpecList({ items }: { items: string[] }) {
  return (
    <ol className="mt-10 max-w-[68ch]">
      {items.map((item, index) => (
        <li key={item} className="flex min-w-0 gap-5 border-t border-[var(--tone-line)] py-4 last:border-b">
          <span className="type-label-sm tone-accent-text shrink-0 pt-1">{String(index + 1).padStart(2, '0')}</span>
          <span className="type-body tone-fg min-w-0">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function ProcessList({ items }: { items: string[] }) {
  return (
    <ol className="mt-12 max-w-4xl">
      {items.map((item, index) => (
        <li key={item} className="grid min-w-0 gap-4 border-t border-[var(--tone-line)] py-6 md:grid-cols-[5rem_1fr] md:gap-8">
          <span className="type-lg type-display tone-accent-text">{String(index + 1).padStart(2, '0')}</span>
          <p className="type-lead tone-fg min-w-0 max-w-[52ch]">{item}</p>
        </li>
      ))}
    </ol>
  );
}

function FramedMedia({ media, sizes, className }: { media: MediaRef; sizes: string; className?: string }) {
  const tone = media.surface === 'light' ? 'paper' : media.surface === 'dark' ? 'ink' : undefined;
  const framed = Boolean(tone);

  return (
    <figure data-tone={tone} className={cx('min-w-0', framed ? 'bg-[var(--tone-bg)] p-4 md:p-6' : '', className)}>
      <VcImage
        media={media}
        sizes={sizes}
        wrapperClassName="bg-[var(--tone-surface)]"
        imgClassName="rounded-[2px]"
      />
      <MediaCaption>{media.caption}</MediaCaption>
    </figure>
  );
}

function MediaStack({ media, sizes = MEDIA_SIZES.full }: { media?: MediaRef[]; sizes?: string }) {
  if (!media?.length) return null;
  return (
    <div data-case-media="true" className="min-w-0">
      <FramedMedia media={media[0]} sizes={sizes} />
    </div>
  );
}

function PairMedia({ media, sizes }: { media: MediaRef; sizes: string }) {
  return (
    <div data-case-media="true" className="min-w-0">
      <FramedMedia media={media} sizes={sizes} />
    </div>
  );
}

export function CaseSectionBlock({ section, total }: { section: CaseSection; total: number }) {
  const profile = useDeviceProfile();
  const motionDisabled = !profile.ready || profile.static || profile.tier === 'low' || profile.isCompact;
  const rootRef = useGsapScope<HTMLElement>(
    ({ gsap, root }) => {
      const media = root.querySelectorAll<HTMLElement>('[data-case-media] img[data-vc-media]');
      media.forEach((image) => {
        const trigger = image.closest('[data-case-media]');
        if (!trigger) return;
        gsap.fromTo(
          image,
          { scale: 1, yPercent: 10 },
          {
            scale: 1.08,
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.05,
            },
          },
        );
      });
    },
    { deps: [motionDisabled, section.id], disabled: motionDisabled },
  );
  const hasBullets = Boolean(section.bullets?.length);

  return (
    <article ref={rootRef} className="min-w-0 space-y-14 md:space-y-20" aria-labelledby={`${section.id}-title`}>
      <ChapterHeader section={section} total={total} />

      {section.layout === 'statement' ? (
        <div className="grid min-w-0 gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="min-w-0 lg:col-span-9" variant="rise">
            <ChapterText section={section} titleId={`${section.id}-title`} titleClassName="max-w-[24ch]" />
            {section.note ? <p className="type-label-sm tone-mute mt-10 max-w-[70ch]">{section.note}</p> : null}
          </Reveal>
        </div>
      ) : null}

      {section.layout === 'full' ? (
        <>
          <Reveal variant="rise" className="min-w-0 max-w-4xl">
            <ChapterText section={section} titleId={`${section.id}-title`} />
            {hasBullets ? <SpecList items={section.bullets ?? []} /> : null}
          </Reveal>
          <div className="bleed" data-case-media="true">
            <Reveal variant="masked" delay={120}>
              <MediaStack media={section.media} sizes={MEDIA_SIZES.full} />
            </Reveal>
          </div>
          {section.note ? <p className="type-label-sm tone-mute max-w-[70ch]">{section.note}</p> : null}
        </>
      ) : null}

      {section.layout === 'split' ? (
        <div className="grid min-w-0 gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          <Reveal
            variant="rise"
            className={cx('min-w-0 lg:col-span-5', Number(section.index) % 2 === 0 ? 'lg:col-start-8 lg:order-2' : 'lg:order-1')}
          >
            <ChapterText section={section} titleId={`${section.id}-title`} />
            {hasBullets ? <SpecList items={section.bullets ?? []} /> : null}
            {section.note ? <p className="type-label-sm tone-mute mt-8">{section.note}</p> : null}
          </Reveal>
          <Reveal
            variant="masked"
            delay={120}
            className={cx('min-w-0 lg:col-span-6', Number(section.index) % 2 === 0 ? 'lg:col-start-1 lg:order-1' : 'lg:col-start-7 lg:order-2')}
          >
            <MediaStack media={section.media} sizes={MEDIA_SIZES.half} />
          </Reveal>
        </div>
      ) : null}

      {section.layout === 'pair' ? (
        <>
          <Reveal variant="rise" className="min-w-0 max-w-4xl">
            <ChapterText section={section} titleId={`${section.id}-title`} />
            {hasBullets ? <SpecList items={section.bullets ?? []} /> : null}
          </Reveal>
          <div className="grid min-w-0 gap-8 md:grid-cols-12 md:items-start">
            {section.media?.[0] ? (
              <Reveal variant="masked" className="min-w-0 md:col-span-7 md:mt-0">
                <PairMedia media={section.media[0]} sizes={MEDIA_SIZES.inset} />
              </Reveal>
            ) : null}
            {section.media?.[1] ? (
              <Reveal variant="masked" delay={140} className="min-w-0 md:col-span-5 md:col-start-8 md:mt-24">
                <PairMedia media={section.media[1]} sizes={MEDIA_SIZES.inset} />
              </Reveal>
            ) : null}
          </div>
        </>
      ) : null}

      {section.layout === 'reel' ? (
        <>
          <Reveal variant="rise" className="min-w-0 max-w-4xl">
            <ChapterText section={section} titleId={`${section.id}-title`} />
            {hasBullets ? <SpecList items={section.bullets ?? []} /> : null}
          </Reveal>
          <div className="bleed-x flex min-w-0 snap-x gap-5 overflow-x-auto no-scrollbar">
            {section.media?.map((media, index) => (
              <Reveal key={media.key} variant="masked" delay={index * 90} className="w-[78vw] min-w-0 shrink-0 snap-start md:w-[48vw] lg:w-[36vw]">
                <PairMedia media={media} sizes={MEDIA_SIZES.reel} />
              </Reveal>
            ))}
          </div>
        </>
      ) : null}

      {section.layout === 'sequence' ? (
        <>
          <Reveal variant="rise" className="min-w-0 max-w-4xl">
            <ChapterText section={section} titleId={`${section.id}-title`} />
          </Reveal>
          <Reveal variant="rise" delay={100}>
            <ProcessList items={section.bullets?.length ? section.bullets : section.body} />
          </Reveal>
          {section.note ? <p className="type-label-sm tone-mute max-w-[70ch]">{section.note}</p> : null}
        </>
      ) : null}

      {section.layout === 'diagram' ? (
        <div className="grid min-w-0 gap-12 lg:grid-cols-5 lg:gap-10">
          <Reveal variant="rise" className="min-w-0 lg:col-span-2">
            <ChapterText section={section} titleId={`${section.id}-title`} />
            {hasBullets ? <SpecList items={section.bullets ?? []} /> : null}
            {section.note ? <p className="type-label-sm tone-mute mt-8">{section.note}</p> : null}
          </Reveal>
          <Reveal variant="rise" delay={120} className="min-w-0 lg:col-span-3 lg:pt-2">
            {section.diagram ? <Diagram id={section.diagram} /> : null}
          </Reveal>
        </div>
      ) : null}
    </article>
  );
}
