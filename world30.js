/* World 30: The Copyist's Guild. Text processing in practice: format specs for neat
   columns, the old % format operator, cleaning messy data, parsing a mailbox file line by
   line (Python for Everybody's mbox exercises), harvesting with re.findall, and writing
   aligned reports. Sources: Py4E chapters 6-7, 9 and 11; Automate the Boring Stuff 6-7. */
Object.assign(EXTRA.npcs, {
  scrivo: { name: 'Master Copyist Inkwell', colors: ['#2f4f8f', '#e6e1d6', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  blotslime: { base: 'inkling', name: 'Blot slime', pal: { G: '#1f2f5a', L: '#5f7fd6' } },
  typobat: { base: 'paperbat', name: 'Typo bat', pal: { M: '#ff5f6d', P: '#f3e9c6' } },
  livingledger: { base: 'grimoire', name: 'The Living Ledger', pal: { P: '#c8a060', C: '#2f4f8f' } },
});
const MBOX = [
  'From stephen.marquard@uct.ac.za Sat Jan  5 09:14:16 2008',
  'Subject: [sakai] svn commit: r39772',
  'X-DSPAM-Confidence: 0.8475',
  'From louis@media.berkeley.edu Fri Jan  4 18:10:48 2008',
  'Subject: [sakai] svn commit: r39771',
  'X-DSPAM-Confidence: 0.6178',
  'From zqian@umich.edu Fri Jan  4 16:10:39 2008',
  'X-DSPAM-Confidence: 0.6961',
  'From stephen.marquard@uct.ac.za Fri Jan  4 15:46:24 2008',
  'X-DSPAM-Confidence: 0.7565',
].join('\n') + '\n';

const WORLD30 = {
  id: 30, name: "The Copyist's Guild", topic: 'text processing in practice',
  nodes: [[50, 92], [28, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [40, 21], [52, 8]],
  levels: [
    {
      id: '30-1', title: 'Neat columns', bg: 'scriptorium', npc: 'scrivo', mentor: 'scrivo', tags: ['fmtspec'],
      steps: [
        { type: 'talk', who: 'scrivo', text: "Welcome to the Guild, {NAME}. I'm Inkwell. A copyist's work must be NEAT. Inside an f-string, a colon starts a format spec: {name:<10} pads to 10 wide on the left, {gold:>6} lines up on the right, {price:.2f} keeps 2 decimals." },
        { type: 'demo', text: 'Run it and look at the columns.', code: ['for name, gold in [("Ada", 7), ("Quillon", 1250), ("Wren", 64)]:', '    print(f"{name:<8}|{gold:>6}|")', 'print(f"{3.14159:.2f} {0.256:.0%} {1234567:,}")'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(['ink', 'quill', 'seal']), n: R.int(6, 9) }),
          text: 'What will it say? (The bars show where the padding ends.)', code: ['print(f"|{\'$w\':<$n}|{\'$w\':>$n}|")'],
          explain: '< pads on the right so the text sits left; > pads on the left.',
        },
        {
          type: 'predict', vars: R => ({ x: R.pick(['2.5', '19.999', '0.125', '7']) }),
          text: 'What will it say?', code: ['print(f"{$x:.2f}")'],
          explain: '.2f always shows exactly two digits after the point, rounding if needed.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([1234, 98765, 1000000]) }),
          text: 'What will it say?', code: ['print(f"{$n:,} {$n:08d}")'],
          explain: ', adds thousands separators; 08d pads with zeros to 8 digits.',
        },
        {
          type: 'fill', vars: R => ({ p: R.pick(['3.5', '12.25', '0.5']) }),
          text: 'Show the price with exactly 2 decimals.',
          lines: ['price = $p', 'print(f"Price: {price:[]}")'], chips: ['.2f', '2', '.2%'], answer: [['.2f']],
          hints: ['f means fixed-point decimals.', '{price:.2f}'],
        },
        {
          type: 'write', vars: R => ({ items: R.sample(['rope', 'lamp', 'axe', 'map'], 3), prices: [R.int(2, 99), R.int(2, 99), R.int(2, 99)] }),
          text: 'Print each item left-aligned in 6 characters, then its price right-aligned in 5, like: rope  |   12',
          starter: ['items = $(JSON.stringify(items))', 'prices = $(JSON.stringify(prices))'], keys: ['for', 'item', 'price', 'in', 'zip', '(', ')', 'items', 'prices', ',', ':', 'print', 'f"{item:<6}|{price:>5}"'],
          require: l => (has(l, /:<6/) && has(l, /:>5/) ? null : 'Use {item:<6} and {price:>5}.'),
          hints: ['for item, price in zip(items, prices):', '    print(f"{item:<6}|{price:>5}")'],
          solution: ['for item, price in zip(items, prices):', '    print(f"{item:<6}|{price:>5}")'],
        },
      ],
      learn: [{ title: 'Format specs', code: '{x:<10}  {x:>10}  {x:^10}\n{x:.2f}  {x:,}  {x:08d}  {x:.0%}', text: 'Width and alignment, decimals, separators, zero padding and percentages.' }],
    },
    {
      id: '30-2', title: 'The old format operator', bg: 'scriptorium', npc: 'scrivo', mentor: 'scrivo', tags: ['percentfmt'],
      steps: [
        { type: 'talk', who: 'scrivo', text: 'Before f-strings, scribes used the % operator, and you will still see it in older code and in logging. "%s has %d coins" % ("Ada", 12): %s is any value as text, %d a whole number, %f a decimal.' },
        { type: 'demo', text: 'Run it.', code: ['name, coins, rate = "Ada", 12, 0.0753', 'print("%s has %d coins" % (name, coins))', 'print("rate: %.2f%%" % (rate * 100))', 'print("%-6s|%5d|" % ("ink", 42))'] },
        {
          type: 'predict', vars: R => ({ n: R.pick(['Wren', 'Tam']), a: R.int(2, 50) }),
          text: 'What will it say?', code: ['print("%s found %d gems" % ("$n", $a))'],
          explain: 'Each % code is replaced, in order, by the values in the tuple.',
        },
        {
          type: 'predict', vars: R => ({ x: R.pick(['3.14159', '2.5', '10.0']) }),
          text: 'What will it say?', code: ['print("%.1f / %5.2f" % ($x, $x))'],
          explain: '%.1f keeps one decimal. %5.2f keeps two decimals in a space 5 wide.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Too few values. Which error?', code: ['print("%s and %s" % ("one",))'],
          explain: 'Two %s codes but only one value: TypeError.',
        },
        {
          type: 'fill', vars: R => ({ c: R.int(2, 30) }),
          text: 'Fill in the code for a whole number.',
          lines: ['count = $c', 'print("We copied %[] scrolls" % count)'], chips: ['d', 's', 'f'], answer: [['d']],
          require: s => (s[0] === 'd' ? null : '%s works too, but %d says "a whole number" clearly.'),
          hints: ['d for digits.', '%d'],
        },
        {
          type: 'write', vars: R => ({ n: R.pick(['Ada', 'Wren']), s: R.pick(['91.5', '78.25', '66.0']) }),
          text: 'Using the % operator, print: <name> scored <score with 1 decimal>',
          starter: ['name = "$n"', 'score = $s'], keys: ['print', '(', ')', '"%s scored %.1f"', '%', 'name', 'score', ','],
          require: l => (has(l, /%\s*\(/) ? null : 'Use "..." % (name, score).'),
          hints: ['%s for the name, %.1f for the score.', 'print("%s scored %.1f" % (name, score))'],
          solution: ['print("%s scored %.1f" % (name, score))'],
        },
      ],
      learn: [{ title: 'The % operator', code: '"%s has %d coins (%.2f%%)" % (name, n, pct)', text: 'Old-style formatting: %s text, %d whole number, %f decimal, %% a percent sign.' }],
    },
    {
      id: '30-3', title: 'Scrubbing the ink', bg: 'reading', npc: 'scrivo', mentor: 'scrivo', tags: ['cleaning'],
      steps: [
        { type: 'talk', who: 'scrivo', text: 'Real data arrives messy: extra spaces, odd capitals, blank lines, stray commas. Clean it step by step: strip() the ends, lower() for comparing, " ".join(s.split()) squashes runs of spaces, and skip empty lines.' },
        { type: 'demo', text: 'Run it.', code: ['raw = ["  Ada ", "WREN", "", " mira  lee "]', 'clean = []', 'for name in raw:', '    name = " ".join(name.split()).title()', '    if name:', '        clean.append(name)', 'print(clean)'] },
        {
          type: 'predict', vars: R => ({ s: R.pick(['  too   many    spaces ', ' a  b c ', 'one     two']) }),
          text: 'What will it say?', code: ['print("[" + " ".join("$s".split()) + "]")'],
          explain: 'split() with no argument drops all the extra whitespace; join puts single spaces back.',
        },
        {
          type: 'predict', text: 'Tidy prices. What will it say?', code: ['raw = " 12, 7 ,,30 , 5 "', 'nums = [int(x) for x in raw.split(",") if x.strip()]', 'print(nums, sum(nums))'],
          explain: 'Split at commas, skip the empty pieces, and int() ignores the spaces around each number.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['Gold', 'GOLD', ' gold ']) }),
          text: 'Comparing fairly. What will it say?', code: ['wanted = "$w"', 'print(wanted.strip().lower() == "gold")'],
          explain: 'Strip and lower both sides before comparing text that people typed.',
        },
        {
          type: 'fill', text: 'Skip the blank lines.',
          lines: ['lines = ["rope", "", "  ", "lamp"]', 'for line in lines:', '    if not line.[]():', '        continue', '    print(line)'], chips: ['strip', 'upper', 'split'], answer: [['strip']],
          hints: ['A line of only spaces is blank once stripped.', 'if not line.strip():'],
        },
        {
          type: 'write', text: 'Clean the tags: strip each, lower-case it, drop empty ones and duplicates (keep first appearance), then print the list.',
          starter: ['tags = [" Fire", "ice ", "", "FIRE", "  storm", "Ice"]'], keys: ['clean', '=', '[]', 'for', 't', 'in', 'tags', ':', '.strip()', '.lower()', 'if', 'and', 'not', '.append', 'print'],
          require: l => (has(l, /\.strip\(\)/) && has(l, /\.lower\(\)/) ? null : 'Use strip() and lower().'),
          hints: ['clean = [] / for t in tags: t = t.strip().lower()', 'if t and t not in clean: clean.append(t), then print(clean)'],
          solution: ['clean = []', 'for t in tags:', '    t = t.strip().lower()', '    if t and t not in clean:', '        clean.append(t)', 'print(clean)'],
        },
      ],
      learn: [{ title: 'Cleaning text', code: 's.strip()  s.lower()  " ".join(s.split())\nif not line.strip(): continue', text: 'Tidy every value the same way before you use or compare it.' }],
    },
    {
      id: '30-4', title: 'Blot slimes', bg: 'scriptorium', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'blotslime', hp: d0 + 12 + 7 + 30 + 5, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Blot slimes smear the ledgers! $HP HP. Only clean numbers can hurt them.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Clean the smeared ledger into numbers and cast fireball with their sum.',
          lines: ['raw = " 12, 7 ,,30 , 5 "', 'nums = [int(x) for x in raw.split(",") if x.[]()]', 'cast(fireball, sum(nums))'], chips: ['strip', 'upper', 'title'], answer: [['strip']],
          goal: { foeDown: true },
          hints: ['Skip pieces that are only spaces.', 'if x.strip()'],
        },
        { type: 'talk', who: 'narrator', text: 'The blot king hides behind a % code!' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'blotslime', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Build the text "power=$p" with the % operator, take the number after "=", and cast icebolt with it twice.',
          starter: [], keys: ['msg', '=', '"power=%d"', '%', '$p', 'n', 'int', '(', ')', '.split', '"="', '[', ']', '1', 'cast', 'icebolt', ','],
          goal: { foeDown: true },
          require: l => (has(l, /"power=%d"\s*%/) ? null : 'Build it with "power=%d" % ...'),
          hints: ['msg = "power=%d" % $p', 'n = int(msg.split("=")[1]), then cast(icebolt, n) twice'],
          solution: ['msg = "power=%d" % $p', 'n = int(msg.split("=")[1])', 'cast(icebolt, n)', 'cast(icebolt, n)'],
        },
      ],
      learn: [{ title: 'Clean, then count', code: '[int(x) for x in raw.split(",") if x.strip()]', text: 'Cleaning comes before calculating.' }],
    },
    {
      id: '30-5', title: 'The guild mailbox', bg: 'archive', npc: 'scrivo', mentor: 'scrivo', tags: ['mbox'],
      steps: [
        { type: 'talk', who: 'scrivo', text: 'The guild keeps every letter in one big file, mbox.txt. Each letter starts with a line "From address date" and has header lines like "X-DSPAM-Confidence: 0.8475". Python for Everybody spends a whole course on files like this.' },
        { type: 'demo', files: { 'mbox.txt': MBOX }, text: 'Find every sender. Run it.', code: ['with open("mbox.txt") as f:', '    for line in f:', '        if line.startswith("From "):', '            print(line.split()[1])'] },
        {
          type: 'predict', files: { 'mbox.txt': MBOX }, text: 'Average the confidence. What will it say?', code: ['total, count = 0.0, 0', 'with open("mbox.txt") as f:', '    for line in f:', '        if line.startswith("X-DSPAM-Confidence:"):', '            total += float(line[line.find(":") + 1:])', '            count += 1', 'print(count, round(total / count, 4))'],
          explain: 'Find each confidence line, take the number after the colon, and average them.',
        },
        {
          type: 'predict', files: { 'mbox.txt': MBOX }, text: 'Who wrote the most? What will it say?', code: ['counts = {}', 'with open("mbox.txt") as f:', '    for line in f:', '        if line.startswith("From "):', '            who = line.split()[1]', '            counts[who] = counts.get(who, 0) + 1', 'best = max(counts, key=counts.get)', 'print(best, counts[best])'],
          explain: 'A dict counts letters per sender; max with key=counts.get finds the busiest.',
        },
        {
          type: 'predict', files: { 'mbox.txt': MBOX }, text: 'Letters by hour. What will it say?', code: ['hours = {}', 'with open("mbox.txt") as f:', '    for line in f:', '        if line.startswith("From "):', '            hour = line.split()[5][:2]', '            hours[hour] = hours.get(hour, 0) + 1', 'for h in sorted(hours):', '    print(h, hours[h])'],
          explain: 'Word 5 is the time; its first two characters are the hour.',
        },
        {
          type: 'fill', files: { 'mbox.txt': MBOX }, text: 'Count the letters, but not the "From:" header lines (only "From " with a space).',
          lines: ['n = 0', 'with open("mbox.txt") as f:', '    for line in f:', '        if line.[]("From "):', '            n += 1', 'print(n)'], chips: ['startswith', 'endswith', 'find'], answer: [['startswith']],
          hints: ['The line must BEGIN with "From ".', 'line.startswith("From ")'],
        },
        {
          type: 'write', files: { 'mbox.txt': MBOX }, text: 'Print each different email DOMAIN (the part after @ in the From lines) once, sorted.',
          starter: [], keys: ['domains', '=', 'set()', 'with', 'open', '(', ')', '"mbox.txt"', 'as', 'f', ':', 'for', 'line', 'in', 'if', '.startswith', '"From "', '.add', '.split()', '[', ']', '1', '.split', '"@"', 'print', 'sorted'],
          require: l => (has(l, /startswith\s*\(\s*"From "/) ? null : 'Look at the lines that start with "From ".'),
          hints: ['domains = set() / with open("mbox.txt") as f: / for line in f: / if line.startswith("From "):', 'domains.add(line.split()[1].split("@")[1]), then print(sorted(domains))'],
          solution: ['domains = set()', 'with open("mbox.txt") as f:', '    for line in f:', '        if line.startswith("From "):', '            domains.add(line.split()[1].split("@")[1])', 'print(sorted(domains))'],
        },
      ],
      learn: [{ title: 'Parsing a mailbox', code: 'for line in f:\n    if line.startswith("From "):\n        who = line.split()[1]', text: 'Pick out the lines you care about, then split them into the pieces you need.' }],
    },
    {
      id: '30-6', title: 'Pattern harvests', bg: 'scriptorium', npc: 'scrivo', mentor: 'scrivo', tags: ['harvest'],
      steps: [
        { type: 'talk', who: 'scrivo', text: 'You learned regular expressions in the Pattern Marsh. Copyists use re.findall to HARVEST every match in a text at once: every number, every email, every date.' },
        { type: 'demo', text: 'Run it.', code: ['import re', 'text = "Ordered 12 quills, 3 inks and 40 sheets for 2 guilds."', 'nums = [int(n) for n in re.findall(r"\\d+", text)]', 'print(nums, sum(nums))'] },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 99), b: R.int(2, 99), c: R.int(2, 99) }),
          text: 'Sum the numbers in the text. What will it say?', code: ['import re', 'text = "Room $a has $b chairs and $c candles"', 'print(sum(int(n) for n in re.findall(r"[0-9]+", text)))'],
          explain: '$a + $b + $c.',
        },
        {
          type: 'predict', text: 'What will it say?', code: ['import re', 'text = "Write to ada@tower.org or wren@ink.net, not @nobody"', 'print(re.findall(r"\\S+@\\S+\\.\\w+", text))'],
          explain: 'Non-space characters, an @, more non-spaces, a dot and a word ending.',
        },
        {
          type: 'predict', files: { 'mbox.txt': MBOX }, text: 'Harvest from the mailbox. What will it say?', code: ['import re', 'text = open("mbox.txt").read()', 'scores = re.findall(r"^X-DSPAM-Confidence: ([0-9.]+)", text, re.M)', 'print(max(float(s) for s in scores))'],
          explain: 'The group captures just the number; re.M makes ^ match at the start of every line.',
        },
        {
          type: 'fill', text: 'Harvest every word that starts with a capital letter.',
          lines: ['import re', 'text = "Ada met Wren at the Tower before Dawn."', 'print(re.[](r"[A-Z]\\w*", text))'], chips: ['findall', 'search', 'match'], answer: [['findall']],
          hints: ['All the matches, as a list.', 're.findall'],
        },
        {
          type: 'write', text: 'Print the list of all the years (four digits starting with 1 or 2) found in the text.',
          starter: ['import re', 'text = "Founded 1832, rebuilt in 1907, room 404, reopened 2019."'], keys: ['print', '(', ')', 're.findall', 'r"[12]\\d{3}"', ',', 'text'],
          require: l => (has(l, /findall/) ? null : 'Use re.findall.'),
          hints: ['A year: 1 or 2 then three digits.', 'print(re.findall(r"[12]\\d{3}", text))'],
          solution: ['print(re.findall(r"[12]\\d{3}", text))'],
        },
      ],
      learn: [{ title: 'Harvesting', code: 're.findall(r"\\d+", text)\nre.findall(r"^Key: (.*)", text, re.M)', text: 'Collect every match at once. Groups pick out just the part you want.' }],
    },
    {
      id: '30-7', title: 'Writing the report', bg: 'reading', npc: 'scrivo', mentor: 'scrivo', tags: ['reports'],
      steps: [
        { type: 'talk', who: 'scrivo', text: 'The last step of every job is the REPORT: a title, neat columns, sorted rows and a total. Put it all together.' },
        { type: 'demo', text: 'Run it.', code: ['sales = {"quills": 120, "ink": 45, "parchment": 310}', 'print(f"{\'Item\':<10}{\'Sold\':>6}")', 'print("-" * 16)', 'for item, n in sorted(sales.items(), key=lambda kv: kv[1], reverse=True):', '    print(f"{item:<10}{n:>6}")', 'print(f"{\'Total\':<10}{sum(sales.values()):>6}")'] },
        {
          type: 'predict', text: 'What will it say?', code: ['rows = [("Ada", 3), ("Quillon", 12)]', 'width = max(len(name) for name, _ in rows)', 'for name, n in rows:', '    print(f"{name:>{width}}: {n}")'],
          explain: 'The width can itself be a variable: {name:>{width}} right-aligns to the longest name.',
        },
        {
          type: 'predict', vars: R => ({ t: R.pick(['Ledger', 'Report', 'Inventory']) }),
          text: 'A centred title. What will it say?', code: ['print(f"[{\'$t\':^12}]")', 'print("=" * 14)'],
          explain: '^ centres the text in the given width.',
        },
        {
          type: 'fill', text: 'Right-align the numbers in a column 5 wide.',
          lines: ['for item, n in [("ink", 7), ("quills", 120)]:', '    print(f"{item:<8}{n:[]5}")'], chips: ['>', '<', '^'], answer: [['>']],
          hints: ['Numbers line up on the right.', '{n:>5}'],
        },
        {
          type: 'write', text: 'Print a report of stock: each item left-aligned in 8 and its count right-aligned in 4, sorted by item name, then a line Total with the sum (same widths).',
          starter: ['stock = {"wax": 9, "ink": 40, "quill": 15}'], keys: ['for', 'item', 'n', 'in', 'sorted', '(', ')', 'stock', '.items()', ',', ':', 'print', 'f"{item:<8}{n:>4}"', 'f"{\'Total\':<8}{sum(stock.values()):>4}"'],
          require: l => (has(l, /:<8/) && has(l, /:>4/) ? null : 'Use widths <8 and >4.'),
          hints: ['for item, n in sorted(stock.items()):', '    print(f"{item:<8}{n:>4}"), then the Total line'],
          solution: ['for item, n in sorted(stock.items()):', '    print(f"{item:<8}{n:>4}")', 'print(f"{\'Total\':<8}{sum(stock.values()):>4}")'],
        },
      ],
      learn: [{ title: 'Reports', code: 'f"{name:<10}{n:>6}"\nf"{title:^20}"\nf"{x:>{width}}"', text: 'Titles, aligned columns, sorted rows and totals.' }],
    },
    {
      id: '30-8', title: 'Typo bats', bg: 'reading', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'typobat', hp: d0 + 4 * 5, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Typo bats! $HP HP. Every capitalised name in the guild register strikes them.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Harvest the capitalised names and cast fireball with 5 for each.',
          lines: ['import re', 'register = "Ada and Wren met Tam, then Mira joined."', 'for name in re.findall(r"[]\\w+", register):', '    cast(fireball, 5)'], chips: ['[A-Z]', '[a-z]', '\\d'], answer: [['[A-Z]']],
          goal: { foeDown: true },
          hints: ['A name starts with a capital.', 'r"[A-Z]\\w+"'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat queen reads only neat reports!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 12 }),
          spawn: v => ({ kind: 'typobat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Build the line f"{\'Total\':<6}|{42:>5}" and cast icebolt with its length, twice.',
          starter: [], keys: ['line', '=', 'f"{\'Total\':<6}|{42:>5}"', 'cast', 'icebolt', '(', ')', ',', 'len'],
          goal: { foeDown: true },
          require: l => (has(l, /:<6/) ? null : 'Build the line with the format specs.'),
          hints: ['6 + 1 + 5 characters.', 'cast(icebolt, len(line)) twice'],
          solution: ['line = f"{\'Total\':<6}|{42:>5}"', 'cast(icebolt, len(line))', 'cast(icebolt, len(line))'],
        },
      ],
      learn: [{ title: 'Text in battle', code: 're.findall  f"{x:>5}"', text: 'Harvest and format, anywhere.' }],
    },
    {
      id: '30-9', title: 'The Living Ledger', bg: 'archive', foe: { kind: 'livingledger', hp: 180, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'livingledger', text: 'EVERY... DEBT... WRITTEN... IN... MY... PAGES...' },
        { type: 'talk', who: 'narrator', text: 'The Living Ledger has 180 HP. Icebolt freezes its ink: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Icebolt is doubled.', code: ['import re', 'debts = "owes 3, owes 4, owes 5"', 'cast(icebolt, sum(int(n) for n in re.findall(r"\\d+", debts)))'],
          explain: '3 + 4 + 5 = 12, doubled.',
        },
        {
          type: 'fix', text: 'This should print the balance with exactly 2 decimals. Run it, then tap the broken line.',
          code: ['balance = 12.5', 'print(f"Balance: {balance:2f}")', 'cast(icebolt, 6)'], bad: 1,
          options: ['print(f"Balance: {balance:.2f}")', 'print(f"Balance: {balance:2}")', 'print(f"Balance: {balance}.2f")'], answer: 0,
          explain: 'The dot matters: .2f means 2 decimals, 2f means "at least 2 wide".',
        },
        { type: 'talk', who: 'livingledger', text: 'READ... MY... MAIL...' },
        {
          type: 'fill', files: { 'mbox.txt': MBOX }, text: 'Count the letters in the mailbox and strike with icebolt, 3 times the count.',
          lines: ['count = 0', 'for line in open("mbox.txt"):', '    if line.startswith("[]"):', '        count += 1', 'cast(icebolt, count * 3)'], chips: ['From ', 'Subject', 'X-'], answer: [['From ']],
          hints: ['Each letter starts with one of these lines.', '"From "'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Use the % operator to build "power: %d" with $HP // 2 + 1, harvest the number with re.findall, and cast icebolt with it.',
          starter: ['import re'], keys: ['msg', '=', '"power: %d"', '%', '(', ')', '$HP', '//', '2', '+', '1', 'n', 'int', 're.findall', 'r"\\d+"', ',', '[', ']', '0', 'cast', 'icebolt'],
          goal: { foeDown: true },
          require: l => (has(l, /%\s*\(/) && has(l, /findall/) ? null : 'Use the % operator and re.findall.'),
          hints: ['msg = "power: %d" % ($HP // 2 + 1)', 'n = int(re.findall(r"\\d+", msg)[0]), then cast(icebolt, n)'],
          solution: ['msg = "power: %d" % ($HP // 2 + 1)', 'n = int(re.findall(r"\\d+", msg)[0])', 'cast(icebolt, n)'],
        },
        { type: 'talk', who: 'livingledger', text: '...the... ledger... closes...' },
      ],
      learn: [{ title: 'Copyist toolkit', code: '{x:>8.2f}  "%s %d" % (...)  strip/split/join  startswith  findall', text: 'Everything from the Copyist\'s Guild.' }],
    },
  ],
};
WORLDS.push(WORLD30);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    fmtspec: () => { const x = pick(['2.5', '19.999', '0.125']); return makeQ([`print(f"{${x}:.2f}")`], [x, (+x).toFixed(1)]); },
    percentfmt: () => { const a = rnd(2, 40); return makeQ([`print("%d gems, %.1f kg" % (${a}, ${a} / 4))`], [`${a} gems, ${a / 4} kg`, `%d gems, %.1f kg`]); },
    cleaning: () => makeQ(['print(" ".join("  a   b  c ".split()))'], ['  a   b  c ', 'abc']),
    mbox: () => makeQ(['line = "From ray@umich.edu Sat Jan 5 09:14:16 2008"', 'print(line.split()[5][:2])'], ['Sa', '14']),
    harvest: () => { const a = rnd(2, 9), b = rnd(10, 30); return makeQ(['import re', `print(re.findall(r"\\d+", "a${a}b${b}c"))`], [`[${a}, ${b}]`, `['${a}${b}']`]); },
    reports: () => makeQ(['print(f"[{\'ink\':^7}]")'], ['[ink    ]', '[    ink]']),
  });
})();
