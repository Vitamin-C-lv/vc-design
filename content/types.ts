/**
 * Content model for the VC / 维C website.
 *
 * Hard rule from the brief: every piece of copy, every link and every contact
 * detail lives in `content/`. Components never hardcode project text. Adding a
 * fifth case study must be a data change, not a component change.
 */

/** A pointer into the generated media manifest (`content/media.json`). */
export interface MediaRef {
  /**
   * Manifest key, e.g. `guge/guge_master_poster`.
   * See `public/works/_manifest.json` for the authoritative list.
   */
  key: string;
  /** Required: describes the image for screen readers and for when it fails. */
  alt: string;
  /** Optional Chinese caption rendered under the image. */
  caption?: string;
  /** CSS object-position, e.g. `50% 30%`. Defaults to `50% 50%`. */
  focal?: string;
  /** Intrinsic aspect ratio override (width / height) when it must be forced. */
  aspect?: number;
  /**
   * Which surface the image should sit on.
   * Diagram assets drawn with dark ink on transparency (e.g. the Guge world
   * layers map) must be placed on a light panel or they disappear on ink.
   * `auto` (default) means "whatever the surrounding band uses".
   */
  surface?: 'auto' | 'light' | 'dark';
}

/**
 * Diagrams are drawn in code (inline SVG / CSS) rather than exported as images.
 * They stay crisp at every viewport, cost a few KB instead of megabytes, and can
 * be animated by the same motion system as the rest of the page.
 */
export type DiagramId = 'rag-pipeline' | 'memory' | 'emotion-state' | 'local-runtime' | 'data-flow';

/** A single scroll chapter of a case study. */
export interface CaseSection {
  /** Anchor id — used for the in-page chapter rail. */
  id: string;
  /** `01`, `02`, … rendered as a chapter number. */
  index: string;
  /** Short English eyebrow, e.g. `CONTEXT / CHALLENGE`. */
  eyebrow: string;
  /** English headline for the chapter. */
  title: string;
  /** Optional Chinese headline. */
  titleZh?: string;
  /** Body paragraphs (Chinese is primary; English accents stay short). */
  body: string[];
  /** Optional scannable list rendered as a spec-like column. */
  bullets?: string[];
  /** Media rendered with the chapter. */
  media?: MediaRef[];
  /**
   * How the chapter composes:
   * - `statement`  big type only, no media
   * - `full`       single full-bleed image below the text
   * - `split`      text and media side by side (stacks on mobile)
   * - `pair`       two images, offset
   * - `reel`       horizontally scrolling image strip
   * - `sequence`   numbered process list, no images
   */
  layout: 'statement' | 'full' | 'split' | 'pair' | 'reel' | 'sequence' | 'diagram';
  /** Required when `layout` is `diagram`. Selects a code-drawn figure. */
  diagram?: DiagramId;
  /**
   * A shipped product, embedded and running, for chapters whose argument is the
   * artefact itself. Rendered below the chapter text and above any supporting
   * captures, because a working copy is stronger evidence than a still.
   */
  embed?: EmbeddedProductRef;
  /** Optional footnote in a muted voice. */
  note?: string;
}

/**
 * A deployed product shown inside a case study as a working copy.
 *
 * `src` points at a **locally served static export** rather than the product's
 * public URL, so the case page keeps working if that deployment moves, changes or
 * disappears. `note` must say so, because a frozen copy presented without that
 * caveat would read as live data.
 */
export interface EmbeddedProductRef {
  /** Root-relative path to the exported copy, e.g. `/guanchao-live`. */
  src: string;
  /** Accessible name for the frame. */
  title: string;
  /** Shown while the frame loads, and if it fails. */
  poster: MediaRef;
  /** Label for the "open in a new tab" escape hatch. */
  openLabel: string;
  note?: string;
}

/** A short, muted, self-hosted video loop used as evidence of a running build. */
export interface VideoRef {
  mp4: string;
  webm: string;
  poster: string;
  posterSrcSet?: string;
  /** Intrinsic aspect ratio of the poster, used to reserve space (CLS). */
  aspect: number;
  caption?: string;
}

/** An award / external proof point. Never invent these. */
export interface Recognition {
  /** Award body, verbatim. */
  award: string;
  /** Result, verbatim. */
  result: string;
  /** Optional certificate image key. */
  mediaKey?: string;
  /** Project name as it appeared on the entry, when it differs. */
  work?: string;
}

/** Metadata row rendered in the case-study facts panel. */
export interface MetaRow {
  label: string;
  value: string;
}

