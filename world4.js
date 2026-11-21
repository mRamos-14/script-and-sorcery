/* World 4: The Scriptorium. Strings, part two: negative indexes, slices with steps,
   searching (in, find, count, comparing), split and join, parsing real lines of text,
   and why strings cannot be changed in place. Source: Py4E chapter 6 (plus 4 and 11 ideas). */
Object.assign(EXTRA.npcs, {
  ottilie: { name: 'Scribe Ottilie', colors: ['#5a3a8f', '#c8452f', '#fbd9b8'] },
  postmaster: { name: 'Postmaster Finch', colors: ['#2f6f8f', '#e6e1d6', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  inkwisp: { base: 'ghost', name: 'Ink wisp', pal: { O: '#0c0a12', F: '#3b3570', L: '#8a80d6' } },
  scrollbat: { base: 'paperbat', name: 'Scroll bat', pal: { P: '#d9c79a', M: '#2f4f8f' } },
  inkwyrm: { base: 'wyrm', name: 'The Ink Wyrm', pal: { C: '#211c45', L: '#5a50a8', M: '#0c0a12' } },
});
const SCRIBE_WORDS = ['quill', 'scroll', 'parchment', 'ink', 'candle', 'margin', 'letter', 'chapter'];

const WORLD4 = {
  id: 4, name: 'The Scriptorium', topic: 'indexing, slicing and parsing text',
  nodes: [[50, 92], [28, 82], [70, 72], [36, 62], [66, 52], [30, 42], [62, 32], [40, 20], [52, 8]],
  levels: [
    {
      id: '4-1', title: 'Counting from the end', bg: 'scriptorium', npc: 'ottilie', mentor: 'ottilie', tags: ['negindex'],
      steps: [
        { type: 'talk', who: 'ottilie', text: "Quiet, please, {NAME}. I'm Scribe Ottilie. In the library you learned word[0] is the first letter. Here we read from the END too." },
        { type: 'talk', who: 'ottilie', text: 'Negative indexes count backwards: word[-1] is the last letter, word[-2] the one before it. No need to know the length.' },
        { type: 'demo', vars: R => ({ w: R.pick(SCRIBE_WORDS) }), text: 'Run it.', code: ['word = "$w"', 'print(word[0], word[-1])'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(SCRIBE_WORDS.filter(x => x.length >= 5)), k: R.int(1, 3) }),
          text: 'What will it say?', code: ['word = "$w"', 'print(word[-$k])'],
          explain: 'Count $k back from the end of "$w".',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(SCRIBE_WORDS) }),
          text: 'The long way round. What will it say?', code: ['word = "$w"', 'print(word[len(word) - 1])'],
          explain: 'The last index is always len(word) - 1, which is the same letter as word[-1].',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ w: R.pick(SCRIBE_WORDS) }),
          text: 'One step too far. Which error?', code: ['word = "$w"', 'print(word[len(word)])'],
          explain: '"$w" has $(w.length) letters, numbered 0 to $(w.length - 1). Index $(w.length) is past the end: IndexError.',
        },
        {
          type: 'fill', vars: R => ({ w: R.pick(['quill', 'parchment', 'ink', 'margin', 'chapter']) }),
          text: 'Print the LAST letter of the word.',
          lines: ['word = "$w"', 'print(word[[]])'], chips: ['-1', '0', '1'], answer: [['-1']],
          hints: ['Count from the end.', 'word[-1]'],
        },
        {
          type: 'fix', vars: R => ({ w: R.pick(SCRIBE_WORDS) }),
          text: 'This should print the last letter, but it crashes. Run it, then tap the broken line.',
          code: ['word = "$w"', 'print(word[len(word)])'], bad: 1,
          options: ['print(word[len(word) - 1])', 'print(word[len(word) + 1])', 'print(word[len])'], answer: 0,
          explain: 'Indexes stop at len(word) - 1.',
        },
        {
          type: 'write', vars: R => ({ w: R.pick(SCRIBE_WORDS) }),
          text: 'Print the second-to-last letter of word.',
          starter: ['word = "$w"'], keys: ['print', '(', ')', 'word', '[', ']', '-2'],
          require: l => (has(l, /\[\s*-2\s*\]/) ? null : 'Use a negative index: word[-2].'),
          hints: ['-1 is the last, so the one before is...', 'print(word[-2])'],
          solution: ['print(word[-2])'],
        },
      ],
      learn: [{ title: 'Negative indexes', code: 'w = "quill"\nw[-1] → "l"\nw[-2] → "l"\nw[len(w)] → IndexError', text: 'Count backwards from the end with negative numbers.' }],
    },
    {
      id: '4-2', title: 'Stepping through scrolls', bg: 'reading', npc: 'ottilie', mentor: 'ottilie', tags: ['slicestep'],
      steps: [
        { type: 'talk', who: 'ottilie', text: 'You know slices like word[1:4]. A slice can take a third number, the STEP: word[::2] takes every second letter. Leave out start or stop to mean "from the start" or "to the end".' },
        { type: 'talk', who: 'ottilie', text: 'A step of -1 walks backwards, so word[::-1] is the word reversed. Every scribe knows that trick.' },
        { type: 'demo', vars: R => ({ w: R.pick(SCRIBE_WORDS) }), text: 'Run it.', code: ['word = "$w"', 'print(word[::2])', 'print(word[::-1])'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(SCRIBE_WORDS.filter(x => x.length >= 5)) }),
          text: 'Trim both ends. What will it say?', code: ['print("$w"[1:-1])'],
          explain: 'Start at index 1 and stop before the last letter.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(SCRIBE_WORDS.filter(x => x.length >= 5)), s: R.int(2, 3) }),
          text: 'What will it say?', code: ['print("$w"[::$s])'],
          explain: 'Take index 0, then every $s letters after it.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['level', 'scroll', 'racecar', 'quill', 'noon', 'ink']) }),
          text: 'A word that reads the same both ways is a palindrome. What will it say?', code: ['w = "$w"', 'print(w == w[::-1])'],
          explain: '"$w" backwards is "$(w.split("").reverse().join(""))".',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(SCRIBE_WORDS.filter(x => x.length >= 5)) }),
          text: 'Indexes past the end crash. Do slices? What will it say?', code: ['print("$w"[2:100])'],
          wrong: ['Error', '$(w.slice(2, -1))', ''],
          explain: 'Slices never crash on positions past the end: they simply stop at the end.',
        },
        {
          type: 'fill', vars: R => ({ w: R.pick(['quill', 'candle', 'margin', 'letter', 'chapter']) }),
          text: 'Print the word backwards.',
          lines: ['word = "$w"', 'print(word[[]])'], chips: ['::-1', '::1', '-1'], answer: [['::-1']],
          hints: ['A step of -1 walks backwards.', 'word[::-1]'],
        },
        {
          type: 'fix', vars: R => ({ w: R.pick(['parchment', 'chapter', 'candle', 'margin']) }),
          text: 'This should print the word without its first and last letters. Run it, then tap the broken line.',
          code: ['word = "$w"', 'print(word[1:-2])'], bad: 1,
          options: ['print(word[1:-1])', 'print(word[0:-1])', 'print(word[1:])'], answer: 0,
          explain: 'The stop is not included, so -1 stops just before the last letter.',
        },
        {
          type: 'write', vars: R => ({ w: R.pick(['parchment', 'chapter', 'candle', 'margin', 'scroll']) }),
          text: 'Print every second letter of spell, starting with the first.',
          starter: ['spell = "$w"'], keys: ['print', '(', ')', 'spell', '[', ']', ':', '2'],
          require: l => (has(l, /\[\s*:\s*:\s*2\s*\]/) ? null : 'Use a step: spell[::2].'),
          hints: ['Leave out start and stop, give only the step.', 'print(spell[::2])'],
          solution: ['print(spell[::2])'],
        },
      ],
      learn: [
        { title: 'Slices with steps', code: 'w[start:stop:step]\nw[::2]   every 2nd\nw[::-1]  reversed', text: 'Start is included, stop is not, step is the jump. Slices past the end never crash.' },
      ],
    },
    {
      id: '4-3', title: 'Is it in there?', bg: 'library', npc: 'ottilie', mentor: 'ottilie', tags: ['instr'],
      steps: [
        { type: 'talk', who: 'ottilie', text: '"in" asks a yes-or-no question: is this text inside that one? find() answers WHERE: the index of the first match, or -1 when it is missing.' },
        { type: 'demo', vars: R => ({ s: R.pick(['the dragon sleeps', 'ink and quill', 'scroll of fire']) }), text: 'Run it.', code: ['s = "$s"', 'print("in" in s)', 'print(s.find("in"))'] },
        {
          type: 'predict', vars: R => R.pick([{ s: 'candlelight', t: 'light' }, { s: 'candlelight', t: 'Light' }, { s: 'parchment', t: 'arch' }, { s: 'margin', t: 'gin' }, { s: 'margin', t: 'man' }]),
          text: 'What will it say?', code: ['print("$t" in "$s")'],
          explain: '"in" looks for the exact letters, and capitals count.',
        },
        {
          type: 'predict', vars: R => R.pick([{ s: 'parchment', c: 'ch' }, { s: 'scroll', c: 'r' }, { s: 'quill', c: 'z' }, { s: 'chapter', c: 'p' }]),
          text: 'What will it say?', code: ['print("$s".find("$c"))'],
          explain: 'find gives the index of the first match, or -1 if there is none.',
        },
        {
          type: 'predict', vars: R => R.pick([{ s: 'banana', c: 'a', st: 2 }, { s: 'parchment', c: 'h', st: 5 }, { s: 'letter', c: 't', st: 3 }]),
          text: 'find can start later. What will it say?', code: ['s = "$s"', 'print(s.find("$c", $st))'],
          explain: 'find("$c", $st) skips everything before index $st.',
        },
        { type: 'talk', who: 'ottilie', text: 'Strings also compare like a dictionary, letter by letter. But beware: every CAPITAL letter comes before every small one, so "Zebra" < "apple" is True!' },
        {
          type: 'predict', vars: R => R.pick([{ a: 'apple', b: 'banana' }, { a: 'Zebra', b: 'apple' }, { a: 'quill', b: 'Quill' }, { a: 'ink', b: 'inkwell' }]),
          text: 'What will it say?', code: ['print("$a" < "$b")'],
          explain: 'Letter by letter: the first difference decides. Capitals sort before small letters, and a shorter word that matches the start comes first.',
        },
        {
          type: 'fill', vars: R => R.pick([{ n: 'report.txt', e: '.txt' }, { n: 'spellbook.py', e: '.py' }, { n: 'map.png', e: '.png' }]),
          text: 'Check whether the file name ends with $e.',
          lines: ['name = "$n"', 'print(name.[]("$e"))'], chips: ['endswith', 'startswith', 'find'], answer: [['endswith']],
          hints: ['There is a method made for checking the end.', 'name.endswith("$e")'],
        },
        {
          type: 'write', vars: R => ({ a: R.pick(['wren', 'quill', 'ada']) + '@' + R.pick(['tower.org', 'ink.net', 'scroll.io']) }),
          text: 'Print the index of the @ in the address.',
          starter: ['addr = "$a"'], keys: ['print', '(', ')', 'addr', '.find', '"@"'],
          require: l => (has(l, /\.find\s*\(/) ? null : 'Use addr.find("@").'),
          hints: ['find gives the position.', 'print(addr.find("@"))'],
          solution: ['print(addr.find("@"))'],
        },
      ],
      learn: [
        { title: 'Searching text', code: '"ink" in s     → True / False\ns.find("ink")  → index or -1\ns.find("a", 3) → search from 3', text: 'in answers whether, find answers where.' },
        { title: 'Comparing strings', code: '"apple" < "banana" → True\n"Zebra" < "apple"  → True', text: 'Dictionary order, but capitals come before small letters.' },
      ],
    },
    {
      id: '4-4', title: 'Ink wisps', bg: 'stacks', mentor: 'narrator', tags: [],
      foe: R => { const w = R.pick(SCRIBE_WORDS), s = R.pick(['the ink is dry', 'quiet in the stacks', 'turn the page']); return { kind: 'inkwisp', hp: 2 * w.length + 3 * s.length, w, s }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Ink wisps drift out of the stacks! This one has $HP HP. In the Scriptorium, words are power: the length of a slice can be a spell\'s strength.' },
        { type: 'demo', vars: (R, c) => ({ w: c.foe.w }), text: 'A spark as strong as a word, doubled.', code: ['cast(spark, len("$w") * 2)'] },
        {
          type: 'fill', vars: (R, c) => ({ s: c.foe.s }),
          text: 'It has $HP HP left. Cast fireball with the length of the WHOLE scroll, times 3.',
          lines: ['scroll = "$s"', 'cast(fireball, len(scroll[[]]) * 3)'], chips: [':', '1:', '::2'], answer: [[':']],
          goal: { foeDown: true },
          hints: ['An empty slice with just a colon takes everything.', 'scroll[:]'],
        },
        { type: 'talk', who: 'narrator', text: 'A darker wisp! Its true name hides after the colon.' },
        {
          type: 'write', vars: R => { const name = R.pick(['umbravex', 'nocturnis', 'smudgeling', 'blotworth']); return { name, hp: 2 * name.length, s: 'name:' + name }; },
          spawn: v => ({ kind: 'inkwisp', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Find the colon, then cast icebolt with the length of the text AFTER it, times 2.',
          starter: ['scroll = "$s"'], keys: ['i', '=', 'scroll', '.find', '(', ')', '":"', 'cast', 'icebolt', ',', 'len', '[', ']', ':', '+', '1', '*', '2'],
          goal: { foeDown: true },
          require: l => (has(l, /\.find\s*\(/) && has(l, /\[\s*\w+\s*\+\s*1\s*:/) ? null : 'Find the colon, then slice from the index after it: scroll[i + 1:].'),
          hints: ['i = scroll.find(":")', 'cast(icebolt, len(scroll[i + 1:]) * 2)'],
          solution: ['i = scroll.find(":")', 'cast(icebolt, len(scroll[i + 1:]) * 2)'],
        },
      ],
      learn: [{ title: 'Slice after a mark', code: 'i = s.find(":")\nafter = s[i + 1:]', text: 'find the mark, then slice from the index just after it.' }],
    },
    {
      id: '4-5', title: 'Cutting at the marks', bg: 'scriptorium', npc: 'ottilie', mentor: 'ottilie', tags: ['splitjoin'],
      steps: [
        { type: 'talk', who: 'ottilie', text: 'split() cuts a string into a list of pieces. With no argument it cuts at any run of spaces. split(",") cuts at every comma. You will learn lists properly soon; for now, read them with [0], [1]...' },
        { type: 'talk', who: 'ottilie', text: 'join does the opposite: "-".join(pieces) glues the pieces back together with "-" between them.' },
        { type: 'demo', text: 'Run it.', code: ['print("fire  ice spark".split())', 'print("a,b,c".split(","))', 'print("-".join(["x", "y", "z"]))'] },
        {
          type: 'predict', vars: R => ({ s: R.pick(['the quick brown fox', 'ink   and quill', 'one two three four five', 'a scroll of fire']) }),
          text: 'How many pieces? What will it say?', code: ['print(len("$s".split()))'],
          explain: 'split() with no argument cuts at spaces, however many there are in a row.',
        },
        {
          type: 'predict', vars: R => ({ s: R.pick(['Ada,12,mage', 'Wren,9,ranger', 'Quill,15,scribe']) }),
          text: 'A line from a guest book. What will it say?', code: ['print("$s".split(",")[1])'],
          explain: 'Cut at commas, then take the piece at index 1.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['ink', 'map', 'owl', 'rune']) }),
          text: 'join on a string. What will it say?', code: ['print("-".join("$w"))'],
          explain: 'A string is a sequence of letters, so join puts "-" between every letter.',
        },
        {
          type: 'predict', vars: R => ({ s: R.pick(['fire ice spark', 'one two three', 'quill ink page']) }),
          text: 'Reverse the words. What will it say?', code: ['words = "$s".split()', 'print(" ".join(words[::-1]))'],
          explain: 'Split into words, reverse the list with [::-1], and join back with spaces.',
        },
        {
          type: 'fill', vars: R => ({ a: R.pick(['Ada', 'Wren']), n: R.int(9, 40) }),
          text: 'This record uses semicolons. Cut it into pieces and print the age.',
          lines: ['record = "$a;$n"', 'parts = record.split([])', 'print(parts[1])'], chips: ['";"', '","', '" "'], answer: [['";"']],
          hints: ['Cut at the mark that separates the parts.', 'record.split(";")'],
        },
        {
          type: 'fix', text: 'This should glue the words with spaces. Run it, then tap the broken line.',
          code: ['words = ["ink", "and", "quill"]', 'print(words.join(" "))'], bad: 1,
          options: ['print(" ".join(words))', 'print(join(words, " "))', 'print(words.split(" "))'], answer: 0,
          explain: 'join belongs to the glue string: " ".join(words).',
        },
        {
          type: 'write', vars: R => ({ s: R.pick(['the dragon sleeps soundly', 'ink stains every page', 'wizards love long scrolls']) }),
          text: 'Print the second word of the sentence.',
          starter: ['sentence = "$s"'], keys: ['print', '(', ')', 'sentence', '.split()', '[', ']', '1'],
          require: l => (has(l, /\.split\s*\(/) ? null : 'Split the sentence into words first.'),
          hints: ['The second word is at index 1.', 'print(sentence.split()[1])'],
          solution: ['print(sentence.split()[1])'],
        },
      ],
      learn: [
        { title: 'split and join', code: '"a b c".split()      → ["a", "b", "c"]\n"a,b".split(",")     → ["a", "b"]\n"-".join(["a", "b"]) → "a-b"', text: 'split cuts text into pieces, join glues pieces into text.' },
      ],
    },
    {
      id: '4-6', title: 'Reading the post', bg: 'archive', npc: 'postmaster', mentor: 'postmaster', tags: ['parseline'],
      steps: [
        { type: 'talk', who: 'postmaster', text: "Postmaster Finch, at your service! Old mail logs look like this: From stephen@uct.ac.za Sat Jan 5 09:14:16 2008. Real programmers pull data out of lines like that every day." },
        { type: 'talk', who: 'postmaster', text: 'Way one: find the @, then find the space AFTER it, and slice between them. Way two: split the line into words and split again.' },
        { type: 'demo', vars: R => ({ u: R.pick(['stephen', 'louis', 'ray']), h: R.pick(['uct.ac.za', 'media.berkeley.edu', 'caret.cam.ac.uk']) }), text: 'Way one. Run it.', code: ['line = "From $u@$h Sat Jan 5 09:14:16 2008"', 'at = line.find("@")', 'sp = line.find(" ", at)', 'print(line[at + 1:sp])'] },
        {
          type: 'predict', vars: R => ({ u: R.pick(['stephen', 'louis', 'ray']), h: R.pick(['uct.ac.za', 'umich.edu', 'iupui.edu']) }),
          text: 'Way two. What will it say?', code: ['line = "From $u@$h Sat Jan 5 09:14:16 2008"', 'print(line.split()[1])'],
          explain: 'The words are From, the address, Sat, Jan... The address is word 1.',
        },
        {
          type: 'predict', vars: R => ({ u: R.pick(['stephen', 'louis', 'ray']), h: R.pick(['uct.ac.za', 'umich.edu', 'iupui.edu']) }),
          text: 'The double split. What will it say?', code: ['line = "From $u@$h Sat Jan 5 09:14:16 2008"', 'email = line.split()[1]', 'print(email.split("@")[0])'],
          explain: 'First split by spaces to get the address, then split the address at @ and take the part before it.',
        },
        {
          type: 'predict', vars: R => ({ t: R.pick(['09:14:16', '18:10:48', '16:29:07']) }),
          text: 'Which hour was it sent? What will it say?', code: ['line = "From ray@umich.edu Sat Jan 5 $t 2008"', 'time = line.split()[5]', 'print(time[:2])'],
          explain: 'Word 5 is the time. Its first two characters are the hour.',
        },
        {
          type: 'fill', vars: R => ({ u: R.pick(['wren', 'quill']), h: R.pick(['tower.org', 'ink.net']) }),
          text: 'Pull out the host: the part between @ and the next space.',
          lines: ['line = "From $u@$h Mon Feb 3"', 'at = line.find("@")', 'end = line.find([], at)', 'print(line[at + 1:end])'], chips: ['" "', '"@"', '"."'], answer: [['" "']],
          hints: ['The host ends where the next space starts.', 'line.find(" ", at)'],
        },
        {
          type: 'write', vars: R => ({ u: R.pick(['wren', 'quill', 'ada']), h: R.pick(['tower.org', 'ink.net', 'scroll.io']), d: R.pick(['Sat', 'Mon', 'Fri']) }),
          text: 'Print the host part of the address (after the @), using split twice.',
          starter: ['line = "From $u@$h $d Jan 5 09:14:16 2008"'], keys: ['print', '(', ')', 'line', '.split()', '.split("@")', '[', ']', '0', '1'],
          require: l => (has(l, /split\s*\(\s*\)/) && has(l, /split\s*\(\s*"@"\s*\)/) ? null : 'Split by spaces, then split the address at "@".'),
          hints: ['line.split()[1] is the address.', 'print(line.split()[1].split("@")[1])'],
          solution: ['print(line.split()[1].split("@")[1])'],
        },
      ],
      learn: [
        { title: 'Parsing a line', code: 'at = line.find("@")\nsp = line.find(" ", at)\nhost = line[at + 1:sp]', text: 'Find the marks, then slice between them.' },
        { title: 'The double split', code: 'line.split()[1].split("@")[1]', text: 'Split into words, pick one, then split that word again.' },
      ],
    },
    {
      id: '4-7', title: 'Carved in stone', bg: 'scriptorium', npc: 'ottilie', mentor: 'ottilie', tags: ['immutable'],
      steps: [
        { type: 'talk', who: 'ottilie', text: 'Strings are carved in stone, {NAME}. You cannot change one letter: word[0] = "J" crashes. Instead you build a NEW string, like "J" + word[1:].' },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ w: R.pick(SCRIBE_WORDS) }),
          text: 'Which error?', code: ['word = "$w"', 'word[0] = "X"'],
          explain: 'Strings cannot be changed in place, so assigning to word[0] raises TypeError.',
        },
        { type: 'talk', who: 'ottilie', text: 'Here is the most common bug in the whole Scriptorium: methods like upper() do not change the string. They hand you a new one, and if you do not catch it, it is lost.' },
        {
          type: 'predict', vars: R => ({ w: R.pick(SCRIBE_WORDS) }),
          text: 'What will it say?', code: ['s = "$w"', 's.upper()', 'print(s)'],
          wrong: ['$(w.toUpperCase())', 'Error', 'None'],
          explain: 's.upper() made a new string, but nobody stored it. s is still "$w".',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(SCRIBE_WORDS) }),
          text: 'Now catch it. What will it say?', code: ['s = "$w"', 's = s.upper()', 'print(s)'],
          explain: 'Assigning the result back to s keeps the new string.',
        },
        {
          type: 'fix', vars: R => ({ w: R.pick(SCRIBE_WORDS) }),
          text: 'This should print the name with a capital first letter. Run it, then tap the broken line.',
          code: ['name = "$w"', 'name.capitalize()', 'print(name)'], bad: 1,
          options: ['name = name.capitalize()', 'name.capitalize() = name', 'capitalize(name)'], answer: 0,
          explain: 'Store the new string: name = name.capitalize().',
        },
        {
          type: 'fill', vars: R => ({ w: R.pick(['quill', 'candle', 'margin', 'letter']), c: R.pick(['X', 'Z', '*']) }),
          text: 'Build a new word with the letter at index 2 replaced by $c.',
          lines: ['word = "$w"', 'word = word[:2] + "$c" + word[[]:]', 'print(word)'], chips: ['3', '2', '1'], answer: [['3']],
          hints: ['Skip over the letter you are replacing.', 'word[3:] is everything after index 2.'],
        },
        {
          type: 'write', vars: R => ({ w: R.pick(SCRIBE_WORDS) }),
          text: 'Change word so it starts with a capital letter, then print it. Build it with slicing: the first letter in upper case, plus the rest.',
          starter: ['word = "$w"'], keys: ['word', '=', '[', ']', '0', '1', ':', '.upper()', '+', 'print', '(', ')'],
          require: l => (has(l, /word\s*\[\s*0\s*\]\s*\.upper\(\)/) && has(l, /word\s*\[\s*1\s*:\s*\]/) ? null : 'Use word[0].upper() + word[1:].'),
          hints: ['word = word[0].upper() + word[1:]', 'Then print(word)'],
          solution: ['word = word[0].upper() + word[1:]', 'print(word)'],
        },
      ],
      learn: [
        { title: 'Strings never change', code: 'word[0] = "J"   # TypeError\nword = "J" + word[1:]', text: 'Build a new string instead of changing the old one.' },
        { title: 'Keep the result', code: 's.upper()       # lost!\ns = s.upper()   # kept', text: 'String methods return a NEW string. Store it.' },
      ],
    },
    {
      id: '4-8', title: 'Scroll bats', bg: 'stacks', mentor: 'narrator', tags: [],
      foe: R => { const w = R.pick(SCRIBE_WORDS), chant = R.pick(['by ink and by quill', 'turn every page now', 'no word goes unread']), p = R.int(4, 6); return { kind: 'scrollbat', hp: w.length + chant.split(' ').length * p, w, chant, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Scroll bats flap out of the shelves! $HP HP. Each word of a chant is one strike.' },
        { type: 'demo', vars: (R, c) => ({ w: c.foe.w }), text: 'An icebolt as long as a word.', code: ['cast(icebolt, len("$w"))'] },
        {
          type: 'fill', vars: (R, c) => ({ chant: c.foe.chant, p: c.foe.p }),
          text: 'It has $HP HP left. Cast spark with the number of WORDS in the chant, times $p.',
          lines: ['chant = "$chant"', 'cast(spark, len(chant.[]()) * $p)'], chips: ['split', 'upper', 'strip'], answer: [['split']],
          goal: { foeDown: true },
          require: s => (s[0] === 'split' ? null : 'That counts letters, not words. Split the chant into words first.'),
          hints: ['len() of a string counts letters. len() of a split counts words.', 'len(chant.split())'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat queen screeches. She is weak to every letter r in her name.' },
        {
          type: 'write', vars: R => { const name = R.pick(['rarrowrr', 'grrrimwar', 'terror rook']), p = R.int(5, 8); return { name, p, hp: [...name].filter(c => c === 'r').length * p }; },
          spawn: v => ({ kind: 'scrollbat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Cast fireball with the number of r letters in its name, times $p.',
          starter: ['name = "$name"'], keys: ['cast', 'fireball', '(', ')', ',', 'name', '.count', '"r"', '*', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /\.count\s*\(/) ? null : 'Use name.count("r").'),
          hints: ['count tells how many times a letter appears.', 'cast(fireball, name.count("r") * $p)'],
          solution: ['cast(fireball, name.count("r") * $p)'],
        },
      ],
      learn: [{ title: 'Counting words and letters', code: 'len(s.split())  → words\ns.count("r")     → letters', text: 'len of a split counts words, count counts a letter or piece.' }],
    },
    {
      id: '4-9', title: 'The Ink Wyrm', bg: 'library', foe: { kind: 'inkwyrm', hp: 160, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'inkwyrm', text: 'SSSPILL... EVERY... PAGE...' },
        { type: 'talk', who: 'narrator', text: 'The Ink Wyrm has 160 HP. Icebolt freezes ink: double damage. Fireball barely dries it: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ w: R.pick(['parchment', 'chapter', 'candlelight']) }),
          text: 'How much damage? Remember icebolt is doubled.', code: ['cast(icebolt, len("$w"[1:-1]))'],
          explain: '"$w"[1:-1] has $(w.length - 2) letters, doubled.',
        },
        {
          type: 'fix', vars: R => ({ w: R.pick(['quill', 'scroll', 'margin']) }),
          text: 'This should print the word reversed before casting. Run it, then tap the broken line.',
          code: ['word = "$w"', 'print(word[::1])', 'cast(spark, len(word))'], bad: 1,
          options: ['print(word[::-1])', 'print(word[-1])', 'print(word[1::])'], answer: 0,
          explain: 'A step of -1 walks backwards.',
        },
        { type: 'talk', who: 'inkwyrm', text: 'FIND... MY... HEART... IF... YOU... CAN...' },
        {
          type: 'fill', vars: R => ({ n: R.int(8, 14) }),
          text: 'Its heart is the number after "heart=". Find it and cast icebolt.',
          lines: ['scroll = "scales=9;heart=$n"', 'i = scroll.find([])', 'cast(icebolt, int(scroll[i + 6:]))'], chips: ['"heart="', '"scales="', '";"'], answer: [['"heart="']],
          hints: ['Find where "heart=" starts. It is 6 letters long.', 'scroll.find("heart=")'],
        },
        {
          type: 'write', vars: (R, c) => ({ v: Math.floor(c.foe.hp / 2) + 1 }),
          text: 'Final blow! The power you need is written in the scroll after the =. Split it out, turn it into a number, and cast icebolt.',
          starter: ['scroll = "power=$v"'], keys: ['power', '=', 'int', '(', ')', 'scroll', '.split', '"="', '[', ']', '1', 'cast', 'icebolt', ','],
          goal: { foeDown: true },
          require: l => (has(l, /\.split\s*\(\s*"="\s*\)/) ? null : 'Split the scroll at "=".'),
          hints: ['scroll.split("=")[1] is the number as text.', 'power = int(scroll.split("=")[1]) then cast(icebolt, power)'],
          solution: ['power = int(scroll.split("=")[1])', 'cast(icebolt, power)'],
        },
        { type: 'talk', who: 'inkwyrm', text: '...the... ink... runs... dry...' },
      ],
      learn: [{ title: 'Text toolkit', code: 's[-1]  s[::-1]  in  find  split  join', text: 'Everything from the Scriptorium: read from either end, slice with steps, search, cut and glue.' }],
    },
  ],
};
WORLDS.push(WORLD4);

(() => {
  const { makeQ, pick, rnd } = Arena;
  const W = ['quill', 'scroll', 'candle', 'margin', 'letter', 'chapter'];
  Object.assign(Arena.GEN, {
    negindex: () => { const w = pick(W), k = rnd(1, 3); return makeQ([`w = "${w}"`, `print(w[-${k}])`], [w[k - 1], w[w.length - k - 1] || w[0], 'Error']); },
    slicestep: () => {
      const w = pick(W), v = rnd(0, 2);
      if (v === 0) return makeQ([`print("${w}"[::-1])`], [w, w.slice(1)]);
      if (v === 1) return makeQ([`print("${w}"[::2])`], [w.slice(0, 2), [...w].filter((c, i) => i % 2).join('')]);
      return makeQ([`print("${w}"[1:-1])`], [w.slice(1), w.slice(0, -1)]);
    },
    instr: () => {
      const w = pick(W), v = rnd(0, 2);
      if (v === 0) return makeQ([`print("${w.slice(1, 3)}" in "${w}")`], ['False', w.slice(1, 3)]);
      if (v === 1) { const c = pick(['l', 'e', 'z']); return makeQ([`print("${w}".find("${c}"))`], [w.indexOf(c) + 1, w.lastIndexOf(c) === -1 ? 0 : -1]); }
      return makeQ([`print("${pick(['Zebra', 'Apple'])}" < "${pick(['apple', 'zebra'])}")`], ['False', 'Error']);
    },
    splitjoin: () => {
      const s = pick(['fire ice spark', 'ink and quill', 'one two three four']), v = rnd(0, 2);
      if (v === 0) return makeQ([`print(len("${s}".split()))`], [s.length, s.split(' ').length + 1]);
      if (v === 1) return makeQ([`print("-".join("${s}".split()))`], [s, s.split(' ').join('')]);
      return makeQ([`print("${s}".split()[-1])`], [s.split(' ')[0], s.slice(-1)]);
    },
    parseline: () => {
      const u = pick(['ray', 'wren', 'ada']), h = pick(['umich.edu', 'tower.org']);
      return rnd(0, 1) === 0
        ? makeQ([`line = "From ${u}@${h} Sat Jan 5"`, 'print(line.split()[1].split("@")[1])'], [u, `${u}@${h}`])
        : makeQ([`line = "From ${u}@${h} Sat Jan 5"`, 'at = line.find("@")', 'print(line[:at][-2:])'], [u, h.slice(0, 2)]);
    },
    immutable: () => {
      const w = pick(W);
      return rnd(0, 1) === 0 ? makeQ([`s = "${w}"`, 's.upper()', 'print(s)'], [w.toUpperCase(), 'None']) : makeQ([`s = "${w}"`, 's[0] = "X"', 'print(s)'], ['X' + w.slice(1), w]);
    },
  });
})();
