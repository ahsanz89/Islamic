import { Suspense } from 'react';
import Roots from './Roots';

export const metadata = { title: 'Quran root words' };

export default function Page() {
  return <Suspense><Roots /></Suspense>;
}
