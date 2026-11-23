'use client';
import Link from 'next/link';
import PrayerTimes from '@/components/PrayerTimes';
import Qibla from './Qibla';
import Reminders from './Reminders';

export default function PrayerPage() {
  return (
    <div className="container narrow">
      <header className="page-head">
        <nav className="breadcrumb"><Link href="/">Home</Link><span>/</span></nav>
        <h1>Prayer times and Qibla</h1>
        <p className="muted" style={{ margin: 0 }}>Times are worked out in your browser from your city. Your place never leaves this device. Please check them against your local mosque.</p>
      </header>
      <div className="pr-grid">
        <div className="prayer-page"><PrayerTimes /></div>
        <Qibla />
        <Reminders />
      </div>
    </div>
  );
}
