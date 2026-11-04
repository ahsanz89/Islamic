'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApp } from './Providers';
import { LANGUAGES, LANG_NAMES } from '@/lib/i18n';

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
  logo: (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="var(--brand)" />
      <g fill="none" stroke="var(--brand-ink)" strokeWidth="1.6">
        <rect x="10" y="10" width="12" height="12" rx="1" />
        <rect x="10" y="10" width="12" height="12" rx="1" transform="rotate(45 16 16)" />
      </g>
      <circle cx="16" cy="16" r="2.2" fill="var(--gold-soft)" />
    </svg>
  )
};

const NAV = [
  ['/collections/', 'collections'],
  ['/quran/', 'quran'],
  ['/duas/', 'duas'],
  ['/narrators/', 'narrators'],
  ['/glossary/', 'glossary'],
  ['/bookmarks/', 'bookmarks']
];

const TABS = [
  ['/', 'home', 'home'],
  ['/collections/', 'collections', 'books'],
  ['/quran/', 'quran', 'quran'],
  ['/search/', 'search', 'search'],
  ['/bookmarks/', 'bookmarks', 'bookmark']
];

export function Header() {
  const { t } = useApp();
  const path = usePathname() || '/';
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const isHome = path === '/';
  return (
    <>
      <header className="site-header">
        <div className="bar">
          {!isHome && (
            <button className="btn ghost icon" aria-label={t('back')} title={t('back')} onClick={() => router.back()}>{Icon.back}</button>
          )}
          <Link href="/" className="brand">{Icon.logo}<span>{t('appName')}</span></Link>
          <nav className="nav" aria-label="Main">
            {NAV.map(([p, k]) => (
              <Link key={p} href={p} aria-current={path.startsWith(p) ? 'page' : undefined}>{t(k)}</Link>
            ))}
          </nav>
          <div className="tools">
            {!path.startsWith('/search') && (
              <form className="header-search" role="search" onSubmit={(e) => { e.preventDefault(); router.push(`/search/?q=${encodeURIComponent(q)}`); }}>
                {Icon.search}
                <label htmlFor="hsq" className="sr-only">{t('search')}</label>
                <input id="hsq" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search') + '…'} dir="auto" />
              </form>
            )}
            <button className="btn ghost icon" aria-label={t('settings')} title={t('settings')} onClick={() => setOpen(true)}>{Icon.settings}</button>
          </div>
        </div>
        {open && <SettingsDrawer onClose={() => setOpen(false)} />}
      </header>
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
export function ReadingBar({ choices = TR_CHOICES, extra }) {
  const { settings, update, t } = useApp();
  const toggle = (l) => update({ tr: settings.tr.includes(l) ? settings.tr.filter((x) => x !== l) : [...settings.tr, l] });
  return (
    <div className="readbar" role="toolbar" aria-label={t('settings')}>
      {choices.map((l) => (
        <button key={l} className="chip" aria-pressed={settings.tr.includes(l)} onClick={() => toggle(l)} lang={l}>{LANG_NAMES[l]}</button>
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
        <span>{t('appName')} · {t('footerLicense')}</span>
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
