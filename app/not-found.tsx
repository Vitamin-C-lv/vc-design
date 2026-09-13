import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/Reveal';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { Band, Eyebrow } from '@/components/primitives';
import { brand, secondaryNav, seo } from '@/content/site';

export const metadata: Metadata = {
  title: `404 — ${seo.title}`,
  description: brand.definitionZh,
};

export default function NotFound() {
  return (
    <main>
      <Band tone="paper" className="grid-field min-h-[78svh]" innerClassName="flex flex-col justify-between">
        <Eyebrow>
          <BiOnly zh={brand.nameZh} en={brand.name} />
        </Eyebrow>

        <div className="grid gap-12 md:grid-cols-12 md:items-end md:gap-8">
          <Reveal variant="masked" duration={0.9} className="md:col-span-7">
            <p className="type-hero type-display tone-fg" aria-label="404">
              404
            </p>
          </Reveal>
          <div className="min-w-0 md:col-span-4 md:col-start-9">
            <Reveal variant="masked" delay={100}>
              <Bi
                zh="这个页面走失了。"
                en="THE PAGE ISN'T HERE."
                as="h1"
                primaryClassName="type-lg type-display tone-fg"
                secondaryClassName="type-label tone-mute"
              />
            </Reveal>
            <Reveal variant="rise" delay={180} distance={0.75}>
              <Bi
                zh={brand.definitionZh}
                en={brand.definitionEn}
                className="mt-6 max-w-[38ch]"
                primaryClassName="type-body tone-fg-2"
                secondaryClassName="type-label-sm tone-mute"
              />
            </Reveal>
            <Reveal variant="rise" delay={240} distance={0.75}>
              <div className="mt-9">
                <ArrowLink href="/work" variant="solid">
                  <BiOnly zh="回到作品" en={secondaryNav[1].label} />
                </ArrowLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Band>
    </main>
  );
}
