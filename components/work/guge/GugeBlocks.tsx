import type { CSSProperties } from 'react';

import { VcImage, MediaCaption } from '@/components/media/VcImage';
import { VcVideo } from '@/components/media/VcVideo';
import { Reveal } from '@/components/motion/Reveal';
import { MEDIA_SIZES, resolveMedia } from '@/lib/media';
import { cx } from '@/lib/utils';
import type { BlockSpan, CaseBlock, ComparePanel, MediaRef, PillarItem } from '@/content/types';
import { DeckMosaic } from './GugeDeckMosaic';

/**
 * Chapter blocks — the composition kit that lets each Guge chapter run at its
 * own rhythm instead of inheriting one fixed layout.
 *
 * Server components throughout: these only arrange markup, and every piece of
 * motion they use comes from `<Reveal>`, which is already the site's one
 * client-side primitive. Nothing here adds JavaScript to the page beyond what
 * the existing chapters already ship.
 */

const SPAN_CLASS: Record<BlockSpan, string> = {
  /** Edge to edge, escaping the shell gutter. */
  full: 'bleed',
  /** The normal reading column. */
  wide: '',
  /** Comfortable single-image column. */
  half: 'max-w-4xl',
  /** Small offset plate. */
  third: 'max-w-2xl',
  /**
   * A centred plate, for images that are taller than they are wide.
   *
   * A 0.746 portrait placed in the reading column is 896px wide and 1,201px
   * tall, which leaves 576px of empty paper beside it and reads as a mistake
   * rather than a margin. Centred, the same image reads as a deliberate plate.
   */
  plate: 'max-w-4xl mx-auto',
};

