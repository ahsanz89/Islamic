import { readCollections } from '@/lib/server-data';
import CollectionsList from './CollectionsList';

export const metadata = { title: 'Collections' };

export default function Page() {
  const { collections, groups } = readCollections();
  return <CollectionsList collections={collections} groups={groups} />;
}
