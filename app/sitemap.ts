import type { MetadataRoute } from 'next';
import { featuredProjects } from '@/content/projects';
import { seo } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', '/work', '/lab'];
  const projectRoutes = featuredProjects.map((project) => `/work/${project.slug}`);

  // Omit lastModified until it can be kept accurate from a content source.
  return [...routes, ...projectRoutes].map((route) => ({
    url: new URL(route, seo.siteUrl).toString(),
  }));
}
