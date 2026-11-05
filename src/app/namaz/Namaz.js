'use client';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/ui';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
const FILE = `${BASE}/books/Namaz-Book.pdf`;

/** The prayer book, readable on the page (Urdu, with Arabic duas and hadith references). */
export default function Namaz({ html, toc }) {
  const { t } = useApp();
  return (
    <div className="container narrow">
      <div className="page-head">
        <p className="eyebrow">{t('namaz')}</p>
        <h1 lang="ur" className="nb-title">نماز کی کتاب</h1>
        <p className="muted" lang="ur" dir="rtl">تکبیر سے سلام تک — قرآن اور صحیح احادیث کے مطابق، ہر بات کے ساتھ حدیث کا حوالہ</p>
        <div className="row">
          <a className="btn" href={FILE} download="Namaz-Book.pdf">{Icon.next}{t('namazDownload')} (PDF)</a>
        </div>
      </div>
      <nav className="nb-toc" aria-label="Contents" lang="ur" dir="rtl">
        {toc.map((x) => <a key={x.id} className="chip" href={`#${x.id}`}>{x.t}</a>)}
      </nav>
      <article className="nb" lang="ur" dir="rtl" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
