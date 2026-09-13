/**
 * 回归探针：守住“逐行揭示的标题把拉丁单词从中间切断”以及由此产生的换行/溢出问题。
 *
 * 案例页用 h1 里 Bi 的隐藏另一语言槽位保存完整 titleZh；切口必须对着这个
 * 原字符串验，因为只把已拆开的行互相拼接只能发现丢字，发现不了
 * `观潮 Dail` / `y Brief` 这种字都还在、但单词已被切断的回归。
 *
 * Run (server must be up): node scripts/qa/verify-headline.mjs
 * Negative control: node scripts/qa/verify-headline.mjs --self-test
 * Override the target with BASE=http://127.0.0.1:3000
 */
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

// 仓库根 = 本文件的 ../../ —— 不写死绝对路径，换机器后证据仍落在本仓库。
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const OUT = ROOT + '_qa-output/headline';
const LAUNCH = {
  executablePath: process.env.CHROMIUM || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
};

const CASE_ROUTES = ['/work/guge', '/work/lihuahua', '/work/guanchao', '/work/qinghua-zaojing'];
const CASE_VIEWPORTS = [1440, 1128];
const HOME_VIEWPORTS = [390, 768, 1024, 1280, 1440, 1728];
const EXPECTED_HOME = ['guge', 'lihuahua', 'guanchao', 'qinghua-zaojing'];
const CLOSING_PUNCTUATION = /^[。，、！？；：）」』】》]/;
const LATIN_LETTER = /^[A-Za-z]$/;

