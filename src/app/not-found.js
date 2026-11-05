import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="container narrow" style={{ padding: '96px 0', textAlign: 'center' }}>
      <p className="ar" style={{ fontSize: 56, margin: 0, color: 'var(--brand)' }} lang="ar">٤٠٤</p>
      <h1 style={{ margin: '8px 0 12px' }}>This page could not be found</h1>
      <p className="muted" style={{ fontSize: 18, margin: '0 auto 28px', maxWidth: '46ch' }}>The link may be old or mistyped. Try one of these instead.</p>
      <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
        <Link className="btn primary" href="/">Home</Link>
        <Link className="btn" href="/collections/">Collections</Link>
        <Link className="btn" href="/quran/">Quran</Link>
        <Link className="btn" href="/search/">Search</Link>
      </div>
    </div>
  );
}
