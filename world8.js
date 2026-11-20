/* World 8: The Twin Isles. Tuples: making them, why they cannot change, unpacking and
   swapping, star unpacking, comparing and sorting tuples, enumerate, zip, and the
   decorate-sort trick (sort names by score with zip). Source: Py4E chapter 10. */
Object.assign(EXTRA.npcs, {
  ilse: { name: 'Navigator Ilse', colors: ['#2f6f8f', '#e2b34a', '#c98d5f'] },
  quartermaster: { name: 'Quartermaster Dov', colors: ['#7a4a2a', '#2b2433', '#91603e'] },
});
Object.assign(EXTRA.foes, {
  twincrab: { base: 'crab', name: 'Twin crab', pal: { R: '#3f9ac8', M: '#1f5a8a' } },
  mirrorsprite: { base: 'sprite', name: 'Mirror sprite' },
  twinserpent: { base: 'serpent', name: 'The Twin Serpent', s: 4 },
});
const ISLE_CREW = ['Ada', 'Wren', 'Mira', 'Quill', 'Brin', 'Hazel', 'Rowan', 'Tam'];
const ISLE_CARGO = ['rope', 'lamp', 'axe', 'map', 'salt', 'tea', 'sail'];

const WORLD8 = {
  id: 8, name: 'The Twin Isles', topic: 'tuples, unpacking, enumerate and zip',
  nodes: [[50, 92], [26, 82], [68, 72], [34, 62], [70, 51], [30, 41], [64, 31], [36, 20], [52, 8]],
  levels: [
    {
      id: '8-1', title: 'Sealed pairs', bg: 'harbor', npc: 'ilse', mentor: 'ilse', tags: ['tuples'],
      steps: [
        { type: 'talk', who: 'ilse', text: "Ahoy, {NAME}! I'm Navigator Ilse. On the Twin Isles everything travels in sealed crates. A tuple is like a list in round brackets: spot = (3, 5). Once sealed, it can never change." },
        { type: 'demo', vars: R => ({ x: R.int(1, 9), y: R.int(1, 9) }), text: 'Run it.', code: ['spot = ($x, $y)', 'print(spot)', 'print(spot[0])', 'print(len(spot))'] },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 40), w: R.pick(ISLE_CARGO), b: R.int(2, 40), k: R.pick(['1', '-1', '0']) }),
          text: 'Indexes work just like lists. What will it say?', code: ['crate = ($a, "$w", $b)', 'print(crate[$k])'],
          explain: 'Index $k of the tuple.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ a: R.int(2, 9), b: R.int(2, 9) }),
          text: 'Try to change a sealed crate. Which error?', code: ['crate = ($a, $b)', 'crate[0] = 99'],
          explain: 'Tuples cannot be changed after they are made, so this raises TypeError.',
        },
        { type: 'talk', who: 'ilse', text: 'Two sea-dog secrets. A tuple of ONE item needs a comma: (7,) is a tuple, but (7) is just 7 in brackets. And the brackets are optional: x = 1, 2 makes a tuple too.' },
        {
          type: 'predict', vars: R => R.pick([{ c: '(7,)' }, { c: '(7)' }, { c: '7, 8' }]),
          text: 'What will it say?', code: ['print(type($c))'],
          wrong: ["<class 'int'>", "<class 'tuple'>", "<class 'list'>"],
          explain: 'It is the comma that makes a tuple, not the brackets.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9) }),
          text: 'Seal the two coordinates in a tuple.',
          lines: ['coords = []$a, $b[]', 'print(coords)'], chips: ['(', ')', '[', ']'], answer: [['(', ')']],
          hints: ['Tuples use round brackets.', 'coords = ($a, $b)'],
        },
        {
          type: 'fix', vars: R => ({ c: R.pick(['blue', 'gold', 'teal']) }),
          text: 'The flag colours need to grow, but this crashes. Run it, then tap the broken line.',
          code: ['colors = ("red", "green")', 'colors.append("$c")', 'print(colors)'], bad: 0,
          options: ['colors = ["red", "green"]', 'colors = ("red", "green",)', 'colors = "red", "green"'], answer: 0,
          explain: 'Tuples cannot grow. If something must change, use a list.',
        },
        {
          type: 'write', vars: R => ({ x: R.int(1, 30), y: R.int(1, 30) }),
          text: 'Make a tuple called spot holding $x and $y, then print the second item.',
          starter: [], keys: ['spot', '=', '(', ')', ',', '$x', '$y', 'print', '[', ']', '1'],
          require: l => (has(l, /spot\s*=\s*\(/) ? null : 'Make spot with round brackets.'),
          hints: ['spot = ($x, $y)', 'print(spot[1])'],
          solution: ['spot = ($x, $y)', 'print(spot[1])'],
        },
      ],
      learn: [
        { title: 'Tuples', code: 't = (3, 5)\nt[0] → 3\nt[0] = 9  # TypeError', text: 'Like a list in round brackets, but it can never change.' },
        { title: 'One item', code: '(7,)  → tuple\n(7)   → just 7', text: 'The comma makes the tuple.' },
      ],
    },
    {
      id: '8-2', title: 'Unpacking the cargo', bg: 'deck', npc: 'quartermaster', mentor: 'quartermaster', tags: ['unpack'],
      steps: [
        { type: 'talk', who: 'quartermaster', text: "Quartermaster Dov here. Opening a crate is called unpacking: x, y = (3, 5) puts 3 in x and 5 in y in one line. Same number of jars as items, or it fails." },
        { type: 'demo', vars: R => ({ n: R.pick(ISLE_CREW), l: R.int(2, 20) }), text: 'Run it.', code: ['name, level = ("$n", $l)', 'print(name)', 'print(level)'] },
        {
          type: 'predict', vars: R => ({ n: R.pick(ISLE_CREW), l: R.int(2, 20) }),
          text: 'What will it say?', code: ['name, level = ("$n", $l)', 'print(level, name)'],
          explain: 'name gets "$n", level gets $l.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9), b: R.int(10, 19) }),
          text: 'The famous swap. What will it say?', code: ['a = $a', 'b = $b', 'a, b = b, a', 'print(a, b)'],
          wrong: ['$a $b', '$b $b', '$a $a'],
          explain: 'The right side is packed into a tuple first, then unpacked the other way round.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ a: R.int(1, 9) }),
          text: 'Three items, two jars. Which error?', code: ['a, b = ($a, $(a + 1), $(a + 2))'],
          explain: 'There are more values than names to put them in: ValueError (too many values to unpack).',
        },
        { type: 'talk', who: 'quartermaster', text: 'A star jar scoops up the rest: first, *rest = [1, 2, 3, 4] gives first = 1 and rest = [2, 3, 4]. The starred name always becomes a list.' },
        {
          type: 'predict', vars: R => ({ items: R.sample(ISLE_CARGO, 4) }),
          text: 'What will it say?', code: ['first, *rest = $(JSON.stringify(items))', 'print(rest)'],
          explain: 'first takes "$(items[0])", and rest takes everything after it as a list.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(1, 9), b: R.int(10, 19) }),
          text: 'Swap the two values in one line.',
          lines: ['a = $a', 'b = $b', 'a, b = [], []', 'print(a, b)'], chips: ['b', 'a'], answer: [['b', 'a']],
          hints: ['The right side gives the new values, in order.', 'a, b = b, a'],
        },
        {
          type: 'write', vars: R => ({ n: R.pick(['Gull', 'Orca', 'Tern', 'Wave']), c: R.int(3, 30) }),
          text: 'Unpack ship into name and crew, then print: <name> has <crew> sailors.',
          starter: ['ship = ("$n", $c)'], keys: ['name', ',', 'crew', '=', 'ship', 'print', '(', ')', 'f"{name} has {crew} sailors"'],
          require: l => (has(l, /name\s*,\s*crew\s*=\s*ship/) ? null : 'Unpack with name, crew = ship.'),
          hints: ['name, crew = ship', 'print(f"{name} has {crew} sailors")'],
          solution: ['name, crew = ship', 'print(f"{name} has {crew} sailors")'],
        },
      ],
      learn: [
        { title: 'Unpacking', code: 'x, y = (3, 5)\na, b = b, a     # swap\nfirst, *rest = [1, 2, 3]', text: 'Open a tuple into separate names. The star collects the rest as a list.' },
      ],
    },
    {
      id: '8-3', title: 'Comparing crates', bg: 'harbor', npc: 'ilse', mentor: 'ilse', tags: ['tuplecmp'],
      steps: [
        { type: 'talk', who: 'ilse', text: 'Tuples compare item by item, like words in a dictionary. The first items decide. Only when they tie do the second items get a say.' },
        { type: 'demo', text: 'Run it.', code: ['print((1, 9) < (2, 0))', 'print((2, "a") < (2, "b"))'] },
        {
          type: 'predict', vars: R => R.pick([{ a: '(3, 1)', b: '(2, 9)' }, { a: '(2, 5)', b: '(2, 7)' }, { a: '(1, "z")', b: '(1, "a")' }, { a: '(5, 0, 1)', b: '(5, 0, 2)' }]),
          text: 'What will it say?', code: ['print($a < $b)'],
          explain: 'Compare the first items; if they are equal, move on to the next.',
        },
        {
          type: 'predict', vars: R => ({ s: R.shuffle([[2, 'rope'], [1, 'salt'], [2, 'axe']]) }),
          text: 'Sorting crates. What will it say?', code: ['crates = [$(s.map(([n, w]) => `(${n}, "${w}")`).join(", "))]', 'print(sorted(crates))'],
          explain: 'Sorted by the number first; the two 2s are then sorted by their names.',
        },
        {
          type: 'predict', vars: R => ({ s: R.shuffle([[3, 'rope'], [5, 'lamp'], [5, 'axe']]) }),
          text: 'The biggest crate. What will it say?', code: ['crates = [$(s.map(([n, w]) => `(${n}, "${w}")`).join(", "))]', 'print(max(crates))'],
          explain: 'Two crates have 5. Between them, "lamp" is bigger than "axe".',
        },
        {
          type: 'fill', vars: R => { const s = R.sample(ISLE_CREW, 3), sc = R.sample([12, 18, 25, 31, 7, 40], 3); return { r: s.map((n, i) => `(${sc[i]}, "${n}")`).join(', ') }; },
          text: 'Find the best (score, name) pair.',
          lines: ['results = [$r]', 'best = [](results)', 'print(best)'], chips: ['max', 'min', 'sorted'], answer: [['max']],
          hints: ['Best score means the biggest.', 'max(results)'],
        },
        {
          type: 'fix', vars: R => { const s = R.sample(ISLE_CREW, 3), sc = R.sample([12, 18, 25, 31, 7, 40], 3); return { r: s.map((n, i) => `(${sc[i]}, "${n}")`).join(', ') }; },
          text: 'The ranking should go from the highest score down. Run it, then tap the broken line.',
          code: ['results = [$r]', 'ranked = sorted(results)', 'print(ranked)'], bad: 1,
          options: ['ranked = sorted(results, reverse=True)', 'ranked = sorted(results)[0]', 'ranked = max(results)'], answer: 0,
          explain: 'reverse=True sorts from biggest to smallest.',
        },
        {
          type: 'write', vars: R => { const s = R.sample(ISLE_CREW, 3), t = R.sample([61, 58, 72, 49, 66], 3); return { race: s.map((n, i) => `(${t[i]}, "${n}")`).join(', ') }; },
          text: 'race holds (seconds, name) pairs. Print the fastest pair: the one with the smallest time.',
          starter: ['race = [$race]'], keys: ['print', 'min', '(', ')', 'race'],
          require: l => (has(l, /min\s*\(\s*race\s*\)/) ? null : 'Use min(race).'),
          hints: ['Fastest means the smallest time, and the time is first in each pair.', 'print(min(race))'],
          solution: ['print(min(race))'],
        },
      ],
      learn: [{ title: 'Comparing tuples', code: '(1, 9) < (2, 0)   → True\n(2, "a") < (2, "b") → True', text: 'First items decide; ties go to the next item. sorted, min and max all use this.' }],
    },
    {
      id: '8-4', title: 'Twin crabs', bg: 'deck', mentor: 'narrator', tags: [],
      foe: R => { const q = R.int(4, 8), b = R.int(7, 10), e = R.int(1, 6); return { kind: 'twincrab', hp: 2 * q + 7 * b + e, q }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Twin crabs clatter over the rail! $HP HP. divmod(a, b) gives a tuple of two answers at once: (a // b, a % b).' },
        { type: 'demo', vars: (R, c) => ({ q: c.foe.q }), text: 'Unpack a pair of orders and cast.', code: ['power, times = ($q, 2)', 'for i in range(times):', '    cast(spark, power)'] },
        {
          type: 'fill',
          text: 'It has $HP HP left. Split it into blasts of 7 plus the leftover with divmod. Which names go first?',
          lines: ['[] = divmod($HP, 7)', 'for i in range(blasts):', '    cast(spark, 7)', 'cast(spark, extra)'], chips: ['blasts, extra', 'extra, blasts', 'blasts'], answer: [['blasts, extra']],
          goal: { foeDown: true },
          hints: ['divmod gives (whole part, remainder).', 'blasts, extra = divmod($HP, 7)'],
        },
        { type: 'talk', who: 'narrator', text: 'The bigger twin barks its orders as a tuple.' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9), t = R.int(3, 5); return { p, t, hp: p * t }; },
          spawn: v => ({ kind: 'twincrab', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Unpack orders into power and times, then cast icebolt with power, times times.',
          starter: ['orders = ($p, $t)'], keys: ['power', ',', 'times', '=', 'orders', 'for', 'i', 'in', 'range', '(', ')', ':', 'cast', 'icebolt'],
          goal: { foeDown: true },
          require: l => (has(l, /power\s*,\s*times\s*=\s*orders/) ? null : 'Unpack first: power, times = orders.'),
          hints: ['power, times = orders', 'for i in range(times): / cast(icebolt, power)'],
          solution: ['power, times = orders', 'for i in range(times):', '    cast(icebolt, power)'],
        },
      ],
      learn: [{ title: 'divmod', code: 'q, r = divmod(17, 5)  → 3, 2', text: 'Floor division and remainder in one go, as a tuple.' }],
    },
    {
      id: '8-5', title: 'Counting as you go', bg: 'harbor', npc: 'quartermaster', mentor: 'quartermaster', tags: ['enumq'],
      steps: [
        { type: 'talk', who: 'quartermaster', text: 'When you need each item AND its position, use enumerate. It hands out (index, item) pairs, and you can unpack them right in the for line.' },
        { type: 'demo', vars: R => ({ c: R.sample(ISLE_CREW, 3) }), text: 'Run it.', code: ['crew = $(JSON.stringify(c))', 'for i, name in enumerate(crew):', '    print(i, name)'] },
        {
          type: 'predict', vars: R => R.pick([{ w: 'banana', x: 'a' }, { w: 'galleon', x: 'l' }, { w: 'harbor', x: 'r' }]),
          text: 'What will it say?', code: ['for i, ch in enumerate("$w"):', '    if ch == "$x":', '        print(i)'],
          explain: 'enumerate gives each letter with its index; only the "$x" letters are printed.',
        },
        {
          type: 'predict', vars: R => ({ items: R.sample(ISLE_CARGO, 3) }),
          text: 'Counting from 1. What will it say?', code: ['for n, item in enumerate($(JSON.stringify(items)), start=1):', '    print(n, item)'],
          explain: 'start=1 makes the counting begin at 1 instead of 0.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['ab', 'ox', 'sea']) }),
          text: 'What do the pairs look like? What will it say?', code: ['print(list(enumerate("$w")))'],
          explain: 'Each pair is a tuple: (index, item).',
        },
        {
          type: 'fill', vars: R => ({ c: R.sample(ISLE_CREW, 3) }),
          text: 'Number the crew from 1.',
          lines: ['crew = $(JSON.stringify(c))', 'for [], name in [](crew, start=1):', '    print(n, name)'], chips: ['n', 'enumerate', 'range', 'zip'], answer: [['n', 'enumerate']],
          hints: ['enumerate counts for you.', 'for n, name in enumerate(crew, start=1):'],
        },
        {
          type: 'fix', vars: R => ({ c: R.sample(ISLE_CREW, 3) }),
          text: 'This should print each sailor with their number. Run it, then tap the broken line.',
          code: ['crew = $(JSON.stringify(c))', 'for i, name in crew:', '    print(i, name)'], bad: 1,
          options: ['for i, name in enumerate(crew):', 'for i, name in range(crew):', 'for name, i in crew:'], answer: 0,
          explain: 'Plain crew gives names, not pairs. enumerate(crew) gives (index, name) pairs.',
        },
        {
          type: 'write', vars: R => ({ items: R.sample(ISLE_CARGO, 3) }),
          text: 'Print each item numbered from 1, like: 1. rope',
          starter: ['items = $(JSON.stringify(items))'], keys: ['for', 'n', ',', 'item', 'in', 'enumerate', '(', ')', 'items', 'start=1', ':', 'print', 'f"{n}. {item}"'],
          require: l => (has(l, /enumerate\s*\(/) ? null : 'Use enumerate(items, start=1).'),
          hints: ['for n, item in enumerate(items, start=1):', '    print(f"{n}. {item}")'],
          solution: ['for n, item in enumerate(items, start=1):', '    print(f"{n}. {item}")'],
        },
      ],
      learn: [{ title: 'enumerate', code: 'for i, x in enumerate(items):\nfor n, x in enumerate(items, start=1):', text: 'Gives (index, item) pairs, so you never need range(len(...)).' }],
    },
    {
      id: '8-6', title: 'Side by side', bg: 'river', npc: 'ilse', mentor: 'ilse', tags: ['zippair'],
      steps: [
        { type: 'talk', who: 'ilse', text: 'zip walks two lists side by side, like twin ships, and hands you a pair from each step. It stops as soon as the SHORTER list runs out.' },
        { type: 'demo', vars: R => ({ n: R.sample(ISLE_CREW, 3), s: [R.int(5, 20), R.int(5, 20), R.int(5, 20)] }), text: 'Run it.', code: ['names = $(JSON.stringify(n))', 'scores = $(JSON.stringify(s))', 'for name, score in zip(names, scores):', '    print(name, score)'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(['ab', 'xyz']), n: R.pick([[1, 2], [7, 8, 9]]) }),
          text: 'What will it say?', code: ['print(list(zip("$w", $(JSON.stringify(n)))))'],
          explain: 'Pairs are made until the shorter one runs out.',
        },
        {
          type: 'predict', vars: R => ({ n: R.sample(ISLE_CREW, 3), r: R.sample(['captain', 'cook', 'lookout'], 2) }),
          text: 'Uneven lists. What will it say?', code: ['names = $(JSON.stringify(n))', 'roles = $(JSON.stringify(r))', 'for name, role in zip(names, roles):', '    print(name, role)'],
          explain: 'Only two roles, so zip stops after two pairs. $(n[2]) is left out.',
        },
        {
          type: 'predict', vars: R => ({ p: [R.int(2, 9), R.int(2, 9), R.int(2, 9)], q: [R.int(1, 4), R.int(1, 4), R.int(1, 4)] }),
          text: 'A shopping bill. What will it say?', code: ['prices = $(JSON.stringify(p))', 'qtys = $(JSON.stringify(q))', 'total = 0', 'for price, qty in zip(prices, qtys):', '    total += price * qty', 'print(total)'],
          explain: 'Each price is multiplied by its own quantity, then added up.',
        },
        {
          type: 'fill', vars: R => ({ c: R.sample(ISLE_CREW, 2), p: R.sample(['Gull Bay', 'Salt Rock', 'Fog Isle'], 2) }),
          text: 'Pair each sailor with their home port.',
          lines: ['crew = $(JSON.stringify(c))', 'ports = $(JSON.stringify(p))', 'for name, port in [](crew, ports):', '    print(name, "is from", port)'], chips: ['zip', 'enumerate', 'range'], answer: [['zip']],
          hints: ['Two lists side by side.', 'zip(crew, ports)'],
        },
        {
          type: 'fix', vars: R => ({ n: R.sample(ISLE_CREW, 2), s: [R.int(5, 20), R.int(5, 20)] }),
          text: 'This should print each name with its score. Run it, then tap the broken line.',
          code: ['names = $(JSON.stringify(n))', 'scores = $(JSON.stringify(s))', 'for name, score in zip(names):', '    print(name, score)'], bad: 2,
          options: ['for name, score in zip(names, scores):', 'for name, score in zip(scores):', 'for name, score in names, scores:'], answer: 0,
          explain: 'zip needs both lists to pair them up.',
        },
        {
          type: 'write', vars: R => ({ s: R.sample(ISLE_CREW, 3), sh: R.sample(['Gull', 'Orca', 'Tern', 'Wave'], 3) }),
          text: 'Print each sailor with their ship, like: Ada sails the Gull',
          starter: ['sailors = $(JSON.stringify(s))', 'ships = $(JSON.stringify(sh))'], keys: ['for', 'sailor', ',', 'ship', 'in', 'zip', '(', ')', 'sailors', 'ships', ':', 'print', '"sails the"'],
          require: l => (has(l, /zip\s*\(/) ? null : 'Use zip(sailors, ships).'),
          hints: ['for sailor, ship in zip(sailors, ships):', '    print(sailor, "sails the", ship)'],
          solution: ['for sailor, ship in zip(sailors, ships):', '    print(sailor, "sails the", ship)'],
        },
      ],
      learn: [{ title: 'zip', code: 'for a, b in zip(list1, list2):', text: 'Walks lists side by side in pairs, stopping at the shortest.' }],
    },
    {
      id: '8-7', title: 'Ranking the fleet', bg: 'harbor', npc: 'quartermaster', mentor: 'quartermaster', tags: ['dsu'],
      steps: [
        { type: 'talk', who: 'quartermaster', text: "An old navigator's trick, straight out of Python for Everybody. To sort names by their scores, zip the SCORE first: zip(scores, names). Tuples sort by their first item, so the pairs sort by score!" },
        { type: 'demo', vars: R => ({ n: R.sample(ISLE_CREW, 3), s: R.sample([12, 18, 25, 31, 7], 3) }), text: 'Best first. Run it.', code: ['names = $(JSON.stringify(n))', 'scores = $(JSON.stringify(s))', 'print(sorted(zip(scores, names), reverse=True))'] },
        {
          type: 'predict', vars: R => ({ n: R.sample(ISLE_CREW, 3), s: R.sample([12, 18, 25, 31, 7], 3) }),
          text: 'Lowest score first. What will it say?', code: ['names = $(JSON.stringify(n))', 'scores = $(JSON.stringify(s))', 'for score, name in sorted(zip(scores, names)):', '    print(name)'],
          explain: 'The pairs are sorted by score, smallest first, and only the names are printed.',
        },
        {
          type: 'predict', vars: R => ({ n: R.sample(ISLE_CREW, 3), s: R.sample([12, 18, 25, 31, 7], 3) }),
          text: 'Who is the champion? What will it say?', code: ['names = $(JSON.stringify(n))', 'scores = $(JSON.stringify(s))', 'top = sorted(zip(scores, names), reverse=True)[0]', 'print(top[1])'],
          explain: 'The first pair after sorting from high to low has the best score. top[1] is its name.',
        },
        {
          type: 'fill', vars: R => { const n = ['Wren', 'Ada', 'Tam']; return { n, s: R.pick([[5, 9, 2], [12, 30, 20], [7, 3, 8]]) }; },
          text: 'Rank the sailors by score, best first. Which list goes first in the zip?',
          lines: ['names = $(JSON.stringify(n))', 'scores = $(JSON.stringify(s))', 'ranked = sorted(zip([], []), reverse=True)', 'print(ranked)'], chips: ['scores', 'names'], answer: [['scores', 'names']],
          hints: ['Tuples sort by their FIRST item.', 'zip(scores, names)'],
        },
        {
          type: 'fix', vars: R => ({ n: ['Wren', 'Ada', 'Tam'], s: R.pick([[5, 9, 2], [12, 30, 20], [7, 3, 8]]) }),
          text: 'This should list the sailors from the highest score down, but it sorts by name. Run it, then tap the broken line.',
          code: ['names = $(JSON.stringify(n))', 'scores = $(JSON.stringify(s))', 'for name, score in sorted(zip(names, scores), reverse=True):', '    print(name, score)'], bad: 2,
          options: ['for score, name in sorted(zip(scores, names), reverse=True):', 'for name, score in sorted(zip(scores, names), reverse=True):', 'for score, name in sorted(zip(names, scores)):'], answer: 0,
          explain: 'Put the score first in the zip, and unpack in the same order.',
        },
        {
          type: 'write', vars: R => ({ n: R.sample(ISLE_CREW, 3), t: R.sample([61, 58, 72, 49, 66], 3) }),
          text: 'Print the NAME of the sailor with the lowest time.',
          starter: ['names = $(JSON.stringify(n))', 'times = $(JSON.stringify(t))'], keys: ['best', '=', 'min', '(', ')', 'zip', 'times', 'names', ',', 'print', '[', ']', '1'],
          require: l => (has(l, /zip\s*\(\s*times\s*,\s*names\s*\)/) ? null : 'Pair them with the time first: zip(times, names).'),
          hints: ['best = min(zip(times, names))', 'print(best[1])'],
          solution: ['best = min(zip(times, names))', 'print(best[1])'],
        },
      ],
      learn: [{ title: 'Sort by score', code: 'sorted(zip(scores, names), reverse=True)', text: 'Put the thing to sort by first in each tuple, sort, then use the other part.' }],
    },
    {
      id: '8-8', title: 'Mirror sprites', bg: 'whirlpool', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(5, 9), a = R.int(4, 9), b = R.int(4, 9), c = R.int(4, 9); return { kind: 'mirrorsprite', hp: d + a + b + c, d, a, b, c }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Mirror sprites! $HP HP. Every spell has a matching power, side by side.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A warm-up spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ a: c.foe.a, b: c.foe.b, c2: c.foe.c }),
          text: 'It has $HP HP left. Cast each spell with its own power.',
          lines: ['spells = [spark, icebolt, spark]', 'powers = [$a, $b, $c2]', 'for spell, power in [](spells, powers):', '    cast(spell, power)'], chips: ['zip', 'enumerate', 'range'], answer: [['zip']],
          goal: { foeDown: true },
          hints: ['Two lists, side by side.', 'zip(spells, powers)'],
        },
        { type: 'talk', who: 'narrator', text: 'The mirror queen has three runes, each stronger than the last.' },
        {
          type: 'write', vars: R => { const p = R.int(4, 8); return { p, hp: 6 * p }; },
          spawn: v => ({ kind: 'mirrorsprite', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. For each rune, numbered from 1, cast spark with its number times $p.',
          starter: ['runes = ["ka", "zo", "mi"]'], keys: ['for', 'n', ',', 'rune', 'in', 'enumerate', '(', ')', 'runes', 'start=1', ':', 'cast', 'spark', '*', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /enumerate\s*\(/) ? null : 'Use enumerate(runes, start=1).'),
          hints: ['for n, rune in enumerate(runes, start=1):', '    cast(spark, n * $p)'],
          solution: ['for n, rune in enumerate(runes, start=1):', '    cast(spark, n * $p)'],
        },
      ],
      learn: [{ title: 'Lists of spells', code: 'for spell, power in zip(spells, powers):\n    cast(spell, power)', text: 'zip pairs each spell with its power.' }],
    },
    {
      id: '8-9', title: 'The Twin Serpent', bg: 'rapids', foe: { kind: 'twinserpent', hp: 170, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'twinserpent', text: 'TWO... HEADS... ONE... HUNGER...' },
        { type: 'talk', who: 'narrator', text: 'The Twin Serpent has 170 HP. Icebolt freezes both heads: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ p: R.int(3, 6), t: R.int(2, 3) }),
          text: 'How much damage? Icebolt is doubled.', code: ['power, times = ($p, $t)', 'cast(icebolt, power * times)'],
          explain: '$p × $t = $(p * t), doubled.',
        },
        {
          type: 'fix', vars: R => ({ x: R.int(3, 9), y: R.int(10, 16) }),
          text: 'This should swap the two powers and cast the bigger one. Run it, then tap the broken line.',
          code: ['a, b = $x, $y', 'a, b = b, b', 'print(a, b)', 'cast(spark, a)'], bad: 1,
          options: ['a, b = b, a', 'a, b = a, b', 'a = b'], answer: 0,
          explain: 'A swap takes the values the other way round: a, b = b, a.',
        },
        { type: 'talk', who: 'twinserpent', text: 'CHOOSE... THE... STRONGEST...' },
        {
          type: 'fill', vars: R => ({ s: R.sample([6, 9, 12, 7], 3) }),
          text: 'Pick the strongest charm and cast icebolt with its power.',
          lines: ['names = ["moon", "tide", "salt"]', 'powers = $(JSON.stringify(s))', 'best = max(zip([], names))', 'cast(icebolt, best[0])'], chips: ['powers', 'names'], answer: [['powers']],
          hints: ['Compare by power, so power goes first.', 'max(zip(powers, names))'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Unpack half, rest = divmod($HP, 2), then cast icebolt with half + rest.',
          starter: [], keys: ['half', ',', 'rest', '=', 'divmod', '(', ')', '$HP', '2', 'cast', 'icebolt', '+'],
          goal: { foeDown: true },
          require: l => (has(l, /half\s*,\s*rest\s*=\s*divmod/) ? null : 'Unpack divmod into half, rest.'),
          hints: ['half, rest = divmod($HP, 2)', 'cast(icebolt, half + rest)'],
          solution: ['half, rest = divmod($HP, 2)', 'cast(icebolt, half + rest)'],
        },
        { type: 'talk', who: 'twinserpent', text: '...both... heads... rest...' },
      ],
      learn: [{ title: 'Tuple toolkit', code: '(a, b)  a, b = b, a  *rest  enumerate  zip', text: 'Everything from the Twin Isles: sealed pairs, unpacking, counting and pairing.' }],
    },
  ],
};
WORLDS.push(WORLD8);

