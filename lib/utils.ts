/**
 * Small shared helpers. Kept dependency-free and side-effect-free so they are
 * safe in both server and client components.
 */

/** Joins conditional class names. A tiny local `clsx` to avoid a dependency. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Formats a chapter index (`1` → `01`). */
export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Encodes a brief message for the contact panel's `mailto:` / clipboard flows.
 * Kept here so the contact components stay presentational.
 */
export function buildBriefMessage(intent: string | null, detail: string): string {
  const lines: string[] = [];
  if (intent) lines.push(`需求类型：${intent}`);
  if (detail.trim()) lines.push('', detail.trim());
  return lines.join('\n');
}

/** True when the value is a usable, non-placeholder string. */
export function isFilled(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
