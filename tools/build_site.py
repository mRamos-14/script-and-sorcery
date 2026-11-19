"""Builds the playable site into _site/ (used by GitHub Pages, or to host anywhere).

index.html is written without <!doctype>/<head> (the Claude artifact publisher adds
those), so this wraps it the same way serve.py does, then copies the game files and
adds what makes it an installable app: a manifest, icons and an offline service worker.
    python tools/build_site.py
"""
import json
import os
import shutil
import subprocess
import sys
import time

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, ROOT)
from serve import HEAD  # noqa: E402

OUT = os.path.join(ROOT, '_site')
APP_HEAD = (
    '<link rel="manifest" href="manifest.webmanifest">'
    '<meta name="theme-color" content="#15111f">'
    '<meta name="sorcery-pwa" content="1">'
    '<link rel="icon" type="image/png" href="icons/icon-192.png">'
    '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">'
)
MANIFEST = {
    'id': './',
    'name': 'Script & Sorcery',
    'short_name': 'Sorcery',
    'description': 'Learn Python by casting spells.',
    'start_url': './',
    'scope': './',
    'display': 'standalone',
    'orientation': 'portrait',
    'background_color': '#15111f',
    'theme_color': '#15111f',
    'icons': [
        {'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
        {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
        {'src': 'icons/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
    ],
}
# Code is fetched fresh whenever online (so updates arrive) and kept for offline play.
# Pictures and fonts never change under the same name, so they are kept in a separate
# cache that survives updates: an update never re-downloads the art.
SW = r"""const VERSION = %(version)s;
const CODE = 'sorcery-code-' + VERSION;
const ART = 'sorcery-art-v1';
const CORE = %(core)s;
const ARTWORK = %(art)s;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CODE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
  // fetch the rest of the art in the background, for offline play
  caches.open(ART).then(async c => { for (const a of ARTWORK) { if (!(await c.match(a))) { try { await c.add(a); } catch (err) { /* try again later */ } } } });
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('sorcery-code-') && k !== CODE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isArt = /\.(jpg|png)$/.test(url.pathname) || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (isArt) {
    e.respondWith(caches.open(ART).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(CODE).then(async c => {
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      if (res.ok) c.put(req, res.clone());
      return res;
    } catch (err) {
      return (await c.match(req)) || (await c.match('./')) || Response.error();
    }
  }));
});
"""


def version():
    try:
        return subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD'], cwd=ROOT, text=True).strip()
    except Exception:
        return str(int(time.time()))


def main():
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, 'assets'))
    with open(os.path.join(ROOT, 'index.html'), encoding='utf-8') as f:
        page = HEAD.replace('</head>', APP_HEAD + '</head>') + f.read() + '</body></html>'
    with open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page)
    scripts = sorted(n for n in os.listdir(ROOT) if n.endswith('.js'))
    for name in scripts:
        shutil.copy2(os.path.join(ROOT, name), OUT)
    art = []
    for name in sorted(os.listdir(os.path.join(ROOT, 'assets'))):
        if name.endswith('.jpg'):
            shutil.copy2(os.path.join(ROOT, 'assets', name), os.path.join(OUT, 'assets'))
            art.append('assets/' + name)
    shutil.copytree(os.path.join(ROOT, 'icons'), os.path.join(OUT, 'icons'))
    with open(os.path.join(OUT, 'manifest.webmanifest'), 'w', encoding='utf-8') as f:
        json.dump(MANIFEST, f, indent=2)
    core = ['./', 'index.html', 'manifest.webmanifest'] + scripts
    with open(os.path.join(OUT, 'sw.js'), 'w', encoding='utf-8') as f:
        f.write(SW % {'version': json.dumps(version()), 'core': json.dumps(core), 'art': json.dumps(art)})
    open(os.path.join(OUT, '.nojekyll'), 'w').close()
    print('built', OUT, 'version', version())


if __name__ == '__main__':
    main()
