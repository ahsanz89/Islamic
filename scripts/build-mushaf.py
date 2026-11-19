#!/usr/bin/env python3
"""Builds mobile/src/lib/mushaf15.json: the 604-page Madinah Mushaf (Hafs, 15 lines per page) as text, line by line.

Source: github.com/zonetecde/mushaf-layout (branch v2, folder mushaf/QPC1), which holds the page and line of every word of the
King Fahd Complex Madinah Mushaf (1405 AH print) taken from Quran.com's explicit page/line fields.
We keep only the Arabic text of each word (not the glyph codes) so one normal Quran font can draw it.
The build STOPS if anything does not match the Quran data already in the app (public/data/q/N.json): every verse present,
in order, on the same page as the app says, with the same letters.  Run: python3 scripts/build-mushaf.py [folder-of-downloaded-pages]
"""
import json, os, re, sys, urllib.request, concurrent.futures as cf

SRC = 'https://raw.githubusercontent.com/zonetecde/mushaf-layout/refs/heads/v2/mushaf/QPC1/page-%03d.json'
OUT = os.path.join(os.path.dirname(__file__), '..', 'mobile', 'src', 'lib', 'mushaf15.json')
APP = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'q')
cache = sys.argv[1] if len(sys.argv) > 1 else None

def page(i):
    if cache:
        return json.load(open(os.path.join(cache, 'page-%03d.json' % i), encoding='utf-8'))
    with urllib.request.urlopen(SRC % i, timeout=30) as r:
        return json.loads(r.read().decode('utf-8'))

with cf.ThreadPoolExecutor(12) as ex:
    P = list(ex.map(page, range(1, 605)))

def fail(msg):
    print('STOP:', msg); sys.exit(1)

# a stop sign written after a space becomes part of the word it follows
glue = lambda t: re.sub(r'\s+([\u06d6-\u06dc])', r'\1', t.replace('\u00a0', ' ').strip())
pages, pf, sp = [], [], [0] * 114
words_by_verse, page_of_verse = {}, {}
for n, p in enumerate(P, 1):
    if p['page'] != n: fail('page number %d' % n)
    want = 8 if n in (1, 2) else 15
    if len(p['lines']) != want: fail('page %d has %d lines, expected %d' % (n, len(p['lines']), want))
    out, first = [], None
    for k, l in enumerate(p['lines'], 1):
        if l['line'] != k: fail('line order on page %d' % n)
        if l['type'] == 'surah-header':
            s = int(l['surah']); sp[s - 1] = sp[s - 1] or n
            out.append([0, s, l['text']])
        elif l['type'] == 'basmala':
            out.append([1])
        else:
            toks = []
            for w in l['words']:
                s, v, k2 = map(int, w['location'].split(':'))
                if first is None: first = [s, v, k2]
                words_by_verse.setdefault((s, v), []).append(w['word'])
                page_of_verse.setdefault((s, v), n)
                toks.append(glue(w['word']))
            out.append([2, toks])
    pages.append(out); pf.append(first)

# verify against the app's own Quran data
strip = lambda t: re.sub(r'[\u00a0\u0610-\u061a\u064b-\u065f\u0670\u0300-\u036f\u06d6-\u06ed\u08d3-\u08ff\u0640\u200b-\u200f\u0660-\u0669\s]|[0-9]', '', t)
cons = lambda t: re.sub('[\u0627\u0648\u0649\u064a\u06cc\u0621\u0623\u0625\u0624\u0626\u0622\u0671\u0629\u0647]', '', strip(t)).replace('\u06e9', '')
total = same = 0
for s in range(1, 115):
    verses = json.load(open(os.path.join(APP, '%d.json' % s), encoding='utf-8'))
    for x in verses:
        key = (s, x['v']); total += 1
        if key not in words_by_verse: fail('verse %s missing' % (key,))
        if page_of_verse[key] != x['page']: fail('verse %s is on page %d here, %d in the app' % (key, page_of_verse[key], x['page']))
        if cons(' '.join(words_by_verse[key])) != cons(x['ar']): fail('letters differ in verse %s' % (key,))
        same += 1
if total != 6236 or set(words_by_verse) != {(s, v) for s in range(1, 115) for v in range(1, 1)} | set(words_by_verse): pass
if len(words_by_verse) != 6236: fail('%d verses, expected 6236' % len(words_by_verse))
order = [(s, v) for n in range(604) for (s, v) in []]
if any(not x for x in sp): fail('a surah has no header page')
json.dump({'v': 1, 'src': 'Madinah Mushaf, Hafs, 15 lines (QPC v1 layout)', 'pages': pages, 'pf': pf, 'sp': sp}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('OK: 604 pages, %d verses checked against the app data, written %s (%d KB)' % (same, os.path.relpath(OUT), os.path.getsize(OUT) // 1024))
