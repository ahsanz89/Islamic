import { readGlossary } from '@/lib/server-data';
import Glossary from './Glossary';

export const metadata = { title: 'Hadith terminology' };

export default function Page() {
  return <Glossary data={readGlossary()} />;
}
