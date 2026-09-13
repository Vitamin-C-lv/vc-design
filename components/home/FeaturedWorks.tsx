import { Bi, BiOnly } from '@/components/i18n/Bi';
import { Band, Container, Eyebrow } from '@/components/primitives';
import { featuredProjects } from '@/content/projects';
import { FeaturedProjectBlock, type FeaturedProjectLayout } from '@/components/work/FeaturedProjectBlock';

const layouts: FeaturedProjectLayout[] = ['hero', 'split-left', 'split-right', 'wide'];

/** The home-page sales sequence: one dominant proof point, then three contrasts. */
export function FeaturedWorks() {
  return (
    <Band id="work" tone="ink" container={false}>
      <Container className="min-w-0">
        <div className="max-w-[68rem]">
          <Eyebrow>
            <BiOnly zh="精选作品" en="SELECTED WORK" />
          </Eyebrow>
          <Bi
            as="h2"
            zh="四个旗舰项目，四种问题意识；先看古格，再看 VC 如何把不同媒介做成真实体验。"
            en="FOUR PROJECTS. FOUR DIFFERENT PROBLEMS."
            hideSecondary
            primaryClassName="type-lg type-display tone-fg mt-7 block"
          />
          <Bi
            as="p"
            zh="FOUR PROJECTS. FOUR DIFFERENT PROBLEMS."
            en="四个旗舰项目，四种问题意识；先看古格，再看 VC 如何把不同媒介做成真实体验。"
            hideSecondary
            primaryClassName="type-label tone-mute mt-5 block max-w-[70ch]"
          />
        </div>

        <div className="mt-[clamp(5rem,13vw,13rem)] grid gap-[clamp(9rem,19vw,22rem)]">
          {featuredProjects.map((project, index) => (
            <FeaturedProjectBlock
              key={project.slug}
              project={project}
              index={index}
              priority={index === 0}
              layout={layouts[index]}
            />
          ))}
        </div>
      </Container>
    </Band>
  );
}
