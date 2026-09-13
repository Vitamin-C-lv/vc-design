import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Bi } from '@/components/i18n/Bi';
import type { Project } from '@/content/types';
import { MEDIA_SIZES } from '@/lib/media';
import { cx, pad2 } from '@/lib/utils';
import { TagList } from '@/components/primitives';
import { VcImage } from '@/components/media/VcImage';

export interface ProjectCardProps {
  project: Project;
  priority?: boolean;
  sizes?: string;
  className?: string;
  mediaClassName?: string;
  imageClassName?: string;
  aspect?: number;
  /** Featured blocks render their editorial copy outside this media atom. */
  showDetails?: boolean;
}

function BilingualEcho({
  zh,
  en,
  primaryClassName,
  secondaryClassName,
  as = 'div',
}: {
  zh: React.ReactNode;
  en: React.ReactNode;
  primaryClassName: string;
  secondaryClassName: string;
  as?: 'div' | 'p' | 'span';
}) {
  return (
    <>
      <Bi as={as} zh={zh} en={en} hideSecondary primaryClassName={primaryClassName} />
      <Bi as={as} zh={en} en={zh} hideSecondary primaryClassName={secondaryClassName} />
    </>
  );
}

/**
 * Shared project media atom.
 *
 * Image and title are separate links on purpose: featured layouts can compose
 * live-product actions beside them without ever nesting interactive elements.
 */
export function ProjectCard({
  project,
  priority = false,
  sizes = MEDIA_SIZES.card,
  className,
  mediaClassName,
  imageClassName,
  aspect,
  showDetails = true,
}: ProjectCardProps) {
  return (
    <article
      className={cx('group/project', className)}
      style={{ '--tone-accent': project.accent } as CSSProperties}
    >
      <Link
        href={`/work/${project.slug}`}
        className="group/media block focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--tone-accent)]"
        aria-label={project.titleZh}
      >
        <VcImage
          media={project.cover}
          sizes={sizes}
          priority={priority}
          aspect={aspect}
          wrapperClassName={cx(
            'transition-transform duration-700 ease-[var(--ease-vc-out)] group-hover/media:scale-[1.012]',
            mediaClassName,
          )}
          imgClassName={imageClassName}
        />
      </Link>

      {showDetails ? (
        <div className="pt-5 md:pt-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="type-label tone-mute">{pad2(project.order)}</p>
              <h3 className="mt-4">
                <Link
                  href={`/work/${project.slug}`}
                  className="link-underline tone-fg focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--tone-accent)]"
                >
                  <BilingualEcho
                    zh={project.titleZh}
                    en={project.title}
                    primaryClassName="type-md type-display tone-fg block"
                    secondaryClassName="type-label tone-mute mt-3 block"
                    as="span"
                  />
                </Link>
              </h3>
            </div>
            {project.badge ? (
              <span className="type-label-sm tone-accent-text shrink-0 border-t border-[var(--tone-accent)] pt-2 text-right">
                {project.badge}
              </span>
            ) : null}
          </div>
          <BilingualEcho
            zh={project.taglineZh}
            en={project.tagline}
            primaryClassName="type-body tone-fg-2 mt-5 max-w-[48ch]"
            secondaryClassName="type-label tone-mute mt-3 block max-w-[58ch]"
          />
          <TagList tags={project.tags} size="sm" className="mt-5" />
        </div>
      ) : null}
    </article>
  );
}
