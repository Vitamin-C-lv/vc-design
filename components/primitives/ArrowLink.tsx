'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { cx } from '@/lib/utils';
import { hasHashTarget, scrollToHash } from '@/lib/motion/lenis';

/**
 * The site's link primitive.
 *
 * Every navigational affordance on the site goes through this component so that
 * three behaviours stay consistent:
 *
 * - in-page anchors are handed to Lenis, so a nav click animates instead of
 *   jumping (and does not desynchronise ScrollTrigger);
 * - external links always open in a new tab with `rel="noreferrer"`;
 * - the arrow affordance and its hover motion are identical everywhere.
 */
export type ArrowLinkVariant = 'inline' | 'solid' | 'outline' | 'ghost';

export interface ArrowLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: ArrowLinkVariant;
  className?: string;
  /** Hide the ↗ / → glyph. */
  noArrow?: boolean;
  /** Force external treatment even for a relative URL. */
  external?: boolean;
  /** Vertical offset when scrolling to an in-page anchor (header height). */
  scrollOffset?: number;
  ariaLabel?: string;
}

/**
 * Every variant that does not set its own colour must carry `tone-fg`.
 *
 * Found by visual check: `outline` inherited its colour from `<body>` — which is
 * the *ink* foreground, near-white — so on a paper band the button rendered
 * near-white text inside a visible border, i.e. an apparently empty box. Since
 * the header now adapts its tone to the band beneath it, a variant that relies on
 * inheritance is a bug waiting for the next light band.
 */
const VARIANTS: Record<ArrowLinkVariant, string> = {
  inline: 'type-label tone-fg hover:opacity-100 opacity-70',
  ghost: 'type-label tone-fg hover:opacity-100 opacity-80',
  outline:
    'type-label tone-fg border border-[var(--tone-line)] px-5 py-3.5 hover:bg-[var(--tone-fg)] hover:text-[var(--tone-bg)] transition-colors duration-500',
  solid:
    'type-label bg-[var(--tone-fg)] text-[var(--tone-bg)] px-6 py-4 hover:opacity-85 transition-opacity duration-500',
};

export function ArrowLink({
  href,
  children,
  variant = 'inline',
  className,
  noArrow = false,
  external,
  scrollOffset = -72,
  ariaLabel,
}: ArrowLinkProps) {
  const isExternal = external ?? /^https?:\/\//.test(href);
  const glyph = isExternal ? '↗' : '→';

  const content = (
    <span className="inline-flex items-baseline gap-2">
      <span>{children}</span>
      {noArrow ? null : (
        <span
          aria-hidden
          className="inline-block translate-y-0 transition-transform duration-500 ease-[var(--ease-vc-out)] group-hover:translate-x-1 group-hover:-translate-y-0.5"
        >
          {glyph}
        </span>
      )}
    </span>
  );

  const classes = cx('group inline-block', VARIANTS[variant], className);

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href as Route}
      className={classes}
      aria-label={ariaLabel}
      onClick={(event) => {
        // Let the browser handle modified clicks (new tab, download, …).
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!hasHashTarget(href)) return;
        event.preventDefault();
        scrollToHash(href.slice(href.indexOf('#')), scrollOffset);
        // Keep the URL shareable without triggering the browser's own jump.
        window.history.replaceState(null, '', href);
      }}
    >
      {content}
    </Link>
  );
}
