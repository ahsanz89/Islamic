'use client';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from './Providers';
import { NAV, SALAH_PROMO, currentHref, pickLabel, sectionActive } from './nav-data';
import { Icon } from './ui';

const ArabicIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 17c3.5 0 4-4 7-4s3.5 4 7 4" /><path d="M12 13V6" /><circle cx="12" cy="4.5" r="1" /></svg>
);
// Icon comes from ui.js, which imports this file: read it only while rendering, never at load time.
const ICONS = new Proxy({}, { get: (_, k) => (k === 'arabic' ? ArabicIcon : Icon[k]) });
const Chevron = <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;

function Panel({ n, path, ui, onPick }) {
  const cur = currentHref(n, path);
  const promo = n.mega;
  return (
    <div className={`nav-panel ${promo ? 'mega' : ''}`} role="group" aria-label={pickLabel(n.label, ui)}>
      <div className="nav-cols">
        {n.groups.map((g, gi) => (
          <div className="nav-col" key={gi}>
            {g.title && <p className="nav-ctitle">{pickLabel(g.title, ui)}</p>}
            {g.items.map((i) => (
              <Link key={i.href} href={i.href} className="nav-item" aria-current={cur === i.href ? 'page' : undefined} onClick={onPick}>
                <span className="nl">{pickLabel(i.label, ui)}</span>
                {i.desc && <span className="nd">{pickLabel(i.desc, ui)}</span>}
              </Link>
            ))}
          </div>
        ))}
      </div>
      {promo && (
        <Link href="/learn-arabic/" className="nav-promo" onClick={onPick}>
          <strong>{pickLabel(SALAH_PROMO.title, ui)}</strong>
          <span>{pickLabel(SALAH_PROMO.short, ui)}</span>
          <span className="go">{pickLabel(SALAH_PROMO.five, ui)} {Icon.arrow}</span>
        </Link>
      )}
    </div>
  );
}

/** Desktop menu bar: dropdowns and a mega menu, opened by click, hover or keyboard. */
export function DesktopNav({ path }) {
  const { settings } = useApp();
  const ui = settings.ui;
  const [open, setOpen] = useState(null);
  const root = useRef(null);
  const timer = useRef(0);
  const close = useCallback((focus) => { setOpen((o) => { if (o && focus) root.current?.querySelector(`[data-nav="${o}"]`)?.focus(); return null; }); }, []);
  useEffect(() => { setOpen(null); }, [path]);
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(null); };
    const esc = (e) => { if (e.key === 'Escape') close(true); };
    document.addEventListener('pointerdown', off);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc); };
  }, [open, close]);
  const hover = (id) => ({
    onPointerEnter: (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(id), 90); },
    onPointerLeave: (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(timer.current); timer.current = setTimeout(() => setOpen((o) => (o === id ? null : o)), 160); }
  });
  const key = (e, n) => {
    const btns = [...root.current.querySelectorAll('[data-nav]')];
    const i = btns.indexOf(e.currentTarget);
    const dir = document.documentElement.dir === 'rtl' ? -1 : 1;
    if (e.key === 'ArrowRight') { e.preventDefault(); btns[(i + dir + btns.length) % btns.length].focus(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); btns[(i - dir + btns.length) % btns.length].focus(); }
    else if (e.key === 'ArrowDown' && n.groups) { e.preventDefault(); setOpen(n.id); setTimeout(() => root.current.querySelector(`#panel-${n.id} a`)?.focus(), 0); }
  };
  const menuKey = (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const links = [...e.currentTarget.querySelectorAll('a')];
    const i = links.indexOf(document.activeElement);
    e.preventDefault();
    const nx = e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : e.key === 'ArrowDown' ? Math.min(links.length - 1, i + 1) : i <= 0 ? -1 : i - 1;
    if (nx < 0) close(true); else links[nx].focus();
  };
  return (
    <nav className="site-nav" aria-label="Main" ref={root}>
      {NAV.map((n) => {
        const label = pickLabel(n.label, ui);
        const active = sectionActive(n, path);
        if (!n.groups) {
          return (
            <Link key={n.id} href={n.href} data-nav={n.id} className={`nav-top ${n.feature ? 'feature-link' : ''}`} aria-current={active ? 'page' : undefined} onKeyDown={(e) => key(e, n)}>
              {n.feature && <span className="nav-ic">{ICONS[n.icon]}</span>}{label}
            </Link>
          );
        }
        const isOpen = open === n.id;
        return (
          <div key={n.id} className={`nav-item-wrap ${n.mega ? 'is-mega' : ''}`} {...hover(n.id)}>
            <button type="button" data-nav={n.id} className="nav-top" aria-haspopup="true" aria-expanded={isOpen} aria-controls={`panel-${n.id}`} aria-current={active ? 'page' : undefined}
              onClick={() => setOpen(isOpen ? null : n.id)} onKeyDown={(e) => key(e, n)}>
              {label}{Chevron}
            </button>
            {isOpen && <div id={`panel-${n.id}`} onKeyDown={menuKey}><Panel n={n} path={path} ui={ui} onPick={() => setOpen(null)} /></div>}
          </div>
        );
      })}
    </nav>
  );
}

