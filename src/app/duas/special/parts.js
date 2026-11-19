'use client';
import { tx } from '@/lib/special-duas';

export function GradeBadge({ d, ui }) {
  const t = tx(ui);
  const c = d.grade.class || '';
  const label = c === 'q' ? t.grade.q : `${t.grade[c] || d.grade.label}`;
  return <span className={`sd-grade g-${c || 'n'}`} title={d.grade.label}>{label}{d.grade.differ ? ' *' : ''}</span>;
}
