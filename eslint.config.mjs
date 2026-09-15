import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    '_build/**',
    'public/**',
    /*
     * Deploy artifacts. The EdgeOne CLI compiles into `.edgeone/` (a full copy
     * of the built site, minified bundles included) and stages uploads in
     * `.tef_dist/`. Both are gitignored — but ESLint does not read .gitignore, so
     * without these two lines `npm run check` reports thousands of findings
     * inside vendor code and the gate never turns green again. A check that can
     * only fail stops being a check.
     */
    '.edgeone/**',
    '.tef_dist/**',
    'next-env.d.ts',
  ]),

  {
    rules: {
      /**
       * The site intentionally renders `<picture>` with plain `<img>` elements:
       * the asset pipeline already produced the exact AVIF/WebP/JPEG widths we
       * serve, and `next/image`'s optimizer is deliberately disabled so the
       * build stays portable to Tencent EdgeOne Pages. `VcImage` and `VcVideo`
       * are the only two places allowed to do this, and they centralise the
       * `alt`, `sizes`, `loading` and aspect-ratio handling that the rule exists
       * to protect.
       */
      '@next/next/no-img-element': 'off',
    },
  },
]);
