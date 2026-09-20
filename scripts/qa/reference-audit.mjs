/**
 * Static reference-integrity audit for the site's media chain.
 *
 * This intentionally does not import the Next app, start a server, or execute
 * TypeScript. It only reads content/components/manifest/files and writes a
 * machine-readable report plus a Chinese Markdown report.
 */
import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const WORKS_ROOT = join(ROOT, 'public', 'works');
const REPORT_ROOT = join(ROOT, '_qa-output', 'reference-audit');
const MEDIA_JSON_PATH = join(ROOT, 'content', 'media.json');
const MANIFEST_PATH = join(WORKS_ROOT, '_manifest.json');

const REFERENCE_FILES = [
  join(ROOT, 'content', 'projects.ts'),
  join(ROOT, 'content', 'site.ts'),
  join(ROOT, 'content', 'others.ts'),
];

const IMAGE_EXTENSIONS = new Set(['.avif', '.webp', '.jpg', '.jpeg', '.png']);
const MEDIA_VARIANT_FIELDS = ['webp', 'avif', 'lqip', 'fallback'];
const VIDEO_PATH_FIELDS = ['mp4', 'webm', 'poster', 'posterSrcSet'];

function repoPath(filePath) {
  const value = relative(ROOT, filePath).split(sep).join('/');
  return value || '.';
}

function displayPath(filePath) {
  return repoPath(filePath);
}

function lineNumber(source, offset) {
  let line = 1;
  for (let index = 0; index < offset; index += 1) {
    if (source[index] === '\n') line += 1;
  }
  return line;
}

function isIdentifierStart(char) {
  return Boolean(char) && /[A-Za-z_$]/.test(char);
}

function isIdentifierPart(char) {
  return Boolean(char) && /[A-Za-z0-9_$]/.test(char);
}

function skipTrivia(source, start) {
  let index = start;
  while (index < source.length) {
    if (/\s/.test(source[index])) {
      index += 1;
      continue;
    }
    if (source[index] === '/' && source[index + 1] === '/') {
      const newline = source.indexOf('\n', index + 2);
      index = newline === -1 ? source.length : newline + 1;
      continue;
    }
    if (source[index] === '/' && source[index + 1] === '*') {
      const end = source.indexOf('*/', index + 2);
      index = end === -1 ? source.length : end + 2;
      continue;
    }
    break;
  }
  return index;
}

function readQuotedString(source, start) {
  const quote = source[start];
  if (!['\'', '"', '`'].includes(quote)) return null;

  let value = '';
  let index = start + 1;
  while (index < source.length) {
    const char = source[index];
    if (char === '\\') {
      const next = source[index + 1];
      const escaped = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v' }[next];
      value += escaped ?? next ?? '';
      index += 2;
      continue;
    }
    if (char === quote) return { value, end: index + 1 };
    value += char;
    index += 1;
  }
  return null;
}

/**
 * Finds literal object properties such as `key: 'guge/hero/site_and_meido'`.
 * The small lexer skips comments and strings, avoiding regex hits in prose.
 */
function scanPropertyLiterals(source, propertyNames) {
  const wanted = new Set(propertyNames);
  const found = [];
  let index = 0;

  while (index < source.length) {
    if (source[index] === '/' && source[index + 1] === '/') {
      const newline = source.indexOf('\n', index + 2);
      index = newline === -1 ? source.length : newline + 1;
      continue;
    }
    if (source[index] === '/' && source[index + 1] === '*') {
      const end = source.indexOf('*/', index + 2);
      index = end === -1 ? source.length : end + 2;
      continue;
    }
    if (['\'', '"', '`'].includes(source[index])) {
      const string = readQuotedString(source, index);
      index = string?.end ?? source.length;
      continue;
    }
    if (!isIdentifierStart(source[index])) {
      index += 1;
      continue;
    }

    const propertyStart = index;
    index += 1;
    while (isIdentifierPart(source[index])) index += 1;
    const property = source.slice(propertyStart, index);
    if (!wanted.has(property)) continue;

    let cursor = skipTrivia(source, index);
    if (source[cursor] !== ':') continue;
    cursor = skipTrivia(source, cursor + 1);
    const string = readQuotedString(source, cursor);
    if (!string || string.value.includes('${')) continue;
    found.push({ property, value: string.value, offset: propertyStart });
    index = string.end;
  }

  return found;
}

