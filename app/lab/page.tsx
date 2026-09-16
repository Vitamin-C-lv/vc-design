import type { Metadata } from 'next';
import { openGraphDefaults } from '@/app/metadata';
import { Diagram } from '@/components/diagrams/Diagram';
import { Reveal } from '@/components/motion/Reveal';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { Band, ChapterMark, Eyebrow, Rule } from '@/components/primitives';
import { lab, seo } from '@/content/site';

export const metadata: Metadata = {
  title: `${lab.eyebrow} — ${seo.title}`,
  description: lab.body,
  alternates: { canonical: '/lab' },
  openGraph: {
    ...openGraphDefaults,
    title: `${lab.eyebrow} — ${seo.title}`,
    description: lab.body,
    type: 'website',
    url: '/lab',
  },
};

export default function LabPage() {
  return (
    <>
      <Band tone="paper" className="grid-field" innerClassName="min-h-[72svh] flex flex-col justify-center">
        <div className="meta-row meta-row-start">
          <BiOnly zh="技术实验场" en={lab.eyebrow} className="type-label tone-mute" />
          <BiOnly zh="AI / VR / RAG / 3D" en="AI / VR / RAG / 3D" className="type-label-sm tone-mute" />
        </div>
        <div className="mt-[clamp(3.5rem,8vw,8rem)] max-w-[78rem]">
          <Eyebrow>{lab.eyebrow}</Eyebrow>
          <Reveal variant="masked" duration={0.95} className="mt-7 md:mt-9">
            <Bi
              zh={lab.titleZh}
              en={lab.title}
              as="h1"
              primaryClassName="type-xl type-display tone-fg"
              secondaryClassName="type-label tone-mute"
            />
          </Reveal>
          <Reveal variant="rise" delay={120} distance={0.8} className="mt-7 md:mt-9 max-w-[62ch]">
            <p className="type-lead tone-fg-2">{lab.body}</p>
          </Reveal>
        </div>
      </Band>

      <Band tone="ink">
        <div className="meta-row">
          <BiOnly zh="能力" en="CAPABILITIES" className="type-label tone-mute" />
          <BiOnly zh={`${lab.capabilities.length} 项`} en={`${lab.capabilities.length} SYSTEMS`} className="type-label-sm tone-mute" />
        </div>
        <ol className="mt-[clamp(3rem,7vw,7rem)]">
          {lab.capabilities.map((capability, index) => (
            <Reveal key={capability.en} variant="rise" delay={index * 75} distance={0.65}>
              <li className="grid min-w-0 gap-5 border-t border-[var(--tone-line)] py-7 sm:grid-cols-12 sm:gap-8 md:py-9">
                <ChapterMark index={String(index + 1).padStart(2, '0')} className="sm:col-span-2" />
                <div className="min-w-0 sm:col-span-7">
                  <Bi
                    zh={capability.zh}
                    en={capability.en}
                    as="h2"
                    primaryClassName="type-lg type-display tone-fg"
                    secondaryClassName="type-label tone-mute"
                  />
                </div>
                <BiOnly zh="实验能力" en="SYSTEM CAPABILITY" className="type-label-sm tone-mute sm:col-span-3 sm:pt-2" />
              </li>
            </Reveal>
          ))}
        </ol>
      </Band>

      <Band tone="paper" innerClassName="relative">
        <div className="meta-row meta-row-start">
          <BiOnly zh="底层实验" en="LOCAL BRAIN" className="type-label tone-mute" />
          <BiOnly zh="本地优先" en="LOCAL-FIRST" className="type-label-sm tone-mute" />
        </div>

        <div className="mt-[clamp(3.5rem,8vw,8rem)] grid min-w-0 gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-5">
            <Eyebrow>{lab.flagship.name}</Eyebrow>
            <Reveal variant="masked" duration={0.9} className="mt-7">
              <Bi
                zh={lab.flagship.zh}
                en={lab.flagship.name}
                as="h2"
                primaryClassName="type-xl type-display tone-fg"
                secondaryClassName="type-label tone-mute"
              />
            </Reveal>
            <p className="type-label tone-mute mt-7">{lab.flagship.tagline}</p>
            <p className="type-body tone-fg-2 mt-6 max-w-[48ch]">{lab.flagship.body}</p>
          </div>

          <div className="min-w-0 lg:col-span-6 lg:col-start-7">
            <Diagram id="local-runtime" />
          </div>
        </div>

        <div className="mt-[clamp(5rem,10vw,10rem)]">
          <Rule />
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {lab.flagship.points.map((point, index) => (
              <Reveal key={point.title} variant="rise" delay={index * 75} distance={0.6}>
                <article className="border-t border-[var(--tone-line)] pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <BiOnly zh={String(index + 1).padStart(2, '0')} en={String(index + 1).padStart(2, '0')} className="type-label tone-mute" />
                    <BiOnly zh={point.zh} en={point.title} className="type-label-sm tone-mute" />
                  </div>
                  <Bi
                    zh={point.zh}
                    en={point.title}
                    as="h3"
                    className="mt-7"
                    primaryClassName="type-md type-display tone-fg"
                    secondaryClassName="type-label tone-mute"
                  />
                  <p className="type-body tone-fg-2 mt-5">{point.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-[clamp(5rem,10vw,10rem)] grid gap-7 border-t border-[var(--tone-line)] pt-7 md:grid-cols-12 md:gap-8">
          <BiOnly zh="底层关联" en={lab.flagship.relationship.label} className="type-label tone-mute md:col-span-3" />
          <div className="min-w-0 md:col-span-7 md:col-start-5">
            <ArrowLink href={lab.flagship.relationship.href} variant="inline">
              <BiOnly zh={lab.flagship.relationship.target} en={lab.flagship.relationship.target} />
            </ArrowLink>
            <p className="type-body tone-fg-2 mt-5 max-w-[52ch]">{lab.flagship.relationship.note}</p>
          </div>
        </div>
      </Band>

      <Band tone="ink" className="band-curve-top">
        <p className="type-label-sm tone-mute max-w-[72ch]">{lab.disclosureNote}</p>
      </Band>
    </>
  );
}
