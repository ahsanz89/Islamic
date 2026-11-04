import { readCollection, readCollections } from '@/lib/server-data';
import CollectionView from './CollectionView';

export function generateStaticParams() {
  return readCollections().collections.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const c = readCollection(id);
  return { title: `${c.en} · ${c.ar}`, description: `${c.en} (${c.ar}) by ${c.author}: ${c.count} hadith.` };
}

export default async function Page({ params }) {
  const { id } = await params;
  return <CollectionView col={readCollection(id)} />;
}
