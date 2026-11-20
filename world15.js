/* World 15: The Hall of Mirrors. Python gotchas and idioms (our own world): sticky
   mutable defaults, two names for one list, shallow vs deep copies and the grid trap,
   is vs ==, truthiness and "or" defaults, changing a list while looping over it,
   late-binding lambdas, and Pythonic habits (any/all, chained comparisons). */
Object.assign(EXTRA.npcs, {
  vell: { name: 'Mirror-keeper Vell', colors: ['#6a8a9a', '#e6e1d6', '#ecb98d'] },
});
Object.assign(EXTRA.foes, {
  mirrorimp: { base: 'goblin', name: 'Mirror imp', pal: { G: '#a9c8d8', B: '#5a7a8a', W: '#ffffff' } },
  glasswisp: { base: 'wisp', name: 'Glass wisp', pal: { F: '#a9c8d8', L: '#ffffff' } },
  mirrorwitch: { base: 'lich', name: 'The Mirror Witch', pal: { W: '#d8f0ff', K: '#5fd3ff', M: '#ffffff' } },
});
const MIRROR_ITEMS = ['rope', 'lamp', 'axe', 'map', 'salt'];

const WORLD15 = {
  id: 15, name: 'The Hall of Mirrors', topic: 'gotchas and Pythonic idioms',
  nodes: [[50, 92], [28, 82], [68, 72], [32, 62], [68, 51], [30, 41], [66, 31], [38, 20], [52, 8]],
  levels: [
    {
      id: '15-1', title: 'The sticky default', bg: 'palace', npc: 'vell', mentor: 'vell', tags: ['mutdefault'],
      steps: [
        { type: 'talk', who: 'vell', text: "Welcome to the Hall of Mirrors, {NAME}. I'm Vell. Here, code shows you what it REALLY does, not what you think it does. Every mirror is a famous Python trap." },
        { type: 'talk', who: 'vell', text: 'Trap one. A default value is made ONCE, when the def line runs, not every call. So a default list is shared by every call that uses it, and it keeps growing.' },
        { type: 'demo', text: 'Run it and watch the bag grow.', code: ['def add(item, bag=[]):', '    bag.append(item)', '    return bag', 'print(add("rope"))', 'print(add("lamp"))'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9), b: R.int(10, 19) }),
          text: 'What will it say?', code: ['def log(n, seen=[]):', '    seen.append(n)', '    return len(seen)', 'log($a)', 'print(log($b))'],
          wrong: ['1', '0', 'Error'],
          explain: 'Both calls share the same default list, so it now holds two numbers.',
        },
        { type: 'talk', who: 'vell', text: 'The cure: use None as the default, and make a fresh list inside the function.' },
        {
          type: 'predict', vars: R => ({ a: R.pick(MIRROR_ITEMS), b: R.pick(MIRROR_ITEMS) }),
          text: 'With the cure. What will it say?', code: ['def add(item, bag=None):', '    if bag is None:', '        bag = []', '    bag.append(item)', '    return bag', 'add("$a")', 'print(add("$b"))'],
          explain: 'Each call without a bag gets a brand-new empty list.',
        },
        {
          type: 'fill', text: 'Finish the cure.',
          lines: ['def collect(x, box=[]):', '    if box is None:', '        box = list()', '    box.append(x)', '    return box', 'collect(1)', 'print(collect(2))'], chips: ['None', '[]', '0'], answer: [['None']],
          hints: ['The default should be something that never changes.', 'box=None'],
        },
        {
          type: 'fix', text: 'Each call should start with an empty list. Run it, then tap the broken line.',
          code: ['def tally(score, all_scores=list()):', '    if all_scores is None:', '        all_scores = list()', '    all_scores.append(score)', '    return all_scores', 'tally(5)', 'print(tally(7))'], bad: 0,
          options: ['def tally(score, all_scores=None):', 'def tally(score, all_scores=list):', 'def tally(score, all_scores=[] * 2):'], answer: 0,
          explain: 'list() as a default is made once and shared. With None, the check below builds a fresh list on every call.',
        },
        {
          type: 'write', vars: R => ({ a: R.pick(MIRROR_ITEMS), b: R.pick(MIRROR_ITEMS) }),
          text: 'Write pack(item, bag=None): make a new list when bag is None, append item, return bag. Then call pack("$a") and print pack("$b").',
          starter: [], keys: ['def', 'pack', '(', ')', 'item', 'bag', '=None', ',', ':', 'if', 'is', 'None', '=', '[]', '.append', 'return', 'print', '"$a"', '"$b"'],
          require: l => (has(l, /bag\s*=\s*None/) && has(l, /is\s+None/) ? null : 'Use bag=None and check "if bag is None:".'),
          hints: ['def pack(item, bag=None): / if bag is None: / bag = []', 'bag.append(item) / return bag, then pack("$a") and print(pack("$b"))'],
          solution: ['def pack(item, bag=None):', '    if bag is None:', '        bag = []', '    bag.append(item)', '    return bag', 'pack("$a")', 'print(pack("$b"))'],
        },
      ],
      learn: [{ title: 'Mutable defaults', code: 'def f(x, bag=None):\n    if bag is None:\n        bag = []', text: 'Defaults are made once. Never use a list or dict as a default; use None and build it inside.' }],
    },
    {
      id: '15-2', title: 'Two names, one list', bg: 'palace', npc: 'vell', mentor: 'vell', tags: ['aliasing'],
      steps: [
        { type: 'talk', who: 'vell', text: 'Trap two. b = a does NOT copy a list. It gives the SAME list a second name, like a reflection. Change it through either name and both see it.' },
        { type: 'demo', text: 'Run it.', code: ['a = [1, 2]', 'b = a', 'b.append(3)', 'print(a)'] },
        {
          type: 'predict', vars: R => ({ x: R.pick(MIRROR_ITEMS), y: R.pick(MIRROR_ITEMS) }),
          text: 'What will it say?', code: ['mine = ["$x"]', 'yours = mine', 'yours.append("$y")', 'print(len(mine))'],
          wrong: ['1', 'Error', '0'],
          explain: 'mine and yours are one list with two names.',
        },
        { type: 'talk', who: 'vell', text: 'To get a real copy, use a[:], list(a) or a.copy(). And watch out: x += [3] changes the list in place, but x = x + [3] builds a NEW list.' },
        {
          type: 'predict', text: 'A true copy. What will it say?', code: ['a = [1, 2]', 'b = a.copy()', 'b.append(3)', 'print(a, b)'],
          explain: 'b is a separate list now, so a stays [1, 2].',
        },
        {
          type: 'predict', text: '+= versus +. What will it say?', code: ['x = [1]', 'y = x', 'y += [2]', 'print(x)', 'y = y + [3]', 'print(x, y)'],
          explain: '+= changed the shared list. y = y + [3] made a new list and only y points to it.',
        },
        {
          type: 'fill', vars: R => ({ x: R.pick(MIRROR_ITEMS) }),
          text: 'Make backup a real copy, so changing items leaves it alone.',
          lines: ['items = ["$x", "map"]', 'backup = items[]', 'items.append("salt")', 'print(backup)'], chips: ['[:]', '[0]', '[-1]'], answer: [['[:]']],
          hints: ['A slice of everything makes a new list.', 'items[:]'],
        },
        {
          type: 'write', vars: R => ({ x: R.pick(MIRROR_ITEMS), y: R.pick(MIRROR_ITEMS) }),
          text: 'Make plan a COPY of route with list(), append "$y" to plan, then print route and plan.',
          starter: ['route = ["$x"]'], keys: ['plan', '=', 'list', '(', ')', 'route', '.append', '"$y"', 'print', ','],
          require: l => (has(l, /list\s*\(\s*route\s*\)/) ? null : 'Use plan = list(route).'),
          hints: ['plan = list(route)', 'plan.append("$y") then print(route, plan)'],
          solution: ['plan = list(route)', 'plan.append("$y")', 'print(route, plan)'],
        },
      ],
      learn: [{ title: 'Aliasing', code: 'b = a        # same list!\nb = a[:]     # copy\nx += [1]     # changes in place\nx = x + [1]  # new list', text: 'Assignment never copies. Copy on purpose when you need two lists.' }],
    },
    {
      id: '15-3', title: 'Copies of copies', bg: 'vault', npc: 'vell', mentor: 'vell', tags: ['deepcopy'],
      steps: [
        { type: 'talk', who: 'vell', text: 'Trap three. a.copy() is a SHALLOW copy: a new outer list, but the inner lists are still shared. copy.deepcopy copies all the way down.' },
        { type: 'demo', text: 'Run it.', code: ['import copy', 'grid = [[1, 2], [3]]', 'shallow = copy.copy(grid)', 'deep = copy.deepcopy(grid)', 'grid[0].append(9)', 'print(shallow)', 'print(deep)'] },
        {
          type: 'predict', text: 'What will it say?', code: ['teams = [["Ada"], ["Wren"]]', 'snap = teams.copy()', 'teams[1].append("Tam")', 'print(snap[1])'],
          wrong: ["['Wren']", "['Tam']", 'Error'],
          explain: 'The copy is shallow, so snap[1] is the very same inner list as teams[1].',
        },
        { type: 'talk', who: 'vell', text: 'The nastiest mirror of all: [[0] * 3] * 3 makes ONE row and repeats it three times. Change one row and they ALL change. Build grids with a comprehension instead.' },
        {
          type: 'predict', text: 'What will it say?', code: ['grid = [[0] * 2] * 2', 'grid[0][0] = 5', 'print(grid)'],
          wrong: ['[[5, 0], [0, 0]]', 'Error', '[[5, 5], [5, 5]]'],
          explain: 'Both rows are the same list, so the 5 shows up in both.',
        },
        {
          type: 'predict', text: 'Built properly. What will it say?', code: ['grid = [[0] * 2 for _ in range(2)]', 'grid[0][0] = 5', 'print(grid)'],
          explain: 'The comprehension builds a new row each time.',
        },
        {
          type: 'fix', text: 'Only the first cell should become 7. Run it, then tap the broken line.',
          code: ['board = [[0] * 3] * 3', 'board[0][0] = 7', 'print(board)'], bad: 0,
          options: ['board = [[0] * 3 for _ in range(3)]', 'board = [[0] * 3] * 3 + []', 'board = [[0, 0, 0]] * 3'], answer: 0,
          explain: 'Each row must be its own list.',
        },
        {
          type: 'write', text: 'Make safe a DEEP copy of party with copy.deepcopy, add "Kip" to the first team in party, then print safe.',
          starter: ['import copy', 'party = [["Ada"], ["Wren"]]'], keys: ['safe', '=', 'copy.deepcopy', '(', ')', 'party', '[', ']', '0', '.append', '"Kip"', 'print'],
          require: l => (has(l, /deepcopy\s*\(\s*party\s*\)/) ? null : 'Use copy.deepcopy(party).'),
          hints: ['safe = copy.deepcopy(party)', 'party[0].append("Kip") then print(safe)'],
          solution: ['safe = copy.deepcopy(party)', 'party[0].append("Kip")', 'print(safe)'],
        },
      ],
      learn: [{ title: 'Shallow vs deep', code: 'copy.copy(x)      # new outer list only\ncopy.deepcopy(x)  # copies everything\n[[0]*3 for _ in range(3)]  # real grid', text: 'Nested lists need a deep copy, and grids need a comprehension.' }],
    },
    {
      id: '15-4', title: 'Mirror imps', bg: 'palace', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(5, 9), p = R.int(4, 7); return { kind: 'mirrorimp', hp: d + 3 * p, d, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Mirror imps copy everything you do! $HP HP. Only a list of your OWN spells will work.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A warm-up spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p }),
          text: 'It has $HP HP left. The imp drains its copy of the list. Give it a COPY, so your list keeps its three powers.',
          lines: ['mine = [$p, $p, $p]', 'imp = mine[]', 'imp.clear()', 'for power in mine:', '    cast(fireball, power)'], chips: ['[:]', '[0]', '[-1]'], answer: [['[:]']],
          goal: { foeDown: true },
          hints: ['Without a copy, clearing imp clears mine too.', 'mine[:]'],
        },
        { type: 'talk', who: 'narrator', text: 'The imp king fights with a cursed default!' },
        {
          type: 'write', vars: R => { const p = R.int(4, 7); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'mirrorimp', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Write charge(power, stack=None) that makes a new list when stack is None, appends power and returns stack. Cast icebolt with sum(charge($p)) twice.',
          starter: [], keys: ['def', 'charge', '(', ')', 'power', 'stack', '=None', ',', ':', 'if', 'is', 'None', '=', '[]', '.append', 'return', 'cast', 'icebolt', 'sum', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /stack\s*=\s*None/) ? null : 'Use stack=None as the default.'),
          hints: ['def charge(power, stack=None): / if stack is None: / stack = []', 'stack.append(power) / return stack, then cast(icebolt, sum(charge($p))) twice'],
          solution: ['def charge(power, stack=None):', '    if stack is None:', '        stack = []', '    stack.append(power)', '    return stack', 'cast(icebolt, sum(charge($p)))', 'cast(icebolt, sum(charge($p)))'],
        },
      ],
      learn: [{ title: 'Copies in battle', code: 'imp = mine[:]', text: 'Hand out copies when someone else may change your list.' }],
    },
    {
      id: '15-5', title: 'Same or equal?', bg: 'vault', npc: 'vell', mentor: 'vell', tags: ['isvseq'],
      steps: [
        { type: 'talk', who: 'vell', text: 'Trap four. == asks: do these look the SAME? is asks: are these the very same OBJECT, one thing with two names? Two equal lists can still be two different lists.' },
        { type: 'demo', text: 'Run it.', code: ['a = [1, 2]', 'b = [1, 2]', 'c = a', 'print(a == b, a is b)', 'print(a == c, a is c)'] },
        {
          type: 'predict', vars: R => ({ x: R.pick(MIRROR_ITEMS) }),
          text: 'What will it say?', code: ['p = ["$x"]', 'q = list(p)', 'print(p == q, p is q)'],
          explain: 'list(p) builds a new list with the same contents: equal, but not the same object.',
        },
        { type: 'talk', who: 'vell', text: 'The rule: use == to compare values. Use is ONLY to check for None: if x is None. Using "is" on numbers or strings sometimes seems to work by luck, and then fails.' },
        {
          type: 'predict', vars: R => R.pick([{ v: 'None' }, { v: '0' }, { v: '""' }, { v: '[]' }]),
          text: 'What will it say?', code: ['x = $v', 'print(x is None)'],
          explain: 'Only None is None. 0, "" and [] are empty, but they are not None.',
        },
        {
          type: 'fill', vars: R => ({ x: R.pick(MIRROR_ITEMS) }),
          text: 'Check whether the two lists hold the same things.',
          lines: ['packed = ["$x", "map"]', 'needed = ["$x", "map"]', 'print(packed [] needed)'], chips: ['==', 'is', 'is not'], answer: [['==']],
          hints: ['Compare the values, not the objects.', 'packed == needed'],
        },
        {
          type: 'fix', text: 'This should say "nothing found" when the search returns None. Run it, then tap the broken line.',
          code: ['def find(items, target):', '    for x in items:', '        if x == target:', '            return x', 'result = find(["a", "b"], "z")', 'if result == "None":', '    print("nothing found")'], bad: 5,
          options: ['if result is None:', 'if result is "None":', 'if result == []:'], answer: 0,
          explain: 'The function returned None (the value), not the text "None". Check with is None.',
        },
        {
          type: 'write', text: 'Print whether answer is None, using is.',
          starter: ['answer = None'], keys: ['print', '(', ')', 'answer', 'is', 'None'],
          require: l => (has(l, /\bis\s+None/) ? null : 'Use "is None".'),
          hints: ['answer is None', 'print(answer is None)'],
          solution: ['print(answer is None)'],
        },
      ],
      learn: [{ title: 'is vs ==', code: 'a == b    # same value\na is b    # same object\nx is None # the one good use', text: 'Compare values with ==. Use is only for None.' }],
    },
    {
      id: '15-6', title: 'Truth in the glass', bg: 'palace', npc: 'vell', mentor: 'vell', tags: ['truthy'],
      steps: [
        { type: 'talk', who: 'vell', text: 'Every value can stand in an if. FALSY values act like False: 0, 0.0, "", [], {}, set() and None. Everything else is TRUTHY. So "if items:" means "if the list is not empty".' },
        { type: 'demo', text: 'Run it.', code: ['for v in [0, 7, "", "hi", [], [0], None]:', '    print(repr(v), bool(v))'] },
        {
          type: 'predict', vars: R => R.pick([{ v: '[]' }, { v: '[0]' }, { v: '"0"' }, { v: '0.0' }, { v: '" "' }]),
          text: 'Truthy or falsy? What will it say?', code: ['if $v:', '    print("truthy")', 'else:', '    print("falsy")'],
          explain: 'Only empty things, zero and None are falsy. [0], "0" and " " are not empty.',
        },
        { type: 'talk', who: 'vell', text: 'x or y gives x if x is truthy, otherwise y. It is a handy default: name = typed or "stranger". But careful: a real 0 is falsy too, so count or 10 turns 0 into 10!' },
        {
          type: 'predict', vars: R => R.pick([{ a: '""', b: '"stranger"' }, { a: '"Ada"', b: '"stranger"' }, { a: '0', b: '10' }, { a: '3', b: '10' }]),
          text: 'What will it say?', code: ['print($a or $b)'],
          explain: 'or hands back the first value if it is truthy, otherwise the second.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(-5, 5) }),
          text: 'A one-line if. What will it say?', code: ['n = $n', 'label = "even" if n % 2 == 0 else "odd"', 'print(label)'],
          explain: 'value_if_true if condition else value_if_false.',
        },
        {
          type: 'fill', vars: R => ({ x: R.pick(MIRROR_ITEMS) }),
          text: 'Print "empty" only when the bag has nothing in it. Use truthiness.',
          lines: ['bag = list()', 'if [] bag:', '    print("empty")', 'else:', '    print("has $x")'], chips: ['not', 'is', 'len'], answer: [['not']],
          hints: ['An empty list is falsy.', 'if not bag:'],
        },
        {
          type: 'write', vars: R => ({ t: R.pick(['', 'Wren', '', 'Ada']) }),
          text: 'Print name, or "stranger" if name is empty. Use or.',
          starter: ['name = "$t"'], keys: ['print', '(', ')', 'name', 'or', '"stranger"'],
          require: l => (has(l, /\bor\b/) ? null : 'Use name or "stranger".'),
          hints: ['An empty string is falsy.', 'print(name or "stranger")'],
          solution: ['print(name or "stranger")'],
        },
      ],
      learn: [
        { title: 'Truthiness', code: 'Falsy: 0  ""  []  {}  None  set()\nif items:     # not empty', text: 'Empty and zero values are falsy; everything else is truthy.' },
        { title: 'or and the one-line if', code: 'name = typed or "stranger"\nx = "a" if ok else "b"', text: 'Defaults and quick choices in one line. Beware: 0 is falsy.' },
      ],
    },
    {
      id: '15-7', title: 'Loops that lie', bg: 'vault', npc: 'vell', mentor: 'vell', tags: ['loopmut'],
      steps: [
        { type: 'talk', who: 'vell', text: 'Trap five. Never remove items from a list while a for loop walks over it. The loop counts by position, so when you remove one, the next item slides back and gets skipped.' },
        { type: 'demo', text: 'Run it. Two 2s went in...', code: ['nums = [1, 2, 2, 3]', 'for n in nums:', '    if n == 2:', '        nums.remove(n)', 'print(nums)'] },
        {
          type: 'predict', text: 'What will it say?', code: ['bag = ["rat", "rat", "gem", "rat"]', 'for x in bag:', '    if x == "rat":', '        bag.remove(x)', 'print(bag)'],
          wrong: ["['gem']", "['gem', 'rat']", 'Error'],
          explain: 'Removing shifts the list under the loop, so some rats are skipped. The loop lies!',
        },
        { type: 'talk', who: 'vell', text: 'The cure: build a new list, keeping what you want, or loop over a copy: for x in bag[:].' },
        {
          type: 'predict', text: 'The cure. What will it say?', code: ['bag = ["rat", "rat", "gem", "rat"]', 'bag = [x for x in bag if x != "rat"]', 'print(bag)'],
          explain: 'The comprehension builds a fresh list with only the keepers.',
        },
        { type: 'talk', who: 'vell', text: 'Last trap: functions made in a loop remember the NAME, not the value. When they finally run, they all see its last value. (Late binding.)' },
        {
          type: 'predict', text: 'What will it say?', code: ['spells = [lambda: i for i in range(3)]', 'print([s() for s in spells])'],
          wrong: ['[0, 1, 2]', '[0, 0, 0]', 'Error'],
          explain: 'Every lambda looks up i when it runs. By then the loop has finished, and i is 2.',
        },
        {
          type: 'fix', text: 'All the 4s should be gone. Run it, then tap the broken line.',
          code: ['nums = [4, 4, 5, 4, 6]', 'for n in nums:', '    if n == 4:', '        nums.remove(n)', 'print(nums)'], bad: 1,
          options: ['for n in nums[:]:', 'for n in nums.remove:', 'for n in range(nums):'], answer: 0,
          explain: 'Loop over a copy, so removing from the real list does not confuse the loop.',
        },
        {
          type: 'write', text: 'Remove every "rat" from bag by building a NEW list with a comprehension, then print bag.',
          starter: ['bag = ["rat", "gem", "rat", "rat", "key"]'], keys: ['bag', '=', '[', ']', 'x', 'for', 'in', 'if', '!=', '"rat"', 'print', '(', ')'],
          require: l => (has(l, /\[\s*\w+\s+for\s+/) ? null : 'Use a list comprehension.'),
          hints: ['bag = [x for x in bag if x != "rat"]', 'print(bag)'],
          solution: ['bag = [x for x in bag if x != "rat"]', 'print(bag)'],
        },
      ],
      learn: [
        { title: 'Changing while looping', code: 'for x in items[:]:   # loop a copy\nitems = [x for x in items if keep(x)]', text: 'Never remove from the list you are looping over.' },
        { title: 'Late binding', code: '[lambda: i for i in range(3)]  # all 2', text: 'Functions look names up when they run, not when they are made.' },
      ],
    },
    {
      id: '15-8', title: 'Pythonic duels', bg: 'palace', mentor: 'narrator', tags: ['pythonic'],
      foe: R => { const d = R.int(5, 9), p = R.int(5, 8); return { kind: 'glasswisp', hp: d + 2 * p, d, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Glass wisps! $HP HP. Fight them the Pythonic way: any(x) is True if ANY item is truthy, all(x) if EVERY item is. And 0 < x < 10 checks a range in one go.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'Is any rune lit? Then strike.', code: ['runes = [0, 0, 1]', 'if any(runes):', '    cast(spark, $d)'] },
        {
          type: 'predict', vars: R => ({ x: R.int(-3, 12) }),
          text: 'Chained comparison. What will it say?', code: ['x = $x', 'print(0 < x < 10)'],
          explain: '0 < x < 10 means 0 < x and x < 10.',
        },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p }),
          text: 'It has $HP HP left. Only strike twice if EVERY shield is down (all are 0).',
          lines: ['shields = [0, 0, 0]', 'if not [](shields):', '    cast(fireball, $p)', '    cast(fireball, $p)'], chips: ['any', 'all', 'len'], answer: [['any']],
          goal: { foeDown: true },
          hints: ['"Every shield is 0" means "no shield is truthy".', 'if not any(shields):'],
        },
        { type: 'talk', who: 'narrator', text: 'A wisp made of many panes!' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'glasswisp', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. If all the panes are cracked (all True), cast icebolt with $p twice.',
          starter: ['panes = [True, True, True]'], keys: ['if', 'all', '(', ')', 'panes', ':', 'cast', 'icebolt', ',', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /all\s*\(\s*panes\s*\)/) ? null : 'Use all(panes).'),
          hints: ['if all(panes):', '    cast(icebolt, $p) twice'],
          solution: ['if all(panes):', '    cast(icebolt, $p)', '    cast(icebolt, $p)'],
        },
      ],
      learn: [{ title: 'Pythonic checks', code: 'any(items)  all(items)\n0 < x < 10', text: 'Ask about a whole list in one call, and check ranges in one line.' }],
    },
    {
      id: '15-9', title: 'The Mirror Witch', bg: 'throne', foe: { kind: 'mirrorwitch', hp: 170, weak: 'fireball', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'mirrorwitch', text: 'WHAT... YOU... SEE... IS... NOT... WHAT... YOU... GET...' },
        { type: 'talk', who: 'narrator', text: 'The Mirror Witch has 170 HP. Fireball shatters glass: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Fireball is doubled.', code: ['a = [3]', 'b = a', 'b.append(4)', 'cast(fireball, sum(a))'],
          explain: 'a and b are the same list, so a is [3, 4]: 7, doubled.',
        },
        {
          type: 'fix', text: 'Each spell call should start fresh. Run it, then tap the broken line.',
          code: ['def gather(x, pile=list()):', '    if pile is None:', '        pile = list()', '    pile.append(x)', '    return pile', 'gather(5)', 'print(gather(6))', 'cast(fireball, sum(gather(1)))'], bad: 0,
          options: ['def gather(x, pile=None):', 'def gather(x, pile=list) :', 'def gather(pile=list(), x=0):'], answer: 0,
          explain: 'With None as the default, every call builds its own fresh pile.',
        },
        { type: 'talk', who: 'mirrorwitch', text: 'MY... GRID... IS... ONE... ROW...' },
        {
          type: 'fill', text: 'Build a real 2 × 2 grid, set one cell to 9, and strike with the total.',
          lines: ['grid = [[0] * 2 []]', 'grid[0][0] = 9', 'cast(fireball, sum(sum(row) for row in grid))'], chips: ['for _ in range(2)', '* 2', '+ [0]'], answer: [['for _ in range(2)']],
          hints: ['A comprehension builds a new row each time.', '[[0] * 2 for _ in range(2)]'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and fireball is doubled. Store power = $HP // 2 + 1, and only if 0 < power < 200, cast fireball with power.',
          starter: [], keys: ['power', '=', '$HP', '//', '2', '+', '1', 'if', '0', '<', '200', ':', 'cast', 'fireball', '(', ')', ','],
          goal: { foeDown: true },
          require: l => (has(l, /0\s*<\s*power\s*<\s*200/) ? null : 'Use the chained check 0 < power < 200.'),
          hints: ['power = $HP // 2 + 1', 'if 0 < power < 200: / cast(fireball, power)'],
          solution: ['power = $HP // 2 + 1', 'if 0 < power < 200:', '    cast(fireball, power)'],
        },
        { type: 'talk', who: 'mirrorwitch', text: '...the... glass... breaks...' },
      ],
      learn: [{ title: 'Mirror toolkit', code: 'bag=None  a[:]  deepcopy  is None  if items:  for x in a[:]', text: 'Every trap from the Hall of Mirrors, and how to dodge it.' }],
    },
  ],
};
WORLDS.push(WORLD15);

