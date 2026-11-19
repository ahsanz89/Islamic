import { useEffect, useState } from 'react';
import { load, save } from './storage';

const KEY = 'dalil.special-dua-favs';
let favs = [];
let loaded = false;
const subs = new Set();
const emit = () => subs.forEach((f) => f(favs));
const ensure = async () => { if (loaded) return; loaded = true; favs = await load(KEY, []); emit(); };
export const toggleFav = (id) => { favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id]; save(KEY, favs); emit(); };
export function useDuaFavs() {
  const [s, setS] = useState(favs);
  useEffect(() => { subs.add(setS); ensure(); setS(favs); return () => { subs.delete(setS); }; }, []);
  return { favs: s, isFav: (id) => s.includes(id), toggle: toggleFav };
}
