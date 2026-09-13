/**
 * Where a display headline breaks.
 *
 * Headlines on this site are revealed one line at a time, so their line breaks
 * have to exist in the markup instead of being left to the browser. That makes
 * the markup responsible for something a browser normally does well, and three
 * rules follow from it:
 *
 * 1. **A Latin word is never cut in half.** The first implementation split on
 *    character count, which turned "观潮 Daily Brief" into "观潮 Dail" / "y Brief"
 *    — the case page shipped that for weeks, and a word sliced down the middle
 *    reads as a typo rather than as a line break. CJK breaks anywhere, so only
 *    the Latin runs need protecting.
 * 2. **A space is the author's own break point,** so when a headline has one it
 *    wins over any computed cut. "李花花 · VC-AI-PET" splits after the name and
 *    not through it.
 * 3. **Lines balance by visual width, not by character count.** At the same size
 *    a CJK glyph is about twice as wide as a Latin one, so counting characters
 *    makes mixed-script titles lopsided.
 *
 * Punctuation-delimited clauses win over all of it: a clause is an even stronger
 * authorial break and reads better than anything computed here.
 *
 * The counterpart to this is `.type-column-fit` in `globals.css`: a fixed line
 * break only works if the type fits its column, and on the home page the same
 * headline sits in a 395px column in one layout and an 864px column on its case
 * page.
 */

/** One CJK glyph (may break anywhere) or one run of non-space Latin/digits. */
const TOKEN = /[\u2e80-\u9fff\uf900-\ufaff]|[^\s\u2e80-\u9fff\uf900-\ufaff]+/g;

const CJK = /[\u2e80-\u9fff\uf900-\ufaff]/;

/** A line must not end on one of these. */
const SEPARATOR = /[·・/|—–-]$/;

/**
 * Nor start on one of these: CJK typography does not begin a line with closing
 * punctuation, and `text-wrap` obeys the same rule. Without this, a headline with
 * a single sentence-final full stop ("你不需要先想清楚该找谁。") put the "。" on a
 * line of its own.
 */
const CLOSING = /[。，、！？；：））」』】》…]/;

/** Opening punctuation may not be left at the end of a line either. */
const OPENING = /[（「『【《]$/;

/**
 * Below this the headline stays on one line and is left to wrap on its own. Four
 * CJK characters at `type-xl`'s cap already fill most of a case-page column;
 * breaking something that short would only add height.
 */
const SINGLE_LINE_WEIGHT = 6.5;

/**
 * How wide a run of text is, in CJK units — the stand-in that both the balance
 * calculation and `.type-column-fit` size against. Whitespace is free.
 *
 * The ratios are measured, not assumed: in this display face a Latin letter is
 * about 0.6 of a CJK glyph and punctuation about 0.4. Guessing 0.5 for Latin made
 * "· VC-AI-PET" land at 98.8% of its column — technically fitting, with no room
 * to breathe.
 */
const LATIN = /[A-Za-z0-9]/;

export function headlineWeight(value: string): number {
  let total = 0;
  for (const char of value) {
    if (/\s/.test(char)) continue;
    if (CJK.test(char)) total += 1;
    else if (LATIN.test(char)) total += 0.6;
    else total += 0.4;
  }
  return total;
}

/**
 * The offsets a line could start at, given that a Latin run must not be cut.
 * Tokenising is how that boundary gets found: a token start is either a CJK
 * glyph or the first character of a whole word.
 */
function lineStarts(text: string): number[] {
  const starts: number[] = [];
  for (const match of text.matchAll(TOKEN)) {
    if (match.index) starts.push(match.index);
  }
  return starts;
}

export function splitHeadline(value: string): string[] {
  const text = value.trim();
  if (!text) return [];
  const clean = (lines: string[]) => lines.map((line) => line.trim()).filter(Boolean);

  const clauses = text.match(/[^，。！？；：]+[，。！？；：]?/g)?.filter(Boolean) ?? [];
  if (clauses.length === 2 || clauses.length === 3) return clean(clauses);
  if (clauses.length > 3) {
    const first = Math.ceil(clauses.length / 3);
    const second = Math.ceil((clauses.length * 2) / 3);
    return clean(
      [clauses.slice(0, first), clauses.slice(first, second), clauses.slice(second)]
        .map((group) => group.join(''))
        .filter(Boolean),
    );
  }

  const starts = lineStarts(text);
  const total = headlineWeight(text);
  if (!starts.length || total < SINGLE_LINE_WEIGHT) return [text];

  const breakable = (at: number) =>
    at > 0 &&
    at < text.length &&
    !SEPARATOR.test(text.slice(0, at).trimEnd()) &&
    !OPENING.test(text.slice(0, at).trimEnd()) &&
    !CLOSING.test(text[at]);

  // A space is the author's break point, so prefer those when the headline has any.
  const spaces: number[] = [];
  for (const match of text.matchAll(/\s+/g)) {
    const at = (match.index ?? 0) + match[0].length;
    if (breakable(at)) spaces.push(at);
  }

  // Otherwise break between CJK glyphs — which is also where a Latin run ends, so
  // the cut can never land inside a word.
  const cuts = (spaces.length ? spaces : starts).filter(breakable);

  if (!cuts.length) return [text];

  let cut = cuts[0];
  let bestGap = Infinity;
  for (const at of cuts) {
    const gap = Math.abs(headlineWeight(text.slice(0, at)) - total / 2);
    if (gap < bestGap) {
      bestGap = gap;
      cut = at;
    }
  }

  return clean([text.slice(0, cut), text.slice(cut)]);
}
