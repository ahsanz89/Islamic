import { Suspense } from 'react';
import { readCollections, readGrades } from '@/lib/server-data';
import GradesBrowser from './GradesBrowser';

export const metadata = { title: 'Hadith by grade', description: "Browse the hadith of every book by grade: Sahih, Hasan, Da'if and Mawdu'." };

export default function Page() {
  const { collections } = readCollections();
  const grades = readGrades();
  const books = collections.map((c) => ({ id: c.id, en: c.en, ar: c.ar, ur: c.ur, count: c.count, g: grades[c.id] || null }));
  return <Suspense><GradesBrowser books={books} /></Suspense>;
}
