/* World 16: The Skyward Gardens. Sets and set maths, lambda, sorting with key=,
   map and filter, zip / enumerate / any / all. Sets of strings are always printed
   through sorted(), because real Python prints them in a different order each run. */
const FLOWERS = ['rose', 'tulip', 'lily', 'iris', 'daisy', 'orchid', 'poppy', 'violet'];
const pyL = a => '[' + a.map(x => (typeof x === 'string' ? '"' + x + '"' : x)).join(', ') + ']';

const WORLD16 = {
  id: 16, name: 'The Skyward Gardens', topic: 'sets, lambda, map and filter', map: 'bg-map16.jpg',
  nodes: [[50, 92], [28, 82], [70, 73], [34, 63], [68, 53], [30, 43], [66, 33], [38, 22], [50, 9]],
  levels: [
    {
      id: '16-1', title: 'One of each', bg: 'garden', npc: 'gardener', mentor: 'gardener', tags: ['sets'],
      steps: [
        { type: 'talk', who: 'gardener', text: "Up here among the clouds, {NAME}, I'm Gardener Moss. My seed box holds one of each kind, never two. In Python that is a set: {1, 2, 3}, or set(list) to remove repeats." },
        { type: 'talk', who: 'gardener', text: 'Sets are fast at answering "is this in here?". But they have no order and no positions, so set[0] does not exist.' },
        { type: 'demo', vars: R => { const [a, b, c] = R.sample(FLOWERS, 3); return { L: pyL([a, b, a, c, b, a]), a }; }, text: 'Run it.', code: ['seeds = $L', 'box = set(seeds)', 'print(len(seeds), len(box))', 'print("$a" in box)', 'print(sorted(box))'] },
        {
          type: 'predict', vars: R => ({ xs: R.shuffle([R.int(0, 3), R.int(0, 3), R.int(4, 7), R.int(4, 7), R.int(0, 7)]) }), text: 'What will it say?',
          code: ['nums = $(JSON.stringify(xs))', 'print(len(nums), len(set(nums)))'],
          explain: 'The set keeps one copy of each number: $(new Set(xs).size) different values.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(0, 3), b: R.int(4, 7) }), text: 'Adding to a set. What will it say?',
          code: ['s = {$b, $a}', 's.add($a)', 's.add(2)', 'print(len(s), $a in s, 9 in s)'],
          explain: 'Adding $a again changes nothing, because it is already in the set.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Which error will this cause?',
          code: ['box = {"rose", "lily"}', 'print(box[0])'],
          explain: 'Sets have no positions, so [0] is a TypeError. Use sorted(box)[0] or in instead.',
        },
        {
          type: 'fill', vars: R => { const [a, b, c] = R.sample(FLOWERS, 3); return { L: pyL([a, b, a, c, a]) }; }, text: 'How many different flowers were picked?',
          lines: ['picked = $L', 'kinds = [](picked)', 'print([](kinds))'], chips: ['set', 'len', 'list', 'sorted'], answer: [['set', 'len']],
          hints: ['set() removes the repeats.', 'len counts what is left.'],
        },
        {
          type: 'write', vars: R => { const cs = R.sample(['red', 'blue', 'gold', 'white', 'pink'], 3); return { L: pyL([cs[0], cs[1], cs[0], cs[2], cs[1], cs[0]]) }; }, text: 'Print how many different colors are in colors.',
          starter: ['colors = $L'], keys: ['print', '(', ')', 'len', 'set', 'colors'],
          require: l => (has(l, /set\(/) ? null : 'Use set() to drop the repeats.'),
          hints: ['set(colors) has one of each.', 'print(len(set(colors)))'],
          solution: ['print(len(set(colors)))'],
        },
      ],
      learn: [{ title: 'Sets', code: 'box = set(items)\nbox.add(x)\nx in box', text: 'No repeats, no order, very fast "in". Use sorted() to print them in order.' }],
    },
    {
      id: '16-2', title: 'Garden maths', bg: 'garden', npc: 'seer', mentor: 'seer', tags: ['setops'],
      steps: [
        { type: 'talk', who: 'seer', text: "Seer Lin. Two gardens, two sets. a | b is everything in either. a & b is only what both share. a - b is in a but not b. a ^ b is in exactly one of them." },
        { type: 'demo', vars: R => { const f = R.sample(FLOWERS, 5); return { A: pyL(f.slice(0, 3)), B: pyL(f.slice(2, 5)) }; }, text: 'Run it.', code: ['north = set($A)', 'south = set($B)', 'print(sorted(north & south))', 'print(sorted(north | south))', 'print(sorted(north - south))'] },
        {
          type: 'predict', vars: R => { const f = R.sample(FLOWERS, 5); return { A: pyL(f.slice(0, 3)), B: pyL(f.slice(1, 5)) }; }, text: 'What will it say?',
          code: ['a = set($A)', 'b = set($B)', 'print(sorted(a & b))'],
          explain: '& keeps only the flowers both gardens have.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(0, 2), b: R.int(3, 5) }), text: 'Small numbers print in order. What will it say?',
          code: ['x = {$a, $b, 6}', 'y = {$b, 7}', 'print(x - y, x ^ y)'],
          explain: 'x - y drops $b. x ^ y keeps what is in exactly one set.',
        },
        {
          type: 'predict', vars: R => ({ f: R.sample(FLOWERS, 4) }), text: 'Is one garden inside the other? What will it say?',
          code: ['small = {"$(f[0])", "$(f[1])"}', 'big = {"$(f[0])", "$(f[1])", "$(f[2])"}', 'print(small <= big, small.issubset(big), big <= small)'],
          explain: '<= and issubset ask whether every item of small is also in big.',
        },
        {
          type: 'fill', vars: R => { const f = R.sample(FLOWERS, 5); return { A: pyL(f.slice(0, 3)), B: pyL(f.slice(2, 5)) }; }, text: 'Which seeds are missing from the vase?',
          lines: ['garden = set($A)', 'vase = set($B)', 'missing = garden [] vase', 'print([](missing))'], chips: ['-', '&', 'sorted', 'list'], answer: [['-', 'sorted']],
          hints: ['In the garden but not the vase: -', 'Print sorted(missing) so the order is fixed.'],
        },
        {
          type: 'write', vars: R => { const f = R.sample(FLOWERS, 6); return { A: pyL(f.slice(0, 4)), B: pyL(f.slice(2, 6)) }; }, text: 'Print, as a sorted list, the flowers that grow in both gardens.',
          starter: ['east = set($A)', 'west = set($B)'], keys: ['print', '(', ')', 'sorted', 'east', '&', 'west'],
          require: l => (has(l, /&|intersection/) ? null : 'Use & (or .intersection).'),
          hints: ['east & west keeps the shared flowers.', 'print(sorted(east & west))'],
          solution: ['print(sorted(east & west))'],
        },
      ],
      learn: [{ title: 'Set maths', code: 'a | b   a & b   a - b   a ^ b   a <= b', text: 'Union, intersection, difference, one-or-the-other, and subset.' }],
    },
    {
      id: '16-3', title: 'Tiny spells', bg: 'garden', npc: 'gardener', mentor: 'gardener', tags: ['lambdaq'],
      steps: [
        { type: 'talk', who: 'gardener', text: 'Some spells are so small they fit on a seed packet. lambda x: x * 2 is a function with no name, and its body is a single expression that it returns.' },
        { type: 'demo', vars: R => ({ n: R.int(2, 12) }), text: 'Run it.', code: ['double = lambda x: x * 2', 'grow = lambda h, days=1: h + 3 * days', 'print(double($n), grow(10), grow(10, 4))'] },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9), b: R.int(2, 9) }), text: 'What will it say?',
          code: ['area = lambda w, h: w * h', 'print(area($a, $b), area(1, $b))'],
          explain: 'A lambda can take several parameters: $a * $b = $(a * b).',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 9) }), text: 'Lambdas are values too. What will it say?',
          code: ['spells = [lambda x: x + 1, lambda x: x * 10, lambda x: x ** 2]', 'print([s($n) for s in spells])'],
          explain: 'Each lambda in the list is called with $n.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(2, 9) }), text: 'Make a tiny squaring spell.',
          lines: ['square = [] n: n [] n', 'print(square($n))'], chips: ['lambda', '*', 'def', '+'], answer: [['lambda', '*']],
          hints: ['lambda parameter: expression', 'lambda n: n * n'],
        },
        {
          type: 'write', vars: R => ({ w: R.pick(FLOWERS) }), text: 'Make shout = a lambda that takes a word and returns it in capitals with "!" added. Print shout("$w").',
          starter: [], keys: ['shout', '=', 'lambda', 'w', ':', 'w.upper()', '+', '"!"', 'print', '(', ')', '"$w"'],
          require: l => (has(l, /lambda/) ? null : 'Use lambda.'),
          hints: ['shout = lambda w: w.upper() + "!"', 'print(shout("$w"))'],
          solution: ['shout = lambda w: w.upper() + "!"', 'print(shout("$w"))'],
        },
      ],
      learn: [{ title: 'lambda', code: 'double = lambda x: x * 2', text: 'A tiny nameless function: parameters, a colon, and one expression that is returned.' }],
    },
    {
      id: '16-4', title: 'Thorn sprites', bg: 'thorns', mentor: 'narrator', tags: [],
      foe: R => { const ps = R.sample([7, 11, 14, 18, 23], 3); return { kind: 'sprite', hp: Math.max(...ps), ps }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Thorn sprites zip between the brambles! Pick the strongest spell with max() and a key that tells it what to compare.' },
        {
          type: 'fill', vars: (R, c) => ({ ps: c.foe.ps }), text: 'The sprite has $HP HP. Cast the spell with the highest power.',
          lines: ['spells = [("ember", $(ps[0])), ("bolt", $(ps[1])), ("frost", $(ps[2]))]', 'best = max(spells, key=[] s: s[1])', 'cast(fireball, best[[]])'], chips: ['lambda', '1', '0', 'def'], answer: [['lambda', '1']],
          goal: { foeDown: true },
          hints: ['key=lambda s: s[1] compares by power.', 'The power is best[1].'],
        },
        { type: 'talk', who: 'narrator', text: 'A swarm of sprites rises from the roses!' },
        {
          type: 'write', vars: R => ({ ps: R.sample([3, 5, 8, 9, 12], 4) }), spawn: v => ({ kind: 'sprite', hp: v.ps.slice().sort((a, b) => b - a).slice(0, 2).reduce((a, b) => a + b, 0), tint: 'big' }),
          text: 'Sort spells by power from strongest to weakest, then cast fireball with the top two powers.',
          starter: ['spells = [("a", $(ps[0])), ("b", $(ps[1])), ("c", $(ps[2])), ("d", $(ps[3]))]'], keys: ['ranked', '=', 'sorted', '(', ')', 'spells', ',', 'key=lambda s: s[1]', 'reverse=True', 'for', 's', 'in', 'ranked[:2]', ':', 'cast', 'fireball', 's[1]'],
          goal: { foeDown: true },
          require: l => (has(l, /key\s*=/) ? null : 'Sort with key=lambda s: s[1].'),
          hints: ['ranked = sorted(spells, key=lambda s: s[1], reverse=True)', 'for s in ranked[:2]: / cast(fireball, s[1])'],
          solution: ['ranked = sorted(spells, key=lambda s: s[1], reverse=True)', 'for s in ranked[:2]:', '    cast(fireball, s[1])'],
        },
      ],
      learn: [{ title: 'max with a key', code: 'max(spells, key=lambda s: s[1])', text: 'key tells max, min and sorted what part of each item to compare.' }],
    },
    {
      id: '16-5', title: 'Sorting the beds', bg: 'garden', npc: 'seer', mentor: 'seer', tags: ['sortkey'],
      steps: [
        { type: 'talk', who: 'seer', text: 'sorted(words, key=len) sorts by length. key=str.lower ignores capitals. key=lambda p: p[1] sorts pairs by their second part. reverse=True flips it.' },
        {
          type: 'predict', vars: R => ({ ws: R.sample(['fig', 'lily', 'rose', 'iris', 'oak', 'tulip'], 4) }), text: 'Sorting by length. What will it say?',
          code: ['words = $(JSON.stringify(ws))', 'print(sorted(words, key=len))'],
          explain: 'Shortest first. Words of equal length keep their original order.',
        },
        {
          type: 'predict', vars: R => ({ ns: R.sample(Engine.NAMES, 3), ls: R.sample([3, 8, 12, 17, 21], 3) }), text: 'Pairs sorted by their second part. What will it say?',
          code: ['heroes = [("$(ns[0])", $(ls[0])), ("$(ns[1])", $(ls[1])), ("$(ns[2])", $(ls[2]))]', 'top = sorted(heroes, key=lambda h: h[1], reverse=True)', 'print(top[0][0], min(heroes, key=lambda h: h[1])[0])'],
          explain: 'Highest level first, and min with the same key finds the lowest.',
        },
        {
          type: 'predict', text: 'Capitals come first, unless... What will it say?',
          code: ['words = ["banana", "apple", "Cherry"]', 'print(sorted(words))', 'print(sorted(words, key=str.lower))'],
          explain: 'Plain sorting puts every capital letter before every small one, so Cherry jumps first. key=str.lower compares them as if all were small.',
        },
        {
          type: 'fill', vars: R => ({ ws: R.sample(FLOWERS, 4) }), text: 'Sort the flowers from longest name to shortest.',
          lines: ['beds = $(JSON.stringify(ws))', 'print(sorted(beds, key=[], reverse=[]))'], chips: ['len', 'True', 'False', 'str'], answer: [['len', 'True']],
          hints: ['key=len sorts by length.', 'reverse=True puts the longest first.'],
        },
        {
          type: 'write', vars: R => ({ ns: R.sample(Engine.NAMES, 3), gs: R.sample([4, 9, 15, 22, 30], 3) }), text: 'gold is a dict. Print the names sorted by how much gold they have, most first.',
          starter: ['gold = {"$(ns[0])": $(gs[0]), "$(ns[1])": $(gs[1]), "$(ns[2])": $(gs[2])}'], keys: ['print', '(', ')', 'sorted', 'gold', ',', 'key=', 'gold.get', 'lambda n: gold[n]', 'reverse=True'],
          require: l => (has(l, /sorted\(/) && has(l, /key\s*=/) ? null : 'Use sorted with a key.'),
          hints: ['sorted(gold) gives the names. key=lambda n: gold[n] sorts them by gold.', 'print(sorted(gold, key=lambda n: gold[n], reverse=True))'],
          solution: ['print(sorted(gold, key=lambda n: gold[n], reverse=True))'],
        },
      ],
      learn: [{ title: 'key=', code: 'sorted(xs, key=len)\nsorted(ps, key=lambda p: p[1], reverse=True)', text: 'Sort by any feature: length, a part of a pair, a lowercase version...' }],
    },
    {
      id: '16-6', title: 'Watering every bed', bg: 'garden', npc: 'gardener', mentor: 'gardener', tags: ['mapfilter'],
      steps: [
        { type: 'talk', who: 'gardener', text: 'map(f, items) applies f to every item. filter(f, items) keeps the items where f gives True. Both hand back a lazy object, so wrap them in list() to see everything.' },
        { type: 'demo', vars: R => ({ ws: R.sample(FLOWERS, 3) }), text: 'Run it.', code: ['beds = $(JSON.stringify(ws))', 'print(map(str.upper, beds))', 'print(list(map(str.upper, beds)))'] },
        {
          type: 'predict', vars: R => ({ xs: [R.int(1, 9), R.int(1, 9), R.int(1, 9)] }), text: 'What will it say?',
          code: ['nums = $(JSON.stringify(xs))', 'print(list(map(lambda n: n * 3, nums)))'],
          explain: 'Every number is tripled.',
        },
        {
          type: 'predict', vars: R => ({ ws: R.sample(['fig', 'lily', 'rose', 'oak', 'tulip', 'iris', 'ivy'], 5) }), text: 'What will it say?',
          code: ['plants = $(JSON.stringify(ws))', 'print(list(filter(lambda p: len(p) > 3, plants)))'],
          explain: 'filter keeps only the names longer than 3 letters.',
        },
        {
          type: 'predict', vars: R => ({ xs: [R.int(1, 5), R.int(1, 5), R.int(1, 5)] }), text: 'A map object can only be used once. What will it say?',
          code: ['m = map(lambda n: n + 1, $(JSON.stringify(xs)))', 'print(sum(m))', 'print(sum(m))'],
          explain: 'The first sum uses every item up. The second finds nothing left: 0.',
        },
        {
          type: 'fill', vars: R => ({ xs: [R.int(1, 20), R.int(1, 20), R.int(1, 20), R.int(1, 20)] }), text: 'Keep only the even heights.',
          lines: ['heights = $(JSON.stringify(xs))', 'print(list([](lambda h: h % 2 == 0, [])))'], chips: ['filter', 'heights', 'map', 'h'], answer: [['filter', 'heights']],
          hints: ['filter keeps items where the lambda is True.', 'filter(..., heights)'],
        },
        {
          type: 'write', vars: R => ({ xs: [R.int(1, 9), R.int(1, 9), R.int(1, 9)] }), text: 'Print the sum of the squares of nums, using map and a lambda.',
          starter: ['nums = $(JSON.stringify(xs))'], keys: ['print', '(', ')', 'sum', 'map', 'lambda n: n * n', ',', 'nums'],
          require: l => (has(l, /map\(/) && has(l, /lambda/) ? null : 'Use map with a lambda.'),
          hints: ['map(lambda n: n * n, nums) squares each one.', 'print(sum(map(lambda n: n * n, nums)))'],
          solution: ['print(sum(map(lambda n: n * n, nums)))'],
        },
      ],
      learn: [{ title: 'map and filter', code: 'list(map(f, xs))\nlist(filter(f, xs))', text: 'Apply a function to everything, or keep what passes a test. A list comprehension does both too.' }],
    },
    {
      id: '16-7', title: 'Side by side', bg: 'garden', npc: 'seer', mentor: 'seer', tags: ['zipq'],
      steps: [
        { type: 'talk', who: 'seer', text: 'zip(a, b) walks two lists side by side, giving pairs. It stops at the shorter one. any() asks "is at least one True?", all() asks "are all True?".' },
        { type: 'demo', vars: R => ({ ns: R.sample(Engine.NAMES, 3), hs: [R.int(10, 50), R.int(10, 50), R.int(10, 50)] }), text: 'Run it.', code: ['names = $(JSON.stringify(ns))', 'hp = $(JSON.stringify(hs))', 'for name, h in zip(names, hp):', '    print(f"{name}: {h}")'] },
        {
          type: 'predict', vars: R => ({ ws: R.sample(FLOWERS, 3) }), text: 'Uneven lists. What will it say?',
          code: ['print(list(zip($(JSON.stringify(ws)), [1, 2])))'],
          explain: 'zip stops when the shorter list runs out.',
        },
        {
          type: 'predict', vars: R => ({ ns: R.sample(Engine.NAMES, 2), ls: [R.int(1, 20), R.int(1, 20)] }), text: 'Building a dict from two lists. What will it say?',
          code: ['levels = dict(zip($(JSON.stringify(ns)), $(JSON.stringify(ls))))', 'print(levels["$(ns[1])"], len(levels))'],
          explain: 'Each name is paired with its level.',
        },
        {
          type: 'predict', vars: R => ({ xs: [R.int(1, 9), R.int(0, 1) ? 0 : R.int(1, 9), R.int(1, 9)] }), text: 'What will it say?',
          code: ['water = $(JSON.stringify(xs))', 'print(any(w == 0 for w in water), all(w > 0 for w in water))'],
          explain: 'any asks whether some bed is dry. all asks whether every bed has water.',
        },
        {
          type: 'fill', vars: R => ({ ws: R.sample(FLOWERS, 3) }), text: 'Number the beds from 1.',
          lines: ['for i, bed in [](  $(JSON.stringify(ws)), start=[]):'.replace('(  ', '('), '    print(i, bed)'], chips: ['enumerate', '1', 'zip', '0'], answer: [['enumerate', '1']],
          hints: ['enumerate gives a number with each item.', 'start=1 begins counting at 1.'],
        },
        {
          type: 'write', vars: R => ({ ws: R.sample(FLOWERS, 3), cs: R.sample(['red', 'blue', 'white', 'gold'], 3) }), text: 'Print each flower with its color, like "rose is red", using zip.',
          starter: ['flowers = $(JSON.stringify(ws))', 'colors = $(JSON.stringify(cs))'], keys: ['for', 'f', ',', 'c', 'in', 'zip', '(', ')', 'flowers', 'colors', ':', 'print', 'f"{f} is {c}"'],
          require: l => (has(l, /zip\(/) ? null : 'Use zip.'),
          hints: ['for f, c in zip(flowers, colors):', '    print(f"{f} is {c}")'],
          solution: ['for f, c in zip(flowers, colors):', '    print(f"{f} is {c}")'],
        },
      ],
      learn: [{ title: 'zip, any, all', code: 'for a, b in zip(xs, ys):\nany(...)  all(...)', text: 'Walk lists together; ask whether some, or every, item passes.' }],
    },
    {
      id: '16-8', title: 'The tangled grove', bg: 'thorns', mentor: 'narrator', tags: [],
      foe: R => ({ kind: 'sprite', hp: 70, weak: 'fireball', tint: 'big' }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'Vines knot together into a giant bramble sprite! Combine your garden tools to untangle the powers.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ xs: [R.int(1, 6), R.int(1, 6), R.int(1, 6), R.int(1, 6)] }), text: 'How much damage will this deal? Fireball is doubled.',
          code: ['seeds = $(JSON.stringify(xs))', 'for p in set(seeds):', '    cast(fireball, p)'],
          explain: 'Each different power is cast once: $([...new Set(xs)].reduce((a, b) => a + b, 0)), doubled.',
        },
        {
          type: 'fix', vars: R => ({ xs: [R.int(2, 5), R.int(2, 5), R.int(2, 5)] }), text: 'This casts nothing. Run it, then tap the broken line.',
          code: ['powers = $(JSON.stringify(xs))', 'boosted = map(lambda p: p * 2, powers)', 'total = sum(boosted)', 'again = sum(boosted)', 'cast(fireball, again)', 'print(again)'], bad: 3,
          options: ['again = total', 'again = sum(list(boosted))', 'again = boosted'], answer: 0,
          explain: 'A map can only be used once. The second sum got 0. Reuse the total instead.',
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Finish it! $HP HP left, fireball is doubled. Keep the powers above 5 with filter, and cast fireball with their sum. (That is more than enough.)',
          starter: ['powers = [1, 2, $(q + 6), 3]'], keys: ['strong', '=', 'filter', '(', ')', 'lambda p: p > 5', ',', 'powers', 'cast', 'fireball', 'sum'],
          goal: { foeDown: true },
          require: l => (has(l, /filter\(/) ? null : 'Use filter.'),
          hints: ['strong = filter(lambda p: p > 5, powers)', 'cast(fireball, sum(strong))'],
          solution: ['strong = filter(lambda p: p > 5, powers)', 'cast(fireball, sum(strong))'],
        },
      ],
      learn: [{ title: 'Lazy objects', code: 'm = map(...)  # use once\nlist(m)  # keep it', text: 'map, filter and zip give results one at a time and only once. Store them in a list to reuse.' }],
    },
    {
      id: '16-9', title: 'The Thorn Queen', bg: 'rosethrone', foe: { kind: 'thornqueen', hp: 240, weak: 'fireball', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'thornqueen', text: 'Who tramples my perfect, sorted rows? Every rose here is unique, and every thorn is mine.' },
        { type: 'talk', who: 'narrator', text: 'The Thorn Queen has 240 HP. Fireball burns her vines for double. Icebolt is halved.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ a: R.int(3, 7), b: R.int(8, 12) }), text: 'How much damage will this deal? Fireball is doubled.',
          code: ['petals = {$a, $b, $a}', 'cast(fireball, sum(petals) * len(petals))'],
          explain: 'The set holds $a and $b once each: ($a + $b) * 2 = $((a + b) * 2), doubled.',
        },
        {
          type: 'fill', vars: R => ({ ps: R.sample([6, 9, 13, 16], 3) }), text: 'Burn with the two strongest thorns.',
          lines: ['thorns = $(JSON.stringify(ps))', 'top = sorted(thorns, [])[:2]', 'cast(fireball, [](top))'], chips: ['reverse=True', 'key=len', 'sum', 'max'], answer: [['reverse=True', 'sum']],
          hints: ['Biggest first: reverse=True.', 'Add the two with sum.'],
        },
        { type: 'talk', who: 'thornqueen', text: 'My vines and roses, side by side, strike as one!' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ a: R.int(2, 5), b: R.int(2, 5) }), text: 'How much damage will this deal?',
          code: ['vines = [$a, $b]', 'roses = [2, 3, 4]', 'for v, r in zip(vines, roses):', '    cast(fireball, v * r)'],
          explain: 'zip pairs $a with 2 and $b with 3: $(2 * a + 3 * b), doubled.',
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Final blow! $HP HP left, fireball is doubled. Make burn = lambda p: cast(fireball, p), then call burn($q).',
          starter: [], keys: ['burn', '=', 'lambda', 'p', ':', 'cast', '(', ')', 'fireball', ',', 'burn($q)'],
          goal: { foeDown: true },
          require: l => (has(l, /lambda/) ? null : 'Make burn with lambda.'),
          hints: ['burn = lambda p: cast(fireball, p)', 'burn($q)'],
          solution: ['burn = lambda p: cast(fireball, p)', 'burn($q)'],
        },
        { type: 'talk', who: 'thornqueen', text: 'The garden... grows wild again. Perhaps... that is better.' },
      ],
      learn: [{ title: 'Garden toolkit', code: 'set  | & -  lambda  key=\nmap  filter  zip  any  all', text: 'Python\'s tools for working with whole collections at once.' }],
    },
  ],
};
WORLDS.push(WORLD16);
