import { readCollections, readSurahs } from '@/lib/server-data';
import AboutView from './AboutView';

export const metadata = { title: 'About & sources' };

export default function Page() {
  return <AboutView collections={readCollections().collections} translators={readSurahs().translators} />;
}
