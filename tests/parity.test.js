import { beforeEach, describe, expect, it } from 'vitest';
import { loadStreak, recordRead, setGoal } from '../src/lib/reading-log';
import { streakStats } from '../src/lib/streak';
import { exportText, mergeSnapshots, parseBackup, readLocalSnapshot, restoreFrom } from '../src/lib/backup';
import { qiblaBearing, distanceKm } from '../src/app/prayer/Qibla';
import { plan } from '../src/app/prayer/Reminders';

beforeEach(() => localStorage.clear());

describe('reading streak (web)', () => {
  it('counts each ayah, page or hadith once a day', () => {
    expect(recordRead('q:1:1')).toBe(true);
    expect(recordRead('q:1:1')).toBe(false);
    expect(recordRead('m:293')).toBe(true);
    expect(streakStats(loadStreak()).todayCount).toBe(2);
  });
  it('keeps a streak over consecutive days and the goal', () => {
    const d = (n) => new Date(2026, 10, n, 12);
    recordRead('a', d(1)); recordRead('b', d(2)); recordRead('c', d(3));
    expect(streakStats(loadStreak(), d(3)).current).toBe(3);
    expect(streakStats(loadStreak(), d(5)).current).toBe(0);
    setGoal(2);
    expect(loadStreak().goal).toBe(2);
    expect(loadStreak().days['2026-11-02']).toBe(1);
  });
});

describe('backup (web <-> app)', () => {
  it('round-trips, rejects damaged text, and merges without deleting', () => {
    localStorage.setItem('dalil.learn.v1', JSON.stringify({ passed: { 1: true } }));
    localStorage.setItem('hl.bookmarks', JSON.stringify([{ key: 'q:1:1', title: 'Fatiha 1:1' }]));
    recordRead('x');
    const text = exportText(readLocalSnapshot());
    expect(text.startsWith('DALIL-BACKUP-1\n')).toBe(true);
    expect(() => parseBackup(text.replace('passed', 'pxssed'))).toThrow();
    expect(() => parseBackup('hello')).toThrow();
    localStorage.clear();
    localStorage.setItem('hl.bookmarks', JSON.stringify([{ key: 'q:2:255', title: 'Kursi' }]));
    restoreFrom(text);
    expect(JSON.parse(localStorage.getItem('dalil.learn.v1')).passed[1]).toBe(true);
    expect(JSON.parse(localStorage.getItem('hl.bookmarks')).map((b) => b.key).sort()).toEqual(['q:1:1', 'q:2:255']);
    expect(streakStats(loadStreak()).todayCount).toBe(1);
    restoreFrom(text); // restoring twice adds nothing new
    expect(JSON.parse(localStorage.getItem('hl.bookmarks'))).toHaveLength(2);
  });
  it('restores a backup made by the mobile app (no web section)', () => {
    const snap = { v: 1, at: 5, settings: { streak: { days: { '2026-11-01': 4, '2026-11-02': 6 }, goal: 5 }, onboarded: true }, favs: ['d1'], learn: { passed: { 2: true } }, arabic: { lang: 'ur' }, speed: 'normal' };
    restoreFrom(exportText(snap));
    expect(loadStreak().days['2026-11-02']).toBe(6);
    expect(JSON.parse(localStorage.getItem('dalil.arabic.v1')).lang).toBe('ur');
    expect(JSON.parse(localStorage.getItem('dalil.special-dua-favs'))).toEqual(['d1']);
  });
  it('merge keeps the larger count per day', () => {
    const m = mergeSnapshots({ at: 1, settings: { streak: { days: { a: 3 }, goal: 5 } } }, { at: 2, settings: { streak: { days: { a: 5, b: 1 } } } });
    expect(m.settings.streak.days).toEqual({ a: 5, b: 1 });
  });
});

describe('Qibla and reminders', () => {
  it('gives the known Qibla bearings', () => {
    expect(qiblaBearing(51.5074, -0.1278)).toBeGreaterThan(118);
    expect(qiblaBearing(51.5074, -0.1278)).toBeLessThan(120);
    expect(qiblaBearing(40.7128, -74.006)).toBeGreaterThan(57);
    expect(qiblaBearing(40.7128, -74.006)).toBeLessThan(60);
    expect(qiblaBearing(24.8607, 67.0011)).toBeGreaterThan(265);
    expect(distanceKm({ lat: 24.8607, lon: 67.0011 }, { lat: 21.4225, lon: 39.8262 })).toBeGreaterThan(2700);
  });
  it('plans only the chosen prayers, in order, in the future', () => {
    localStorage.setItem('hl-place', JSON.stringify({ name: 'Karachi', lat: 24.8607, lon: 67.0011, method: 'Karachi', asr: 'hanafi' }));
    const now = new Date('2026-11-23T00:00:00Z');
    const all = plan({ on: true, prayers: {}, reading: false }, now);
    expect(all.length).toBeGreaterThanOrEqual(8);
    expect(all.every((r, i) => r.at > now && (i === 0 || r.at >= all[i - 1].at))).toBe(true);
    const only = plan({ on: true, prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: true }, reading: false }, now);
    expect(only.every((r) => r.title === 'Isha time')).toBe(true);
    expect(plan({ on: false, prayers: {}, reading: true, readingAt: '20:00' }, now)[0].title).toBe('Time to read');
  });
});
