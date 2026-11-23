#!/usr/bin/env python3
"""Builds public/data/offline.json: exact sizes the app shows in the Download Manager (Quran text per surah and
per translation, and every hadith book). Run after the data changes:  python3 scripts/build-offline-manifest.py"""
import json, os, gzip, time
D = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
def dumps(o): return json.dumps(o, ensure_ascii=False, separators=(',', ':'))
def trim(ayahs, keys):
    return [{k: v for k, v in {'v': a['v'], 'ar': a['ar'], 'tl': a.get('tl'), 'juz': a.get('juz'), 'page': a.get('page'), 'sajda': a.get('sajda'),
             't': {t: a['t'][t] for t in keys if t in a.get('t', {})}}.items() if v is not None} for a in ayahs]
hlangs = ['en', 'ur', 'bn', 'id', 'tr', 'fr', 'ru', 'ta']
def htrim(items, keep):
    out = []
    for h in items:
        h = dict(h)
        if isinstance(h.get('t'), dict): h['t'] = {k: v for k, v in h['t'].items() if k in keep}
        out.append(h)
    return out
surahs = json.load(open(os.path.join(D, 'q', 'surahs.json')))['surahs']
out = {'v': 1, 'built': int(time.time()), 'quran': {'surahs': []}, 'hadith': {}}
tkeys = ['en', 'en2', 'ur', 'ur2', 'hi', 'bn', 'id', 'tr', 'fr', 'ru', 'ta']
for s in surahs:
    n = s['n'] if 'n' in s else surahs.index(s) + 1
    a = json.load(open(os.path.join(D, 'q', f'{n}.json')))
    base = len(dumps(trim(a, [])).encode())
    out['quran']['surahs'].append({'n': n, 'verses': len(a), 'base': base,
        't': {k: len(dumps(trim(a, [k])).encode()) - base for k in tkeys}})
cols = json.load(open(os.path.join(D, 'collections.json')))['collections']
for c in cols:
    cid = c['id']; total = 0; files = 0
    idx = os.path.join(D, 'c', cid + '.json')
    if os.path.isfile(idx): total += os.path.getsize(idx); files += 1
    folder = os.path.join(D, 'c', cid)
    if os.path.isdir(folder):
        for f in os.listdir(folder):
            if f.endswith('.json'): total += os.path.getsize(os.path.join(folder, f)); files += 1
    base = 0; per = {}
    for f in ([os.path.join(D, 'c', cid, x) for x in os.listdir(folder) if x.endswith('.json')] if os.path.isdir(folder) else []):
        items = json.load(open(f))
        base += len(dumps(htrim(items, [])).encode())
        for l in hlangs:
            per[l] = per.get(l, 0) + len(dumps(htrim(items, [l])).encode())
    out['hadith'][cid] = {'files': files, 'bytes': total, 'base': base + (os.path.getsize(idx) if os.path.isfile(idx) else 0),
                          't': {l: max(0, per.get(l, 0) - base) for l in hlangs}}
json.dump(out, open(os.path.join(D, 'offline.json'), 'w'), separators=(',', ':'))
print('surahs', len(out['quran']['surahs']), 'books', len(out['hadith']), os.path.getsize(os.path.join(D, 'offline.json')), 'bytes')
t = sum(x['base'] for x in out['quran']['surahs']); print('Quran base MB', t / 1e6, ' + English MB', sum(x['t']['en'] for x in out['quran']['surahs']) / 1e6)
print({k: (round(v['bytes'] / 1e6, 1), round(v['base'] / 1e6, 1), round(v['t'].get('en', 0) / 1e6, 1)) for k, v in out['hadith'].items() if v['bytes'] > 5e6})
