import './globals.css';
import { Providers } from '@/components/Providers';
import { Footer, Fx, Header } from '@/components/ui';

export const metadata = {
  title: { default: 'Hadith Library', template: '%s · Hadith Library' },
  description: 'Free, open-source hadith and Quran library: Arabic with translations in Urdu, English, Bengali, Indonesian, Turkish and more.'
};

export const viewport = { width: 'device-width', initialScale: 1 };

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
        </Providers>
      </body>
    </html>
  );
}
