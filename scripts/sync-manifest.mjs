/**
 * Copies the image pipeline manifest produced by the asset build step
 * (`public/works/_manifest.json`) into `content/media.json`, where it can be
 * statically imported by `lib/media.ts` and type-checked.
 *
 * Usage: node scripts/sync-manifest.mjs
 *
 * The asset pipeline is documented in README.md → "Assets". If the manifest is
 * missing the script exits 0 with a warning so that `npm run build` still works
 * on a checkout that has not run the asset step yet.
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'public', 'works', '_manifest.json');
const DEST = join(ROOT, 'content', 'media.json');

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(SRC))) {
    console.warn(`[sync-manifest] ${SRC} not found — keeping existing content/media.json.`);
    return;
  }
  const raw = await readFile(SRC, 'utf8');
  const parsed = JSON.parse(raw);
  await writeFile(DEST, `${JSON.stringify(parsed, null, 2)}\n`);
  console.log(`[sync-manifest] ${Object.keys(parsed).length} entries -> content/media.json`);
}

main().catch((err) => {
  console.error('[sync-manifest] failed:', err);
  process.exit(1);
});
