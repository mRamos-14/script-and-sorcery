/* World 10: The Prism Gardens. Sets: no duplicates, set() vs {}, adding and removing,
   fast membership, union, intersection, difference, symmetric difference, subsets,
   frozenset, set comprehensions and the "seen" pattern. Sources: Py4E, plus our own.
   Sets of words print in a random order in real Python, so every answer prints sorted(). */
Object.assign(EXTRA.npcs, {
  iris: { name: 'Petal-keeper Iris', colors: ['#b04f8f', '#e2b34a', '#fbd9b8'] },
});
Object.assign(EXTRA.foes, {
  prismslime: { base: 'slime', name: 'Prism slime', pal: { G: '#9a7fd6', L: '#ffd7f5', D: '#3f8f8f', M: '#2a1a4a' } },
  thornwisp: { base: 'wisp', name: 'Thorn wisp', pal: { F: '#4f9a3f', L: '#c4f5a8' } },
  prismhydra: { base: 'hydra', name: 'The Prism Hydra' },
});
const PRISM_FLOWERS = ['rose', 'lily', 'iris', 'tulip', 'daisy', 'orchid', 'poppy'];

const WORLD10 = {
  id: 10, name: 'The Prism Gardens', topic: 'sets and set operations',
  nodes: [[50, 92], [28, 82], [68, 72], [32, 62], [66, 52], [30, 41], [64, 31], [40, 20], [54, 8]],
  levels: [
    {
      id: '10-1', title: 'One of each', bg: 'garden', npc: 'iris', mentor: 'iris', tags: ['setbasics'],
      steps: [
        { type: 'talk', who: 'iris', text: "Welcome to the Prism Gardens, {NAME}. I'm Iris. In my garden every flower grows once. A set is a collection with NO duplicates and no order: {1, 2, 2, 3} is just {1, 2, 3}." },
        { type: 'talk', who: 'iris', text: 'Because sets have no order, the same set can print in a different order each run. That is why we usually print sorted(my_set), which gives a tidy list.' },
        { type: 'demo', vars: R => ({ f: R.sample(PRISM_FLOWERS, 3) }), text: 'Run it.', code: ['beds = ["$(f[0])", "$(f[1])", "$(f[0])", "$(f[2])", "$(f[1])"]', 'unique = set(beds)', 'print(len(beds), len(unique))', 'print(sorted(unique))'] },
        {
          type: 'predict', vars: R => { const a = R.int(1, 5); return { a, b: a + R.int(1, 3) }; },
          text: 'What will it say?', code: ['print(len({$a, $b, $a, $b, $a}))'],
          wrong: ['5', '1', '3'],
          explain: 'Duplicates vanish: only $a and $b are left.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['banana', 'mississippi', 'balloon', 'committee']) }),
          text: 'A set of letters. What will it say?', code: ['letters = set("$w")', 'print(len(letters))'],
          explain: '"$w" has $(new Set(w).size) different letters.',
        },
        { type: 'talk', who: 'iris', text: 'One trap: {} is an EMPTY DICTIONARY, not an empty set. For an empty set, write set().' },
        {
          type: 'predict', vars: R => R.pick([{ c: '{}' }, { c: 'set()' }, { c: '{1}' }]),
          text: 'What will it say?', code: ['print(type($c))'],
          wrong: ["<class 'dict'>", "<class 'set'>", "<class 'list'>"],
          explain: 'Empty curly braces make a dict. set() makes an empty set.',
        },
        {
          type: 'fill', vars: R => ({ f: R.sample(PRISM_FLOWERS, 2) }),
          text: 'Count how many DIFFERENT flowers were planted.',
          lines: ['planted = ["$(f[0])", "$(f[1])", "$(f[0])", "$(f[0])"]', 'print(len([](planted)))'], chips: ['set', 'list', 'sorted'], answer: [['set']],
          hints: ['Duplicates should not count.', 'len(set(planted))'],
        },
        {
          type: 'write', vars: R => ({ n: [R.int(1, 5), R.int(1, 5), R.int(1, 5), R.int(1, 5), R.int(1, 5), R.int(1, 5)] }),
          text: 'Print the different numbers in rolls, as a sorted list.',
          starter: ['rolls = $(JSON.stringify(n))'], keys: ['print', 'sorted', 'set', '(', ')', 'rolls'],
          require: l => (has(l, /set\s*\(\s*rolls\s*\)/) ? null : 'Turn rolls into a set first.'),
          hints: ['set(rolls) removes repeats; sorted() makes a tidy list.', 'print(sorted(set(rolls)))'],
          solution: ['print(sorted(set(rolls)))'],
        },
      ],
      learn: [
        { title: 'Sets', code: 's = {1, 2, 2, 3}   → {1, 2, 3}\nset("aab")         → {"a", "b"}\nset()              # empty set\n{}                 # empty DICT!', text: 'A set holds each value once, with no order. Print sorted(s) for a tidy result.' },
      ],
    },
    {
      id: '10-2', title: 'Tending the beds', bg: 'grove', npc: 'iris', mentor: 'iris', tags: ['setmod'],
      steps: [
        { type: 'talk', who: 'iris', text: 'add() plants one item. remove() pulls one out, but crashes with KeyError if it is not there. discard() pulls it out quietly, even if it is missing.' },
        { type: 'demo', vars: R => ({ f: R.sample(PRISM_FLOWERS, 3) }), text: 'Run it.', code: ['bed = {"$(f[0])", "$(f[1])"}', 'bed.add("$(f[2])")', 'bed.add("$(f[0])")', 'bed.discard("$(f[1])")', 'print(sorted(bed))'] },
        {
          type: 'predict', vars: R => ({ f: R.sample(PRISM_FLOWERS, 3) }),
          text: 'What will it say?', code: ['bed = {"$(f[0])", "$(f[1])"}', 'bed.add("$(f[1])")', 'bed.add("$(f[2])")', 'print(len(bed))'],
          explain: 'Adding "$(f[1])" again does nothing: it is already there.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ f: R.sample(PRISM_FLOWERS, 3) }),
          text: 'Which error?', code: ['bed = {"$(f[0])", "$(f[1])"}', 'bed.remove("$(f[2])")'],
          explain: '"$(f[2])" is not in the set, so remove raises KeyError. discard would have stayed quiet.',
        },
        { type: 'talk', who: 'iris', text: 'Checking "x in my_set" is lightning fast, even for millions of items, because sets find things by hash instead of looking at every item. That is the main reason programmers reach for sets.' },
        {
          type: 'predict', vars: R => ({ f: R.sample(PRISM_FLOWERS, 4), k: R.pick([0, 3]) }),
          text: 'What will it say?', code: ['allowed = {"$(f[0])", "$(f[1])", "$(f[2])"}', 'print("$(f[k])" in allowed)'],
          explain: 'in checks whether the value is a member of the set.',
        },
        {
          type: 'fill', vars: R => ({ f: R.sample(PRISM_FLOWERS, 3) }),
          text: 'Pull out a flower that might not be there, without any crash.',
          lines: ['bed = {"$(f[0])", "$(f[1])"}', 'bed.[]("$(f[2])")', 'print(sorted(bed))'], chips: ['discard', 'remove', 'add'], answer: [['discard']],
          hints: ['One of them never complains.', 'bed.discard("$(f[2])")'],
        },
        {
          type: 'write', vars: R => ({ f: R.sample(PRISM_FLOWERS, 4) }),
          text: 'Plant "$(f[3])" in the bed, take out "$(f[0])", then print the bed sorted.',
          starter: ['bed = {"$(f[0])", "$(f[1])", "$(f[2])"}'], keys: ['bed', '.add', '.remove', '.discard', '(', ')', '"$(f[3])"', '"$(f[0])"', 'print', 'sorted'],
          require: l => (has(l, /\.add\s*\(/) ? null : 'Use bed.add(...) to plant.'),
          hints: ['bed.add("$(f[3])") and bed.discard("$(f[0])")', 'Then print(sorted(bed))'],
          solution: ['bed.add("$(f[3])")', 'bed.discard("$(f[0])")', 'print(sorted(bed))'],
        },
      ],
      learn: [{ title: 'Changing a set', code: 's.add(x)\ns.remove(x)   # KeyError if missing\ns.discard(x)  # never crashes\nx in s        # very fast', text: 'Sets grow and shrink, and checking membership is fast.' }],
    },
    {
      id: '10-3', title: 'Shared roots', bg: 'garden', npc: 'iris', mentor: 'iris', tags: ['setunion'],
      steps: [
        { type: 'talk', who: 'iris', text: 'Two gardens, two sets. a | b is the UNION: everything in either. a & b is the INTERSECTION: only what both share. The methods a.union(b) and a.intersection(b) do the same.' },
        { type: 'demo', text: 'Run it.', code: ['north = {"rose", "lily", "iris"}', 'south = {"lily", "tulip"}', 'print(sorted(north | south))', 'print(sorted(north & south))'] },
        {
          type: 'predict', vars: R => { const a = R.sample([1, 2, 3, 4, 5, 6], 3), b = R.sample([3, 4, 5, 6, 7], 3); return { a, b }; },
          text: 'What will it say?', code: ['a = {$(a.join(", "))}', 'b = {$(b.join(", "))}', 'print(sorted(a & b))'],
          explain: 'Only numbers that are in both sets.',
        },
        {
          type: 'predict', vars: R => { const a = R.sample([1, 2, 3, 4, 5, 6], 3), b = R.sample([3, 4, 5, 6, 7], 3); return { a, b }; },
          text: 'What will it say?', code: ['a = {$(a.join(", "))}', 'b = {$(b.join(", "))}', 'print(len(a | b))'],
          explain: 'Every number from either set, each counted once.',
        },
        {
          type: 'predict', vars: R => ({ f: R.sample(PRISM_FLOWERS, 4) }),
          text: 'Who liked both? What will it say?', code: ['ada = {"$(f[0])", "$(f[1])", "$(f[2])"}', 'wren = {"$(f[2])", "$(f[3])", "$(f[0])"}', 'print(sorted(ada.intersection(wren)))'],
          explain: 'intersection keeps the flowers in both sets.',
        },
        {
          type: 'fill', vars: R => ({ f: R.sample(PRISM_FLOWERS, 4) }),
          text: 'Make one big catalogue with every flower from both gardens.',
          lines: ['east = {"$(f[0])", "$(f[1])"}', 'west = {"$(f[1])", "$(f[2])", "$(f[3])"}', 'print(sorted(east [] west))'], chips: ['|', '&', '+'], answer: [['|']],
          hints: ['Everything in either: the union.', 'east | west'],
        },
        {
          type: 'fix', vars: R => ({ f: R.sample(PRISM_FLOWERS, 4) }),
          text: 'This should list the flowers BOTH gardeners grow. Run it, then tap the broken line.',
          code: ['moss = {"$(f[0])", "$(f[1])", "$(f[2])"}', 'iris = {"$(f[1])", "$(f[2])", "$(f[3])"}', 'print(sorted(moss | iris))'], bad: 2,
          options: ['print(sorted(moss & iris))', 'print(sorted(moss + iris))', 'print(sorted(moss and iris))'], answer: 0,
          explain: 'Both means the intersection: &.',
        },
        {
          type: 'write', vars: R => ({ a: R.sample(['ada', 'wren', 'tam', 'mira', 'brin'], 3), b: R.sample(['ada', 'wren', 'tam', 'mira', 'brin'], 3) }),
          text: 'Print a sorted list of the people who came to BOTH feasts.',
          starter: ['spring = {$(a.map(x => JSON.stringify(x)).join(", "))}', 'autumn = {$(b.map(x => JSON.stringify(x)).join(", "))}'], keys: ['print', 'sorted', '(', ')', 'spring', 'autumn', '&'],
          require: l => (has(l, /&|intersection/) ? null : 'Use & (intersection).'),
          hints: ['Both feasts: spring & autumn', 'print(sorted(spring & autumn))'],
          solution: ['print(sorted(spring & autumn))'],
        },
      ],
      learn: [{ title: 'Union and intersection', code: 'a | b   # in either\na & b   # in both', text: 'Combine sets or find what they share.' }],
    },
    {
      id: '10-4', title: 'Prism slimes', bg: 'glade', mentor: 'narrator', tags: [],
      foe: R => { const k = R.int(6, 9), p = R.int(4, 6); return { kind: 'prismslime', hp: k + 3 * p * 2, k, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Prism slimes split light into colours! $HP HP. Only DIFFERENT colours hurt them.' },
        { type: 'demo', vars: (R, c) => ({ k: c.foe.k }), text: 'A spark worth $k.', code: ['cast(spark, $k)'] },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p * 2 }),
          text: 'It has $HP HP left. Cast fireball with the number of DIFFERENT colours times $p.',
          lines: ['colors = ["red", "blue", "red", "green", "blue"]', 'cast(fireball, len([](colors)) * $p)'], chips: ['set', 'list', 'sorted'], answer: [['set']],
          goal: { foeDown: true },
          require: s => (s[0] === 'set' ? null : 'That counts repeats too. Only different colours count.'),
          hints: ['Different colours: remove repeats.', 'len(set(colors))'],
        },
        { type: 'talk', who: 'narrator', text: 'A giant prism slime! It only fears colours that BOTH of your crystals hold.' },
        {
          type: 'write', vars: R => { const p = R.int(6, 9); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'prismslime', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Cast icebolt with the number of colours both crystals share, times $p.',
          starter: ['left = {"red", "gold", "blue"}', 'right = {"blue", "green", "gold"}'], keys: ['cast', 'icebolt', '(', ')', ',', 'len', 'left', 'right', '&', '*', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /left\s*&\s*right|right\s*&\s*left|intersection/) ? null : 'Use left & right.'),
          hints: ['They share gold and blue.', 'cast(icebolt, len(left & right) * $p)'],
          solution: ['cast(icebolt, len(left & right) * $p)'],
        },
      ],
      learn: [{ title: 'Counting different things', code: 'len(set(items))', text: 'The number of different values in a list.' }],
    },
    {
      id: '10-5', title: 'Weeding out', bg: 'grove', npc: 'iris', mentor: 'iris', tags: ['setdiff'],
      steps: [
        { type: 'talk', who: 'iris', text: 'a - b is the DIFFERENCE: what a has that b does not. Order matters: a - b and b - a are different. a ^ b is the SYMMETRIC difference: in one or the other, but not both.' },
        { type: 'demo', text: 'Run it.', code: ['mine = {"rose", "lily", "iris"}', 'yours = {"lily", "tulip"}', 'print(sorted(mine - yours))', 'print(sorted(yours - mine))', 'print(sorted(mine ^ yours))'] },
        {
          type: 'predict', vars: R => { const a = R.sample([1, 2, 3, 4, 5, 6], 4), b = R.sample([2, 3, 4, 5, 6, 7], 3); return { a, b }; },
          text: 'What will it say?', code: ['a = {$(a.join(", "))}', 'b = {$(b.join(", "))}', 'print(sorted(a - b))'],
          explain: 'Numbers in a that are not in b.',
        },
        {
          type: 'predict', vars: R => { const a = R.sample([1, 2, 3, 4, 5, 6], 4), b = R.sample([2, 3, 4, 5, 6, 7], 3); return { a, b }; },
          text: 'What will it say?', code: ['a = {$(a.join(", "))}', 'b = {$(b.join(", "))}', 'print(sorted(a ^ b))'],
          explain: 'In exactly one of the two sets.',
        },
        {
          type: 'predict', vars: R => ({ f: R.sample(PRISM_FLOWERS, 4) }),
          text: 'What still needs planting? What will it say?', code: ['wanted = {"$(f[0])", "$(f[1])", "$(f[2])"}', 'have = {"$(f[1])", "$(f[3])"}', 'print(sorted(wanted.difference(have)))'],
          explain: 'difference keeps what is wanted but not yet had.',
        },
        {
          type: 'fill', vars: R => ({ f: R.sample(PRISM_FLOWERS, 4) }),
          text: 'List the flowers on the order that are NOT in stock.',
          lines: ['order = {"$(f[0])", "$(f[1])", "$(f[2])"}', 'stock = {"$(f[1])", "$(f[3])"}', 'print(sorted(order [] stock))'], chips: ['-', '&', '|', '^'], answer: [['-']],
          hints: ['Take away what is in stock.', 'order - stock'],
        },
        {
          type: 'fix', vars: R => ({ f: R.sample(PRISM_FLOWERS, 4) }),
          text: 'This should show what the club has that the shop does not. Run it, then tap the broken line.',
          code: ['club = {"$(f[0])", "$(f[1])", "$(f[2])"}', 'shop = {"$(f[1])", "$(f[3])"}', 'print(sorted(shop - club))'], bad: 2,
          options: ['print(sorted(club - shop))', 'print(sorted(club & shop))', 'print(sorted(club ^ shop))'], answer: 0,
          explain: 'a - b keeps what a has and b lacks, so the club comes first.',
        },
        {
          type: 'write', vars: R => ({ a: R.sample(['ada', 'wren', 'tam', 'mira', 'brin'], 3), b: R.sample(['ada', 'wren', 'tam', 'mira', 'brin'], 3) }),
          text: 'Print a sorted list of people who came to exactly ONE of the two feasts.',
          starter: ['spring = {$(a.map(x => JSON.stringify(x)).join(", "))}', 'autumn = {$(b.map(x => JSON.stringify(x)).join(", "))}'], keys: ['print', 'sorted', '(', ')', 'spring', 'autumn', '^'],
          require: l => (has(l, /\^|symmetric_difference/) ? null : 'Use ^ (symmetric difference).'),
          hints: ['One or the other, not both: ^', 'print(sorted(spring ^ autumn))'],
          solution: ['print(sorted(spring ^ autumn))'],
        },
      ],
      learn: [{ title: 'Difference', code: 'a - b   # in a, not b\na ^ b   # in exactly one', text: 'Take away, or find what is not shared.' }],
    },
    {
      id: '10-6', title: 'Inside the walls', bg: 'garden', npc: 'iris', mentor: 'iris', tags: ['subset'],
      steps: [
        { type: 'talk', who: 'iris', text: 'a <= b asks: is every item of a also in b? That is a SUBSET. a >= b asks the opposite: superset. a.isdisjoint(b) asks: do they share nothing at all?' },
        { type: 'demo', text: 'Run it.', code: ['herbs = {"mint", "sage"}', 'garden = {"mint", "sage", "rose"}', 'print(herbs <= garden)', 'print(garden >= herbs)', 'print(herbs.isdisjoint({"rose"}))'] },
        {
          type: 'predict', vars: R => R.pick([{ a: '{1, 2}', b: '{1, 2, 3}' }, { a: '{1, 4}', b: '{1, 2, 3}' }, { a: '{2, 3}', b: '{3, 2}' }]),
          text: 'What will it say?', code: ['print($a <= $b)'],
          explain: 'True only if every item on the left is also on the right.',
        },
        {
          type: 'predict', vars: R => R.pick([{ a: '{1, 2, 3}', b: '{3, 2, 1}' }, { a: '{1, 2}', b: '{1, 2, 2}' }, { a: '{1, 2}', b: '{2, 3}' }]),
          text: 'Order and repeats do not matter. What will it say?', code: ['print($a == $b)'],
          explain: 'Sets are equal when they hold the same items, in any order.',
        },
        { type: 'talk', who: 'iris', text: 'A set can only hold things that never change. A set inside a set crashes. For that, freeze it: frozenset({1, 2}) is a set that can never change, so it CAN go inside another set or be a dictionary key.' },
        {
          type: 'predict', measure: 'errtype', text: 'A set of sets. Which error?', code: ['groups = {{1, 2}, {3}}'],
          explain: 'Normal sets can change, so they are unhashable: TypeError.',
        },
        {
          type: 'predict', text: 'Frozen this time. What will it say?', code: ['groups = {frozenset({1, 2}), frozenset({2, 1}), frozenset({3})}', 'print(len(groups))'],
          wrong: ['3', 'Error', '2 1'],
          explain: 'frozenset({1, 2}) and frozenset({2, 1}) are the same set, so only two groups remain.',
        },
        {
          type: 'fill', vars: R => ({ f: R.sample(PRISM_FLOWERS, 4) }),
          text: 'Check whether every flower on the list is in stock.',
          lines: ['needed = {"$(f[0])", "$(f[1])"}', 'stock = {"$(f[0])", "$(f[1])", "$(f[2])"}', 'print(needed [] stock)'], chips: ['<=', '>=', '=='], answer: [['<=']],
          hints: ['Is needed inside stock?', 'needed <= stock'],
        },
        {
          type: 'write', vars: R => ({ f: R.sample(PRISM_FLOWERS, 4) }),
          text: 'Print whether the two beds share NO flowers at all.',
          starter: ['left = {"$(f[0])", "$(f[1])"}', 'right = {"$(f[2])", "$(f[3])"}'], keys: ['print', '(', ')', 'left', 'right', '.isdisjoint'],
          require: l => (has(l, /isdisjoint/) ? null : 'Use left.isdisjoint(right).'),
          hints: ['There is a method for "nothing in common".', 'print(left.isdisjoint(right))'],
          solution: ['print(left.isdisjoint(right))'],
        },
      ],
      learn: [
        { title: 'Subsets', code: 'a <= b          # subset\na >= b          # superset\na.isdisjoint(b) # nothing shared', text: 'Questions about whole sets at once.' },
        { title: 'frozenset', code: 'frozenset({1, 2})', text: 'A set that can never change, so it can live inside another set.' },
      ],
    },
    {
      id: '10-7', title: 'Seen before', bg: 'grove', npc: 'iris', mentor: 'iris', tags: ['setcomp'],
      steps: [
        { type: 'talk', who: 'iris', text: 'Set comprehensions work like list ones, with curly braces: {x % 3 for x in range(10)}. Duplicates fall away by themselves.' },
        { type: 'demo', text: 'Run it.', code: ['words = ["Rose", "rose", "LILY", "lily", "Iris"]', 'print(sorted({w.lower() for w in words}))'] },
        {
          type: 'predict', vars: R => ({ n: R.int(6, 12), m: R.pick([2, 3, 4]) }),
          text: 'What will it say?', code: ['print(sorted({x % $m for x in range($n)}))'],
          explain: 'Remainders after dividing by $m can only be 0 to $(m - 1).',
        },
        { type: 'talk', who: 'iris', text: 'Here is a pattern every gardener uses: keep a "seen" set while you walk a list. It removes duplicates but KEEPS the original order, which set() alone cannot do.' },
        {
          type: 'predict', vars: R => ({ f: R.sample(PRISM_FLOWERS, 3) }),
          text: 'What will it say?', code: ['seen = set()', 'for f in ["$(f[0])", "$(f[1])", "$(f[0])", "$(f[2])", "$(f[1])"]:', '    if f not in seen:', '        print(f)', '        seen.add(f)'],
          explain: 'Each flower is printed the first time it appears, then remembered.',
        },
        {
          type: 'fill', vars: R => ({ f: R.sample(PRISM_FLOWERS, 3) }),
          text: 'Print only the FIRST time each visitor appears, in order.',
          lines: ['seen = set()', 'for v in ["$(f[0])", "$(f[1])", "$(f[0])", "$(f[2])"]:', '    if v [] seen:', '        print(v)', '        seen.[](v)'], chips: ['not in', 'in', 'add', 'discard'], answer: [['not in', 'add']],
          hints: ['Print only if not seen yet, then remember it.', 'if v not in seen: ... seen.add(v)'],
        },
        {
          type: 'fix', vars: R => ({ f: R.sample(PRISM_FLOWERS, 3) }),
          text: 'This should print each flower once, in order. It prints them all. Run it, then tap the broken line.',
          code: ['seen = set()', 'for f in ["$(f[0])", "$(f[1])", "$(f[0])", "$(f[2])"]:', '    if f not in seen:', '        print(f)'], bad: 3,
          options: ['        print(f); seen.add(f)', '        seen.add(f)', '        print(seen)'], answer: 0,
          explain: 'Nothing was ever added to seen, so every flower looked new.',
        },
        {
          type: 'write', vars: R => ({ w: R.pick(['banana', 'balloon', 'committee', 'mississippi']) }),
          text: 'Print a sorted list of the different vowels in word, using a set comprehension.',
          starter: ['word = "$w"'], keys: ['print', 'sorted', '(', ')', '{', '}', 'c', 'for', 'in', 'word', 'if', '"aeiou"'],
          require: l => (has(l, /\{\s*\w+\s+for\s+/) ? null : 'Use a set comprehension: {c for c in word if ...}.'),
          hints: ['{c for c in word if c in "aeiou"}', 'print(sorted({c for c in word if c in "aeiou"}))'],
          solution: ['print(sorted({c for c in word if c in "aeiou"}))'],
        },
      ],
      learn: [
        { title: 'Set comprehension', code: '{x % 3 for x in nums}', text: 'Builds a set; repeats disappear.' },
        { title: 'The seen pattern', code: 'seen = set()\nfor x in items:\n    if x not in seen:\n        seen.add(x)', text: 'Remove duplicates while keeping the order.' },
      ],
    },
    {
      id: '10-8', title: 'Thorn wisps', bg: 'thorns', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(5, 9), p = R.int(4, 7); return { kind: 'thornwisp', hp: d + 2 * p, d, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Thorn wisps rise from the brambles! $HP HP. They fear the runes they do not already carry.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark worth $d.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p }),
          text: 'It has $HP HP left. Cast fireball with the number of YOUR runes it does not carry, times $p.',
          lines: ['mine = {"ka", "zo", "mi", "ru"}', 'theirs = {"zo", "ru", "te"}', 'cast(fireball, len(mine [] theirs) * $p)'], chips: ['-', '&', '|'], answer: [['-']],
          goal: { foeDown: true },
          require: s => (s[0] === '-' ? null : 'Count only the runes you have and it lacks: mine - theirs.'),
          hints: ['Your runes, minus theirs.', 'len(mine - theirs)'],
        },
        { type: 'talk', who: 'narrator', text: 'The thorn queen! She fears runes held by exactly one of you.' },
        {
          type: 'write', vars: R => { const p = R.int(5, 8); return { p, hp: 4 * p }; },
          spawn: v => ({ kind: 'thornwisp', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Cast spark with the size of the symmetric difference times $p.',
          starter: ['mine = {"ka", "zo", "mi"}', 'hers = {"zo", "te", "lu"}'], keys: ['cast', 'spark', '(', ')', ',', 'len', 'mine', 'hers', '^', '*', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /\^|symmetric_difference/) ? null : 'Use mine ^ hers.'),
          hints: ['ka, mi, te and lu: four runes.', 'cast(spark, len(mine ^ hers) * $p)'],
          solution: ['cast(spark, len(mine ^ hers) * $p)'],
        },
      ],
      learn: [{ title: 'Sets in battle', code: 'len(a - b)  len(a ^ b)', text: 'Counting what is different is a set job.' }],
    },
    {
      id: '10-9', title: 'The Prism Hydra', bg: 'skytemple', foe: { kind: 'prismhydra', hp: 170, weak: 'spark', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'prismhydra', text: 'MANY... HEADS... ONE... OF... EACH...' },
        { type: 'talk', who: 'narrator', text: 'The Prism Hydra has 170 HP. Spark shatters prisms: double damage. Icebolt barely chills it: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ s: R.pick(['banana', 'balloon', 'parrot', 'mammoth']) }),
          text: 'How much damage? Spark is doubled.', code: ['cast(spark, len(set("$s")))'],
          explain: '"$s" has $(new Set(s).size) different letters, doubled.',
        },
        {
          type: 'fix', vars: R => ({ f: R.sample(PRISM_FLOWERS, 3) }),
          text: 'This should count the different heads and strike. Run it, then tap the broken line.',
          code: ['heads = ["$(f[0])", "$(f[1])", "$(f[0])", "$(f[2])", "$(f[1])"]', 'count = len(heads)', 'print(count)', 'cast(spark, count)'], bad: 1,
          options: ['count = len(set(heads))', 'count = set(len(heads))', 'count = len(heads) - 1'], answer: 0,
          explain: 'set() removes the repeated head before counting.',
        },
        { type: 'talk', who: 'prismhydra', text: 'WHICH... HEADS... DO... WE... SHARE...' },
        {
          type: 'fill', vars: R => ({}),
          text: 'Strike with spark: 3 times the number of colours the two heads share.',
          lines: ['left = {"red", "gold", "teal", "plum"}', 'right = {"gold", "plum", "sky"}', 'cast(spark, len(left [] right) * 3)'], chips: ['&', '|', '-'], answer: [['&']],
          hints: ['Shared means in both.', 'left & right'],
        },
        {
          type: 'write', vars: (R, c) => ({ v: Math.floor(c.foe.hp / 2) + 1 }),
          text: 'Final blow! Spark is doubled, so you need $v power. Build a set of the numbers 1 to $v with set(range(1, $(v + 1))), and cast spark with its length.',
          starter: [], keys: ['power', '=', 'len', 'set', 'range', '(', ')', ',', '1', '$(v + 1)', 'cast', 'spark'],
          goal: { foeDown: true },
          require: l => (has(l, /set\s*\(\s*range/) ? null : 'Use set(range(...)).'),
          hints: ['power = len(set(range(1, $(v + 1))))', 'cast(spark, power)'],
          solution: ['power = len(set(range(1, $(v + 1))))', 'cast(spark, power)'],
        },
        { type: 'talk', who: 'prismhydra', text: '...every... colour... fades...' },
      ],
      learn: [{ title: 'Set toolkit', code: 'set()  add  discard  in  |  &  -  ^  <=  frozenset', text: 'Everything from the Prism Gardens.' }],
    },
  ],
};
WORLDS.push(WORLD10);

