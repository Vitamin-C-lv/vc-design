import { BiOnly } from '@/components/i18n/Bi';
import type { Recognition } from '@/content/types';
import { VcImage } from '@/components/media/VcImage';
import { MEDIA_SIZES } from '@/lib/media';

export function RecognitionList({ items }: { items: Recognition[] }) {
  return (
    <div className="mt-10 max-w-5xl">
      <div className="flex items-end justify-between gap-6 border-b border-[var(--tone-line)] pb-5">
        <BiOnly zh="奖项与证明" en="RECOGNITION / PROOF" className="type-label tone-mute" as="p" />
        <BiOnly
          zh={`${String(items.length).padStart(2, '0')} 个奖项`}
          en={`${String(items.length).padStart(2, '0')} AWARDS`}
          className="type-label-sm tone-mute"
          as="p"
        />
      </div>
      <ol>
        {items.map((item, index) => (
          <li key={`${item.award}-${item.result}`} className="border-b border-[var(--tone-line)] py-5 md:py-6">
            <details className="group">
              <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                <div className="flex min-w-0 items-start gap-5 md:gap-8">
                  <span className="type-label-sm tone-accent-text shrink-0 pt-1">{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="type-body tone-fg">{item.award}</p>
                    <p className="type-lead tone-accent-text mt-1">{item.result}</p>
                    {item.work ? <p className="type-label-sm tone-mute mt-3">{item.work}</p> : null}
                  </div>
                  {item.mediaKey ? (
                    <span className="type-label-sm tone-fg flex shrink-0 items-center gap-2 border border-[var(--tone-line)] px-3 py-2 transition-colors duration-500 group-hover:bg-[var(--tone-fg)] group-hover:text-[var(--tone-bg)]">
                      <BiOnly zh="查看证明" en="PROOF" />
                      <span aria-hidden className="transition-transform duration-500 group-open:rotate-45">＋</span>
                    </span>
                  ) : null}
                </div>
              </summary>
              {item.mediaKey ? (
                <div className="pl-9 pt-5 md:pl-16">
                  <div data-tone="paper" className="bg-[var(--tone-bg)] p-4 md:p-6">
                    <VcImage
                      media={{ key: item.mediaKey, alt: `${item.award} ${item.result}`, surface: 'light' }}
                      sizes={MEDIA_SIZES.inset}
                      imgClassName="rounded-[2px]"
                    />
                  </div>
                </div>
              ) : null}
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
