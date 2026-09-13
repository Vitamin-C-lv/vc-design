import { ArrowLink } from '@/components/primitives/ArrowLink';
import { Band, Eyebrow, Rule } from '@/components/primitives';
import { BiOnly } from '@/components/i18n/Bi';
import { footer, slogan } from '@/content/site';

export function SiteFooter() {
  return (
    <footer aria-label="页脚">
      <Band
        tone="ink"
        as="div"
        className="band-curve-top pb-8 pt-20 md:pb-10 md:pt-28"
      >
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(30rem,1fr)] lg:gap-24">
          <div>
            <Eyebrow marker={false} className="mb-7">
              {footer.statement}
            </Eyebrow>
            {/*
              The locked slogan stays in English in both language modes — it is
              the brand asset, not information — with the Chinese line beneath it
              so a Chinese reader is never left with only the English.
            */}
            <p className="type-lg type-display tone-fg max-w-[13ch]">
              {slogan.lines[0]}
              <span className="block">{slogan.lines[1]}</span>
            </p>
            <p className="type-body tone-fg-2 mt-6 max-w-[34ch]">{slogan.zh}</p>
          </div>

          <div className="grid gap-12 sm:grid-cols-2">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <Eyebrow marker={false} className="mb-6">
                  <BiOnly zh={column.titleZh} en={column.title} />
                </Eyebrow>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <ArrowLink href={link.href} variant="ghost" noArrow className="link-underline">
                        <BiOnly zh={link.zh} en={link.label} />
                      </ArrowLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="sm:col-span-2">
              <ul className="space-y-4">
                {footer.liveLinks.map((link) => (
                  <li key={link.href}>
                    <ArrowLink href={link.href} variant="ghost" className="link-underline">
                      {link.label}
                    </ArrowLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Rule className="mt-20 md:mt-28" />
        <div className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-label-sm tone-mute">{footer.legal}</p>
          <p className="type-label-sm tone-mute">{footer.builtNote}</p>
        </div>
      </Band>
    </footer>
  );
}
