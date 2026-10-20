import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTemplate } from "@/components/PageTemplate";
import { pages } from "@/lib/site-content";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}/` },
    openGraph: {
      title: page.title,
      description: page.description,
      images: [{ url: page.image }],
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();
  return <PageTemplate page={page} />;
}
