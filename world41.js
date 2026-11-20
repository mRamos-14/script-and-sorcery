/* World 41: The River of Time. Iterators and next(), generator functions with yield,
   endless generators, generator expressions, dict and set comprehensions, nested
   comprehensions and generator pipelines. Ends with 18-R The Last Gate (Worlds 1 to 18). */
const BOATS = ['raft', 'skiff', 'canoe', 'barge', 'ferry'];

const WORLD41 = {
  id: 41, name: 'The River of Time', topic: 'iterators, generators and comprehensions', map: 'bg-map18.jpg',
  nodes: [[50, 93], [28, 84], [70, 76], [32, 67], [68, 58], [30, 49], [68, 40], [34, 30], [64, 20], [50, 8]],
  levels: [
    {
      id: '41-1', title: 'One at a time', bg: 'river', npc: 'ferryman', mentor: 'ferryman', tags: ['iterq'],
      steps: [
        { type: 'talk', who: 'ferryman', text: "Climb aboard, {NAME}. I'm Ferryman Oak. On this river things arrive one at a time. iter(items) gives an iterator, and next() takes the next thing from it. A for loop does exactly this behind the scenes." },
        { type: 'demo', vars: R => ({ bs: R.sample(BOATS, 3) }), text: 'Run it.', code: ['boats = iter($(JSON.stringify(bs)))', 'print(next(boats))', 'print(next(boats))', 'print(list(boats))'] },
        {
          type: 'predict', vars: R => ({ bs: R.sample(BOATS, 3) }), text: 'An iterator remembers where it stopped. What will it say?',
          code: ['it = iter($(JSON.stringify(bs)))', 'next(it)', 'for b in it:', '    print(b)'],
          explain: 'next already took the first boat, so the loop only sees the other two.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ b: R.pick(BOATS) }), text: 'The river runs dry. Which error will this cause?',
          code: ['it = iter(["$b"])', 'next(it)', 'next(it)'],
          explain: 'Nothing is left, so next raises StopIteration. A for loop catches it and stops quietly.',
        },
        {
          type: 'predict', vars: R => ({ b: R.pick(BOATS) }), text: 'next with a fallback. What will it say?',
          code: ['it = iter(["$b"])', 'print(next(it, "empty"))', 'print(next(it, "empty"))'],
          explain: 'The second argument is returned instead of raising StopIteration.',
        },
        {
          type: 'fill', vars: R => ({ xs: [R.int(1, 9), R.int(1, 9), R.int(1, 9)] }), text: 'Take the first value by hand, then add up the rest.',
          lines: ['it = [](  $(JSON.stringify(xs)))'.replace('(  ', '('), 'first = [](it)', 'print(first, sum(it))'], chips: ['iter', 'next', 'list', 'len'], answer: [['iter', 'next']],
          hints: ['iter() makes the iterator.', 'next() takes one value.'],
        },
        {
          type: 'write', vars: R => ({ bs: R.sample(BOATS, 4) }), text: 'Make an iterator over boats, skip the first boat with next(), then print the rest as a list.',
          starter: ['boats = $(JSON.stringify(bs))'], keys: ['it', '=', 'iter', '(', ')', 'boats', 'next', 'print', 'list', 'it'],
          require: l => (has(l, /iter\(/) && has(l, /next\(/) ? null : 'Use iter() and next().'),
          hints: ['it = iter(boats) / next(it)', 'print(list(it))'],
          solution: ['it = iter(boats)', 'next(it)', 'print(list(it))'],
        },
      ],
      learn: [{ title: 'Iterators', code: 'it = iter(items)\nnext(it)\nnext(it, "default")', text: 'One item at a time. When empty, next raises StopIteration (or returns the default).' }],
    },
    {
      id: '41-2', title: 'The yield spell', bg: 'river', npc: 'clockmaker', mentor: 'clockmaker', tags: ['yieldq'],
      steps: [
        { type: 'talk', who: 'clockmaker', text: "Clockmaker Iva. A function with yield instead of return is a generator. Calling it starts nothing! Each next() runs it until the next yield, then pauses right there until asked again." },
        { type: 'demo', text: 'Run it and watch the lines take turns.', code: ['def countdown(n):', '    while n > 0:', '        print("making", n)', '        yield n', '        n -= 1', 'for x in countdown(3):', '    print("got", x)'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9), b: R.int(10, 20) }), text: 'What will it say?',
          code: ['def two():', '    yield $a', '    yield $b', 'g = two()', 'print(next(g) + next(g))'],
          explain: 'The first next gives $a, the second resumes and gives $b.',
        },
        {
          type: 'predict', text: 'Calling a generator function runs none of its code. What will it say?',
          code: ['def noisy():', '    print("started")', '    yield 1', 'g = noisy()', 'print("made it")', 'print(next(g))'],
          explain: '"started" only appears when next() first runs the body.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 6) }), text: 'What will it say?',
          code: ['def evens(limit):', '    for n in range(limit):', '        if n % 2 == 0:', '            yield n', 'print(list(evens($n)))'],
          explain: 'The generator yields only the even numbers below $n.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(3, 6) }), text: 'Yield each square instead of building a list.',
          lines: ['def squares(n):', '    for i in range(1, n + 1):', '        [] i * i', 'print(list([]($n)))'], chips: ['yield', 'squares', 'return', 'print'], answer: [['yield', 'squares']],
          hints: ['yield hands back one value and pauses.', 'list(squares($n)) collects them all.'],
        },
        {
          type: 'write', vars: R => ({ bs: R.sample(BOATS, 3) }), text: 'Write a generator shout(words) that yields each word in capitals. Then print(list(shout(boats))).',
          starter: ['boats = $(JSON.stringify(bs))'], keys: ['def', 'shout', '(words):', 'for', 'w', 'in', 'words', ':', 'yield', 'w.upper()', 'print', 'list', '(', ')', 'shout(boats)'],
          require: l => (has(l, /yield/) ? null : 'Use yield.'),
          hints: ['def shout(words): / for w in words:', '        yield w.upper()  then  print(list(shout(boats)))'],
          solution: ['def shout(words):', '    for w in words:', '        yield w.upper()', 'print(list(shout(boats)))'],
        },
      ],
      learn: [{ title: 'Generators', code: 'def count(n):\n    for i in range(n):\n        yield i', text: 'yield pauses the function and hands back a value. It continues on the next next().' }],
    },
    {
      id: '41-3', title: 'Endless rivers', bg: 'river', npc: 'ferryman', mentor: 'ferryman', tags: ['infgen'],
      steps: [
        { type: 'talk', who: 'ferryman', text: 'Because a generator only works when asked, it can go on forever: while True: yield. You take as much as you need and stop.' },
        { type: 'demo', text: 'Run it.', code: ['def tides():', '    n = 1', '    while True:', '        yield n', '        n *= 2', 'for t in tides():', '    if t > 20:', '        break', '    print(t)'] },
        {
          type: 'predict', vars: R => ({ k: R.int(3, 5) }), text: 'Taking a few from forever. What will it say?',
          code: ['def naturals():', '    n = 1', '    while True:', '        yield n', '        n += 1', 'g = naturals()', 'print([next(g) for _ in range($k)])'],
          explain: 'Only $k values are ever made.',
        },
        {
          type: 'predict', text: 'Fibonacci, forever. What will it say?',
          code: ['def fib():', '    a, b = 0, 1', '    while True:', '        yield a', '        a, b = b, a + b', 'out = list()', 'for n in fib():', '    if n > 30:', '        break', '    out.append(n)', 'print(out)'],
          explain: 'Each number is the sum of the two before it. The loop stops past 30.',
        },
        {
          type: 'fix', text: 'This spell never ends. Run it, then tap the broken line.',
          code: ['def drops():', '    n = 0', '    while True:', '        yield n', '        n += 1', 'for d in drops():', '    if d == 3:', '        continue', '    print(d)'], bad: 7,
          options: ['        break', '        pass', '        d = 0'], answer: 0,
          explain: 'An endless generator needs the loop to break out. continue just skips to the next drop, forever.',
        },
        {
          type: 'write', vars: R => ({ k: R.int(3, 6) }), text: 'Write an endless generator odds() that yields 1, 3, 5, ... Then print the first $k of them as a list using next().',
          starter: [], keys: ['def', 'odds', '():', 'n', '=', '1', 'while', 'True', ':', 'yield', 'n', '+=', '2', 'g', 'odds()', 'print', '[next(g) for _ in range($k)]'],
          require: l => (has(l, /while\s+True/) && has(l, /yield/) ? null : 'Use while True with yield.'),
          hints: ['def odds(): / n = 1 / while True: / yield n / n += 2', 'g = odds() / print([next(g) for _ in range($k)])'],
          solution: ['def odds():', '    n = 1', '    while True:', '        yield n', '        n += 2', 'g = odds()', 'print([next(g) for _ in range($k)])'],
        },
      ],
      learn: [{ title: 'Endless generators', code: 'while True:\n    yield n', text: 'Values are only made when asked, so a generator can be infinite. Always stop the loop that reads it.' }],
    },
    {
      id: '41-4', title: 'River spirits', bg: 'rapids', mentor: 'narrator', tags: [],
      foe: R => { const s = R.int(4, 8), k = 3; return { kind: 'riverspirit', hp: s * k * (k + 1) / 2, s, k }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'River spirits rise from the rapids! Let a generator feed your spells, one wave at a time.' },
        {
          type: 'fill', vars: (R, c) => ({ s: c.foe.s }), text: 'The spirit has $HP HP. Each wave is stronger. Cast fireball for every power the generator yields.',
          lines: ['def waves(step):', '    for i in range(1, 4):', '        [] i * step', 'for p in [](  $s):'.replace('(  ', '('), '    cast(fireball, p)'], chips: ['yield', 'waves', 'return', 'range'], answer: [['yield', 'waves']],
          goal: { foeDown: true },
          hints: ['yield each power.', 'for p in waves($s):'],
        },
        { type: 'talk', who: 'narrator', text: 'A great flood spirit surges up!' },
        {
          type: 'write', vars: R => ({ p: R.int(10, 16) }), spawn: v => ({ kind: 'riverspirit', hp: v.p * 4, tint: 'big' }),
          text: 'Write an endless generator surge() that yields $p forever. Cast icebolt with the first 4 values it gives.',
          starter: [], keys: ['def', 'surge', '():', 'while', 'True', ':', 'yield', '$p', 'g', '=', 'surge()', 'for', 'i', 'in', 'range(4)', 'cast', '(', ')', 'icebolt', ',', 'next(g)'],
          goal: { foeDown: true },
          require: l => (has(l, /yield/) && has(l, /next\(/) ? null : 'Yield in surge, and take values with next().'),
          hints: ['def surge(): / while True: / yield $p', 'g = surge() / for i in range(4): / cast(icebolt, next(g))'],
          solution: ['def surge():', '    while True:', '        yield $p', 'g = surge()', 'for i in range(4):', '    cast(icebolt, next(g))'],
        },
      ],
      learn: [{ title: 'Generators in battle', code: 'for p in waves(5):\n    cast(fireball, p)', text: 'A generator can drive a loop, producing each value just in time.' }],
    },
    {
      id: '41-5', title: 'Streams in brackets', bg: 'river', npc: 'clockmaker', mentor: 'clockmaker', tags: ['genexp'],
      steps: [
        { type: 'talk', who: 'clockmaker', text: 'A comprehension in round brackets, (x * 2 for x in nums), is a generator expression. It makes values one by one instead of building a whole list. Perfect inside sum(), max() and any().' },
        {
          type: 'predict', vars: R => ({ n: R.int(4, 10) }), text: 'What will it say?',
          code: ['print(sum(x * x for x in range($n)))'],
          explain: 'The squares of 0 to $(n - 1) add up to $([...Array(n).keys()].reduce((a, x) => a + x * x, 0)).',
        },
        {
          type: 'predict', vars: R => ({ xs: [R.int(1, 9), R.int(1, 9), R.int(1, 9)] }), text: 'Used up after one trip. What will it say?',
          code: ['g = (x + 1 for x in $(JSON.stringify(xs)))', 'print(list(g))', 'print(list(g))'],
          explain: 'A generator expression can only be read once. The second list is empty.',
        },
        {
          type: 'predict', vars: R => ({ ws: R.sample(['ripple', 'eddy', 'current', 'whirlpool', 'wave'], 3) }), text: 'What will it say?',
          code: ['words = $(JSON.stringify(ws))', 'print(any(len(w) > 6 for w in words), max(len(w) for w in words))'],
          explain: 'any stops at the first long word. max finds the longest length.',
        },
        {
          type: 'fill', vars: R => ({ xs: [R.int(1, 20), R.int(1, 20), R.int(1, 20), R.int(1, 20)] }), text: 'Add up only the odd depths, without building a list.',
          lines: ['depths = $(JSON.stringify(xs))', 'print(sum(d [] d in depths [] d % 2 == 1))'], chips: ['for', 'if', 'while', 'and'], answer: [['for', 'if']],
          hints: ['(d for d in depths if ...)', 'for, then if'],
        },
        {
          type: 'write', vars: R => ({ ws: R.sample(BOATS, 4) }), text: 'Print the total number of letters in all the boat names, using sum() with a generator expression.',
          starter: ['boats = $(JSON.stringify(ws))'], keys: ['print', '(', ')', 'sum', 'len(b)', 'for', 'b', 'in', 'boats'],
          require: l => (has(l, /sum\(\s*len\(/) ? null : 'Use sum(len(b) for b in boats).'),
          hints: ['sum(len(b) for b in boats)'],
          solution: ['print(sum(len(b) for b in boats))'],
        },
      ],
      learn: [{ title: 'Generator expressions', code: 'sum(x * x for x in nums)', text: 'Like a list comprehension in round brackets, but lazy and single-use.' }],
    },
    {
      id: '41-6', title: 'Dictionaries in one line', bg: 'river', npc: 'ferryman', mentor: 'ferryman', tags: ['dictcomp'],
      steps: [
        { type: 'talk', who: 'ferryman', text: 'Curly brackets make comprehensions too. {k: v for ...} builds a dict, {x for ...} builds a set.' },
        { type: 'demo', vars: R => ({ bs: R.sample(BOATS, 3) }), text: 'Run it.', code: ['boats = $(JSON.stringify(bs))', 'sizes = {b: len(b) for b in boats}', 'print(sizes)'] },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 5) }), text: 'What will it say?',
          code: ['squares = {n: n * n for n in range(1, $(n + 1))}', 'print(squares[$n], len(squares))'],
          explain: 'One key per number from 1 to $n.',
        },
        {
          type: 'predict', vars: R => ({ ns: R.sample(Engine.NAMES, 3), ls: [R.int(1, 30), R.int(1, 30), R.int(1, 30)] }), text: 'Filtering a dict. What will it say?',
          code: ['levels = {"$(ns[0])": $(ls[0]), "$(ns[1])": $(ls[1]), "$(ns[2])": $(ls[2])}', 'high = {k: v for k, v in levels.items() if v >= 15}', 'print(sorted(high))'],
          explain: 'Only heroes at level 15 or more are kept.',
        },
        {
          type: 'predict', vars: R => ({ xs: [R.int(0, 9), R.int(0, 9), R.int(0, 9), R.int(0, 9), R.int(0, 9)] }), text: 'A set comprehension. What will it say?',
          code: ['nums = $(JSON.stringify(xs))', 'print(len({n % 3 for n in nums}))'],
          explain: 'The set keeps each different remainder once.',
        },
        {
          type: 'fill', vars: R => ({ bs: R.sample(BOATS, 3) }), text: 'Flip the dict: positions become keys.',
          lines: ['boats = $(JSON.stringify(bs))', 'where = {[]: i for i, b in [](boats)}', 'print(where)'], chips: ['b', 'enumerate', 'i', 'zip'], answer: [['b', 'enumerate']],
          hints: ['The key is the boat name.', 'enumerate gives i and b.'],
        },
        {
          type: 'write', vars: R => ({ ws: R.sample(BOATS, 3) }), text: 'Build a dict that maps each boat to its name in capitals, using a dict comprehension. Print it.',
          starter: ['boats = $(JSON.stringify(ws))'], keys: ['caps', '=', '{', '}', 'b', ':', 'b.upper()', 'for', 'in', 'boats', 'print', '(', ')'],
          require: l => (has(l, /\{\s*\w+\s*:.*for/) ? null : 'Use a dict comprehension {b: ... for b in boats}.'),
          hints: ['caps = {b: b.upper() for b in boats}', 'print(caps)'],
          solution: ['caps = {b: b.upper() for b in boats}', 'print(caps)'],
        },
      ],
      learn: [{ title: 'Dict and set comprehensions', code: '{k: v for k, v in d.items() if v}\n{x % 3 for x in nums}', text: 'Build dicts and sets in one line, with optional filters.' }],
    },
    {
      id: '41-7', title: 'Rivers within rivers', bg: 'river', npc: 'clockmaker', mentor: 'clockmaker', tags: ['nestcomp'],
      steps: [
        { type: 'talk', who: 'clockmaker', text: 'A comprehension can have two for parts, read left to right like nested loops: [x for row in grid for x in row] flattens a grid. And x if test else y can choose each value.' },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 4), b: R.int(5, 9) }), text: 'Flattening. What will it say?',
          code: ['grid = [[$a, 2], [3, $b]]', 'print([x for row in grid for x in row])'],
          explain: 'The outer for walks rows, the inner for walks the values in each row.',
        },
        {
          type: 'predict', vars: R => ({ bs: R.sample(BOATS, 2) }), text: 'Every pair. What will it say?',
          code: ['print([(b, n) for b in $(JSON.stringify(bs)) for n in [1, 2]])'],
          explain: 'For each boat, every number: 2 boats times 2 numbers.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(4, 7) }), text: 'Choosing inside a comprehension. What will it say?',
          code: ['print(["even" if i % 2 == 0 else "odd" for i in range($n)])'],
          explain: 'x if test else y picks a value for each i.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(2, 4) }), text: 'Build a $n by $n table of zeros.',
          lines: ['table = [[0 for c in range($n)] [] r in range($n)]', 'print(len(table), len(table[0]), table[0])'], chips: ['for', 'if', 'in'], answer: [['for']],
          hints: ['Each row is [0 for c in range($n)], one per r.'],
        },
        {
          type: 'write', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9), c: R.int(1, 9), d: R.int(1, 9) }), text: 'Flatten grid into one list with a comprehension and print its sum.',
          starter: ['grid = [[$a, $b], [$c, $d]]'], keys: ['flat', '=', '[', ']', 'x', 'for', 'row', 'in', 'grid', 'print', 'sum', '(', ')', 'flat'],
          require: l => (has(l, /for\s+\w+\s+in\s+grid\s+for/) ? null : 'Use two for parts: [x for row in grid for x in row]'),
          hints: ['flat = [x for row in grid for x in row]', 'print(sum(flat))'],
          solution: ['flat = [x for row in grid for x in row]', 'print(sum(flat))'],
        },
      ],
      learn: [{ title: 'Nested comprehensions', code: '[x for row in grid for x in row]\n["a" if c else "b" for c in cs]', text: 'Two for parts work like nested loops, read left to right.' }],
    },
    {
      id: '41-8', title: 'The current', bg: 'rapids', mentor: 'narrator', tags: ['pipeline'],
      foe: R => ({ kind: 'riverspirit', hp: 80, weak: 'spark', tint: 'big' }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'The whole river turns against you! Chain generators into a pipeline: each one feeds the next, one value at a time.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ n: R.int(4, 6) }), text: 'How much damage will this deal? Spark is doubled.',
          code: ['def source(n):', '    for i in range(1, n + 1):', '        yield i', 'def evens(nums):', '    for x in nums:', '        if x % 2 == 0:', '            yield x', 'for p in evens(source($n)):', '    cast(spark, p)'],
          explain: 'The even numbers up to $n add up to $([...Array(n + 1).keys()].filter(x => x % 2 === 0).reduce((a, b) => a + b, 0)), doubled by spark.',
        },
        {
          type: 'fix', vars: R => ({ k: R.int(3, 5) }), text: 'This pipeline casts nothing. Run it, then tap the broken line.',
          code: ['def boost(nums):', '    for x in nums:', '        return x * 3', 'total = 0', 'for p in boost(range(1, $(k + 1))):', '    total += p', 'print(total)', 'cast(spark, total)'], bad: 2,
          options: ['        yield x * 3', '        print(x * 3)', '        x = x * 3'], answer: 0,
          explain: 'return ends the function after one value, and boost gives back a plain number that cannot be looped over. yield keeps the pipeline flowing.',
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Finish it! $HP HP left, spark is doubled. Write gen(n) that yields n, then cast spark with sum(gen($q)).',
          starter: [], keys: ['def', 'gen', '(n):', 'yield', 'n', 'cast', '(', ')', 'spark', ',', 'sum', 'gen($q)'],
          goal: { foeDown: true },
          require: l => (has(l, /yield/) ? null : 'gen must yield.'),
          hints: ['def gen(n): / yield n', 'cast(spark, sum(gen($q)))'],
          solution: ['def gen(n):', '    yield n', 'cast(spark, sum(gen($q)))'],
        },
      ],
      learn: [{ title: 'Pipelines', code: 'for x in evens(source(10)):', text: 'Generators feeding generators: each value flows through the whole chain before the next is made.' }],
    },
    {
      id: '41-9', title: 'The Leviathan of Time', bg: 'timevortex', foe: { kind: 'leviathan', hp: 260, weak: 'spark', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'leviathan', text: 'I HAVE SWALLOWED EVERY MOMENT THAT EVER WAS. I YIELD... TO NO ONE.' },
        { type: 'talk', who: 'narrator', text: 'The Leviathan has 260 HP. Spark jolts it for double. Fireball is halved in the water.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ k: R.int(3, 5), p: R.int(4, 7) }), text: 'How much damage will this deal? Spark is doubled.',
          code: ['def ticks(k):', '    for i in range(k):', '        yield $p', 'cast(spark, sum(ticks($k)))'],
          explain: '$k ticks of $p = $(k * p), doubled: $(2 * k * p).',
        },
        {
          type: 'fill', vars: R => ({ xs: [R.int(4, 9), R.int(4, 9), R.int(4, 9)] }), text: 'Strike with every moment above 5, without building a list.',
          lines: ['moments = $(JSON.stringify(xs))', 'cast(spark, sum(m [] m in moments [] m > 5))'], chips: ['for', 'if', 'while', 'yield'], answer: [['for', 'if']],
          hints: ['A generator expression: (m for m in moments if ...)'],
        },
        { type: 'talk', who: 'leviathan', text: 'THE RIVER FLOWS ENDLESSLY. YOU WILL TIRE FIRST.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ p: R.int(6, 9) }), text: 'An endless generator, taken three times. How much damage will this deal?',
          code: ['def forever(p):', '    while True:', '        yield p', 'g = forever($p)', 'for _ in range(3):', '    cast(spark, next(g))'],
          explain: 'Three values of $p, each doubled: $(6 * p).',
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Final blow! $HP HP left, spark is doubled. Write a generator final() that yields $q, then cast spark with next(final()).',
          starter: [], keys: ['def', 'final', '():', 'yield', '$q', 'cast', '(', ')', 'spark', ',', 'next', 'final()'],
          goal: { foeDown: true },
          require: l => (has(l, /yield/) && has(l, /next\(/) ? null : 'Write final with yield and take its value with next().'),
          hints: ['def final(): / yield $q', 'cast(spark, next(final()))'],
          solution: ['def final():', '    yield $q', 'cast(spark, next(final()))'],
        },
        { type: 'talk', who: 'leviathan', text: 'time... flows on... without me...' },
      ],
      learn: [{ title: 'The river toolkit', code: 'iter  next  yield  while True\n(x for x in xs)  {k: v for ...}', text: 'Values made one at a time, exactly when they are needed.' }],
    },
    {
      id: '41-R', title: 'The Last Gate', bg: 'lastgate', foe: { kind: 'gatekeeper', hp: 300 }, mentor: 'narrator', boss: true, review: true, tags: [],
      steps: [
        { type: 'talk', who: 'gatekeeper', text: 'Forty-one worlds behind you, {NAME}. Beyond this gate the oldest magic waits. Show me everything.' },
        { type: 'talk', who: 'narrator', text: 'The final review! Every world, mixed together. 300 HP. Each right answer strikes.' },
        { type: 'review', tags: ['print', 'vars', 'fstr', 'methods', 'ifelse', 'logic'], reward: { spell: 'spark', power: 20 }, text: 'Where it began. What will it say?' },
        { type: 'review', tags: ['forloop', 'while', 'lists', 'comp', 'dicts', 'dictloop'], reward: { spell: 'fireball', power: 20 }, text: 'Loops and collections. What will it say?' },
        { type: 'review', tags: ['func', 'return', 'recursion', 'tryexcept', 'files', 'parse'], reward: { spell: 'icebolt', power: 20 }, text: 'Functions, errors, files. What will it say?' },
        { type: 'review', tags: ['init', 'method', 'inherit', 'superc', 'property', 'opdunder'], reward: { spell: 'spark', power: 20 }, text: 'Objects. What will it say?' },
        { type: 'review', tags: ['modules', 'jsonq', 'regroup', 'resub', 'pytestq', 'raisesq'], reward: { spell: 'fireball', power: 20 }, text: 'Libraries, patterns, tests. What will it say?' },
        {
          type: 'write', vars: R => ({ ws: R.sample(['ember', 'frost', 'storm', 'stone'], 3) }), text: 'Write a generator spells(names) that yields each name in capitals. Print the results joined with " + ".',
          starter: ['names = $(JSON.stringify(ws))'], keys: ['def', 'spells', '(names):', 'for', 'n', 'in', 'names', ':', 'yield', 'n.upper()', 'print', '" + ".join', '(', ')', 'spells(names)'],
          require: l => (has(l, /yield/) ? null : 'Use yield.'),
          hints: ['def spells(names): / for n in names: / yield n.upper()', 'print(" + ".join(spells(names)))'],
          solution: ['def spells(names):', '    for n in names:', '        yield n.upper()', 'print(" + ".join(spells(names)))'],
        },
        { type: 'review', tags: ['sets', 'setops', 'lambdaq', 'sortkey', 'mapfilter', 'zipq'], reward: { spell: 'icebolt', power: 20 }, text: 'The Gardens. What will it say?' },
        { type: 'review', tags: ['argsq', 'kwargsq', 'unpackcall', 'unpackassign', 'kwonly'], reward: { spell: 'spark', power: 20 }, text: 'The Sands. What will it say?' },
        { type: 'review', tags: ['iterq', 'yieldq', 'infgen', 'genexp', 'dictcomp', 'nestcomp'], reward: { spell: 'fireball', power: 20 }, text: 'The River. What will it say?' },
        { type: 'review', tags: ['state', 'override', 'regroup', 'edge', 'stats', 'kwargsq', 'genexp', 'dictloop'], reward: { spell: 'icebolt', power: 20 }, text: 'Everything at once. What will it say?' },
        { type: 'talk', who: 'gatekeeper', text: 'One spell remains. Use a class, a generator, and a comprehension, all at once.' },
        {
          type: 'write', vars: (R, c) => ({ h: Math.max(3, c.foe.hp) }), text: 'Write class Mage with __init__(self, powers) storing a list, and a generator method waves(self) that yields each power. Then cast fireball with sum(p for p in Mage([$(Math.floor(h / 3)), $(Math.floor(h / 3)), $(h - 2 * Math.floor(h / 3))]).waves()).',
          starter: [], keys: ['class', 'Mage', ':', 'def', '__init__', '(self, powers):', 'self.powers', '=', 'powers', 'waves', '(self):', 'for', 'p', 'in', 'yield', 'cast', '(', ')', 'fireball', ',', 'sum', 'Mage([$(Math.floor(h / 3)), $(Math.floor(h / 3)), $(h - 2 * Math.floor(h / 3))])', '.waves()'],
          goal: { foeDown: true },
          require: l => (has(l, /class\s+Mage/) && has(l, /yield/) && has(l, /for\s+\w+\s+in/) ? null : 'Write class Mage with a waves method that yields, and sum a generator expression.'),
          hints: ['class Mage: / def __init__(self, powers): / self.powers = powers / def waves(self): / for p in self.powers: / yield p', 'cast(fireball, sum(p for p in Mage([...]).waves()))'],
          solution: ['class Mage:', '    def __init__(self, powers):', '        self.powers = powers', '    def waves(self):', '        for p in self.powers:', '            yield p', 'cast(fireball, sum(p for p in Mage([$(Math.floor(h / 3)), $(Math.floor(h / 3)), $(h - 2 * Math.floor(h / 3))]).waves()))'],
        },
        { type: 'talk', who: 'gatekeeper', text: 'The gate is open. You walked from print("hello") to classes, libraries, patterns, tests and generators. Beyond it lie closures, decorators and the deepest magic of all. Walk on.' },
      ],
      learn: [{ title: 'The whole journey', code: 'values  loops  functions  files  classes\nlibraries  regex  tests  generators', text: 'All of CS50P and the next steps beyond it. You are a Python programmer.' }],
    },
  ],
};
WORLDS.push(WORLD41);

