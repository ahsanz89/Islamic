import { notFound } from 'next/navigation';
import DuaDetail from './DuaDetail';
import { SD, titleOf } from '@/lib/special-duas';

export const dynamicParams = false;
export const generateStaticParams = () => SD.duas.map((d) => ({ id: d.id }));
export const generateMetadata = async ({ params }) => {
  const { id } = await params;
  const d = SD.duas.find((x) => x.id === id);
  return { title: d ? titleOf(d, 'en') : 'Special Duas' };
};
export default async function Page({ params }) {
  const { id } = await params;
  if (!SD.duas.find((x) => x.id === id)) notFound();
  return <DuaDetail id={id} />;
}
