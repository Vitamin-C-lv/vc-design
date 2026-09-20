import { VcImage, MediaCaption } from '@/components/media/VcImage';
import { Reveal } from '@/components/motion/Reveal';
import { MEDIA_SIZES, resolveMedia } from '@/lib/media';
import { cx } from '@/lib/utils';
import type { CaseBlock } from '@/content/types';

type DeckBlock = Extract<CaseBlock, { kind: 'deckMosaic' }>;

/**
 * DESIGNING THE STORY — stage 03, the presentation set.
 *
 * The brief for this project says the decks and the boards are *deliverables*,
 * not source material, and this is the block that makes that claim visible. It
 * exists as its own short section, separate from the boards, because a deck and
 * an exhibition board are different design problems and merging them into one
 * gallery would blur the thing being sold.
 *
 * ── What it deliberately is not ─────────────────────────────────────────────
 * It is not a page-through. Eight pages are shown; the deck has twenty-eight,
 * and showing all of them would say "long" instead of "art-directed". The pages
 * are real renders of the deck (PowerPoint), not exports of its embedded
 * images, so what the visitor sees is the page as it was designed — type,
 * spacing, and all.
 *
 * The stagger is the same idea as the board wall: two rows, each pushed off the
 * grid slightly, so six or eight rectangles read as a composition.
 */
/*
 * Four across, two rows. An earlier cut used a six-slot staggered pattern, which
 * pushed eight 16:9 pages into three rows and made this one subsection taller
 * than the chapter it belongs to. The stagger is kept but kept small: just
 * enough that the two rows do not read as a table.
 */
const PAGE_LAYOUT = [
  { span: 'lg:col-span-3', offset: '' },
  { span: 'lg:col-span-3', offset: 'lg:mt-8' },
  { span: 'lg:col-span-3', offset: '' },
  { span: 'lg:col-span-3', offset: 'lg:mt-8' },
  { span: 'lg:col-span-3', offset: 'lg:-mt-4' },
  { span: 'lg:col-span-3', offset: 'lg:mt-4' },
  { span: 'lg:col-span-3', offset: 'lg:-mt-4' },
  { span: 'lg:col-span-3', offset: 'lg:mt-4' },
];

export function DeckMosaic({ block }: { block: DeckBlock }) {
  const items = block.items.filter((item) => !resolveMedia(item).missing);
  if (!items.length) return null;

  return (
    <div className="min-w-0">
      <p className="type-label tone-mute">{block.label}</p>
      <p className="type-body tone-fg-2 mt-4 mb-8 max-w-[62ch]">{block.zh}</p>

      <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-8">
        {items.map((media, index) => {
          const layout = PAGE_LAYOUT[index % PAGE_LAYOUT.length];
          return (
            <div
              key={media.key}
              className={cx(
                'min-w-0',
                layout.span,
                layout.offset,
                // 手机上八页 16:9 要占四排；后两页从 lg 起才出现，桌面仍是完整八页。
                index >= 6 && 'max-lg:hidden',
              )}
            >
              <Reveal variant="masked" delay={(index % 6) * 90} className="min-w-0">
                <figure className="min-w-0">
                  <VcImage
                    media={media}
                    sizes={MEDIA_SIZES.card}
                    wrapperClassName="bg-[var(--tone-surface)]"
                  />
                  <MediaCaption>{media.caption}</MediaCaption>
                </figure>
              </Reveal>
            </div>
          );
        })}
      </div>
    </div>
  );
}
