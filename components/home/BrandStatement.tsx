'use client';

import { Bi, BiOnly } from '@/components/i18n/Bi';
import { Band, Eyebrow } from '@/components/primitives';
import { bridge, slogan } from '@/content/site';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';

/**
 * The kinetic bridge between the hero and the work.
 *
 * This band used to restate the brand definition — the same sentence the hero
 * sets, set again a screen later — which made the opening read
 * `你好 → VC → 介绍 VC → 再介绍一次 VC → 作品`. The hero now carries the whole
 * definition, so this band carries the *next* question instead (what the unit
 * does), three verbs passing through one at a time, closing on the locked
 * slogan so the black arch arrives at the end of a sentence.
 *
 * Two renderings come out of one markup tree, and the CSS holds the switch: by
 * default the verbs are stacked in normal flow — that is what the server sends,
 * what no-JS gets, and what reduced motion keeps. `data-bridge-live` is only set
 * on devices that can afford the scrub, and only then does the stage become
 * sticky and the verbs start sharing one mask. Nothing has to be hidden by hand
 * in the fallback, so the fallback cannot come up blank.
 */
export function BrandStatement() {
  const profile = useDeviceProfile();
  const live = profile.ready && !profile.static && profile.tier !== 'low';

  const rootRef = useGsapScope<HTMLDivElement>(
    ({ gsap, root }) => {
      const words = gsap.utils.toArray<HTMLElement>('[data-bridge-word]', root);
      const close = root.querySelector<HTMLElement>('[data-bridge-close]');
      if (words.length !== bridge.words.length) return;

      /*
       * One screen of travel for the whole bridge, and all of it pinned.
       *
       * The earlier cut ran the scrub from `top 70%`, which spent the first
       * third of the sequence before the stage had pinned — `MAKE.` rose and
       * left again while the band was still scrolling into place, so the only
       * verb the visitor could actually read on a still screen was the second
       * one. Starting at `top top` and ending at `bottom bottom` puts every
       * verb inside the pin, and ends it exactly when the black arch's top
       * reaches the bottom of the screen: `BUILD.` and the slogan are still on
       * stage when the dark band starts to rise.
       */
      const SPACING = 0.98;
      const RISE = 0.32;
      const HOLD = 0.3;

      const timeline = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      words.forEach((word, index) => {
        // The first verb is simply *there* when the band arrives, centred, so
        // the stage is never a blank screen waiting for a word to climb into it.
        if (index > 0) {
          timeline.fromTo(
            word,
            { yPercent: 110 },
            { yPercent: 0, duration: RISE, ease: 'power3.out' },
            index * SPACING - RISE,
          );
        }
        if (index < words.length - 1) {
          timeline.to(
            word,
            { yPercent: -110, duration: RISE, ease: 'power2.in' },
            index * SPACING + HOLD,
          );
        }
      });

      if (close) {
        // The slogan lands on the last verb and stays with it, so the band ends
        // on a whole sentence instead of an empty frame.
        timeline.fromTo(
          close,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          (words.length - 1) * SPACING + 0.55,
        );
      }
    },
    { deps: [live], disabled: !live },
  );

  return (
    <Band id="statement" tone="paper" container={false} className="bridge-band">
      <div ref={rootRef} className="bridge" data-bridge-live={live ? '' : undefined}>
        <div className="bridge-stage">
          <div className="shell bridge-shell">
            <Eyebrow marker={false}>
              <BiOnly zh={bridge.eyebrowZh} en={bridge.eyebrow} />
            </Eyebrow>

            <div className="bridge-words">
              {bridge.words.map((word) => (
                <p key={word.en} data-bridge-word className="bridge-word type-display tone-fg">
                  <span className="bridge-word-verb">{word.en}</span>
                  <span className="bridge-word-gloss type-label tone-mute">
                    <BiOnly zh={word.zh} en={word.zh} />
                  </span>
                </p>
              ))}
            </div>

            <div data-bridge-close className="bridge-close">
              {slogan.lines.map((line, index) => (
                <p key={line} className="bridge-close-line type-display tone-fg">
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
