import { Suspense } from 'react';
import HadithPage from './HadithPage';

export const metadata = { title: 'Hadith' };

export default function Page() {
  return <Suspense fallback={<div className="container"><div className="empty" style={{ marginTop: 32 }}>…</div></div>}><HadithPage /></Suspense>;
}
