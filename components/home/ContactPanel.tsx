import { SignalCircle } from '@/components/primitives/SignalCircle';
import { Band, Eyebrow } from '@/components/primitives';
import { Bi, BiOnly } from '@/components/i18n/Bi';
import { Reveal } from '@/components/motion/Reveal';
import { contact } from '@/content/site';
import { BriefForm } from '@/components/contact/BriefForm';

const sloganZhLines = ['把需求交给 VC，', '剩下的交给我们。'];

/** Final conversion band. The interactive brief form lives in a client child. */
export function ContactPanel() {
  return (
    <Band id="contact" tone="ink" innerClassName="relative">
      <div className="grid min-w-0 gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-5">
          <Eyebrow marker={false}>
            <BiOnly zh="联系" en={contact.ctaLabel} />
          </Eyebrow>
          {/* No `ch` measure: it resolves against this wrapper's body font, not
              the display size of the children, and would stack one glyph per
              line. See BrandStatement for the full explanation. */}
          <div role="heading" aria-level={2} className="mt-8">
            {contact.headline.map((line, index) => (
              <Reveal key={line} variant="masked" delay={index * 75}>
                <Bi
                  as={null}
                  zh={sloganZhLines[index]}
                  en={line}
                  primaryClassName="type-xl type-display tone-fg block"
                  secondaryClassName="type-label tone-mute mt-3 block"
                />
              </Reveal>
            ))}
          </div>
          <p className="type-body tone-fg-2 mt-8 max-w-[34ch]">{contact.headlineZh}</p>
          {/*
            The one signal-coloured element on the site. It anchors the bottom of
            the left column and crosses a hairline into the gutter, so the final
            band ends on a single unmistakable action rather than another bordered
            button that reads like every other link.
          */}
          <SignalCircle href="#contact-brief" sublabel="WECHAT / 微信" className="mt-12">
            <BiOnly zh="把需求发给我们" en={contact.ctaLabel} />
          </SignalCircle>
        </div>

        <div className="min-w-0 lg:col-span-6 lg:col-start-7">
          <BriefForm />
        </div>
      </div>
    </Band>
  );
}
