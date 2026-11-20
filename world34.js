/* World 34: The Root Library. XML with xml.etree.ElementTree: tags, text and attributes,
   find / findall over children, deep searches with .//tag and iter(), attribute filters,
   parsing XML files, empty and missing elements, and building XML with Element and
   SubElement. Source: Python for Everybody, chapter 13. */
Object.assign(EXTRA.npcs, {
  rhiza: { name: 'Librarian Rhiza', colors: ['#5a6a3a', '#d8d0c0', '#ecb98d'] },
});
Object.assign(EXTRA.foes, {
  tagmite: { base: 'bookworm', name: 'Tag mite', pal: { G: '#7a9a5a', L: '#c4f5a8' } },
  angleimp: { base: 'goblin', name: 'Angle imp', pal: { G: '#9a7fd6', B: '#3a2a5a' } },
  markuphydra: { base: 'hydra', name: 'The Markup Hydra' },
});
const PERSON_XML = '<person><name>Chuck</name><phone type="intl">+1 734 303 4456</phone><email hide="yes" /></person>';
const USERS_XML = '<stuff><users><user x="2"><id>001</id><name>Chuck</name></user><user x="7"><id>009</id><name>Brent</name></user><user x="5"><id>042</id><name>Ada</name></user></users></stuff>';
const SHELF_XML = '<library>\n  <shelf room="north">\n    <book id="b1"><title>Spells</title><pages>120</pages></book>\n    <book id="b2"><title>Potions</title><pages>80</pages></book>\n  </shelf>\n  <shelf room="south">\n    <book id="b3"><title>Runes</title><pages>200</pages></book>\n  </shelf>\n</library>\n';