function findMatchingBrace(source, opening) {
  let depth = 0;
  let index = opening;
  while (index < source.length) {
    if (source[index] === '/' && source[index + 1] === '/') {
      const newline = source.indexOf('\n', index + 2);
      index = newline === -1 ? source.length : newline + 1;
      continue;
    }
    if (source[index] === '/' && source[index + 1] === '*') {
      const end = source.indexOf('*/', index + 2);
      index = end === -1 ? source.length : end + 2;
      continue;
    }
    if (['\'', '"', '`'].includes(source[index])) {
      const string = readQuotedString(source, index);
      index = string?.end ?? source.length;
      continue;
    }
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
    index += 1;
  }
  return -1;
}

function scanVideoRefs(source, filePath) {
  const refs = [];
  const declaration = /\b([A-Za-z_$][\w$]*)\s*:\s*VideoRef\s*=\s*\{/g;
  let match;

  while ((match = declaration.exec(source))) {
    const opening = source.indexOf('{', match.index);
    const closing = findMatchingBrace(source, opening);
    if (closing === -1) continue;
    const body = source.slice(opening + 1, closing);
    const fields = scanPropertyLiterals(body, VIDEO_PATH_FIELDS).map((field) => ({
      ...field,
      offset: opening + 1 + field.offset,
      line: lineNumber(source, opening + 1 + field.offset),
      source: displayPath(filePath),
    }));
    refs.push({
      name: match[1],
      source: displayPath(filePath),
      line: lineNumber(source, match.index),
      fields,
    });
    declaration.lastIndex = closing + 1;
  }
  return refs;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(directory) {
  const files = [];
  let entries = [];
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return files;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(filePath)));
    else files.push(filePath);
  }
  return files;
}

function pathInside(root, filePath) {
  const rootWithSep = root.endsWith(sep) ? root : `${root}${sep}`;
  return filePath === root || filePath.startsWith(rootWithSep);
}

function resolveWorksUrl(urlPath) {
  if (typeof urlPath !== 'string' || !urlPath.startsWith('/works/')) {
    return { error: '不是 /works/ 根路径', filePath: null, relativePath: null };
  }
  const relativePath = urlPath.slice('/works/'.length);
  const filePath = resolve(WORKS_ROOT, relativePath);
  if (!pathInside(WORKS_ROOT, filePath)) {
    return { error: '路径越过 public/works 根目录', filePath: null, relativePath };
  }
  return { error: null, filePath, relativePath: relativePath.split(sep).join('/') };
}

