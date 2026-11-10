import type { Metadata } from 'next';
import HomePage from '@/components/site/HomePage';
import { getPublishedContent } from '@/lib/site/cms';
import { publicContent } from '@/lib/site/content';

// ISR: konten dari CMS. Diperbarui saat terbit (revalidatePath('/')), paling lambat tiap jam.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPublishedContent();
  return {
    title: seo.title,
    description: seo.description,
    openGraph: { title: seo.title, description: seo.description, ...(seo.ogImage ? { images: [seo.ogImage] } : {}) },
  };
}

export default async function Page() {
  return <HomePage content={publicContent(await getPublishedContent())} />;
}
