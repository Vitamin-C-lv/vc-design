'use client';

import { Band, Eyebrow } from '@/components/primitives';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { brand } from '@/content/site';
import { slogan } from '@/content/site';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';

export function Hero() {
  const profile = useDeviceProfile();
  const disabled = !profile.ready || profile.static || profile.tier === 'low' || profile.isCompact;
  const rootRef = useGsapScope<HTMLDivElement>(
    ({ gsap, root }) => {
      const eyebrow = root.querySelector('[data-hero-eyebrow]');
      const wordmark = root.querySelector('[data-hero-wordmark]');
      const statement = root.querySelector('[data-hero-statement]');
      const disciplines = root.querySelector('[data-hero-disciplines]');
      const hint = root.querySelector('[data-hero-hint]');

      if (!eyebrow || !wordmark || !statement || !disciplines || !hint) return;

      gsap.set([eyebrow, wordmark, statement, disciplines, hint], { opacity: 0, y: 34 });

      const timeline = gsap.timeline();
      timeline
        .to(eyebrow, { opacity: 1, y: 0, duration: 1.05, ease: 'power3.out' }, 0.05)
        .to(wordmark, { opacity: 1, y: 0, duration: 1.55, ease: 'power3.out' }, 0.18)
        .to(
          [statement, disciplines],
          { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.14 },
          0.92,
        )
        .to(hint, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.38);
    },
    { deps: [profile.ready, profile.static, profile.tier, profile.isCompact], disabled },
  );

  const sloganZhLines = slogan.zh.split('，');

  return (
    // Light, not dark. The reference site is a flat near-white page with
    // near-black type, and that combination is what makes the giant wordmark
    // read as printed rather than as a dark-mode poster. The dark acts are kept
    // for the work showcase, the pitch and the closing band.
    <Band id="top" tone="paper" className="min-h-[100svh] overflow-hidden py-0">
      {/*
        `pt-*` clears the fixed header (73px measured at 1600px wide). Without it
        the eyebrow sits underneath the wordmark/nav and is unreadable, because
        the header is `position: fixed` and therefore contributes no flow space.
      */}
      <div
        ref={rootRef}
        className="relative z-10 flex min-h-[100svh] flex-col justify-between pt-24 pb-8 md:pt-28 md:pb-10"
      >
        <div data-hero-eyebrow>
          <Eyebrow>
            <BiOnly zh="独立创意单元" en={brand.heroEyebrow} />
          </Eyebrow>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center md:py-24">
          <h1 data-hero-wordmark className="type-hero tone-fg" aria-label="VC">
            {brand.wordmark}
          </h1>
          <div data-hero-statement className="mt-10 md:mt-12">
            {sloganZhLines.map((line, index) => {
              const zhLine = `${line}${index < sloganZhLines.length - 1 ? '，' : ''}`;
              const enLine = slogan.lines[index] ?? slogan.lines[slogan.lines.length - 1];

              return (
                <div key={zhLine}>
                  <Bi
                    as="span"
                    zh={zhLine}
                    en={enLine}
                    hideSecondary
                    primaryClassName="type-lg type-display tone-fg block"
                  />
                  <Bi
                    as="span"
                    zh={enLine}
                    en={zhLine}
                    hideSecondary
                    primaryClassName="type-label tone-mute mt-3 block"
                  />
                </div>
              );
            })}
          </div>
          <p data-hero-disciplines className="type-label tone-mute mt-5 max-w-full">
            {brand.disciplineLine}
          </p>
        </div>

        <div data-hero-hint className="flex items-center gap-4 pb-1">
          <span aria-hidden className="h-10 w-px origin-top bg-[var(--tone-line)]" />
          <span className="type-label tone-mute">
            <BiOnly zh="向下探索" en={brand.scrollHint} />
          </span>
        </div>
      </div>
    </Band>
  );
}
