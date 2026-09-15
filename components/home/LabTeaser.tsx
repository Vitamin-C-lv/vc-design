import { ArrowLink } from '@/components/primitives/ArrowLink';
import { Band, Eyebrow, Rule, TagList } from '@/components/primitives';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { lab, secondaryNav } from '@/content/site';
import { Reveal } from '@/components/motion/Reveal';

/** The restrained technical halo that leads from the home page into VC LAB. */
export function LabTeaser() {
  return (
    <Band id="lab" tone="paper" className="grid-field overflow-hidden" innerClassName="relative">
      <div aria-hidden className="pointer-events-none absolute right-[8%] top-[18%] h-36 w-36 border border-[var(--tone-line)] md:h-64 md:w-64" />
      <div aria-hidden className="pointer-events-none absolute right-[calc(8%+4.5rem)] top-[calc(18%+4.5rem)] h-36 w-36 border border-[var(--tone-line-soft)] md:right-[calc(8%+8rem)] md:top-[calc(18%+8rem)] md:h-64 md:w-64" />

      <div className="relative grid min-w-0 gap-16 md:grid-cols-12 md:items-start md:gap-8">
        <div className="min-w-0 md:col-span-7">
          <Reveal variant="fade">
            <Eyebrow>{lab.eyebrow}</Eyebrow>
          </Reveal>
          {/* See BrandStatement: a `ch` measure on a wrapper resolves against the
              wrapper's own body font size, not the display font of its children. */}
          <Reveal variant="masked" delay={75}>
            <h2 className="mt-7">
              <Bi
                as={null}
                zh={lab.titleZh}
                en={lab.title}
                primaryClassName="type-xl type-display tone-fg block"
                secondaryClassName="type-label tone-mute mt-5 block"
              />
            </h2>
          </Reveal>
          <Reveal variant="rise" delay={150}>
            <p className="type-lead tone-fg-2 mt-7 max-w-[42ch]">{lab.body}</p>
          </Reveal>

          <Reveal variant="rule" className="mt-12">
            <Rule />
          </Reveal>
          <ul className="grid min-w-0 gap-x-8 gap-y-0 sm:grid-cols-2">
            {lab.capabilities.map((capability, index) => (
              <li key={capability.en} className="min-w-0 border-b border-[var(--tone-line)] py-4">
                <p className="type-label-sm tone-mute">{String(index + 1).padStart(2, '0')}</p>
                <Bi
                  as={null}
                  zh={capability.zh}
                  en={capability.en}
                  primaryClassName="type-body tone-fg mt-2 block"
                  secondaryClassName="type-label-sm tone-mute mt-2 block"
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 md:col-span-4 md:col-start-9 md:pt-16">
          <Reveal variant="fade">
            <p className="type-label tone-mute">{lab.flagship.name} / FLAGSHIP</p>
          </Reveal>
          <Reveal variant="masked" delay={75}>
            <h3 className="mt-4">
              <Bi
                as={null}
                zh={lab.flagship.zh}
                en={lab.flagship.tagline}
                primaryClassName="type-md type-display tone-fg block"
                secondaryClassName="type-label tone-mute mt-3 block"
              />
            </h3>
          </Reveal>
          <Reveal variant="rise" delay={150}>
            <p className="type-body tone-fg-2 mt-6">{lab.flagship.body}</p>
            <TagList tags={lab.capabilities.slice(0, 3).map((capability) => capability.en.toUpperCase())} size="sm" className="mt-7" />
          </Reveal>

          <Reveal variant="rule" className="mt-10">
            <Rule />
          </Reveal>
          <div className="pt-5">
            <p className="type-label-sm tone-mute">{lab.flagship.relationship.label}</p>
            <p className="type-body tone-fg mt-3">{lab.flagship.relationship.target}</p>
            <p className="type-body tone-fg-2 mt-3">{lab.flagship.relationship.note}</p>
          </div>

          <ArrowLink href="/lab" variant="outline" className="mt-10">
            <BiOnly zh={secondaryNav[0].zh} en={secondaryNav[0].label} />
          </ArrowLink>
        </div>
      </div>

      <Reveal variant="rule" className="relative mt-16">
        <Rule />
      </Reveal>
      <p className="type-label-sm tone-mute relative max-w-[70ch] pt-5">{lab.disclosureNote}</p>
    </Band>
  );
}
