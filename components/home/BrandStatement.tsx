'use client';

import { Bi, BiOnly } from '@/components/i18n/Bi';
import { Band, Eyebrow } from '@/components/primitives';
import { Reveal } from '@/components/motion/Reveal';
import { brand } from '@/content/site';
import { useDeviceProfile } from '@/lib/motion/device';

function LineReveal({
  children,
  delay,
  disabled,
}: {
  children: React.ReactNode;
  delay: number;
  disabled: boolean;
}) {
  if (disabled) return <div>{children}</div>;
  return (
    <Reveal variant="masked" delay={delay} duration={1.05}>
      {children}
    </Reveal>
  );
}

export function BrandStatement() {
  const profile = useDeviceProfile();
  const disabled = !profile.ready || profile.static || profile.tier === 'low' || profile.isCompact;
  const definitionLines = brand.definitionZh.split(/(?=3D)/);
  const definitionEnLines = brand.definitionEn.split(/(?=3D)/);

  return (
    <Band
      id="statement"
      tone="paper"
      className="min-h-[78svh]"
      innerClassName="flex min-h-[58svh] flex-col justify-center"
    >
      <Eyebrow marker={false} className="mb-10 max-w-[42ch] md:mb-14">
        <BiOnly zh="品牌定义" en={brand.definitionEn} />
      </Eyebrow>

      {/*
        No width constraint here. A `ch` measure resolves against THIS element's
        font-size — body text, ~16px — so `max-w-[18ch]` produced a ~144px box
        while the children render at 150px. Every Han glyph then wrapped onto its
        own line and the band grew to 4240px of near-empty page. The display
        type now wraps naturally at the shell width, which yields roughly nine
        characters per line, and each line's own cap is expressed in `em` on the
        element that actually carries the display font size.
      */}
      <div aria-label={brand.definitionZh}>
        {definitionLines.map((line, index) => {
          const englishLine = definitionEnLines[index] ?? brand.definitionEn;

          return (
            <div key={`${line}-${index}`}>
              <LineReveal delay={index * 75} disabled={disabled}>
                <Bi
                  as="span"
                  zh={line}
                  en={englishLine}
                  hideSecondary
                  primaryClassName="type-xl type-display tone-fg block"
                />
              </LineReveal>
              <Bi
                as="span"
                zh={englishLine}
                en={line}
                hideSecondary
                primaryClassName="type-label tone-mute mt-3 block"
              />
            </div>
          );
        })}
      </div>
    </Band>
  );
}
