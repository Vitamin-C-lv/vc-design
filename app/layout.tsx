import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/lib/fonts';
import { brand, seo } from '@/content/site';
import { SmoothScrollProvider } from '@/components/motion/SmoothScrollProvider';
import { RouteScrollHandler } from '@/components/motion/RouteScrollHandler';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: {
    default: seo.title,
    template: seo.titleTemplate,
  },
  description: seo.description,
  keywords: [...seo.keywords],
  alternates: { canonical: '/' },
  applicationName: `${brand.name} / ${brand.nameZh}`,
  authors: [{ name: `${brand.name} / ${brand.nameZh}` }],
  creator: `${brand.name} / ${brand.nameZh}`,
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: 'website',
    siteName: `${brand.name} / ${brand.nameZh}`,
    title: seo.title,
    description: seo.description,
    url: '/',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/brand/icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Never block zoom: a design site is looked at closely, and the brief requires
  // the mobile experience to stay genuinely usable rather than merely fitting.
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0a0a09',
  colorScheme: 'dark',
};

/**
 * Runs *before first paint*. Three jobs, none of which may flash:
 *
 * 1. Marks the document as scripted. The scroll-reveal CSS only hides elements
 *    while `data-js="on"` is present, so if this script never runs — scripting
 *    disabled, a proxy stripped it, a bundle failed — the entire site renders in
 *    its fully visible resting state instead of as a blank page of zero-opacity
 *    sections.
 * 2. Restores the visitor's language choice onto `<html data-lang>`. The markup
 *    already ships `data-lang="zh"` (the primary audience), and CSS hides the
 *    other language's slots, so without this the page would paint Chinese and
 *    then visibly snap to English.
 * 3. Keeps `<html lang>` in step with that choice. `data-lang` only drives CSS;
 *    assistive technology and search engines read `lang`, so leaving it at
 *    `zh-CN` meant an English-mode page announced itself as Chinese.
 *
 * Deliberately inline, synchronous and tiny: any async or bundled version would
 * reintroduce the flash it exists to prevent.
 */
const BOOT_SCRIPT = `(function(){try{var d=document.documentElement;d.dataset.js='on';var l=localStorage.getItem('vc-lang');if(l==='en'||l==='zh'){d.dataset.lang=l;d.lang=l==='en'?'en':'zh-CN';}}catch(e){document.documentElement.dataset.js='on';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-lang="zh" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="type-label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--color-bone)] focus:px-4 focus:py-3 focus:text-[var(--color-ink)]"
        >
          跳到主要内容
        </a>
        <SmoothScrollProvider>
          <RouteScrollHandler />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
