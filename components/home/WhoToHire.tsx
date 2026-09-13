'use client';

import { Band } from '@/components/primitives';
import { Bi } from '@/components/i18n/Bi';
import { Reveal } from '@/components/motion/Reveal';
import { useDeviceProfile } from '@/lib/motion/device';
import { useGsapScope } from '@/lib/motion/useGsap';
import { pad2 } from '@/lib/utils';
import { slogan, whoToHire } from '@/content/site';

const headlineZhLines = ['你不需要先想清楚', '该找谁。'];
const sloganZhLines = ['把需求交给 VC，', '剩下的交给我们。'];

function RoleList({ className = '' }: { className?: string }) {
  return (
    <ul className={`grid min-w-0 gap-x-8 gap-y-3 ${className}`}>
      {whoToHire.roles.map((role, index) => (
        <li key={role.en} data-who-role className="flex min-w-0 items-baseline gap-4 border-b border-[var(--tone-line-soft)] pb-3">
          <span className="type-label shrink-0 text-[var(--tone-mute)]">{pad2(index + 1)}</span>
          <Bi
            as={null}
            zh={role.zh}
            en={role.en}
            primaryClassName="type-lead text-[var(--tone-fg)] block min-w-0"
            secondaryClassName="type-label-sm text-[var(--tone-mute)] ml-auto shrink-0"
          />
        </li>
      ))}
    </ul>
  );
}

function ChineseClose() {
  return (
    <div className="max-w-[42rem] border-t border-[var(--tone-line)] pt-5">
      <p className="type-lead text-[var(--tone-fg)]">{whoToHire.headlineZh}</p>
      <p className="type-body mt-5 text-[var(--tone-fg-2)]">{whoToHire.resolutionZh}</p>
      <p className="type-body mt-3 text-[var(--tone-fg-2)]">{whoToHire.explanation}</p>
    </div>
  );
}

function StoryHeadline() {
  return (
    // No `ch` measure here: it resolves against this wrapper's ~16px body font
    // rather than the children's display size, which collapsed the headline to
    // one glyph per line. The display type wraps naturally at the shell width.
    <div data-who-headline role="heading" aria-level={2}>
      {headlineZhLines.map((line, index) => (
        <Reveal key={line} variant="masked" delay={index * 75}>
          <span data-who-headline-line className="type-xl type-display block text-[var(--tone-fg)]">
            <Bi
              as={null}
              zh={line}
              en={whoToHire.headline[index] ?? whoToHire.headline[0]}
              primaryClassName="type-xl type-display text-[var(--tone-fg)] block"
              secondaryClassName="type-label text-[var(--tone-mute)] mt-3 block"
            />
          </span>
        </Reveal>
      ))}
    </div>
  );
}

function Resolution() {
  return (
    <div data-who-resolution>
      <Bi
        as={null}
        zh={whoToHire.resolutionZh}
        en={whoToHire.resolutionEn}
        primaryClassName="type-xl type-display text-[var(--tone-fg)] block"
        secondaryClassName="type-label text-[var(--tone-mute)] mt-4 block"
      />
    </div>
  );
}

function SloganLines() {
  return (
    <div className="border-t border-[var(--tone-line)] pt-6">
      {slogan.lines.map((line, index) => (
        <div key={line} data-who-slogan>
          <Reveal variant="masked" delay={index * 90}>
            <Bi
              as={null}
              zh={sloganZhLines[index]}
              en={line}
              primaryClassName="type-lg type-display text-[var(--tone-fg)] block"
              secondaryClassName="type-label text-[var(--tone-mute)] mt-3 block"
            />
          </Reveal>
        </div>
      ))}
      <p className="type-lead mt-6 text-[var(--tone-fg-2)]">{slogan.zh}</p>
    </div>
  );
}

function StaticStory() {
  return (
    <div className="py-[clamp(5rem,11vw,10rem)]">
      <StoryHeadline />

      <Reveal variant="rise" delay={100}>
        <RoleList className="mt-12 max-w-[58rem] md:grid-cols-2" />
      </Reveal>

      <Reveal variant="rise" delay={180}>
        <div className="mt-16 border-t border-[var(--tone-line)] pt-8">
          <Resolution />
        </div>
      </Reveal>

      <div className="mt-16 grid gap-10 border-t border-[var(--tone-line)] pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)] lg:gap-16">
        <SloganLines />
        <Reveal variant="rise" delay={240}>
          <ChineseClose />
        </Reveal>
      </div>
    </div>
  );
}

export function WhoToHire() {
  const profile = useDeviceProfile();
  const pinned = profile.ready && !profile.static && profile.tier === 'high' && !profile.isCompact;
  const rootRef = useGsapScope<HTMLDivElement>(
    ({ gsap, ScrollTrigger, root }) => {
      const headline = root.querySelector<HTMLElement>('[data-who-headline]');
      const headlineLines = root.querySelectorAll<HTMLElement>('[data-who-headline-line]');
      const roles = root.querySelectorAll<HTMLElement>('[data-who-role]');
      const resolution = root.querySelector<HTMLElement>('[data-who-resolution]');
      const sloganLines = root.querySelectorAll<HTMLElement>('[data-who-slogan]');
      const close = root.querySelector<HTMLElement>('[data-who-close]');

      if (!headline || headlineLines.length === 0 || !resolution || !close || sloganLines.length === 0 || roles.length === 0) return;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
        } satisfies ScrollTrigger.Vars,
      });

      timeline.set([headline, ...headlineLines, ...roles, resolution, ...sloganLines, close], { opacity: 0, y: 24 });
      timeline.to(headline, { opacity: 1, y: 0, duration: 0.25, ease: 'power3.out' });
      timeline.to(headlineLines, { opacity: 1, y: 0, duration: 0.72, stagger: 0.16, ease: 'power3.out' }, '>-0.05');
      timeline.to(roles, { opacity: 1, y: 0, duration: 0.7, stagger: 0.28, ease: 'power3.out' }, '>-0.1');
      timeline.to(resolution, { opacity: 1, y: 0, scale: 1.08, duration: 1.05, ease: 'power3.out' }, '>-0.08');
      timeline.to(sloganLines, { opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out' }, '>-0.1');
      timeline.to(close, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '>-0.05');

      ScrollTrigger.refresh();
    },
    { deps: [pinned], disabled: !pinned },
  );

  return (
    <Band id="who-to-hire" tone="ink" container={false} className="py-0">
      <div ref={rootRef} className={pinned ? 'relative min-h-[340svh]' : 'shell'}>
        {pinned ? (
          <div className="sticky top-0 flex min-h-[100svh] items-center overflow-hidden py-20 lg:py-24">
            <div className="shell w-full">
              <div className="grid min-w-0 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.72fr)] lg:gap-20">
                <div className="min-w-0">
                  <StoryHeadline />
                  <RoleList className="mt-12 max-w-[58rem] xl:grid-cols-2" />
                </div>

                <div className="flex min-w-0 flex-col justify-end lg:pt-32">
                  <Resolution />
                  <div className="mt-10">
                    <SloganLines />
                  </div>
                  <div data-who-close className="mt-10">
                    <ChineseClose />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <StaticStory />
        )}
      </div>
    </Band>
  );
}
