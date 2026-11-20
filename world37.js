/* World 37: The Sky Post. The web from Python: how URLs and HTTP work, status codes,
   urllib.request.urlopen, bytes and decode(), reading a web page line by line, JSON
   APIs and query strings, the requests library, and handling failures.
   Sources: Python for Everybody chapters 12-13, CS50P lecture 4. The game has its own
   small pretend internet, so these pages always answer the same way. */
Object.assign(EXTRA.npcs, {
  pigeon: { name: 'Post-master Wing', colors: ['#3f8fc8', '#e6e1d6', '#ecb98d'] },
});
Object.assign(EXTRA.foes, {
  stormbat: { base: 'bat', name: 'Storm bat', pal: { P: '#3f6fd8', W: '#ffe65f' } },
  packetwisp: { base: 'wisp', name: 'Packet wisp', pal: { F: '#5fd3ff', L: '#e8fbff' } },
  skyserpent: { base: 'serpent', name: 'The Sky Serpent', s: 4, pal: {} },
});
const SKY_WEB = {
  'http://data.pr4e.org/romeo.txt': 'But soft what light through yonder window breaks\nIt is the east and Juliet is the sun\nArise fair sun and kill the envious moon\nWho is already sick and pale with grief\n',
  'http://sky.post/news.txt': 'Dragons spotted over the north tower\nMarket opens at dawn\nThe guild needs scribes\n',
  'http://sky.post/api/weather': { city: 'Ashford', temp: 21, sky: 'clear', week: [18, 21, 19, 24, 22] },
  'http://sky.post/api/heroes': { count: 3, results: [{ name: 'Ada', level: 7 }, { name: 'Wren', level: 4 }, { name: 'Tam', level: 9 }] },
  'http://sky.post/api/search': { query: 'fire', matches: ['fireball', 'firewall', 'campfire'] },
};

