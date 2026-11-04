import { Suspense } from 'react';
import { readCollections } from '@/lib/server-data';
import Search from './Search';

export const metadata = { title: 'Search' };

export default function Page() {
  const { collections } = readCollections();
  return <Suspense><Search collections={collections} /></Suspense>;
}
