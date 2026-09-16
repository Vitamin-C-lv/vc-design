import { cx } from '@/lib/utils';
import { Reveal } from '@/components/motion/Reveal';

/**
 * Server-safe layout and typography primitives.
 *
 * None of these hold state or effects, so they stay out of the client bundle
 * entirely. Sections compose these rather than re-deriving spacing and tone by
 * hand — that is what keeps the light/dark rhythm and the vertical scale
 * consistent across a page built by several different components.
 */

/* -------------------------------------------------------------------------- */

export function Container({
  children,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'nav';
}) {
  return <Tag className={cx('shell', className)}>{children}</Tag>;
}

/* -------------------------------------------------------------------------- */

export type Tone = 'ink' | 'paper';

type BandCurve = 'top' | 'bottom';

/** The curve is geometry, not content: it must remain visible without JS. */
function BandCurveOverlay({ position }: { position: BandCurve }) {
  return (
    <svg
      aria-hidden="true"
      className={cx('band-curve-svg', position === 'top' ? 'band-curve-svg-top' : 'band-curve-svg-bottom')}
      focusable="false"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        d={position === 'top' ? 'M0,100 Q50,-100 100,100 Z' : 'M0,0 Q50,200 100,0 Z'}
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * A full-width band of the page.
 *
 * `data-tone` re-points the surface/type/hairline variables for everything
 * inside. Alternating bands is how the page gets its editorial rhythm without a
 * single extra stylesheet rule.
 */
export function Band({
  children,
  tone = 'ink',
  id,
  className,
  innerClassName,
  container = true,
  as: Tag = 'section',
  accent,
}: {
  children: React.ReactNode;
  tone?: Tone;
  id?: string;
  className?: string;
  innerClassName?: string;
  container?: boolean;
  as?: 'section' | 'div' | 'footer' | 'article';
  /** Optional per-project accent injected as `--tone-accent`. */
  accent?: string;
}) {
  const curveToken = className
    ?.split(/\s+/)
    .find((token) => token === 'band-curve-top' || token === 'band-curve-bottom');
  const curve: BandCurve | undefined =
    curveToken === 'band-curve-top' ? 'top' : curveToken === 'band-curve-bottom' ? 'bottom' : undefined;

  return (
    <Tag
      id={id}
      data-tone={tone}
      className={cx('band', className)}
      style={accent ? ({ '--tone-accent': accent } as React.CSSProperties) : undefined}
    >
      {curve ? <BandCurveOverlay position={curve} /> : null}
      <div className={curve ? 'band-curve-content' : undefined}>
        {container ? (
          <Container className={innerClassName}>{children}</Container>
        ) : (
          <div className={innerClassName}>{children}</div>
        )}
      </div>
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */

/** Mono eyebrow. The workhorse label of the whole site. */
export function Eyebrow({
  children,
  className,
  marker = true,
}: {
  children: React.ReactNode;
  className?: string;
  marker?: boolean;
}) {
  return (
    <p className={cx('type-label tone-mute flex items-center gap-2.5', className)}>
      {marker ? (
        <span aria-hidden className="tone-accent-bg inline-block h-[3px] w-[3px] rounded-full" />
      ) : null}
      <span>{children}</span>
    </p>
  );
}

/* -------------------------------------------------------------------------- */

/** Discipline / capability tags. Tags, never the brand structure. */
export function TagList({
  tags,
  className,
  size = 'md',
}: {
  tags: readonly string[];
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <ul className={cx('flex flex-wrap items-center gap-x-2 gap-y-2', className)}>
      {tags.map((tag) => (
        <li
          key={tag}
          className={cx(
            size === 'sm' ? 'type-label-sm' : 'type-label',
            'tone-mute border border-[var(--tone-line)] px-2.5 py-1.5 leading-none',
          )}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */

export function Rule({ className }: { className?: string }) {
  return <hr className={cx('h-px w-full border-0 bg-[var(--tone-line)]', className)} />;
}

/* -------------------------------------------------------------------------- */

/** Eyebrow + headline + optional standfirst. The standard section opener. */
export function SectionIntro({
  eyebrow,
  title,
  titleZh,
  body,
  align = 'start',
  className,
  size = 'lg',
  titleClassName,
  reveal = false,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  titleZh?: React.ReactNode;
  body?: React.ReactNode;
  align?: 'start' | 'center';
  className?: string;
  size?: 'md' | 'lg' | 'xl';
  titleClassName?: string;
  /** Opt into the shared editorial opener choreography on home-page bands. */
  reveal?: boolean;
}) {
  const titleSize = size === 'xl' ? 'type-xl' : size === 'lg' ? 'type-lg' : 'type-md';
  return (
    <div className={cx(align === 'center' && 'text-center', className)}>
      {eyebrow ? (
        reveal ? (
          <Reveal variant="fade" className="mb-6 md:mb-8">
            <Eyebrow className={cx(align === 'center' && 'justify-center')}>{eyebrow}</Eyebrow>
          </Reveal>
        ) : (
          <Eyebrow className={cx('mb-6 md:mb-8', align === 'center' && 'justify-center')}>
            {eyebrow}
          </Eyebrow>
        )
      ) : null}
      {title ? (
        reveal ? (
          <Reveal variant="masked" delay={75}>
            <h2 className={cx(titleSize, 'type-display', titleClassName)}>{title}</h2>
          </Reveal>
        ) : (
          <h2 className={cx(titleSize, 'type-display', titleClassName)}>{title}</h2>
        )
      ) : null}
      {titleZh ? (
        reveal ? (
          <Reveal variant="rise" delay={150}>
            <p className={cx('type-lead tone-fg-2', title ? 'mt-5 md:mt-6' : '', 'max-w-[46ch]', align === 'center' && 'mx-auto')}>
              {titleZh}
            </p>
          </Reveal>
        ) : (
          <p className={cx('type-lead tone-fg-2', title ? 'mt-5 md:mt-6' : '', 'max-w-[46ch]', align === 'center' && 'mx-auto')}>
            {titleZh}
          </p>
        )
      ) : null}
      {body ? (
        reveal ? (
          <Reveal variant="rise" delay={180}>
            <div className={cx('type-body tone-fg-2 mt-6 max-w-[62ch] md:mt-8', align === 'center' && 'mx-auto')}>
              {body}
            </div>
          </Reveal>
        ) : (
          <div className={cx('type-body tone-fg-2 mt-6 max-w-[62ch] md:mt-8', align === 'center' && 'mx-auto')}>
            {body}
          </div>
        )
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Label/value rows used by case-study fact panels and project cards. */
export function MetaGrid({
  rows,
  className,
  columns = 2,
}: {
  rows: { label: string; value: string }[];
  className?: string;
  columns?: 1 | 2;
}) {
  return (
    <dl
      className={cx(
        'grid gap-x-10 gap-y-5',
        columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        className,
      )}
    >
      {rows.map((row) => (
        <div key={row.label} className="border-t border-[var(--tone-line)] pt-4">
          <dt className="type-label-sm tone-mute">{row.label}</dt>
          <dd className="type-body tone-fg mt-2">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */

/** The `01 / 07` chapter marker used by case-study sections. */
export function ChapterMark({
  index,
  total,
  className,
}: {
  index: string;
  total?: number;
  className?: string;
}) {
  return (
    <span className={cx('type-label tone-mute', className)}>
      {index}
      {total ? <span className="opacity-50"> / {String(total).padStart(2, '0')}</span> : null}
    </span>
  );
}
