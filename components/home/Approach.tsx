'use client';

import { useEffect, useRef, useState } from 'react';
import { Band, SectionIntro } from '@/components/primitives';
import { Bi } from '@/components/i18n/Bi';
import { Reveal } from '@/components/motion/Reveal';
import { approachIntro, approachSteps } from '@/content/site';
import { useDeviceProfile } from '@/lib/motion/device';

export function Approach() {
  const profile = useDeviceProfile();
  const interactive = profile.ready && !profile.static && profile.tier === 'high' && !profile.isCompact;
  const [activeIndex, setActiveIndex] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive) return;
    const root = stepsRef.current;
    if (!root) return;
    const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-approach-step]'));
    if (steps.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = steps.indexOf(visible.target as HTMLElement);
        if (index >= 0) setActiveIndex(index);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0.15, 0.5, 0.85] },
    );

    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, [interactive]);

  const activeStep = approachSteps[activeIndex] ?? approachSteps[0];

  return (
    <Band id="approach" tone="paper" container={false}>
      <div className="shell">
        <SectionIntro
          eyebrow={approachIntro.eyebrow}
          title={
            <Bi
              as={null}
              zh={approachIntro.titleZh}
              en={approachIntro.title}
              primaryClassName="type-xl type-display text-[var(--tone-fg)] block max-w-[15ch]"
              secondaryClassName="type-label text-[var(--tone-mute)] mt-5 block"
            />
          }
          body={approachIntro.body}
          size="xl"
          className="max-w-[66rem]"
          reveal
        />

        <div className="mt-[clamp(5rem,12vw,11rem)] grid min-w-0 gap-14 lg:grid-cols-[minmax(13rem,0.65fr)_minmax(0,1.35fr)] lg:gap-[clamp(3rem,10vw,12rem)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="meta-row meta-row-start">
                <p className="type-label text-[var(--tone-mute)]">CURRENT STEP</p>
                <p className="type-label-sm text-[var(--tone-mute)]">{activeStep.index} / 06</p>
              </div>
              <Bi
                as={null}
                zh={activeStep.zh}
                en={activeStep.en}
                primaryClassName="type-xl type-display mt-6 text-[var(--tone-fg)] block"
                secondaryClassName="type-label mt-4 text-[var(--tone-mute)] block"
              />
              <p className="type-body mt-6 max-w-[24ch] text-[var(--tone-fg-2)]">流程会随项目调整，但判断始终先于制作。</p>
            </div>
          </aside>

          <div ref={stepsRef} className="min-w-0">
            {approachSteps.map((step, index) => (
              <Reveal key={step.id} variant="rise" delay={index * 70}>
                <article data-approach-step className="min-w-0 border-t border-[var(--tone-line)] py-[clamp(2.5rem,6vw,6rem)] first:pt-0">
                  <div className="grid min-w-0 gap-8 md:grid-cols-[minmax(5rem,0.32fr)_minmax(0,1fr)] md:gap-10">
                    <div className="flex items-start justify-between gap-4">
                      <p className="type-xl type-display text-[var(--tone-fg)]">{step.index}</p>
                      <p className="type-label-sm tone-mute mt-2">{index === 0 ? 'START' : index === approachSteps.length - 1 ? 'HANDOFF' : 'IN PROGRESS'}</p>
                    </div>
                    <div className="min-w-0">
                      <h3>
                        <Bi
                          as={null}
                          zh={step.zh}
                          en={step.en}
                          primaryClassName="type-lg type-display text-[var(--tone-fg)] block"
                          secondaryClassName="type-label text-[var(--tone-mute)] mt-3 block"
                        />
                      </h3>
                      <p className="type-lead mt-8 max-w-[52ch] text-[var(--tone-fg)]">{step.does}</p>
                      <p className="type-body mt-6 max-w-[52ch] border-l border-[var(--tone-line)] pl-4 text-[var(--tone-mute)] md:pl-5">
                        你需要做的：{step.yours}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Band>
  );
}
