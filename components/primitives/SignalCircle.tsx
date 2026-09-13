import Link from 'next/link';

/**
 * The primary conversion target, as a solid circle sitting on a hairline.
 *
 * This is the one place the site spends its single signal colour. The CTA used to
 * be another small bordered button — correct, and indistinguishable from the
 * secondary links around it. A circle of this size can only be the main action,
 * which is what the last band of a sales page needs: one unmistakable thing to do.
 *
 * The hairline is drawn *through* the circle's centre line and stops at the
 * circle, so the button reads as sitting on the page's structure rather than
 * floating over it. On narrow screens the rule is dropped and the circle simply
 * takes the full width of its box, because a 176px circle next to a stub of rule
 * is visual noise at that size.
 */
export function SignalCircle({
  href,
  children,
  sublabel,
  external = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  /** Small mono line inside the circle, under the label. */
  sublabel?: string;
  external?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      <span className="type-label leading-tight">{children}</span>
      {sublabel ? (
        // `type-label-sm` (11px), not a hand-rolled 10px: the project's own rule is
        // that nothing readable goes below 11px, because Han characters lose their
        // inner strokes at 10px.
        <span aria-hidden className="type-label-sm mt-2 block tracking-[0.14em] opacity-70">
          {sublabel}
        </span>
      ) : null}
    </>
  );

  const circle =
    'signal-circle aspect-square w-full max-w-[11rem] shrink-0 flex-col px-6 text-center sm:w-[11rem]';

  return (
    <div className={className}>
      <div className="flex items-center gap-8">
        {external ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className={`group ${circle}`}
          >
            {inner}
          </a>
        ) : (
          <Link href={href} className={`group ${circle}`}>
            {inner}
          </Link>
        )}
        {/* Decorative continuation of the hairline. `aria-hidden` because it
            carries no information — it is the rule the circle sits on. */}
        <span aria-hidden className="hidden h-px flex-1 bg-[var(--tone-line)] sm:block" />
      </div>
    </div>
  );
}
