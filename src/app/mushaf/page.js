import { Suspense } from 'react';
import { readSurahs } from '@/lib/server-data';
import MushafReader from './MushafReader';

export const metadata = { title: 'Mushaf pages', description: 'Read the Quran page by page in the 15-line Madinah Mushaf layout.' };

export default function Page() {
  const surahs = readSurahs().surahs.map((s) => ({ n: s.n, name: s.name, en: s.en, ar: s.ar }));
  return <Suspense><MushafReader surahs={surahs} /></Suspense>;
}
