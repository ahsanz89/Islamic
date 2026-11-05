'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from './Providers';
import { LANGUAGES, LANG_NAMES } from '@/lib/i18n';
import { getJSON } from '@/lib/client-data';
import { AudioSettings } from '@/components/AudioPlayer';

/** Brand loading state (DALIL mark). */
export function Loader({ label }) {
  return <div className="dalil-loader" role="status">{Icon.logo}<span>{label}</span></div>;
}

/** Translated interface text. */
export function T({ k, vars }) {
  const { t } = useApp();
  return <>{t(k, vars)}</>;
}

/** A collection's name in the interface language. */
export function CName({ c }) {
  const { settings } = useApp();
  if (!c) return null;
  if (settings.ui === 'ur') return <>{c.ur || c.en}</>;
  if (settings.ui === 'ar') return <>{c.ar || c.en}</>;
  return <>{c.en}</>;
}

const S = (d, extra = {}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...extra}>{d}</svg>
);

export const Icon = {
  search: S(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  globe: S(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" /></>),
  settings: S(<><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>),
  bookmark: S(<path d="M6 3h12v18l-6-4-6 4z" />),
  bookmarkOn: S(<path d="M6 3h12v18l-6-4-6 4z" />, { fill: 'currentColor' }),
  copy: S(<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>),
  share: S(<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></>),
  back: S(<path d="m15 6-6 6 6 6" />, { className: 'flip-rtl' }),
  next: S(<path d="m9 6 6 6-6 6" />, { className: 'flip-rtl' }),
  home: S(<><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></>),
  books: S(<><path d="M4 4h5v16H4zM10 4h5v16h-5z" /><path d="m16 5 4 1-3 14-4-1" /></>),
  quran: S(<><path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5z" /><path d="M12 6v14" /></>),
  hands: S(<><path d="M7 11V6a2 2 0 0 1 4 0v5" /><path d="M13 11V6a2 2 0 0 1 4 0v8a6 6 0 0 1-12 0v-2" /></>),
  glossary: S(<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M8 7h7M8 11h5" /></>),
  people: S(<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14a5 5 0 0 1 5 5" /></>),
  filter: S(<path d="M4 5h16l-6 8v5l-4 2v-7z" />),
  close: S(<path d="M6 6l12 12M18 6 6 18" />),
  sun: S(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
  moon: S(<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />),
  arrow: S(<path d="M5 12h14M13 6l6 6-6 6" />, { className: 'flip-rtl' }),
  enter: S(<><path d="M20 6v6a3 3 0 0 1-3 3H5" /><path d="m9 11-4 4 4 4" /></>),
  logo: (
    <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#123f35" />
      <g fill="none" stroke="#f7f5ef" strokeWidth="2.6" strokeLinejoin="miter">
        <rect x="18.5" y="18.5" width="27" height="27" />
        <rect x="18.5" y="18.5" width="27" height="27" transform="rotate(45 32 32)" />
      </g>
      <rect x="27.6" y="27.6" width="8.8" height="8.8" transform="rotate(45 32 32)" fill="#d5b779" />
    </svg>
  )
};

// Main navigation: the four things people come for, then a "More" menu.
const NAV_MAIN = [
  ['/quran/', 'quran'],
  ['/collections/', 'collections'],
  ['/duas/', 'duas'],
  ['/namaz/', 'namaz']
];
const NAV_MORE = [
  ['/narrators/', 'narrators'],
  ['/glossary/', 'glossary'],
  ['/bookmarks/', 'bookmarks'],
  ['/about/', 'about']
];
const NAV = [...NAV_MAIN, ...NAV_MORE.slice(0, 3)];
const MORE = { en: 'More', ur: 'مزید', ar: 'المزيد' };

function MoreMenu({ path }) {
  const { t, settings } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', off);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc); };
  }, [open]);
  useEffect(() => { setOpen(false); }, [path]);
  const active = NAV_MORE.some(([p]) => path.startsWith(p));
  return (
    <div className="nav-more" ref={ref}>
      <button type="button" className="nav-more-btn" aria-haspopup="menu" aria-expanded={open} aria-current={active ? 'page' : undefined} onClick={() => setOpen(!open)}>
        {MORE[settings.ui] || MORE.en}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="nav-menu" role="menu">
          {NAV_MORE.map(([p, k]) => (
            <Link key={p} href={p} role="menuitem" aria-current={path.startsWith(p) ? 'page' : undefined}>{t(k)}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

const TABS = [
  ['/', 'home', 'home'],
  ['/collections/', 'collections', 'books'],
  ['/quran/', 'quran', 'quran'],
  ['/search/', 'search', 'search'],
  ['/bookmarks/', 'bookmarks', 'bookmark']
];

export function Header() {
  const { t, settings } = useApp();
  const path = usePathname() || '/';
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState(false);
  const isHome = path === '/';
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCmd((v) => !v); }
      else if (e.key === '/' && !typing) { e.preventDefault(); setCmd(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <header className="site-header">
        <div className="bar">
          {!isHome && (
            <button className="btn ghost icon" aria-label={t('back')} title={t('back')} onClick={() => router.back()}>{Icon.back}</button>
          )}
          <Link href="/" className="brand" aria-label="DALIL دليل">
            {Icon.logo}
            <span className="brand-text">
              <span className="brand-name">DALIL</span>
              <span className="brand-sub" lang="ar">دليل</span>
            </span>
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV_MAIN.map(([p, k]) => (
              <Link key={p} href={p} aria-current={path.startsWith(p) ? 'page' : undefined}>{t(k)}</Link>
            ))}
            <MoreMenu path={path} />
          </nav>
          <div className="tools">
            <button className="cmd-trigger" onClick={() => setCmd(true)} aria-label={t('search')} aria-keyshortcuts="Control+K Meta+K /">
              {Icon.search}<span className="t">{t('search')}…</span><kbd>Ctrl K</kbd>
            </button>
            <button className="btn ghost icon" aria-label={t('settings')} title={t('settings')} onClick={() => setOpen(true)}>{Icon.settings}</button>
          </div>
        </div>
        {open && <SettingsDrawer onClose={() => setOpen(false)} />}
      </header>
      {cmd && <CommandPalette onClose={() => setCmd(false)} />}
      <nav className="tabbar" aria-label="Tabs">
        {TABS.map(([p, k, ic]) => (
          <Link key={p} href={p} aria-current={(p === '/' ? isHome : path.startsWith(p)) ? 'page' : undefined}>
            {Icon[ic]}<span>{t(k)}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

/** Ctrl/Cmd+K or "/" : search, jump to any page or surah, switch theme or language. */
function CommandPalette({ onClose }) {
  const { t, settings, update } = useApp();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [surahs, setSurahs] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); getJSON('q/surahs.json').then((d) => setSurahs(d.surahs || [])).catch(() => {}); }, []);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const go = useCallback((href) => { onClose(); router.push(href); }, [onClose, router]);
  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = [];
    if (term) out.push({ g: t('search'), label: `${t('searchFor')} “${q.trim()}”`, icon: Icon.search, run: () => go(`/search/?q=${encodeURIComponent(q.trim())}`) });
    const pages = [['/', 'home', Icon.home], ...NAV.map(([p, k]) => [p, k, null]), ['/search/', 'search', Icon.search], ['/about/', 'about', null]];
    const seen = new Set();
    for (const [p, k, ic] of pages) {
      const label = t(k);
      if (seen.has(p) || (term && !`${label} ${k}`.toLowerCase().includes(term))) continue;
      seen.add(p);
      out.push({ g: t('goTo'), label, icon: ic || Icon.arrow, run: () => go(p) });
    }
    if (term) {
      const sm = surahs.filter((x) => String(x.n) === term || `${x.name} ${x.en} ${x.ar}`.toLowerCase().includes(term)).slice(0, 6);
      for (const x of sm) out.push({ g: t('quran'), label: `${x.n}. ${x.name}`, sub: `${x.en} · ${x.verses}`, icon: Icon.quran, run: () => go(`/quran/${x.n}/`) });
    }
    const acts = [
      { label: settings.theme === 'dark' ? t('light') : t('dark'), icon: settings.theme === 'dark' ? Icon.sun : Icon.moon, run: () => { update({ theme: settings.theme === 'dark' ? 'light' : 'dark' }); onClose(); } },
      ...LANGUAGES.map((l) => ({ label: l.native, sub: t('uiLanguage'), icon: Icon.arrow, run: () => { update({ ui: l.code }); onClose(); } }))
    ].filter((a) => !term || `${a.label} ${a.sub || ''}`.toLowerCase().includes(term));
    for (const a of acts) out.push({ g: t('actions'), ...a });
    return out;
  }, [q, surahs, t, settings.theme, go, update, onClose]);

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); items[sel]?.run(); }
  };
  let lastG = null;
  return (
    <div className="cmdk-wrap" onMouseDown={onClose}>
      <div className="cmdk" role="dialog" aria-modal="true" aria-label={t('search')} onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <div className="cmdk-input">
          {Icon.search}
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('cmdPlaceholder')} dir="auto" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-label={t('search')} />
          <kbd>Esc</kbd>
        </div>
        <div className="cmdk-list" id="cmdk-list" role="listbox" ref={listRef}>
          {items.map((it, i) => {
            const head = it.g !== lastG ? <div className="cmdk-group" key={`g${i}`}>{it.g}</div> : null;
            lastG = it.g;
            return (
              <div key={i}>
                {head}
                <button className="cmdk-item" role="option" aria-selected={i === sel} onMouseEnter={() => setSel(i)} onClick={it.run}>
                  {it.icon}<span>{it.label}</span>{it.sub && <span className="sub">{it.sub}</span>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="cmdk-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> {t('hintMove')}</span><span><kbd>Enter</kbd> {t('hintOpen')}</span><span><kbd>Esc</kbd> {t('hintClose')}</span></div>
      </div>
    </div>
  );
}

/** Ambient motion: scroll progress, reveal on scroll, pointer spotlight, page-in. Respects reduced motion via CSS. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <button type="button" className={`to-top ${show ? 'show' : ''}`} aria-label="Back to top" tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </button>
  );
}

export function Fx() {
  const path = usePathname();
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        h.style.setProperty('--sp', max > 0 ? Math.min(1, h.scrollTop / max).toFixed(4) : '0');
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onMove = (e) => {
      const el = e.target?.closest?.('.spot');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); document.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);
  useEffect(() => {
    const main = document.getElementById('main');
    if (main) { main.classList.remove('page-in'); void main.offsetWidth; main.classList.add('page-in'); }
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    const scan = () => {
      document.querySelectorAll('main section, main .hadith, main .colcard, main .result, main .tile, main .feature, main .list, main .card.pad').forEach((el) => {
        if (el.dataset.rv) return;
        el.dataset.rv = '1';
        el.classList.add('rv');
        io.observe(el);
      });
    };
    scan();
    const t1 = setTimeout(scan, 350), t2 = setTimeout(scan, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); io.disconnect(); };
  }, [path]);
  return <div className="scroll-bar" aria-hidden="true" />;
}

export function LanguageSelect({ id = 'ui-lang' }) {
  const { settings, update, t } = useApp();
  return (
    <>
      <label htmlFor={id} className="sr-only">{t('uiLanguage')}</label>
      <select id={id} className="input" value={settings.ui} onChange={(e) => update({ ui: e.target.value })}>
        {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
      </select>
    </>
  );
}

export const TR_CHOICES = ['ur', 'en', 'bn', 'id', 'tr', 'fr', 'ru', 'ta', 'hi'];

export function SettingsDrawer({ onClose }) {
  const { settings, update, t } = useApp();
  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label={t('settings')} onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="row"><h2 style={{ margin: 0 }}>{t('settings')}</h2><span className="spacer" /><button className="btn ghost icon" aria-label="Close" onClick={onClose}>{Icon.close}</button></div>
        <div className="field"><span>{t('uiLanguage')}</span><LanguageSelect id="drawer-lang" /></div>
        <div className="field">
          <span>{t('theme')}</span>
          <div className="segmented">
            {['light', 'dark', 'system'].map((m) => (
              <button key={m} aria-pressed={settings.theme === m} onClick={() => update({ theme: m })}>{t(m)}</button>
            ))}
          </div>
        </div>
        <ReadingControls />
        <AudioSettings />
        <div className="field">
          <span>{t('translationsShown')}</span>
          <TranslationChips />
        </div>
      </div>
    </div>
  );
}

export function TranslationChips({ choices = TR_CHOICES }) {
  const { settings, update } = useApp();
  const toggle = (l) => update({ tr: settings.tr.includes(l) ? settings.tr.filter((x) => x !== l) : [...settings.tr, l] });
  return (
    <div className="row" style={{ gap: 6 }}>
      {choices.map((l) => (
        <button key={l} className="chip" aria-pressed={settings.tr.includes(l)} onClick={() => toggle(l)} lang={l}>{LANG_NAMES[l]}</button>
      ))}
    </div>
  );
}

function ReadingControls() {
  const { settings, update, t } = useApp();
  return (
    <div className="field">
      <span>{t('arabicSize')}</span>
      <div className="row">
        <button className="btn small icon" onClick={() => update({ arSize: Math.max(20, settings.arSize - 2) })} aria-label="Smaller Arabic text">A−</button>
        <span className="muted small" style={{ minWidth: 42, textAlign: 'center' }}>{settings.arSize}px</span>
        <button className="btn small icon" onClick={() => update({ arSize: Math.min(52, settings.arSize + 2) })} aria-label="Larger Arabic text">A+</button>
        <span className="spacer" />
        <button className="btn small" aria-pressed={settings.harakat} onClick={() => update({ harakat: !settings.harakat })}>{t('showHarakat')}</button>
      </div>
      <p className="ar sm" style={{ margin: 0 }}>إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ</p>
    </div>
  );
}

/** Sticky toolbar on reading pages: translations on/off, text size, vowel marks. */
const ALWAYS = { en: 'always shown', ur: 'ہمیشہ موجود', ar: 'يظهر دائمًا' };

/** Reading controls. `field` picks which saved list holds the chosen translations ('tr' for hadith, 'qtr' for the Quran).
 *  `arabicFixed` adds a locked "Arabic" badge: the Arabic text is never optional. */
export function ReadingBar({ choices = TR_CHOICES, extra, field = 'tr', arabicFixed = false }) {
  const { settings, update, t } = useApp();
  const sel = settings[field] || [];
  const toggle = (l) => update({ [field]: sel.includes(l) ? sel.filter((x) => x !== l) : [...sel, l] });
  return (
    <div className="readbar" role="toolbar" aria-label={t('settings')}>
      {arabicFixed && (
        <>
          <span className="chip fixed" aria-label={`${LANG_NAMES.ar}: ${ALWAYS[settings.ui] || ALWAYS.en}`} title={ALWAYS[settings.ui] || ALWAYS.en}>
            <span lang="ar">العربية</span> ✓
          </span>
          <span className="readbar-label">{t('translations')}:</span>
        </>
      )}
      {choices.map((l) => (
        <button key={l} className="chip" aria-pressed={sel.includes(l)} onClick={() => toggle(l)} lang={l}>{LANG_NAMES[l]}</button>
      ))}
      <span className="sep" />
      <button className="btn small" aria-pressed={settings.harakat} onClick={() => update({ harakat: !settings.harakat })} title={t('showHarakat')}>حَرَكَات</button>
      <button className="btn small icon" onClick={() => update({ arSize: Math.max(20, settings.arSize - 2) })} aria-label="Smaller Arabic text">A−</button>
      <button className="btn small icon" onClick={() => update({ arSize: Math.min(52, settings.arSize + 2) })} aria-label="Larger Arabic text">A+</button>
      {extra}
    </div>
  );
}

export function Footer() {
  const { t, settings, update } = useApp();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="brand-line">
          <strong>DALIL <span lang="ar" style={{ letterSpacing: 0 }}>دليل</span></strong>
          <span>{t('tagline')} {t('taglineSecond')}</span>
          <span className="small">{t('footerLicense')}</span>
        </div>
        <nav className="row" aria-label="Footer" style={{ gap: 16 }}>
          <Link href="/about/">{t('about')}</Link>
          <Link href="/about/#errors">{t('reportError')}</Link>
          <button className="btn ghost small" onClick={() => update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })} aria-label={t('dark_toggle')}>
            {settings.theme === 'dark' ? Icon.sun : Icon.moon}
          </button>
        </nav>
      </div>
    </footer>
  );
}

export function BookmarkButton({ item, small, iconOnly }) {
  const { isSaved, toggleBookmark, t } = useApp();
  const on = isSaved(item.key);
  return (
    <button className={`btn ghost ${small ? 'small' : ''} ${iconOnly ? 'icon' : ''}`} aria-pressed={on} onClick={() => toggleBookmark(item)} aria-label={on ? t('saved') : t('save')} title={on ? t('saved') : t('save')}>
      {on ? Icon.bookmarkOn : Icon.bookmark}{!iconOnly && <span className="hide-sm">{on ? t('saved') : t('save')}</span>}
    </button>
  );
}

export function CopyButton({ text, small, iconOnly }) {
  const { t } = useApp();
  const [done, setDone] = useState(false);
  return (
    <button
      className={`btn ghost ${small ? 'small' : ''} ${iconOnly ? 'icon' : ''}`}
      aria-label={t('copy')}
      title={t('copy')}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {}
      }}
    >
      {Icon.copy}{!iconOnly && <span className="hide-sm">{done ? t('copied') : t('copy')}</span>}{iconOnly && done ? '✓' : null}
    </button>
  );
}

export function ShareButton({ title, text, url, small }) {
  const { t } = useApp();
  return (
    <button
      className={`btn ghost ${small ? 'small' : ''}`}
      aria-label={t('share')}
      onClick={async () => {
        const u = url || window.location.href;
        try {
          if (navigator.share) await navigator.share({ title, text, url: u });
          else await navigator.clipboard.writeText(`${text || title}\n${u}`);
        } catch {}
      }}
    >
      {Icon.share}<span className="hide-sm">{t('share')}</span>
    </button>
  );
}