function Frame({
  media,
  sizes,
  className,
  frame = true,
}: {
  media: MediaRef;
  sizes: string;
  className?: string;
  frame?: boolean;
}) {
  const tone = media.surface === 'light' ? 'paper' : media.surface === 'dark' ? 'ink' : undefined;

  return (
    <figure data-tone={tone} className={cx('min-w-0', className)}>
      <VcImage
        media={media}
        sizes={sizes}
        wrapperClassName={cx('bg-[var(--tone-surface)]', frame && 'rounded-[2px]')}
        imgClassName="rounded-[2px]"
      />
      <MediaCaption>{media.caption}</MediaCaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */

function Quote({ block }: { block: Extract<CaseBlock, { kind: 'quote' }> }) {
  /*
   * Length decides the scale; the authored `size` is a ceiling, not the answer.
   *
   * The cave-guardian quote is 49 characters. Rendered at `type-xl` — up to
   * 152px — it measured nine lines and 1,462px at 1600×1000, i.e. a screen and
   * a half for one paragraph, and it swallowed the chapter it belongs to.
   * Display type is for a line you take in at a glance; past that it is prose
   * wearing a headline's clothes. Short quotes are untouched: the 10- and
   * 15-character lines still get the full size.
   */
  const length = block.zh.length;
  const authored = block.size === 'lg' ? 'type-lg' : 'type-xl';
  const scale = length > 34 ? 'type-md' : length > 20 ? 'type-lg' : authored;
  return (
    <figure className="max-w-5xl">
      <blockquote className={cx('type-display tone-fg text-balance', scale)}>
        {block.zh}
      </blockquote>
      {block.en ? (
        <p className="type-label tone-mute mt-6 max-w-[62ch] tracking-[0.08em] uppercase">{block.en}</p>
      ) : null}
      {block.attribution ? (
        <figcaption className="type-label-sm tone-mute mt-5 flex items-center gap-3">
          <span aria-hidden className="tone-accent-bg inline-block h-[3px] w-[3px] rounded-full" />
          {block.attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ComparePanelView({ panel, sizes }: { panel: ComparePanel; sizes: string }) {
  return (
    <div className="min-w-0">
      <p className="type-label tone-accent-text">{panel.label}</p>
      <p className="type-label-sm tone-mute mt-2 mb-5 max-w-[42ch]">{panel.zh}</p>
      <Frame media={panel.media} sizes={sizes} />
    </div>
  );
}

function Flow({ block }: { block: Extract<CaseBlock, { kind: 'flow' }> }) {
  return (
    <div className="min-w-0">
      {block.label ? <p className="type-label tone-mute mb-6">{block.label}</p> : null}
      {/*
        A pipeline drawn in markup rather than exported as an image: it stays
        crisp at every viewport, weighs nothing, and can be restyled with the
        rest of the type system.
      */}
      <ol className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-3">
        {block.steps.map((step, index) => (
          <li key={step} className="flex min-w-0 items-center gap-3">
            <span className="type-label-sm tone-fg border border-[var(--tone-line)] px-3 py-2">
              {step}
            </span>
            {index < block.steps.length - 1 ? (
              <span aria-hidden className="tone-mute type-label-sm">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {block.note ? <p className="type-label-sm tone-mute mt-6 max-w-[70ch]">{block.note}</p> : null}
    </div>
  );
}

function Pillars({ items, columns = 4 }: { items: PillarItem[]; columns?: 2 | 4 }) {
  /*
   * Five pillars is a real case here (the AI guide's five capabilities), and a
   * 4-column grid would leave the fifth orphaned on its own row. Matching the
   * column count to the item count keeps the row reading as one set.
   */
  const gridColumns =
    columns === 2 ? 'sm:grid-cols-2' : items.length === 5 ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={cx('grid min-w-0 gap-x-8 gap-y-10', gridColumns)}>
      {items.map((item, index) => (
        <Reveal key={item.label} variant="rise" delay={index * 80} className="min-w-0">
          <div className="border-t border-[var(--tone-line)] pt-5">
            <p className="type-label tone-accent-text">{item.label}</p>
            <p className="type-body tone-fg-2 mt-3 max-w-[38ch]">{item.zh}</p>
            {item.media ? (
              <div className="mt-5">
                <Frame media={item.media} sizes={MEDIA_SIZES.card} frame={false} />
              </div>
            ) : null}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function MediaRow({ block }: { block: Extract<CaseBlock, { kind: 'mediaRow' }> }) {
  const columns = block.columns ?? 3;
  const sizes =
    columns === 2 ? MEDIA_SIZES.half : columns === 3 ? MEDIA_SIZES.card : MEDIA_SIZES.inset;

  /*
   * Column widths are proportional to each image's own aspect ratio.
   *
   * Every `Frame` sizes itself from `aspect-ratio`, so in a plain `repeat(n, 1fr)`
   * grid the tallest item sets the row height and the shorter ones leave a dead
   * band underneath. Measured on chapter 04: a 3.57:1 drawing strip in a 724px
   * column is 203px tall inside a 567px row — 364px of nothing beside it, and the
   * 3-up row left 294px under the two landscape shots. It reads as a mistake.
   *
   * Because `height = columnWidth / aspect`, giving each column a width of
   * `aspect × k` makes every item in the row exactly `k` tall — the row is flush,
   * and nothing is cropped to get there (which `cover` on a shared box would do).
   * The breakpoint behaviour is unchanged: it is written in globals.css next to
   * `[data-media-row]` so the intermediate 2-up layout still applies.
   *
   * Clamped to [0.55, 2.6] to keep columns usable: a 5:1 panorama given its true
   * weight would squeeze the rest of the row to slivers, and a very tall portrait
   * given its true weight would take a column a few pixels wide.
   *
   * The clamp only bites when an item falls outside the range, and then the row
   * is no longer exactly flush. Across the eleven rows on this site only three
   * items do: the two 0.56 portraits of chapter 01 and the 0.63 report cover.
   * At the old [0.65, 2.4] they came out 57px taller than their row-mates, which
   * showed up as captions sitting on two different baselines; at [0.55, 2.6]
   * every row lands flush. It never crops — the item's own `aspect-ratio` still
   * governs its height.
   */
  const tracksFor = (items: MediaRef[]) =>
    items
      .map((media) => Math.min(2.6, Math.max(0.55, resolveMedia(media).aspect)))
      .map((a) => `${a.toFixed(3)}fr`)
      .join(' ');

  if (block.mobile === 'scroll') {
    /*
     * The phone layout is a snap scroller. From 768px up the items are grouped
     * two per row and each group gets its own aspect-proportional tracks, so
     * every group lands flush; at 1024px the groups dissolve back into a single
     * full-width row.
     *
     * The grouping exists because one `grid-template-columns` cannot describe two
     * visual rows separately. The tablet band used to get a flat `repeat(2, 1fr)`
     * — which is the very layout `tracksFor` exists to replace. Chapter 01 put a
     * 1.78 aerial and a 0.56 portrait in the same pair: 205px against 649px, a
     * 443px dead band under the aerial, captions on two baselines (measured
     * 2026-09-20 at 834px).
     *
     * `display` is expressed as utility classes, not in globals.css: a plain
     * `[data-media-row-scroller] { display: grid }` there loses to Tailwind's
     * `flex` utility, which silently left the row as a flex container and shrank
     * the four images to 47–70px slivers. The CSS next to `[data-media-row]` only
     * ever supplies `grid-template-columns`, which no utility competes with.
     */
    const groups: MediaRef[][] = [];
    for (let i = 0; i < block.items.length; i += 2) groups.push(block.items.slice(i, i + 2));

    return (
      <div
        data-media-row-scroller={block.items.length}
        style={{ '--media-row-cols': tracksFor(block.items) } as CSSProperties}
        className="bleed-x flex min-w-0 snap-x gap-5 overflow-x-auto no-scrollbar md:grid md:grid-cols-1 md:gap-6 md:overflow-visible lg:grid-cols-[var(--media-row-cols)]"
      >
        {groups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            data-media-row={group.length}
            style={{ '--media-row-cols': tracksFor(group) } as CSSProperties}
            className="contents md:grid md:gap-6 lg:contents"
          >
            {group.map((media, index) => (
              <Reveal
                key={media.key}
                variant="masked"
                delay={(groupIndex * 2 + index) * 90}
                className="w-[76vw] min-w-0 shrink-0 snap-start md:w-auto"
              >
                <Frame media={media} sizes={sizes} />
              </Reveal>
            ))}
          </div>
        ))}
      </div>
    );
  }

  /*
   * A block with more items than columns lays out over several rows, and one
   * `grid-template-columns` cannot describe each row separately. Chapters 01 and
   * 08 have such blocks (spreads of 87% and 77%), so they are split into one grid
   * per row instead. Blocks whose rows are already aspect-homogeneous keep the
   * plain grid — no point changing a layout that is not broken.
   */
  const rows: MediaRef[][] = [];
  for (let i = 0; i < block.items.length; i += columns) rows.push(block.items.slice(i, i + columns));

  const rowSpread = (row: MediaRef[]) => {
    const hs = row.map((m) => 1 / Math.max(0.35, resolveMedia(m).aspect));
    return hs.length < 2 ? 0 : (Math.max(...hs) - Math.min(...hs)) / Math.max(...hs);
  };
  const ragged = rows.length > 1 && rows.some((row) => rowSpread(row) > 0.25);
  const chunked = rows.length === 1 || ragged;

  const renderItems = (items: MediaRef[]) =>
    items.map((media, index) => (
      <Reveal key={media.key} variant="masked" delay={index * 90} className="min-w-0">
        <Frame media={media} sizes={sizes} />
      </Reveal>
    ));

  if (chunked) {
    return (
      <div className="grid min-w-0 gap-6">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            data-media-row={row.length}
            style={{ '--media-row-cols': tracksFor(row) } as CSSProperties}
            className="grid min-w-0 gap-6"
          >
            {renderItems(row)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cx(
        'grid min-w-0 gap-6',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'sm:grid-cols-2 lg:grid-cols-4',
      )}
    >
      {renderItems(block.items)}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function GugeBlock({ block, index }: { block: CaseBlock; index: number }) {
  const delay = Math.min(index * 60, 180);

  switch (block.kind) {
    case 'media':
      return (
        <Reveal variant="masked" delay={delay} className={cx('min-w-0', SPAN_CLASS[block.span ?? 'wide'])}>
          <Frame media={block.media} sizes={block.span === 'full' ? MEDIA_SIZES.full : MEDIA_SIZES.half} />
        </Reveal>
      );

    case 'mediaRow':
      return (
        <Reveal variant="rise" delay={delay} className="min-w-0">
          <MediaRow block={block} />
        </Reveal>
      );

    case 'video':
      return (
        <Reveal variant="masked" delay={delay} className="min-w-0">
          <VcVideo video={block.video} sizes={MEDIA_SIZES.full} />
        </Reveal>
      );

    case 'quote':
      return (
        <Reveal variant="rise" delay={delay} className="min-w-0">
          <Quote block={block} />
        </Reveal>
      );

    case 'compare':
      return (
        <div className="grid min-w-0 gap-12 sm:grid-cols-2 sm:gap-8">
          <Reveal variant="masked" delay={delay} className="min-w-0">
            <ComparePanelView panel={block.left} sizes={MEDIA_SIZES.half} />
          </Reveal>
          <Reveal variant="masked" delay={delay + 120} className="min-w-0">
            <ComparePanelView panel={block.right} sizes={MEDIA_SIZES.half} />
          </Reveal>
        </div>
      );

    case 'flow':
      return (
        <Reveal variant="rise" delay={delay} className="min-w-0">
          <Flow block={block} />
        </Reveal>
      );

    case 'pillars':
      return <Pillars items={block.items} columns={block.columns} />;

    case 'mediaLink':
      return (
        <Reveal variant="masked" delay={delay} className="min-w-0">
          <a
            href={block.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group block min-w-0"
          >
            <Frame media={block.media} sizes={MEDIA_SIZES.half} />
            <span className="type-label tone-fg mt-5 flex items-center gap-3">
              <span className="link-underline">{block.label}</span>
              <span aria-hidden>↗</span>
            </span>
            {block.note ? <span className="type-label-sm tone-mute mt-2 block">{block.note}</span> : null}
          </a>
        </Reveal>
      );

    case 'mediaLinkRow': {
      /*
       * Two things here are load-bearing and were both wrong in the first cut.
       *
       * 1. **`grid-cols-2` from the start.** The wall used `sm:grid-cols-2`,
       *    which means a 390px phone fell through to one column — four A-series
       *    portrait boards stacked end to end is roughly four screens of
       *    scrolling for a set the visitor is meant to take in at a glance. Two
       *    up puts the whole wall on one screen on a phone.
       * 2. **The stagger.** `layered` nudges every other board up or down so the
       *    four read as a wall someone hung rather than a table of contents.
       *    Pure CSS, no interaction, no carousel.
       */
      const offsets = block.layered
        ? ['', 'lg:mt-14', 'lg:-mt-8', 'lg:mt-24']
        : ['', '', '', ''];

      return (
        <div className="min-w-0">
          {block.label ? <p className="type-label tone-mute mb-8">{block.label}</p> : null}
          <div
            className={cx(
              'grid min-w-0 gap-x-5 gap-y-10 sm:gap-x-6 lg:gap-x-7',
              block.columns === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4',
              /*
               * A4-proportioned boards at full shell width are 470px tall each.
               * The brief asks for the four to read as a *reduced* gallery wall
               * you take in at once — inset them on wide screens so the set fits
               * an eye-span instead of dominating the chapter.
               */
              block.layered && 'lg:mx-auto lg:max-w-[1080px]',
            )}
          >
            {block.items.map((item, itemIndex) => (
              <Reveal
                key={item.media.key}
                variant="masked"
                delay={itemIndex * 100}
                className={cx('min-w-0', offsets[itemIndex % offsets.length])}
              >
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group block min-w-0"
                >
                  <Frame media={item.media} sizes={MEDIA_SIZES.card} />
                  <span className="type-label tone-fg mt-4 flex items-center gap-2.5">
                    <span className="link-underline">{item.label}</span>
                    <span
                      aria-hidden
                      className="transition-transform duration-700 ease-[var(--ease-vc-out)] group-hover:translate-x-1.5"
                    >
                      ↗
                    </span>
                  </span>
                  {item.note ? (
                    // 手机上藏掉展板说明：四块板已经占满一屏，说明文字留到桌面档。
                    <span className="type-label-sm tone-mute mt-2 hidden max-w-[38ch] sm:block">
                      {item.note}
                    </span>
                  ) : null}
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      );
    }

    case 'deckMosaic':
      return (
        <Reveal variant="rise" delay={delay} className="min-w-0">
          <DeckMosaic block={block} />
        </Reveal>
      );

    case 'note':
      return (
        <Reveal variant="fade" delay={delay} className="min-w-0">
          <p className="type-label-sm tone-mute max-w-[74ch]">{block.zh}</p>
        </Reveal>
      );

    default:
      return null;
  }
}

export function GugeBlocks({ blocks }: { blocks: CaseBlock[] }) {
  return (
    <div className="min-w-0 space-y-14 md:space-y-20">
      {blocks.map((block, index) => (
        <GugeBlock key={`${block.kind}-${index}`} block={block} index={index} />
      ))}
    </div>
  );
}