function extractWorksPaths(value) {
  if (typeof value !== 'string') return [];
  return [...value.matchAll(/\/works\/[^\s,'"`]+/g)].map((match) => match[0]);
}

function extractTopLevelJsonKeys(raw) {
  const keys = [];
  let depth = 0;
  let index = 0;
  while (index < raw.length) {
    if (raw[index] === '"') {
      const start = index;
      const string = readQuotedString(raw, index);
      if (!string) break;
      index = string.end;
      let cursor = index;
      while (/\s/.test(raw[cursor] ?? '')) cursor += 1;
      if (depth === 1 && raw[cursor] === ':') {
        keys.push({ key: string.value, offset: start });
      }
      continue;
    }
    if (raw[index] === '{') depth += 1;
    else if (raw[index] === '}') depth -= 1;
    index += 1;
  }
  return keys;
}

function valuesEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function collectMediaFiles(media) {
  const files = new Set();
  for (const entry of Object.values(media)) {
    for (const field of MEDIA_VARIANT_FIELDS) {
      const values = Array.isArray(entry?.[field]) ? entry[field] : [entry?.[field]];
      for (const value of values) if (typeof value === 'string') files.add(value);
    }
  }
  return files;
}

function collectManifestAssetRecords(value, manifestPath, pathParts = []) {
  const records = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => records.push(...collectManifestAssetRecords(item, manifestPath, [...pathParts, index])));
    return records;
  }
  if (!value || typeof value !== 'object') return records;

  for (const [key, child] of Object.entries(value)) {
    const childPath = [...pathParts, key];
    if (['mp4', 'webm', 'poster', 'jpg', 'lqip'].includes(key) && typeof child === 'string') {
      const filePath = resolve(dirname(manifestPath), child);
      records.push({
        field: key,
        value: child,
        jsonPath: childPath.join('.'),
        manifest: displayPath(manifestPath),
        filePath,
        relativePath: pathInside(WORKS_ROOT, filePath) ? repoPath(filePath).replace(/^public\/works\//, '') : null,
      });
    }
    records.push(...collectManifestAssetRecords(child, manifestPath, childPath));
  }
  return records;
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function markdownValue(value) {
  if (value === undefined) return '未定义';
  if (value === null) return 'null';
  return `\`${JSON.stringify(value)}\``;
}

function bulletLines(items, formatter) {
  return items.map((item) => `- ${formatter(item)}`);
}

function findingsOrNone(items, formatter) {
  return items.length === 0 ? ['- 未发现。'] : bulletLines(items, formatter);
}

function buildMarkdown(report) {
  const lines = [
    '# 静态引用完整性核对报告',
    '',
    `- 结论：${report.status === 'pass' ? '通过（没有发现会导致素材链路断裂的错误）' : '失败（发现需要处理的错误）'}`,
    `- 错误数：${report.errorCount}；提示数：${report.warningCount}`,
    '- 执行方式：纯 Node 静态分析；未启动浏览器、未访问服务器、未读取运行时页面。',
    `- 扫描根目录：\`${report.inputs.root}\``,
    '',
    '## 1. 代码引用了但 media.json 没有的 key',
    '',
    `扫描了 ${report.categories.codeReferences.checkedFiles.length} 个文件，共 ${report.categories.codeReferences.referenceCount} 个字面量引用（含 \`key\` 与 \`mediaKey\`）。缺失 ${report.categories.codeReferences.missing.length} 条。`,
    '',
    ...findingsOrNone(report.categories.codeReferences.missing, (item) => `\`${item.key}\`（字段 \`${item.property}\`）— \`${item.source}:${item.line}\`；应在 \`${report.inputs.mediaJson}\` 注册。`),
    '',
    '## 2. media.json 已注册、但 public/works 缺文件的 key',
    '',
    `检查了 ${report.categories.mediaFiles.mediaKeyCount} 个 key 的 webp/avif/jpg/lqip 变体；缺失文件 ${report.categories.mediaFiles.missingFiles.length} 个，整组缺失 ${report.categories.mediaFiles.allMissingKeys.length} 个 key。`,
    '',
    ...findingsOrNone(report.categories.mediaFiles.missingFiles, (item) => `\`${item.key}\` 的 \`${item.field}\`：磁盘缺少 \`${item.expected}\`（注册内容来自 \`${report.inputs.mediaJson}\`，磁盘根为 \`${report.inputs.worksRoot}\`）。`),
    '',
    '## 3. media.json 重复 key',
    '',
    `重复 key 数：${report.categories.duplicateKeys.duplicates.length}。`,
    '',
    ...findingsOrNone(report.categories.duplicateKeys.duplicates, (item) => `\`${item.key}\` 出现 ${item.occurrences.length} 次：${item.occurrences.map((occurrence) => `\`${report.inputs.mediaJson}:${occurrence.line}\``).join('、')}。`),
    '',
    '## 4. _manifest.json 与 content/media.json 不一致',
    '',
    `media.json key 数 ${report.categories.manifestConsistency.mediaKeyCount}；_manifest.json key 数 ${report.categories.manifestConsistency.manifestKeyCount}；key 集合差异 ${report.categories.manifestConsistency.keySetDifferences.length} 条；widths/aspect/bytes 字段差异 ${report.categories.manifestConsistency.fieldMismatches.length} 条。`,
    '',
    ...bulletLines(report.categories.manifestConsistency.keySetDifferences, (item) => `${item.kind === 'onlyMedia' ? '仅 media.json 有' : '仅 _manifest.json 有'}：\`${item.key}\`（\`${report.inputs.mediaJson}\` ↔ \`${report.inputs.manifest}\`）。`),
    ...bulletLines(report.categories.manifestConsistency.fieldMismatches, (item) => `\`${item.key}\` 的 \`${item.field}\` 不一致：media.json=${markdownValue(item.mediaValue)}；_manifest.json=${markdownValue(item.manifestValue)}（比较路径：\`${report.inputs.mediaJson}\` 与 \`${report.inputs.manifest}\`）。`),
    ...(report.categories.manifestConsistency.keySetDifferences.length === 0 && report.categories.manifestConsistency.fieldMismatches.length === 0 ? ['- 未发现。'] : []),
    '',
    '## 5. VideoRef 引用了但文件不存在的视频',
    '',
    `发现 ${report.categories.videos.videoRefCount} 个 VideoRef；检查 ${report.categories.videos.checkedAssetCount} 个视频/海报路径。真实文件缺失 ${report.categories.videos.missingFiles.length} 个；manifest 未登记 ${report.categories.videos.missingManifestRecords.length} 个 mp4/webm；manifest 自己指向的文件缺失 ${report.categories.videos.manifestMissingFiles.length} 个。`,
    '',
    ...bulletLines(report.categories.videos.missingFiles, (item) => `VideoRef \`${item.refName}\` 的 \`${item.field}\`：\`${item.value}\`，实际路径应为 \`${item.expected}\`（来源 \`${item.source}:${item.line}\`）。`),
    ...bulletLines(report.categories.videos.missingManifestRecords, (item) => `VideoRef \`${item.refName}\` 的 \`${item.field}\` 文件存在于 \`${item.expected}\`，但没有在 \`${item.manifestSearch.join('`、`')}\` 的视频 manifest 中找到同路径登记（来源 \`${item.source}:${item.line}\`）。`),
    ...bulletLines(report.categories.videos.manifestMissingFiles, (item) => `视频 manifest \`${item.manifest}\` 的 \`${item.jsonPath}\` 指向 \`${item.value}\`，但磁盘缺少 \`${item.expected}\`。`),
    ...(report.categories.videos.missingFiles.length === 0 && report.categories.videos.missingManifestRecords.length === 0 && report.categories.videos.manifestMissingFiles.length === 0 ? ['- 未发现。'] : []),
    '',
    '## 6. 没有被任何 media key 引用的媒体文件（孤儿文件）',
    '',
    `候选图片文件 ${report.categories.orphans.candidateImageFileCount} 个；严格按 media.json key 变体列表未登记 ${report.categories.orphans.unregisteredByMediaKey.length} 个；实际孤儿 ${report.categories.orphans.practicalOrphans.length} 个。目录：${report.categories.orphans.directories.length ? report.categories.orphans.directories.map((directory) => `\`${directory}\``).join('、') : '无'}。`,
    '',
    '前 20 个严格未登记文件：',
    ...bulletLines(report.categories.orphans.unregisteredByMediaKey.slice(0, 20), (item) => `\`${item.path}\` — ${item.reason}`),
    '',
    '其中，视频海报由 VideoRef 直接引用，`poster-lqip.jpg` 由视频 manifest 作为 LQIP 支持文件保留；这些是未进入图片 media key 列表的正常辅助素材，不判为实际孤儿。',
    '',
    '## 结论与判定',
    '',
    report.errorCount === 0
      ? '第 1–5 类没有发现会导致渲染破图、空白或视频加载失败的错误；第 6 类的严格未登记项均能由 VideoRef 或视频 manifest 解释，当前没有实际孤儿。'
      : '请优先处理第 1–5 类的错误；它们代表代码、注册表、磁盘或视频登记之间存在可验证的不一致。',
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const existingReferenceFiles = (await Promise.all(REFERENCE_FILES.map(async (filePath) => ({
    filePath,
    present: await exists(filePath),
  })))).filter((item) => item.present);
  const componentFiles = (await walkFiles(join(ROOT, 'components'))).filter((filePath) => extname(filePath) === '.tsx');
  const sourceFiles = [...existingReferenceFiles.map((item) => item.filePath), ...componentFiles].sort();
  const sourceEntries = await Promise.all(sourceFiles.map(async (filePath) => ({
    filePath,
    source: await readFile(filePath, 'utf8'),
  })));

  const codeReferences = [];
  const videoRefs = [];
  for (const entry of sourceEntries) {
    for (const reference of scanPropertyLiterals(entry.source, ['key', 'mediaKey'])) {
      codeReferences.push({
        ...reference,
        source: displayPath(entry.filePath),
        line: lineNumber(entry.source, reference.offset),
      });
    }
    videoRefs.push(...scanVideoRefs(entry.source, entry.filePath));
  }

  const mediaRaw = await readFile(MEDIA_JSON_PATH, 'utf8');
  const manifestRaw = await readFile(MANIFEST_PATH, 'utf8');
  const media = JSON.parse(mediaRaw);
  const manifest = JSON.parse(manifestRaw);

  const rawMediaKeys = extractTopLevelJsonKeys(mediaRaw);
  const duplicateMap = new Map();
  for (const item of rawMediaKeys) {
    const list = duplicateMap.get(item.key) ?? [];
    list.push({ line: lineNumber(mediaRaw, item.offset) });
    duplicateMap.set(item.key, list);
  }
  const duplicates = [...duplicateMap.entries()]
    .filter(([, occurrences]) => occurrences.length > 1)
    .map(([key, occurrences]) => ({ key, occurrences }));

  const mediaKeys = Object.keys(media);
  const manifestKeys = Object.keys(manifest);
  const mediaKeySet = new Set(mediaKeys);
  const manifestKeySet = new Set(manifestKeys);
  const keySetDifferences = [
    ...mediaKeys.filter((key) => !manifestKeySet.has(key)).map((key) => ({ kind: 'onlyMedia', key })),
    ...manifestKeys.filter((key) => !mediaKeySet.has(key)).map((key) => ({ kind: 'onlyManifest', key })),
  ];
  const fieldMismatches = [];
  for (const key of mediaKeys) {
    if (!manifest[key]) continue;
    const fields = [
      ['widths', media[key].widths, manifest[key].widths],
      ['aspect', media[key].aspect, manifest[key].aspect],
      ['original.bytes', media[key].original?.bytes, manifest[key].original?.bytes],
    ];
    for (const [field, mediaValue, manifestValue] of fields) {
      if (!valuesEqual(mediaValue, manifestValue)) fieldMismatches.push({ key, field, mediaValue, manifestValue });
    }
  }

  const missingMediaFiles = [];
  const allMissingMediaKeys = [];
  for (const key of mediaKeys) {
    const entry = media[key];
    const expected = [];
    for (const field of MEDIA_VARIANT_FIELDS) {
      for (const value of asArray(entry?.[field])) {
        if (typeof value !== 'string') continue;
        const filePath = join(WORKS_ROOT, value);
        expected.push({ field, value, filePath });
        if (!(await exists(filePath))) {
          missingMediaFiles.push({ key, field, expected: displayPath(filePath), registeredValue: value });
        }
      }
    }
    if (expected.length > 0 && expected.every((item) => !existsSyncCached(item.filePath))) {
      allMissingMediaKeys.push(key);
    }
  }

  const videoManifestPaths = (await walkFiles(WORKS_ROOT)).filter((filePath) => basename(filePath) === '_video-manifest.json');
  const videoManifestRecords = [];
  const manifestParseErrors = [];
  for (const manifestPath of videoManifestPaths) {
    try {
      const value = JSON.parse(await readFile(manifestPath, 'utf8'));
      videoManifestRecords.push(...collectManifestAssetRecords(value, manifestPath));
    } catch (error) {
      manifestParseErrors.push({ manifest: displayPath(manifestPath), message: error.message });
    }
  }

  const videoAssets = [];
  for (const videoRef of videoRefs) {
    for (const field of videoRef.fields) {
      const values = field.property === 'posterSrcSet' ? extractWorksPaths(field.value) : [field.value];
      for (const value of values) {
        videoAssets.push({
          refName: videoRef.name,
          field: field.property,
          value,
          source: videoRef.source,
          line: field.line,
        });
      }
    }
  }

  const missingVideoFiles = [];
  const missingVideoManifestRecords = [];
  for (const asset of videoAssets) {
    const resolved = resolveWorksUrl(asset.value);
    if (resolved.error || !(await exists(resolved.filePath))) {
      missingVideoFiles.push({
        ...asset,
        expected: resolved.filePath ? displayPath(resolved.filePath) : `${displayPath(WORKS_ROOT)}/${asset.value}`,
        reason: resolved.error ?? '文件不存在',
      });
      continue;
    }
    if (['mp4', 'webm'].includes(asset.field)) {
      const records = videoManifestRecords.filter((record) => ['mp4', 'webm'].includes(record.field) && record.filePath === resolved.filePath);
      if (records.length === 0) {
        missingVideoManifestRecords.push({
          ...asset,
          expected: displayPath(resolved.filePath),
          manifestSearch: videoManifestPaths.map(displayPath),
        });
      }
    }
  }

  const manifestMissingFiles = [];
  for (const record of videoManifestRecords.filter((item) => ['mp4', 'webm'].includes(item.field))) {
    if (!(await exists(record.filePath))) {
      manifestMissingFiles.push({ ...record, expected: displayPath(record.filePath) });
    }
  }

  const registeredMediaFiles = collectMediaFiles(media);
  const videoReferencedImageFiles = new Set();
  for (const asset of videoAssets) {
    const resolved = resolveWorksUrl(asset.value);
    if (resolved.filePath && IMAGE_EXTENSIONS.has(extname(resolved.filePath).toLowerCase())) {
      videoReferencedImageFiles.add(resolved.relativePath);
    }
  }
  const manifestSupportFiles = new Set(
    videoManifestRecords
      .filter((record) => ['poster', 'jpg', 'lqip'].includes(record.field) && record.relativePath)
      .map((record) => record.relativePath),
  );
  const imageFiles = (await walkFiles(WORKS_ROOT))
    .filter((filePath) => IMAGE_EXTENSIONS.has(extname(filePath).toLowerCase()))
    .map((filePath) => repoPath(filePath).replace(/^public\/works\//, ''))
    .sort();
  const unregisteredByMediaKey = imageFiles
    .filter((filePath) => !registeredMediaFiles.has(filePath))
    .map((filePath) => ({
      path: `public/works/${filePath}`,
      reason: videoReferencedImageFiles.has(filePath)
        ? '被 VideoRef 直接引用，但不是 media.json key 变体。'
        : manifestSupportFiles.has(filePath)
          ? '被 _video-manifest.json 作为视频辅助素材引用，但不是 media.json key 变体。'
          : '没有在 media.json 的 webp/avif/lqip/fallback 列表中出现。',
      referencedByVideo: videoReferencedImageFiles.has(filePath),
      referencedByVideoManifest: manifestSupportFiles.has(filePath),
    }));
  const practicalOrphans = unregisteredByMediaKey.filter((item) => !item.referencedByVideo && !item.referencedByVideoManifest);
  const orphanDirectories = [...new Set(unregisteredByMediaKey.map((item) => dirname(item.path)))].sort();

  const codeMissing = codeReferences.filter((reference) => !mediaKeySet.has(reference.value)).map((reference) => ({
    key: reference.value,
    property: reference.property,
    source: reference.source,
    line: reference.line,
  }));
  const mediaParsingErrors = [];
  if (!media || typeof media !== 'object' || Array.isArray(media)) mediaParsingErrors.push('content/media.json 顶层不是对象');
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) mediaParsingErrors.push('public/works/_manifest.json 顶层不是对象');

  const categories = {
    codeReferences: {
      checkedFiles: sourceEntries.map((entry) => displayPath(entry.filePath)),
      referenceCount: codeReferences.length,
      uniqueReferenceCount: new Set(codeReferences.map((reference) => reference.value)).size,
      missing: codeMissing,
    },
    mediaFiles: {
      mediaKeyCount: mediaKeys.length,
      missingFiles: missingMediaFiles,
      allMissingKeys: allMissingMediaKeys,
    },
    duplicateKeys: { duplicates },
    manifestConsistency: {
      mediaKeyCount: mediaKeys.length,
      manifestKeyCount: manifestKeys.length,
      keySetDifferences,
      fieldMismatches,
    },
    videos: {
      videoRefCount: videoRefs.length,
      checkedAssetCount: videoAssets.length,
      refs: videoRefs.map((ref) => ({ name: ref.name, source: ref.source, line: ref.line })),
      missingFiles: missingVideoFiles,
      missingManifestRecords: missingVideoManifestRecords,
      manifestMissingFiles,
      manifestParseErrors,
      manifests: videoManifestPaths.map(displayPath),
    },
    orphans: {
      candidateImageFileCount: imageFiles.length,
      registeredMediaVariantCount: registeredMediaFiles.size,
      unregisteredByMediaKey,
      practicalOrphans,
      directories: orphanDirectories,
    },
  };

  const errorCount = codeMissing.length
    + missingMediaFiles.length
    + duplicates.length
    + keySetDifferences.length
    + fieldMismatches.length
    + missingVideoFiles.length
    + missingVideoManifestRecords.length
    + manifestMissingFiles.length
    + manifestParseErrors.length
    + mediaParsingErrors.length
    + practicalOrphans.length;
  const warningCount = unregisteredByMediaKey.length - practicalOrphans.length;
  const report = {
    version: 1,
    status: errorCount === 0 ? 'pass' : 'fail',
    errorCount,
    warningCount,
    inputs: {
      root: basename(ROOT),
      mediaJson: repoPath(MEDIA_JSON_PATH),
      manifest: repoPath(MANIFEST_PATH),
      worksRoot: repoPath(WORKS_ROOT),
    },
    categories,
    parseErrors: mediaParsingErrors,
  };

  await mkdir(REPORT_ROOT, { recursive: true });
  await writeFile(join(REPORT_ROOT, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(join(REPORT_ROOT, 'report.md'), buildMarkdown(report));
  console.log(`reference-audit: ${report.status}; errors=${report.errorCount}; warnings=${report.warningCount}`);
  console.log(`report.json: ${displayPath(join(REPORT_ROOT, 'report.json'))}`);
  console.log(`report.md: ${displayPath(join(REPORT_ROOT, 'report.md'))}`);
  process.exitCode = report.errorCount === 0 ? 0 : 1;
}

// The media-entry loop needs the result of an async exists() check after it has
// already collected the missing files. This tiny cache is populated lazily by
// the synchronous filesystem check only for the all-missing classification.
import { existsSync } from 'node:fs';
function existsSyncCached(filePath) {
  return existsSync(filePath);
}

main().catch((error) => {
  console.error('reference-audit failed:', error);
  process.exitCode = 1;
});
