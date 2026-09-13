'use client';

import Link from 'next/link';
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
      className="group inline-flex min-h-11 items-center"
    >
      {children}
    </Link>
  );
}

export function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
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
