import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { openGraphDefaults } from '@/app/metadata';
import { projects, getProject } from '@/content/projects';
import { CaseStudy } from '@/components/work/CaseStudy';

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return { title: 'Work not found' };
  }

  const canonical = `/work/${project.slug}`;

  return {
    title: `${project.title} / ${project.titleZh}`,
    description: project.summary,
    alternates: { canonical },
    openGraph: {
      ...openGraphDefaults,
      title: `${project.title} / ${project.titleZh}`,
      description: project.summary,
      type: 'article',
      url: canonical,
      images: [
        {
          url: `/og/${project.slug}.png`,
          width: 1200,
          height: 630,
          alt: `${project.titleZh} / ${project.title}`,
        },
      ],
    },
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  return <CaseStudy project={project} />;
}