const WORLD34 = {
  id: 34, name: 'The Root Library', topic: 'XML',
  nodes: [[50, 92], [28, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [40, 21], [52, 8]],
  levels: [
    {
      id: '34-1', title: 'Tags and text', bg: 'library', npc: 'rhiza', mentor: 'rhiza', tags: ['xmlbasics'],
      steps: [
        { type: 'talk', who: 'rhiza', text: "Welcome to the Root Library, {NAME}. I'm Rhiza. Before JSON, the web passed data around as XML: text wrapped in TAGS like <name>Chuck</name>. Tags can hold ATTRIBUTES, like <phone type=\"intl\">, and other tags inside them." },
        { type: 'talk', who: 'rhiza', text: 'import xml.etree.ElementTree as ET, then ET.fromstring(text) gives you the outermost element. element.find("name") finds a child tag, .text is the text inside it, and .get("type") reads an attribute.' },
        { type: 'demo', vars: () => ({ x: PERSON_XML }), text: 'Run it.', code: ['import xml.etree.ElementTree as ET', "tree = ET.fromstring('$x')", 'print("Name:", tree.find("name").text)', 'print("Attr:", tree.find("email").get("hide"))'] },
        {
          type: 'predict', vars: () => ({ x: PERSON_XML }), text: 'What will it say?', code: ['import xml.etree.ElementTree as ET', "p = ET.fromstring('$x')", 'print(p.tag, p.find("phone").get("type"))'],
          explain: 'The outer element is person; the phone tag has the attribute type="intl".',
        },
        {
          type: 'predict', vars: () => ({ x: PERSON_XML }), text: 'An empty tag. What will it say?', code: ['import xml.etree.ElementTree as ET', "p = ET.fromstring('$x')", 'print(p.find("email").text, len(p))'],
          explain: '<email hide="yes" /> has no text inside, so .text is None. The person element has 3 children.',
        },
        {
          type: 'fill', vars: () => ({ x: PERSON_XML }), text: 'Read the phone number.',
          lines: ['import xml.etree.ElementTree as ET', "p = ET.fromstring('$x')", 'print(p.find("phone").[])'], chips: ['text', 'tag', 'get'], answer: [['text']],
          hints: ['The words between the tags.', '.text'],
        },
        {
          type: 'write', vars: R => ({ c: R.pick(['red', 'gold', 'teal']), n: R.pick(['Ember', 'Frost']) }),
          text: 'Parse the potion XML and print its name, then the value of its color attribute.',
          starter: ['import xml.etree.ElementTree as ET', "xml = '<potion color=\"$c\"><name>$n</name></potion>'"], keys: ['p', '=', 'ET.fromstring', '(', ')', 'xml', 'print', '.find', '"name"', '.text', '.get', '"color"'],
          require: l => (has(l, /fromstring/) ? null : 'Parse with ET.fromstring.'),
          hints: ['p = ET.fromstring(xml)', 'print(p.find("name").text) then print(p.get("color"))'],
          solution: ['p = ET.fromstring(xml)', 'print(p.find("name").text)', 'print(p.get("color"))'],
        },
      ],
      learn: [{ title: 'XML basics', code: 'el = ET.fromstring(text)\nel.tag  el.find("name").text  el.get("type")', text: 'Tags, the text between them, and attributes inside the opening tag.' }],
    },
    {
      id: '34-2', title: 'Many children', bg: 'library', npc: 'rhiza', mentor: 'rhiza', tags: ['xmlfindall'],
      steps: [
        { type: 'talk', who: 'rhiza', text: 'find gives the FIRST match. findall("users/user") gives a LIST of every user inside users. You can also loop over an element directly to visit its children.' },
        { type: 'demo', vars: () => ({ x: USERS_XML }), text: 'Run it.', code: ['import xml.etree.ElementTree as ET', "stuff = ET.fromstring('$x')", 'lst = stuff.findall("users/user")', 'print("User count:", len(lst))', 'for item in lst:', '    print("Name", item.find("name").text, "Id", item.find("id").text, "Attribute", item.get("x"))'] },
        {
          type: 'predict', vars: () => ({ x: USERS_XML }), text: 'What will it say?', code: ['import xml.etree.ElementTree as ET', "stuff = ET.fromstring('$x')", 'print(sum(int(u.get("x")) for u in stuff.findall("users/user")))'],
          explain: 'Attributes are text too: convert each x with int() and add them.',
        },
        {
          type: 'predict', vars: R => ({ x: USERS_XML, k: R.int(0, 2) }), text: 'Indexing children. What will it say?', code: ['import xml.etree.ElementTree as ET', "stuff = ET.fromstring('$x')", 'users = stuff[0]', 'print(users.tag, len(users), users[$k].find("name").text)'],
          explain: 'stuff[0] is the users element; its children are the user elements, in order.',
        },
        {
          type: 'predict', vars: () => ({ x: USERS_XML }), text: 'find versus findall. What will it say?', code: ['import xml.etree.ElementTree as ET', "stuff = ET.fromstring('$x')", 'print(stuff.find("user"), len(stuff.findall("users/user")))'],
          explain: 'find only looks at DIRECT children: user is a grandchild, so find("user") gives None.',
        },
        {
          type: 'fill', vars: () => ({ x: USERS_XML }), text: 'Print every user name.',
          lines: ['import xml.etree.ElementTree as ET', "stuff = ET.fromstring('$x')", 'for u in stuff.[]("users/user"):', '    print(u.find("name").text)'], chips: ['findall', 'find', 'get'], answer: [['findall']],
          hints: ['All the matches, as a list.', 'stuff.findall("users/user")'],
        },
        {
          type: 'write', vars: () => ({ x: USERS_XML }), text: 'Print the id of the user whose x attribute is the biggest.',
          starter: ['import xml.etree.ElementTree as ET', "stuff = ET.fromstring('$x')"], keys: ['best', '=', 'max', '(', ')', 'stuff.findall', '"users/user"', ',', 'key', 'lambda', 'u', ':', 'int', 'u.get', '"x"', 'print', '.find', '"id"', '.text'],
          require: l => (has(l, /findall/) ? null : 'Use findall("users/user").'),
          hints: ['best = max(stuff.findall("users/user"), key=lambda u: int(u.get("x")))', 'print(best.find("id").text)'],
          solution: ['best = max(stuff.findall("users/user"), key=lambda u: int(u.get("x")))', 'print(best.find("id").text)'],
        },
      ],
      learn: [{ title: 'findall', code: 'for u in root.findall("users/user"):\n    u.find("name").text', text: 'Find every match along a path of tags. find() only looks one level down.' }],
    },
    {
      id: '34-3', title: 'Deep roots', bg: 'archive', npc: 'rhiza', mentor: 'rhiza', tags: ['xmldeep'],
      steps: [
        { type: 'talk', who: 'rhiza', text: 'To search at ANY depth, start the path with .// : root.findall(".//book") finds books however deep they are. root.iter("book") does the same as a loop. And [@id="b2"] picks only elements with that attribute value.' },
        { type: 'demo', vars: () => ({ x: SHELF_XML.replace(/\n\s*/g, '') }), text: 'Run it.', code: ['import xml.etree.ElementTree as ET', "lib = ET.fromstring('$x')", 'print([b.get("id") for b in lib.findall(".//book")])', 'print(lib.find(".//book[@id=\'b3\']/title").text)'] },
        {
          type: 'predict', vars: () => ({ x: SHELF_XML.replace(/\n\s*/g, '') }), text: 'What will it say?', code: ['import xml.etree.ElementTree as ET', "lib = ET.fromstring('$x')", 'print(sum(int(p.text) for p in lib.iter("pages")))'],
          explain: 'iter visits every pages element in the whole tree.',
        },
        {
          type: 'predict', vars: R => ({ x: SHELF_XML.replace(/\n\s*/g, ''), r: R.pick(['north', 'south']) }), text: 'Filtering by attribute. What will it say?', code: ['import xml.etree.ElementTree as ET', "lib = ET.fromstring('$x')", 'shelf = lib.find("shelf[@room=\'$r\']")', 'print([t.text for t in shelf.iter("title")])'],
          explain: '[@room="$r"] picks the shelf with that room.',
        },
        {
          type: 'predict', vars: () => ({ x: SHELF_XML.replace(/\n\s*/g, '') }), text: 'A default for missing tags. What will it say?', code: ['import xml.etree.ElementTree as ET', "lib = ET.fromstring('$x')", 'print(lib.findtext(".//author", "unknown"), lib.findtext(".//title"))'],
          explain: 'findtext gives the text of the first match, or the default when nothing matches.',
        },
        {
          type: 'fill', vars: () => ({ x: SHELF_XML.replace(/\n\s*/g, '') }), text: 'Count the books at any depth.',
          lines: ['import xml.etree.ElementTree as ET', "lib = ET.fromstring('$x')", 'print(len(lib.findall("[]")))'], chips: ['.//book', 'book', 'shelf/book/book'], answer: [['.//book']],
          hints: ['Search at any depth.', '".//book"'],
        },
        {
          type: 'write', vars: () => ({ x: SHELF_XML.replace(/\n\s*/g, '') }), text: 'Print the title of every book with more than 100 pages, using iter("book").',
          starter: ['import xml.etree.ElementTree as ET', "lib = ET.fromstring('$x')"], keys: ['for', 'b', 'in', 'lib.iter', '(', ')', '"book"', ':', 'if', 'int', 'b.find', '"pages"', '.text', '>', '100', 'print', '"title"'],
          require: l => (has(l, /iter\s*\(\s*"book"/) ? null : 'Use lib.iter("book").'),
          hints: ['for b in lib.iter("book"):', '    if int(b.find("pages").text) > 100: print(b.find("title").text)'],
          solution: ['for b in lib.iter("book"):', '    if int(b.find("pages").text) > 100:', '        print(b.find("title").text)'],
        },
      ],
      learn: [{ title: 'Deep searches', code: 'root.findall(".//book")\nroot.iter("book")\nroot.find("shelf[@room=\'north\']")\nroot.findtext(".//author", "unknown")', text: 'Search at any depth, filter by attributes, and fall back to defaults.' }],
    },
    {
      id: '34-4', title: 'Tag mites', bg: 'library', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'tagmite', hp: d0 + 2 + 7 + 5, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Tag mites gnaw at the scrolls! $HP HP. Every x attribute in the user list is a strike.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', vars: () => ({ x: USERS_XML }), text: 'It has $HP HP left. Cast fireball with every user\'s x attribute.',
          lines: ['import xml.etree.ElementTree as ET', "stuff = ET.fromstring('$x')", 'for u in stuff.findall("users/user"):', '    cast(fireball, int(u.[]("x")))'], chips: ['get', 'find', 'text'], answer: [['get']],
          goal: { foeDown: true },
          hints: ['Attributes are read with get.', 'u.get("x")'],
        },
        { type: 'talk', who: 'narrator', text: 'The mite queen hides deep in the library!' },
        {
          type: 'write', vars: R => ({ x: SHELF_XML.replace(/\n\s*/g, ''), hp: 2 * 3 }),
          spawn: v => ({ kind: 'tagmite', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Count all the book elements at any depth and cast icebolt with the count, twice.',
          starter: ['import xml.etree.ElementTree as ET', "lib = ET.fromstring('$x')"], keys: ['n', '=', 'len', '(', ')', 'lib.findall', '".//book"', 'cast', 'icebolt', ','],
          goal: { foeDown: true },
          require: l => (has(l, /\.\/\/book/) ? null : 'Search with ".//book".'),
          hints: ['n = len(lib.findall(".//book"))', 'cast(icebolt, n) twice'],
          solution: ['n = len(lib.findall(".//book"))', 'cast(icebolt, n)', 'cast(icebolt, n)'],
        },
      ],
      learn: [{ title: 'XML in battle', code: 'int(u.get("x"))', text: 'Attributes are text: convert them before using them as numbers.' }],
    },
    {
      id: '34-5', title: 'Scrolls on the shelf', bg: 'archive', npc: 'rhiza', mentor: 'rhiza', tags: ['xmlparse'],
      steps: [
        { type: 'talk', who: 'rhiza', text: 'XML usually lives in FILES. ET.parse("file.xml") reads a whole file and gives you a tree; tree.getroot() is the outermost element. From there it is find, findall and iter as before.' },
        { type: 'demo', files: { 'library.xml': SHELF_XML }, text: 'Run it.', code: ['import xml.etree.ElementTree as ET', 'tree = ET.parse("library.xml")', 'root = tree.getroot()', 'print(root.tag, len(root))', 'for shelf in root:', '    print(shelf.get("room"), len(shelf))'] },
        {
          type: 'predict', files: { 'library.xml': SHELF_XML }, text: 'What will it say?', code: ['import xml.etree.ElementTree as ET', 'root = ET.parse("library.xml").getroot()', 'pages = [int(b.find("pages").text) for b in root.iter("book")]', 'print(pages, sum(pages) / len(pages))'],
          explain: 'Collect each book\'s pages, then average them.',
        },
        {
          type: 'predict', files: { 'library.xml': SHELF_XML }, text: 'A dictionary from XML. What will it say?', code: ['import xml.etree.ElementTree as ET', 'root = ET.parse("library.xml").getroot()', 'index = {b.get("id"): b.findtext("title") for b in root.iter("book")}', 'print(index)'],
          explain: 'A dict comprehension pairs each id with its title.',
        },
        {
          type: 'fill', files: { 'library.xml': SHELF_XML }, text: 'Get the outermost element from the parsed file.',
          lines: ['import xml.etree.ElementTree as ET', 'tree = ET.parse("library.xml")', 'root = tree.[]()', 'print(root.tag)'], chips: ['getroot', 'find', 'iter'], answer: [['getroot']],
          hints: ['The root of the tree.', 'tree.getroot()'],
        },
        {
          type: 'write', files: { 'library.xml': SHELF_XML }, text: 'Parse library.xml and print each shelf\'s room followed by the total pages on that shelf.',
          starter: ['import xml.etree.ElementTree as ET'], keys: ['root', '=', 'ET.parse', '(', ')', '"library.xml"', '.getroot()', 'for', 'shelf', 'in', ':', 'total', 'sum', 'int', 'p.text', 'p', 'shelf.iter', '"pages"', 'print', 'shelf.get', '"room"', ','],
          require: l => (has(l, /ET\.parse/) ? null : 'Read the file with ET.parse.'),
          hints: ['root = ET.parse("library.xml").getroot() / for shelf in root:', '    total = sum(int(p.text) for p in shelf.iter("pages")); print(shelf.get("room"), total)'],
          solution: ['root = ET.parse("library.xml").getroot()', 'for shelf in root:', '    total = sum(int(p.text) for p in shelf.iter("pages"))', '    print(shelf.get("room"), total)'],
        },
      ],
      learn: [{ title: 'XML files', code: 'root = ET.parse("file.xml").getroot()', text: 'Parse the file, then work from the root.' }],
    },
    {
      id: '34-6', title: 'Gaps in the record', bg: 'library', npc: 'rhiza', mentor: 'rhiza', tags: ['xmlmissing'],
      steps: [
        { type: 'talk', who: 'rhiza', text: 'Real XML has gaps. If a tag is missing, find() returns None, and None.text crashes with AttributeError. If a tag is empty, its .text is None. And .text keeps all the spaces and newlines of the file, so strip() it.' },
        {
          type: 'predict', measure: 'errtype', vars: () => ({ x: PERSON_XML }), text: 'Which error?', code: ['import xml.etree.ElementTree as ET', "p = ET.fromstring('$x')", 'print(p.find("address").text)'],
          explain: 'There is no address tag, so find gives None, and None has no .text: AttributeError.',
        },
        {
          type: 'predict', text: 'Spaces in the text. What will it say?', code: ['import xml.etree.ElementTree as ET', 'el = ET.fromstring("<n>\\n   Ada\\n</n>")', 'print(repr(el.text), repr(el.text.strip()))'],
          explain: '.text keeps the whitespace from the file. strip() tidies it.',
        },
        {
          type: 'predict', vars: () => ({ x: PERSON_XML }), text: 'Guarding against gaps. What will it say?', code: ['import xml.etree.ElementTree as ET', "p = ET.fromstring('$x')", 'for tag in ["name", "address", "email"]:', '    el = p.find(tag)', '    if el is None:', '        print(tag, "missing")', '    else:', '        print(tag, el.text or "(empty)")'],
          explain: 'Check for None before using .text, and use or to replace an empty None text.',
        },
        {
          type: 'fill', vars: () => ({ x: PERSON_XML }), text: 'Read the address safely, with a default.',
          lines: ['import xml.etree.ElementTree as ET', "p = ET.fromstring('$x')", 'print(p.[]("address", "no address"))'], chips: ['findtext', 'find', 'get'], answer: [['findtext']],
          hints: ['One call that returns text or a default.', 'p.findtext("address", "no address")'],
        },
        {
          type: 'fix', vars: () => ({ x: PERSON_XML }), text: 'This crashes on the missing fax tag. Run it, then tap the broken line.',
          code: ['import xml.etree.ElementTree as ET', "p = ET.fromstring('$x')", 'fax = p.find("fax").text', 'print(fax)'], bad: 2,
          options: ['fax = p.findtext("fax", "none")', 'fax = p.find("fax")', 'fax = p.get("fax").text'], answer: 0,
          explain: 'findtext with a default never crashes on a missing tag.',
        },
      ],
      learn: [{ title: 'Missing and empty', code: 'el = root.find("tag")\nif el is None: ...\nroot.findtext("tag", "default")\nel.text.strip()', text: 'find can return None; .text can be None or full of whitespace.' }],
    },
    {
      id: '34-7', title: 'Writing new roots', bg: 'scriptorium', npc: 'rhiza', mentor: 'rhiza', tags: ['xmlbuild'],
      steps: [
        { type: 'talk', who: 'rhiza', text: 'You can BUILD XML too. ET.Element("shop") makes an element, ET.SubElement(parent, "item", {"id": "1"}) adds a child with attributes, and you set .text. ET.tostring(root, encoding="unicode") turns it all into text.' },
        { type: 'demo', text: 'Run it.', code: ['import xml.etree.ElementTree as ET', 'shop = ET.Element("shop")', 'item = ET.SubElement(shop, "item", {"id": "1"})', 'item.text = "Rope & Hook"', 'ET.SubElement(shop, "item", {"id": "2"}).text = "Lamp"', 'print(ET.tostring(shop, encoding="unicode"))'] },
        {
          type: 'predict', text: 'What will it say?', code: ['import xml.etree.ElementTree as ET', 'root = ET.Element("party")', 'for name in ["Ada", "Wren"]:', '    ET.SubElement(root, "hero").text = name', 'print(len(root), [h.text for h in root])'],
          explain: 'Each SubElement call adds one child.',
        },
        {
          type: 'predict', text: 'Special characters. What will it say?', code: ['import xml.etree.ElementTree as ET', 'n = ET.Element("note")', 'n.text = "5 < 7 & 8 > 2"', 'print(ET.tostring(n, encoding="unicode"))'],
          explain: '<, > and & are escaped so the XML stays valid.',
        },
        {
          type: 'fill', text: 'Add an attribute to the element.',
          lines: ['import xml.etree.ElementTree as ET', 'gem = ET.Element("gem")', 'gem.[]("color", "red")', 'print(ET.tostring(gem, encoding="unicode"))'], chips: ['set', 'get', 'find'], answer: [['set']],
          hints: ['The opposite of get.', 'gem.set("color", "red")'],
        },
        {
          type: 'write', text: 'Build <inventory> with two <item> children whose text is "rope" and "lamp", then print the XML text.',
          starter: ['import xml.etree.ElementTree as ET'], keys: ['inv', '=', 'ET.Element', '(', ')', '"inventory"', 'ET.SubElement', '"item"', '.text', '"rope"', '"lamp"', ',', 'print', 'ET.tostring', 'encoding="unicode"'],
          require: l => (has(l, /SubElement/) ? null : 'Add children with ET.SubElement.'),
          hints: ['inv = ET.Element("inventory") / ET.SubElement(inv, "item").text = "rope"', 'Then the lamp, and print(ET.tostring(inv, encoding="unicode"))'],
          solution: ['inv = ET.Element("inventory")', 'ET.SubElement(inv, "item").text = "rope"', 'ET.SubElement(inv, "item").text = "lamp"', 'print(ET.tostring(inv, encoding="unicode"))'],
        },
      ],
      learn: [{ title: 'Building XML', code: 'root = ET.Element("shop")\nET.SubElement(root, "item", {"id": "1"}).text = "Rope"\nET.tostring(root, encoding="unicode")', text: 'Make elements, add children and attributes, then turn it into text.' }],
    },
    {
      id: '34-8', title: 'Angle imps', bg: 'archive', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'angleimp', hp: d0 + 120 / 10 + 80 / 10 + 200 / 10, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Angle imps leap out of the brackets! $HP HP. Every ten pages in the library is a strike.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', files: { 'library.xml': SHELF_XML }, text: 'It has $HP HP left. Cast fireball with pages // 10 for every book.',
          lines: ['import xml.etree.ElementTree as ET', 'root = ET.parse("library.xml").getroot()', 'for b in root.iter("book"):', '    cast(fireball, int(b.[]("pages")) // 10)'], chips: ['findtext', 'get', 'tag'], answer: [['findtext']],
          goal: { foeDown: true },
          hints: ['The text of the pages child.', 'b.findtext("pages")'],
        },
        { type: 'talk', who: 'narrator', text: 'The imp chief builds its own XML!' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'angleimp', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Build an element <spell power="$p" />, read the attribute back with get, and cast icebolt with it twice.',
          starter: ['import xml.etree.ElementTree as ET'], keys: ['s', '=', 'ET.Element', '(', ')', '"spell"', '{"power": "$p"}', ',', 'n', 'int', '.get', '"power"', 'cast', 'icebolt'],
          goal: { foeDown: true },
          require: l => (has(l, /ET\.Element/) ? null : 'Build it with ET.Element.'),
          hints: ['s = ET.Element("spell", {"power": "$p"})', 'n = int(s.get("power")), then cast(icebolt, n) twice'],
          solution: ['s = ET.Element("spell", {"power": "$p"})', 'n = int(s.get("power"))', 'cast(icebolt, n)', 'cast(icebolt, n)'],
        },
      ],
      learn: [{ title: 'Pages as power', code: 'int(b.findtext("pages"))', text: 'XML text is text: convert it to numbers.' }],
    },
    {
      id: '34-9', title: 'The Markup Hydra', bg: 'library', foe: { kind: 'markuphydra', hp: 190, weak: 'spark', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'markuphydra', text: '<HEAD><HEAD><HEAD>... CLOSE... US... IF... YOU... CAN...' },
        { type: 'talk', who: 'narrator', text: 'The Markup Hydra has 190 HP. Spark fries its tags: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', vars: () => ({ x: USERS_XML }), text: 'How much damage? Spark is doubled.', code: ['import xml.etree.ElementTree as ET', "stuff = ET.fromstring('$x')", 'cast(spark, len(stuff.findall(".//user")) * 2)'],
          explain: 'Three users, times 2, doubled.',
        },
        {
          type: 'fix', vars: () => ({ x: USERS_XML }), text: 'This should print every user name. It prints nothing. Run it, then tap the broken line.',
          code: ['import xml.etree.ElementTree as ET', "stuff = ET.fromstring('$x')", 'for u in stuff.findall("user"):', '    print(u.find("name").text)', 'cast(spark, 6)'], bad: 2,
          options: ['for u in stuff.findall("users/user"):', 'for u in stuff.find("user"):', 'for u in stuff.findall("name"):'], answer: 0,
          explain: 'user is not a direct child of stuff: the path must go through users.',
        },
        { type: 'talk', who: 'markuphydra', text: 'WHICH... HEAD... IS... TALLEST...' },
        {
          type: 'fill', files: { 'library.xml': SHELF_XML }, text: 'Strike with spark, the pages of the longest book // 10.',
          lines: ['import xml.etree.ElementTree as ET', 'root = ET.parse("library.xml").getroot()', 'most = [](int(p.text) for p in root.iter("pages"))', 'cast(spark, most // 10)'], chips: ['max', 'min', 'len'], answer: [['max']],
          hints: ['The longest book has the most pages.', 'max(...)'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and spark is doubled. Build <blow><power>N</power></blow> where N is $HP // 2 + 1, turn it into text with ET.tostring, parse it back with ET.fromstring, and cast spark with int(findtext("power")).',
          starter: ['import xml.etree.ElementTree as ET'], keys: ['b', '=', 'ET.Element', '(', ')', '"blow"', 'ET.SubElement', '"power"', '.text', 'str', '$HP', '//', '2', '+', '1', 'text', 'ET.tostring', 'encoding="unicode"', 'back', 'ET.fromstring', 'cast', 'spark', 'int', '.findtext', ','],
          goal: { foeDown: true },
          require: l => (has(l, /tostring/) && has(l, /fromstring/) ? null : 'Use ET.tostring and then ET.fromstring.'),
          hints: ['b = ET.Element("blow") / ET.SubElement(b, "power").text = str($HP // 2 + 1)', 'back = ET.fromstring(ET.tostring(b, encoding="unicode")), then cast(spark, int(back.findtext("power")))'],
          solution: ['b = ET.Element("blow")', 'ET.SubElement(b, "power").text = str($HP // 2 + 1)', 'back = ET.fromstring(ET.tostring(b, encoding="unicode"))', 'cast(spark, int(back.findtext("power")))'],
        },
        { type: 'talk', who: 'markuphydra', text: '</HEAD></HEAD></HEAD>...' },
      ],
      learn: [{ title: 'XML toolkit', code: 'fromstring  parse  find  findall  findtext  iter  .//  [@a=\'v\']  Element  SubElement  tostring', text: 'Everything from the Root Library.' }],
    },
  ],
};
WORLDS.push(WORLD34);

