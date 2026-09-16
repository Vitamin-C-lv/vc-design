'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { Route } from 'next';
import { motion } from 'motion/react';
import { BiOnly } from '@/components/i18n/Bi';
import { primaryNav, secondaryNav, slogan } from '@/content/site';
import { hasHashTarget, scrollToHash } from '@/lib/motion/lenis';

const easing = [0.16, 1, 0.3, 1] as const;

function MenuLink({ href, children, onClose }: { href: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <Link
      href={href as Route}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (hasHashTarget(href)) {
          event.preventDefault();
          scrollToHash(href.slice(href.indexOf('#')), -72);
          window.history.replaceState(null, '', href);
        }
        onClose();
      }}
      className="group inline-flex min-h-11 items-center focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--tone-accent)]"
    >
      {children}
    </Link>
  );
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useMenuFocus(
  panelRef: RefObject<HTMLDivElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const trigger = triggerRef.current;
    const backgroundElements: HTMLElement[] = [];
    const previousInert = new Map<HTMLElement, boolean>();
    let current: HTMLElement = panel;

    // Inert every branch outside the dialog without inerting its ancestors.
    while (current.parentElement) {
      const parent = current.parentElement;
      Array.from(parent.children).forEach((sibling) => {
        if (!(sibling instanceof HTMLElement) || sibling === current) return;

        // Keep the existing header toggle clickable as the dialog's close control,
        // while making the other header controls inert.
        if (trigger && sibling.contains(trigger)) {
          sibling.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR).forEach((element) => {
            if (element !== trigger && !trigger.contains(element)) {
              backgroundElements.push(element);
            }
          });
          return;
        }

        backgroundElements.push(sibling);
      });
      current = parent;
      if (parent === document.body) break;
    }

    backgroundElements.forEach((element) => {
      previousInert.set(element, element.inert);
      element.inert = true;
    });

    const panelFocusableElements = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const focusableElements = () => {
      const elements = panelFocusableElements();
      if (trigger?.isConnected) elements.push(trigger);
      return elements;
    };
    const focusFirst = () => {
      const first = panelFocusableElements()[0];
      if (first) first.focus();
      else {
        panel.tabIndex = -1;
        panel.focus();
      }
    };

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = focusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
      const triggerIndex = trigger ? focusable.indexOf(trigger) : -1;
      if (currentIndex === -1) {
        event.preventDefault();
        (event.shiftKey ? focusable[focusable.length - 1] : focusable[0]).focus();
      } else if (trigger && triggerIndex >= 0 && currentIndex === triggerIndex) {
        event.preventDefault();
        if (event.shiftKey) {
          (focusable[triggerIndex - 1] ?? panel).focus();
        } else {
          focusable[0].focus();
        }
      } else if (trigger && triggerIndex >= 0 && !event.shiftKey && currentIndex === triggerIndex - 1) {
        event.preventDefault();
        trigger.focus();
      } else if (event.shiftKey && currentIndex === 0) {
        event.preventDefault();
        (triggerIndex >= 0 && trigger ? trigger : focusable[focusable.length - 1]).focus();
      } else if (!event.shiftKey && currentIndex === focusable.length - 1) {
        event.preventDefault();
        focusable[0].focus();
      }
    };

    const frame = window.requestAnimationFrame(focusFirst);
    document.addEventListener('keydown', trapFocus);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', trapFocus);
      backgroundElements.forEach((element) => {
        element.inert = previousInert.get(element) ?? false;
      });
      if (trigger?.isConnected) trigger.focus();
    };
  }, [panelRef, triggerRef]);
}

export function MobileMenu({
  onClose,
  triggerRef,
}: {
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useMenuFocus(panelRef, triggerRef);

  return (
    <motion.div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="移动端菜单"
      data-tone="ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: easing }}
      className="fixed inset-0 z-40 overflow-y-auto bg-[var(--tone-bg)] text-[var(--tone-fg)] lg:hidden"
    >
      <div className="shell flex min-h-full flex-col pb-8 pt-28">
        <nav aria-label="移动端主导航">
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.055, delayChildren: 0.12 } },
            }}
            className="border-t border-[var(--tone-line)]"
          >
            {primaryNav.map((item) => (
              <motion.li
                key={item.href}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.62, ease: easing }}
                className="border-b border-[var(--tone-line)]"
              >
                <MenuLink href={item.href} onClose={onClose}>
                  <span className="flex items-baseline gap-4 py-5">
                    <BiOnly
                      zh={<span className="type-lg type-display tone-fg">{item.zh}</span>}
                      en={<span className="type-label-sm tone-mute">{item.label}</span>}
                    />
                  </span>
                </MenuLink>
              </motion.li>
            ))}
          </motion.ul>
        </nav>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {secondaryNav.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, delay: 0.4 + index * 0.055, ease: easing }}
            >
              <MenuLink href={item.href} onClose={onClose}>
                <span className="link-underline tone-fg">
                  <BiOnly
                    zh={<span className="type-label">{item.zh}</span>}
                    en={<span className="type-label-sm tone-mute">{item.label}</span>}
                  />
                </span>
              </MenuLink>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, delay: 0.52, ease: easing }}
          className="type-body tone-mute mt-auto max-w-[25ch] pt-20"
          lang="zh-CN"
        >
          {slogan.zh}
        </motion.p>
      </div>
    </motion.div>
  );
}
