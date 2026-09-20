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
  /* --- Flagship chapter kit (all optional; see CaseBlock above) ----------- */
  /**
   * Pin this chapter to a surface instead of letting it alternate.
   *
   * The Guge rebuild is directed rather than alternated: two light chapters
   * (the technical plate and the evidence wall) have to land at specific points
   * to give the long dark acts somewhere to breathe. Absent = alternate, i.e.
   * exactly the previous behaviour.
   */
  tone?: 'ink' | 'paper';
  /** Short Chinese gloss printed directly under the English headline. */
  gloss?: string;
  /**
   * Richer composition. When present, the chapter renders through the block
   * renderer instead of `layout`.
   */
  blocks?: CaseBlock[];
  /** Purpose-built set piece rendered above the blocks. */
  piece?: CasePiece;
}

/**
 * Flagship chapters — the richer composition kit.
 *
 * The four flagships were originally all told with the same seven layouts, which
 * made every case study read like the same page with different pictures. The Guge
 * rebuild needs each chapter to carry its own rhythm (a cinematic opening, a
 * layered diagram, a horizontal scroll, a technical plate, a video mosaic, an
 * evidence wall), so a chapter may now declare a **block sequence** instead.
 *
 * Everything below is optional. A section without `blocks` renders exactly as it
 * did before, which is what keeps the other three flagships untouched.
 */

/** How much of the chapter grid a block occupies. */
export type BlockSpan = 'full' | 'wide' | 'half' | 'third' | 'plate';

/** One column of a two-panel comparison (e.g. ARCHIVE / NOW). */
export interface ComparePanel {
  /** Mono eyebrow, e.g. `ARCHIVE`. */
  label: string;
  /** Chinese line under the label. */
  zh: string;
  media: MediaRef;
}

/** One capability pillar: a mono label, a Chinese gloss, optional evidence. */
export interface PillarItem {
  label: string;
  zh: string;
  media?: MediaRef;
}

/**
 * A composition unit inside a chapter.
 *
 * Deliberately few and generic — a chapter's character comes from the *order and
 * span* it chooses, not from a bespoke block type per chapter.
 */
export type CaseBlock =
  /** A single image at a chosen width. */
  | { kind: 'media'; media: MediaRef; span?: BlockSpan }
  /** Several images sharing one row. `scroll` bleeds and snaps on phones. */
  | { kind: 'mediaRow'; items: MediaRef[]; columns?: 2 | 3 | 4; mobile?: 'grid' | 'scroll' }
  /** A muted looping video. */
  | { kind: 'video'; video: VideoRef; span?: 'full' | 'wide' }
  /**
   * A pull-quote in display type, attributed to a real source.
   *
   * `size` defaults to the full display step. A chapter that has already spent
   * its visual budget can drop to `lg` — a three-line pull-quote at display size
   * costs about half a screen on its own.
   */
  | { kind: 'quote'; zh: string; en?: string; attribution?: string; size?: 'lg' | 'xl' }
  /** Two labelled panels side by side (ARCHIVE / NOW, before / after). */
  | { kind: 'compare'; left: ComparePanel; right: ComparePanel }
  /** A horizontal pipeline drawn in code — stages of a real process. */
  | { kind: 'flow'; steps: string[]; label?: string; note?: string }
  /** A row of capability pillars. */
  | { kind: 'pillars'; items: PillarItem[]; columns?: 2 | 4 }
  /** A muted footnote. */
  | { kind: 'note'; zh: string }
  /** An image that opens the full-size artefact in a new tab. */
  | { kind: 'mediaLink'; media: MediaRef; href: string; label: string; note?: string }
  /**
   * A row of artefacts that each open full size. Four portrait exhibition boards
   * stacked vertically would be a wall of scrolling with no way to compare them;
   * side by side they read as the set they actually are.
   */
  | {
      kind: 'mediaLinkRow';
      items: MediaLinkItem[];
      columns?: 2 | 4;
      /**
       * Arrange the artefacts as a staggered "portfolio wall" rather than a
       * strict grid. Four portrait exhibition boards lined up edge to edge read
       * as a table; nudging each one up or down reads as a wall someone hung.
       */
      layered?: boolean;
      label?: string;
    }
  /**
   * A short deck section: a mono sub-head, one line of copy, and the strongest
   * pages from the presentation set. Deliberately *not* a page-through of the
   * whole deck — the point is that it was art-directed, not that it was long.
   */
  | { kind: 'deckMosaic'; label: string; zh: string; items: MediaRef[] };

/** One artefact in a `mediaLinkRow`. */
export interface MediaLinkItem {
  media: MediaRef;
  href: string;
  label: string;
  note?: string;
}

/**
 * Named set pieces. A chapter that declares one gets a purpose-built renderer
 * instead of the generic block flow.
 *
 * - `hero`      cinematic opening band
 * - `layers`    a layered diagram revealed bottom-up, in stages
 * - `panorama`  a wide scroll that drifts horizontally as the page advances
 * - `mosaic`    a three-stage reveal: details → mosaic → the full artefacts
 */
export type CasePiece = 'hero' | 'layers' | 'panorama' | 'mosaic';

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

/**
 * One capability slice of a flagship's home-page mini case.
 *
 * The home page must not replay a case study. For a project broad enough that a
 * single cover image misrepresents it, the home page shows a few *proof slices*
 * — enough to establish that the work is complex — and leaves the depth to the
 * case page. The anchor is what makes that promise concrete: each slice links
 * straight to the chapter that substantiates it.
 */
export interface HomeSlice {
  /** Mono capability label, e.g. `WORLD BUILDING`. */
  label: string;
  /** One Chinese line saying what was actually made. */
  zh: string;
  media: MediaRef;
  /** Case-study anchor id this slice points at. */
  anchor: string;
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
  /**
   * How the cover fills a media box that was not shaped for it. Defaults to
   * `cover`.
   *
   * Lihuahua's covers are portrait phone screenshots (0.45). Cropped into the
   * shared landscape tile they lost 66–71% of the interface — navigation, input
   * and controls — which is the app itself. `contain` shows the whole screen on
   * the paper surface the shot was taken on.
   */
  coverFit?: 'cover' | 'contain';
  /**
   * A cover shaped for the shared landscape tile (`/work`, 1.55:1).
   *
   * Some covers only exist in a shape the tile would butcher — Guge's is a
   * 3.19:1 banner, and `cover` kept 48% of it. Rather than bend the grid, the
   * project ships a second crop composed for that box; fall back to `cover`.
   */
  coverTile?: MediaRef;
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
  /**
   * When present, the home page renders this project as a mini case with these
   * capability slices instead of the generic flagship block.
   */
  homeSlices?: HomeSlice[];
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