(() => {
  const { makeQ, pick } = Arena;
  const X = '<r><a k="1">x</a><a k="2">y</a><b><a k="3">z</a></b></r>';
  Object.assign(Arena.GEN, {
    xmlbasics: () => makeQ(['import xml.etree.ElementTree as ET', `r = ET.fromstring('${X}')`, 'print(r.find("a").text, r.find("a").get("k"))'], ['y 2', 'x k']),
    xmlfindall: () => makeQ(['import xml.etree.ElementTree as ET', `r = ET.fromstring('${X}')`, 'print(len(r.findall("a")))'], [3, 1]),
    xmldeep: () => makeQ(['import xml.etree.ElementTree as ET', `r = ET.fromstring('${X}')`, 'print(len(r.findall(".//a")))'], [2, 1]),
    xmlparse: () => makeQ(['import xml.etree.ElementTree as ET', `open("f.xml", "w").write('${X}')`, 'print(ET.parse("f.xml").getroot().tag)'], ['a', 'f.xml']),
    xmlmissing: () => makeQ(['import xml.etree.ElementTree as ET', `r = ET.fromstring('${X}')`, 'print(r.find("c"))'], ['c', 'Error']),
    xmlbuild: () => { const t = pick(['gem', 'map']); return makeQ(['import xml.etree.ElementTree as ET', `e = ET.Element("${t}")`, 'e.set("n", "1")', 'print(ET.tostring(e, encoding="unicode"))'], [`<${t} n="1"></${t}>`, `<${t}>`]); },
  });
})();