(() => {
  const { makeQ, pick, rnd, shuffle } = Arena;
  const C = ['rope', 'lamp', 'axe', 'map', 'salt'];
  Object.assign(Arena.GEN, {
    tuples: () => {
      const a = rnd(1, 9), b = rnd(10, 19), v = rnd(0, 2);
      if (v === 0) return makeQ([`t = (${a}, ${b})`, 'print(t[-1])'], [a, `(${b})`]);
      if (v === 1) return makeQ([`t = (${a}, ${b})`, 't[0] = 0', 'print(t)'], [`(0, ${b})`, `(${a}, ${b})`]);
      return makeQ([`print(type((${a},)))`], ["<class 'int'>", "<class 'list'>"]);
    },
    unpack: () => {
      const a = rnd(1, 9), b = rnd(10, 19), v = rnd(0, 2);
      if (v === 0) return makeQ([`a, b = ${a}, ${b}`, 'a, b = b, a', 'print(a, b)'], [`${a} ${b}`, `${b} ${b}`]);
      if (v === 1) return makeQ([`first, *rest = [${a}, ${b}, ${a + b}]`, 'print(rest)'], [`${b}`, `(${b}, ${a + b})`]);
      return makeQ([`x, y = (${a}, ${b}, 0)`, 'print(x)'], [a, `(${a}, ${b})`]);
    },
    tuplecmp: () => {
      const v = rnd(0, 1);
      if (v === 0) return makeQ([`print((2, ${rnd(5, 9)}) < (3, 0))`], ['False', 'Error']);
      return makeQ(['print(max([(5, "axe"), (5, "lamp"), (3, "rope")]))'], ["(5, 'axe')", "(3, 'rope')"]);
    },
    enumq: () => {
      const items = shuffle(C).slice(0, 3);
      return rnd(0, 1) === 0
        ? makeQ([`for i, x in enumerate(${JSON.stringify(items)}):`, '    if i == 1:', '        print(x)'], [items[0], 1])
        : makeQ([`print(list(enumerate("ab", start=1)))`], ["[(0, 'a'), (1, 'b')]", "[('a', 1), ('b', 2)]"]);
    },
    zippair: () => {
      const v = rnd(0, 1);
      if (v === 0) return makeQ(['print(list(zip("abc", [1, 2])))'], ["[('a', 1), ('b', 2), ('c', None)]", 'Error']);
      const p = [rnd(2, 9), rnd(2, 9)], q = [rnd(1, 3), rnd(1, 3)];
      return makeQ([`total = 0`, `for p, q in zip(${JSON.stringify(p)}, ${JSON.stringify(q)}):`, '    total += p * q', 'print(total)'], [p[0] + p[1] + q[0] + q[1], (p[0] + p[1]) * (q[0] + q[1])]);
    },
    dsu: () => {
      const n = ['Ada', 'Wren', 'Tam'], s = shuffle([5, 9, 2]);
      return makeQ([`names = ${JSON.stringify(n)}`, `scores = ${JSON.stringify(s)}`, 'print(sorted(zip(scores, names))[0][1])'], [n[0], s.indexOf(Math.max(...s)) >= 0 ? n[s.indexOf(Math.max(...s))] : n[1]]);
    },
  });
})();
