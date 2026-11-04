import { createRoot } from 'react-dom/client';
import { Component, Suspense, useEffect, useState } from 'react';
import { Providers, useApp } from '@/components/Providers';
import { Footer, Header } from '@/components/ui';
import Home from '@/app/Home';
import CollectionsList from '@/app/collections/CollectionsList';
import CollectionView from '@/app/c/[id]/CollectionView';
import SectionReader from '@/app/c/[id]/[sec]/SectionReader';
import HadithPage from '@/app/hadith/HadithPage';
import SurahList from '@/app/quran/SurahList';
import SurahReader from '@/app/quran/[s]/SurahReader';
import Roots from '@/app/quran/roots/Roots';
import Search from '@/app/search/Search';
import Duas from '@/app/duas/Duas';
import Glossary from '@/app/glossary/Glossary';
import Narrators from '@/app/narrators/Narrators';
import Bookmarks from '@/app/bookmarks/Bookmarks';
import AboutView from '@/app/about/AboutView';
import { getJSON } from '@/lib/client-data';
import { initRouter, useLocationPath } from './router';

/** Loads JSON files, then renders. */
function WithData({ paths, children }) {
  const { t } = useApp();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  const key = paths.join('|');
  useEffect(() => {
    let live = true;
    setData(null);
    Promise.all(paths.map(getJSON)).then((d) => live && setData(d)).catch(() => live && setErr(true));
    return () => { live = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (err) return <div className="container"><div className="empty" style={{ marginTop: 32 }}>{t('notFound')}</div></div>;
  if (!data) return <div className="container"><div className="empty" style={{ marginTop: 32 }}>{t('loading')}</div></div>;
  return children(...data);
}

function Route() {
  const p = useLocationPath();
  const path = p.split(/[?#]/)[0];
  const seg = path.split('/').filter(Boolean);

  if (!seg.length) return <WithData paths={['collections.json']}>{(c) => <Home collections={c.collections} groups={c.groups} />}</WithData>;
  switch (seg[0]) {
    case 'collections':
      return <WithData paths={['collections.json']}>{(c) => <CollectionsList collections={c.collections} groups={c.groups} />}</WithData>;
    case 'c':
      if (!seg[2]) return <WithData paths={[`c/${seg[1]}.json`]}>{(col) => <CollectionView col={col} />}</WithData>;
      return (
        <WithData paths={[`c/${seg[1]}.json`]}>
          {(col) => {
            const { sections, ...meta } = col;
            const i = sections.findIndex((s) => s.id === seg[2]);
            return <SectionReader col={meta} sec={sections[i]} prev={sections[i - 1] || null} next={sections[i + 1] || null} />;
          }}
        </WithData>
      );
    case 'hadith':
      return <Suspense><HadithPage /></Suspense>;
    case 'quran':
      if (seg[1] === 'roots') return <Roots />;
      if (seg[1]) {
        return (
          <WithData paths={['q/surahs.json']}>
            {({ surahs, translators }) => {
              const n = Number(seg[1]);
              return <SurahReader surah={surahs[n - 1]} translators={translators} prev={surahs[n - 2] || null} next={surahs[n] || null} />;
            }}
          </WithData>
        );
      }
      return <WithData paths={['q/surahs.json']}>{(q) => <SurahList surahs={q.surahs} />}</WithData>;
    case 'search':
      return <WithData paths={['collections.json']}>{(c) => <Search key={p} collections={c.collections} />}</WithData>;
    case 'duas':
      return <WithData paths={['duas.json']}>{(d) => <Duas data={d} />}</WithData>;
    case 'glossary':
      return <WithData paths={['glossary.json']}>{(g) => <Glossary data={g} />}</WithData>;
    case 'narrators':
      return <Narrators />;
    case 'bookmarks':
      return <Bookmarks />;
    case 'about':
      return <WithData paths={['collections.json', 'q/surahs.json']}>{(c, q) => <AboutView collections={c.collections} translators={q.translators} />}</WithData>;
    default:
      return <WithData paths={['collections.json']}>{(c) => <Home collections={c.collections} groups={c.groups} />}</WithData>;
  }
}

class Boundary extends Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div className="container"><div className="empty" style={{ marginTop: 32, textAlign: 'start' }}>
          <strong>Something went wrong on this page.</strong>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{String(this.state.err?.stack || this.state.err).slice(0, 1200)}</pre>
          <button className="btn" onClick={() => { this.setState({ err: null }); }}>Try again</button>
        </div></div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <Providers>
      <Header />
      <main id="main"><Boundary key={useLocationPath()}><Route /></Boundary></main>
      <Footer />
    </Providers>
  );
}

initRouter();
createRoot(document.getElementById('root')).render(<App />);
