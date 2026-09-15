'use client';

import { useEffect } from 'react';
import { Band, Eyebrow } from '@/components/primitives';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { brand, slogan } from '@/content/site';
import { useDeviceProfile } from '@/lib/motion/device';
import { gsap } from '@/lib/motion/gsap';
import { useGsapScope } from '@/lib/motion/useGsap';
import { HeroField } from './HeroField';

export function Hero() {
  const profile = useDeviceProfile();
  const disabled = !profile.ready || profile.static || profile.tier === 'low';
  const rootRef = useGsapScope<HTMLDivElement>(
    ({ gsap, root }) => {
      const eyebrow = root.querySelector('[data-hero-eyebrow]');
      const wordmark = root.querySelector('[data-hero-wordmark]');
      const wordmarkChars = root.querySelectorAll<HTMLElement>('[data-hero-wordmark-char]');
      const statement = root.querySelector('[data-hero-statement]');
      const disciplines = root.querySelector('[data-hero-disciplines]');
      const hint = root.querySelector('[data-hero-hint]');

      if (!eyebrow || !wordmark || !statement || !disciplines || !hint) return;

      gsap.set([eyebrow, statement, disciplines, hint], { opacity: 0, y: 28 });
      gsap.set(wordmark, { opacity: 1, y: 0 });
      gsap.set(wordmarkChars, { opacity: 0, yPercent: 110 });

      const timeline = gsap.timeline();
      timeline
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.58, ease: 'power3.out' }, 0.04)
        .to(
          wordmarkChars,
          { opacity: 1, yPercent: 0, duration: 1.28, ease: 'power4.out', stagger: 0.08 },
          0.12,
        )
        .to(statement, { opacity: 1, y: 0, duration: 0.72, ease: 'power3.out' }, 0.72)
        .to(disciplines, { opacity: 1, y: 0, duration: 0.58, ease: 'power3.out' }, 0.88)
        .to(hint, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 1.02);

      gsap.to(wordmark, {
        y: -44,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=42%',
          scrub: 0.35,
        },
      });
    },
    { deps: [profile.ready, profile.static, profile.tier, profile.isCompact], disabled },
  );

  useEffect(() => {
    if (
      disabled ||
      !profile.ready ||
      profile.isTouch ||
      profile.isCompact ||
      profile.tier === 'low'
    ) {
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const wordmark = root.querySelector<HTMLElement>('[data-hero-wordmark]');
    const statement = root.querySelector<HTMLElement>('[data-hero-statement]');
    const field = root.querySelector<HTMLElement>('[data-hero-field]');
    if (!wordmark || !statement || !field) return;

    const wordmarkX = gsap.quickTo(wordmark, 'x', { duration: 0.8, ease: 'power3.out' });
    const statementX = gsap.quickTo(statement, 'x', { duration: 0.95, ease: 'power3.out' });
    const fieldX = gsap.quickTo(field, 'x', { duration: 1.2, ease: 'power3.out' });
    const handlePointerMove = (event: PointerEvent) => {
      const progress = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2));
      wordmarkX(progress * 8);
      statementX(progress * 4);
      fieldX(progress * 2.5);
    };
    const reset = () => {
      wordmarkX(0);
      statementX(0);
      fieldX(0);
    };

    root.addEventListener('pointermove', handlePointerMove, { passive: true });
    root.addEventListener('pointerleave', reset, { passive: true });
    return () => {
      root.removeEventListener('pointermove', handlePointerMove);
      root.removeEventListener('pointerleave', reset);
      gsap.killTweensOf([wordmark, statement, field]);
    };
  }, [disabled, profile.isCompact, profile.isTouch, profile.ready, profile.tier, rootRef]);

  return (
    // Light, not dark. The reference site is a flat near-white page with
    // near-black type, and that combination is what makes the giant wordmark
    // read as printed rather than as a dark-mode poster. The dark acts are kept
    // for the work showcase, the pitch and the closing band.
    <Band id="top" tone="paper" container={false} className="min-h-[100svh] overflow-hidden py-0">
      {/*
        `pt-*` clears the fixed header (73px measured at 1600px wide). Without it
        the eyebrow sits underneath the wordmark/nav and is unreadable, because
        the header is `position: fixed` and therefore contributes no flow space.
      */}
      <div
        ref={rootRef}
        className="relative min-h-[100svh] overflow-hidden"
      >
        <HeroField />
        <div className="shell relative z-10 flex min-h-[100svh] flex-col justify-between pt-24 pb-8 md:pt-28 md:pb-10">
          <div data-hero-eyebrow>
            <Eyebrow>
              <BiOnly zh={brand.heroEyebrowZh} en={brand.heroEyebrow} />
            </Eyebrow>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center md:py-24">
            <h1 data-hero-wordmark className="type-hero hero-wordmark tone-fg" aria-label={brand.wordmark}>
              {Array.from(brand.wordmark).map((character, index) => (
                <span key={`${character}-${index}`} className="hero-wordmark-mask" aria-hidden="true">
                  <span data-hero-wordmark-char className="hero-wordmark-char">
                    {character}
                  </span>
                </span>
              ))}
            </h1>
            <div data-hero-statement className="mt-10 md:mt-12">
              {slogan.zhLines.map((zhLine, index) => {
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
              <BiOnly zh={brand.scrollHintZh} en={brand.scrollHint} />
            </span>
          </div>
        </div>
      </div>
    </Band>
  );
}
