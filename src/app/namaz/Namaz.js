'use client';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/ui';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
const FILE = `${BASE}/books/Namaz-Book.pdf`;

const CONTENTS = [
  { ur: 'نماز بہتر کرنے کے ۷ اصول، شرائط، وضو، اذان کی دعا', en: '7 rules for a better prayer, conditions, wudu, adhan dua' },
  { ur: 'تکبیر سے سلام تک ۱۳ مراحل — ہر دعا عربی اور اردو میں، حدیث کا حوالہ ساتھ', en: '13 steps from takbir to salam, every dua in Arabic and Urdu with its hadith reference' },
  { ur: 'رفع الیدین، ہاتھ باندھنا، رکوع، سجدہ، تشہد — صحیح احادیث سے', en: 'Raising the hands, hand position, ruku, sajdah, tashahhud, from authentic hadith' },
  { ur: 'سلام کے بعد کے اذکار، رکعات، وتر، جنازہ، سجدۂ سہو', en: 'Dhikr after prayer, rak‘at table, witr, janazah, sajda sahw' },
  { ur: 'سورۃ الفاتحہ اور چھوٹی سورتیں — عربی اور اردو', en: 'Al-Fatiha and short surahs in Arabic and Urdu' }
];

export default function Namaz() {
  const { t, settings } = useApp();
  const ur = settings.ui === 'ur' || settings.ui === 'ar';
  return (
    <div className="container narrow">
      <div className="page-head">
        <h1>{t('namaz')}</h1>
        <p className="muted">{t('namazDesc')}</p>
      </div>
      <div className="card pad stack">
        <div className="row">
          <a className="btn primary" href={FILE} download="Namaz-Book.pdf">{Icon.next}{t('namazDownload')}</a>
          <a className="btn" href={FILE} target="_blank" rel="noopener">PDF ↗</a>
          <span className="spacer" />
          <span className="muted">{t('namazPages')}</span>
        </div>
        <ul style={{ margin: 0, paddingInlineStart: 20, display: 'grid', gap: 8 }}>
          {CONTENTS.map((c) => <li key={c.en}>{ur ? c.ur : c.en}</li>)}
        </ul>
      </div>
    </div>
  );
}
