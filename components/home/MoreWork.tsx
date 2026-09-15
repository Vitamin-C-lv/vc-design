'use client';

import { Band, Rule, SectionIntro, TagList } from '@/components/primitives';
import { Reveal } from '@/components/motion/Reveal';
import { VcImage, MediaCaption } from '@/components/media/VcImage';
import { Bi } from '@/components/i18n/Bi';
import { MEDIA_SIZES, resolveMedia } from '@/lib/media';
import { moreWorkItems } from '@/content/projects';
import type { MoreWorkItem } from '@/content/types';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';
import { pad2 } from '@/lib/utils';
import type { CSSProperties } from 'react';

function CapabilityMarker({ accent }: { accent: string }) {
  return (
    <span
      aria-hidden
      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--item-accent)]"
      style={{ '--item-accent': accent } as CSSProperties}
    />
  );
}

function ImageReel({ item }: { item: MoreWorkItem }) {
  const profile = useDeviceProfile();
  const interactive = profile.ready && !profile.static && profile.tier === 'high' && !profile.isCompact;
  const reelRef = useGsapScope<HTMLDivElement>(
    ({ gsap, root }) => {
      const figures = root.querySelectorAll<HTMLElement>('[data-reel-figure]');
      figures.forEach((figure, index) => {
        const image = figure.querySelector<HTMLElement>('[data-reel-image]');
        if (!image) return;
        gsap.fromTo(
          image,
          { scale: 1, xPercent: index % 2 === 0 ? -1.5 : 1.5 },
          {
            scale: 1.06,
            xPercent: index % 2 === 0 ? 1.5 : -1.5,
            ease: 'none',
            scrollTrigger: {
              trigger: figure,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.1,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    },
    { deps: [interactive], disabled: !interactive },
  );

  if (!item.media?.length) return null;

  return (
    <div ref={reelRef} className="mt-12 md:mt-16">
      <div className="hairline flex items-center justify-between gap-5 py-4">
        <p className="type-label tone-mute">图像卷轴 / IMAGE REEL</p>
        <p className="type-label-sm tone-mute">
          {pad2(item.media.length)} VIEWS · 等高排布 / UNIFORM HEIGHT
        </p>
      </div>

      {/*
        A filmstrip, not a carousel.

        Equal *height*, natural width: every panel is scaled to the same height
        and keeps its own aspect ratio, so a 16:9 interior render, a 3:2 render
        and a 9:16 material study sit side by side at their true proportions.
        Nothing is cropped, nothing is padded, and because the panels share a
        baseline the captions line up by construction rather than by luck — the
        previous version derived height from width, so widening the lead item
        pushed its caption 61–91px out of line below 1920px.

        The payoff is that the *rhythm of widths* becomes the composition: two
        wide renders, then a tall narrow one as punctuation. That rhythm comes
        from the work itself, which is more interesting than four identical boxes.
      */}
      <div
        className="no-scrollbar bleed-x flex snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-3 pt-5 md:gap-6"
        style={{ '--reel-h': 'clamp(15rem, 34vw, 30rem)' } as CSSProperties}
      >
        {item.media.map((media, index) => {
          const ratio = resolveMedia(media).aspect;
          const portrait = ratio < 1;
          return (
            <figure
              key={media.key}
              data-reel-figure
              className="min-w-0 shrink-0 snap-start"
            >
              <div
                data-reel-image
                className="relative min-w-0 will-change-transform"
                // Height drives width (not the other way round), which is what
                // keeps the baseline shared across every panel.
                style={{ height: 'var(--reel-h)', aspectRatio: String(ratio) }}
              >
                <VcImage
                  media={media}
                  sizes={MEDIA_SIZES.reel}
                  fill
                  imgClassName="transition-transform duration-700 ease-[var(--ease-vc-out)] hover:scale-[1.03]"
                />
                {/* Mono slate, top-left of the frame — the "spec sheet" texture
                    the rest of the site uses, and a quiet sign that the aspect
                    was measured rather than guessed. */}
                <span className="type-label-sm pointer-events-none absolute left-3 top-3 bg-[var(--tone-bg)]/70 px-2 py-1 tone-mute backdrop-blur-sm">
                  {pad2(index + 1)} · {portrait ? 'PORTRAIT' : 'LANDSCAPE'}
                </span>
              </div>
              <figcaption className="flex min-w-0 items-start gap-3 pt-3">
                <span className="type-label-sm tone-accent-text">{pad2(index + 1)}</span>
                <MediaCaption className="mt-0">{media.caption}</MediaCaption>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

function TextCapability({ item, index }: { item: MoreWorkItem; index: number }) {
  return (
    <Reveal variant="rise" distance={0.75}>
      <article
        className="group relative grid min-w-0 gap-5 border-t border-[var(--tone-line)] py-7 transition-transform duration-500 ease-[var(--ease-vc-out)] hover:translate-x-1 md:grid-cols-12 md:gap-8 md:py-9"
        style={{ '--item-accent': item.accent } as CSSProperties}
      >
        <div className="flex min-w-0 items-start gap-4 md:col-span-1">
          <CapabilityMarker accent={item.accent} />
          <span className="type-label tone-mute">{pad2(index + 1)}</span>
        </div>
        <div className="min-w-0 md:col-span-5">
          <h3 className="type-lg type-display tone-fg max-w-[12ch]">
            <Bi
              as={null}
              zh={item.titleZh}
              en={item.title}
              primaryClassName="type-lg type-display tone-fg block"
              secondaryClassName="type-label tone-mute mt-4 block"
            />
          </h3>
        </div>
        <div className="min-w-0 md:col-span-3 md:pt-1">
          <Bi
            as={null}
            zh={item.roleZh}
            en={item.role}
            primaryClassName="type-body tone-fg-2 block"
            secondaryClassName="type-label-sm tone-mute mt-2 block"
          />
          <TagList tags={item.tags} size="sm" className="mt-5" />
        </div>
        <p className="type-body tone-fg-2 min-w-0 md:col-span-3 md:pt-1">{item.summary}</p>
        <span className="pointer-events-none absolute h-px w-12 bg-[var(--item-accent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </article>
    </Reveal>
  );
}

/** A visual capability reel: one real image strip, then three text-led proofs. */
export function MoreWork() {
  const imageItem = moreWorkItems.find((item) => item.media?.length);
  const textItems = moreWorkItems.filter((item) => !item.media?.length);

  return (
    <Band id="more-work" tone="paper" innerClassName="relative">
      <SectionIntro
        eyebrow="更多能力 / MORE WORK"
        title={
          <Bi
            as={null}
            zh="更广的能力，不制造噪音。"
            en="BREADTH, WITHOUT THE NOISE."
            primaryClassName="type-xl type-display tone-fg block"
            secondaryClassName="type-label tone-mute mt-5 block"
          />
        }
        titleZh="一条真实的三维图像条，接三项以排版和系统思考为主的能力证明。"
        size="xl"
        className="max-w-[66rem]"
        reveal
      />

      {imageItem ? (
        <Reveal variant="masked" className="mt-[clamp(4rem,9vw,8rem)]">
          <div className="flex min-w-0 items-start gap-4">
            <CapabilityMarker accent={imageItem.accent} />
            <div className="min-w-0">
              <h3 className="type-lg type-display tone-fg">
                <Bi
                  as={null}
                  zh={imageItem.titleZh}
                  en={imageItem.title}
                  primaryClassName="type-lg type-display tone-fg block"
                  secondaryClassName="type-label tone-mute mt-4 block"
                />
              </h3>
              <p className="type-body tone-fg-2 mt-4 max-w-[42ch]">{imageItem.summary}</p>
            </div>
          </div>
          <ImageReel item={imageItem} />
        </Reveal>
      ) : null}

      <div className="mt-[clamp(7rem,15vw,15rem)]">
        <Reveal variant="rule">
          <Rule />
        </Reveal>
        <div className="flex items-center justify-between gap-5 py-4">
          <p className="type-label tone-mute">文字与系统 / TEXT-LED</p>
          <p className="type-label-sm tone-mute">NO BORROWED IMAGERY</p>
        </div>
        <div className="relative">
          {textItems.map((item, index) => (
            <TextCapability key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </Band>
  );
}
