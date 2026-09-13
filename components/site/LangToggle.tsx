'use client';

import { useSyncExternalStore } from 'react';

export type Lang = 'zh' | 'en';

const STORAGE_KEY = 'vc-lang';
const CHANGE_EVENT = 'vc-lang-change';

/**
 * Language switch.
 *
 * The preference lives in three places, in order of precedence:
 *
 * 1. `<html data-lang>` — set **before first paint** by the inline script in
 *    `app/layout.tsx`, read back from `localStorage`. Doing it there rather than
 *    here is what prevents a flash of the wrong language.
 * 2. `localStorage` — so the choice survives navigation and revisits.
 * 3. The `<html>` default, which is `zh`: the primary audience is Chinese, and
 *    with scripting disabled the site still reads correctly.
 *
 * The DOM attribute is genuine **external state**, so it is read through
 * `useSyncExternalStore` rather than mirrored into `useState` inside an effect.
 * That keeps React and the DOM from ever disagreeing, avoids a cascading render
 * on mount, and — because the write lives in a module-scope function — avoids
 * mutating a global from inside the component body.
 *
 * Flipping the attribute is the entire switch: see `components/i18n/Bi.tsx` for
 * why no React state is involved in the content itself.
 */
function readLang(): Lang {
  return document.documentElement.dataset.lang === 'en' ? 'en' : 'zh';
}

/** Server render and the pre-hydration snapshot both default to Chinese. */
function readServerLang(): Lang {
  return 'zh';
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function applyLang(next: Lang): void {
  document.documentElement.dataset.lang = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* Private mode / storage disabled: the switch still works for this page. */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function LangToggle({ className }: { className?: string }) {
  const lang = useSyncExternalStore(subscribe, readLang, readServerLang);

  return (
    <div
      className={className}
      role="group"
      aria-label="切换语言 / Switch language"
      data-lang-toggle=""
    >
      {(['zh', 'en'] as const).map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => applyLang(code)}
            aria-pressed={active}
            className="type-label-sm inline-flex min-h-9 items-center px-1.5 transition-opacity duration-300"
            style={{ opacity: active ? 1 : 0.45 }}
          >
            {code === 'zh' ? '中文' : 'EN'}
          </button>
        );
      })}
    </div>
  );
}

export { STORAGE_KEY as LANG_STORAGE_KEY };
