'use client';

import { Bi, BiOnly } from '@/components/i18n/Bi';
import { Band, Eyebrow } from '@/components/primitives';
import { bridge, slogan } from '@/content/site';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';

/**
 * The brand poster between the hero and the work.
 *
 * This band used to swap one verb for the next inside a pinned stage. The
 * substitution read as a carousel, and the pin held the viewport for 215svh, so
 * the page itself stopped moving while the words changed — the visitor's report
 * was 「手已经滑了，但 MAKE 还固定在原地」. Both halves of that are gone.
 *
 * The composition is cumulative and it is frozen here: `MAKE.` arrives and
 * *stays*, `SOLVE.` joins it, `BUILD.` joins both, and only then does the slogan
 * land. What the visitor watches is one poster being built rather than three
 * animations taking turns. Nothing ever leaves the frame either: the next
 * chapter covers the finished poster with the black arch instead of the poster
 * dismantling itself.
 *
 * The page is never pinned for any of it. The stage is ordinary document flow,
 * and each verb is revealed *once* when it crosses a line in the viewport — a
 * latch, not a scrub, so scrolling back up can never take a verb away again.
 *
 * One markup tree serves every audience. By default the verbs stack in normal
 * flow with their Chinese glosses: that is what the server sends, what no-JS
 * gets, and what reduced motion keeps. `data-poster-live` is only set on devices
 * that can afford the reveals, and only then does the CSS compose the poster.
 */

/** Viewport line each verb crosses on its way in, in per-cent of the height. */
const REVEAL_LINE = [92, 90, 86];

/**
 * How far a verb steps back once a later one has joined it.
 *
 * 0.80, not 0.72: at 0.72 the finished words read as *disabled* rather than as
 * "still here, only no longer the focus" — the client's words were 「0.72 稍微太像
 * disabled 状态」 and 「累积式构图的重点是：它还在那里，只是现在焦点转移了」. The
 * scale step carries "set back"; the opacity only has to stop competing.
 */
const DIMMED = 0.8;

/** The last, very light lock: a few pixels of drift, then settle. No bounce. */
const LOCK_DRIFT = [-3, 2, -2];

