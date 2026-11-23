'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadStreak, onStreakChange } from '@/lib/reading-log';
import { lastWeek, streakStats } from '@/lib/streak';

export function useStreak() {
  const [rec, setRec] = useState(null);
  useEffect(() => { setRec(loadStreak()); return onStreakChange(() => setRec(loadStreak())); }, []);
  return rec;
}

/** Compact streak card (home page) or full panel (progress page). */
export default function StreakCard({ full = false }) {
  const rec = useStreak();
  if (!rec) return null;
  const s = streakStats(rec);
  const week = lastWeek(rec);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const Body = (
    <>
      <div className="sk-main">
        <span className="sk-flame" aria-hidden="true">🔥</span>
        <span>
          <strong className="sk-num">{s.current}</strong> <span className="sk-label">{s.current === 1 ? 'day' : 'days'} in a row</span>
          <span className="muted small sk-sub">Best: {s.best} · Today: {s.todayCount} of {s.goal} read</span>
        </span>
      </div>
      <div className="sk-bar" role="progressbar" aria-valuemin={0} aria-valuemax={s.goal} aria-valuenow={Math.min(s.todayCount, s.goal)} aria-label="Today's reading goal"><i style={{ width: `${s.progress * 100}%` }} /></div>
      <ul className="sk-week" aria-label="Last 7 days">
        {week.map((d) => (
          <li key={d.key} className={`${d.met ? 'met' : d.count ? 'part' : ''} ${d.today ? 'today' : ''}`} title={`${d.key}: ${d.count} read`}>
            <span>{days[new Date(d.key + 'T12:00:00').getDay()]}</span>
          </li>
        ))}
      </ul>
      {s.goalMet && <p className="small sk-done">Goal reached today. Keep going.</p>}
    </>
  );
  if (full) return <section className="card pad sk-card">{Body}</section>;
  return <Link href="/progress/" className="card pad sk-card sk-link" aria-label="Reading streak. Open my progress">{Body}</Link>;
}
