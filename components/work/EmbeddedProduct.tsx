'use client';

import { useState } from 'react';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { VcImage } from '@/components/media/VcImage';
import type { MediaRef } from '@/content/types';
import { cx } from '@/lib/utils';

/**
 * The shipped product, running inside the case study.
 *
 * A screenshot answers "what does it look like"; this answers "does it actually
 * work". 观潮 is a real deployed product, so the case page hands the visitor the
 * artefact itself — clickable, scrollable, with its own navigation — rather than
 * a picture of it. The caption says plainly that it is a saved copy, because a
 * case study that implies live data would be overselling.
 *
 * ── Why an iframe, and why a local copy ──────────────────────────────────────
 * The embedded thing is a separate application with its own router, styles and
 * service worker. An iframe is the only honest boundary: its CSS cannot leak into
 * the site and the site's Lenis smooth-scroll cannot fight its scroll containers.
 *
 * It points at a **local static export** served from `/guanchao-live`, not at the
 * product's public URL. Two reasons: the case page must not break when that
 * deployment moves or goes away, and a third-party page cannot be relied on to
 * frame cleanly. The cost is that the data is frozen at capture time — which is
 * what the caption tells the visitor.
 *
 * ── Loading discipline ──────────────────────────────────────────────────────
 * The iframe is not in the initial page weight: `src` is only attached once the
 * frame has been scrolled near. The export is ~24MB of assets, and nobody should
 * pay for it while still reading the hero.
 */
export function EmbeddedProduct({
  src,
  title,
  poster,
  openLabel,
  note,
  heightClassName = 'h-[34rem] md:h-[42rem]',
  className,
}: {
  src: string;
  title: string;
  /** Shown until the frame loads, and permanently if it never does. */
  poster: MediaRef;
  openLabel: string;
  note?: string;
  heightClassName?: string;
  className?: string;
}) {
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cx('min-w-0', className)}>
      {/* Chrome: names the thing and offers the escape hatch to a full viewport,
          which is what a visitor on a phone will actually want. */}
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <BiOnly zh="可交互副本 / 真实产品界面" en="INTERACTIVE COPY / REAL PRODUCT UI" className="type-label tone-mute" />
        <a
          href={src}
          target="_blank"
          rel="noreferrer noopener"
          className="link-underline type-label tone-fg"
        >
          {openLabel} ↗
        </a>
      </div>

      <div
        className={cx(
          'relative w-full overflow-hidden border border-[var(--tone-line)] bg-[var(--tone-surface)]',
          heightClassName,
        )}
      >
        {/*
          The poster is a loading state and an error state, never a layer: it is
          removed from the tree the moment the frame reports it has loaded, so it
          cannot sit behind the app and show through.
        */}
        {!live ? (
          <div className="absolute inset-0">
            <VcImage media={poster} fill sizes="(min-width: 1024px) 72rem, 100vw" />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 to-transparent p-5 md:p-7">
              <p className="type-label-sm text-white/85">
                {failed ? '副本暂时无法加载，可点击上方链接打开' : '正在载入可交互副本…'}
              </p>
            </div>
          </div>
        ) : null}

        <iframe
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => setLive(true)}
          onError={() => setFailed(true)}
          className={cx(
            'h-full w-full border-0 transition-opacity duration-700',
            live ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>

      {note ? (
        <Bi
          as="p"
          zh={note}
          en={note}
          hideSecondary
          className="mt-4"
          primaryClassName="type-label-sm tone-mute block max-w-[70ch]"
        />
      ) : null}
    </div>
  );
}
