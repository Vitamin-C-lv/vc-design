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

const words = ['你好。', 'HELLO.', 'BONJOUR.', 'こんにちは。', '안녕하세요.', 'HOLA.', 'VC.'];

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

/**
 * The short brand opening. It deliberately exits before the hero is revealed so
 * the final `VC.` can hand its measured box to the real wordmark.
 */
export function OpeningIntro() {
  const [hydrated, setHydrated] = useState(false);
  const [shouldPlay] = useState(() => readIntroState() === 'playing');

  useIsomorphicLayoutEffect(() => {
    if (shouldPlay && !document.documentElement.getAttribute('data-intro')) {
      document.documentElement.setAttribute('data-intro', 'playing');
    }
    setHydrated(true);
  }, [shouldPlay]);

  if (!hydrated || !shouldPlay) return null;
  return <OpeningIntroSequence />;
}

function OpeningIntroSequence() {

  useIsomorphicLayoutEffect(() => {
    const documentRoot = document.documentElement;
    if (!documentRoot.getAttribute('data-intro')) documentRoot.setAttribute('data-intro', 'playing');

    const root = document.querySelector<HTMLElement>('[data-opening-intro]');
    if (!root) return;

    const wordNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-intro-word]'));
    const textNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-intro-word-text]'));
    const counter = root.querySelector<HTMLElement>('[data-intro-counter]');
    const finalWord = root.querySelector<HTMLElement>('[data-intro-final-word]');
    const finalDot = root.querySelector<HTMLElement>('[data-intro-final-dot]');
    if (!counter || !finalWord || !finalDot || wordNodes.length !== words.length) return;

    const intro = gsap.timeline();
    const progressToEnd = (index: number) => index / (words.length - 1);
    const exitDuration = (index: number) => lerp(0.16, 0.1, progressToEnd(index));
    const holdDuration = (index: number) => lerp(0.19, 0.11, progressToEnd(index));
    const enterDuration = (index: number) => lerp(0.34, 0.2, progressToEnd(index));

    gsap.set(wordNodes, { autoAlpha: 0 });
    gsap.set(textNodes, { yPercent: 110 });
    gsap.set(finalDot, { opacity: 1 });

    wordNodes.forEach((wordNode, index) => {
      const textNode = textNodes[index];
      const previousText = textNodes[index - 1];
      const enter = enterDuration(index);
      const hold = holdDuration(index);
      const exit = exitDuration(index);

      if (previousText) {
        intro.to(previousText, {
          yPercent: -110,
          duration: exit,
          ease: 'power2.in',
          onComplete: () => {
            gsap.set(wordNodes[index - 1], { autoAlpha: 0 });
          },
        });
      }

      intro.set(wordNode, {
        autoAlpha: 1,
      });
      intro.to(textNode, {
        yPercent: 0,
        duration: enter,
        ease: 'power3.out',
        onStart: () => {
          counter.textContent = `${String(Math.min(index + 1, 6)).padStart(2, '0')} / 06`;
        },
      });

      if (index < words.length - 1) {
        intro.to(textNode, { yPercent: -110, duration: exit, ease: 'power2.in' }, `+=${hold}`);
      } else {
        intro.to({}, { duration: hold });
      }
    });

    intro.call(() => {
      const rect = finalWord.getBoundingClientRect();
      publishIntroBox({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        w: rect.width,
        h: rect.height,
      });
      markIntroSeen();
    });
    intro.to(finalDot, { opacity: 0, duration: 0.12, ease: 'power3.out' });
    intro.to(root, {
      opacity: 0,
      duration: 0.26,
      ease: 'power2.out',
      onComplete: finishIntro,
    });

    const rawIntroDuration = intro.duration();
    intro.timeScale(rawIntroDuration > 0 ? rawIntroDuration / 2.55 : 1);

    return () => {
      intro.kill();
    };
  }, []);

  return (
    <div data-opening-intro className="opening-intro" aria-hidden="true">
      <div className="opening-intro-counter type-label-sm tone-mute" data-intro-counter>
        01 / 06
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
                <span data-intro-word-text>{isFinal ? <>VC<span data-intro-final-dot>.</span></> : word}</span>
              </span>
            </span>
          );
        })}
      </div>
      <div className="opening-intro-signature type-label-sm tone-mute">VC DESIGN</div>
    </div>
  );
}