/* Hand-written wrong answers for predict steps where mutating the code cannot
   produce believable alternatives (regex, tests, class behaviour). They are templates
   like the rest of the step, and tools/audit-choices.js checks they are good enough. */
(() => {
  const W = (id, k, wrong) => {
    for (const w of WORLDS) for (const lv of w.levels) if (lv.id === id) {
      const st = lv.steps[k];
      if (!st || st.type !== 'predict') throw new Error('no predict step ' + id + ' ' + k);
      st.wrong = (st.wrong || []).concat(wrong);
    }
  };
  W('22-1', 3, ['I am $n / Error', '$n charges! / I am $n', 'I am $n / I am $n charges!']);
  W('22-2', 3, ['hero / knight / hero', 'hero / knight / Error', 'hero / hero / hero']);
  W('22-3', 3, ['and armored', 'brave', 'brave / and armored']);
  W('22-5', 2, ['False False', 'True True', 'False True']);
  W('23-5', 3, ['Bot Bot', 'Drone Drone', 'cls cls']);
  W('26-3', 4, ['$b', '3', "['$a', '$b']"]);
  W('26-5', 3, ['hello, greet.py', 'Usage: python greet.py NAME / hello,', 'hello,']);
  W('26-7', 3, ['tools running / main program __main__', 'main program tools', 'tools running / main program tools']);
  W('29-1', 3, ['True True', 'False False', 'False True']);
  W('29-1', 4, ['$c $(x + 1) $(x + c.length)', '$c $x $(x + c.length - 1)', '$c 0 $(c.length)']);
  W('29-1', 5, ['$(c.toUpperCase())', 'True', 'False']);
  W('29-2', 3, ['goal 4', 'o $n', 'g$("o".repeat(n))al $(n + 2)']);
  W('29-2', 4, ['True / False / False', 'True / True / True', 'False / True / False']);
  W('29-3', 3, ['[$a, $b, $c] $(a + b + c)', "['$a', '$b', '$c'] $a$b$c", "['$a$b$c'] $(a + b + c)"]);
  W('29-3', 4, ["['hop,', 'skip', '&', 'jump!']", "['hop', ',', 'skip', '&', 'jump', '!']", "['hop', 'skip', 'jump!']"]);
  W('29-5', 1, ['True / True', 'False / True', 'False / False']);
  W('29-7', 1, ["['42', '314', '2718']", "['42', '314', '271', '8']", "['7', '42', '314', '2718']"]);
  W('29-7', 3, ['False False', 'True True', 'False True', 'True False']);
  W('29-8', 1, ['toomanyspaces', 'too    many   spaces', 'too many  spaces']);
  W('29-8', 2, ['$a $b', '\\2 \\1', '$b$a']);
  W('32-1', 2, ['first check passed', 'second check passed', 'first check passed / AssertionError']);
  W('32-1', 4, ['caught: AssertionError', 'caught:', '$n']);
  W('32-3', 1, ['test_initial PASSED / test_empty PASSED / == 2 passed ==', 'test_initial PASSED / test_empty FAILED - assert \'\' == \'\' / == 1 failed, 1 passed ==', 'test_initial FAILED - IndexError: string index out of range / == 1 failed ==']);
  W('32-3', 2, ['test_two PASSED / test_none PASSED / == 2 passed ==', 'test_two PASSED / test_none FAILED - assert 0 == 0 / == 1 failed, 1 passed ==', 'test_two FAILED - ZeroDivisionError: division by zero / test_none FAILED - ZeroDivisionError: division by zero / == 2 failed ==']);
  W('32-6', 2, ['test_evens PASSED / test_odds FAILED - assert False / == 1 failed, 1 passed ==', 'test_evens PASSED / == 1 passed ==', 'test_evens FAILED - assert False / test_odds FAILED - assert False / == 2 failed ==']);
  W('32-7', 1, ['test_greet PASSED / == 1 passed ==', '== no tests ran ==', "test_greet FAILED - assert None == 'hello, Ada' / == 1 failed =="]);
  W('39-2', 3, ['{$a, 6} {$b}', '{$a, $b, 6, 7} {$a, 6, 7}', '{$b} {$a, 6, 7}']);
  W('39-2', 2, ['[]', "$('[' + JSON.parse(A).sort().map(w => \"'\" + w + \"'\").join(', ') + ']')"]);
  W('39-5', 1, ["$('[' + ws.slice().sort().map(w => \"'\" + w + \"'\").join(', ') + ']')", "$('[' + ws.map(w => \"'\" + w + \"'\").join(', ') + ']')", "$('[' + ws.slice().sort((a, b) => b.length - a.length).map(w => \"'\" + w + \"'\").join(', ') + ']')"]);
  W('39-5', 3, ["['apple', 'banana', 'Cherry'] / ['apple', 'banana', 'Cherry']", "['Cherry', 'apple', 'banana'] / ['Cherry', 'apple', 'banana']", "['apple', 'banana', 'Cherry'] / ['Cherry', 'apple', 'banana']"]);
  W('40-1', 2, ['1 1 3', '0 1 1', '0 3 3']);
  W('40-1', 3, ['Salaam $(ns[0]) $(ns[1])', 'Salaam / $(ns[0]) / $(ns[1])', '$(ns[0]) Salaam / $(ns[1]) Salaam']);
  W('40-2', 2, ['2 $c', '(2, $c)', "('$c', 2)"]);
  W('40-5', 1, ['$(ws[0]) $(ws[1])', "$(ws[0]) ('$(ws[1])', '$(ws[2])', '$(ws[3])')", "['$(ws[0])'] ['$(ws[1])', '$(ws[2])', '$(ws[3])']"]);
  W('40-5', 2, ['1 $(ws[3])', '3 $(ws[0])', '4 $(ws[3])']);
  W('41-1', 2, ['$(bs[0]) / $(bs[1]) / $(bs[2])', '$(bs[0]) / $(bs[1])', '$(bs[2])']);
  W('41-1', 4, ['$b / $b', 'empty / empty', '$b / StopIteration']);
  W('41-5', 3, ['True 6', 'False 6', 'True 9', 'False 9']);
  W('3-2', 6, ['$(w.toUpperCase())', '$w', 'upper']);
  W('7-7', 2, ["['$a,$b,$c']", '$a $b $c', "['$a', ',', '$b', ',', '$c']"]);
  W('7-7', 5, ['$a$b$c', "['$a', '$b', '$c']", '$a$s$b$c']);
  W('9-3', 3, ['3', 'gold', 'KeyError']);
  W('13-2', 3, ['Got $s', 'Bad number', 'Got $s / Bad number', 'ValueError']);
  W('13-3', 2, ['Missing key', 'Unknown name', '1']);
  W('13-3', 4, ['Oops: IndexError', 'Oops:', 'Oops: $i']);
  W('13-5', 2, ['good: $n / door closed', 'bad', 'door closed', 'good: $n']);
  W('13-6', 3, ['Caught: ValueError', 'Caught: -$x', '-$x']);
  W('14-6', 3, ['$w$w', 'FileNotFoundError', '(empty)']);
})();