(() => {
  const { makeQ, rnd } = Arena;
  Object.assign(Arena.GEN, {
    mutdefault: () => makeQ(['def f(x, b=[]):', '    b.append(x)', '    return len(b)', 'f(1)', 'print(f(2))'], [1, 'Error']),
    aliasing: () => (rnd(0, 1) === 0
      ? makeQ(['a = [1]', 'b = a', 'b.append(2)', 'print(a)'], ['[1]', '[2]'])
      : makeQ(['a = [1]', 'b = a[:]', 'b.append(2)', 'print(a)'], ['[1, 2]', '[2]'])),
    deepcopy: () => (rnd(0, 1) === 0
      ? makeQ(['g = [[0] * 2] * 2', 'g[1][1] = 3', 'print(g)'], ['[[0, 0], [0, 3]]', 'Error'])
      : makeQ(['a = [[1]]', 'b = a.copy()', 'a[0].append(2)', 'print(b)'], ['[[1]]', '[[2]]'])),
    isvseq: () => makeQ(['a = [1]', 'b = [1]', 'print(a == b, a is b)'], ['True True', 'False False']),
    truthy: () => {
      const v = rnd(0, 2);
      if (v === 0) return makeQ(['print(0 or 10)'], [0, 'False']);
      if (v === 1) return makeQ(['print(bool([0]))'], ['False', 'Error']);
      return makeQ(['x = ""', 'print("yes" if x else "no")'], ['yes', 'Error']);
    },
    loopmut: () => makeQ(['n = [2, 2, 3]', 'for x in n:', '    if x == 2:', '        n.remove(x)', 'print(n)'], ['[3]', 'Error']),
    pythonic: () => {
      const x = rnd(-3, 12);
      return rnd(0, 1) === 0 ? makeQ([`print(0 < ${x} < 10)`], ['Error', String(x)]) : makeQ(['print(any([0, "", None]), all([1, "a"]))'], ['True True', 'False False']);
    },
  });
})();
