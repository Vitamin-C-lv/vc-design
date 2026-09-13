/**
 * Bilingual primitives.
 *
 * ── Why the language switch is CSS, not React state ──────────────────────────
 * The default reading language is Chinese, but the site must also be readable in
 * English (and the client asked for a toggle in the header). The obvious
 * implementation — a React context holding `'zh' | 'en'` — would force almost
 * every section to become a client component, push the whole content model into
 * the browser bundle, and make the switch a re-render.
 *
 * Instead the document carries `data-lang` on `<html>`, both languages are
 * rendered into the DOM, and CSS decides which one occupies which slot:
 *
 *   [data-lang='zh'] [data-lang-en] { display: none }   ← and vice versa
 *
 * Consequences, all of them good:
 * - components stay **server** components (zero added JS);
 * - the toggle is instantaneous — one attribute flip, no re-render;
 * - with scripting disabled the markup defaults to Chinese, which is the primary
 *   audience, and the English copy is still present for crawlers.
 *
 * `Bi` renders the same content twice into two slots: a *primary* slot (the
 * language being read) and a *secondary* slot (the other language, kept small as
 * typographic texture — "英文用于表现感，不作为信息").
 */

export interface BiProps {
  /** Chinese string. */
  zh: React.ReactNode;
  /** English string. */
  en: React.ReactNode;
  /** Class for the slot carrying the language currently being read. */
  primaryClassName?: string;
  /** Class for the small echo in the other language. */
  secondaryClassName?: string;
  /** Wrapper element. Use `null` to emit the two slots as siblings. */
  as?: 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'figcaption' | null;
  className?: string;
  /** Drop the secondary echo entirely (for slots that must stay single-line). */
  hideSecondary?: boolean;
}

/**
 * Renders a primary slot and a secondary echo, letting CSS decide which language
 * fills which slot.
 *
 * Note the deliberate crossing-over on the secondary pair: the *primary* slots
 * show the language being read, while the *secondary* slots must show the
 * **other** language. Marking the secondary Chinese text as `data-lang-zh` would
 * display Chinese twice in Chinese mode — which is exactly what happened in the
 * first cut of this component.
 */
export function Bi({
  zh,
  en,
  primaryClassName,
  secondaryClassName,
  as: Tag = 'div',
  className,
  hideSecondary = false,
}: BiProps) {
  const primaryZh = <span data-lang-zh className={primaryClassName}>{zh}</span>;
  const primaryEn = <span data-lang-en className={primaryClassName}>{en}</span>;
  // Crossed on purpose: in Chinese mode the echo is the English text, and vice versa.
  const secondaryZhMode = <span data-lang-zh className={secondaryClassName}>{en}</span>;
  const secondaryEnMode = <span data-lang-en className={secondaryClassName}>{zh}</span>;

  const body = (
    <>
      {primaryZh}
      {primaryEn}
      {hideSecondary ? null : (
        <>
          {secondaryZhMode}
          {secondaryEnMode}
        </>
      )}
    </>
  );

  if (!Tag) return body;
  return <Tag className={className}>{body}</Tag>;
}

/**
 * Two independent slots, each bilingual — for layouts where the secondary echo
 * lives in a structurally different place than the headline (a meta row, a
 * caption, a right-hand column).
 */
export function BiOnly({
  zh,
  en,
  className,
  as: Tag = 'span',
}: {
  zh: React.ReactNode;
  en: React.ReactNode;
  className?: string;
  as?: 'div' | 'p' | 'span' | 'dt' | 'dd' | 'li' | null;
}) {
  const body = (
    <>
      <span data-lang-zh className={className}>{zh}</span>
      <span data-lang-en className={className}>{en}</span>
    </>
  );
  if (!Tag) return body;
  return <Tag>{body}</Tag>;
}
