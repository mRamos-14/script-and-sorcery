"""Builds the playable site into _site/ (used by GitHub Pages, or to host anywhere).

index.html is written without <!doctype>/<head> (the Claude artifact publisher adds
those), so this wraps it the same way serve.py does, then copies the game files.
    python tools/build_site.py
"""
import os
import shutil
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, ROOT)
from serve import HEAD  # noqa: E402

OUT = os.path.join(ROOT, '_site')


def main():
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, 'assets'))
    with open(os.path.join(ROOT, 'index.html'), encoding='utf-8') as f:
        page = HEAD + f.read() + '</body></html>'
    with open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page)
    for name in os.listdir(ROOT):
        if name.endswith('.js'):
            shutil.copy2(os.path.join(ROOT, name), OUT)
    for name in os.listdir(os.path.join(ROOT, 'assets')):
        if name.endswith('.jpg'):
            shutil.copy2(os.path.join(ROOT, 'assets', name), os.path.join(OUT, 'assets'))
    open(os.path.join(OUT, '.nojekyll'), 'w').close()
    print('built', OUT)


if __name__ == '__main__':
    main()
