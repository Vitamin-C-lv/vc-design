import { ArrowLink } from '@/components/primitives/ArrowLink';
import { Band, Eyebrow, Rule, SectionIntro, TagList } from '@/components/primitives';
import { Bi } from '@/components/i18n/Bi';
import { Reveal } from '@/components/motion/Reveal';
import { capabilityPillars, disciplineTags } from '@/content/site';
import { pad2 } from '@/lib/utils';

export function Capabilities() {
  const verbTitle = capabilityPillars.map((pillar) => `${pillar.verb}.`).join(' / ');
  const supportingTitle = capabilityPillars.map((pillar) => pillar.zh).join('、');

  return (
    <Band id="capabilities" tone="paper" container={false}>
      <div className="shell">
        <SectionIntro
          eyebrow="能力 / CAPABILITIES"
          title={
            <Bi
              as={null}
              zh={supportingTitle}
              en={verbTitle}
              primaryClassName="type-xl type-display tone-fg block max-w-[12ch]"
              secondaryClassName="type-label tone-mute mt-5 block"
            />
          }
          titleZh="从执行、判断到落地，把跨学科能力收束成可以交付的结果。"
          size="xl"
          className="max-w-[66rem]"
        />

        <div className="mt-[clamp(5rem,12vw,11rem)]">
          {capabilityPillars.map((pillar, index) => (
            <Reveal key={pillar.id} variant="rise" delay={index * 100}>
              <article className="min-w-0 py-[clamp(3.5rem,8vw,8rem)] first:pt-0 last:pb-0">
                <Rule className="mb-[clamp(2.5rem,5vw,5rem)]" />
                <div className="grid min-w-0 gap-y-10 lg:grid-cols-[minmax(12rem,0.8fr)_minmax(18rem,1.35fr)_minmax(15rem,0.95fr)] lg:gap-x-[clamp(2rem,6vw,8rem)]">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="type-label tone-mute">{pad2(index + 1)} / 03</p>
                      <p className="type-label-sm tone-mute">READY TO {pillar.verb}</p>
                    </div>
                    <h3 className="mt-6">
                      <Bi
                        as={null}
                        zh={pillar.zh}
                        en={`${pillar.verb}.`}
                        primaryClassName="type-xl type-display tone-fg block"
                        secondaryClassName="type-label tone-mute mt-3 block"
                      />
                    </h3>
                  </div>

                  <div className="min-w-0 max-w-[43rem]">
                    <Bi
                      as={null}
                      zh={pillar.body}
                      en={pillar.line}
                      primaryClassName="type-lead tone-fg block"
                      secondaryClassName="type-label-sm tone-mute mt-4 block max-w-[52ch]"
                    />
                    <ArrowLink href={pillar.proof.href} variant="inline" className="mt-8 text-[var(--tone-fg)]">
                      {pillar.proof.label}
                    </ArrowLink>
                  </div>

                  <ul className="min-w-0 self-start border-t border-[var(--tone-line)]">
                    {pillar.items.map((item) => (
                      <li key={item.en} className="min-w-0 border-b border-[var(--tone-line)] py-4">
                        <Bi
                          as={null}
                          zh={item.zh}
                          en={item.en}
                          primaryClassName="type-body tone-fg block"
                          secondaryClassName="type-label-sm tone-mute mt-2 block"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-[clamp(5rem,11vw,10rem)] border-t border-[var(--tone-line)] pt-6 md:flex md:items-start md:justify-between md:gap-10">
          <Eyebrow marker={false} className="mb-5 md:mb-0">
            范围 / DISCIPLINES
          </Eyebrow>
          <TagList tags={disciplineTags} size="sm" className="md:max-w-[42rem] md:justify-end" />
        </div>
      </div>
    </Band>
  );
}
