'use client';

import { useEffect, useState } from 'react';
import { Band, Eyebrow } from '@/components/primitives';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { brand, slogan } from '@/content/site';
import { useDeviceProfile } from '@/lib/motion/device';
import { gsap } from '@/lib/motion/gsap';
import { readIntroBox, whenIntroDone } from '@/lib/motion/introGate';
import { useGsapScope, useIsomorphicLayoutEffect } from '@/lib/motion/useGsap';
import { HeroField } from './HeroField';

/**
 * The definition in the three lines the hero sets, zipped by hand rather than by
 * index into two arrays of hopefully-equal length — the previous `?? fallback`
 * is what let English mode print the sentence twice.
 */
const definitionPairs = [
  { zh: brand.definitionLinesZh[0], en: brand.definitionLinesEn[0] },
  { zh: brand.definitionLinesZh[1], en: brand.definitionLinesEn[1] },
  { zh: brand.definitionLinesZh[2], en: brand.definitionLinesEn[2] },
];

/**
 * Share of the viewport width the wordmark asks for. The height of the band
 * between the top corners and the information plate is the other, harder limit —
 * see the fit effect.
 */
const MARK_FILL = 1.0;

/**
 * How far past its final size the wordmark travels on the way in, as a multiple
 * of that final size — 1.13 = 113%.
 *
 * This is the one number behind "the opening's VC pushed the world open". It is
 * an animation state only: the resting size is still whatever the fit measures,
 * so the overshoot cannot move the composition. Below ~1.08 the inflation reads
 * as a settle rather than as a push; above ~1.16 the V and the C are clipped by
 * the viewport on a laptop and the wordmark stops reading as a wordmark.
 */
const MARK_OVERSHOOT = 1.13;

/**
 * The letter-spacing the opening sets its own words in. The hero starts here so
 * the hand-over frame is identical in both layers.
 */
const INTRO_TRACK = '-0.035em';

/** Below this width the wordmark is composed absolutely instead of by measurement. */
const MEASURED_LAYOUT_QUERY = '(min-width: 768px)';

