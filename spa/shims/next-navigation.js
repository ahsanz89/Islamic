import { useMemo } from 'react';
import { goBack, navigate, useLocationPath } from '../router';

export function usePathname() {
  return useLocationPath().split(/[?#]/)[0];
}
export function useSearchParams() {
  const p = useLocationPath();
  return useMemo(() => new URLSearchParams((p.split('#')[0].split('?')[1]) || ''), [p]);
}
export function useRouter() {
  return { push: (p) => navigate(p), replace: (p) => navigate(p, { replace: true }), back: goBack };
}
