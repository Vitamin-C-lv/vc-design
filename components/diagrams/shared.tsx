'use client';

import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';
import { cx } from '@/lib/utils';

export function DiagramFrame({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div role="img" aria-label={label} className={cx('relative min-w-0 border border-[var(--tone-line)] p-4 md:p-6', className)}>
      <div aria-hidden className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--tone-line)] pb-3">
        <span className="type-label-sm tone-accent-text">FIGURE / SVG</span>
        <span className="type-label-sm tone-mute">CODE DRAWN</span>
      </div>
      {children}
    </div>
  );
}

export function DiagramReveal({
  children,
  delay = 0,
  className,
  variant = 'rise',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: 'rise' | 'masked' | 'fade';
}) {
  const profile = useDeviceProfile();
  const motionDisabled = !profile.ready || profile.static || profile.tier === 'low' || profile.isCompact;
  if (motionDisabled) return <div className={className}>{children}</div>;
  return <Reveal variant={variant} delay={delay} className={className}>{children}</Reveal>;
}

export function DiagramNode({ children, delay = 0, className, label }: { children: ReactNode; delay?: number; className?: string; label?: string }) {
  const profile = useDeviceProfile();
  const motionDisabled = !profile.ready || profile.static || profile.tier === 'low' || profile.isCompact;
  const nodeRef = useGsapScope<HTMLDivElement>(
    ({ gsap, root }) => {
      gsap.fromTo(
        root,
        { opacity: 0, y: 18, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: delay / 1000,
          ease: 'power3.out',
          scrollTrigger: { trigger: root, start: 'top 92%', once: true },
        },
      );
    },
    { deps: [motionDisabled, delay], disabled: motionDisabled },
  );

  const content = (
    <div ref={nodeRef} className={cx('h-full min-w-0 border border-[var(--tone-line)] bg-[var(--tone-surface)] p-4 md:p-5', className)}>
      {label ? <p className="type-label-sm tone-accent-text mb-3">{label}</p> : null}
      <div className="type-label tone-fg leading-relaxed">{children}</div>
    </div>
  );

  if (motionDisabled) return <div className="min-w-0 flex-1">{content}</div>;
  return (
    <Reveal variant="masked" delay={delay} className="min-w-0 flex-1">
      {content}
    </Reveal>
  );
}

export function DiagramArrow() {
  return (
    <span aria-hidden className="type-lg tone-accent-text flex shrink-0 items-center justify-center leading-none">
      <span className="hidden md:inline">→</span>
      <span className="md:hidden">↓</span>
    </span>
  );
}

export function DiagramKicker({ children }: { children: ReactNode }) {
  return <p className="type-label-sm tone-mute mb-5">{children}</p>;
}

export function DiagramRule({ children }: { children: ReactNode }) {
  return <p className="type-label-sm tone-accent-text border-t border-[var(--tone-line)] pt-4">{children}</p>;
}
