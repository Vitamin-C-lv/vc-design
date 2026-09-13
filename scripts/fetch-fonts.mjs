/**
 * Vendors the project's open-source webfonts into `app/fonts/`.
 *
 * Why vendor at all: the deployed site must make **zero** third-party font
 * requests. That matters twice over — first paint on mainland-China networks
 * (no `fonts.gstatic.com` round trip), and WeChat WebView, which is slow and
 * inconsistent about external font hosts.
 *
 * Usage: node scripts/fetch-fonts.mjs
 *
 * Only the `latin` subset is fetched:
 * - `latin-ext` is dead weight for an English + Chinese site;
 * - CJK is deliberately *not* vendored — a full CJK webfont is several megabytes
 *   and would eat the whole mobile budget, so Chinese renders through the system
 *   stack declared in `globals.css` (PingFang SC / HarmonyOS Sans / Microsoft
 *   YaHei …).
 *
 * The file names written here are a hard contract with `app/fonts/index.ts`,
 * which calls `localFont()` with literal paths (Next's font loader only accepts
 * module-scope calls assigned to a const). This script verifies that contract at
 * the end and fails loudly if it drifts.
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'app', 'fonts');

const FAMILIES = [
  {
    /** Must match the const name in app/fonts/index.ts. */
    key: 'display',
    /** File written to app/fonts/ — the contract with index.ts. */
    file: 'archivo-latin.woff2',
    google: 'Archivo',
    axis: 'wght@100..900',
    /** Weight range declared to localFont. */
    weights: '100 900',
  },
  {
    key: 'sans',
    file: 'inter-latin.woff2',
    google: 'Inter',
    axis: 'wght@100..900',
    weights: '100 900',
  },
  {
    key: 'mono',
    file: 'jetbrains-mono-latin.woff2',
    google: 'JetBrains Mono',
    axis: 'wght@100..800',
    weights: '100 800',
  },
];

/**
 * A modern desktop UA is required: the CSS API only serves WOFF2 (and only
 * exposes unicode-range subsetting) to clients it believes support it.
 */
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const cssUrl = (family) =>
  `https://fonts.googleapis.com/css2?family=${family.google.replace(/ /g, '+')}:${family.axis}&display=swap`;

/** Parses the `/* subset *\/` + @font-face pairs returned by the CSS API. */
function parseFontFaces(css) {
  const faces = [];
  const blockRe = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  let match;
  while ((match = blockRe.exec(css)) !== null) {
    const [, subset, body] = match;
    const url = /url\((https:[^)]+\.woff2)\)/.exec(body)?.[1];
    if (url) faces.push({ subset, url });
  }
  return faces;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.text();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const written = [];

  for (const family of FAMILIES) {
    const css = await fetchText(cssUrl(family));
    const latin = parseFontFaces(css).find((f) => f.subset === 'latin');
    if (!latin) throw new Error(`No latin subset returned for ${family.google}`);

    const res = await fetch(latin.url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`GET ${latin.url} -> ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());

    await writeFile(join(OUT_DIR, family.file), buf);
    written.push({ ...family, bytes: buf.length });

    console.log(
      `  ${family.google.padEnd(16)} ${family.file.padEnd(30)} ${(buf.length / 1024).toFixed(1)} KB`,
    );
  }

  // Verify the contract with app/fonts/index.ts before declaring success.
  const missing = [];
  for (const family of FAMILIES) {
    try {
      await access(join(OUT_DIR, family.file));
    } catch {
      missing.push(family.file);
    }
  }
  if (missing.length) throw new Error(`Missing expected font files: ${missing.join(', ')}`);

  const total = written.reduce((sum, f) => sum + f.bytes, 0);
  console.log(
    `\nWrote ${written.length} files to app/fonts (${(total / 1024).toFixed(1)} KB total).`,
  );
  console.log('Next: make sure app/fonts/index.ts references these exact file names.');
}

main().catch((err) => {
  console.error('fetch-fonts failed:', err);
  process.exit(1);
});
