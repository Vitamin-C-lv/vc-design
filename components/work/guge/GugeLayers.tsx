'use client';

import { useEffect, useRef, useState } from 'react';
import { VcImage, MediaCaption } from '@/components/media/VcImage';
import { useDeviceProfile } from '@/lib/motion/device';
import { MEDIA_SIZES } from '@/lib/media';
import type { CaseSection } from '@/content/types';

/**
 * FROM SITE TO STORY — the layered world map.
 *
 * The project's key abstraction is that a scattered pile of cultural material
 * became one system in three layers: the physical site, the plot strung across
 * it, and the people and objects carried inside. The diagram that records this
 * is drawn as an exploded stack, so the honest way to introduce it is to let it
 * assemble bottom-up: ground first, then the plot, then the people.
 *
 * The reveal is a single `clip-path` transition on one image plus staggered
 * label delays — no scroll hijacking, no WebGL, and nothing that depends on the
 * visitor scrolling at a particular speed. It fires once, when the diagram is a
 * third of the way into view, and never replays.
 *
 * The levels are ordered top-down to match the artwork (LEVEL 1 sits on top of
 * the stack), and the list is stretched to the image's height so the reading
 * order and the geometry agree.
 */

interface Level {
  id: '1' | '2' | '3';
  label: string;
  zh: string;
}

const FALLBACK_LEVELS: Level[] = [
  { id: '1', label: 'LEVEL 1 · PEOPLE & OBJECTS', zh: '人物、文物、壁画与信仰线索。' },
  { id: '2', label: 'LEVEL 2 · PLOT', zh: '事件与动线挂在具体地点上。' },
  { id: '3', label: 'LEVEL 3 · PLACE', zh: '还原的地理地貌与建筑遗址。' },
];

/**
 * The chapter stores its three layer definitions as bullets (`LEVEL 1 · …`), so
 * they are parsed back into structured rows rather than duplicated in content.
 */
function parseLevels(bullets: string[] | undefined): Level[] {
  if (!bullets?.length) return FALLBACK_LEVELS;

  const parsed = bullets
    .map((bullet) => {
      const match = /^LEVEL\s*([123])\s*·?\s*(.*)$/i.exec(bullet.trim());
      if (!match) return null;
      const [, id, rest] = match;
      const [label, zh] = rest.split('——').map((part) => part.trim());
      return {
        id: id as Level['id'],
        label: `LEVEL ${id} · ${(label ?? '').replace(/\s*·\s*$/, '')}`,
        zh: zh ?? '',
      };
    })
    .filter((level): level is Level => level !== null);

  return parsed.length === 3 ? parsed : FALLBACK_LEVELS;
}

export function GugeLayers({ section }: { section: CaseSection }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const { ready: profileReady, reducedMotion } = useDeviceProfile();

  /*
   * With motion off the component simply renders in its finished state: the map
   * fully drawn and every level at full opacity. Nothing is hidden behind an
   * animation that will never run.
   */
  useEffect(() => {
    if (!profileReady || reducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setReady(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -10% 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [profileReady, reducedMotion]);

  const levels = parseLevels(section.bullets);
  const media = section.media?.[0];
  /*
   * Derived, not stored: with motion off the assembly is simply already
   * finished, so there is no second state to keep in sync and no cascading
   * render when the device profile resolves.
   */
  const assembled = ready || reducedMotion;

  return (
    <div
      ref={ref}
      data-guge-layers="true"
      data-stage={assembled ? 'ready' : 'idle'}
      className="grid min-w-0 gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-10"
    >
      <ol className="min-w-0 lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:py-2">
        {levels.map((level) => (
          <li
            key={level.id}
            data-guge-level={level.id}
            className="border-t border-[var(--tone-line)] py-5 first:border-t-0 first:pt-0 lg:first:pt-2"
          >
            <p className="type-label tone-accent-text">{level.label}</p>
            {level.zh ? <p className="type-body tone-fg-2 mt-3 max-w-[40ch]">{level.zh}</p> : null}
          </li>
        ))}
      </ol>

      <figure className="min-w-0 lg:col-span-7 lg:col-start-6">
        <div className="overflow-hidden">
          {media ? (
            <div data-guge-map="true">
              <VcImage media={media} sizes={MEDIA_SIZES.half} wrapperClassName="bg-transparent" />
            </div>
          ) : null}
        </div>
        <MediaCaption>{media?.caption}</MediaCaption>
      </figure>
    </div>
  );
}
