import { notFound } from 'next/navigation';
import ArabicLevel from './ArabicLevel';
import { LEVELS } from '@/lib/arabic-learn';

export const dynamicParams = false;
export const generateStaticParams = () => LEVELS.map((l) => ({ level: String(l.n) }));
export const generateMetadata = async ({ params }) => {
  const { level } = await params;
  const l = LEVELS.find((x) => String(x.n) === level);
  return { title: l ? `Learn Arabic · Level ${l.n}: ${l.en}` : 'Learn Arabic' };
};
export default async function Page({ params }) {
  const { level } = await params;
  if (!LEVELS.find((x) => String(x.n) === level)) notFound();
  return <ArabicLevel n={Number(level)} />;
}
