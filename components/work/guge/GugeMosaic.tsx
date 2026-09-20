import { VcImage, MediaCaption } from '@/components/media/VcImage';
import { Reveal } from '@/components/motion/Reveal';
import { MEDIA_SIZES, resolveMedia } from '@/lib/media';
import { cx } from '@/lib/utils';
import type { CaseSection, MediaRef } from '@/content/types';

/**
 * DESIGNING THE STORY — stage 01, the editorial mosaic.
 *
 * The chapter's argument is that explaining this project was a second piece of
 * work, so the first thing on screen is *craft*, not artefacts: four crops of
 * the exhibition boards, close enough that you read the grid, the type scale and
 * the diagramming rather than "a poster".
 *
 * ── Why this replaced a wall of four full boards ────────────────────────────
 * The previous cut stacked the four 2048px boards down the main scroll. On a
 * phone that was six and a half screens of portrait images — the visitor was
 * being handed a filing cabinet. Details prove the same capability in one
 * screen, and the whole boards are still one click away in stage 02, at full
 * resolution, where reading them is actually possible.
 *
 * ── Composition ─────────────────────────────────────────────────────────────
 * Wide screens get a staggered 12-column grid: the offsets are what make four
 * unrelated crops read as one composition rather than a contact sheet.
 *
 * ── Phones: a snap scroller, not a 2x2 ──────────────────────────────────────
 * The 2x2 gave each plate 167px on a 390px screen, so the crops — whose whole
 * point is that you can read the grid and the type scale — became thumbnails
 * with unreadable captions inside them. One column would fix the size but cost
 * about a screen and a half of extra scroll.
 *
 * A horizontal snap scroller is both bigger and shorter than the 2x2 was: each
 * plate is 76vw (≈296px, 1.8x the old width) while the block stays one row tall.
 * It is also the same mobile treatment `mediaRow` already uses, so the gesture
 * is one the visitor has already learned on this page.
 */
/*
 * Spans must total 12 and stay in order. The first cut used 5/4/3 + a fourth
 * plate pinned to `col-start-8`, which overlapped the third plate's columns and
 * silently wrapped the mosaic onto a second row — one extra row of 3:2 plates,
 * about a third of a screen, spent on nothing. 4/3/3/2 keeps the variety of
 * widths (the point of an editorial mosaic) inside a single row.
 */
const DETAIL_LAYOUT = [
  { span: 'lg:col-span-4', offset: '' },
  { span: 'lg:col-span-3', offset: 'lg:mt-10' },
  { span: 'lg:col-span-3', offset: 'lg:mt-20' },
  { span: 'lg:col-span-2', offset: 'lg:mt-5' },
];

/**
 * A uniform 3:2 plate.
 *
 * The four crops this stage uses are wildly different shapes — a 5:1 slice of a
 * technical diagram, a 2.2:1 character scroll, a 2.3:1 UI system sheet, and a
 * near-square exploded building. Left at their natural proportions and stacked
 * on a phone they cost over one full screen of scrolling on their own, and set
 * side by side they produce a ragged edge on every row. Forcing one ratio and
 * framing each crop with its own `focal` gives a grid that is compact on a phone
 * (2×2) and deliberately composed on a desktop — while still showing enough of
 * each board region to prove the layout craft, which is the whole point.
 */
const PLATE_ASPECT = 3 / 2;

function Plate({ media, delay }: { media: MediaRef; delay: number }) {
  return (
    <Reveal variant="masked" delay={delay} className="min-w-0">
      <figure className="min-w-0">
        <VcImage
          media={media}
          sizes={MEDIA_SIZES.card}
          aspect={PLATE_ASPECT}
          wrapperClassName="bg-[var(--tone-surface)]"
        />
        <MediaCaption>{media.caption}</MediaCaption>
      </figure>
    </Reveal>
  );
}

export function GugeMosaic({ section }: { section: CaseSection }) {
  const details = (section.media ?? [])
    .slice(0, 4)
    .filter((item) => !resolveMedia(item).missing);

  if (!details.length) return null;

  return (
    <div className="min-w-0">
      <p className="type-label tone-mute mb-8">01 / DETAILS · 版式细节</p>
      <div className="bleed-x flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto no-scrollbar lg:grid lg:grid-cols-12 lg:gap-x-7 lg:gap-y-8 lg:overflow-visible">
        {details.map((media, index) => {
          const layout = DETAIL_LAYOUT[index % DETAIL_LAYOUT.length];
          return (
            <div
              key={media.key}
              className={cx(
                'min-w-0 w-[76vw] shrink-0 snap-start lg:w-auto',
                layout.span,
                layout.offset,
              )}
            >
              <Plate media={media} delay={index * 90} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
