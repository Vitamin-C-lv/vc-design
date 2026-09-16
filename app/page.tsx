import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { OpeningIntro } from '@/components/home/OpeningIntro';
import { BrandStatement } from '@/components/home/BrandStatement';
import { FeaturedWorks } from '@/components/home/FeaturedWorks';
import { MoreWork } from '@/components/home/MoreWork';
import { Capabilities } from '@/components/home/Capabilities';
import { WhoToHire } from '@/components/home/WhoToHire';
import { Approach } from '@/components/home/Approach';
import { LabTeaser } from '@/components/home/LabTeaser';
import { ContactPanel } from '@/components/home/ContactPanel';
import { seo } from '@/content/site';

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
};

/**
 * Home page.
 *
 * The order is locked by the brief and encodes the sales argument:
 *   作品 → 能力 → 方法 → 联系方式
 *
 * Every band is a component that owns its own file, so sections can be worked on
 * (and rearranged) without touching this assembly. The `id` on each band is the
 * anchor the header navigates to — renaming one means updating `content/site.ts`
 * in the same commit.
 */
export default function HomePage() {
  return (
    <>
      <div suppressHydrationWarning>
        <OpeningIntro />
      </div>
      <Hero />
      <BrandStatement />
      <FeaturedWorks />
      <MoreWork />
      <Capabilities />
      <WhoToHire />
      <Approach />
      <LabTeaser />
      <ContactPanel />
    </>
  );
}