/**
 * A real, externally verifiable artifact. Live links are our strongest trust
 * signal because VC does not show faces.
 */
export interface LiveLink {
  url: string;
  /** Button label, e.g. `LIVE PRODUCT`. */
  label: string;
  /** Optional one-line Chinese description. */
  note?: string;
}

export interface Project {
  slug: string;
  /** Sort/priority. 1 is the first flagship. */
  order: number;
  /** Flagships occupy the large layout; others are reel cards. */
  featured: boolean;
  /** English display title. */
  title: string;
  /** Chinese title. */
  titleZh: string;
  /** English one-liner used on cards. */
  tagline: string;
  /** Chinese one-liner used on cards. */
  taglineZh: string;
  /** Discipline tags — these are tags, never the brand structure. */
  tags: string[];
  year: string;
  /** Per-project accent pulled from the work itself (hex). */
  accent: string;
  /** Index card media. Falls back to the first section image. */
  cover: MediaRef;
  /** Short proof badge on the card, e.g. `NATIONAL AWARDS ×3`. */
  badge?: string;
  /** Live/working product links. */
  live?: LiveLink[];
  /** Facts panel. */
  meta: MetaRow[];
  /** Home-page summary paragraph (Chinese). */
  summary: string;
  /** English supporting line. */
  summaryEn?: string;
  /** Scroll chapters. A project with no sections renders as a reel card only. */
  sections: CaseSection[];
  recognition?: Recognition[];
  /** Honest, restrained authorship note. Never overclaim. */
  credits?: string[];
  /** Rendered on the home page as the "under the hood" relationship note. */
  relatedNote?: string;
  /** Working-prototype footage. Muted, lazy, poster-first. */
  video?: VideoRef;
  /**
   * A live point-cloud sequence rendered in the browser.
   *
   * Reserved for projects that genuinely shipped one: the case page hands the
   * visitor the actual artefact instead of a screenshot of it, which is a far
   * stronger proof of capability than any still image.
   */
  particle?: ParticleSequence;
}

/**
 * A capability-reel entry. These exist to prove breadth, not to compete with the
 * flagships, so they are intentionally short: title, role, tags and — where real
 * material exists — a few images. Several deliberately ship without imagery
 * rather than borrowing visuals from an unrelated project.
 */
export interface MoreWorkItem {
  id: string;
  /** English display title. */
  title: string;
  titleZh: string;
  /** English role line, e.g. `MODELING · MATERIAL · LIGHTING`. */
  role: string;
  roleZh: string;
  tags: string[];
  /** Accent used only for this card's hairline/marker. */
  accent: string;
  /** Short Chinese description. */
  summary: string;
  /** Optional real imagery. */
  media?: MediaRef[];
}

/* ============================================================================
   Live particle sequence
   ----------------------------------------------------------------------------
   A real-time point-cloud rendering lifted from a shipped project. Only a
   project that actually built one gets this field — it is not a decorative slot,
   and the vocabulary below is deliberately fixed because it mirrors the source
   project's own structure (seven craft stages, each with its own particle colour
   and motion mode) rather than being free-form copy.
   ========================================================================== */

/** The seven craft stages of 青花造境, in the source project's order. */
export type ParticleStageId =
  | 'origin'
  | 'pulling'
  | 'trimming'
  | 'painting'
  | 'glazing'
  | 'firing'
  | 'finished';

/** Which sampled point cloud a stage renders. */
export type ParticleModelId = 'clay' | 'pulling' | 'bisque';

export interface ParticleStage {
  id: ParticleStageId;
  /** Chinese stage name, e.g. 泥土初生. */
  zh: string;
  /** English stage name from the source project, e.g. CLAY AWAKENING. */
  en: string;
  /** One line shown while the stage is active. */
  note: string;
  /**
   * English counterpart of `note`. The seven notes are short and concrete ("a
   * vessel is born from clay, fire and glaze"), and the tablist already names the
   * stages in both languages — leaving this blank would drop the caption back to
   * Chinese in English mode, which reads as a seam in an otherwise bilingual block.
   */
  noteEn: string;
  model: ParticleModelId;
  /** Particle colour for this stage, taken from the source project. */
  color: string;
}

export interface ParticleSequence {
  eyebrowZh: string;
  eyebrowEn: string;
  titleZh: string;
  titleEn: string;
  body: string;
  /** Shown on reduced-motion / low-tier devices and if WebGL fails. */
  fallback: MediaRef;
  stages: ParticleStage[];
}
