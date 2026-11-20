/* World 48: The Loom of Fate. itertools: endless iterators (count, cycle, repeat) tamed with
   islice; chain and from_iterable; zip_longest; accumulate, pairwise, batched and starmap;
   the combinatoric looms (product, permutations, combinations); groupby and its two traps;
   takewhile, dropwhile, compress, filterfalse and tee; lazy pipelines.
   Source: our own (the itertools docs and recipes; MIT 6.100L's enumeration problems). */
Object.assign(EXTRA.npcs, {
  moira: { name: 'Weaver Moira', colors: ['#5a3f9a', '#e0d4ff', '#ecb98d'] },
});
Object.assign(EXTRA.foes, {
  knotworm: { base: 'bookworm', name: 'Knot worm', pal: { G: '#7d4fc9', L: '#c79bff' } },
  spindlebat: { base: 'paperbat', name: 'Spindle bat', pal: { P: '#c79bff' } },
  fateweaver: { base: 'sphinx', name: 'The Fate Weaver', pal: {} },
});

const WORLD48 = {
  id: 48, name: 'The Loom of Fate', topic: 'itertools',
  nodes: [[50, 92], [28, 82], [64, 72], [36, 62], [68, 52], [38, 42], [62, 32], [36, 21], [52, 8]],
  levels: [
    {
      id: '48-1', title: 'Endless threads', bg: 'observatory', npc: 'moira', mentor: 'moira', tags: ['infiniteit'],
      steps: [
        { type: 'talk', who: 'moira', text: 'Sit by my loom, {NAME}. itertools spins ITERATORS: lazy streams that make one item at a time, only when asked. Some never end: count(start, step) counts forever, cycle(items) repeats a sequence forever, repeat(x) gives x forever (or n times).' },
        { type: 'talk', who: 'moira', text: 'An endless thread is safe as long as something stops it: a break, zip with a finite list, or islice(it, n), which takes just the first n items. Never call list() on an endless one!' },
        { type: 'demo', text: 'Endless, but tamed. Run it.', code: ['from itertools import count, cycle, repeat, islice', 'print(list(islice(count(10, 5), 4)))', 'print(list(islice(cycle("ab"), 5)))', 'print(list(repeat("x", 3)))', 'for n, name in zip(count(1), ["ann", "bo", "cy"]):', '    print(n, name)'] },
        {
          type: 'predict', vars: R => ({ s: R.int(2, 6), k: R.int(3, 5) }), text: 'What will it say?', code: ['from itertools import count, islice', 'print(list(islice(count($s, 2), $k)))'],
          explain: 'Start at $s, step 2, take $k.',
        },
        {
          type: 'predict', text: 'Taking turns. What will it say?', code: ['from itertools import cycle', 'turns = cycle(["red", "blue"])', 'for move in ["a", "b", "c", "d", "e"]:', '    print(move, next(turns))'],
          explain: 'cycle wraps round to the start forever.',
        },
        {
          type: 'predict', text: 'Stopping with a break. What will it say?', code: ['from itertools import count', 'for n in count(1):', '    if n * n > 50:', '        break', 'print(n)'],
          explain: 'The first n whose square passes 50 is 8.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 4) }), text: 'repeat as a steady stream. What will it say?', code: ['from itertools import repeat', 'print(list(map(pow, [1, 2, 3], repeat($n))))'],
          explain: 'map pairs each number with the same exponent $n.',
        },
        {
          type: 'fill', text: 'Take only the first four items of the endless stream.',
          lines: ['from itertools import count, islice', 'print(list([](count(100), 4)))'], chips: ['islice', 'list', 'range'], answer: [['islice']],
          hints: ['Slicing an iterator.', 'islice(count(100), 4)'],
        },
        {
          type: 'write', text: 'Using cycle and islice, print a list of the first 7 items of the pattern "fire", "ice", "storm" repeating.',
          starter: ['from itertools import cycle, islice'], keys: ['print', 'list', 'islice', 'cycle', '(', ')', '["fire", "ice", "storm"]', ',', '7'],
          require: l => (has(l, /cycle\(/) && has(l, /islice\(/) ? null : 'Use cycle and islice.'),
          hints: ['islice(cycle([...]), 7)', 'print(list(islice(cycle(["fire", "ice", "storm"]), 7)))'],
          solution: ['print(list(islice(cycle(["fire", "ice", "storm"]), 7)))'],
        },
      ],
      learn: [{ title: 'Endless iterators', code: 'count(start, step)   cycle(seq)   repeat(x, n)\nislice(it, n)', text: 'Lazy streams; tame the endless ones with islice, zip or break.' }],
    },
    {
      id: '48-2', title: 'Joining and cutting', bg: 'observatory', npc: 'moira', mentor: 'moira', tags: ['chainslice'],
      steps: [
        { type: 'talk', who: 'moira', text: 'chain(a, b, c) runs through several iterables one after another, without building a new list. chain.from_iterable(list_of_lists) flattens one level. islice(it, start, stop, step) slices any iterator, even one you cannot index.' },
        { type: 'talk', who: 'moira', text: 'Remember: an ITERATOR is used up as you read it. Read it twice and the second time is empty. zip stops at the shortest input; zip_longest keeps going and fills the gaps.' },
        { type: 'demo', text: 'Join and cut. Run it.', code: ['from itertools import chain, islice, zip_longest', 'print(list(chain([1, 2], "ab", (3,))))', 'print(list(chain.from_iterable([[1], [2, 3], []])))', 'print(list(islice("abcdefgh", 1, 7, 2)))', 'print(list(zip_longest("abc", [1], fillvalue="-")))'] },
        {
          type: 'predict', text: 'Flattening a shelf of lists. What will it say?', code: ['from itertools import chain', 'shelves = [["atlas", "codex"], ["map"], ["scroll", "tome"]]', 'books = list(chain.from_iterable(shelves))', 'print(len(books), books[-1])'],
          explain: 'One flat list of all five books.',
        },
        {
          type: 'predict', text: 'Used up. What will it say?', code: ['from itertools import chain', 'it = chain([1, 2], [3])', 'print(sum(it))', 'print(sum(it))', 'print(list(it))'],
          explain: 'The first sum consumes everything; afterwards the iterator is empty.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(0, 2), b: R.int(5, 9) }), text: 'Slicing a generator. What will it say?', code: ['from itertools import islice', 'squares = (n * n for n in range(20))', 'print(list(islice(squares, $a, $b, 2)))'],
          explain: 'Items $a, $a + 2, ... before $b of the squares.',
        },
        {
          type: 'predict', text: 'zip versus zip_longest. What will it say?', code: ['from itertools import zip_longest', 'names = ["ann", "bo", "cy"]', 'scores = [9, 7]', 'print(list(zip(names, scores)))', 'print(list(zip_longest(names, scores, fillvalue=0)))'],
          explain: 'zip drops cy; zip_longest pairs cy with the fill value.',
        },
        {
          type: 'fill', text: 'Flatten the list of lists.',
          lines: ['from itertools import chain', 'groups = [[1, 2], [3], [4, 5]]', 'print(list(chain.[](groups)))'], chips: ['from_iterable', 'islice', 'flatten'], answer: [['from_iterable']],
          hints: ['chain\'s helper for one iterable of iterables.', 'chain.from_iterable(groups)'],
        },
        {
          type: 'write', text: 'Use chain to loop over the morning list ["tea", "bread"] and the evening list ["soup"] together, printing each item in upper case.',
          starter: ['from itertools import chain', 'morning = ["tea", "bread"]', 'evening = ["soup"]'], keys: ['for', 'item', 'in', 'chain', '(', ')', 'morning', 'evening', ',', ':', 'print', 'item.upper()'],
          require: l => (has(l, /chain\(morning,\s*evening\)/) ? null : 'Loop over chain(morning, evening).'),
          hints: ['for item in chain(morning, evening):', '    print(item.upper())'],
          solution: ['for item in chain(morning, evening):', '    print(item.upper())'],
        },
      ],
      learn: [{ title: 'Joining and slicing', code: 'chain(a, b)   chain.from_iterable(lists)\nislice(it, start, stop, step)   zip_longest(a, b, fillvalue=0)', text: 'Iterators are consumed as you read them.' }],
    },
    {
      id: '48-3', title: 'Running totals and pairs', bg: 'study', npc: 'moira', mentor: 'moira', tags: ['accumpair'],
      steps: [
        { type: 'talk', who: 'moira', text: 'accumulate(items) gives RUNNING results: running totals by default, or running anything with a function, like max. pairwise(items) gives each neighbouring pair, perfect for differences. batched(items, n) cuts into tuples of n. starmap(f, pairs) calls f(*pair) for each.' },
        { type: 'demo', text: 'Four tools. Run it.', code: ['from itertools import accumulate, pairwise, batched, starmap', 'print(list(accumulate([3, 1, 4, 1, 5])))', 'print(list(accumulate([3, 1, 4, 1, 5], max)))', 'print(list(pairwise("abcd")))', 'print(list(batched(range(7), 3)))', 'print(list(starmap(pow, [(2, 3), (3, 2)])))'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9), c: R.int(1, 9) }), text: 'A running total of coins. What will it say?', code: ['from itertools import accumulate', 'print(list(accumulate([$a, $b, $c])))', 'print(list(accumulate([$a, $b], initial=100)))'],
          explain: 'Each item is the sum so far; initial adds a starting value in front.',
        },
        {
          type: 'predict', text: 'Differences between neighbours. What will it say?', code: ['from itertools import pairwise', 'heights = [3, 7, 4, 9]', 'print([b - a for a, b in pairwise(heights)])'],
          explain: 'Each pair (a, b) gives b - a: 4, -3, 5.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 4) }), text: 'Cutting into batches. What will it say?', code: ['from itertools import batched', 'cargo = ["a", "b", "c", "d", "e"]', 'for crate in batched(cargo, $n):', '    print(crate)'],
          explain: 'Tuples of $n; the last batch may be shorter.',
        },
        {
          type: 'predict', text: 'starmap unpacks each tuple. What will it say?', code: ['from itertools import starmap', 'rooms = [(3, 4), (5, 2)]', 'print(list(starmap(lambda w, d: w * d, rooms)), sum(starmap(max, rooms)))'],
          explain: 'f(*pair) for each pair: areas 12 and 10; maxes 4 + 5.',
        },
        {
          type: 'fill', text: 'The highest level reached so far, at each step.',
          lines: ['from itertools import accumulate', 'levels = [2, 5, 3, 8, 6]', 'print(list(accumulate(levels, [])))'], chips: ['max', 'min', 'sum'], answer: [['max']],
          hints: ['Running maximum.', 'accumulate(levels, max)'],
        },
        {
          type: 'write', text: 'Given the daily gold [10, 25, 15, 40], print the running totals with accumulate, then print the biggest increase from one day to the next using pairwise.',
          starter: ['from itertools import accumulate, pairwise', 'gold = [10, 25, 15, 40]'], keys: ['print', 'list', 'accumulate', '(', ')', 'gold', 'max', 'b - a', 'for', 'a, b', 'in', 'pairwise'],
          require: l => (has(l, /accumulate\(/) && has(l, /pairwise\(/) ? null : 'Use accumulate and pairwise.'),
          hints: ['print(list(accumulate(gold)))', 'print(max(b - a for a, b in pairwise(gold)))'],
          solution: ['print(list(accumulate(gold)))', 'print(max(b - a for a, b in pairwise(gold)))'],
        },
      ],
      learn: [{ title: 'Running and pairing', code: 'accumulate(xs)   accumulate(xs, max)\npairwise(xs)   batched(xs, 3)   starmap(f, pairs)', text: 'Running results, neighbour pairs, fixed-size chunks.' }],
    },
    {
      id: '48-4', title: 'Knot worms', bg: 'stacks', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'knotworm', hp: d0 + 12, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Knot worms tangle the threads! $HP HP. Weave a steady stream of strikes.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Strike with the first three numbers of the stream 2, 4, 6, ...',
          lines: ['from itertools import count, islice', 'for p in islice(count(2, 2), []):', '    cast(fireball, p)'], chips: ['3', '2', '1'], answer: [['3']],
          goal: { foeDown: true },
          hints: ['2 + 4 + 6 = 12', 'islice(count(2, 2), 3)'],
        },
        { type: 'talk', who: 'narrator', text: 'The worm mother coils around the loom!' },
        {
          type: 'write', vars: R => ({ n: R.int(4, 8) }),
          spawn: v => ({ kind: 'knotworm', hp: v.n * 3, tint: 'big' }),
          text: 'It has $n × 3 HP. Use repeat($n, 3) in a for loop and cast icebolt with each item.',
          starter: ['from itertools import repeat'], keys: ['for', 'p', 'in', 'repeat', '(', ')', '$n', ',', '3', ':', 'cast', 'icebolt'],
          goal: { foeDown: true },
          require: l => (has(l, /repeat\(/) ? null : 'Use repeat($n, 3).'),
          hints: ['for p in repeat($n, 3):', '    cast(icebolt, p)'],
          solution: ['for p in repeat($n, 3):', '    cast(icebolt, p)'],
        },
      ],
      learn: [{ title: 'Streams in battle', code: 'islice(count(2, 2), 3)   repeat(5, 3)', text: 'Endless streams, safely cut.' }],
    },
    {
      id: '48-5', title: 'Every arrangement', bg: 'observatory', npc: 'moira', mentor: 'moira', tags: ['combinatoric'],
      steps: [
        { type: 'talk', who: 'moira', text: 'Some questions ask "try every possibility". product(a, b) is every pairing, like nested for loops; product(x, repeat=3) is three nested loops over x. permutations(items, r) lists every ORDER of r items; combinations(items, r) every CHOICE of r items, order ignored.' },
        { type: 'talk', who: 'moira', text: 'How many? For n items: permutations of r is n × (n-1) × ..., combinations is that divided by r!. They grow fast, which is why brute force only works on small problems.' },
        { type: 'demo', text: 'The combinatoric looms. Run it.', code: ['from itertools import product, permutations, combinations', 'print(list(product("ab", [1, 2])))', 'print(list(permutations("abc", 2)))', 'print(list(combinations("abcd", 2)))', 'print(len(list(product([0, 1], repeat=3))))'] },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 5) }), text: 'Counting arrangements. What will it say?', code: ['from itertools import permutations, combinations', 'items = range($n)', 'print(len(list(permutations(items, 2))), len(list(combinations(items, 2))))'],
          explain: 'Ordered pairs: $n × ($n - 1). Unordered: half of that.',
        },
        {
          type: 'predict', text: 'product replaces nested loops. What will it say?', code: ['from itertools import product', 'a = [(x, y) for x in "AB" for y in "12"]', 'b = list(product("AB", "12"))', 'print(a == b, b[1])'],
          explain: 'Same pairs in the same order: the last input changes fastest.',
        },
        {
          type: 'predict', vars: R => ({ t: R.int(8, 12) }), text: 'Brute force: which two coins make the target? What will it say?', code: ['from itertools import combinations', 'coins = [2, 3, 5, 7]', 'print([pair for pair in combinations(coins, 2) if sum(pair) == $t])'],
          explain: 'Check every pair of different coins.',
        },
        {
          type: 'predict', text: 'Every password of length 2 from "ab". What will it say?', code: ['from itertools import product', 'print(["".join(p) for p in product("ab", repeat=2)])'],
          explain: 'repeat=2 means two positions, each a or b.',
        },
        {
          type: 'fill', text: 'Choose 2 of the 4 heroes for a patrol (order does not matter).',
          lines: ['from itertools import combinations, permutations', 'heroes = ["ada", "bo", "cy", "dee"]', 'print(len(list([](heroes, 2))))'], chips: ['combinations', 'permutations', 'zip'], answer: [['combinations']],
          hints: ['Order does not matter: a choice, not an arrangement.', 'combinations(heroes, 2)'],
        },
        {
          type: 'write', text: 'Using product with repeat=2, print how many ways two six-sided dice (range(1, 7)) can add up to 7.',
          starter: ['from itertools import product'], keys: ['print', 'sum', '(', ')', '1', 'for', 'a, b', 'in', 'product', 'range(1, 7)', ',', 'repeat=2', 'if', 'a + b', '==', '7'],
          require: l => (has(l, /product\(/) && has(l, /repeat\s*=\s*2/) ? null : 'Use product(..., repeat=2).'),
          hints: ['for a, b in product(range(1, 7), repeat=2)', 'print(sum(1 for a, b in product(range(1, 7), repeat=2) if a + b == 7))'],
          solution: ['print(sum(1 for a, b in product(range(1, 7), repeat=2) if a + b == 7))'],
        },
      ],
      learn: [{ title: 'Combinatorics', code: 'product(a, b)   product(x, repeat=3)\npermutations(xs, r)   combinations(xs, r)', text: 'Every pairing, every order, every choice. They grow fast.' }],
    },
    {
      id: '48-6', title: 'Grouping the threads', bg: 'study', npc: 'moira', mentor: 'moira', tags: ['groupbyq'],
      steps: [
        { type: 'talk', who: 'moira', text: 'groupby(items, key) gathers RUNS of neighbouring items with the same key, giving (key, group) pairs. Two traps. One: it only groups NEIGHBOURS, so sort by the same key first. Two: each group is an iterator that is used up as soon as you move to the next group.' },
        { type: 'demo', text: 'Groups of neighbours. Run it.', code: ['from itertools import groupby', 'for key, grp in groupby("aaabbca"):', '    print(key, list(grp))'] },
        {
          type: 'predict', text: 'Unsorted input. What will it say?', code: ['from itertools import groupby', 'pets = ["cat", "dog", "cat"]', 'print([(k, len(list(g))) for k, g in groupby(pets)])', 'print([(k, len(list(g))) for k, g in groupby(sorted(pets))])'],
          explain: 'Without sorting, the two cats are not neighbours, so "cat" appears twice.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['len', 'str.lower']) }), text: 'A key function. What will it say?', code: ['from itertools import groupby', 'words = sorted(["Ox", "ant", "bee", "Asp", "cat"], key=$w)', 'for k, g in groupby(words, key=$w):', '    print(k, list(g))'],
          explain: 'Sort and group by the same key.',
        },
        {
          type: 'predict', text: 'Saving the groups for later. What will it say?', code: ['from itertools import groupby', 'saved = list(groupby("aabbb"))', 'print([(k, list(g)) for k, g in saved])'],
          explain: 'By the time you read them, the loom has moved on: each saved group is already used up and empty.',
        },
        {
          type: 'predict', text: 'Run-length encoding. What will it say?', code: ['from itertools import groupby', 'print("".join(f"{len(list(g))}{k}" for k, g in groupby("WWWBBW")))'],
          explain: 'Each run becomes its length then its letter.',
        },
        {
          type: 'fill', text: 'Sort first, so equal items become neighbours.',
          lines: ['from itertools import groupby', 'rolls = [3, 1, 3, 2, 1, 3]', 'print([(k, len(list(g))) for k, g in groupby([](rolls))])'], chips: ['sorted', 'list', 'reversed'], answer: [['sorted']],
          hints: ['groupby only groups neighbours.', 'groupby(sorted(rolls))'],
        },
        {
          type: 'write', text: 'Group the guild members by their first letter: sort names with key=lambda n: n[0], then groupby with the same key, and print each letter with the list of names.',
          starter: ['from itertools import groupby', 'names = ["bo", "ada", "bree", "cy", "asha"]'], keys: ['first', '=', 'lambda n: n[0]', 'for', 'k', 'g', ',', 'in', 'groupby', '(', ')', 'sorted', 'names', 'key=first', ':', 'print', 'list'],
          require: l => (has(l, /groupby\(/) && has(l, /sorted\(/) ? null : 'Sort, then groupby.'),
          hints: ['first = lambda n: n[0]\nfor k, g in groupby(sorted(names, key=first), key=first):', '    print(k, list(g))'],
          solution: ['first = lambda n: n[0]', 'for k, g in groupby(sorted(names, key=first), key=first):', '    print(k, list(g))'],
        },
      ],
      learn: [{ title: 'groupby', code: 'for k, g in groupby(sorted(xs, key=f), key=f):\n    items = list(g)', text: 'Groups neighbours only: sort first. Read each group before moving on.' }],
    },
    {
      id: '48-7', title: 'Filtering the weave', bg: 'observatory', npc: 'moira', mentor: 'moira', tags: ['itfilter'],
      steps: [
        { type: 'talk', who: 'moira', text: 'takewhile(test, items) yields items until the test FIRST fails, then stops for good. dropwhile skips items while the test holds, then yields everything after. Unlike filter, they look only at the start. compress(data, flags) keeps items whose flag is true.' },
        { type: 'talk', who: 'moira', text: 'Iterators chain into lazy PIPELINES: each stage pulls items from the one before, so nothing is computed until the end asks for it, and nothing is stored in between. tee(it, n) splits one iterator into n independent copies.' },
        { type: 'demo', text: 'Filters. Run it.', code: ['from itertools import takewhile, dropwhile, compress, filterfalse', 'nums = [1, 4, 6, 2, 8]', 'print(list(takewhile(lambda n: n < 5, nums)))', 'print(list(dropwhile(lambda n: n < 5, nums)))', 'print(list(filter(lambda n: n < 5, nums)))', 'print(list(compress("abcde", [1, 0, 1, 0, 1])))', 'print(list(filterfalse(lambda n: n % 2, range(6))))'] },
        {
          type: 'predict', vars: R => ({ t: R.int(3, 6) }), text: 'takewhile versus filter. What will it say?', code: ['from itertools import takewhile', 'readings = [1, 2, 7, 3, 1]', 'print(list(takewhile(lambda r: r < $t, readings)), list(filter(lambda r: r < $t, readings)))'],
          explain: 'takewhile stops at the first reading not below $t; filter checks every one.',
        },
        {
          type: 'predict', text: 'Skipping a header. What will it say?', code: ['from itertools import dropwhile', 'lines = ["# notes", "# draft", "dragon", "# later", "gold"]', 'print(list(dropwhile(lambda s: s.startswith("#"), lines)))'],
          explain: 'Only the leading comment lines are dropped; later ones stay.',
        },
        {
          type: 'predict', text: 'A lazy pipeline. What will it say?', code: ['from itertools import count, islice', 'log = []', 'def noisy(n):', '    log.append(n)', '    return n * n', 'squares = map(noisy, count(1))', 'big = filter(lambda s: s > 10, squares)', 'print(list(islice(big, 2)), log)'],
          explain: 'Only as many numbers are squared as needed to find two big squares: 1 to 5.',
        },
        {
          type: 'predict', text: 'Two copies of one stream. What will it say?', code: ['from itertools import tee', 'a, b = tee(iter([1, 2, 3]))', 'print(sum(a), list(b))'],
          explain: 'tee gives independent copies; using up a does not empty b.',
        },
        {
          type: 'fill', text: 'Keep the spells while their cost stays under 5, then stop.',
          lines: ['from itertools import takewhile, dropwhile', 'costs = [1, 3, 6, 2]', 'print(list([](lambda c: c < 5, costs)))'], chips: ['takewhile', 'dropwhile', 'filter'], answer: [['takewhile']],
          hints: ['Stop at the first failure.', 'takewhile'],
        },
        {
          type: 'write', text: 'From the stream count(1), keep only multiples of 7 (filter with a lambda), and print the first 3 of them using islice.',
          starter: ['from itertools import count, islice'], keys: ['sevens', '=', 'filter', '(', ')', 'lambda n: n % 7 == 0', 'count(1)', ',', 'print', 'list', 'islice', '3'],
          require: l => (has(l, /islice\(/) && has(l, /count\(1\)/) ? null : 'Filter count(1), then islice.'),
          hints: ['sevens = filter(lambda n: n % 7 == 0, count(1))', 'print(list(islice(sevens, 3)))'],
          solution: ['sevens = filter(lambda n: n % 7 == 0, count(1))', 'print(list(islice(sevens, 3)))'],
        },
      ],
      learn: [{ title: 'Filters and pipelines', code: 'takewhile(f, xs)   dropwhile(f, xs)\ncompress(xs, flags)   filterfalse(f, xs)   tee(it)', text: 'takewhile/dropwhile look only at the start. Pipelines compute lazily.' }],
    },
    {
      id: '48-8', title: 'Spindle bats', bg: 'stacks', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'spindlebat', hp: d0 + 12, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Spindle bats spin through the rafters! $HP HP. Every pair of runes strikes with its sum.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Strike with the sum of every CHOICE of two runes from [1, 2, 3].',
          lines: ['from itertools import combinations, permutations', 'for a, b in []([1, 2, 3], 2):', '    cast(fireball, a + b)'], chips: ['combinations', 'permutations', 'zip'], answer: [['combinations']],
          goal: { foeDown: true },
          require: s => (s[0] === 'combinations' ? null : 'Each pair once, order ignored.'),
          hints: ['(1,2) (1,3) (2,3): 3 + 4 + 5 = 12', 'combinations([1, 2, 3], 2)'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat queen weaves a web of numbers!' },
        {
          type: 'write', vars: R => ({ n: R.int(3, 5) }),
          spawn: v => ({ kind: 'spindlebat', hp: v.n * (v.n + 1) / 2, tint: 'big' }),
          text: 'It has 1 + 2 + ... + $n HP. Use accumulate on range(1, $n + 1) and cast icebolt with only the LAST running total (turn it into a list and take [-1]).',
          starter: ['from itertools import accumulate'], keys: ['totals', '=', 'list', 'accumulate', '(', ')', 'range', '1', '$n + 1', ',', 'cast', 'icebolt', 'totals[-1]'],
          goal: { foeDown: true },
          require: l => (has(l, /accumulate\(/) ? null : 'Use accumulate.'),
          hints: ['totals = list(accumulate(range(1, $n + 1)))', 'cast(icebolt, totals[-1])'],
          solution: ['totals = list(accumulate(range(1, $n + 1)))', 'cast(icebolt, totals[-1])'],
        },
      ],
      learn: [{ title: 'Looms in battle', code: 'combinations(xs, 2)   accumulate(xs)', text: 'Every choice, every running total.' }],
    },
    {
      id: '48-9', title: 'The Fate Weaver', bg: 'skytemple', foe: { kind: 'fateweaver', hp: 200, weak: 'spark', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'fateweaver', text: 'EVERY PATH. EVERY ORDER. EVERY CHOICE. I HAVE WOVEN THEM ALL.' },
        { type: 'talk', who: 'narrator', text: 'The Fate Weaver has 200 HP. Spark snaps its threads: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Spark is doubled.', code: ['from itertools import permutations', 'cast(spark, len(list(permutations("abc"))))'],
          explain: 'Three letters can be ordered 3 × 2 × 1 = 6 ways, doubled.',
        },
        {
          type: 'fix', text: 'This counts the groups wrongly. Run it, then tap the broken line.',
          goal: { output: 'auto' },
          code: ['from itertools import groupby', 'threads = ["red", "blue", "red", "red", "blue"]', 'groups = groupby(threads)', 'print(len([k for k, g in groups]))', 'cast(spark, 4)'], bad: 2,
          options: ['groups = groupby(sorted(threads))', 'groups = groupby(threads, key=len)', 'groups = groupby(reversed(threads))'], answer: 0,
          explain: 'Sorted first, the reds and blues become neighbours: 2 groups.',
        },
        { type: 'talk', who: 'fateweaver', text: 'THEN UNTANGLE MY ENDLESS THREAD!' },
        {
          type: 'fill', text: 'Take just two items from the endless cycle.',
          lines: ['from itertools import cycle, islice', 'for p in islice(cycle([5, 1]), []):', '    cast(spark, p)'], chips: ['2', '3', '0'], answer: [['2']],
          hints: ['One round of the cycle.', 'islice(..., 2)'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and spark is doubled. Use islice on count($HP // 2 + 1) to take ONE number, and cast spark with it.',
          starter: ['from itertools import count, islice'], keys: ['for', 'p', 'in', 'islice', '(', ')', 'count', '$HP', '//', '2', '+', '1', ',', ':', 'cast', 'spark'],
          goal: { foeDown: true },
          require: l => (has(l, /islice\(/) && has(l, /count\(/) ? null : 'Use islice on count(...).'),
          hints: ['for p in islice(count($HP // 2 + 1), 1):', '    cast(spark, p)'],
          solution: ['for p in islice(count($HP // 2 + 1), 1):', '    cast(spark, p)'],
        },
        { type: 'talk', who: 'fateweaver', text: '...a thread... I did not foresee...' },
      ],
      learn: [{ title: 'itertools toolkit', code: 'count cycle repeat islice chain accumulate pairwise\nproduct permutations combinations groupby takewhile', text: 'Everything from the Loom of Fate.' }],
    },
  ],
};
WORLDS.push(WORLD48);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    infiniteit: () => { const s = rnd(1, 5), k = rnd(2, 4); return makeQ(['from itertools import count, islice', `print(list(islice(count(${s}, 3), ${k})))`], [`[${Array.from({ length: k }, (_, i) => s + i).join(', ')}]`, `[${s}, ${s + 3}]`, 'SpellTimeout']); },
    chainslice: () => makeQ(['from itertools import chain', 'it = chain([1], [2, 3])', 'print(sum(it), list(it))'], ['6 [1, 2, 3]', '3 []', 'TypeError']),
    accumpair: () => pick([
      () => { const a = rnd(1, 5), b = rnd(1, 5), c = rnd(1, 5); return makeQ(['from itertools import accumulate', `print(list(accumulate([${a}, ${b}, ${c}])))`], [`[${a}, ${b}, ${c}]`, `[${a + b + c}]`, `[${a}, ${a + b}]`]); },
      () => makeQ(['from itertools import pairwise', 'print([b - a for a, b in pairwise([2, 5, 4])])'], ['[3, 1]', '[2, 5, 4]', '[-3, 1]']),
    ])(),
    combinatoric: () => { const n = rnd(3, 5); return makeQ(['from itertools import combinations', `print(len(list(combinations(range(${n}), 2))))`], [n * (n - 1), n, n * n]); },
    groupbyq: () => makeQ(['from itertools import groupby', 'print([k for k, g in groupby("aabaa")])'], ["['a', 'b']", "['a', 'a', 'b', 'a', 'a']", "['aa', 'b', 'aa']"]),
    itfilter: () => makeQ(['from itertools import takewhile', 'print(list(takewhile(lambda n: n < 4, [1, 5, 2, 3])))'], ['[1, 2, 3]', '[5]', '[]']),
  });
})();
