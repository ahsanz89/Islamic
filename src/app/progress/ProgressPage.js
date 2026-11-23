'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import StreakCard, { useStreak } from '@/components/StreakCard';
import { setGoal } from '@/lib/reading-log';
import { exportText, readLocalSnapshot, restoreFrom } from '@/lib/backup';

export default function ProgressPage() {
  const rec = useStreak();
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const file = useRef(null);

  const backup = () => exportText(readLocalSnapshot());
  const copy = async () => {
    setErr('');
    try { await navigator.clipboard.writeText(backup()); setMsg('Backup copied. Paste it into the DALIL app (Settings, Offline, Restore) or keep it safe.'); } catch { setErr('Your browser did not allow copying. Use "Download backup" instead.'); }
  };
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([backup()], { type: 'text/plain' }));
    a.download = `dalil-backup-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setMsg('Backup downloaded.');
  };
  const restore = (src) => {
    setErr(''); setMsg('');
    try {
      const m = restoreFrom(src);
      const days = m.settings.streak ? Object.keys(m.settings.streak.days).length : 0;
      setMsg(`Restored and merged. Nothing was deleted. Reading days: ${days}, bookmarks: ${(m.web.bookmarks || []).length}. Reload other pages to see everything.`);
      setText('');
    } catch (e) { setErr(e.message || 'The backup could not be restored.'); }
  };
  const onFile = async (e) => { const f = e.target.files && e.target.files[0]; if (f) restore(await f.text()); e.target.value = ''; };

  return (
    <div className="container narrow">
      <header className="page-head">
        <nav className="breadcrumb"><Link href="/">Home</Link><span>/</span></nav>
        <h1>My progress and backup</h1>
        <p className="muted" style={{ margin: 0 }}>Your reading streak and goal, and a backup you can carry between the DALIL app and this website. It all stays in this browser; DALIL has no account and no server.</p>
      </header>
      <div className="pr-grid">
        <StreakCard full />
        <section className="card pad stack">
          <h2 style={{ margin: 0 }}>Daily goal</h2>
          <p className="muted small" style={{ margin: 0 }}>A day counts when you read this many ayat, Mushaf pages or hadith. Each one is counted once a day.</p>
          <label className="pr-row">Items per day
            <input type="number" min="1" max="200" value={(rec && rec.goal) || 5} onChange={(e) => setGoal(e.target.value)} aria-label="Items to read per day" />
          </label>
        </section>
        <section className="card pad stack">
          <h2 style={{ margin: 0 }}>Backup and restore</h2>
          <p className="muted small" style={{ margin: 0 }}>The backup holds your streak, Learn Quran and Learn Arabic progress, saved special duas and, on this website, your bookmarks. Restoring merges it in: nothing is deleted or duplicated. A backup made in the app can be restored here, and the other way round. Bookmarks and website settings stay on the website; the app does not read them.</p>
          <div className="pr-row">
            <button className="btn small" onClick={copy}>Copy backup</button>
            <button className="btn small" onClick={download}>Download backup</button>
            <button className="btn small" onClick={() => file.current && file.current.click()}>Restore from file</button>
            <input ref={file} type="file" accept=".txt,text/plain" onChange={onFile} hidden aria-label="Choose a backup file" />
          </div>
          <label htmlFor="bk" className="small muted">Or paste a backup here</label>
          <textarea id="bk" className="bk-area" value={text} onChange={(e) => setText(e.target.value)} placeholder="DALIL-BACKUP-1…" spellCheck={false} />
          <div className="pr-row"><button className="btn small primary" disabled={!text.trim()} onClick={() => restore(text)}>Restore from pasted text</button></div>
          {msg && <p role="status" className="small" style={{ margin: 0 }}>{msg}</p>}
          {err && <p role="alert" className="small" style={{ margin: 0, color: 'var(--gold)' }}>{err}</p>}
        </section>
      </div>
    </div>
  );
}