const WORLD37 = {
  id: 37, name: 'The Sky Post', topic: 'the web, HTTP and APIs',
  nodes: [[50, 92], [28, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [40, 21], [52, 8]],
  levels: [
    {
      id: '37-1', title: 'Letters through the sky', bg: 'skytemple', npc: 'pigeon', mentor: 'pigeon', tags: ['urlparts'],
      steps: [
        { type: 'talk', who: 'pigeon', text: "Welcome aboard, {NAME}! I'm Wing of the Sky Post. Every page on the web has an address, a URL: http://data.pr4e.org/romeo.txt. The scheme (http), the host (data.pr4e.org) and the path (/romeo.txt)." },
        { type: 'talk', who: 'pigeon', text: 'Your program sends a REQUEST to the host ("GET /romeo.txt please"), and the server sends back a RESPONSE: a status code and the content. 200 means OK. 404 means Not Found. That conversation is called HTTP.' },
        { type: 'demo', text: 'urllib.parse can take a URL apart. Run it.', code: ['from urllib.parse import urlparse', 'u = urlparse("https://sky.post/api/search?q=fire&n=3")', 'print(u.scheme, u.netloc, u.path, u.query)'] },
        { type: 'predict', shell: true, text: 'A server answers 404. What happened?', code: ['GET /secret-page.html', 'HTTP/1.1 404 Not Found'], choices: ['The page does not exist on that server', 'Everything worked', 'Your computer has no internet'], answer: 0, explain: '404 is "Not Found". 200 is OK; 500 means the server itself broke.' },
        {
          type: 'predict', vars: R => ({ p: R.pick(['/maps/north.png', '/index.html', '/api/v2/heroes']) }),
          text: 'What will it say?', code: ['from urllib.parse import urlparse', 'u = urlparse("https://guild.org$p")', 'print(u.netloc, u.path)'],
          explain: 'netloc is the host; path is everything after it, up to any ? or #.',
        },
        {
          type: 'predict', text: 'Building a query string. What will it say?', code: ['from urllib.parse import urlencode', 'print("https://sky.post/api/search?" + urlencode({"q": "fire ball", "n": 3}))'],
          explain: 'urlencode joins key=value pairs with &, and turns spaces into +.',
        },
        {
          type: 'fill', text: 'Read the query part of the URL.',
          lines: ['from urllib.parse import urlparse', 'u = urlparse("https://sky.post/find?who=ada")', 'print(u.[])'], chips: ['query', 'path', 'netloc'], answer: [['query']],
          hints: ['The part after the ?', 'u.query'],
        },
        {
          type: 'write', text: 'Build the URL for searching "ice storm" with limit 5 on https://sky.post/api/search using urlencode, and print it.',
          starter: ['from urllib.parse import urlencode'], keys: ['url', '=', '"https://sky.post/api/search?"', '+', 'urlencode', '(', ')', '{"q": "ice storm", "limit": 5}', 'print'],
          require: l => (has(l, /urlencode\s*\(/) ? null : 'Use urlencode for the query.'),
          hints: ['url = "https://sky.post/api/search?" + urlencode({"q": "ice storm", "limit": 5})', 'print(url)'],
          solution: ['url = "https://sky.post/api/search?" + urlencode({"q": "ice storm", "limit": 5})', 'print(url)'],
        },
      ],
      learn: [{ title: 'URLs and HTTP', code: 'scheme://host/path?query\n200 OK   404 Not Found   500 Server Error\nurlparse(url)   urlencode({...})', text: 'A request goes out to a host; a response with a status code comes back.' }],
    },
    {
      id: '37-2', title: 'Opening a page', bg: 'skytemple', npc: 'pigeon', mentor: 'pigeon', tags: ['urlopen'],
      steps: [
        { type: 'talk', who: 'pigeon', text: 'urllib.request.urlopen(url) opens a web page almost like a file. You can loop over its lines, or .read() it all. One twist: the web sends BYTES, not text, so call .decode() to turn each line into a string.' },
        { type: 'demo', web: SKY_WEB, text: 'Python for Everybody\'s first web program. Run it.', code: ['import urllib.request', 'fhand = urllib.request.urlopen("http://data.pr4e.org/romeo.txt")', 'for line in fhand:', '    print(line.decode().strip())'] },
        {
          type: 'predict', web: SKY_WEB, text: 'Counting words across the web. What will it say?', code: ['import urllib.request', 'counts = {}', 'for line in urllib.request.urlopen("http://data.pr4e.org/romeo.txt"):', '    for word in line.decode().split():', '        counts[word] = counts.get(word, 0) + 1', 'print(counts["and"], counts["sun"])'],
          explain: 'The same dictionary-counting pattern as with files, on a page from the web.',
        },
        {
          type: 'predict', web: SKY_WEB, text: 'Read it all at once. What will it say?', code: ['import urllib.request', 'text = urllib.request.urlopen("http://sky.post/news.txt").read().decode()', 'print(len(text.splitlines()), text.splitlines()[0].split()[0])'],
          explain: 'read() gets every byte; decode() makes it a string you can split into lines.',
        },
        {
          type: 'fill', web: SKY_WEB, text: 'Turn each line of bytes into text before splitting.',
          lines: ['import urllib.request', 'for line in urllib.request.urlopen("http://sky.post/news.txt"):', '    words = line.[]().split()', '    print(words[0])'], chips: ['decode', 'encode', 'read'], answer: [['decode']],
          hints: ['Bytes become text with decode.', 'line.decode()'],
        },
        {
          type: 'write', web: SKY_WEB, text: 'Open http://sky.post/news.txt and print how many lines contain the word "the" (lower case).',
          starter: ['import urllib.request'], keys: ['count', '=', '0', 'for', 'line', 'in', 'urllib.request.urlopen', '(', ')', '"http://sky.post/news.txt"', ':', 'if', '"the"', '.decode()', '.split()', '+=', '1', 'print'],
          require: l => (has(l, /urlopen/) && has(l, /decode/) ? null : 'Open the page with urlopen and decode each line.'),
          hints: ['for line in urllib.request.urlopen("http://sky.post/news.txt"):', '    if "the" in line.decode().split(): count += 1, then print(count)'],
          solution: ['count = 0', 'for line in urllib.request.urlopen("http://sky.post/news.txt"):', '    if "the" in line.decode().split():', '        count += 1', 'print(count)'],
        },
      ],
      learn: [{ title: 'urlopen', code: 'import urllib.request\nfor line in urllib.request.urlopen(url):\n    text = line.decode()', text: 'A web page reads like a file of bytes. Decode them into text.' }],
    },
    {
      id: '37-3', title: 'Bytes and letters', bg: 'skytemple', npc: 'pigeon', mentor: 'pigeon', tags: ['bytesq'],
      steps: [
        { type: 'talk', who: 'pigeon', text: 'Text is made of characters; the wire carries BYTES. "hello".encode() turns text into bytes (written b\'hello\'), and .decode() turns them back. Plain letters take one byte each, but letters like é take two in UTF-8.' },
        { type: 'demo', text: 'Run it.', code: ['data = "café".encode()', 'print(data)', 'print(len("café"), len(data))', 'print(data.decode())'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(['owl', 'rune', 'map']) }), text: 'What will it say?', code: ['print("$w".encode())'],
          explain: 'Bytes print with a b in front of the quotes.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['naïve', 'señor', 'über']) }), text: 'Counting letters and bytes. What will it say?', code: ['w = "$w"', 'print(len(w), len(w.encode()))'],
          explain: 'One special letter takes two bytes, so the byte count is one bigger.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Bytes and text do not mix. Which error?', code: ['print(b"gold" + "coins")'],
          explain: 'You cannot add bytes and a string: TypeError. Decode or encode first.',
        },
        {
          type: 'fill', text: 'Turn the bytes back into text.',
          lines: ['packet = "Sky Post".encode()', 'text = packet.[]()', 'print(text.upper())'], chips: ['decode', 'encode', 'strip'], answer: [['decode']],
          hints: ['Bytes to text: decode.', 'packet.decode()'],
        },
        {
          type: 'write', text: 'Encode the word "dragon" to bytes, print the bytes, then print the length of the bytes.',
          starter: [], keys: ['b', '=', '"dragon"', '.encode()', 'print', '(', ')', 'len'],
          require: l => (has(l, /\.encode\(\)/) ? null : 'Use .encode().'),
          hints: ['b = "dragon".encode()', 'print(b) then print(len(b))'],
          solution: ['b = "dragon".encode()', 'print(b)', 'print(len(b))'],
        },
      ],
      learn: [{ title: 'Bytes', code: '"café".encode()  → b\'caf\\xc3\\xa9\'\nb"...".decode()  → text', text: 'The network carries bytes. Encode text to send it, decode bytes to read them.' }],
    },
    {
      id: '37-4', title: 'Storm bats', bg: 'skytemple', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'stormbat', hp: d0 + 8 + 9 + 8, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Storm bats tear through the post routes! $HP HP. Every line of Romeo, word-counted, is a strike.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', web: SKY_WEB, text: 'It has $HP HP left. Cast fireball with the number of words on each line of the first three lines of romeo.txt.',
          lines: ['import urllib.request', 'lines = urllib.request.urlopen("http://data.pr4e.org/romeo.txt").read().[]().splitlines()', 'for line in lines[:3]:', '    cast(fireball, len(line.split()))'], chips: ['decode', 'encode', 'strip'], answer: [['decode']],
          goal: { foeDown: true },
          hints: ['Bytes first need to become text.', '.read().decode()'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat matriarch rides the weather report!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 21 }),
          web: SKY_WEB,
          spawn: v => ({ kind: 'stormbat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Fetch http://sky.post/api/weather, load the JSON, and cast icebolt with the temp, twice.',
          starter: ['import urllib.request, json'], keys: ['data', '=', 'json.loads', '(', ')', 'urllib.request.urlopen', '"http://sky.post/api/weather"', '.read()', 'cast', 'icebolt', ',', '[', ']', '"temp"'],
          goal: { foeDown: true },
          require: l => (has(l, /json\.loads/) ? null : 'Load the JSON with json.loads.'),
          hints: ['data = json.loads(urllib.request.urlopen("http://sky.post/api/weather").read())', 'cast(icebolt, data["temp"]) twice'],
          solution: ['data = json.loads(urllib.request.urlopen("http://sky.post/api/weather").read())', 'cast(icebolt, data["temp"])', 'cast(icebolt, data["temp"])'],
        },
      ],
      learn: [{ title: 'Web data in battle', code: 'json.loads(urlopen(url).read())', text: 'Fetch, decode or load, then use.' }],
    },
    {
      id: '37-5', title: 'Asking an API', bg: 'skytemple', npc: 'pigeon', mentor: 'pigeon', tags: ['apijson'],
      steps: [
        { type: 'talk', who: 'pigeon', text: 'Many web addresses are not pages for people but APIs for programs: they answer in JSON. Fetch the bytes, json.loads them, and you have Python dicts and lists. Questions go in the query string.' },
        { type: 'demo', web: SKY_WEB, text: 'Run it.', code: ['import urllib.request, json', 'raw = urllib.request.urlopen("http://sky.post/api/heroes").read()', 'data = json.loads(raw)', 'print(data["count"])', 'for hero in data["results"]:', '    print(hero["name"], hero["level"])'] },
        {
          type: 'predict', web: SKY_WEB, text: 'What will it say?', code: ['import urllib.request, json', 'w = json.loads(urllib.request.urlopen("http://sky.post/api/weather").read())', 'print(w["city"], max(w["week"]), sum(w["week"]) / len(w["week"]))'],
          explain: 'The week list holds five temperatures: the warmest, and the average.',
        },
        {
          type: 'predict', web: SKY_WEB, text: 'A search API. What will it say?', code: ['import urllib.request, json', 'from urllib.parse import urlencode', 'url = "http://sky.post/api/search?" + urlencode({"q": "fire"})', 'data = json.loads(urllib.request.urlopen(url).read())', 'print(url)', 'print([m for m in data["matches"] if m.startswith("fire")])'],
          explain: 'The query goes in the URL; the matches come back as a JSON list.',
        },
        {
          type: 'fill', web: SKY_WEB, text: 'Print the name of the highest-level hero.',
          lines: ['import urllib.request, json', 'data = json.loads(urllib.request.urlopen("http://sky.post/api/heroes").read())', 'best = max(data["results"], key=lambda h: h[[]])', 'print(best["name"])'], chips: ['"level"', '"name"', '"count"'], answer: [['"level"']],
          hints: ['Compare the heroes by level.', 'h["level"]'],
        },
        {
          type: 'write', web: SKY_WEB, text: 'Fetch the heroes API and print the names of heroes with level 5 or more, as a list.',
          starter: ['import urllib.request, json'], keys: ['data', '=', 'json.loads', '(', ')', 'urllib.request.urlopen', '"http://sky.post/api/heroes"', '.read()', 'print', '[', ']', 'h', 'for', 'in', '"results"', '"name"', 'if', '"level"', '>=', '5'],
          require: l => (has(l, /json\.loads/) ? null : 'Use json.loads on the response.'),
          hints: ['data = json.loads(urllib.request.urlopen("http://sky.post/api/heroes").read())', 'print([h["name"] for h in data["results"] if h["level"] >= 5])'],
          solution: ['data = json.loads(urllib.request.urlopen("http://sky.post/api/heroes").read())', 'print([h["name"] for h in data["results"] if h["level"] >= 5])'],
        },
      ],
      learn: [{ title: 'JSON APIs', code: 'data = json.loads(urlopen(url).read())\nurl = base + "?" + urlencode(params)', text: 'Programs ask APIs questions in the URL and get JSON back.' }],
    },
    {
      id: '37-6', title: 'The requests courier', bg: 'skytemple', npc: 'pigeon', mentor: 'pigeon', tags: ['requestsq'],
      steps: [
        { type: 'talk', who: 'pigeon', text: 'Most programmers reach for the requests library instead (pip install requests). requests.get(url) gives a response with .status_code, .text (already decoded!) and .json(). params={...} builds the query string for you.' },
        { type: 'demo', web: SKY_WEB, text: 'Run it.', code: ['import requests', 'r = requests.get("http://sky.post/api/search", params={"q": "fire"})', 'print(r.status_code, r.url)', 'print(r.json()["matches"])'] },
        {
          type: 'predict', web: SKY_WEB, text: 'What will it say?', code: ['import requests', 'r = requests.get("http://sky.post/news.txt")', 'print(r.ok, r.text.splitlines()[1])'],
          explain: '.text is the page as a string, no decoding needed.',
        },
        {
          type: 'predict', web: SKY_WEB, text: 'A missing page. What will it say?', code: ['import requests', 'r = requests.get("http://sky.post/old-page")', 'print(r.status_code, r.ok)'],
          explain: 'requests does not crash on 404; it tells you through status_code and ok.',
        },
        {
          type: 'fill', web: SKY_WEB, text: 'Read the JSON straight from the response.',
          lines: ['import requests', 'r = requests.get("http://sky.post/api/weather")', 'print(r.[]()["sky"])'], chips: ['json', 'text', 'read'], answer: [['json']],
          hints: ['requests can parse JSON for you.', 'r.json()'],
        },
        {
          type: 'write', web: SKY_WEB, text: 'With requests, fetch the weather API and print the city and the coolest temperature of the week.',
          starter: ['import requests'], keys: ['w', '=', 'requests.get', '(', ')', '"http://sky.post/api/weather"', '.json()', 'print', '[', ']', '"city"', 'min', '"week"', ','],
          require: l => (has(l, /requests\.get/) && has(l, /\.json\(\)/) ? null : 'Use requests.get(...).json().'),
          hints: ['w = requests.get("http://sky.post/api/weather").json()', 'print(w["city"], min(w["week"]))'],
          solution: ['w = requests.get("http://sky.post/api/weather").json()', 'print(w["city"], min(w["week"]))'],
        },
      ],
      learn: [{ title: 'requests', code: 'r = requests.get(url, params={...})\nr.status_code  r.ok  r.text  r.json()', text: 'The friendly way to talk to the web.' }],
    },
    {
      id: '37-7', title: 'When the post fails', bg: 'skytemple', npc: 'pigeon', mentor: 'pigeon', tags: ['webfail'],
      steps: [
        { type: 'talk', who: 'pigeon', text: 'The web fails all the time: pages vanish (404), hosts do not exist, servers break. urlopen raises urllib.error.HTTPError for bad status codes and URLError when it cannot reach the host. With requests, check r.ok or call r.raise_for_status().' },
        { type: 'demo', web: SKY_WEB, text: 'Run it.', code: ['import urllib.request, urllib.error', 'for url in ["http://sky.post/news.txt", "http://sky.post/missing.txt"]:', '    try:', '        text = urllib.request.urlopen(url).read().decode()', '        print("got", len(text), "characters")', '    except urllib.error.HTTPError as e:', '        print("failed:", e)'] },
        {
          type: 'predict', measure: 'errtype', web: SKY_WEB, text: 'Which error?', code: ['import urllib.request', 'urllib.request.urlopen("http://sky.post/nothing-here")'],
          explain: 'The host answered 404: urllib.error.HTTPError.',
        },
        {
          type: 'predict', web: SKY_WEB, text: 'What will it say?', code: ['import requests', 'r = requests.get("http://sky.post/lost")', 'try:', '    r.raise_for_status()', '    print("all good")', 'except requests.HTTPError as e:', '    print("problem:", r.status_code)'],
          explain: 'raise_for_status turns a bad status code into an exception you can catch.',
        },
        {
          type: 'fill', web: SKY_WEB, text: 'Catch the failure instead of crashing.',
          lines: ['import urllib.request, urllib.error', 'try:', '    urllib.request.urlopen("http://sky.post/gone.html")', 'except urllib.error.[]:', '    print("that page is gone")'], chips: ['HTTPError', 'KeyError', 'ValueError'], answer: [['HTTPError']],
          hints: ['A bad status code from the server.', 'urllib.error.HTTPError'],
        },
        {
          type: 'write', web: SKY_WEB, text: 'Write fetch(url) that returns the page text with requests, or "unavailable" if r.ok is False. Print fetch for http://sky.post/news.txt (its first line only) and for http://sky.post/nope.',
          starter: ['import requests'], keys: ['def', 'fetch', '(', ')', 'url', ':', 'r', '=', 'requests.get', 'if', 'not', 'r.ok', 'return', '"unavailable"', 'r.text', 'print', '.splitlines()', '[', ']', '0', '"http://sky.post/news.txt"', '"http://sky.post/nope"'],
          require: l => (has(l, /\.ok/) ? null : 'Check r.ok.'),
          hints: ['def fetch(url): r = requests.get(url); if not r.ok: return "unavailable"; return r.text', 'print(fetch("http://sky.post/news.txt").splitlines()[0]) and print(fetch("http://sky.post/nope"))'],
          solution: ['def fetch(url):', '    r = requests.get(url)', '    if not r.ok:', '        return "unavailable"', '    return r.text', 'print(fetch("http://sky.post/news.txt").splitlines()[0])', 'print(fetch("http://sky.post/nope"))'],
        },
      ],
      learn: [{ title: 'Web failures', code: 'except urllib.error.HTTPError: ...\nexcept urllib.error.URLError: ...\nif not r.ok: ...\nr.raise_for_status()', text: 'Always plan for pages that vanish and hosts that do not answer.' }],
    },
    {
      id: '37-8', title: 'Packet wisps', bg: 'skytemple', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'packetwisp', hp: d0 + 7 + 4 + 9, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Packet wisps scramble the messages! $HP HP. Every hero in the API answer strikes with their level.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', web: SKY_WEB, text: 'It has $HP HP left. Fetch the heroes API with requests and cast fireball with each level.',
          lines: ['import requests', 'for hero in requests.get("http://sky.post/api/heroes").[]()["results"]:', '    cast(fireball, hero["level"])'], chips: ['json', 'text', 'ok'], answer: [['json']],
          goal: { foeDown: true },
          hints: ['Parse the JSON answer.', '.json()'],
        },
        { type: 'talk', who: 'narrator', text: 'The elder wisp hides behind a missing page!' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9); return { p, hp: 2 * p }; },
          web: SKY_WEB,
          spawn: v => ({ kind: 'packetwisp', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Try to open http://sky.post/elder with urlopen; when it raises HTTPError, cast icebolt with $p twice inside the except block.',
          starter: ['import urllib.request, urllib.error'], keys: ['try', ':', 'urllib.request.urlopen', '(', ')', '"http://sky.post/elder"', 'except', 'urllib.error.HTTPError', 'cast', 'icebolt', ',', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /except\s+urllib\.error\.HTTPError/) ? null : 'Catch urllib.error.HTTPError.'),
          hints: ['try: urllib.request.urlopen("http://sky.post/elder")', 'except urllib.error.HTTPError: cast(icebolt, $p) twice'],
          solution: ['try:', '    urllib.request.urlopen("http://sky.post/elder")', 'except urllib.error.HTTPError:', '    cast(icebolt, $p)', '    cast(icebolt, $p)'],
        },
      ],
      learn: [{ title: 'Web in battle', code: 'requests.get(url).json()', text: 'Fetch, parse, use, and plan for failure.' }],
    },
    {
      id: '37-9', title: 'The Sky Serpent', bg: 'skytemple', foe: { kind: 'skyserpent', hp: 190, weak: 'spark', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'skyserpent', text: 'GET... /YOUR... /DOOM... HTTP... 200...' },
        { type: 'talk', who: 'narrator', text: 'The Sky Serpent has 190 HP. Spark crackles through the clouds: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', web: SKY_WEB, text: 'How much damage? Spark is doubled.', code: ['import urllib.request', 'lines = urllib.request.urlopen("http://sky.post/news.txt").read().decode().splitlines()', 'cast(spark, len(lines) * 2)'],
          explain: 'Three lines × 2 = 6, doubled.',
        },
        {
          type: 'fix', web: SKY_WEB, text: 'This should print the first word of each news line. Run it, then tap the broken line.',
          code: ['import urllib.request', 'for line in urllib.request.urlopen("http://sky.post/news.txt"):', '    print(line.split()[0] + "!")', 'cast(spark, 5)'], bad: 2,
          options: ['    print(line.decode().split()[0] + "!")', '    print(line.encode().split()[0] + "!")', '    print(str(line).split()[0] + "!")'], answer: 0,
          explain: 'Lines from the web are bytes; adding "!" to bytes is a TypeError. Decode first.',
        },
        { type: 'talk', who: 'skyserpent', text: 'WHAT... IS... THE... SKY...' },
        {
          type: 'fill', web: SKY_WEB, text: 'Read the sky from the weather API and strike with spark, 3 times its length.',
          lines: ['import requests', 'sky = requests.get("http://sky.post/api/weather").json()[[]]', 'cast(spark, len(sky) * 3)'], chips: ['"sky"', '"city"', 'sky'], answer: [['"sky"']],
          hints: ['The weather JSON has a "sky" key.', '["sky"]'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and spark is doubled. Encode the text "$HP" to bytes, decode it back, turn it into a number, and cast spark with that // 2 + 1.',
          starter: [], keys: ['b', '=', '"$HP"', '.encode()', 'n', 'int', '(', ')', '.decode()', 'cast', 'spark', ',', '//', '2', '+', '1'],
          goal: { foeDown: true },
          require: l => (has(l, /encode/) && has(l, /decode/) ? null : 'Encode, then decode.'),
          hints: ['b = "$HP".encode()', 'n = int(b.decode()), then cast(spark, n // 2 + 1)'],
          solution: ['b = "$HP".encode()', 'n = int(b.decode())', 'cast(spark, n // 2 + 1)'],
        },
        { type: 'talk', who: 'skyserpent', text: '...connection... closed...' },
      ],
      learn: [{ title: 'Sky Post toolkit', code: 'urlparse  urlencode  urlopen  .decode()  json.loads  requests.get  .json()  HTTPError', text: 'Everything from the Sky Post.' }],
    },
  ],
};
WORLDS.push(WORLD37);

