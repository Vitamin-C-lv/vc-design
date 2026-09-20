import { Band } from '@/components/primitives';
import { BiOnly } from '@/components/i18n/Bi';
import { VcVideo } from '@/components/media/VcVideo';
import { Reveal } from '@/components/motion/Reveal';
import type { Project } from '@/content/types';
import { MEDIA_SIZES } from '@/lib/media';
import { CaseHero } from './CaseHero';
import { CaseSectionBlock, PairMedia } from './CaseSectionBlock';
import { CaseNav } from './CaseNav';
import { RecognitionList } from './RecognitionList';
import { ParticleShowcase } from './ParticleShowcase';
import { EmbeddedProduct } from './EmbeddedProduct';
import { GugeCaseStudy } from './guge/GugeCaseStudy';

export function CaseStudy({ project }: { project: Project }) {
  /*
   * The Guge flagship is directed rather than alternated (see GugeCaseStudy for
   * the tone curve and the reasoning behind it). It reads the same `Project`
   * content model as everything else — the only difference is which renderer
   * walks it. Keeping the branch here, instead of adding more `layout` values to
   * the shared renderer, is what leaves the other three flagships on exactly the
   * code path they were verified on.
   */
  if (project.slug === 'guge') {
    return <GugeCaseStudy project={project} />;
  }

  return (
    <div style={{ '--project-accent': project.accent } as React.CSSProperties}>
      {/*
        The case study opens light, matching the home page's near-white base, so
        the cover image lands on paper the way a printed spread would. The dark
        acts stay for the closing bands.
      */}
      <Band tone="paper" accent={project.accent} className="pt-0" innerClassName="pt-0">
        <CaseHero project={project} />
      </Band>

      {/*
        Live artefact, placed directly under the hero.
        Where a project genuinely shipped an interactive thing, showing the thing
        beats describing it — and putting it before the written chapters means the
        first substantive impression is "they built this", not "they wrote about
        this". Rendered on ink so the particles have something to glow against.
      */}
      {project.particle ? (
        <Band tone="ink" accent={project.accent} id="live-particle">
          <ParticleShowcase sequence={project.particle} />
        </Band>
      ) : null}

      {project.sections.map((section, index) => {
        // Alternate, but start light so the first chapter continues the cover.
        const tone = index % 2 === 0 ? 'paper' : 'ink';
        const embed = section.embed;
        return (
          <div key={section.id}>
            <Band tone={tone} id={section.id} accent={project.accent}>
              {/*
                Where a chapter carries a working copy of the product, the frame
                goes directly under the text — before the supporting captures, not
                after. Ordering it last meant a reader arriving at "it is running
                right now" hit the stills first and reasonably concluded the live
                version was missing. The artefact answers the claim; the stills
                only document it.
              */}
              {embed ? (
                <div className="space-y-14 md:space-y-20">
                  <CaseSectionBlock section={{ ...section, media: undefined }} total={project.sections.length} />
                  <Reveal variant="rise" delay={140}>
                    <EmbeddedProduct
                      src={embed.src}
                      title={embed.title}
                      poster={embed.poster}
                      openLabel={embed.openLabel}
                      note={embed.note}
                    />
                  </Reveal>
                  {section.media?.length ? (
                    <div className="hairline pt-8">
                      <p className="type-label tone-mute mb-6">界面留存 / CAPTURES</p>
                      <div className="bleed-x flex min-w-0 snap-x gap-5 overflow-x-auto no-scrollbar">
                        {section.media.map((media, index) => (
                          <Reveal
                            key={media.key}
                            variant="masked"
                            delay={index * 90}
                            className="w-[78vw] min-w-0 shrink-0 snap-start md:w-[48vw] lg:w-[36vw]"
                          >
                            <PairMedia media={media} sizes={MEDIA_SIZES.reel} />
                          </Reveal>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <CaseSectionBlock section={section} total={project.sections.length} />
                  {section.id === 'vr' && project.video ? (
                    <Reveal variant="masked" delay={140} className="mt-16 md:mt-24">
                      <VcVideo video={project.video} sizes={MEDIA_SIZES.full} />
                    </Reveal>
                  ) : null}
                </>
              )}
            </Band>
            {section.id === 'outcome' && project.recognition?.length ? (
              <Band tone={tone === 'paper' ? 'ink' : 'paper'} accent={project.accent}>
                <RecognitionList items={project.recognition} />
              </Band>
            ) : null}
          </div>
        );
      })}

      {project.relatedNote ? (
        <Band tone="paper" accent={project.accent}>
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <BiOnly
              zh="相关实验 / VC LAB"
              en="RELATED / VC LAB"
              className="type-label tone-mute md:col-span-3"
              as="p"
            />
            <div className="md:col-span-7 md:col-start-5">
              <p className="type-lead tone-fg-2">{project.relatedNote}</p>
              <a href="/lab" className="link-underline type-label tone-fg mt-6">
                <BiOnly zh="打开 VC LAB →" en="OPEN VC LAB →" />
              </a>
            </div>
          </div>
        </Band>
      ) : null}

      {project.credits?.length ? (
        <Band tone="ink" accent={project.accent}>
          <div className="hairline pt-5">
            <div className="grid gap-8 md:grid-cols-12">
              <BiOnly zh="制作信息" en="CREDITS" className="type-label tone-mute md:col-span-3" as="p" />
              <div className="space-y-3 md:col-span-7 md:col-start-5">
                {project.credits.map((credit) => (
                  <p key={credit} className="type-label-sm tone-mute max-w-[72ch] leading-relaxed">{credit}</p>
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
