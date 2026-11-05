#!/usr/bin/env python3
"""Builds the DALIL logo assets (SVG with outlined text) into public/brand and src/app.
Needs: pip install fonttools brotli uharfbuzz  (fonts come from node_modules/@fontsource*)."""
import io, os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
NM = os.path.join(ROOT, 'node_modules')
OUT = os.path.join(ROOT, 'public', 'brand')
os.makedirs(OUT, exist_ok=True)

EMERALD, GREEN, GOLD, IVORY, CHARCOAL = '#123F35', '#1F7358', '#D5B779', '#F7F5EF', '#242B28'

def font_bytes(f):
    b = io.BytesIO(); f.flavor = None; f.save(b); return b.getvalue()

inter = TTFont(os.path.join(NM, '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'))
inter = instancer.instantiateVariableFont(inter, {'wght': 800})
arab = TTFont(os.path.join(NM, '@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-700-normal.woff2'))

def outline(ttf, text, size, x, y, tracking=0, rtl=False):
    """Shape `text` with HarfBuzz and return (svg path d, advance width) in SVG coordinates."""
    data = font_bytes(ttf)
    face = hb.Face(data); font = hb.Font(face)
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True, 'liga': True})
    gs = ttf.getGlyphSet(); order = ttf.getGlyphOrder()
    upm = ttf['head'].unitsPerEm; k = size / upm
    pen = SVGPathPen(gs); cx = 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        tp = TransformPen(pen, (k, 0, 0, -k, x + (cx + pos.x_offset) * k, y - pos.y_offset * k))
        gs[name].draw(tp)
        cx += pos.x_advance + tracking * upm / size
    return pen.getCommands(), cx * k

def mark_inner(bg=True):
    s = ''
    if bg: s += f'<rect width="64" height="64" rx="15" fill="{EMERALD}"/>'
    s += (f'<g fill="none" stroke="{IVORY}" stroke-width="2.6" stroke-linejoin="miter">'
          '<rect x="18.5" y="18.5" width="27" height="27"/>'
          '<rect x="18.5" y="18.5" width="27" height="27" transform="rotate(45 32 32)"/></g>'
          f'<rect x="27.6" y="27.6" width="8.8" height="8.8" transform="rotate(45 32 32)" fill="{GOLD}"/>')
    return s

def write(name, svg):
    open(os.path.join(OUT, name), 'w', encoding='utf8').write(svg)

# icon-only mark
mark = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="DALIL">{mark_inner()}</svg>'
write('dalil-mark.svg', mark)
open(os.path.join(ROOT, 'src', 'app', 'icon.svg'), 'w').write(mark)

# maskable / full-bleed square (no rounded corners) for app icons
write('dalil-icon-square.svg', f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="{EMERALD}"/><g transform="translate(8 8) scale(.75)">{mark_inner(False)}</g></svg>')

# horizontal lockup
def lockup(word_color, arabic_color, sub_color, bg_tile=True):
    d_latin, w_latin = outline(inter, 'DALIL', 44, 0, 0, tracking=0.16)
    d_ar, w_ar = outline(arab, 'دليل', 34, 0, 0)
    tx = 84
    W = tx + max(w_latin, 0) + 28 + w_ar + 8
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} 72" role="img" aria-label="DALIL, Islamic Knowledge. Without Boundaries.">'
           f'<g transform="translate(4 4)">{mark_inner(bg_tile)}</g>'
           f'<g transform="translate({tx} 44)"><path d="{d_latin}" fill="{word_color}"/></g>'
           f'<g transform="translate({tx + w_latin + 14:.1f} 44)"><path d="{d_ar}" fill="{arabic_color}"/></g>'
           f'<rect x="{tx}" y="54" width="22" height="2.4" fill="{GOLD}"/>'
           '</svg>')
    return svg
write('dalil-logo.svg', lockup(EMERALD, GREEN, CHARCOAL))          # for light backgrounds
write('dalil-logo-light.svg', lockup(IVORY, GOLD, IVORY))          # for dark backgrounds
print('written to', OUT)
