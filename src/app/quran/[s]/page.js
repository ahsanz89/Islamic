import { readSurahs } from '@/lib/server-data';
import SurahReader from './SurahReader';

export function generateStaticParams() {
  return readSurahs().surahs.map((s) => ({ s: String(s.n) }));
}

export async function generateMetadata({ params }) {
  const { s } = await params;
  const x = readSurahs().surahs[Number(s) - 1];
  return { title: `${x.n}. ${x.name} · ${x.ar}` };
}

export default async function Page({ params }) {
  const { s } = await params;
  const { surahs, translators } = readSurahs();
  return <SurahReader surah={surahs[Number(s) - 1]} translators={translators} prev={surahs[Number(s) - 2] || null} next={surahs[Number(s)] || null} />;
}
