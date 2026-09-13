/**
 * The "this goes somewhere" mark.
 *
 * Put it on every image that is a link. The rule it exists to satisfy is that
 * being clickable and *looking* clickable are two different things, and only the
 * second one is visible to a visitor. A hover-only hint does not count: on a
 * phone there is no hover at all, and even on desktop nobody hovers a picture to
 * find out whether it is a link.
 *
 * So the badge is drawn at rest, and hover only intensifies it — it never gates
 * the information.
 */
export function MediaLinkBadge({
  label = '进入案例',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={[
        'type-label-sm pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-2',
        // Arbitrary values rather than the `.tone-fg` helper: those helpers are
        // plain CSS classes, so a `group-hover:` variant on them emits nothing.
        'border border-[var(--tone-line)] bg-[var(--tone-bg)]/70 px-2.5 py-1.5 text-[var(--tone-fg)]',
        'backdrop-blur-sm transition-colors duration-500',
        // Only the paint changes on hover. Nothing appears that was not there.
        'group-hover/media:border-[var(--tone-accent)] group-hover/media:text-[var(--tone-accent)]',
        'group-focus-visible/media:border-[var(--tone-accent)] group-focus-visible/media:text-[var(--tone-accent)]',
        className ?? '',
      ].join(' ')}
    >
      {label}
      <span className="translate-y-0 transition-transform duration-500 ease-[var(--ease-vc-out)] group-hover/media:translate-x-0.5 group-hover/media:-translate-y-0.5">
        ↗
      </span>
    </span>
  );
}
