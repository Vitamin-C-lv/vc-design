'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { BiOnly } from '@/components/i18n/Bi';
import { brand, contact, primaryNav } from '@/content/site';
import { getLenis } from '@/lib/motion/lenis';
import { readIntroState, whenIntroDone } from '@/lib/motion/introGate';
import { gsap, motionAllowed } from '@/lib/motion/gsap';
import { useIsomorphicLayoutEffect } from '@/lib/motion/useGsap';
import { MobileMenu } from './MobileMenu';
import { LangToggle } from './LangToggle';
import { useBandTone } from './useBandTone';

const HEADER_SCROLL_THRESHOLD = 80;

/**
 * How long after the opening hands over the header is allowed to arrive.
 *
 * The opening is opaque and full-screen, so the header has always been sitting
 * behind it at full opacity: the moment the layer faded, the whole page —
 * navigation included — was simply there. The hand-over is supposed to be the
 * wordmark's, so the header now waits, and it is the last thing to come in
 * rather than the first.
 */
const HEADER_ARRIVAL_DELAY = 0.45;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [arrived, setArrived] = useState(false);
  /** Read once at mount: the opening has not been dismissed yet at that point. */
  const [openingPlayed] = useState(() => readIntroState() === 'playing');
  const headerRef = useRef<HTMLElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  /**
   * The header floats over whatever band is beneath it, so it borrows that
   * band's tone. Without this, a page that opens on a light band renders a
   * light-on-light header — invisible, not just low-contrast.
   */
  const tone = useBandTone(headerRef);

  useEffect(
    () =>
      // Fires on the hand-over when an opening is playing, and on the next
      // frame when there is nothing to wait for (another route, or a visitor
      // who has already seen it) — so the header keeps its ordinary entrance
      // everywhere except behind the opening.
      whenIntroDone(() => setArrived(true)),
    [],
  );

  /*
   * The arrival is a GSAP tween, not a Motion one.
   *
   * `motion.header` with a conditional `animate` plus `transition.delay` left
   * the header at `opacity: 0` in a real browser: the bar was measured four
   * seconds after load, long past its own 1.2s entrance, still invisible — the
   * navigation was simply gone. Motion also re-evaluates that transition on
   * every re-render, and this bar re-renders on scroll (the tone and the
   * scrolled state both live here), which is the likely mechanism. GSAP is
   * already the tool for entrance work on this site, it does not restart on
   * re-render, and it is what the rest of the hand-over is timed against.
   */
  useIsomorphicLayoutEffect(() => {
    const node = headerRef.current;
    if (!node || !arrived) return;

    // Without animation the bar still has to exist: the CSS below reveals it
    // via `[data-arrived]`, so this branch only skips the movement.
    if (!motionAllowed()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { opacity: 0, y: -18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          delay: openingPlayed ? HEADER_ARRIVAL_DELAY : 0,
          ease: 'power3.out',
        },
      );
    }, node);

    return () => ctx.revert();
  }, [arrived, openingPlayed]);

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
      {/*
        The bar starts hidden and is revealed by `[data-arrived]` — see the
        `html[data-js='on']` rules in globals.css. That keeps the SSR paint from
        flashing a fully visible header for one frame before the arrival effect
        runs, and it is also what makes the element visible again when animation
        is not allowed at all.
      */}
      <noscript>
        <style>{`[data-site-header]{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/*
        Once scrolled, the header is a paper band, not glass.

        The frosted version was right for a page of body text. It stopped being
        right the moment the site's language became 200px display type: a
        half-transparent blurred strip over a giant letterform does not read as
        a pane, it reads as grey print showing through the paper — the C of the
        hero was legible *through* the navigation.

        It is now fully opaque, not "nearly". At 95% the residues are small but
        measurable: with `BUILD.` crossing under the bar, the darkest pixel in
        the band sat 13 levels below the paper it was printed on, which is
        exactly the grey ghost of a letterform the brief rules out. A solid band
        with a hairline under it is how a printed contents strip behaves, and
        the type behind it leaves no trace at all.
      */}
      <header
        ref={headerRef}
        data-site-header
        data-arrived={arrived ? '' : undefined}
        data-tone={tone}
        aria-label="主导航"
        className={`fixed inset-x-0 top-0 z-50 border-b ${
          scrolled
            ? 'border-[var(--tone-line)] bg-[var(--tone-bg)]'
            : 'border-transparent bg-transparent'
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
              ref={menuTriggerRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
              onClick={() => setMenuOpen((open) => !open)}
              className="type-label tone-fg link-underline inline-flex min-h-11 items-center lg:hidden"
            >
              {menuOpen ? '关闭' : '菜单'}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <MobileMenu
            key="mobile-menu"
            onClose={() => setMenuOpen(false)}
            triggerRef={menuTriggerRef}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
