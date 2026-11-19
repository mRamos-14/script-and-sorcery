# Downloads generated backgrounds and makes the compressed game JPGs.
# python tools/fetch_art.py name=url name=url ...
import sys, os, urllib.request
from PIL import Image
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
for arg in sys.argv[1:]:
    name, url = arg.split('=', 1)
    raw = os.path.join(here, 'raw', name + '.png')
    if not os.path.exists(raw):
        req = urllib.request.Request(url, headers={'User-Agent': 'art-fetch'})
        with urllib.request.urlopen(req, timeout=120) as r, open(raw, 'wb') as f:
            f.write(r.read())
    im = Image.open(raw).convert('RGB')
    w, h = im.size
    size = (720, round(720 * h / w)) if h > w else (960, round(960 * h / w))
    im = im.resize(size, Image.LANCZOS)
    out = os.path.join(here, 'bg-' + name + '.jpg')
    im.save(out, 'JPEG', quality=80, optimize=True, progressive=True)
    print(name, size, os.path.getsize(out))
