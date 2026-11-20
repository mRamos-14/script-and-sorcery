/* World 38: The Spider's Lair. Web scraping with BeautifulSoup: what HTML is, parsing a
   page, find / find_all / soup("a"), attributes and .text, ids and classes, CSS selectors,
   following links (urljoin, crawling), and harvesting numbers from pages; then the
   Act VII review. Sources: Python for Everybody chapter 12, Automate the Boring Stuff
   chapter 12. Pages come from the game's pretend internet. */
Object.assign(EXTRA.npcs, {
  arachne: { name: 'Weaver Arachne', colors: ['#3a2a4a', '#c8452f', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  webling: { base: 'crab', name: 'Webling', pal: { R: '#4a3a5a', M: '#1a1426' } },
  silkbat: { base: 'bat', name: 'Silk bat', pal: { P: '#d8d4f0', W: '#ff5f6d' } },
  spiderqueen: { base: 'crab', name: 'The Spider Queen', s: 4, pal: { R: '#2a1a3a', M: '#ff3fd0' } },
  dataoracle: { base: 'source', name: 'The Data Oracle', pal: { C: '#2f8f5b', L: '#c4f5a8' } },
});
const SPIDER_WEB = {
  'http://guild.site/index.html': '<html><head><title>Guild Notice Board</title></head><body>\n<h1 id="top">Notices</h1>\n<p class="intro">Latest news from the <b>Guild</b>.</p>\n<div class="post"><h2>Dragon sighted</h2><span class="author">Ada</span> <span class="comments">12</span><a href="dragon.html">read more</a></div>\n<div class="post"><h2>Market day</h2><span class="author">Wren</span> <span class="comments">5</span><a href="market.html">read more</a></div>\n<div class="post urgent"><h2>Scribes wanted</h2><span class="author">Tam</span> <span class="comments">30</span><a href="http://guild.site/scribes.html">read more</a></div>\n<a href="http://other.realm/map.html" class="external">Map of the realm</a>\n</body></html>',
  'http://guild.site/dragon.html': '<html><head><title>Dragon sighted</title></head><body><h2>Dragon sighted</h2><p>A red dragon over the north tower.</p><a href="market.html">next</a></body></html>',
  'http://guild.site/market.html': '<html><head><title>Market day</title></head><body><h2>Market day</h2><p>Stalls open at dawn.</p><a href="scribes.html">next</a></body></html>',
  'http://guild.site/scribes.html': '<html><head><title>Scribes wanted</title></head><body><h2>Scribes wanted</h2><p>Apply at the library.</p><a href="index.html">home</a></body></html>',
  'http://guild.site/prices.html': '<html><body><table id="prices"><tr><th>Item</th><th>Price</th></tr><tr><td>rope</td><td>3</td></tr><tr><td>lamp</td><td>12</td></tr><tr><td>map</td><td>7</td></tr></table></body></html>',
};
const SOUP = ['from urllib.request import urlopen', 'from bs4 import BeautifulSoup', 'html = urlopen("http://guild.site/index.html").read()', 'soup = BeautifulSoup(html, "html.parser")'];

const WORLD38 = {
  id: 38, name: "The Spider's Lair", topic: 'web scraping and HTML',
  nodes: [[50, 93], [26, 84], [66, 75], [34, 66], [68, 57], [30, 48], [66, 39], [36, 29], [62, 19], [50, 7]],
  levels: [
    {
      id: '38-1', title: 'Threads of HTML', bg: 'hollow', npc: 'arachne', mentor: 'arachne', tags: ['htmlbasics'],
      steps: [
        { type: 'talk', who: 'arachne', text: "Welcome to my lair, {NAME}. I'm Arachne. Web pages are written in HTML: tags like <h1>Notices</h1> and <a href=\"page.html\">link</a> nested inside each other. Scraping means reading the data out of those tags with a program." },
        { type: 'talk', who: 'arachne', text: 'from bs4 import BeautifulSoup (pip install beautifulsoup4). BeautifulSoup(html, "html.parser") turns the page into a tree you can search. soup.title is the first <title> tag; .text or .string is the words inside it.' },
        { type: 'demo', web: SPIDER_WEB, text: 'Run it.', code: [...SOUP, 'print(soup.title)', 'print(soup.title.string)', 'print(soup.h1.text)'] },
        {
          type: 'predict', text: 'A page in a string. What will it say?', code: ['from bs4 import BeautifulSoup', 'soup = BeautifulSoup("<html><body><p>Hello <b>world</b></p></body></html>", "html.parser")', 'print(soup.p.text, soup.b.text)'],
          explain: '.text joins all the words inside a tag, including those inside its child tags.',
        },
        {
          type: 'predict', web: SPIDER_WEB, text: 'What will it say?', code: [...SOUP, 'print(soup.h2.text, soup.find("p").get_text())'],
          explain: 'soup.h2 is the FIRST h2 on the page.',
        },
        {
          type: 'fill', web: SPIDER_WEB, text: 'Read the words inside the first <h1>.',
          lines: [...SOUP, 'print(soup.h1.[])'], chips: ['text', 'name', 'attrs'], answer: [['text']],
          hints: ['The words inside a tag.', 'soup.h1.text'],
        },
        {
          type: 'write', text: 'Parse the HTML in page and print the text of its <title> and of its <h1>.',
          starter: ['from bs4 import BeautifulSoup', 'page = "<html><head><title>Lair</title></head><body><h1>Webs</h1></body></html>"'], keys: ['soup', '=', 'BeautifulSoup', '(', ')', 'page', '"html.parser"', ',', 'print', 'soup.title.text', 'soup.h1.text'],
          require: l => (has(l, /BeautifulSoup\s*\(/) ? null : 'Parse it with BeautifulSoup.'),
          hints: ['soup = BeautifulSoup(page, "html.parser")', 'print(soup.title.text) then print(soup.h1.text)'],
          solution: ['soup = BeautifulSoup(page, "html.parser")', 'print(soup.title.text)', 'print(soup.h1.text)'],
        },
      ],
      learn: [{ title: 'Parsing HTML', code: 'soup = BeautifulSoup(html, "html.parser")\nsoup.title.string   soup.h1.text', text: 'HTML is a tree of tags. BeautifulSoup lets you walk and search it.' }],
    },
    {
      id: '38-2', title: 'Catching tags', bg: 'hollow', npc: 'arachne', mentor: 'arachne', tags: ['findtags'],
      steps: [
        { type: 'talk', who: 'arachne', text: 'soup.find("a") finds the first <a> tag; soup.find_all("a") finds them ALL as a list (soup("a") is a shortcut). A tag\'s attributes are read with tag.get("href") or tag["href"]; get returns None if it is missing, [] raises KeyError.' },
        { type: 'demo', web: SPIDER_WEB, text: 'Python for Everybody\'s link scraper. Run it.', code: [...SOUP, 'tags = soup("a")', 'for tag in tags:', '    print(tag.get("href", None))'] },
        {
          type: 'predict', web: SPIDER_WEB, text: 'What will it say?', code: [...SOUP, 'print(len(soup.find_all("div")), len(soup.find_all("span")))'],
          explain: 'Three posts, and each post has an author and a comments span.',
        },
        {
          type: 'predict', web: SPIDER_WEB, text: 'What will it say?', code: [...SOUP, 'print([a.text for a in soup.find_all("a")][-1], soup.a["href"])'],
          explain: 'The last link\'s words, and the href of the first link.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'A missing attribute with []. Which error?', code: ['from bs4 import BeautifulSoup', 'soup = BeautifulSoup(\'<a href="x.html">x</a>\', "html.parser")', 'print(soup.a["title"])'],
          explain: 'The tag has no title attribute: KeyError. tag.get("title") would give None.',
        },
        {
          type: 'fill', web: SPIDER_WEB, text: 'Collect every post heading.',
          lines: [...SOUP, 'print([h.text for h in soup.[]("h2")])'], chips: ['find_all', 'find', 'get'], answer: [['find_all']],
          hints: ['All of them, as a list.', 'soup.find_all("h2")'],
        },
        {
          type: 'write', web: SPIDER_WEB, text: 'Print the text of every span on the page that is NOT a number (those are the authors).',
          starter: SOUP, keys: ['for', 's', 'in', 'soup.find_all', '(', ')', '"span"', ':', 'if', 'not', 's.text', '.isdigit()', 'print'],
          require: l => (has(l, /find_all\s*\(\s*"span"/) ? null : 'Look at every span.'),
          hints: ['for s in soup.find_all("span"):', '    if not s.text.isdigit(): print(s.text)'],
          solution: ['for s in soup.find_all("span"):', '    if not s.text.isdigit():', '        print(s.text)'],
        },
      ],
      learn: [{ title: 'Finding tags', code: 'soup.find("a")   soup.find_all("a")   soup("a")\ntag.get("href")  tag["href"]  tag.text', text: 'The first match, or all of them; then read attributes and text.' }],
    },
    {
      id: '38-3', title: 'Marked threads', bg: 'thorns', npc: 'arachne', mentor: 'arachne', tags: ['classid'],
      steps: [
        { type: 'talk', who: 'arachne', text: 'Web designers MARK tags so they can style them: an id (unique on the page) or a class (shared). Scrapers use the same marks: find(id="top"), find_all(class_="post") (with an underscore, because class is a Python keyword), or attrs={"class": "post"}.' },
        { type: 'demo', web: SPIDER_WEB, text: 'Run it.', code: [...SOUP, 'print(soup.find(id="top").text)', 'for post in soup.find_all("div", class_="post"):', '    print(post.h2.text, "by", post.find("span", class_="author").text)'] },
        {
          type: 'predict', web: SPIDER_WEB, text: 'Classes come back as a list. What will it say?', code: [...SOUP, 'posts = soup.find_all("div", class_="post")', 'print(posts[2]["class"], posts[0].get("id"))'],
          explain: 'A tag can have several classes, so class is a list. The posts have no id: None.',
        },
        {
          type: 'predict', web: SPIDER_WEB, text: 'What will it say?', code: [...SOUP, 'urgent = soup.find_all(class_="urgent")', 'print(len(urgent), urgent[0].h2.text)'],
          explain: 'Only the third post also has the class urgent.',
        },
        {
          type: 'fill', web: SPIDER_WEB, text: 'Find the link marked with the class "external".',
          lines: [...SOUP, 'link = soup.find("a", []="external")', 'print(link["href"])'], chips: ['class_', 'class', 'id'], answer: [['class_']],
          hints: ['class is a Python keyword, so BeautifulSoup uses class_.', 'class_="external"'],
        },
        {
          type: 'write', web: SPIDER_WEB, text: 'Print the comment counts of all posts as a list of numbers (spans with class "comments").',
          starter: SOUP, keys: ['print', '(', ')', '[', ']', 'int', 's.text', 'for', 's', 'in', 'soup.find_all', '"span"', ',', 'class_="comments"'],
          require: l => (has(l, /class_\s*=\s*"comments"/) ? null : 'Use class_="comments".'),
          hints: ['soup.find_all("span", class_="comments")', 'print([int(s.text) for s in soup.find_all("span", class_="comments")])'],
          solution: ['print([int(s.text) for s in soup.find_all("span", class_="comments")])'],
        },
      ],
      learn: [{ title: 'ids and classes', code: 'soup.find(id="top")\nsoup.find_all("div", class_="post")\ntag["class"]   # a list', text: 'Use the marks web designers leave on tags.' }],
    },
    {
      id: '38-4', title: 'Weblings', bg: 'hollow', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'webling', hp: d0 + 12 + 5 + 30, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Weblings swarm the notice board! $HP HP. Every comment count is a strike.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', web: SPIDER_WEB, text: 'It has $HP HP left. Cast fireball with each comment count.',
          lines: [...SOUP, 'for s in soup.find_all("span", class_="comments"):', '    cast(fireball, [](s.text))'], chips: ['int', 'len', 'str'], answer: [['int']],
          goal: { foeDown: true },
          hints: ['The text "12" must become the number 12.', 'int(s.text)'],
        },
        { type: 'talk', who: 'narrator', text: 'The webling mother is as strong as the number of links!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 4 * 2 }),
          web: SPIDER_WEB,
          spawn: v => ({ kind: 'webling', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Count the <a> tags on the index page and cast icebolt with the count × 2, twice.',
          starter: SOUP, keys: ['n', '=', 'len', '(', ')', 'soup', '"a"', 'cast', 'icebolt', ',', '*', '2'],
          goal: { foeDown: true },
          require: l => (has(l, /soup\s*\(\s*"a"\s*\)|find_all\s*\(\s*"a"/) ? null : 'Collect the <a> tags.'),
          hints: ['n = len(soup("a"))', 'cast(icebolt, n * 2) twice'],
          solution: ['n = len(soup("a"))', 'cast(icebolt, n * 2)', 'cast(icebolt, n * 2)'],
        },
      ],
      learn: [{ title: 'Scraped numbers', code: 'int(span.text)', text: 'Text on pages is always text: convert it.' }],
    },
    {
      id: '38-5', title: 'Selector silk', bg: 'thorns', npc: 'arachne', mentor: 'arachne', tags: ['cssselect'],
      steps: [
        { type: 'talk', who: 'arachne', text: 'CSS selectors are the designers\' own language for picking tags, and soup.select speaks it: "h2" all h2 tags, ".post" class post, "#top" id top, "div.post h2" h2s inside post divs, "a[href]" links that have an href. select_one gives the first match.' },
        { type: 'demo', web: SPIDER_WEB, text: 'Run it.', code: [...SOUP, 'print([h.text for h in soup.select("div.post h2")])', 'print(soup.select_one("#top").text)', 'print(len(soup.select("a[href]")))'] },
        {
          type: 'predict', web: SPIDER_WEB, text: 'What will it say?', code: [...SOUP, 'print([s.text for s in soup.select(".urgent .author")])'],
          explain: 'Authors inside tags that have the class urgent.',
        },
        {
          type: 'predict', web: SPIDER_WEB, text: 'Child versus descendant. What will it say?', code: [...SOUP, 'print(len(soup.select("p b")), len(soup.select("body > b")))'],
          explain: '"p b" finds b anywhere inside p. "body > b" wants b DIRECTLY inside body; there is none.',
        },
        {
          type: 'fill', web: SPIDER_WEB, text: 'Pick the h1 by its id.',
          lines: [...SOUP, 'print(soup.select_one("[]").text)'], chips: ['#top', '.top', 'top'], answer: [['#top']],
          hints: ['# means id in CSS.', '"#top"'],
        },
        {
          type: 'write', web: SPIDER_WEB, text: 'With one select call, print the text of every author span inside a post div, as a list.',
          starter: SOUP, keys: ['print', '(', ')', '[', ']', 'a.text', 'for', 'a', 'in', 'soup.select', '"div.post span.author"'],
          require: l => (has(l, /select\s*\(/) ? null : 'Use soup.select.'),
          hints: ['The selector: "div.post span.author"', 'print([a.text for a in soup.select("div.post span.author")])'],
          solution: ['print([a.text for a in soup.select("div.post span.author")])'],
        },
      ],
      learn: [{ title: 'CSS selectors', code: 'soup.select("div.post h2")\nsoup.select_one("#top")\n"a[href]"  "body > p"', text: 'tag, .class, #id, [attr], descendants and children, in one string.' }],
    },
    {
      id: '38-6', title: 'Following the threads', bg: 'hollow', npc: 'arachne', mentor: 'arachne', tags: ['links'],
      steps: [
        { type: 'talk', who: 'arachne', text: 'Links can be absolute (http://guild.site/scribes.html) or RELATIVE (dragon.html, meaning "next to this page"). urljoin(page_url, href) turns any link into a full address. A crawler opens a page, finds a link, opens THAT page, and so on.' },
        { type: 'demo', web: SPIDER_WEB, text: 'Run it.', code: ['from urllib.parse import urljoin', 'base = "http://guild.site/index.html"', 'for href in ["dragon.html", "http://guild.site/scribes.html", "../x.html"]:', '    print(urljoin(base, href))'] },
        {
          type: 'predict', web: SPIDER_WEB, text: 'Only links on this site. What will it say?', code: [...SOUP, 'from urllib.parse import urljoin', 'urls = [urljoin("http://guild.site/index.html", a["href"]) for a in soup("a")]', 'print([u for u in urls if u.startswith("http://guild.site/")])'],
          explain: 'Relative links become full URLs; the external map link is filtered out.',
        },
        {
          type: 'predict', web: SPIDER_WEB, text: 'A tiny crawler: follow the first link three times. What will it say?', code: ['from urllib.request import urlopen', 'from urllib.parse import urljoin', 'from bs4 import BeautifulSoup', 'url = "http://guild.site/dragon.html"', 'for step in range(3):', '    soup = BeautifulSoup(urlopen(url).read(), "html.parser")', '    print(soup.title.text)', '    url = urljoin(url, soup.find("a")["href"])'],
          explain: 'Each page links to the next: dragon → market → scribes.',
        },
        {
          type: 'fill', web: SPIDER_WEB, text: 'Turn the relative link into a full URL.',
          lines: ['from urllib.parse import urljoin', 'page = "http://guild.site/market.html"', 'print([](page, "scribes.html"))'], chips: ['urljoin', 'urlencode', 'urlparse'], answer: [['urljoin']],
          hints: ['Join a base URL and a link.', 'urljoin(page, "scribes.html")'],
        },
        {
          type: 'write', web: SPIDER_WEB, text: 'Python for Everybody\'s "following links": start at http://guild.site/market.html, and twice: open the page, find its first link, and move to it with urljoin. Print the title of the page you end on.',
          starter: ['from urllib.request import urlopen', 'from urllib.parse import urljoin', 'from bs4 import BeautifulSoup', 'url = "http://guild.site/market.html"'], keys: ['for', 'i', 'in', 'range', '(', ')', '2', ':', 'soup', '=', 'BeautifulSoup', 'urlopen', 'url', '.read()', '"html.parser"', ',', 'urljoin', 'soup.find', '"a"', '[', ']', '"href"', 'print', 'soup.title.text'],
          require: l => (has(l, /urljoin/) && has(l, /for\s+\w+\s+in\s+range/) ? null : 'Loop twice, moving with urljoin.'),
          hints: ['for i in range(2): soup = BeautifulSoup(urlopen(url).read(), "html.parser"); url = urljoin(url, soup.find("a")["href"])', 'Finally open url once more and print its title.'],
          solution: ['for i in range(2):', '    soup = BeautifulSoup(urlopen(url).read(), "html.parser")', '    url = urljoin(url, soup.find("a")["href"])', 'soup = BeautifulSoup(urlopen(url).read(), "html.parser")', 'print(soup.title.text)'],
        },
      ],
      learn: [{ title: 'Following links', code: 'url = urljoin(url, a["href"])\nsoup = BeautifulSoup(urlopen(url).read(), "html.parser")', text: 'Make every link absolute, then visit it. That is how crawlers work.' }],
    },
    {
      id: '38-7', title: 'Harvesting the web', bg: 'hollow', npc: 'arachne', mentor: 'arachne', tags: ['scrapedata'],
      steps: [
        { type: 'talk', who: 'arachne', text: 'The real prize is DATA. Tables are rows (<tr>) of cells (<td>); turn them into lists or dicts. Then sum, sort and report like any other data. (Always check a site\'s rules before scraping it, and go gently.)' },
        { type: 'demo', web: SPIDER_WEB, text: 'Run it.', code: ['from urllib.request import urlopen', 'from bs4 import BeautifulSoup', 'soup = BeautifulSoup(urlopen("http://guild.site/prices.html").read(), "html.parser")', 'for row in soup.find_all("tr")[1:]:', '    cells = [td.text for td in row.find_all("td")]', '    print(cells)'] },
        {
          type: 'predict', web: SPIDER_WEB, text: 'A price list. What will it say?', code: ['from urllib.request import urlopen', 'from bs4 import BeautifulSoup', 'soup = BeautifulSoup(urlopen("http://guild.site/prices.html").read(), "html.parser")', 'prices = {}', 'for row in soup.find_all("tr")[1:]:', '    item, price = [td.text for td in row.find_all("td")]', '    prices[item] = int(price)', 'print(prices, max(prices, key=prices.get))'],
          explain: 'Each row becomes a dict entry; the most expensive item is the lamp.',
        },
        {
          type: 'predict', web: SPIDER_WEB, text: 'Python for Everybody\'s comment sum. What will it say?', code: [...SOUP, 'total = sum(int(span.text) for span in soup("span") if "comments" in span.get("class", []))', 'print(total)'],
          explain: '12 + 5 + 30.',
        },
        {
          type: 'fill', web: SPIDER_WEB, text: 'Read the cells of each table row.',
          lines: ['from urllib.request import urlopen', 'from bs4 import BeautifulSoup', 'soup = BeautifulSoup(urlopen("http://guild.site/prices.html").read(), "html.parser")', 'rows = soup.find_all("tr")[1:]', 'print([r.find_all("[]")[0].text for r in rows])'], chips: ['td', 'tr', 'th'], answer: [['td']],
          hints: ['Cells are td tags.', 'r.find_all("td")'],
        },
        {
          type: 'write', web: SPIDER_WEB, text: 'Print the total price of everything in the price table (sum the second cell of every row after the header).',
          starter: ['from urllib.request import urlopen', 'from bs4 import BeautifulSoup', 'soup = BeautifulSoup(urlopen("http://guild.site/prices.html").read(), "html.parser")'], keys: ['total', '=', 'sum', '(', ')', 'int', 'row.find_all', '"td"', '[', ']', '1', '.text', 'for', 'row', 'in', 'soup.find_all', '"tr"', '1:', 'print'],
          require: l => (has(l, /find_all\s*\(\s*"tr"/) ? null : 'Walk the table rows.'),
          hints: ['total = sum(int(row.find_all("td")[1].text) for row in soup.find_all("tr")[1:])', 'print(total)'],
          solution: ['total = sum(int(row.find_all("td")[1].text) for row in soup.find_all("tr")[1:])', 'print(total)'],
        },
      ],
      learn: [{ title: 'Harvesting data', code: 'for row in soup.find_all("tr")[1:]:\n    cells = [td.text for td in row.find_all("td")]', text: 'Turn tags into rows, rows into data. Be polite: check the site\'s rules.' }],
    },
    {
      id: '38-8', title: 'Silk bats', bg: 'thorns', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'silkbat', hp: d0 + 3 + 12 + 7, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Silk bats wrap the market stalls! $HP HP. Every price on the price list strikes.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', web: SPIDER_WEB, text: 'It has $HP HP left. Cast fireball with each price from the table.',
          lines: ['from urllib.request import urlopen', 'from bs4 import BeautifulSoup', 'soup = BeautifulSoup(urlopen("http://guild.site/prices.html").read(), "html.parser")', 'for row in soup.find_all("tr")[[]:]:', '    cast(fireball, int(row.find_all("td")[1].text))'], chips: ['1', '0', '2'], answer: [['1']],
          goal: { foeDown: true },
          require: s => (s[0] === '1' ? null : 'Skip the header row: start at 1.'),
          hints: ['The first row holds the headings.', '[1:]'],
        },
        { type: 'talk', who: 'narrator', text: 'The silk matriarch hides behind the urgent notice!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 30 }),
          web: SPIDER_WEB,
          spawn: v => ({ kind: 'silkbat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Use select_one to find the comments span inside the urgent post, and cast icebolt with its number, twice.',
          starter: SOUP, keys: ['n', '=', 'int', '(', ')', 'soup.select_one', '".urgent .comments"', '.text', 'cast', 'icebolt', ','],
          goal: { foeDown: true },
          require: l => (has(l, /select_one/) ? null : 'Use soup.select_one.'),
          hints: ['n = int(soup.select_one(".urgent .comments").text)', 'cast(icebolt, n) twice'],
          solution: ['n = int(soup.select_one(".urgent .comments").text)', 'cast(icebolt, n)', 'cast(icebolt, n)'],
        },
      ],
      learn: [{ title: 'Scraping in battle', code: 'soup.select_one(".urgent .comments")', text: 'Selectors pinpoint exactly the data you want.' }],
    },
    {
      id: '38-9', title: 'The Spider Queen', bg: 'hollow', foe: { kind: 'spiderqueen', hp: 190, weak: 'fireball', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'spiderqueen', text: 'EVERY... PAGE... IS... MY... WEB...' },
        { type: 'talk', who: 'narrator', text: 'The Spider Queen has 190 HP. Fireball burns silk: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', web: SPIDER_WEB, text: 'How much damage? Fireball is doubled.', code: [...SOUP, 'cast(fireball, len(soup.find_all("div", class_="post")) * 3)'],
          explain: 'Three posts × 3 = 9, doubled.',
        },
        {
          type: 'fix', web: SPIDER_WEB, text: 'This should print every link\'s address, but crashes on a link without one. Run it, then tap the broken line.',
          code: ['from bs4 import BeautifulSoup', 'soup = BeautifulSoup(\'<a href="a.html">A</a><a name="top">T</a><a href="b.html">B</a>\', "html.parser")', 'for a in soup("a"):', '    print(a["href"])', 'cast(fireball, 5)'], bad: 3,
          options: ['    print(a.get("href"))', '    print(a.href)', '    print(a["name"])'], answer: 0,
          explain: 'get returns None for a missing attribute instead of raising KeyError.',
        },
        { type: 'talk', who: 'spiderqueen', text: 'COUNT... MY... THREADS...' },
        {
          type: 'fill', web: SPIDER_WEB, text: 'Strike with fireball, the number of links that point to other sites (they start with http:// but not http://guild.site/), times 10.',
          lines: [...SOUP, 'ext = [a for a in soup("a") if a["href"].startswith("http") and not a["href"].startswith("http://guild.site/")]', 'cast(fireball, len(ext) * [])'], chips: ['10', '1', '0'], answer: [['10']],
          hints: ['Times 10.', '* 10'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and fireball is doubled. Parse the HTML "<b>N</b>" where N is $HP // 2 + 1 (build it with an f-string), read the number back from the b tag, and cast fireball with it.',
          starter: ['from bs4 import BeautifulSoup'], keys: ['soup', '=', 'BeautifulSoup', '(', ')', 'f"<b>{$HP // 2 + 1}</b>"', '"html.parser"', ',', 'n', 'int', 'soup.b.text', 'cast', 'fireball'],
          goal: { foeDown: true },
          require: l => (has(l, /BeautifulSoup/) ? null : 'Parse it with BeautifulSoup.'),
          hints: ['soup = BeautifulSoup(f"<b>{$HP // 2 + 1}</b>", "html.parser")', 'cast(fireball, int(soup.b.text))'],
          solution: ['soup = BeautifulSoup(f"<b>{$HP // 2 + 1}</b>", "html.parser")', 'n = int(soup.b.text)', 'cast(fireball, n)'],
        },
        { type: 'talk', who: 'spiderqueen', text: '...my... web... is... torn...' },
      ],
      learn: [{ title: 'Spider toolkit', code: 'BeautifulSoup  find  find_all  soup("a")  get  class_  select  urljoin', text: 'Everything from the Spider\'s Lair.' }],
    },
    {
      id: '38-R', title: 'The Data Oracle', bg: 'source', foe: { kind: 'dataoracle', hp: 280 }, mentor: 'narrator', boss: true, review: true, tags: [],
      steps: [
        { type: 'talk', who: 'dataoracle', text: 'Files, ledgers, roots, vaults, the sky and the web, {NAME}. Data flows through all of them. Show me you can make it flow.' },
        { type: 'talk', who: 'narrator', text: 'The Act VII review! CSV, JSON, XML, SQL and the web, all mixed. 280 HP. Each right answer strikes.' },
        { type: 'review', tags: ['csvread', 'dictreader', 'csvwrite', 'jsontypes', 'jsonnest', 'jsonfile'], reward: { spell: 'spark', power: 25 }, text: 'The Ledger Hall. What will it say?' },
        { type: 'review', tags: ['xmlbasics', 'xmlfindall', 'xmldeep', 'xmlparse', 'xmlmissing', 'xmlbuild'], reward: { spell: 'fireball', power: 25 }, text: 'The Root Library. What will it say?' },
        { type: 'review', tags: ['sqlbasics', 'sqlwhere', 'sqlparams', 'sqlupdate', 'sqlagg', 'sqlkeys'], reward: { spell: 'icebolt', power: 25 }, text: 'The Vault of Records. What will it say?' },
        { type: 'review', tags: ['relations', 'joins', 'join3', 'linkinsert', 'manytomany', 'leftjoin'], reward: { spell: 'spark', power: 25 }, text: 'The Web of Tables. What will it say?' },
        { type: 'review', tags: ['urlparts', 'bytesq', 'dates', 'strftime', 'pathparts', 'ospath'], reward: { spell: 'fireball', power: 25 }, text: 'The Sky Post and Act VI. What will it say?' },
        { type: 'review', tags: ['fmtspec', 'percentfmt', 'cleaning', 'harvest', 'traceback', 'assertq'], reward: { spell: 'icebolt', power: 25 }, text: 'Text and debugging. What will it say?' },
        { type: 'talk', who: 'dataoracle', text: 'One last flow: from CSV, into a database, out as JSON.' },
        {
          type: 'write', vars: (R, c) => ({ h: c.foe.hp, a: Math.floor(c.foe.hp / 2), b: c.foe.hp - Math.floor(c.foe.hp / 2) }),
          text: 'Read the two rows of rows.csv with DictReader, insert them into a sqlite table blows (power INTEGER) with ?, sum them with SQL, turn the sum into JSON text with json.dumps, read it back with json.loads, and cast spark with it.',
          starter: ['import csv, sqlite3, json', 'open("rows.csv", "w").write("power\\n$a\\n$b\\n")', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE blows (power INTEGER)")'], keys: ['with', 'open', '(', ')', '"rows.csv"', 'newline=""', 'as', 'f', ':', 'for', 'row', 'in', 'csv.DictReader', 'db.execute', '"INSERT INTO blows VALUES (?)"', '(row["power"],)', 'total', '=', '"SELECT SUM(power) FROM blows"', '.fetchone()', '[0]', 'back', 'json.loads', 'json.dumps', 'cast', 'spark', ','],
          goal: { foeDown: true },
          require: l => (has(l, /DictReader/) && has(l, /INSERT INTO blows/i) && has(l, /json\.dumps/) ? null : 'Use DictReader, an INSERT with ?, and json.dumps / json.loads.'),
          hints: ['with open("rows.csv", newline="") as f: for row in csv.DictReader(f): db.execute("INSERT INTO blows VALUES (?)", (row["power"],))', 'total = db.execute("SELECT SUM(power) FROM blows").fetchone()[0]; back = json.loads(json.dumps(total)); cast(spark, back)'],
          solution: ['with open("rows.csv", newline="") as f:', '    for row in csv.DictReader(f):', '        db.execute("INSERT INTO blows VALUES (?)", (row["power"],))', 'total = db.execute("SELECT SUM(power) FROM blows").fetchone()[0]', 'back = json.loads(json.dumps(total))', 'cast(spark, back)'],
        },
        { type: 'talk', who: 'dataoracle', text: 'Data obeys you now. Act VIII awaits: the advanced arts of Python itself.' },
      ],
      learn: [{ title: 'Act VII', code: 'csv  json  xml  sqlite3  JOIN  urllib  requests  BeautifulSoup', text: 'Data in every shape, from files to the web.' }],
    },
  ],
};
WORLDS.push(WORLD38);

(() => {
  const { makeQ, pick } = Arena;
  const H = '<div id="m"><p class="a">one</p><p class="a b">two</p><a href="x.html">go</a></div>';
  Object.assign(Arena.GEN, {
    htmlbasics: () => makeQ(['from bs4 import BeautifulSoup', `s = BeautifulSoup('${H}', "html.parser")`, 'print(s.p.text)'], ['two', '<p class="a">one</p>']),
    findtags: () => makeQ(['from bs4 import BeautifulSoup', `s = BeautifulSoup('${H}', "html.parser")`, 'print(len(s.find_all("p")), s.a["href"])'], ['1 x.html', '2 go']),
    classid: () => makeQ(['from bs4 import BeautifulSoup', `s = BeautifulSoup('${H}', "html.parser")`, 'print(len(s.find_all(class_="b")), s.find(id="m").name)'], ['2 div', '1 m']),
    cssselect: () => makeQ(['from bs4 import BeautifulSoup', `s = BeautifulSoup('${H}', "html.parser")`, 'print([p.text for p in s.select("#m p.a")])'], ["['one']", "['two']"]),
    links: () => makeQ(['from urllib.parse import urljoin', `print(urljoin("http://a.site/x/y.html", "${pick(['z.html', '../z.html'])}"))`], ['z.html', 'http://a.site/z.html/x']),
    scrapedata: () => makeQ(['from bs4 import BeautifulSoup', 's = BeautifulSoup("<tr><td>a</td><td>4</td></tr><tr><td>b</td><td>6</td></tr>", "html.parser")', 'print(sum(int(r.find_all("td")[1].text) for r in s.find_all("tr")))'], [2, 46]),
  });
})();
