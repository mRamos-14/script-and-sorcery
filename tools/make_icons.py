"""Draws the app icons (the default hero on a night-purple tile) from game.js's pixel map.
    python tools/make_icons.py   ->  icons/icon-192.png, icon-512.png, icon-maskable-512.png
"""
import os
import re
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
src = open(os.path.join(ROOT, 'game.js'), encoding='utf-8').read()
rows = re.findall(r"'([.A-Za-z]{18})'", src[src.index('const HERO_MAP = ['):src.index('const E18')])
PAL = {
    'O': '#1a1426', 'T': '#7d4fc9', 't': '#e2b34a', 'H': '#7a4424', 'S': '#ecb98d', 'K': '#1b1830',
    'M': '#a8513a', 'R': '#3f6fd8', 'D': '#2c4e97', 'L': '#6b4426', 'B': '#4a2f1d', 'Y': '#f0c53a', 'J': '#5fd3ff',
}


def draw(size, pad):
    img = Image.new('RGB', (size, size), '#221b33')
    d = ImageDraw.Draw(img)
    # a soft gold ground circle
    r = size * 0.36
    d.ellipse([size / 2 - r, size * 0.58 - r * 0.25, size / 2 + r, size * 0.58 + r * 0.25], fill='#2c2442')
    w, h = 21, len(rows)  # sprite plus staff columns
    cell = int((size - 2 * pad) / max(w, h))
    ox = (size - w * cell) // 2
    oy = (size - h * cell) // 2
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch in PAL:
                d.rectangle([ox + i * cell, oy + j * cell, ox + (i + 1) * cell - 1, oy + (j + 1) * cell - 1], fill=PAL[ch])
    # the staff and its gem, like drawHero in game.js
    def box(x, y, bw, bh, col):
        d.rectangle([ox + x * cell, oy + y * cell, ox + (x + bw) * cell - 1, oy + (y + bh) * cell - 1], fill=col)
    box(18, 8, 1, 17, '#8a5a2b'); box(19, 8, 1, 17, '#1a1426')
    box(17, 4, 3, 4, '#1a1426'); box(17, 5, 3, 2, PAL['J']); box(17, 5, 1, 1, '#ffffff')
    return img


out = os.path.join(ROOT, 'icons')
os.makedirs(out, exist_ok=True)
draw(192, 20).save(os.path.join(out, 'icon-192.png'))
draw(512, 52).save(os.path.join(out, 'icon-512.png'))
draw(512, 110).save(os.path.join(out, 'icon-maskable-512.png'))
draw(180, 18).save(os.path.join(out, 'apple-touch-icon.png'))
print('icons written', len(rows), 'rows')
