import { readDuas } from '@/lib/server-data';
import Duas from './Duas';

export const metadata = { title: 'Duas' };

export default function Page() {
  return <Duas data={readDuas()} />;
}
