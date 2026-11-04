'use client';
import Link from 'next/link';
import { useApp } from '@/components/Providers';
import { hadithHref } from '@/components/HadithCard';

const linkFor = (b) => (b.type === 'hadith' ? hadithHref(b.c, b.n) : b.type === 'ayah' ? `/quran/${b.s}/#v${b.v}` : `/duas/#${b.id}`);

export default function Bookmarks() {
  const { t, bookmarks, toggleBookmark } = useApp();
  return (
    <div className="container narrow">
      <div className="page-head"><h1>{t('bookmarks')}</h1></div>
      {!bookmarks.length ? <div className="empty">{t('emptyBookmarks')}</div> : (
        <div className="stack">
          {bookmarks.map((b) => (
            <div key={b.key} className="card pad row" style={{ alignItems: 'flex-start' }}>
              <Link href={linkFor(b)} style={{ flex: 1, color: 'var(--ink)' }}>
                <strong>{b.title}</strong>
                {b.preview ? <p className="muted small" style={{ margin: '4px 0 0' }} dir="auto">{b.preview}…</p> : null}
              </Link>
              <button className="btn small" onClick={() => toggleBookmark(b)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