/** Mobile: a button in the header that opens a drawer with expandable categories. */
export function MobileMenu({ path }) {
  const { settings } = useApp();
  const ui = settings.ui;
  const [open, setOpen] = useState(false);
  const btn = useRef(null);
  const drawer = useRef(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    document.addEventListener('keydown', esc);
    setTimeout(() => drawer.current?.querySelector('a, button, summary')?.focus(), 0);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', esc); };
  }, [open]);
  const label = { en: 'Menu', ur: 'مینو', ar: 'القائمة' }[ui] || 'Menu';
  const closeL = { en: 'Close menu', ur: 'مینو بند کریں', ar: 'إغلاق القائمة' }[ui] || 'Close menu';
  return (
    <>
      <button ref={btn} type="button" className="btn ghost icon nav-burger" aria-label={label} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {open && createPortal(
        <div className="mm-wrap" onMouseDown={() => setOpen(false)}>
          <div id="mobile-menu" className="mm" role="dialog" aria-modal="true" aria-label={label} ref={drawer} onMouseDown={(e) => e.stopPropagation()}>
            <div className="mm-head">
              <strong>{label}</strong>
              <button type="button" className="btn ghost icon" aria-label={closeL} onClick={() => { setOpen(false); btn.current?.focus(); }}>{Icon.close}</button>
            </div>
            <Link href="/learn-arabic/" className="mm-promo" onClick={() => setOpen(false)}>
              <span className="nav-ic">{ArabicIcon}</span>
              <span><strong>{pickLabel(SALAH_PROMO.title, ui)}</strong><small>{pickLabel(SALAH_PROMO.short, ui)}</small></span>
            </Link>
            {NAV.filter((n) => n.groups || !n.feature).map((n) => {
              const cur = currentHref(n, path);
              if (!n.groups) return <Link key={n.id} href={n.href} className={`mm-link ${sectionActive(n, path) ? 'on' : ''}`} onClick={() => setOpen(false)}>{ICONS[n.icon]}<span>{pickLabel(n.label, ui)}</span></Link>;
              return (
                <details key={n.id} className="mm-sec" open={sectionActive(n, path) || n.id === 'learn'}>
                  <summary>{ICONS[n.icon]}<span>{pickLabel(n.label, ui)}</span>{Chevron}</summary>
                  <div className="mm-items">
                    {n.groups.flatMap((g) => g.items).map((i) => (
                      <Link key={i.href} href={i.href} aria-current={cur === i.href ? 'page' : undefined} onClick={() => setOpen(false)}>{pickLabel(i.label, ui)}</Link>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
