import Link from 'next/link';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { getAdjacentProjects } from '@/content/projects';

function AdjacentTitle({ title, titleZh, direction }: { title: string; titleZh: string; direction: 'prev' | 'next' }) {
  return (
    <span
      className={
        direction === 'prev'
          ? 'block transition-transform duration-700 ease-[var(--ease-vc-out)] group-hover:-translate-x-2'
          : 'block transition-transform duration-700 ease-[var(--ease-vc-out)] group-hover:translate-x-2'
      }
    >
      <Bi
        as={null}
        hideSecondary
        zh={
          <>
            <span className="type-lg type-display tone-fg block">{titleZh}</span>
            <span className="mt-3 block type-label-sm tone-mute">{title}</span>
          </>
        }
        en={
          <>
            <span className="type-lg type-display tone-fg block">{title}</span>
            <span className="mt-3 block type-label-sm tone-mute">{titleZh}</span>
          </>
        }
      />
    </span>
  );
}

export function CaseNav({ slug, accent }: { slug: string; accent?: string }) {
  const { prev, next } = getAdjacentProjects(slug);

  return (
    <section
      data-tone="ink"
      className="band"
      style={accent ? ({ '--tone-accent': accent } as React.CSSProperties) : undefined}
      aria-label="相邻案例"
    >
      <div className="shell">
        <div className="grid min-w-0 gap-10 md:grid-cols-2 md:gap-8">
          {prev ? (
            <Link href={`/work/${prev.slug}`} className="group block min-w-0 border-t border-[var(--tone-line)] pt-5">
              <span className="type-label tone-mute">
                <BiOnly zh="← 上一个案例" en="← PREVIOUS" />
              </span>
              <span className="mt-8 flex min-w-0 items-start justify-between gap-5">
                <AdjacentTitle title={prev.title} titleZh={prev.titleZh} direction="prev" />
                <span aria-hidden className="type-lg tone-accent-text shrink-0 transition-transform duration-700 ease-[var(--ease-vc-out)] group-hover:-translate-x-2">←</span>
              </span>
            </Link>
          ) : null}
          {next ? (
            <Link href={`/work/${next.slug}`} className="group block min-w-0 border-t border-[var(--tone-line)] pt-5 md:text-right">
              <span className="type-label tone-mute">
                <BiOnly zh="下一个案例 →" en="NEXT →" />
              </span>
              <span className="mt-8 flex min-w-0 items-start justify-between gap-5 md:justify-end">
                <span aria-hidden className="type-lg tone-accent-text order-1 shrink-0 transition-transform duration-700 ease-[var(--ease-vc-out)] group-hover:translate-x-2">→</span>
                <AdjacentTitle title={next.title} titleZh={next.titleZh} direction="next" />
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
