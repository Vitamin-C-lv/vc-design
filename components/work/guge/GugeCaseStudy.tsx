import { Band } from '@/components/primitives';
import { BiOnly } from '@/components/i18n/Bi';
import type { Project } from '@/content/types';
import { CaseNav } from '../CaseNav';
import { RecognitionList } from '../RecognitionList';
import { GugeChapter } from './GugeChapter';
import { GugeHero } from './GugeHero';

/**
 * The 古格王朝 flagship case study.
 *
 * ── Why this is a separate renderer instead of new `layout` values ─────────
 * The other three flagships share one alternating light/dark page, and that is
 * the right page for them. Guge needs a *directed* structure: a cinematic
 * opening, two long dark acts broken by two deliberately light chapters, and a
 * closing turn that hands over to the next project. Expressing that as more
 * `layout` branches inside the shared renderer would have put a flagship's
 * specific choreography into everybody's code path, and would have made the
 * other three case studies a regression risk for no benefit.
 *
 * So the branch lives in `CaseStudy.tsx` — one line — and the Guge page owns its
 * own rhythm here. The **content model is still shared**: these are the same
 * `CaseSection` objects every other project uses, read with the optional
 * flagship fields (`tone`, `piece`, `blocks`) that other projects simply leave
 * unset.
 *
 * ── The tone curve ─────────────────────────────────────────────────────────
 * The home page closes on a black arch. Guge opens on ink so that hand-off is
 * continuous, then runs:
 *
 *   ink  00 dream      cinematic entrance
 *   paper 01 site      the field work — a printed spread
 *   ink  02 story      the layered map
 *   ink  03 people     the character scroll (one continuous dark act with 02)
 *   paper 04 rebuild   the technical plate — first breath
 *   ink  05 built      the 3D reel and the renders
 *   ink  06 inside     the running build
 *   ink  07 guide      the AI guide
 *   paper 08 proof     the sources — second breath
 *   ink  09 craft      the presentation system
 *   ink  10 outcome    the close
 */
export function GugeCaseStudy({ project }: { project: Project }) {
  const [entrance, ...chapters] = project.sections;
  const total = project.sections.length;

  return (
    <div style={{ '--project-accent': project.accent } as React.CSSProperties}>
      {entrance ? (
        <Band tone="ink" id={entrance.id} accent={project.accent} className="pt-0" innerClassName="pt-0">
          <GugeHero project={project} section={entrance} />
        </Band>
      ) : null}

      {chapters.map((section) => (
        <Band
          key={section.id}
          tone={section.tone ?? 'ink'}
          id={section.id}
          accent={project.accent}
        >
          <GugeChapter section={section} total={total} />
        </Band>
      ))}

      {project.recognition?.length ? (
        <Band tone="paper" accent={project.accent}>
          <RecognitionList items={project.recognition} />
        </Band>
      ) : null}

      {project.credits?.length ? (
        <Band tone="ink" accent={project.accent}>
          <div className="hairline pt-5">
            <div className="grid gap-8 md:grid-cols-12">
              <BiOnly zh="制作信息" en="CREDITS" className="type-label tone-mute md:col-span-3" as="p" />
              <div className="space-y-3 md:col-span-7 md:col-start-5">
                {project.credits.map((credit) => (
                  <p key={credit} className="type-label-sm tone-mute max-w-[72ch] leading-relaxed">
                    {credit}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Band>
      ) : null}

      <CaseNav slug={project.slug} accent={project.accent} />
    </div>
  );
}
