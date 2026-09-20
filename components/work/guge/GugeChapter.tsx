import { Bi } from '@/components/i18n/Bi';
import { ChapterMark, Eyebrow } from '@/components/primitives';
import { Reveal } from '@/components/motion/Reveal';
import type { CaseSection } from '@/content/types';
import { cx } from '@/lib/utils';
import { GugeBlocks } from './GugeBlocks';
import { GugeLayers } from './GugeLayers';
import { GugeMosaic } from './GugeMosaic';
import { GugePanorama } from './GugePanorama';

/**
 * One chapter of the Guge flagship.
 *
 * Shared shell only: the chapter mark, the headline pair, the lede and the
 * footnote sit in the same place in every chapter, so the *rhythm* can change
 * underneath them without the page losing its editorial spine. What differs from
 * chapter to chapter is the set piece and the block sequence.
 *
 * The headline follows the site's existing bilingual convention (see `Bi`):
 * Chinese leads in Chinese mode with the English echo beneath, and vice versa.
 */

function Headline({ section, titleId }: { section: CaseSection; titleId: string }) {
  const titleZh = section.titleZh || section.title;

  return (
    <h2 id={titleId} className="type-lg type-display tone-fg max-w-[22ch]">
      <Bi
        as={null}
        hideSecondary
        zh={
          <>
            <span className="block">{titleZh}</span>
            <span className="type-label-sm tone-mute mt-5 block max-w-[62ch]">{section.title}</span>
          </>
        }
        en={
          <>
            <span className="block">{section.title}</span>
            <span className="type-label-sm tone-mute mt-4 block max-w-[62ch]">{titleZh}</span>
          </>
        }
      />
    </h2>
  );
}

function SpecList({ items }: { items: string[] }) {
  return (
    <ol className="mt-10 max-w-[68ch]">
      {items.map((item, index) => (
        <li
          key={item}
          className="flex min-w-0 gap-5 border-t border-[var(--tone-line)] py-4 last:border-b"
        >
          <span className="type-label-sm tone-accent-text shrink-0 pt-1">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="type-body tone-fg min-w-0">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function GugeChapter({ section, total }: { section: CaseSection; total: number }) {
  const titleId = `${section.id}-title`;

  return (
    <article className="min-w-0 space-y-14 md:space-y-20" aria-labelledby={titleId}>
      <div className="flex items-center gap-4">
        <ChapterMark index={section.index} total={total} />
        <Eyebrow marker={false}>{section.eyebrow}</Eyebrow>
        <span aria-hidden className="h-px flex-1 bg-[var(--tone-line)]" />
      </div>

      {/*
        The opening text column. Kept narrow on purpose: a flagship chapter has to
        be *read* before it is looked at, and a 20ch measure at display size is
        what makes the headline land as a statement instead of a label.
      */}
      <Reveal variant="rise" className="min-w-0 max-w-4xl">
        <Headline section={section} titleId={titleId} />
        {section.gloss ? (
          <p className="type-label-sm tone-mute mt-6 max-w-[70ch]">{section.gloss}</p>
        ) : null}
        {section.body.length ? (
          <div className="type-body tone-fg-2 mt-8 max-w-[68ch] space-y-5">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}
      </Reveal>

      {/*
        Order matters for the directed chapters: the statement lands first, then
        the set piece, then the supporting spec list. `layers` consumes its own
        bullets (they are the three level definitions the diagram is labelled
        with), so it must not have them printed a second time underneath.
      */}
      {section.piece === 'layers' ? <GugeLayers section={section} /> : null}
      {section.piece === 'panorama' ? <GugePanorama section={section} /> : null}
      {section.piece === 'mosaic' ? <GugeMosaic section={section} /> : null}

      {section.bullets?.length && section.piece !== 'layers' ? (
        <Reveal variant="rise">
          <SpecList items={section.bullets} />
        </Reveal>
      ) : null}

      {section.blocks?.length ? <GugeBlocks blocks={section.blocks} /> : null}

      {section.note ? (
        <Reveal variant="fade">
          <p className={cx('type-label-sm tone-mute max-w-[74ch]')}>{section.note}</p>
        </Reveal>
      ) : null}
    </article>
  );
}
