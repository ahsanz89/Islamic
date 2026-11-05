import './globals.css';
import { Providers } from '@/components/Providers';
import { AudioBridge, AudioPlayer } from '@/components/AudioPlayer';
import { BackToTop, Footer, Fx, Header } from '@/components/ui';

export const metadata = {
  title: { default: 'DALIL (دليل) · Islamic Knowledge. Without Boundaries.', template: '%s · DALIL' },
  description: 'DALIL (دليل) is an independent, global Islamic knowledge platform: Quran, Hadith, Duas and prayer guidance in many languages. Explore. Learn. Understand.',
  applicationName: 'DALIL',
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/manifest.webmanifest`,
  openGraph: { title: 'DALIL · Islamic Knowledge. Without Boundaries.', siteName: 'DALIL', type: 'website' }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#123f35' }, { media: '(prefers-color-scheme: dark)', color: '#0c1613' }]
};

// Applies saved language, direction and theme before first paint.
const boot = `try{var s=JSON.parse(localStorage.getItem('hl.settings')||'{}');var d=document.documentElement;if(s.ui){d.lang=s.ui;d.dir=(s.ui==='ur'||s.ui==='ar')?'rtl':'ltr';}if(s.theme&&s.theme!=='system'){d.dataset.theme=s.theme;d.dataset.hlTheme='1';}if(s.arSize)d.style.setProperty('--ar-size',s.arSize+'px');}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <Providers>
          <a href="#main" className="sr-only">Skip to content</a>
          <Fx />
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <AudioBridge />
          <AudioPlayer />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
