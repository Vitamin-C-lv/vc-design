import type { NextConfig } from 'next';

/**
 * Deployment target is Tencent Cloud EdgeOne Pages (+ a custom domain behind
 * mainland-China ICP filing). Nothing here may depend on Vercel-only features:
 *
 * - no `@vercel/*` packages, no Vercel Image Optimization, no ISR dependencies
 *   beyond what a standard Node/static host provides;
 * - every route is either statically prerendered or plain RSC — no edge
 *   middleware, no server actions with platform storage.
 *
 * `images.unoptimized` is deliberate. All project imagery is pre-optimized by
 * the asset pipeline (AVIF + WebP + JPEG at five widths, see README → Assets)
 * and rendered through our own `<picture>` component, so the built-in
 * `/_next/image` endpoint is never used and the site stays portable to any
 * static host.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  // Keep the build honest: a type error must fail the build.
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
