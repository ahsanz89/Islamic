import { readSurahs } from '@/lib/server-data';
import SurahList from './SurahList';

export const metadata = { title: 'Quran' };

export default function Page() {
  return <SurahList surahs={readSurahs().surahs} />;
}
