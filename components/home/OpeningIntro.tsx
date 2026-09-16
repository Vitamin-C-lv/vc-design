'use client';

import { useState } from 'react';
import { useIsomorphicLayoutEffect } from '@/lib/motion/useGsap';
import {
  finishIntro,
  markIntroSeen,
  publishIntroBox,
  readIntroState,
} from '@/lib/motion/introGate';
import { gsap } from '@/lib/motion/gsap';
import { intro } from '@/content/site';

/**
 * Absolute start of every beat, in seconds, followed by the hand-over.
 *
 * These are art direction rather than arithmetic — the ladder accelerates
 * (0.37s, 0.34s, 0.31s, 0.30s, 0.30s, 0.30s) so the sequence reads as the
 * world's greetings collapsing into one wordmark. The first entry is late on
 * purpose: the blank beat before 你好。 is what makes the arrival feel deliberate
 * instead of accidental.
 */
const BEATS = [0.18, 0.55, 0.89, 1.2, 1.5, 1.8, 2.1] as const;
const HANDOVER = 2.55;

/**
 * How one beat is spent: rise, rest, leave — expressed as fractions of the gap
 * to the next beat, so the three always add up and no beat can drift.
 *
 * The previous cut exited every word twice (once at the end of its own beat, and
 * again as the "previous" word of the next one), which burned the gap as dead
 * air. Here a word leaves over exactly the same interval in which the next one
 * arrives, so one word is in motion at a time and there is never an empty stage.
 */
const RISE = 0.42;
const REST = 0.26;
const LEAVE = 0.32;

/** Two-digit mark for the corner counter. */
const pad = (value: number) => String(value).padStart(2, '0');

const total = intro.words.length;

const words = [...intro.words, intro.finalWord];

/**
 * The short brand opening: six greetings, then the wordmark itself.
 *
 * It deliberately finishes before the hero is revealed, because the outgoing
 * `VC.` has to hand its *measured* box to the real wordmark — the hand-over only
 * reads as one object changing state if the FLIP starts from the size the
 * visitor is actually looking at.
 */
export function OpeningIntro() {
  const [hydrated, setHydrated] = useState(false);
  const [shouldPlay] = useState(() => readIntroState() === 'playing');

  useIsomorphicLayoutEffect(() => setHydrated(true), []);

  if (!hydrated || !shouldPlay) return null;
  return <OpeningIntroSequence />;
}

function OpeningIntroSequence() {
  useIsomorphicLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-opening-intro]');
    if (!root) return;

    const wordNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-intro-word]'));
    const textNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-intro-word-text]'));
    const counter = root.querySelector<HTMLElement>('[data-intro-counter]');
    const finalDot = root.querySelector<HTMLElement>('[data-intro-final-dot]');

    // Never strand the first screen. If the markup is not what this sequence
    // expects, hand over immediately and let the hero play its own reveal —
    // a missing greeting is a lost flourish, a missing hero is a broken site.
    if (
      !counter ||
      !finalDot ||
      wordNodes.length !== BEATS.length ||
      textNodes.length !== BEATS.length
    ) {
      finishIntro();
      return;
    }

    const timeline = gsap.timeline();
    gsap.set(wordNodes, { autoAlpha: 0 });
    gsap.set(textNodes, { yPercent: 110 });
    gsap.set(finalDot, { opacity: 1 });

    BEATS.forEach((beat, index) => {
      const isFinal = index === BEATS.length - 1;
      const gap = (isFinal ? HANDOVER : BEATS[index + 1]) - beat;

      timeline.set(wordNodes[index], { autoAlpha: 1 }, beat);
      timeline.to(
        textNodes[index],
        {
          yPercent: 0,
          duration: gap * RISE,
          ease: 'power3.out',
          onStart: () => {
            counter.textContent = `${pad(Math.min(index + 1, total))} / ${pad(total)}`;
          },
        },
        beat,
      );

      if (!isFinal) {
        timeline.to(
          textNodes[index],
          { yPercent: -110, duration: gap * LEAVE, ease: 'power2.in' },
          beat + gap * (RISE + REST),
        );
      }
    });

    const finalBeat = BEATS[BEATS.length - 1];

    timeline.call(
      () => {
        // Measure the word itself, not its stage. The stage is a
        // `width: min(90vw, 50rem)` box, so publishing it made the FLIP start at
        // roughly three-quarters scale instead of at the letters on screen.
        const rect = textNodes[textNodes.length - 1].getBoundingClientRect();
        publishIntroBox({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          w: rect.width,
          h: rect.height,
        });
        markIntroSeen();
      },
      [],
      finalBeat + 0.18,
    );
    // The dot goes first: with it gone the outgoing mark is plain `VC`, which is
    // exactly what it is about to become. The layer then fades out *under* the
    // hero, so the wordmark is never absent — it only changes owner.
    const dotOut = finalBeat + 0.19;
    const layerOut = dotOut + 0.12;
    timeline.to(finalDot, { opacity: 0, duration: 0.12, ease: 'power3.out' }, dotOut);
    timeline.to(
      root,
      { opacity: 0, duration: HANDOVER - layerOut, ease: 'power2.out', onComplete: finishIntro },
      layerOut,
    );

    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <div data-opening-intro className="opening-intro" aria-hidden="true">
      <div className="opening-intro-counter type-label-sm" data-intro-counter>
        {`01 / ${pad(total)}`}
      </div>
      <div className="opening-intro-word-stage">
        {words.map((word, index) => {
          const isFinal = index === words.length - 1;
          return (
            <span
              key={word}
              data-intro-word
              data-intro-final-word={isFinal ? '' : undefined}
              className="opening-intro-word"
            >
              <span className="opening-intro-word-mask">
                <span data-intro-word-text>
                  {isFinal ? (
                    <>
                      {intro.finalWord}
                      <span data-intro-final-dot>.</span>
                    </>
                  ) : (
                    word
                  )}
                </span>
              </span>
            </span>
          );
        })}
      </div>
      <div className="opening-intro-signature type-label-sm">{intro.signature}</div>
    </div>
  );
}
