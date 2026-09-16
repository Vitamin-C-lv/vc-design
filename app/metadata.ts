import { brand } from '@/content/site';

export const openGraphDefaults = {
  siteName: `${brand.name} / ${brand.nameZh}`,
  locale: 'zh_CN' as const,
  images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'VC / 维C' }],
};
