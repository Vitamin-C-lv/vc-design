import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

  return {
    title: `${project.title} / ${project.titleZh}`,
    description: project.summary,
    openGraph: {
      title: `${project.title} / ${project.titleZh}`,
      description: project.summary,
      type: 'article',
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
