'use client';

import { useState } from 'react';
import type { ParticleSequence } from '@/content/types';
import { ParticleVessel } from '@/components/qinghua/ParticleVessel';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { Reveal } from '@/components/motion/Reveal';
import { getMedia, mediaUrl, resolveMedia } from '@/lib/media';
import { cx, pad2 } from '@/lib/utils';

/**
 * The live particle sequence, presented as the interactive piece it actually is.
 *
 * This is deliberately not a screenshot slot. The visitor gets the shipped
 * artefact: the same seven craft stages the product is built around, each with
 * the particle colour and motion mode it really ships with, rendered live from
 * the project's own sampled point clouds. That is a materially stronger claim
 * than "here is a picture of it" — which is the whole point of putting it on a
 * sales page.
 *
 * The stage list doubles as the explanation: reading the seven names in order
 * tells you what the product does, so the copy does not have to.
 */
export function ParticleShowcase({
  sequence,
  className,
}: {
  sequence: ParticleSequence;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const stage = sequence.stages[active] ?? sequence.stages[0];

  // Prefer a mid-size WebP over the largest JPEG: the fallback is shown on weak
  // devices and on WebGL failure, which is exactly when a 300KB JPEG hurts.
  const entry = getMedia(sequence.fallback.key);
  const fallbackSrc = entry
    ? mediaUrl(entry.webp[Math.min(2, entry.webp.length - 1)] ?? entry.fallback)
    : resolveMedia(sequence.fallback).src;

  if (!stage) return null;

  return (
    <div className={cx('grid min-w-0 gap-12 lg:grid-cols-12 lg:gap-16', className)}>
      {/* ---- Copy + stage selector ---- */}
      <div className="min-w-0 lg:col-span-5">
        <Reveal variant="rise" distance={0.75}>
          <div className="meta-row meta-row-start">
            <BiOnly
              zh={sequence.eyebrowZh}
              en={sequence.eyebrowEn}
              className="type-label tone-accent-text"
            />
            <span className="type-label-sm tone-mute">
              {pad2(active + 1)} / {pad2(sequence.stages.length)}
            </span>
          </div>
        </Reveal>

        <Reveal variant="masked" delay={60}>
          <h3 className="type-lg type-display tone-fg mt-8">
            <BiOnly zh={sequence.titleZh} en={sequence.titleEn} />
          </h3>
        </Reveal>

        <Reveal variant="rise" delay={120}>
          <p className="type-body tone-fg-2 mt-6 max-w-[46ch]">{sequence.body}</p>
        </Reveal>

        {/*
          A vertical tablist. Rows rather than chips because the *order* is the
          content — it reads as a process, not a set of options.
        */}
        <div
          role="tablist"
          aria-label="工序阶段"
          aria-orientation="vertical"
          className="mt-10 border-t border-[var(--tone-line)]"
        >
          {sequence.stages.map((s, i) => {
            const selected = i === active;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="particle-stage-panel"
                onClick={() => setActive(i)}
                className={cx(
                  'group/stage flex w-full min-h-14 items-center gap-4 border-b border-[var(--tone-line)] py-3 text-left transition-colors duration-400',
                  selected ? 'tone-fg' : 'tone-mute hover:tone-fg',
                )}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full transition-transform duration-500 ease-[var(--ease-vc-out)]"
                  style={{
                    backgroundColor: s.color,
                    transform: selected ? 'scale(1.6)' : 'scale(1)',
                    opacity: selected ? 1 : 0.55,
                  }}
                />
                <span className="type-label-sm tone-mute w-6 shrink-0">{pad2(i + 1)}</span>
                {/*
                  Language-gated rather than raw text: this tablist is the only
                  place the seven stages are named, so in English mode the English
                  name has to be the one in the reading slot. `Bi as={null}` emits
                  the slots as siblings so each can carry its own flex behaviour.
                */}
                <Bi
                  as={null}
                  zh={s.zh}
                  en={s.en}
                  primaryClassName="type-lead min-w-0 flex-1 truncate"
                  secondaryClassName="type-label-sm hidden shrink-0 opacity-60 sm:inline"
                />
              </button>
            );
          })}
        </div>

        {/*
          Gated on language like everything else here: the note names what the
          stage actually does, so it is information, not texture. `aria-live`
          sits on the wrapper because `Bi` emits its own slots inside.
        */}
        <div aria-live="polite">
          <Bi
            as="p"
            zh={stage.note}
            en={stage.noteEn}
            hideSecondary
            className="min-h-[3.5rem]"
            primaryClassName="type-body tone-fg-2 mt-6 block"
          />
        </div>
      </div>

      {/* ---- Live render ---- */}
      <div
        id="particle-stage-panel"
        role="tabpanel"
        aria-label={`${stage.zh} ${stage.en}`}
        className="min-w-0 lg:col-span-7"
      >
        <Reveal variant="masked" duration={1.1}>
          <div className="relative">
            <ParticleVessel
              stage={stage.id}
              model={stage.model}
              framing="focus"
              fallbackSrc={fallbackSrc}
              fallbackAlt={sequence.fallback.alt}
              className="border border-[var(--tone-line)]"
            />
            {/* Mono slate, mirroring the filmstrip's "spec sheet" texture and
                naming the stage that is currently on screen. */}
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span className="type-label-sm text-white/75">
                {stage.zh} · {stage.en}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