export function Hero() {
  const profile = useDeviceProfile();
  const [introDone, setIntroDone] = useState(false);
  const disabled = !introDone || !profile.ready || profile.static || profile.tier === 'low';

  useEffect(() => whenIntroDone(() => setIntroDone(true)), []);

  /**
   * Size the wordmark by measurement.
   *
   * The mark used to be sized with `clamp(12rem, 52vw, 48rem)`, whose rem ceiling
   * (768px) silently took over at 1600px — `52vw` never applied — and the brand
   * rendered at 64% of the viewport width. The brief asks the opposite way: a
   * wordmark as large as the frame allows, with the V and C reaching past both
   * edges wherever the aspect ratio permits.
   *
   * Two limits decide the size, and neither is a magic number: the viewport
   * width, and the vertical band left between the top corners and the information
   * plate. On a 1600×1000 screen the band is the binding one — two letters that
   * span the full width are ~830px tall, and the corners have to live somewhere.
   *
   * The band is measured against the *cap height* rather than the line box: the
   * box carries about 15% of leading that would otherwise be spent on nothing.
   * Layout metrics only (`offsetWidth`/`offsetHeight`/`offsetLeft`), so this is
   * immune to whatever transform the entrance or the pointer parallax has set.
   */
  useIsomorphicLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-hero-root]');
    if (!root) return;

    const stage = root.querySelector<HTMLElement>('.hero-wordmark-stage');
    const wordmark = root.querySelector<HTMLElement>('[data-hero-wordmark]');
    const letterC = root.querySelector<HTMLElement>('[data-hero-wordmark-c]');
    const definition = root.querySelector<HTMLElement>('.hero-definition');
    const corners = [
      root.querySelector<HTMLElement>('[data-hero-eyebrow]'),
      root.querySelector<HTMLElement>('[data-hero-disciplines]'),
    ];
    if (!stage || !wordmark || !letterC || !definition) return;

    /** Cap height as a fraction of the font size, straight from the font itself. */
    const inkRatio = (() => {
      const context = document.createElement('canvas').getContext('2d');
      if (!context) return 0.72;
      context.font = `500 200px ${getComputedStyle(wordmark).fontFamily}`;
      const heights = ['V', 'C'].map((letter) => {
        const metrics = context.measureText(letter);
        return (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 200;
      });
      return Math.max(...heights);
    })();

    const fit = () => {
      if (!window.matchMedia(MEASURED_LAYOUT_QUERY).matches) {
        wordmark.style.removeProperty('font-size');
        stage.style.removeProperty('top');
        root.style.removeProperty('--hero-c-left');
        return;
      }

      // Measure at a known size: width and box height are both linear in it.
      wordmark.style.fontSize = '100px';
      const widthRatio = wordmark.offsetWidth / 100;
      const boxRatio = wordmark.offsetHeight / 100;
      if (!widthRatio || !boxRatio) return;

      const rootTop = root.getBoundingClientRect().top;
      const cornersBottom = Math.max(
        ...corners.map((corner) => (corner ? corner.getBoundingClientRect().bottom : 0)),
      );
      const bandTop = cornersBottom + 18 - rootTop;
      const bandBottom = definition.getBoundingClientRect().top - 26 - rootTop;
      const band = Math.max(140, bandBottom - bandTop);

      const size = Math.min((root.clientWidth * MARK_FILL) / widthRatio, band / inkRatio);
      wordmark.style.fontSize = `${size}px`;

      // Centre the ink (not the line box) in the band. On a portrait tablet the
      // width is the binding limit and the band is far taller than the mark, so
      // without this the letters cling to the top and leave a hole above the
      // information plate.
      const leading = Math.max(0, boxRatio - inkRatio) * size;
      const slack = Math.max(0, band - inkRatio * size);
      stage.style.top = `${Math.round(bandTop + slack / 2 - leading / 2)}px`;

      // Hand the C's left edge to CSS: the definition plate starts there, so the
      // information block meets the letterform instead of biting into it.
      const markLeft = (root.clientWidth - wordmark.offsetWidth) / 2;
      root.style.setProperty('--hero-c-left', `${Math.round(markLeft + letterC.offsetLeft)}px`);
    };

    fit();

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    window.addEventListener('resize', schedule, { passive: true });
    // The display face may load after first paint, which changes both ratios.
    void document.fonts?.ready.then(schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
    };
  }, []);

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
      /*
       * The tracking starts at the value the *opening* was set in, not at the
       * hero's own value. Handing over two words that are already spaced
       * differently is a visible twitch at the exact frame the two layers swap,
       * and that frame is the whole trick.
       */
      gsap.set(wordmark, { '--vc-track': INTRO_TRACK });
      // The underprint is the last thing to arrive, not the first: the wordmark
      // has to win one uninterrupted beat before the page has a texture.
      gsap.set(field, { opacity: 0 });

      // Measure the final layout first, then apply the FLIP origin.
      const finalRect = wordmark.getBoundingClientRect();
      const introBox = readIntroBox();
      const finalCenterX = finalRect.left + finalRect.width / 2;
      const finalCenterY = finalRect.top + finalRect.height / 2;
      const startScale = introBox ? introBox.w / finalRect.width : 0.22;
      const startX = (introBox?.x ?? window.innerWidth / 2) - finalCenterX;
      const startY = (introBox?.y ?? window.innerHeight / 2) - finalCenterY;

      gsap.set(wordmark, { x: startX, y: startY, scale: startScale });

      /*
       * The hand-over, in one object.
       *
       * It used to be a plain 1.35s `power3.out` from the opening's box to the
       * final size, with the navigation, corners and grid fading up from 0.16s
       * behind it. The result read as "the page appeared, then a logo grew":
       * the visitor never got a frame in which the wordmark was the only thing
       * happening.
       *
       * Now the mark inflates first, past its own final size, holds there for a
       * beat, and is pulled back to the size the layout actually wants — and
       * nothing else on the page moves until it has finished. The overshoot is
       * entirely inside the animation: the resting state is the same 73.9% of
       * the viewport it was before, measured by the same fit code.
       */
      const timeline = gsap.timeline();
      timeline.to(
        wordmark,
        { x: 0, y: 0, scale: MARK_OVERSHOOT, duration: 0.27, ease: 'power2.out' },
        0.15,
      );
      timeline.to(wordmark, { scale: 1, duration: 0.3, ease: 'power2.inOut' }, 0.65);
      timeline.to(wordmark, { '--vc-track': '-0.01em', duration: 0.85, ease: 'power2.out' }, 0.15);

      timeline.to(field, { opacity: 0.62, duration: 0.8, ease: 'power2.out' }, 0.3);
      timeline.to(eyebrow, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.45);
      timeline.to(disciplines, { opacity: 1, y: 0, duration: 0.52, ease: 'power3.out' }, 0.5);
      timeline.to(index, { opacity: 1, y: 0, duration: 0.52, ease: 'power3.out' }, 0.55);

      definitionLines.forEach((line, lineIndex) => {
        timeline.to(
          line,
          { opacity: 1, y: 0, duration: 0.62, ease: 'power3.out' },
          0.6 + lineIndex * 0.12,
        );
      });
      timeline.to(definitionEcho, { opacity: 1, y: 0, duration: 0.58, ease: 'power3.out' }, 1.0);
      timeline.to(sloganBlock, { opacity: 1, y: 0, duration: 0.62, ease: 'power3.out' }, 1.25);
      timeline.to(hint, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.38);

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
      /*
       * `fromTo` with `immediateRender: false`, not a plain `to`.
       *
       * A scrubbed `to` captures its start value when it is created — which is
       * now before the entrance has brought the underprint up from 0, so the
       * parallax fade would have been measured against an invisible element and
       * the grid would never have returned. The explicit start value plus
       * `immediateRender: false` leaves the entrance in charge until the
       * visitor actually scrolls.
       */
      gsap.fromTo(
        field,
        { opacity: 0.62, scale: 1 },
        { scale: 1.04, opacity: 0.15, ease: 'none', scrollTrigger, immediateRender: false },
      );
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
      <div ref={rootRef} data-hero-root data-arrival-hidden className="hero-editorial-root">
        <HeroField />
        <div className="shell hero-editorial-shell">
          <div data-hero-eyebrow className="hero-corner hero-corner-top-left">
            <p className="type-label tone-fg hero-corner-wordmark">VC / 维C</p>
            <Eyebrow marker={false} className="mt-2">
              <BiOnly zh={brand.heroEyebrowZh} en={brand.heroEyebrow} />
            </Eyebrow>
          </div>

          <div data-hero-disciplines className="hero-corner hero-corner-top-right">
            <p className="type-label tone-mute hero-disciplines-list">{brand.disciplineLine}</p>
            <span className="hero-signal" aria-hidden>
              <span className="hero-signal-dot" />
              <span className="type-label-sm tone-mute">{brand.statusLabel}</span>
            </span>
          </div>

          {/*
            The stage is decoration; the heading inside it is the page's only
            <h1> and must stay exposed to assistive technology. The previous cut
            put `aria-hidden` on this wrapper, which swallowed the heading.
          */}
          <div className="hero-wordmark-stage">
            <h1 data-hero-wordmark aria-label={brand.wordmark} className="type-hero hero-wordmark tone-fg">
              <span className="hero-wordmark-mask hero-wordmark-mask-v">
                <span data-hero-wordmark-v aria-hidden className="hero-wordmark-letter hero-wordmark-letter-v">V</span>
              </span>
              <span data-hero-wordmark-c aria-hidden className="hero-wordmark-letter hero-wordmark-letter-c">C</span>
            </h1>
          </div>

          <div data-hero-index className="hero-corner hero-corner-bottom-left">
            <span className="hero-index-number">01</span>
            <span data-hero-index-eyebrow className="type-label tone-mute mt-2 block">{brand.heroEyebrow}</span>
            <span className="type-label tone-mute mt-1 block">2026</span>
            <div data-hero-hint className="hero-scroll-hint">
              <span aria-hidden className="hero-scroll-line" />
              <span className="type-label tone-mute"><BiOnly zh={brand.scrollHintZh} en={brand.scrollHint} /></span>
            </div>
          </div>

          <div data-hero-statement className="hero-definition">
            <div className="hero-definition-lines">
              {definitionPairs.map((line) => (
                <p key={line.zh} data-hero-definition-line className="hero-definition-line type-display tone-fg">
                  <Bi as={null} zh={line.zh} en={line.en} hideSecondary />
                </p>
              ))}
            </div>
            <p data-hero-definition-echo className="type-label tone-mute hero-definition-echo">
              <Bi as={null} zh={brand.definitionEn} en={brand.definitionZh} hideSecondary />
            </p>
            <div data-hero-slogan className="hero-slogan">
              {slogan.lines.map((line, index) => (
                <p key={line} className="hero-slogan-line type-md type-display tone-fg">
                  <Bi as={null} zh={slogan.zhLines[index]} en={line} hideSecondary />
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Band>
  );
}
