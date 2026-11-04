import { readCollection, readCollections } from '@/lib/server-data';
import SectionReader from './SectionReader';

export function generateStaticParams() {
  const out = [];
  for (const c of readCollections().collections) {
    for (const s of readCollection(c.id).sections) out.push({ id: c.id, sec: s.id });
  }
  return out;
}

export async function generateMetadata({ params }) {
  const { id, sec } = await params;
  const c = readCollection(id);
  const s = c.sections.find((x) => x.id === sec);
  return { title: `${c.en} · ${s?.title || sec}` };
}

export default async function Page({ params }) {
  const { id, sec } = await params;
  const col = readCollection(id);
  const idx = col.sections.findIndex((s) => s.id === sec);
  const { sections, ...meta } = col;
  return <SectionReader col={meta} sec={sections[idx]} prev={sections[idx - 1] || null} next={sections[idx + 1] || null} />;
}
