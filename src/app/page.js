import { readCollections } from '@/lib/server-data';
import Home from './Home';

export default function Page() {
  const { collections, groups } = readCollections();
  return <Home collections={collections} groups={groups} />;
}
