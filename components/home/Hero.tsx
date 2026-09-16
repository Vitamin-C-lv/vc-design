'use client';

import { useEffect, useState } from 'react';
import { Band, Eyebrow } from '@/components/primitives';
import { BiOnly } from '@/components/i18n/Bi';
import { brand, slogan } from '@/content/site';
import { useDeviceProfile } from '@/lib/motion/device';
import { gsap } from '@/lib/motion/gsap';
import { readIntroBox, whenIntroDone } from '@/lib/motion/introGate';
import { playVcSignature } from '@/lib/motion/vcSignature';
import { useGsapScope } from '@/lib/motion/useGsap';
import { HeroField } from './HeroField';

const definitionLines = brand.definitionZh.split(/(?=产品、视觉)|(?=的独立)/);
const definitionEnglishLines = ['An independent creative unit', 'working across product, visual, 3D and AI.'];

export function Hero() {
  const profile = useDeviceProfile();
  const [introDone, setIntroDone] = useState(false);
  const disabled = !introDone || !profile.ready || profile.static || profile.tier === 'low';

  useEffect(() => whenIntroDone(() => setIntroDone(true)), []);

  const rootRef = useGsapScope<HTMLDivElement>(
    ({ gsap, root }) => {
      const wordmark = root.querySelector<HTMLElement>('[data-hero-wordmark]');
      const v = root.querySelector<HTMLElement>('[data-hero-wordmark-v]');
      const c = root.querySelector<HTMLElement>('[data-hero-wordmark-c]');
      const eyebrow = root.querySelector<HTMLElement>('[data-hero-eyebrow]');
      const disciplines = root.querySelector<HTMLElement>('[data-hero-disciplines]');
      const index = root.querySelector<HTMLElement>('[data-hero-index]');
      const statement = root.querySelector<HTMLElement>('[data-hero-statement]');
      const definitionLines = root.querySelectorAll<HTMLElement>('[data-hero-definition-line]');
      const definitionEcho = root.querySelector<HTMLElement>('[data-hero-definition-echo]');
      const sloganBlock = root.querySelector<HTMLElement>('[data-hero-slogan]');
      const hint = root.querySelector<HTMLElement>('[data-hero-hint]');
      const field = root.querySelector<HTMLElement>('[data-hero-field]');

      if (
        !wordmark ||
        !v ||
        !c ||
        !eyebrow ||
        !disciplines ||
        !index ||
        !statement ||
        !definitionEcho ||
        !sloganBlock ||
        !hint ||
        !field
      ) {
        return;
      }

      const revealTargets = [eyebrow, disciplines, index, definitionEcho, sloganBlock, hint];
      gsap.set(revealTargets, { opacity: 0, y: 24 });
      gsap.set(definitionLines, { opacity: 0, y: 20 });
      gsap.set(statement, { opacity: 1, y: 0 });
      gsap.set(wordmark, { opacity: 1, x: 0, y: 0, scale: 1, transformOrigin: 'center center' });
      gsap.set([v, c], { xPercent: 0, yPercent: 0 });
      gsap.set(wordmark, { '--vc-track': '-0.01em' });

      // Measure the final layout first, then apply the FLIP origin.
      const finalRect = wordmark.getBoundingClientRect();
      const introBox = readIntroBox();
      const finalCenterX = finalRect.left + finalRect.width / 2;
      const finalCenterY = finalRect.top + finalRect.height / 2;
      const startScale = introBox ? introBox.w / finalRect.width : 0.22;
      const startX = (introBox?.x ?? window.innerWidth / 2) - finalCenterX;
      const startY = (introBox?.y ?? window.innerHeight / 2) - finalCenterY;

      gsap.set(wordmark, { x: startX, y: startY, scale: startScale });
      const timeline = gsap.timeline();
      timeline.to(wordmark, { x: 0, y: 0, scale: 1, duration: 1.35, ease: 'power3.out' }, 0);
      timeline.to(eyebrow, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.16);
      timeline.to(disciplines, { opacity: 1, y: 0, duration: 0.52, ease: 'power3.out' }, 0.28);
      timeline.to(index, { opacity: 1, y: 0, duration: 0.52, ease: 'power3.out' }, 0.42);

      timeline.call(() => {
        playVcSignature({ v, c, track: wordmark });
      }, [], 0.8);
      definitionLines.forEach((line, lineIndex) => {
        timeline.to(
          line,
          { opacity: 1, y: 0, duration: 0.62, ease: 'power3.out' },
          0.7 + lineIndex * 0.12,
        );
      });
      timeline.to(definitionEcho, { opacity: 1, y: 0, duration: 0.58, ease: 'power3.out' }, 1.06);
      timeline.to(sloganBlock, { opacity: 1, y: 0, duration: 0.62, ease: 'power3.out' }, 1.31);
      timeline.to(hint, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.44);

      const scrollTrigger = {
        trigger: root,
        start: 'top top',
        end: '+=42%',
        scrub: 0.35,
      };
      gsap.to(statement, { y: -20, opacity: 0, ease: 'none', scrollTrigger });
      gsap.to(wordmark, { scale: 1.18, x: 0, y: 0, ease: 'none', scrollTrigger });
      gsap.to(v, { x: '-2.4vw', ease: 'none', scrollTrigger });
      gsap.to(c, { x: '2.4vw', ease: 'none', scrollTrigger });
      gsap.to(wordmark, { '--vc-track': '-0.08em', ease: 'none', scrollTrigger });
      gsap.to(field, { scale: 1.04, opacity: 0.15, ease: 'none', scrollTrigger });
    },
    {
      deps: [introDone, profile.ready, profile.static, profile.tier, profile.isCompact],
      disabled,
    },
  );

  useEffect(() => {
    if (disabled || !profile.ready || profile.isTouch || profile.isCompact || profile.tier === 'low') {
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
    <Band id="top" tone="paper" container={false} className="min-h-[100svh] overflow-hidden py-0">
      <div ref={rootRef} data-arrival-hidden className="hero-editorial-root">
        <HeroField />
        <div className="shell hero-editorial-shell">
          <div data-hero-eyebrow className="hero-corner hero-corner-top-left">
            <p className="type-label tone-fg">VC / 维C</p>
            <Eyebrow marker={false} className="mt-2">
              <BiOnly zh={brand.heroEyebrowZh} en={brand.heroEyebrow} />
            </Eyebrow>
          </div>

          <div data-hero-disciplines className="hero-corner hero-corner-top-right">
            <p className="type-label tone-mute max-w-[24rem] text-right">{brand.disciplineLine}</p>
            <span className="hero-signal" aria-hidden>
              <span className="hero-signal-dot" />
              <span className="type-label-sm tone-mute">ACTIVE</span>
            </span>
          </div>

          <div className="hero-wordmark-stage" aria-hidden="true">
            <h1 data-hero-wordmark className="type-hero hero-wordmark tone-fg" aria-label={brand.wordmark}>
              <span className="hero-wordmark-mask hero-wordmark-mask-v">
                <span data-hero-wordmark-v className="hero-wordmark-letter hero-wordmark-letter-v">V</span>
              </span>
              <span data-hero-wordmark-c className="hero-wordmark-letter hero-wordmark-letter-c">C</span>
            </h1>
          </div>

          <div data-hero-index className="hero-corner hero-corner-bottom-left">
            <span className="hero-index-number">01</span>
            <span className="type-label tone-mute mt-2 block">{brand.heroEyebrow}</span>
            <span className="type-label tone-mute mt-1 block">2026</span>
            <div data-hero-hint className="hero-scroll-hint mt-8">
              <span aria-hidden className="hero-scroll-line" />
              <span className="type-label tone-mute"><BiOnly zh={brand.scrollHintZh} en={brand.scrollHint} /></span>
            </div>
          </div>

          <div data-hero-statement className="hero-definition">
            <div className="hero-definition-lines" aria-label={brand.definitionZh}>
              {definitionLines.map((line, lineIndex) => (
                <p key={line} data-hero-definition-line className="hero-definition-line type-display tone-fg">
                  <span data-lang-zh>{line}</span>
                  <span data-lang-en>{definitionEnglishLines[lineIndex] ?? brand.definitionEn}</span>
                </p>
              ))}
            </div>
            <p data-hero-definition-echo className="type-label tone-mute mt-5 max-w-[34rem]">
              <span data-lang-zh>{brand.definitionEn}</span>
              <span data-lang-en>{brand.definitionZh}</span>
            </p>
            <div data-hero-slogan className="hero-slogan mt-7">
              {slogan.zhLines.map((line, index) => (
                <p key={line} className="hero-slogan-line type-md type-display tone-fg">
                  <span data-lang-zh>{line}</span>
                  <span data-lang-en>{slogan.lines[index]}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Band>
  );
}
