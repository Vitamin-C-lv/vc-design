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
 * The opening is directed in seconds, not in fractions of a beat.
 *
 * The previous cut was already moving at 0.18s: the page had not finished
 * arriving and the first greeting was on its way out. The cure is not "make
 * everything slower" — it is one first beat with room to land:
 *
 *   0.00 – 0.28   warm paper, nothing on it (the panel only settles brighter)
 *   0.28          `01 / 06` and `VC DESIGN` fade in: something is coming
 *   0.68          你好。          ← the first beat, held 0.36s
 *   1.40          HELLO.          ← from here the ladder gathers speed
 *   1.82          BONJOUR.
 *   2.20          こんにちは。
 *   2.56          안녕하세요.
 *   2.90          HOLA.
 *   3.24          VC.             ← unchanged, still tight into the hand-over
 *   3.68          hand-over
 *
 * The blank beat is the whole point: the visitor gets to arrive first, and the
 * sequence starts after that. The first entry carries much the longest hold
 * (0.36s against 0.12–0.15s further down) because it is the beat where the rule
 * of the sequence is learned — "it is greeting me" has to land before "and in
 * every language" can.
 */
const BEATS = [0.68, 1.4, 1.82, 2.2, 2.56, 2.9, 3.24] as const;
const HANDOVER = 3.68;

/** A phone gets a longer first beat: the tap, the browser chrome collapsing and
 *  the first paint all happen under the opening, so it needs a little more room
 *  before the first greeting — not a longer animation. */
const PHONE_LEAD = 0.1;

/** When the counter and the signature arrive, ahead of the first greeting. */
const LABELS_IN = 0.28;
const LABELS_IN_DURATION = 0.5;

/**
 * Rise (mask reveal) and hold (motionless) per greeting, in seconds.
 *
 * The exit is whatever is left of the beat, so a word always clears the mask
 * exactly as the next one arrives — one word in motion at a time, never an
 * empty stage. Written as seconds rather than shares of the beat because the
 * rhythm *is* the direction here: the hold shrinks 0.36 → 0.12 while the rise
 * tightens 0.22 → 0.13, so the greetings visibly gather speed instead of all
 * reading at one tempo.
 */
const RISE_S = [0.22, 0.16, 0.15, 0.14, 0.13, 0.13] as const;
const HOLD_S = [0.36, 0.15, 0.13, 0.12, 0.12, 0.12] as const;

/** How long the wordmark takes to land. The dot leaves the moment it does: the
 *  outgoing mark becomes plain `VC`, which is what it is about to be. */
const FINAL_RISE = 0.19;

/** A hair darker than the panel's own tone — the opening's only "breath". */
const dim = (rgb: string) => {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).map(Number);
  if (r === undefined || g === undefined || b === undefined) return rgb;
  const k = 0.972;
  return `rgb(${Math.round(r * k)}, ${Math.round(g * k)}, ${Math.round(b * k)})`;
};

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
    const signature = root.querySelector<HTMLElement>('[data-intro-signature]');
    const finalDot = root.querySelector<HTMLElement>('[data-intro-final-dot]');

    // The counter and the signature arrive together, and the signature is
    // decoration: if it ever goes missing the opening still plays.
    const labels = [counter, signature].filter((node): node is HTMLElement => node !== null);

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

    /*
     * Every absolute time shifts by the phone lead, so the rhythm is identical
     * on both and only the blank first beat differs.
     */
    const lead = window.matchMedia('(max-width: 767px)').matches ? PHONE_LEAD : 0;
    const schedule = BEATS.map((beat) => beat + lead);
    const handover = HANDOVER + lead;

    const timeline = gsap.timeline();
    gsap.set(wordNodes, { autoAlpha: 0 });
    gsap.set(textNodes, { yPercent: 110 });
    gsap.set(finalDot, { opacity: 1 });
    gsap.set(labels, { autoAlpha: 0 });

    /*
     * The blank first beat is not a dead frame. The panel settles from a hair
     * darker into its own bone tone — about 3% of luminance, nothing moves — so
     * the screen reads as coming up rather than as a slide starting.
     */
    const bone = getComputedStyle(root).backgroundColor;
    timeline.fromTo(
      root,
      { backgroundColor: dim(bone) },
      { backgroundColor: bone, duration: 0.9, ease: 'power2.out' },
      lead,
    );

    // A hint that something is coming, ~0.4s before the first word.
    timeline.to(
      labels,
      { autoAlpha: 1, duration: LABELS_IN_DURATION, ease: 'power2.out' },
      lead + LABELS_IN,
    );

    schedule.forEach((beat, index) => {
      const isFinal = index === schedule.length - 1;
      const gap = (isFinal ? handover : schedule[index + 1]) - beat;
      const rise = isFinal ? FINAL_RISE : RISE_S[index];
      const hold = isFinal ? 0 : HOLD_S[index];
      // Whatever is left of the beat is the exit. `max` is a guard against a
      // future edit leaving no room for the exit, not a tuning knob.
      const leave = Math.max(0.04, gap - rise - hold);

      timeline.set(wordNodes[index], { autoAlpha: 1 }, beat);
      timeline.to(
        textNodes[index],
        {
          yPercent: 0,
          duration: rise,
          ease: 'power3.out',
          onStart: () => {
            if (isFinal) return;
            counter.textContent = `${pad(Math.min(index + 1, total))} / ${pad(total)}`;
          },
        },
        beat,
      );

      if (!isFinal) {
        timeline.to(
          textNodes[index],
          { yPercent: -110, duration: leave, ease: 'power2.in' },
          beat + rise + hold,
        );
      }
    });

    const finalBeat = schedule[schedule.length - 1];

    /*
     * The counter belongs to the greetings, not to the wordmark, and it leaves
     * with them.
     *
     * Six greetings count to `06 / 06`; the wordmark is not a seventh language,
     * so leaving the counter up made it look like one more hello — and the
     * alternative, `07 / 07`, would have been a lie about a list of six. It
     * rides out with the last greeting's exit rather than the wordmark's
     * arrival, because that is the moment the list it counts is over.
     *
     * The timing is the point: the final mark lands at `finalBeat + 0.19` and
     * its dot leaves immediately after, so a fade started *at* the final beat
     * was still on screen — faintly, but measurably — for the entire life of the
     * complete `VC.`. Finishing the counter before the mark lands is what makes
     * the last frame of the opening nothing but the wordmark.
     */
    const lastGreeting = schedule[schedule.length - 2];
    const greetingExit = lastGreeting + RISE_S[RISE_S.length - 1] + HOLD_S[HOLD_S.length - 1];
    timeline.to(counter, { opacity: 0, duration: 0.2, ease: 'power2.out' }, greetingExit);

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
    const dotOut = finalBeat + FINAL_RISE;
    const layerOut = dotOut + 0.12;
    timeline.to(finalDot, { opacity: 0, duration: 0.12, ease: 'power3.out' }, dotOut);
    timeline.to(
      root,
      { opacity: 0, duration: handover - layerOut, ease: 'power2.out', onComplete: finishIntro },
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
      <div className="opening-intro-signature type-label-sm" data-intro-signature>
        {intro.signature}
      </div>
    </div>
  );
}
