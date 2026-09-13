'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { BiOnly } from '@/components/i18n/Bi';
import { brand, contact, primaryNav } from '@/content/site';
import { getLenis } from '@/lib/motion/lenis';
import { MobileMenu } from './MobileMenu';
import { LangToggle } from './LangToggle';
import { useBandTone } from './useBandTone';

const HEADER_SCROLL_THRESHOLD = 80;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  /**
   * The header floats over whatever band is beneath it, so it borrows that
   * band's tone. Without this, a page that opens on a light band renders a
   * light-on-light header — invisible, not just low-contrast.
   */
  const tone = useBandTone(headerRef);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > HEADER_SCROLL_THRESHOLD);

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    getLenis()?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
      getLenis()?.start();
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        ref={headerRef}
        data-tone={tone}
        aria-label="主导航"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 border-b border-transparent ${
          scrolled
            ? 'border-[var(--tone-line)] bg-[var(--tone-bg)]/80 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-8 md:h-[4.5rem]">
          <ArrowLink
            href="/#top"
            variant="ghost"
            noArrow
            ariaLabel="返回 VC 首页"
            className="shrink-0 tracking-[0.08em]"
          >
            {brand.wordmark}
          </ArrowLink>

          <nav aria-label="主导航" className="hidden items-center gap-7 lg:flex xl:gap-9">
            {primaryNav.map((item) => (
              <ArrowLink
                key={item.href}
                href={item.href}
                variant="ghost"
                noArrow
                className="link-underline"
              >
                <BiOnly zh={item.zh} en={item.label} />
              </ArrowLink>
            ))}
            <ArrowLink href="/#contact" variant="outline" noArrow className="ml-2 py-3">
              <BiOnly zh={contact.ctaLabelZh} en={contact.ctaLabel} />
            </ArrowLink>
          </nav>

          <div className="flex items-center gap-3 lg:gap-5">
            <LangToggle />
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
              onClick={() => setMenuOpen((open) => !open)}
              className="type-label link-underline inline-flex min-h-11 items-center lg:hidden"
            >
              {menuOpen ? '关闭' : '菜单'}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? <MobileMenu key="mobile-menu" onClose={() => setMenuOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}
