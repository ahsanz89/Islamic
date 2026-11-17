import { notFound } from 'next/navigation';
import LevelView from './LevelView';
import { LEVELS } from '@/lib/learn-data';

export const dynamicParams = false;
export const generateStaticParams = () => LEVELS.map((l) => ({ level: String(l.n) }));
export const generateMetadata = async ({ params }) => {
  const { level } = await params;
  const l = LEVELS.find((x) => String(x.n) === level);
  return { title: l ? `Level ${l.n}: ${l.title}` : 'Learn Quran' };
};

export default async function Page({ params }) {
  const { level } = await params;
  if (!LEVELS.find((x) => String(x.n) === level)) notFound();
  return <LevelView n={Number(level)} />;
}