const failures = [];
const assert = (ok, label, detail = '') => {
  console.log(`${ok ? '  ✓' : '  ✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
};

const withoutWhitespace = (value) => [...value].filter((char) => !/\s/.test(char)).join('');

/**
 * Return the raw-string boundary corresponding to an offset in the
 * whitespace-stripped original. Keeping the raw whitespace matters: a valid
 * cut after “Daily” lands before the source space, while a bad cut after “Dail”
 * lands immediately before “y”.
 */
function rawBoundaryForNormalizedOffset(original, normalizedOffset) {
  let seen = 0;
  for (let index = 0; index < original.length; index += 1) {
    if (seen === normalizedOffset) return index;
    if (!/\s/.test(original[index])) seen += 1;
  }
  return original.length;
}

/**
 * Shared checker for the exact regression signature. It is intentionally pure
 * so --self-test can feed it the old broken output without opening Chromium.
 */
export function checkHeadlineCuts(lines, original) {
  const normalizedOriginal = withoutWhitespace(original.trim());
  const normalizedLines = lines.map((line) => withoutWhitespace(line.trim()));
  const rejoined = normalizedLines.join('');
  const cuts = [];
  let normalizedOffset = 0;

  for (let index = 0; index < normalizedLines.length - 1; index += 1) {
    normalizedOffset += normalizedLines[index].length;
    const rawOriginal = original.trim();
    const rawBoundary = rawBoundaryForNormalizedOffset(rawOriginal, normalizedOffset);
    const left = rawOriginal[rawBoundary - 1] ?? '';
    const right = rawOriginal[rawBoundary] ?? '';
    const cutsInsideLatinWord = LATIN_LETTER.test(left) && LATIN_LETTER.test(right);
    cuts.push({
      afterLine: index + 1,
      normalizedOffset,
      rawBoundary,
      left,
      right,
      cutsInsideLatinWord,
    });
  }

  return {
    rejoinedMatches: rejoined === normalizedOriginal,
    normalizedOriginal,
    normalizedLines,
    cuts,
    latinWordCuts: cuts.filter((cut) => cut.cutsInsideLatinWord),
    startsWithClosingPunctuation: lines
      .map((line, index) => ({ index: index + 1, text: line.trimStart() }))
      .filter(({ text }) => CLOSING_PUNCTUATION.test(text)),
  };
}

function runSelfTest() {
  console.log('[self-test] 切口检查器负对照');
  const bad = checkHeadlineCuts(['观潮 Dail', 'y Brief'], '观潮 Daily Brief');
  const good = checkHeadlineCuts(['观潮 Daily', 'Brief'], '观潮 Daily Brief');
  const badCaught = bad.latinWordCuts.length === 1;
  const goodAccepted = good.latinWordCuts.length === 0;
  assert(badCaught, '修复前坏输出被判为拉丁单词内部切口', JSON.stringify(bad.latinWordCuts));
  assert(goodAccepted, '合法的空格切口不被误判', JSON.stringify(good.cuts));
  const ok = badCaught && goodAccepted;
  console.log(ok ? '✅ self-test 通过：检查器确实能抓到该 bug' : '❌ self-test 失败');
  process.exit(ok ? 0 : 1);
}

async function inspectCase(page, route, viewport) {
  return page.evaluate(({ route, viewport }) => {
    const h1 = document.querySelector('h1');
    const zhSlot = h1?.querySelector(':scope > [data-lang-zh]');
    const titleGroup = zhSlot?.querySelector(':scope > .block');
    const truthNode = h1?.querySelector(':scope > [data-lang-en] .type-label-sm');
    const lineNodes = titleGroup
      ? [...titleGroup.children]
          .map((child) => {
            if (child.matches('span.block')) return child;
            return child.querySelector('[data-reveal-mask] > span.block, span.block');
          })
          .filter(Boolean)
      : [];

    const lines = lineNodes.map((element, index) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(element);
      const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
      const rows = [];
      for (const rect of rects) {
        const row = rows.find((candidate) => Math.abs(candidate.top - rect.top) < 1);
        if (row) {
          row.left = Math.min(row.left, rect.left);
          row.right = Math.max(row.right, rect.right);
          row.bottom = Math.max(row.bottom, rect.bottom);
        } else {
          rows.push({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right });
        }
      }
      return {
        index: index + 1,
        text: element.textContent?.trim() ?? '',
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        visualLines: rows.length,
        width: rows.length ? Math.max(...rows.map((row) => row.right - row.left)) : 0,
        elementHeight: box.height,
      };
    });

    return {
      route,
      viewport: { width: viewport, height: 900 },
      originalTitle: truthNode?.textContent?.trim() ?? '',
      lines,
      structure: {
        h1Found: Boolean(h1),
        truthFound: Boolean(truthNode),
        lineCount: lines.length,
      },
    };
  }, { route, viewport });
}

async function inspectHome(page, viewport) {
  return page.evaluate(({ viewport, expected }) => {
    const byHref = new Map();
    for (const article of document.querySelectorAll('article')) {
      const link = article.querySelector('a[href^="/work/"]');
      if (!link) continue;
      const href = link.getAttribute('href') ?? '';
      if (!byHref.has(href)) byHref.set(href, article);
    }

    const projects = expected.map((slug) => {
      const article = byHref.get(`/work/${slug}`);
      const heading = article?.querySelector('[role="heading"]');
      const container = heading?.parentElement;
      const lines = heading
        ? [...heading.querySelectorAll('[data-lang-zh].type-xl')]
            .filter((element) => getComputedStyle(element).display !== 'none')
            .map((element, index) => {
              const style = getComputedStyle(element);
              const box = element.getBoundingClientRect();
              const range = document.createRange();
              range.selectNodeContents(element);
              const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
              const rows = [];
              for (const rect of rects) {
                const row = rows.find((candidate) => Math.abs(candidate.top - rect.top) < 1);
                if (row) {
                  row.left = Math.min(row.left, rect.left);
                  row.right = Math.max(row.right, rect.right);
                  row.bottom = Math.max(row.bottom, rect.bottom);
                } else {
                  rows.push({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right });
                }
              }
              return {
                index: index + 1,
                text: element.textContent?.trim() ?? '',
                fontSize: Number.parseFloat(style.fontSize),
                lineHeight: Number.parseFloat(style.lineHeight),
                visualLines: rows.length,
                width: rows.length ? Math.max(...rows.map((row) => row.right - row.left)) : 0,
                elementHeight: box.height,
                containerWidth: container?.getBoundingClientRect().width ?? 0,
              };
            })
        : [];
      return {
        slug,
        href: `/work/${slug}`,
        found: Boolean(article),
        headingFound: Boolean(heading),
        containerType: container ? getComputedStyle(container).containerType : '',
        containerWidth: container?.getBoundingClientRect().width ?? 0,
        lines,
      };
    });
    return { viewport: { width: viewport, height: 900 }, projects };
  }, { viewport, expected: EXPECTED_HOME });
}

async function waitForFonts(page) {
  await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
  await page.waitForTimeout(250);
}

async function runBrowserChecks() {
  const browser = await chromium.launch(LAUNCH);
  const result = { base: BASE, generatedAt: new Date().toISOString(), cases: [], home: [] };
  try {
    for (const route of CASE_ROUTES) {
      for (const width of CASE_VIEWPORTS) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'zh-CN' });
        const page = await context.newPage();
        try {
          await page.goto(BASE + route, { waitUntil: 'load' });
          await page.waitForLoadState('networkidle').catch(() => {});
          await waitForFonts(page);
          const report = await inspectCase(page, route, width);
          result.cases.push(report);

          assert(report.structure.h1Found, `${route}@${width} h1 存在`);
          assert(report.structure.truthFound, `${route}@${width} 原始 titleZh 存在于隐藏槽位`);
          assert(report.lines.length > 0, `${route}@${width} 找到预切分标题行`, `实际 ${report.lines.length} 行`);

          const cutCheck = checkHeadlineCuts(report.lines.map((line) => line.text), report.originalTitle);
          assert(
            cutCheck.rejoinedMatches,
            `${route}@${width} 标题行拼回原始标题`,
            `行=${JSON.stringify(cutCheck.normalizedLines)} 原=${cutCheck.normalizedOriginal}`,
          );
          assert(
            cutCheck.latinWordCuts.length === 0,
            `${route}@${width} 切口不在拉丁单词内部`,
            cutCheck.latinWordCuts.map((cut) => `第${cut.afterLine}行后 ${cut.left}|${cut.right}`).join(', ') || '0 个',
          );
          for (const line of report.lines) {
            assert(
              !CLOSING_PUNCTUATION.test(line.text.trimStart()),
              `${route}@${width} 第${line.index}行不以中文收尾标点开头`,
              `「${line.text}」`,
            );
            assert(
              line.visualLines === 1,
              `${route}@${width} 第${line.index}行只有一视觉行`,
              `视觉行数=${line.visualLines}`,
            );
            assert(
              line.elementHeight <= line.lineHeight * 1.35,
              `${route}@${width} 第${line.index}行高度合规`,
              `高度=${round(line.elementHeight)}px 上限=${round(line.lineHeight * 1.35)}px`,
            );
          }
        } catch (error) {
          assert(false, `${route}@${width} 页面检查未完成`, error instanceof Error ? error.message : String(error));
        } finally {
          await context.close();
        }
      }
    }

    for (const width of HOME_VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'zh-CN' });
      const page = await context.newPage();
      try {
        await page.goto(BASE + '/', { waitUntil: 'load' });
        await page.waitForLoadState('networkidle').catch(() => {});
        await waitForFonts(page);
        const report = await inspectHome(page, width);
        result.home.push(report);
        for (const project of report.projects) {
          assert(project.found, `首页 ${width}px ${project.slug} 旗舰区块存在`);
          assert(project.headingFound, `首页 ${width}px ${project.slug} 标题存在`);
          assert(
            project.containerType.includes('inline-size'),
            `首页 ${width}px ${project.slug} 标题父容器是 inline-size container`,
            `container-type=${project.containerType || '(空)'}`,
          );
          assert(project.lines.length > 0, `首页 ${width}px ${project.slug} 找到标题行`, `实际 ${project.lines.length} 行`);
          for (const line of project.lines) {
            assert(
              line.visualLines === 1,
              `首页 ${width}px ${project.slug} 第${line.index}行只有一视觉行`,
              `文字「${line.text}」视觉行数=${line.visualLines}`,
            );
            assert(
              line.width <= line.containerWidth + 0.5,
              `首页 ${width}px ${project.slug} 第${line.index}行不超容器`,
              `行宽=${round(line.width)}px 容器=${round(line.containerWidth)}px`,
            );
          }
        }
      } catch (error) {
        assert(false, `首页 ${width}px 页面检查未完成`, error instanceof Error ? error.message : String(error));
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  return result;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain && process.argv.includes('--self-test')) runSelfTest();

if (isMain) {
  await mkdir(OUT, { recursive: true });
  try {
    const result = await runBrowserChecks();
    result.failures = failures;
    await writeFile(`${OUT}/results.json`, JSON.stringify(result, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.stack || error.message : String(error);
    failures.push(`探针运行失败 — ${message}`);
    await writeFile(
      `${OUT}/results.json`,
      JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), cases: [], home: [], failures }, null, 2),
    );
  }

  console.log(`\n${failures.length === 0 ? '✅ 全部通过' : `❌ ${failures.length} 项未通过`}`);
  failures.forEach((failure) => console.log(`   - ${failure}`));
  process.exit(failures.length === 0 ? 0 : 1);
}
