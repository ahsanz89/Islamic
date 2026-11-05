import fs from 'node:fs';
import path from 'node:path';
import Namaz from './Namaz';

export const metadata = { title: 'Prayer book (Namaz)' };

export default function Page() {
  const dir = path.join(process.cwd(), 'content');
  const html = fs.readFileSync(path.join(dir, 'namaz-book.html'), 'utf8');
  const toc = JSON.parse(fs.readFileSync(path.join(dir, 'namaz-toc.json'), 'utf8'));
  return <Namaz html={html} toc={toc} />;
}
