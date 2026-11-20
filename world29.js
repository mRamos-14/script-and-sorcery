/* World 29: The Pattern Marsh. Regular expressions with the re library: search, wildcards,
   raw strings, character classes, anchors and fullmatch, groups and the walrus, repeats and
   alternatives, re.sub. (Patterns avoid a $ followed by a letter, which templates would read.) */
const CREATURES = ['toad', 'newt', 'heron', 'eel', 'frog', 'otter', 'moth'];

const WORLD29 = {
  id: 29, name: 'The Pattern Marsh', topic: 'regular expressions', map: 'bg-map14.jpg',
  nodes: [[50, 92], [30, 83], [70, 74], [34, 64], [66, 54], [30, 44], [68, 34], [38, 23], [50, 9]],
  levels: [
    {
      id: '29-1', title: 'Tracks in the mud', bg: 'marsh', npc: 'hermit', mentor: 'hermit', tags: ['research'],
      steps: [
        { type: 'talk', who: 'hermit', text: "Mind your step, {NAME}. I'm Hermit Rue. In this marsh we read tracks: patterns in text. Python's re library finds them. re.search(pattern, text) looks for the pattern anywhere in the text." },
        { type: 'talk', who: 'hermit', text: 'If it finds the pattern you get a match object, which counts as True. If not, you get None, which counts as False.' },
        { type: 'demo', vars: R => ({ c: R.pick(CREATURES) }), text: 'Run it.', code: ['import re', 'text = "a $c swims by the reeds"', 'm = re.search("$c", text)', 'print(m)', 'if m:', '    print("found it at", m.start())'] },
        {
          type: 'predict', vars: R => { const [a, b] = R.sample(CREATURES, 2); return { a, b }; }, text: 'What will it say?',
          code: ['import re', 'log = "I saw a $a and a $a"', 'print(bool(re.search("$a", log)), bool(re.search("$b", log)))'],
          explain: '$a is in the log, $b is not.',
        },
        {
          type: 'predict', vars: R => ({ c: R.pick(CREATURES), x: R.int(2, 9) }), text: 'A match knows what and where. What will it say?',
          code: ['import re', 'text = "$(".".repeat(x))$c"', 'm = re.search("$c", text)', 'print(m.group(), m.start(), m.end())'],
          explain: '.group() is the matched text. It starts at $x and ends at $(x + c.length).',
        },
        {
          type: 'predict', vars: R => ({ c: R.pick(CREATURES) }), text: 'Case matters. What will it say?',
          code: ['import re', 'print(re.search("$c", "$(c.toUpperCase()) SPOTTED"))'],
          explain: 'Patterns are case-sensitive by default, so nothing matches: None.',
        },
        {
          type: 'fill', vars: R => ({ c: R.pick(CREATURES) }), text: 'Report whether a frog is in the log.',
          lines: ['import re', 'log = "heron, $c, frog, moth"', 'if re.[]("frog", []):', '    print("frog!")'], chips: ['search', 'log', 'find', '"log"'], answer: [['search', 'log']],
          hints: ['re.search(pattern, text)', 're.search("frog", log)'],
        },
        {
          type: 'write', vars: R => ({ c: R.pick(CREATURES), has: R.chance(0.5) }), text: 'Print "found" if the word eel appears in line, otherwise print "missing".',
          starter: ['import re', 'line = "$(has ? "an eel in the" : "a toad on the") water"'], keys: ['if', 're.search', '(', ')', '"eel"', ',', 'line', ':', 'print', '"found"', 'else:', '"missing"'],
          require: l => (has(l, /re\.search\(/) ? null : 'Use re.search.'),
          hints: ['if re.search("eel", line):', '    print("found") / else: / print("missing")'],
          solution: ['if re.search("eel", line):', '    print("found")', 'else:', '    print("missing")'],
        },
      ],
      learn: [{ title: 're.search', code: 'm = re.search("toad", text)\nif m:\n    print(m.group())', text: 'Finds a pattern anywhere in the text. Gives a match object, or None.' }],
    },
    {
      id: '29-2', title: 'Wildcards', bg: 'marsh', npc: 'tracker', mentor: 'tracker', tags: ['rewild'],
      steps: [
        { type: 'talk', who: 'tracker', text: "Tracker Sil. Tracks blur, so patterns have wildcards. . matches any one character. + means one or more of the thing before it, * means zero or more, ? means it is optional." },
        { type: 'talk', who: 'tracker', text: 'Write patterns as raw strings, r"...", so backslashes reach re untouched. To match a real dot, write \\. in the pattern.' },
        {
          type: 'predict', vars: R => ({ w: R.pick(['cat', 'cut', 'cot', 'ct']) }), text: 'c.t means c, any one character, t. What will it say?',
          code: ['import re', 'print(bool(re.search(r"c.t", "$w")))'],
          explain: 'The dot needs exactly one character between c and t.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(1, 6) }), text: 'One or more. What will it say?',
          code: ['import re', 'm = re.search(r"go+al", "what a g$("o".repeat(n))al!")', 'print(m.group(), len(m.group()))'],
          explain: 'o+ swallows every o in a row: $n of them.',
        },
        {
          type: 'predict', text: 'Optional letters. What will it say?',
          code: ['import re', 'for w in ["color", "colour", "colr"]:', '    print(bool(re.search(r"colou?r", w)))'],
          explain: 'u? means the u may appear once or not at all. "colr" is missing the o.',
        },
        {
          type: 'fix', text: 'This should only accept a real dot, but it accepts 3x14. Run it, then tap the broken line.',
          code: ['import re', 'pi = "3x14"', 'if re.search(r"3.14", pi):', '    print("pi!")', 'else:', '    print("not pi")'], bad: 2,
          options: ['if re.search(r"3\\.14", pi):', 'if re.search(r"3.1", pi):', 'if re.search(r"\\d.14", pi):'], answer: 0,
          explain: 'A bare . means any character. \\. means a real dot.',
        },
        {
          type: 'write', vars: R => ({ n: R.int(1, 5) }), text: 'Print the matched text for an h, one or more a\'s, and a "!" in shout.',
          starter: ['import re', 'shout = "they yelled h$("a".repeat(n))! at me"'], keys: ['m', '=', 're.search', '(', ')', 'r"ha+!"', ',', 'shout', 'print', 'm.group()'],
          require: l => (has(l, /a\+/) ? null : 'Use a+ for one or more a\'s.'),
          hints: ['m = re.search(r"ha+!", shout)', 'print(m.group())'],
          solution: ['m = re.search(r"ha+!", shout)', 'print(m.group())'],
        },
      ],
      learn: [{ title: 'Wildcards', code: '.   +   *   ?   \\.   r"..."', text: 'Any character, one or more, zero or more, optional, a real dot. Use raw strings.' }],
    },
    {
      id: '29-3', title: 'Kinds of tracks', bg: 'marsh', npc: 'hermit', mentor: 'hermit', tags: ['reclass'],
      steps: [
        { type: 'talk', who: 'hermit', text: 'Square brackets mean "one of these": [aeiou] is any vowel, [0-9] any digit. Shortcuts: \\d a digit, \\w a letter, digit or _, \\s a space. re.findall gives every match as a list.' },
        { type: 'demo', vars: R => ({ c: R.pick(CREATURES) }), text: 'Run it.', code: ['import re', 'print(re.findall(r"[aeiou]", "$c"))', 'print(re.findall(r"\\d+", "3 frogs and 12 newts"))'] },
        {
          type: 'predict', vars: R => ({ c: R.pick(['marshland', 'heronry', 'dragonfly', 'lilypad', 'mudskipper']) }), text: 'Counting vowels. What will it say?',
          code: ['import re', 'print(len(re.findall(r"[aeiou]", "$c")))'],
          explain: '"$c" has $(c.replace(/[^aeiou]/g, "").length) vowels.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9), b: R.int(10, 99), c: R.int(100, 400) }), text: 'Numbers hidden in a log. What will it say?',
          code: ['import re', 'nums = re.findall(r"\\d+", "day $a: $b eels, $c flies")', 'print(nums, sum(int(n) for n in nums))'],
          explain: 'findall returns strings, so int() is needed before adding.',
        },
        {
          type: 'predict', text: 'Words only. What will it say?',
          code: ['import re', 'print(re.findall(r"\\w+", "hop, skip & jump!"))'],
          explain: '\\w+ grabs runs of letters and digits. Punctuation and spaces split them.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9) }), text: 'Grab every whole number.',
          lines: ['import re', 'nums = re.[](r"[]", "$a reeds, $b(0) lilies")', 'print(nums)'], chips: ['findall', '\\d+', 'search', '\\d'], answer: [['findall', '\\d+']],
          hints: ['findall returns all matches.', '\\d+ means one or more digits.'],
        },
        {
          type: 'write', vars: R => ({ xs: [R.int(1, 20), R.int(1, 20), R.int(1, 20)] }), text: 'Print the total of all the numbers in report.',
          starter: ['import re', 'report = "toads $(xs[0]), newts $(xs[1]), eels $(xs[2])"'], keys: ['nums', '=', 're.findall', '(', ')', 'r"\\d+"', ',', 'report', 'print', 'sum', 'int', 'for', 'n', 'in'],
          require: l => (has(l, /findall/) ? null : 'Use re.findall.'),
          hints: ['nums = re.findall(r"\\d+", report)', 'print(sum(int(n) for n in nums))'],
          solution: ['nums = re.findall(r"\\d+", report)', 'print(sum(int(n) for n in nums))'],
        },
      ],
      learn: [{ title: 'Character classes', code: '[aeiou]  [0-9]  \\d  \\w  \\s\nre.findall(p, text)', text: 'Sets of allowed characters, and findall to get every match.' }],
    },
    {
      id: '29-4', title: 'Marsh serpents', bg: 'bog', mentor: 'narrator', tags: [],
      foe: R => { const n = R.int(3, 6); return { kind: 'serpent', hp: n * 4, n }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'A marsh serpent rises, hissing! Every s in its hiss is a scale you can strike.' },
        {
          type: 'fill', vars: (R, c) => ({ h: 'hi' + 's'.repeat(c.foe.n) }), text: 'It has $HP HP. Cast spark with 4 times the number of s\'s in the hiss.',
          lines: ['import re', 'hiss = "$h"', 'scales = re.[](r"s", hiss)', 'cast(spark, len([]) * 4)'], chips: ['findall', 'scales', 'search', 'hiss'], answer: [['findall', 'scales']],
          goal: { foeDown: true },
          hints: ['findall gives a list of every s.', 'len(scales) counts them.'],
        },
        { type: 'talk', who: 'narrator', text: 'A great serpent coils out of the bog!' },
        {
          type: 'write', vars: R => ({ xs: [R.int(5, 15), R.int(5, 15), R.int(5, 15)] }), spawn: v => ({ kind: 'serpent', hp: v.xs[0] + v.xs[1] + v.xs[2], tint: 'big' }),
          text: 'The runes on its scales give your powers. Cast fireball once for every number in runes.',
          starter: ['import re', 'runes = "x$(xs[0])-y$(xs[1])-z$(xs[2])"'], keys: ['for', 'n', 'in', 're.findall', '(', ')', 'r"\\d+"', ',', 'runes', ':', 'cast', 'fireball', 'int(n)'],
          goal: { foeDown: true },
          require: l => (has(l, /findall/) ? null : 'Use re.findall to get the numbers.'),
          hints: ['for n in re.findall(r"\\d+", runes):', '    cast(fireball, int(n))'],
          solution: ['for n in re.findall(r"\\d+", runes):', '    cast(fireball, int(n))'],
        },
      ],
      learn: [{ title: 'Counting matches', code: 'len(re.findall(r"s", hiss))', text: 'findall plus len counts how often a pattern appears.' }],
    },
    {
      id: '29-5', title: 'Start to finish', bg: 'marsh', npc: 'tracker', mentor: 'tracker', tags: ['reanchor'],
      steps: [
        { type: 'talk', who: 'tracker', text: '^ pins the pattern to the start of the text and $ to the end. re.fullmatch demands the whole text matches. That is how you check input like codes and emails.' },
        {
          type: 'predict', vars: R => ({ n: R.pick(KNIGHTS_OR_NAMES()) }), text: 'What will it say?',
          code: ['import re', 'for name in ["Sir $n", "$n, Sir"]:', '    print(bool(re.search(r"^Sir", name)))'],
          explain: '^Sir only matches when the text starts with Sir.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(100, 999), b: R.int(1000, 9999) }), text: 'Exactly three digits. What will it say?',
          code: ['import re', 'print(re.fullmatch(r"\\d\\d\\d", "$a") is not None)', 'print(re.fullmatch(r"\\d\\d\\d", "$b") is not None)', 'print(re.search(r"\\d\\d\\d", "$b") is not None)'],
          explain: 'fullmatch needs the whole text to fit. search is happy with three digits anywhere.',
        },
        {
          type: 'predict', vars: R => ({ u: R.pick(['ada', 'wren', 'rue']), ok: R.chance(0.5) }), text: 'A simple email check. What will it say?',
          code: ['import re', 'email = "$u@marsh.$(ok ? "com" : "c0m")"', 'if re.search(r"^\\w+@\\w+\\.com$", email):', '    print("valid")', 'else:', '    print("invalid")'],
          explain: 'Name, @, domain, a real dot, then exactly com at the end.',
        },
        {
          type: 'fix', vars: R => ({ x: R.int(10, 99) }), text: 'This accepts codes with junk around them. Run it, then tap the broken line.',
          code: ['import re', 'code = "xx$x$(x)yy"', 'if re.search(r"\\d+", code):', '    print("ok")', 'else:', '    print("rejected")'], bad: 2,
          options: ['if re.fullmatch(r"\\d+", code):', 'if re.search(r"\\d*", code):', 'if re.findall(r"\\d+", code):'], answer: 0,
          explain: 'search finds digits anywhere. fullmatch insists the whole code is digits.',
        },
        {
          type: 'write', vars: R => ({ c: R.pick(['A12', 'B7', 'Z99', 'c12', 'Q1x', 'M34']) }), text: 'A permit code is one capital letter then exactly two digits. Print "valid" or "invalid" for code, using re.fullmatch.',
          starter: ['import re', 'code = "$c"'], keys: ['if', 're.fullmatch', '(', ')', 'r"[A-Z]\\d\\d"', ',', 'code', ':', 'print', '"valid"', 'else:', '"invalid"'],
          require: l => (has(l, /fullmatch/) ? null : 'Use re.fullmatch.'),
          hints: ['if re.fullmatch(r"[A-Z]\\d\\d", code):', '    print("valid") / else: / print("invalid")'],
          solution: ['if re.fullmatch(r"[A-Z]\\d\\d", code):', '    print("valid")', 'else:', '    print("invalid")'],
        },
      ],
      learn: [{ title: 'Anchors', code: 'r"^start"  r"end$"\nre.fullmatch(p, text)', text: '^ and $ pin the pattern to the edges. fullmatch checks the whole text.' }],
    },
    {
      id: '29-6', title: 'Catching parts', bg: 'marsh', npc: 'hermit', mentor: 'hermit', tags: ['regroup'],
      steps: [
        { type: 'talk', who: 'hermit', text: 'Round brackets in a pattern catch that part. m.group(1) is the first catch, m.group(2) the second, m.groups() all of them.' },
        { type: 'demo', vars: R => ({ u: R.pick(['ada', 'rue', 'sil']), d: R.pick(['marsh', 'bog', 'fen']) }), text: 'Run it.', code: ['import re', 'm = re.search(r"(\\w+)@(\\w+)\\.org", "write to $u@$d.org today")', 'print(m.group(1), m.group(2))', 'print(m.groups())'] },
        {
          type: 'predict', vars: R => { const [a, b] = R.sample(['Malan', 'Rue', 'Sil', 'Oro', 'Quinn'], 2); return { a, b }; }, text: 'Turning "Last, First" around. What will it say?',
          code: ['import re', 'm = re.search(r"^(\\w+), (\\w+)$", "$a, $b")', 'print(m.group(2), m.group(1))'],
          explain: 'Catch 1 is $a, catch 2 is $b. Printing 2 then 1 swaps them.',
        },
        {
          type: 'predict', vars: R => ({ p: R.int(2, 40), q: R.int(41, 90) }), text: 'The walrus := saves the match inside the if. What will it say?',
          code: ['import re', 'if m := re.search(r"(\\d+)-(\\d+)", "pages $p-$q"):', '    print(int(m.group(2)) - int(m.group(1)))', 'else:', '    print("no pages")'],
          explain: 'm holds the match, so the if can use it right away: $q - $p = $(q - p).',
        },
        {
          type: 'fill', vars: R => ({ h: R.int(1, 12), m: R.int(10, 59) }), text: 'Pull the hour and the minutes out of the time.',
          lines: ['import re', 'm = re.search(r"(\\d+):(\\d+)", "dawn at $h:$m")', 'print("hour", m.group([]), "minutes", m.group([]))'], chips: ['1', '2', '0'], answer: [['1', '2']],
          hints: ['The hour is the first catch.', 'group(1), then group(2)'],
        },
        {
          type: 'write', vars: R => ({ l: R.int(2, 60) }), text: 'Use re.search with a group to find the number in status, and print it plus 1.',
          starter: ['import re', 'status = "Level $l reached"'], keys: ['m', '=', 're.search', '(', ')', 'r"(\\d+)"', ',', 'status', 'print', 'int', 'm.group(1)', '+', '1'],
          require: l => (has(l, /group\(1\)/) ? null : 'Catch the number with ( ) and use m.group(1).'),
          hints: ['m = re.search(r"(\\d+)", status)', 'print(int(m.group(1)) + 1)'],
          solution: ['m = re.search(r"(\\d+)", status)', 'print(int(m.group(1)) + 1)'],
        },
      ],
      learn: [{ title: 'Groups', code: 'm = re.search(r"(\\w+)@(\\w+)", s)\nm.group(1)\nif m := re.search(...):', text: 'Brackets catch parts of a match. The walrus saves the match inside an if.' }],
    },
    {
      id: '29-7', title: 'Counting and choosing', bg: 'marsh', npc: 'tracker', mentor: 'tracker', tags: ['rerepeat'],
      steps: [
        { type: 'talk', who: 'tracker', text: '{3} means exactly three of the thing before, {2,4} two to four. A | B means A or B. Add re.IGNORECASE to stop caring about capitals.' },
        {
          type: 'predict', text: 'Two or three digits at a time. What will it say?',
          code: ['import re', 'print(re.findall(r"\\d{2,3}", "7 42 314 2718"))'],
          explain: 'Each match takes up to 3 digits: 2718 gives 271, and the 8 left over is too short.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['cat', 'dog', 'cow', 'dogs']) }), text: 'One or the other. What will it say?',
          code: ['import re', 'print(bool(re.fullmatch(r"cat|dog", "$w")))'],
          explain: 'The whole word must be exactly cat or dog.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['Frog', 'FROG', 'frog', 'fRoG']) }), text: 'Ignoring capitals. What will it say?',
          code: ['import re', 'print(bool(re.search(r"frog", "$w")), bool(re.search(r"frog", "$w", re.IGNORECASE)))'],
          explain: 'With re.IGNORECASE, capitals do not matter.',
        },
        {
          type: 'fill', vars: R => ({ y: R.int(1000, 2099) }), text: 'Find a four-digit year.',
          lines: ['import re', 'm = re.search(r"\\d[]", "born in $y, they say")', 'print(m.[]())'], chips: ['{4}', '{2}', 'group', 'groups'], answer: [['{4}', 'group']],
          hints: ['{4} means exactly four.', 'm.group() is the whole match.'],
        },
        {
          type: 'write', vars: R => ({ w: R.pick(['Yes', 'YES', 'y', 'Y', 'no', 'Nope']) }), text: 'Print True if answer is exactly "y" or "yes" in any capitals, otherwise False. Use re.fullmatch with re.IGNORECASE.',
          starter: ['import re', 'answer = "$w"'], keys: ['print', '(', ')', 'bool', 're.fullmatch', 'r"y|yes"', ',', 'answer', 're.IGNORECASE'],
          require: l => (has(l, /IGNORECASE|re\.I\b/) && has(l, /fullmatch/) ? null : 'Use re.fullmatch with re.IGNORECASE.'),
          hints: ['re.fullmatch(r"y|yes", answer, re.IGNORECASE)', 'print(bool(...))'],
          solution: ['print(bool(re.fullmatch(r"y|yes", answer, re.IGNORECASE)))'],
        },
      ],
      learn: [{ title: 'Repeats and choices', code: '\\d{4}  \\w{2,5}  cat|dog\nre.IGNORECASE', text: 'Exact counts, ranges of counts, alternatives, and ignoring capitals.' }],
    },
    {
      id: '29-8', title: 'Rewriting runes', bg: 'bog', mentor: 'narrator', tags: ['resub'],
      foe: R => ({ kind: 'serpent', hp: 60, weak: 'fireball' }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'A rune serpent scrambles every spell! re.sub(pattern, new, text) replaces every match. It cleans up messy text in one line.' },
        {
          type: 'predict', text: 'Squashing spaces. What will it say?',
          code: ['import re', 'print(re.sub(r"\\s+", " ", "too    many   spaces"))'],
          explain: 'Every run of spaces becomes one space.',
        },
        {
          type: 'predict', vars: R => { const [a, b] = R.sample(['Malan', 'David', 'Rue', 'Sil'], 2); return { a, b }; }, text: '\\1 and \\2 put the catches back. What will it say?',
          code: ['import re', 'print(re.sub(r"(\\w+) (\\w+)", r"\\2 \\1", "$a $b"))'],
          explain: 'The two words swap places.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(4, 7) }), text: 'Strip the junk from the rune, then cast fireball with how long it is.',
          lines: ['import re', 'rune = "$("x#".repeat(n))"', 'clean = re.[](r"#", "", rune)', 'cast(fireball, len([]))'], chips: ['sub', 'clean', 'search', 'rune'], answer: [['sub', 'clean']],
          hints: ['re.sub replaces each # with nothing.', 'len(clean) is the cleaned length.'],
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Finish it! $HP HP left, fireball is doubled. The rune hides the power between dashes. Remove every dash with re.sub, then cast fireball with int(...) of what is left.',
          starter: ['import re', 'rune = "-$(String(q).split("").join("-"))-"'], keys: ['power', '=', 're.sub', '(', ')', 'r"-"', '""', ',', 'rune', 'cast', 'fireball', 'int'],
          goal: { foeDown: true },
          require: l => (has(l, /re\.sub\(/) ? null : 'Use re.sub to remove the dashes.'),
          hints: ['power = re.sub(r"-", "", rune)', 'cast(fireball, int(power))'],
          solution: ['power = re.sub(r"-", "", rune)', 'cast(fireball, int(power))'],
        },
      ],
      learn: [{ title: 're.sub', code: 're.sub(r"\\s+", " ", text)\nre.sub(r"(\\w+) (\\w+)", r"\\2 \\1", s)', text: 'Replace every match. \\1 and \\2 put caught groups into the replacement.' }],
    },
    {
      id: '29-9', title: 'The Hydra of Patterns', bg: 'hydra', foe: { kind: 'hydra', hp: 240, weak: 'spark', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'hydra', text: 'HSSSS. Cut one head and two patterns grow back, little tracker.' },
        { type: 'talk', who: 'narrator', text: 'The Hydra has 240 HP. Spark strikes it for double. Icebolt barely cools it.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ n: R.int(4, 9) }), text: 'How much damage will this deal? Spark is doubled.',
          code: ['import re', 'heads = re.findall(r"head", "$(Array(n).fill("head").join(" "))")', 'cast(spark, len(heads) * 3)'],
          explain: '$n heads times 3 is $(3 * n), doubled by spark: $(6 * n).',
        },
        {
          type: 'fix', vars: R => ({ p: R.int(10, 16) }), text: 'The Hydra twisted your pattern! Run it, then tap the broken line.',
          code: ['import re', 'm = re.search(r"power=(\\d+)", "rune power=$p sealed")', 'cast(spark, int(m.group(0)))', 'print("struck")'], bad: 2,
          options: ['cast(spark, int(m.group(1)))', 'cast(spark, m.group(1))', 'cast(spark, int(m.groups()))'], answer: 0,
          explain: 'group(0) is the whole match, "power=$p". group(1) is just the number.',
        },
        { type: 'talk', who: 'hydra', text: 'MY NAMES ARE MANY. MY CASE IS... INCONSISTENT.' },
        {
          type: 'fill', vars: R => ({ n: R.int(4, 8) }), text: 'Count every head, whatever its capitals, and spark it.',
          lines: ['import re', 'roar = "$(Array(n).fill(0).map((_, i) => (i % 2 ? "HEAD" : "Head")).join("-"))"', 'heads = re.findall(r"head", roar, re.[])', 'cast(spark, len(heads) * [])'],
          chips: ['IGNORECASE', 'MULTILINE', '4', '"4"'], answer: [['IGNORECASE', '4']],
          hints: ['Ignore capitals with re.IGNORECASE.', 'Multiply by the number 4.'],
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Final blow! $HP HP left, spark is doubled. Use a group in re.search to pull the number out of seal, and cast spark with it.',
          starter: ['import re', 'seal = "the last seal reads: strike $q now"'], keys: ['m', '=', 're.search', '(', ')', 'r"strike (\\d+)"', ',', 'seal', 'cast', 'spark', 'int', 'm.group(1)'],
          goal: { foeDown: true },
          require: l => (has(l, /group\(1\)/) ? null : 'Catch the number with a group and use m.group(1).'),
          hints: ['m = re.search(r"strike (\\d+)", seal)', 'cast(spark, int(m.group(1)))'],
          solution: ['m = re.search(r"strike (\\d+)", seal)', 'cast(spark, int(m.group(1)))'],
        },
        { type: 'talk', who: 'hydra', text: 'hsss... no pattern... left to grow...' },
      ],
      learn: [{ title: 'Regex toolkit', code: 'search  fullmatch  findall  sub\n.  +  *  ?  []  \\d  \\w  ^  $  ()  {n}  |', text: 'CS50P week 7: finding, checking, extracting and rewriting text with patterns.' }],
    },
  ],
};
function KNIGHTS_OR_NAMES() { return ['Aldric', 'Bryn', 'Cora', 'Rolf', 'Ivy']; }
WORLDS.push(WORLD29);