(() => {
  const { makeQ, pick } = Arena;
  Object.assign(Arena.GEN, {
    urlparts: () => makeQ(['from urllib.parse import urlparse', 'print(urlparse("https://a.org/x/y?z=1").path)'], ['a.org', '/x/y?z=1']),
    urlopen: () => makeQ(['import urllib.request', 'print(len(urllib.request.urlopen("http://sky.post/news.txt").read().decode().split("\\n")))'], [3, 'Error'], 'What will it say?', { web: SKY_WEB }),
    bytesq: () => { const w = pick(['ab', 'rune']); return makeQ([`print(len("${w}".encode()), "${w}".encode())`], [`${w.length} ${w}`, `${w.length * 2} b'${w}'`]); },
    apijson: () => makeQ(['import urllib.request, json', 'd = json.loads(urllib.request.urlopen("http://sky.post/api/heroes").read())', 'print(d["results"][1]["name"])'], ['Ada', 'Tam'], 'What will it say?', { web: SKY_WEB }),
    requestsq: () => makeQ(['import requests', 'r = requests.get("http://sky.post/nope")', 'print(r.status_code)'], [200, 'Error'], 'What will it say?', { web: SKY_WEB }),
    webfail: () => makeQ(['import requests', 'print(requests.get("http://sky.post/news.txt").ok)'], ['False', 200], 'What will it say?', { web: SKY_WEB }),
  });
})();