(() => {
  const { makeQ, pick, rnd, shuffle } = Arena;
  const F = ['rose', 'lily', 'iris', 'tulip', 'daisy'];
  const nums = n => shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, n);
  const lit = a => '{' + a.join(', ') + '}';
  Object.assign(Arena.GEN, {
    setbasics: () => {
      const v = rnd(0, 2);
      if (v === 0) { const a = rnd(1, 4); return makeQ([`print(len({${a}, ${a + 1}, ${a}, ${a}}))`], [4, 1]); }
      if (v === 1) return makeQ(['print(type({}))'], ["<class 'set'>", "<class 'list'>"]);
      const w = pick(['banana', 'balloon', 'parrot']); return makeQ([`print(len(set("${w}")))`], [w.length, new Set(w).size + 1]);
    },
    setmod: () => {
      const [a, b, c] = shuffle(F);
      return rnd(0, 1) === 0
        ? makeQ([`s = {"${a}", "${b}"}`, `s.add("${a}")`, 'print(len(s))'], [3, 1])
        : makeQ([`s = {"${a}", "${b}"}`, `s.remove("${c}")`, 'print(len(s))'], [2, 1]);
    },
    setunion: () => {
      const a = nums(3), b = nums(3);
      return rnd(0, 1) === 0 ? makeQ([`print(sorted(${lit(a)} & ${lit(b)}))`], [JSON.stringify([...new Set([...a, ...b])].sort((x, y) => x - y)).replace(/,/g, ', '), '[]']) : makeQ([`print(len(${lit(a)} | ${lit(b)}))`], [6, a.filter(x => b.includes(x)).length]);
    },
    setdiff: () => {
      const a = nums(4), b = nums(3);
      return rnd(0, 1) === 0 ? makeQ([`print(sorted(${lit(a)} - ${lit(b)}))`], [JSON.stringify(b.filter(x => !a.includes(x)).sort((x, y) => x - y)).replace(/,/g, ', '), '[]']) : makeQ([`print(len(${lit(a)} ^ ${lit(b)}))`], [7, a.filter(x => b.includes(x)).length]);
    },
    subset: () => {
      const v = rnd(0, 2);
      if (v === 0) return makeQ(['print({1, 2} <= {1, 2, 3})'], ['False', 'Error']);
      if (v === 1) return makeQ(['print({3, 1, 2} == {1, 2, 3})'], ['False', 'Error']);
      return makeQ(['print({1, 2}.isdisjoint({2, 3}))'], ['True', 'Error']);
    },
    setcomp: () => {
      const m = pick([2, 3, 4]), n = rnd(6, 10);
      return makeQ([`print(len({x % ${m} for x in range(${n})}))`], [n, m - 1]);
    },
  });
})();
