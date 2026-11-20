/* World 40: The Shifting Sands. Flexible functions: *args, **kwargs, unpacking with * and **
   in calls and assignments, keyword-only parameters and defaults (including the shared-list
   trap), type hints and docstrings, and the errors that come with them. */
const GOODS = ['salt', 'silk', 'spice', 'dates', 'amber', 'tea'];

const WORLD40 = {
  id: 40, name: 'The Shifting Sands', topic: 'flexible functions', map: 'bg-map17.jpg',
  nodes: [[50, 92], [30, 82], [70, 73], [32, 63], [68, 53], [32, 43], [66, 33], [36, 22], [50, 9]],
  levels: [
    {
      id: '40-1', title: 'Any number of bags', bg: 'desert', npc: 'caravan', mentor: 'caravan', tags: ['argsq'],
      steps: [
        { type: 'talk', who: 'caravan', text: "Welcome to the Shifting Sands, {NAME}. I'm Zafi, master of this caravan. Some days a trader brings two bags, some days ten. def pack(*bags): accepts any number of values, gathered into a tuple called bags." },
        { type: 'demo', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9), c: R.int(1, 9) }), text: 'Run it.', code: ['def total(*coins):', '    print(coins)', '    return sum(coins)', 'print(total($a, $b, $c))', 'print(total())'] },
        {
          type: 'predict', vars: R => ({ ws: R.sample(GOODS, 3) }), text: 'What will it say?',
          code: ['def count(*items):', '    return len(items)', 'print(count(), count("$(ws[0])"), count("$(ws[0])", "$(ws[1])", "$(ws[2])"))'],
          explain: 'items holds however many values were passed: 0, 1 and 3.',
        },
        {
          type: 'predict', vars: R => ({ ns: R.sample(Engine.NAMES, 3) }), text: 'A normal parameter first, the rest after. What will it say?',
          code: ['def greet(greeting, *names):', '    for n in names:', '        print(greeting, n)', 'greet("Salaam", "$(ns[0])", "$(ns[1])")'],
          explain: 'The first value fills greeting. The others are gathered into names.',
        },
        {
          type: 'fill', vars: R => ({ xs: [R.int(1, 30), R.int(1, 30), R.int(1, 30)] }), text: 'Accept any number of numbers and return the biggest.',
          lines: ['def biggest([]nums):', '    return [](nums)', 'print(biggest($(xs.join(", "))))'], chips: ['*', 'max', '**', 'len'], answer: [['*', 'max']],
          hints: ['*nums gathers every value.', 'max(nums)'],
        },
        {
          type: 'write', vars: R => ({ ws: R.sample(GOODS, 3) }), text: 'Write shout_all(*words) that returns all the words in capitals, joined with spaces. Print shout_all("$(ws[0])", "$(ws[1])", "$(ws[2])").',
          starter: [], keys: ['def', 'shout_all', '(*words):', 'return', '" ".join', '(', ')', 'w.upper()', 'for', 'w', 'in', 'words', 'print', 'shout_all("$(ws[0])", "$(ws[1])", "$(ws[2])")'],
          require: l => (has(l, /def\s+shout_all\s*\(\s*\*/) ? null : 'Use *words in the def line.'),
          hints: ['def shout_all(*words):', '    return " ".join(w.upper() for w in words)'],
          solution: ['def shout_all(*words):', '    return " ".join(w.upper() for w in words)', 'print(shout_all("$(ws[0])", "$(ws[1])", "$(ws[2])"))'],
        },
      ],
      learn: [{ title: '*args', code: 'def total(*coins):\n    return sum(coins)', text: 'Gathers any number of positional values into a tuple.' }],
    },
    {
      id: '40-2', title: 'Labelled bags', bg: 'desert', npc: 'nomad', mentor: 'nomad', tags: ['kwargsq'],
      steps: [
        { type: 'talk', who: 'nomad', text: "Nomad Kesh. Bags with labels! def describe(**traits): gathers every name=value you pass into a dict called traits." },
        { type: 'demo', vars: R => ({ c: R.pick(['gold', 'blue', 'red']), w: R.int(2, 20) }), text: 'Run it.', code: ['def describe(**traits):', '    for key, value in traits.items():', '        print(key, "=", value)', 'describe(color="$c", weight=$w)'] },
        {
          type: 'predict', vars: R => ({ c: R.pick(['gold', 'blue', 'red']), w: R.int(2, 20) }), text: 'What will it say?',
          code: ['def tag(**info):', '    return len(info), info["color"]', 'print(tag(color="$c", weight=$w))'],
          explain: 'info is {"color": "$c", "weight": $w}: 2 entries.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9) }), text: 'All three kinds at once. What will it say?',
          code: ['def f(first, *rest, **opts):', '    print(first, rest, opts)', 'f($a, $b, 3, mode="fast")'],
          explain: 'first takes $a, rest takes the other positional values, opts takes the named one.',
        },
        {
          type: 'fill', vars: R => ({ h: R.int(10, 50), m: R.int(10, 50) }), text: 'Gather any named stats and add them up.',
          lines: ['def power(**[]):', '    return sum(stats.[]())', 'print(power(hp=$h, mana=$m))'], chips: ['stats', 'values', 'keys', '*stats'], answer: [['stats', 'values']],
          hints: ['**stats gathers the named values into a dict.', 'stats.values() gives the numbers.'],
        },
        {
          type: 'write', vars: R => ({ n: R.pick(Engine.NAMES), a: R.int(1, 20), b: R.int(1, 20) }), text: 'Write make_hero(name, **stats) that returns the name, a space, and the total of all stats. Print make_hero("$n", str=$a, dex=$b).',
          starter: [], keys: ['def', 'make_hero', '(name, **stats):', 'return', 'name', '+', '" "', 'str', 'sum', 'stats.values()', '(', ')', 'print', 'make_hero("$n", str=$a, dex=$b)'],
          require: l => (has(l, /\*\*stats/) ? null : 'Use **stats in the def line.'),
          hints: ['def make_hero(name, **stats):', '    return name + " " + str(sum(stats.values()))'],
          solution: ['def make_hero(name, **stats):', '    return name + " " + str(sum(stats.values()))', 'print(make_hero("$n", str=$a, dex=$b))'],
        },
      ],
      learn: [{ title: '**kwargs', code: 'def describe(**traits):\n    traits["color"]', text: 'Gathers any named values into a dict.' }],
    },
    {
      id: '40-3', title: 'Opening the bags', bg: 'desert', npc: 'caravan', mentor: 'caravan', tags: ['unpackcall'],
      steps: [
        { type: 'talk', who: 'caravan', text: 'The stars work the other way too. f(*items) spreads a list into separate values. f(**opts) spreads a dict into name=value pairs.' },
        { type: 'demo', vars: R => ({ ws: R.sample(GOODS, 3) }), text: 'Run it.', code: ['goods = $(JSON.stringify(ws))', 'print(goods)', 'print(*goods)', 'print(*goods, sep=" | ")'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 20), b: R.int(1, 20) }), text: 'What will it say?',
          code: ['def trade(give, get):', '    return get - give', 'deal = [$a, $b]', 'print(trade(*deal))'],
          explain: '*deal passes $a as give and $b as get: $b - $a = $(b - a).',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 20), b: R.int(1, 20) }), text: 'Spreading a dict. What will it say?',
          code: ['def trade(give, get):', '    return get - give', 'deal = {"get": $a, "give": $b}', 'print(trade(**deal))'],
          explain: 'Names match parameters, whatever the order: get=$a, give=$b, so $a - $b = $(a - b).',
        },
        {
          type: 'fill', vars: R => ({ xs: [R.int(1, 9), R.int(1, 9), R.int(1, 9)] }), text: 'Pass the three sides straight from the list.',
          lines: ['def perimeter(a, b, c):', '    return a + b + c', 'sides = $(JSON.stringify(xs))', 'print(perimeter([]sides))'], chips: ['*', '**', '&'], answer: [['*']],
          hints: ['* spreads a list into separate values.'],
        },
        {
          type: 'write', vars: R => ({ ws: R.sample(GOODS, 4) }), text: 'Print every item in cargo on one line, separated by " - ", using print(*cargo, sep=...).',
          starter: ['cargo = $(JSON.stringify(ws))'], keys: ['print', '(', ')', '*cargo', ',', 'sep=', '" - "'],
          require: l => (has(l, /\*cargo/) ? null : 'Spread the list with *cargo.'),
          hints: ['print(*cargo, sep=" - ")'],
          solution: ['print(*cargo, sep=" - ")'],
        },
      ],
      learn: [{ title: 'Spreading values', code: 'f(*items)\nf(**opts)\nprint(*items)', text: '* spreads a list into separate values, ** spreads a dict into named values.' }],
    },
    {
      id: '40-4', title: 'Sand wurms', bg: 'dunes', mentor: 'narrator', tags: [],
      foe: R => { const xs = [R.int(4, 9), R.int(4, 9), R.int(4, 9)]; return { kind: 'wurm', hp: xs[0] + xs[1] + xs[2], xs }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'A sand wurm bursts from the dunes! Write a volley spell that casts as many times as you ask.' },
        {
          type: 'fill', vars: (R, c) => ({ xs: c.foe.xs }), text: 'The wurm has $HP HP. Fire the whole volley.',
          lines: ['def volley([]powers):', '    for p in powers:', '        cast(fireball, p)', 'volley($(xs.join(", ")))'],
          chips: ['*', '**', '&'], answer: [['*']], goal: { foeDown: true },
          hints: ['*powers gathers every value.'],
        },
        { type: 'talk', who: 'narrator', text: 'The great wurm rises, shaking the whole desert!' },
        {
          type: 'write', vars: R => ({ xs: [R.int(8, 15), R.int(8, 15), R.int(8, 15), R.int(8, 15)] }), spawn: v => ({ kind: 'wurm', hp: v.xs.reduce((a, b) => a + b, 0), tint: 'big' }),
          text: 'Write volley(*powers) that casts icebolt once per power, then fire it using the list waves spread out with *.',
          starter: ['waves = $(JSON.stringify(xs))'], keys: ['def', 'volley', '(*powers):', 'for', 'p', 'in', 'powers', ':', 'cast', '(', ')', 'icebolt', ',', 'volley(*waves)'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+volley\s*\(\s*\*/) && has(l, /volley\(\s*\*waves/) ? null : 'Use *powers in the def and volley(*waves) in the call.'),
          hints: ['def volley(*powers): / for p in powers: / cast(icebolt, p)', 'volley(*waves)'],
          solution: ['def volley(*powers):', '    for p in powers:', '        cast(icebolt, p)', 'volley(*waves)'],
        },
      ],
      learn: [{ title: 'Volleys', code: 'def volley(*powers): ...\nvolley(*waves)', text: 'Gather with * in the def, spread with * in the call.' }],
    },
    {
      id: '40-5', title: 'Splitting the load', bg: 'desert', npc: 'nomad', mentor: 'nomad', tags: ['unpackassign'],
      steps: [
        { type: 'talk', who: 'nomad', text: 'Unpacking splits a list into jars: a, b = pair. A star jar takes the leftovers: first, *rest = items. And a, b = b, a swaps two jars in one line.' },
        {
          type: 'predict', vars: R => ({ ws: R.sample(GOODS, 4) }), text: 'What will it say?',
          code: ['first, *rest = $(JSON.stringify(ws))', 'print(first, rest)'],
          explain: 'first takes the first item, rest takes all the others as a list.',
        },
        {
          type: 'predict', vars: R => ({ ws: R.sample(GOODS, 4) }), text: 'The star can be at the front too. What will it say?',
          code: ['*front, last = $(JSON.stringify(ws))', 'print(len(front), last)'],
          explain: 'last takes the final item, front takes everything before it.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 20), b: R.int(21, 40) }), text: 'Swapping. What will it say?',
          code: ['left = $a', 'right = $b', 'left, right = right, left', 'print(left, right)'],
          explain: 'Both values are read first, then stored the other way round.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ ws: R.sample(GOODS, 3) }), text: 'Which error will this cause?',
          code: ['a, b = $(JSON.stringify(ws))'],
          explain: 'Three values, two jars: ValueError (too many values to unpack).',
        },
        {
          type: 'fill', vars: R => ({ xs: [R.int(1, 9), R.int(1, 9), R.int(1, 9), R.int(1, 9)] }), text: 'Keep the first reading, and gather the rest.',
          lines: ['readings = $(JSON.stringify(xs))', 'head, []tail = readings', 'print(head, sum([]))'], chips: ['*', 'tail', 'head', '**'], answer: [['*', 'tail']],
          hints: ['A star jar takes the leftovers.', 'sum(tail)'],
        },
        {
          type: 'write', vars: R => ({ a: R.pick(Engine.NAMES), l: R.int(1, 30), g: R.int(1, 99) }), text: 'record is a tuple. Unpack it into name, level and gold in one line, then print the gold.',
          starter: ['record = ("$a", $l, $g)'], keys: ['name', ',', 'level', 'gold', '=', 'record', 'print', '(', ')'],
          require: l => (has(l, /\w+\s*,\s*\w+\s*,\s*\w+\s*=\s*record/) ? null : 'Unpack all three in one line: name, level, gold = record'),
          hints: ['name, level, gold = record', 'print(gold)'],
          solution: ['name, level, gold = record', 'print(gold)'],
        },
      ],
      learn: [{ title: 'Unpacking', code: 'a, b = pair\nfirst, *rest = items\na, b = b, a', text: 'Split sequences into jars. A star jar collects what is left.' }],
    },
    {
      id: '40-6', title: 'Named only', bg: 'desert', npc: 'caravan', mentor: 'caravan', tags: ['kwonly'],
      steps: [
        { type: 'talk', who: 'caravan', text: 'Parameters after a bare * must be given by name: def sell(item, *, price). Defaults like def sell(item, price=10) fill in what is missing. One trap: a default list is made once and shared by every call.' },
        {
          type: 'predict', vars: R => ({ w: R.pick(GOODS), p: R.int(5, 50) }), text: 'What will it say?',
          code: ['def sell(item, *, price, tax=1):', '    return f"{item}: {price + tax}"', 'print(sell("$w", price=$p))', 'print(sell("$w", price=$p, tax=5))'],
          explain: 'price must be named. tax keeps its default 1 unless given.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ w: R.pick(GOODS), p: R.int(5, 50) }), text: 'Which error will this cause?',
          code: ['def sell(item, *, price):', '    return price', 'sell("$w", $p)'],
          explain: 'price comes after *, so it cannot be given by position: TypeError.',
        },
        {
          type: 'predict', vars: R => ({ a: R.pick(GOODS), b: R.pick(GOODS) }), text: 'The shared-list trap. What will it say?',
          code: ['def add_item(item, bag=[]):', '    bag.append(item)', '    return bag', 'add_item("$a")', 'print(add_item("$b"))'],
          wrong: ['[\'$b\']'],
          explain: 'The default list was made once, when def ran, so both calls fill the same list.',
        },
        {
          type: 'fix', vars: R => ({ a: R.pick(GOODS), b: R.pick(GOODS) }), text: 'Each call should get a fresh bag. Run it, then tap the line to fix.',
          code: ['def add_item(item, bag=None):', '    if bag is None:', '        bag = list()', '    bag.append(item)', '    return bag', 'add_item("$a")', 'print(add_item("$b"))'].map((l, i) => (i === 1 ? '    if bag is not None:' : l)), bad: 1,
          options: ['    if bag is None:', '    if bag == list():', '    if not bag is None:'], answer: 0,
          explain: 'Use None as the default, and make a new list inside the function when it is None.',
        },
        {
          type: 'write', vars: R => ({ w: R.pick(GOODS), q: R.int(2, 9) }), text: 'Write order(item, *, qty=1) that returns the item repeated qty times, joined with commas. Print order("$w", qty=$q).',
          starter: [], keys: ['def', 'order', '(item, *, qty=1):', 'return', '",".join', '(', ')', '[item] * qty', 'print', 'order("$w", qty=$q)'],
          require: l => (has(l, /\*\s*,\s*qty\s*=\s*1/) ? null : 'Make qty keyword-only with a default: (item, *, qty=1)'),
          hints: ['def order(item, *, qty=1):', '    return ",".join([item] * qty)'],
          solution: ['def order(item, *, qty=1):', '    return ",".join([item] * qty)', 'print(order("$w", qty=$q))'],
        },
      ],
      learn: [{ title: 'Keyword-only and defaults', code: 'def sell(item, *, price, tax=1):\ndef f(bag=None):', text: 'After * a parameter needs its name. Use None, not [], as a default for lists.' }],
    },
    {
      id: '40-7', title: 'Signposts', bg: 'desert', npc: 'nomad', mentor: 'nomad', tags: ['hints'],
      steps: [
        { type: 'talk', who: 'nomad', text: 'Signposts help travellers. Type hints like def f(x: int) -> str: tell readers (and tools like mypy) what a function expects. Python itself does not enforce them! A docstring, the string on the first line, explains what it does.' },
        { type: 'demo', vars: R => ({ n: R.int(2, 9) }), text: 'Run it.', code: ['def double(n: int) -> int:', '    """Return n times two."""', '    return n * 2', 'print(double($n))', 'print(double.__doc__)'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(GOODS) }), text: 'The hint says int. What will it say?',
          code: ['def double(n: int) -> int:', '    return n * 2', 'print(double("$w"))'],
          wrong: ['Error'],
          explain: 'Hints are only signposts. Python runs it anyway, and "$w" * 2 repeats the word.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9) }), text: 'Hints on variables too. What will it say?',
          code: ['gold: int = $a', 'name: str = "trader"', 'gold += $b', 'print(name, gold)'],
          explain: 'gold: int = $a is a normal assignment with a signpost on it.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9) }), text: 'Add the signposts: two ints in, an int out.',
          lines: ['def add(a: [], b: int) [] int:', '    return a + b', 'print(add($a, $b))'], chips: ['int', '->', 'str', '=>'], answer: [['int', '->']],
          hints: ['a: int', 'The return hint uses ->'],
        },
        {
          type: 'write', vars: R => ({ w: R.pick(GOODS) }), text: 'Write label(item: str) -> str with a docstring line, returning "[" + item + "]". Print label("$w").',
          starter: [], keys: ['def', 'label', '(item: str)', '->', 'str', ':', '"""Wrap the item in brackets."""', 'return', '"["', '+', 'item', '"]"', 'print', 'label("$w")'],
          require: l => (has(l, /item\s*:\s*str/) && has(l, /->\s*str/) && has(l, /"""/) ? null : 'Add the hints (item: str) -> str and a docstring.'),
          hints: ['def label(item: str) -> str:', '    """Wrap the item in brackets.""" / return "[" + item + "]"'],
          solution: ['def label(item: str) -> str:', '    """Wrap the item in brackets."""', '    return "[" + item + "]"', 'print(label("$w"))'],
        },
      ],
      learn: [{ title: 'Type hints and docstrings', code: 'def f(x: int) -> str:\n    """What f does."""', text: 'Signposts for humans and tools. Python does not check them while running.' }],
    },
    {
      id: '40-8', title: 'Mirage traps', bg: 'dunes', mentor: 'narrator', tags: ['sigerr'],
      foe: R => ({ kind: 'wurm', hp: 70, weak: 'icebolt' }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'Mirages twist your spell calls! Each one is a real mistake with function arguments.' },
        {
          oneOf: [
            { type: 'predict', measure: 'errtype', text: 'Which error will this cause?', code: ['def f(a, b):', '    return a + b', 'f(1, c=2)'], explain: 'There is no parameter called c: TypeError.' },
            { type: 'predict', measure: 'errtype', text: 'Which error will this cause?', code: ['def f(a, b):', '    return a + b', 'f(1, a=2)'], explain: 'a was given twice, once by position and once by name: TypeError.' },
            { type: 'predict', measure: 'errtype', text: 'Which error will this cause?', code: ['def f(*nums):', '    return sum(nums)', 'f(nums=[1, 2])'], explain: '*nums only takes positional values, so nums= is unexpected: TypeError.' },
            { type: 'predict', measure: 'errtype', text: 'Which error will this cause?', code: ['x, y, z = [1, 2]'], explain: 'Three jars, two values: ValueError (not enough values to unpack).' },
          ],
        },
        {
          type: 'fix', vars: R => ({ a: R.int(10, 15), b: R.int(10, 15) }), text: 'The volley never fires. Run it, then tap the broken line.',
          code: ['def volley(*powers):', '    print(len(powers), "waves")', '    for p in powers:', '        cast(icebolt, p)', 'waves = [$a, $b]', 'volley(waves)'], bad: 5,
          options: ['volley(*waves)', 'volley(**waves)', 'volley(waves[0])'], answer: 0,
          explain: 'Without *, the whole list arrives as one power. *waves spreads it out.',
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Finish it! $HP HP left, icebolt is doubled. Call strike with the dict opts spread out using **.',
          starter: ['def strike(*, spell, power):', '    cast(spell, power)', 'opts = {"spell": icebolt, "power": $q}'], keys: ['strike', '(', ')', '**opts'],
          goal: { foeDown: true },
          require: l => (has(l, /\*\*opts/) ? null : 'Spread the dict with **opts.'),
          hints: ['strike(**opts)'],
          solution: ['strike(**opts)'],
        },
      ],
      learn: [{ title: 'Argument errors', code: 'unexpected keyword  multiple values\nmissing argument  wrong number to unpack', text: 'Most are TypeError. Read the message: it names the parameter.' }],
    },
    {
      id: '40-9', title: 'The Sand Titan', bg: 'sandtemple', foe: { kind: 'sandtitan', hp: 250, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'sandtitan', text: 'I AM MADE OF COUNTLESS GRAINS. HOW WILL YOU STRIKE THEM ALL?' },
        { type: 'talk', who: 'narrator', text: 'The Sand Titan has 250 HP. Icebolt turns its sand to glass for double. Fireball is halved.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ xs: [R.int(3, 7), R.int(3, 7), R.int(3, 7)] }), text: 'How much damage will this deal? Icebolt is doubled.',
          code: ['def storm(*grains):', '    cast(icebolt, sum(grains))', 'storm(*$(JSON.stringify(xs)), 1)'],
          explain: 'The list is spread out and 1 is added: $(xs[0] + xs[1] + xs[2] + 1), doubled.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(8, 14) }), text: 'Pass the spell settings by name from a dict.',
          lines: ['def blast(*, spell, power):', '    cast(spell, power)', 'settings = {"spell": icebolt, "power": $a}', 'blast([]settings)'], chips: ['**', '*', '&'], answer: [['**']],
          hints: ['** spreads a dict into named values.'],
        },
        { type: 'talk', who: 'sandtitan', text: 'I SPLIT MYSELF IN TWO. FIRST... AND THE REST.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ xs: [R.int(8, 12), R.int(2, 4), R.int(2, 4)] }), text: 'How much damage will this deal?',
          code: ['first, *rest = $(JSON.stringify(xs))', 'cast(icebolt, first)', 'cast(fireball, sum(rest))'],
          explain: 'icebolt $(xs[0]) is doubled, fireball $(xs[1] + xs[2]) is halved.',
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Final blow! $HP HP left, icebolt is doubled. Write finish(*parts, spell=icebolt) that casts spell with sum(parts). Then call finish($q).',
          starter: [], keys: ['def', 'finish', '(*parts, spell=icebolt):', 'cast', '(', ')', 'spell', ',', 'sum(parts)', 'finish($q)'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+finish\s*\(\s*\*parts/) ? null : 'Use *parts in the def line.'),
          hints: ['def finish(*parts, spell=icebolt):', '    cast(spell, sum(parts))  then  finish($q)'],
          solution: ['def finish(*parts, spell=icebolt):', '    cast(spell, sum(parts))', 'finish($q)'],
        },
        { type: 'talk', who: 'sandtitan', text: 'grains... scattered... the sands are calm.' },
      ],
      learn: [{ title: 'Flexible functions', code: 'def f(a, *args, k=1, **kwargs)\nf(*xs, **opts)', text: 'Functions that take anything, and calls that spread lists and dicts.' }],
    },
  ],
};
WORLDS.push(WORLD40);