export function BrandStatement() {
  const profile = useDeviceProfile();
  const live = profile.ready && !profile.static && profile.tier !== 'low';

  const rootRef = useGsapScope<HTMLDivElement>(
    ({ gsap, ScrollTrigger, root }) => {
      const words = gsap.utils.toArray<HTMLElement>('[data-poster-word]', root);
      const close = root.querySelector<HTMLElement>('[data-poster-close]');
      if (words.length !== bridge.words.length) return;

      const parts = words.map((word) => ({
        word,
        verb: word.querySelector<HTMLElement>('[data-poster-verb]'),
        gloss: word.querySelector<HTMLElement>('[data-poster-gloss]'),
      }));

      /** How far the build has got: -1 nothing, 0 MAKE, 1 +SOLVE, 2 +BUILD. */
      let built = -1;

      /*
       * The waiting state, set *now* rather than inside the first tween.
       *
       * A `fromTo` only applies its start values when it runs, so leaving the
       * verbs at rest meant the poster was fully legible the moment the visitor
       * reached it — every verb already standing in its mask, the slogan already
       * under its rule — and the only thing a trigger did was pop a word down out
       * of sight and let it climb back. The live layer owns this state from its
       * first frame instead. It is safe because it only exists when the script is
       * running: the server's markup, no-JS and reduced motion keep the whole
       * poster legible, and nothing here ever runs for them.
       */
      parts.forEach((part) => {
        if (part.verb) gsap.set(part.verb, { yPercent: 118 });
        if (part.gloss) gsap.set(part.gloss, { autoAlpha: 0 });
      });
      if (close) gsap.set(close, { autoAlpha: 0, y: 18 });

      /** A verb arrives: it climbs through its own mask, then settles. */
      const arrive = (index: number) => {
        const part = parts[index];
        if (!part) return;
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        if (part.verb) {
          timeline.fromTo(part.verb, { yPercent: 118 }, { yPercent: 0, duration: 1.05 }, 0);
        }
        timeline.fromTo(
          part.word,
          { scale: 0.985 },
          { scale: 1, duration: 1.2, ease: 'power2.out' },
          0,
        );
        if (part.gloss) {
          timeline.fromTo(
            part.gloss,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.7 },
            0.36,
          );
        }
      };

      /**
       * The verbs already on the poster step back as the next one joins — far
       * enough to read as depth, never far enough to read as gone.
       */
      const recede = (indexes: number[]) => {
        const targets = indexes.map((index) => parts[index]?.word).filter(Boolean);
        if (!targets.length) return;
        gsap.to(targets, { opacity: DIMMED, scale: 0.99, duration: 0.9, ease: 'power2.out' });
      };

      /**
       * The last piece lands, so the poster resolves: the three verbs come back
       * to full weight together, drift a few pixels into place, and the slogan
       * arrives underneath its rule. This is the end state — the arch comes next,
       * and nothing here fades out to make room for it.
       */
      const resolve = () => {
        const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
        timeline.to(words, { opacity: 1, scale: 1, duration: 0.9 }, 0);
        words.forEach((word, index) => {
          timeline.fromTo(word, { y: LOCK_DRIFT[index] ?? 0 }, { y: 0, duration: 0.95 }, 0);
        });
        if (close) {
          timeline.fromTo(close, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.5);
        }
      };

      const build = (next: number) => {
        if (next <= built) return;
        for (let index = built + 1; index <= next; index += 1) arrive(index);
        built = next;
        if (next === 1) recede([0]);
        if (next === 2) {
          recede([0, 1]);
          // `BUILD.` drives for about a second; the poster resolves after it lands.
          gsap.delayedCall(1.1, resolve);
        }
      };

      parts.forEach((part, index) => {
        ScrollTrigger.create({
          trigger: part.word,
          start: `top ${REVEAL_LINE[index] ?? 88}%`,
          invalidateOnRefresh: true,
          onEnter: () => build(index),
        });
      });

      /*
       * Landing *inside* the poster — a restored scroll position, or a reload
       * after the browser remembered where the visitor was — has to show the
       * poster already built. The triggers above only fire on movement, so one
       * pass measures where the verbs actually are.
       */
      const arrived = parts.reduce((highest, part, index) => {
        const line = (window.innerHeight * (REVEAL_LINE[index] ?? 88)) / 100;
        return part.word.getBoundingClientRect().top <= line ? index : highest;
      }, -1);
      if (arrived >= 0) build(arrived);
    },
    { deps: [live], disabled: !live },
  );

  return (
    <Band id="statement" tone="paper" container={false} className="poster-band">
      <div ref={rootRef} className="poster" data-poster-live={live ? '' : undefined}>
        <div className="shell">
          <div className="poster-stage">
            <Eyebrow marker={false} className="poster-eyebrow">
              <BiOnly zh={bridge.eyebrowZh} en={bridge.eyebrow} />
            </Eyebrow>

            <div className="poster-words">
              {bridge.words.map((word, index) => (
                <p
                  key={word.en}
                  data-poster-word
                  className={`poster-word poster-word-${index + 1} type-display tone-fg`}
                >
                  <span className="poster-verb-mask">
                    <span data-poster-verb className="poster-verb">
                      {word.en}
                    </span>
                  </span>
                  <span data-poster-gloss className="poster-gloss type-label tone-mute">
                    <BiOnly zh={word.zh} en={word.zh} />
                  </span>
                </p>
              ))}
            </div>

            <div data-poster-close className="poster-close">
              <span className="poster-close-rule" aria-hidden="true" />
              {/*
               * The English pair is the brand sentence, not a translation — so it
               * is the display type in *both* languages. `zh={line}` is the same
               * "language-invariant content" trick the glosses above use, and it
               * keeps `Bi`'s slot convention instead of hand-writing `data-lang`.
               */}
              {slogan.lines.map((line) => (
                <p key={line} className="poster-close-line type-display tone-fg">
                  <Bi as={null} zh={line} en={line} hideSecondary />
                </p>
              ))}
              {/*
               * …and the Chinese sentence rides underneath as the smaller note, for
               * the readers the site is actually for. `en={null}` + `hideSecondary`
               * means the slot only exists in Chinese mode; in English mode the empty
               * slot collapses (`.poster-close-note:empty`), so the English poster
               * ends on the two locked lines and nothing else.
               */}
              <Bi
                as={null}
                zh={slogan.zh}
                en={null}
                hideSecondary
                primaryClassName="poster-close-note"
              />
            </div>
          </div>
        </div>
      </div>
    </Band>
  );
}
