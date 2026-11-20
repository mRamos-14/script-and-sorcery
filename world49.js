/* World 49: The Alchemist's Tools. functools and friends: reduce (folding a sequence), the
   operator module, partial (pre-filled functions), lru_cache and cache (memoising, with
   cache_info and the hashable-arguments rule), total_ordering and cmp_to_key, and composing
   functions into pipelines. Ends with 49-R, the Act VIII review.
   Source: our own (the functools and operator docs). */
Object.assign(EXTRA.npcs, {
  sol: { name: 'Alchemist Sol', colors: ['#c8a03a', '#5a3a14', '#ecb98d'] },
});
Object.assign(EXTRA.foes, {
  flaskslime: { base: 'fireslime', name: 'Flask slime', pal: { G: '#5fd3ff', L: '#e0faff', D: '#2a7fb0' } },
  cachebat: { base: 'bat', name: 'Cache bat', pal: { P: '#c8a03a', W: '#5fd3ff' } },
  grandalchemist: { base: 'automaton', name: 'The Grand Alchemist', pal: {} },
  advoracle: { base: 'source', name: 'The Oracle of Advanced Arts', pal: { C: '#c8a03a', L: '#fff1a8' } },
});

const WORLD49 = {
  id: 49, name: "The Alchemist's Tools", topic: 'functools',
  nodes: [[50, 92], [70, 83], [38, 74], [64, 65], [34, 56], [64, 47], [36, 38], [62, 29], [44, 19], [52, 7]],
  levels: [
    {
      id: '49-1', title: 'Folding with reduce', bg: 'foundry', npc: 'sol', mentor: 'sol', tags: ['reduceq'],
      steps: [
        { type: 'talk', who: 'sol', text: 'Welcome to my laboratory, {NAME}. Our first tool FOLDS a whole sequence into one value: functools.reduce(f, items) combines the first two items with f, then combines that result with the third, and so on.' },
        { type: 'talk', who: 'sol', text: 'reduce(f, items, start) begins from start instead, which also makes an empty list safe. For plain sums use sum(), for the biggest use max(): reduce shines when there is no ready-made tool.' },
        { type: 'demo', text: 'Folding. Run it.', code: ['from functools import reduce', 'print(reduce(lambda a, b: a + b, [1, 2, 3, 4]))', 'print(reduce(lambda a, b: a * b, [1, 2, 3, 4]))', 'print(reduce(lambda a, b: a if a > b else b, [3, 9, 2]))', 'print(reduce(lambda acc, w: acc + w[0], ["salt", "iron", "gold"], ""))'] },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 5), b: R.int(2, 5), c: R.int(2, 5) }), text: 'What will it say?', code: ['from functools import reduce', 'print(reduce(lambda x, y: x * 10 + y, [$a, $b, $c]))'],
          explain: 'Fold the digits left to right: ($a × 10 + $b) × 10 + $c.',
        },
        {
          type: 'predict', text: 'Watch each step. What will it say?', code: ['from functools import reduce', 'def show(a, b):', '    print(a, "+", b)', '    return a + b', 'print(reduce(show, [1, 2, 3], 100))'],
          explain: 'Starting from 100: 100 + 1, then 101 + 2, then 103 + 3.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Folding nothing. Which error?', code: ['from functools import reduce', 'print(reduce(lambda a, b: a + b, []))'],
          explain: 'An empty sequence with no start value: TypeError. Give a start value to be safe.',
        },
        {
          type: 'predict', text: 'Merging dicts by folding. What will it say?', code: ['from functools import reduce', 'bags = [{"gold": 1}, {"gem": 2}, {"gold": 5}]', 'print(reduce(lambda acc, d: {**acc, **d}, bags, {}))'],
          explain: 'Each dict is merged in; the later gold overwrites the earlier one.',
        },
        {
          type: 'fill', text: 'Start the fold from 1, so an empty list gives 1.',
          lines: ['from functools import reduce', 'def product(nums):', '    return reduce(lambda a, b: a * b, nums, [])', 'print(product([2, 3, 4]), product(list()))'], chips: ['1', '0', 'None'], answer: [['1']],
          hints: ['Multiplying by the start must change nothing.', 'reduce(..., nums, 1)'],
        },
        {
          type: 'write', text: 'With reduce, find the longest word in ["ash", "cinder", "ember"] (keep a if len(a) >= len(b), else b), and print it.',
          starter: ['from functools import reduce', 'words = ["ash", "cinder", "ember"]'], keys: ['print', 'reduce', '(', ')', 'lambda', 'a', 'b', ',', ':', 'if', 'len(a) >= len(b)', 'else', 'words'],
          require: l => (has(l, /reduce\(/) ? null : 'Use reduce.'),
          hints: ['reduce(lambda a, b: a if len(a) >= len(b) else b, words)', 'print(reduce(lambda a, b: a if len(a) >= len(b) else b, words))'],
          solution: ['print(reduce(lambda a, b: a if len(a) >= len(b) else b, words))'],
        },
      ],
      learn: [{ title: 'reduce', code: 'reduce(f, [a, b, c])        # f(f(a, b), c)\nreduce(f, items, start)', text: 'Folds a sequence into one value. A start value makes empty input safe.' }],
    },
    {
      id: '49-2', title: 'Ready-made reagents', bg: 'foundry', npc: 'sol', mentor: 'sol', tags: ['operatorq'],
      steps: [
        { type: 'talk', who: 'sol', text: 'Many lambdas just wrap an operator: lambda a, b: a + b. The operator module has them ready: operator.add, mul, lt, neg... itemgetter(1) is lambda x: x[1]; itemgetter(1, 0) returns a tuple of both; attrgetter("name") is lambda x: x.name. They read clearly and run fast.' },
        { type: 'demo', text: 'Reagents. Run it.', code: ['import operator', 'from operator import itemgetter, attrgetter', 'from functools import reduce', 'print(operator.add(2, 3), operator.mul(4, 5), reduce(operator.mul, [1, 2, 3, 4]))', 'stock = [("salt", 4), ("iron", 9), ("gold", 1)]', 'print(sorted(stock, key=itemgetter(1)))', 'print(itemgetter(0, 1)(stock[0]))'] },
        {
          type: 'predict', text: 'Sort by two keys. What will it say?', code: ['from operator import itemgetter', 'potions = [("heal", 3), ("fire", 1), ("bolt", 3)]', 'print(sorted(potions, key=itemgetter(1, 0)))'],
          explain: 'By strength first, then by name to break ties.',
        },
        {
          type: 'predict', text: 'Getting attributes. What will it say?', code: ['from operator import attrgetter', 'class Mage:', '    def __init__(self, name, mana):', '        self.name = name', '        self.mana = mana', 'mages = [Mage("Ira", 40), Mage("Bo", 70), Mage("Cy", 10)]', 'print([m.name for m in sorted(mages, key=attrgetter("mana"), reverse=True)])'],
          explain: 'Sorted by mana, highest first.',
        },
        {
          type: 'predict', vars: R => ({ k: R.pick(['upper', 'title']) }), text: 'methodcaller and map. What will it say?', code: ['from operator import methodcaller', 'print(list(map(methodcaller("$k"), ["salt", "iron ore"])))'],
          explain: 'methodcaller("$k") calls .$k() on each item.',
        },
        {
          type: 'predict', text: 'Pairing two lists with an operator. What will it say?', code: ['import operator', 'print(list(map(operator.mul, [1, 2, 3], [10, 20, 30])))', 'print(list(map(operator.neg, [4, -2])))'],
          explain: 'map with two lists passes one item from each.',
        },
        {
          type: 'fill', text: 'Sort the ingredients by their weight (item 1).',
          lines: ['from operator import itemgetter', 'bag = [("moss", 5), ("ash", 2), ("dew", 7)]', 'print([name for name, w in sorted(bag, key=itemgetter([]))])'], chips: ['1', '0', '2'], answer: [['1']],
          hints: ['Weight is the second item.', 'itemgetter(1)'],
        },
        {
          type: 'write', text: 'Using reduce with operator.add, join the list ["fire", "and", "ice"] into one string with no spaces, and print it.',
          starter: ['import operator', 'from functools import reduce', 'words = ["fire", "and", "ice"]'], keys: ['print', 'reduce', '(', ')', 'operator.add', 'words', ','],
          require: l => (has(l, /operator\.add/) ? null : 'Use operator.add.'),
          hints: ['reduce(operator.add, words)', 'print(reduce(operator.add, words))'],
          solution: ['print(reduce(operator.add, words))'],
        },
      ],
      learn: [{ title: 'operator', code: 'operator.add  mul  lt  neg\nitemgetter(1)  itemgetter(1, 0)  attrgetter("name")  methodcaller("upper")', text: 'Ready-made functions for operators and lookups.' }],
    },
    {
      id: '49-3', title: 'Partial potions', bg: 'study', npc: 'sol', mentor: 'sol', tags: ['partialq'],
      steps: [
        { type: 'talk', who: 'sol', text: 'functools.partial(f, x) makes a NEW function with some arguments already poured in. partial(pow, 2) is a function where 2 is always the first argument; partial(int, base=2) always reads binary. It is like a tiny factory, without writing the closure yourself.' },
        { type: 'demo', text: 'Pre-filled functions. Run it.', code: ['from functools import partial', 'binary = partial(int, base=2)', 'print(binary("1011"), binary("111"))', 'two_to = partial(pow, 2)', 'print(two_to(5), two_to(10))', 'shout = partial(print, sep="! ", end="!\\n")', 'shout("fire", "ice")'] },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9), b: R.int(2, 9) }), text: 'What will it say?', code: ['from functools import partial', 'def brew(base, extra, heat=1):', '    return (base + extra) * heat', 'strong = partial(brew, heat=3)', 'mint = partial(brew, $a)', 'print(strong($a, $b), mint($b), mint($b, heat=2))'],
          explain: 'Pre-filled keywords and positionals combine with the ones you pass later.',
        },
        {
          type: 'predict', text: 'What is inside a partial? What will it say?', code: ['from functools import partial', 'p = partial(max, 7, key=abs)', 'print(p.func, p.args, p.keywords)', 'print(p(-9, 3))'],
          explain: 'A partial remembers the function, the positional args and the keywords.',
        },
        {
          type: 'predict', text: 'partial versus lambda. What will it say?', code: ['from functools import partial', 'def scale(x, factor):', '    return x * factor', 'double_a = partial(scale, factor=2)', 'double_b = lambda x: scale(x, 2)', 'print(list(map(double_a, [1, 2, 3])) == list(map(double_b, [1, 2, 3])))'],
          explain: 'Both make the same function; partial says plainly which argument is fixed.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Filling the same argument twice. Which error?', code: ['from functools import partial', 'def brew(base, extra):', '    return base + extra', 'p = partial(brew, 1, 2)', 'print(p(3))'],
          explain: 'p(3) calls brew(1, 2, 3): too many arguments, TypeError.',
        },
        {
          type: 'fill', text: 'Make a function that always reads hexadecimal.',
          lines: ['from functools import partial', 'hexread = partial(int, []=16)', 'print(hexread("ff"), hexread("10"))'], chips: ['base', 'x', 'hex'], answer: [['base']],
          hints: ['int(text, base=16)', 'partial(int, base=16)'],
        },
        {
          type: 'write', text: 'Write mix(a, b, ratio) returning a * ratio + b * (1 - ratio). Use partial to make half = mix with ratio=0.5, and print half(10, 20).',
          starter: ['from functools import partial'], keys: ['def', 'mix', '(', ')', ':', 'a', 'b', 'ratio', ',', 'return', '*', '+', '(1 - ratio)', 'half', '=', 'partial', 'ratio=0.5', 'print', '10', '20'],
          require: l => (has(l, /partial\(mix/) ? null : 'Make half with partial(mix, ...).'),
          hints: ['def mix(a, b, ratio):\n    return a * ratio + b * (1 - ratio)', 'half = partial(mix, ratio=0.5)\nprint(half(10, 20))'],
          solution: ['def mix(a, b, ratio):', '    return a * ratio + b * (1 - ratio)', 'half = partial(mix, ratio=0.5)', 'print(half(10, 20))'],
        },
      ],
      learn: [{ title: 'partial', code: 'binary = partial(int, base=2)\ntwo_to = partial(pow, 2)\np.func  p.args  p.keywords', text: 'A new function with some arguments already filled in.' }],
    },
    {
      id: '49-4', title: 'Flask slimes', bg: 'foundry', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'flaskslime', hp: d0 + 24, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Flask slimes bubble over the benches! $HP HP. Fold your reagents into one blast.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Multiply the reagents together: 2 × 3 × 4.',
          lines: ['import operator', 'from functools import reduce', 'cast(fireball, reduce(operator.[], [2, 3, 4]))'], chips: ['mul', 'add', 'sub'], answer: [['mul']],
          goal: { foeDown: true },
          hints: ['2 × 3 × 4 = 24', 'operator.mul'],
        },
        { type: 'talk', who: 'narrator', text: 'The slime king boils!' },
        {
          type: 'write', vars: R => ({ n: R.int(5, 9) }),
          spawn: v => ({ kind: 'flaskslime', hp: v.n * 2, tint: 'big' }),
          text: 'It has $n × 2 HP. Use partial to make frost = cast with icebolt already filled in (partial(cast, icebolt)), then call frost($n) twice.',
          starter: ['from functools import partial'], keys: ['frost', '=', 'partial', '(', ')', 'cast', 'icebolt', ',', 'frost($n)'],
          goal: { foeDown: true },
          require: l => (has(l, /partial\(cast/) ? null : 'Use partial(cast, icebolt).'),
          hints: ['frost = partial(cast, icebolt)', 'frost($n)\nfrost($n)'],
          solution: ['frost = partial(cast, icebolt)', 'frost($n)', 'frost($n)'],
        },
      ],
      learn: [{ title: 'functools in battle', code: 'reduce(operator.mul, xs)   partial(cast, icebolt)', text: 'Fold reagents; pre-fill spells.' }],
    },
    {
      id: '49-5', title: 'Remembering answers', bg: 'archive', npc: 'sol', mentor: 'sol', tags: ['lrucacheq'],
      steps: [
        { type: 'talk', who: 'sol', text: 'You built a memo decorator by hand. functools has one ready: @lru_cache(maxsize=128) remembers recent answers ("least recently used" ones are forgotten when it is full), and @cache remembers everything. Recursive fib goes from hopelessly slow to instant.' },
        { type: 'talk', who: 'sol', text: 'Two rules. Arguments become dict keys, so they must be HASHABLE: no lists. And only cache PURE functions, ones whose answer depends only on their arguments; a cached function that prints or rolls dice will not do it again.' },
        { type: 'demo', text: 'An instant fib. Run it.', code: ['from functools import lru_cache', '@lru_cache(maxsize=None)', 'def fib(n):', '    return n if n < 2 else fib(n - 1) + fib(n - 2)', 'print(fib(40))', 'print(fib.cache_info())'] },
        {
          type: 'predict', text: 'Counting real work. What will it say?', code: ['from functools import cache', 'calls = 0', '@cache', 'def slow_square(n):', '    global calls', '    calls += 1', '    return n * n', 'for n in [3, 4, 3, 3, 5, 4]:', '    slow_square(n)', 'print(calls, slow_square.cache_info().hits)'],
          explain: 'Only 3, 4 and 5 are new; the other three calls are hits.',
        },
        {
          type: 'predict', text: 'A small cache forgets. What will it say?', code: ['from functools import lru_cache', '@lru_cache(maxsize=2)', 'def brew(n):', '    print("brewing", n)', '    return n', 'for n in [1, 2, 1, 3, 2]:', '    brew(n)'],
          explain: 'Room for two. 3 pushes out the least recently used (2), so 2 is brewed again.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'A list as the argument. Which error?', code: ['from functools import cache', '@cache', 'def total(items):', '    return sum(items)', 'print(total([1, 2, 3]))'],
          explain: 'Lists are unhashable, so they cannot be cache keys: TypeError. Pass a tuple instead.',
        },
        {
          type: 'predict', text: 'Caching a function with a side effect. What will it say?', code: ['from functools import cache', '@cache', 'def greet(name):', '    print("Hello,", name)', '    return len(name)', 'greet("Sol")', 'greet("Sol")', 'print(greet("Sol"))'],
          explain: 'The print happens only on the first call; later calls skip the body entirely.',
        },
        {
          type: 'fill', text: 'Cache every answer, forever.',
          lines: ['from functools import lru_cache', '@lru_cache(maxsize=[])', 'def steps(n):', '    return 0 if n == 1 else 1 + steps(n // 2 if n % 2 == 0 else 3 * n + 1)', 'print(steps(6), steps.cache_info().maxsize)'], chips: ['None', '0', '1'], answer: [['None']],
          hints: ['No size limit.', 'maxsize=None'],
        },
        {
          type: 'write', text: 'Use @cache on ways(n), the number of ways to climb n stairs taking 1 or 2 at a time: 1 if n <= 1, else ways(n - 1) + ways(n - 2). Print ways(30) and ways.cache_info().misses.',
          starter: ['from functools import cache'], keys: ['@cache', 'def', 'ways', '(', ')', ':', 'n', 'if', '<=', '1', 'return', 'else', 'n - 1', 'n - 2', '+', 'print', 'ways(30)', ',', 'ways.cache_info().misses'],
          require: l => (has(l, /^@cache/m) ? null : 'Decorate ways with @cache.'),
          hints: ['@cache\ndef ways(n):\n    if n <= 1:\n        return 1\n    return ways(n - 1) + ways(n - 2)', 'print(ways(30), ways.cache_info().misses)'],
          solution: ['@cache', 'def ways(n):', '    if n <= 1:', '        return 1', '    return ways(n - 1) + ways(n - 2)', 'print(ways(30), ways.cache_info().misses)'],
        },
      ],
      learn: [{ title: 'lru_cache and cache', code: '@lru_cache(maxsize=128)\n@cache\nf.cache_info()   f.cache_clear()', text: 'Memoise pure functions. Arguments must be hashable.' }],
    },
    {
      id: '49-6', title: 'Weighing the ingredients', bg: 'study', npc: 'sol', mentor: 'sol', tags: ['totalorder'],
      steps: [
        { type: 'talk', who: 'sol', text: 'To make your objects sortable you need comparison methods. @functools.total_ordering lets you write just __eq__ and ONE of __lt__, __le__, __gt__, __ge__; it fills in the rest.' },
        { type: 'talk', who: 'sol', text: 'Sometimes you have an old-style COMPARISON function, cmp(a, b) returning negative, zero or positive. sorted() wants a key, so cmp_to_key(cmp) converts one into the other.' },
        { type: 'demo', text: 'Total ordering. Run it.', code: ['from functools import total_ordering', '@total_ordering', 'class Potion:', '    def __init__(self, name, power):', '        self.name = name', '        self.power = power', '    def __eq__(self, other):', '        return self.power == other.power', '    def __lt__(self, other):', '        return self.power < other.power', 'a, b = Potion("mint", 3), Potion("fire", 8)', 'print(a < b, a >= b, b > a, a <= Potion("x", 3))', 'print(max([a, b]).name)'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 5), b: R.int(1, 5) }), text: 'What will it say?', code: ['from functools import total_ordering', '@total_ordering', 'class Lvl:', '    def __init__(self, n):', '        self.n = n', '    def __eq__(self, o):', '        return self.n == o.n', '    def __lt__(self, o):', '        return self.n < o.n', 'print(Lvl($a) > Lvl($b), Lvl($a) <= Lvl($b))'],
          explain: 'total_ordering built > and <= from < and ==.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Only __eq__ and __lt__, no decorator. Which error?', code: ['class Lvl:', '    def __init__(self, n):', '        self.n = n', '    def __eq__(self, o):', '        return self.n == o.n', '    def __lt__(self, o):', '        return self.n < o.n', 'print(Lvl(1) <= Lvl(2))'],
          explain: 'Without total_ordering there is no __le__: TypeError.',
        },
        {
          type: 'predict', text: 'A comparison function. What will it say?', code: ['from functools import cmp_to_key', 'def by_len_then_alpha(a, b):', '    if len(a) != len(b):', '        return len(a) - len(b)', '    return -1 if a < b else (1 if a > b else 0)', 'print(sorted(["fig", "ash", "elm", "oak", "yew", "birch"], key=cmp_to_key(by_len_then_alpha)))'],
          explain: 'Shorter first; equal lengths alphabetically.',
        },
        {
          type: 'predict', text: 'Reversing with a comparison. What will it say?', code: ['from functools import cmp_to_key', 'print(sorted([3, 1, 2], key=cmp_to_key(lambda a, b: b - a)))'],
          explain: 'b - a flips the order: largest first.',
        },
        {
          type: 'fill', text: 'Fill in the missing comparisons automatically.',
          lines: ['from functools import total_ordering', '@[]', 'class Gem:', '    def __init__(self, carats):', '        self.carats = carats', '    def __eq__(self, o):', '        return self.carats == o.carats', '    def __gt__(self, o):', '        return self.carats > o.carats', 'print(Gem(2) < Gem(5), Gem(5) <= Gem(5))'], chips: ['total_ordering', 'dataclass', 'cache'], answer: [['total_ordering']],
          hints: ['The decorator that completes the set.', '@total_ordering'],
        },
        {
          type: 'write', text: 'Sort the scores [7, 12, 3, 9] so EVEN numbers come first and, within each group, smaller first. Write cmp(a, b) returning (a % 2) - (b % 2) when they differ in evenness, else a - b, and sort with cmp_to_key.',
          starter: ['from functools import cmp_to_key'], keys: ['def', 'cmp', '(', ')', ':', 'a', 'b', ',', 'if', 'a % 2', '!=', 'b % 2', 'return', '-', '(a % 2) - (b % 2)', 'a - b', 'print', 'sorted', '[7, 12, 3, 9]', 'key=cmp_to_key(cmp)'],
          require: l => (has(l, /cmp_to_key\(/) ? null : 'Sort with key=cmp_to_key(cmp).'),
          hints: ['def cmp(a, b):\n    if a % 2 != b % 2:\n        return (a % 2) - (b % 2)\n    return a - b', 'print(sorted([7, 12, 3, 9], key=cmp_to_key(cmp)))'],
          solution: ['def cmp(a, b):', '    if a % 2 != b % 2:', '        return (a % 2) - (b % 2)', '    return a - b', 'print(sorted([7, 12, 3, 9], key=cmp_to_key(cmp)))'],
        },
      ],
      learn: [{ title: 'Ordering tools', code: '@total_ordering  # __eq__ + one of < <= > >=\nsorted(xs, key=cmp_to_key(cmp))', text: 'Write one comparison, get them all. Turn a cmp function into a key.' }],
    },
    {
      id: '49-7', title: 'Functions all the way down', bg: 'observatory', npc: 'sol', mentor: 'sol', tags: ['funcpipe'],
      steps: [
        { type: 'talk', who: 'sol', text: 'The last secret: functions are ingredients you can combine. compose(f, g) makes x -> f(g(x)); reduce can compose a whole list of steps into one pipeline. This is the functional style: small pure functions, combined.' },
        { type: 'talk', who: 'sol', text: 'Use it with taste. A list comprehension is often clearer than map plus filter plus lambda. Reach for these tools when they make the idea plainer, not to show off.' },
        { type: 'demo', text: 'A pipeline. Run it.', code: ['from functools import reduce', 'def compose(*fns):', '    return reduce(lambda f, g: lambda x: g(f(x)), fns)', 'clean = compose(str.strip, str.lower, lambda s: s.replace(" ", "_"))', 'print(clean("  Dragon Scale  "))'] },
        {
          type: 'predict', vars: R => ({ x: R.int(2, 6) }), text: 'Order matters. What will it say?', code: ['def compose(f, g):', '    return lambda x: f(g(x))', 'add3 = lambda x: x + 3', 'dbl = lambda x: x * 2', 'print(compose(add3, dbl)($x), compose(dbl, add3)($x))'],
          explain: 'compose(f, g) runs g first. add3(dbl($x)) differs from dbl(add3($x)).',
        },
        {
          type: 'predict', text: 'map/filter versus a comprehension. What will it say?', code: ['nums = range(10)', 'a = list(map(lambda n: n * n, filter(lambda n: n % 3 == 0, nums)))', 'b = [n * n for n in nums if n % 3 == 0]', 'print(a == b, b)'],
          explain: 'Same result; most people find the comprehension easier to read.',
        },
        {
          type: 'predict', text: 'A list of steps applied in turn. What will it say?', code: ['from functools import reduce', 'steps = [lambda x: x + 1, lambda x: x * 10, lambda x: x - 4]', 'print(reduce(lambda acc, f: f(acc), steps, 2))'],
          explain: 'Start at 2: +1 is 3, ×10 is 30, -4 is 26.',
        },
        {
          type: 'predict', text: 'Partial plus map. What will it say?', code: ['from functools import partial', 'def tag(label, text):', '    return f"<{label}>{text}"', 'print(list(map(partial(tag, "b"), ["fire", "ice"])))'],
          explain: 'partial fixes the label; map supplies each text.',
        },
        {
          type: 'fill', text: 'Run each step on the running value.',
          lines: ['from functools import reduce', 'steps = [str.strip, str.upper]', 'print(reduce(lambda acc, f: [], steps, "  ember "))'], chips: ['f(acc)', 'acc(f)', 'f'], answer: [['f(acc)']],
          hints: ['Apply the function to the value so far.', 'f(acc)'],
        },
        {
          type: 'write', text: 'Write compose2(f, g) returning lambda x: f(g(x)). Use it to build shout = compose2(lambda s: s + "!", str.upper), and print shout("potion").',
          starter: [], keys: ['def', 'compose2', '(', ')', ':', 'f', 'g', ',', 'return', 'lambda x: f(g(x))', 'shout', '=', 'lambda s: s + "!"', 'str.upper', 'print', '"potion"'],
          require: l => (has(l, /def compose2/) ? null : 'Write compose2.'),
          hints: ['def compose2(f, g):\n    return lambda x: f(g(x))', 'shout = compose2(lambda s: s + "!", str.upper)\nprint(shout("potion"))'],
          solution: ['def compose2(f, g):', '    return lambda x: f(g(x))', 'shout = compose2(lambda s: s + "!", str.upper)', 'print(shout("potion"))'],
        },
      ],
      learn: [{ title: 'Composing functions', code: 'compose = lambda f, g: lambda x: f(g(x))\nreduce(lambda acc, f: f(acc), steps, start)', text: 'Small pure functions, combined into pipelines. Prefer whatever reads clearest.' }],
    },
    {
      id: '49-8', title: 'Cache bats', bg: 'archive', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'cachebat', hp: d0 + 21, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Cache bats remember every spell you ever cast! $HP HP. Out-remember them.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Strike with fib(8), computed quickly with a cache.',
          lines: ['from functools import cache', '[]', 'def fib(n):', '    return n if n < 2 else fib(n - 1) + fib(n - 2)', 'cast(fireball, fib(8))'], chips: ['@cache', '@cache()', '#cache'], answer: [['@cache']],
          goal: { foeDown: true },
          require: s => (s[0] === '@cache' ? null : 'Decorate fib with the cache.'),
          hints: ['Plain @cache, no parentheses.', '@cache'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat elder screeches the same note over and over!' },
        {
          type: 'write', vars: R => ({ n: R.int(5, 9) }),
          spawn: v => ({ kind: 'cachebat', hp: v.n * 3, tint: 'big' }),
          text: 'It has $n × 3 HP. Write power() decorated with @cache that returns $n. Call it three times, casting icebolt with its result each time.',
          starter: ['from functools import cache'], keys: ['@cache', 'def', 'power', '(', ')', ':', 'return', '$n', 'for', 'i', 'in', 'range', '3', 'cast', 'icebolt', ',', 'power()'],
          goal: { foeDown: true },
          require: l => (has(l, /^@cache/m) ? null : 'Decorate power with @cache.'),
          hints: ['@cache\ndef power():\n    return $n', 'for i in range(3):\n    cast(icebolt, power())'],
          solution: ['@cache', 'def power():', '    return $n', 'for i in range(3):', '    cast(icebolt, power())'],
        },
      ],
      learn: [{ title: 'Caches in battle', code: '@cache\ndef fib(n): ...', text: 'Remember answers; strike fast.' }],
    },
    {
      id: '49-9', title: 'The Grand Alchemist', bg: 'foundry', foe: { kind: 'grandalchemist', hp: 200, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'grandalchemist', text: 'I TURN LEAD INTO GOLD. I TURN FUNCTIONS INTO FUNCTIONS. WHAT CAN YOU TURN?' },
        { type: 'talk', who: 'narrator', text: 'The Grand Alchemist has 200 HP. Icebolt shatters its flasks: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Icebolt is doubled.', code: ['from functools import reduce', 'cast(icebolt, reduce(lambda a, b: a + b, [1, 2, 3, 4], 2))'],
          explain: '2 + 1 + 2 + 3 + 4 = 12, doubled.',
        },
        {
          type: 'fix', text: 'This cached function crashes. Run it, then tap the broken line.',
          code: ['from functools import cache', '@cache', 'def weigh(items):', '    return sum(items)', 'cast(icebolt, weigh([3, 4, 5]))'], bad: 4,
          options: ['cast(icebolt, weigh((3, 4, 5)))', 'cast(icebolt, weigh({3, 4, 5}))', 'cast(icebolt, weigh([3, 4, 5]) + 0)'], answer: 0,
          explain: 'Cache arguments must be hashable: a tuple works, a list or set does not.',
        },
        { type: 'talk', who: 'grandalchemist', text: 'THEN MIX MY FINAL REAGENT!' },
        {
          type: 'fill', text: 'Pre-fill the icebolt.',
          lines: ['from functools import partial', 'frost = []', 'frost(6)'], chips: ['partial(cast, icebolt)', 'partial(icebolt, cast)', 'cast(icebolt)'], answer: [['partial(cast, icebolt)']],
          hints: ['partial(function, first_argument)', 'partial(cast, icebolt)'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Use reduce with operator.add over [$HP // 4, $HP // 4, 1] and cast icebolt with the result.',
          starter: ['import operator', 'from functools import reduce'], keys: ['cast', 'icebolt', ',', 'reduce', '(', ')', 'operator.add', '[', ']', '$HP', '//', '4', '1'],
          goal: { foeDown: true },
          require: l => (has(l, /reduce\(operator\.add/) ? null : 'Use reduce(operator.add, ...).'),
          hints: ['reduce(operator.add, [$HP // 4, $HP // 4, 1])', 'cast(icebolt, reduce(operator.add, [$HP // 4, $HP // 4, 1]))'],
          solution: ['cast(icebolt, reduce(operator.add, [$HP // 4, $HP // 4, 1]))'],
        },
        { type: 'talk', who: 'grandalchemist', text: '...you turned... me...' },
      ],
      learn: [{ title: 'functools toolkit', code: 'reduce   partial   lru_cache   cache   total_ordering   cmp_to_key   wraps', text: 'Everything from the Alchemist\'s Tools.' }],
    },
    {
      id: '49-R', title: 'The Oracle of Advanced Arts', bg: 'source', foe: { kind: 'advoracle', hp: 280 }, mentor: 'narrator', boss: true, review: true, tags: [],
      steps: [
        { type: 'talk', who: 'advoracle', text: 'Lambdas and generators, closures and decorators, chambers, courts, hoards, forges, looms and flasks, {NAME}. Python itself has opened to you. Show me.' },
        { type: 'talk', who: 'narrator', text: 'The Act VIII review! 280 HP. Each right answer strikes.' },
        { type: 'review', tags: ['lambdaq', 'sortkey', 'mapfilter', 'argsq', 'kwargsq', 'unpackcall'], reward: { spell: 'spark', power: 25 }, text: 'Gardens and sands. What will it say?' },
        { type: 'review', tags: ['iterq', 'yieldq', 'genexp', 'nesteddef', 'factory', 'closure'], reward: { spell: 'fireball', power: 25 }, text: 'River and woods. What will it say?' },
        { type: 'review', tags: ['nonlocalq', 'latebind', 'wrapfn', 'atsyntax', 'decoargs', 'decofactory'], reward: { spell: 'icebolt', power: 25 }, text: 'Closures and decorators. What will it say?' },
        { type: 'review', tags: ['enterexit', 'exitexc', 'ctxmgr', 'excclass', 'exchier', 'raisefrom'], reward: { spell: 'spark', power: 25 }, text: 'Chambers and the court. What will it say?' },
        { type: 'review', tags: ['counterq', 'defaultdictq', 'namedtupleq', 'dequeq', 'dcbasics', 'enumbasics'], reward: { spell: 'fireball', power: 25 }, text: 'Hoard and forge. What will it say?' },
        { type: 'review', tags: ['infiniteit', 'combinatoric', 'groupbyq', 'reduceq', 'partialq', 'lrucacheq'], reward: { spell: 'icebolt', power: 25 }, text: 'Loom and flask. What will it say?' },
        { type: 'talk', who: 'advoracle', text: 'One last working: every art at once.' },
        {
          type: 'write', vars: (R, c) => ({ h: c.foe.hp }),
          text: 'Make a @dataclass Charge with power: int. Write a @cache-decorated split(n) returning [Charge(n // 2), Charge(n - n // 2)] as a tuple. Count with a Counter how many charges you got from split($HP), then cast spark with the sum of their powers (via reduce over the powers with operator.add).',
          starter: ['import operator', 'from dataclasses import dataclass', 'from functools import cache, reduce', 'from collections import Counter'], keys: ['@dataclass', 'class', 'Charge', ':', 'power', 'int', '@cache', 'def', 'split', '(', ')', 'n', 'return', 'tuple', '[', ']', 'Charge(n // 2)', 'Charge(n - n // 2)', ',', 'parts', '=', 'split($HP)', 'count', 'Counter', 'type(p).__name__', 'for', 'p', 'in', 'print', 'cast', 'spark', 'reduce', 'operator.add', 'p.power'],
          goal: { foeDown: true },
          require: l => (has(l, /@dataclass/) && has(l, /@cache/) && has(l, /Counter\(/) && has(l, /reduce\(/) ? null : 'Use @dataclass, @cache, Counter and reduce.'),
          hints: ['@dataclass\nclass Charge:\n    power: int\n@cache\ndef split(n):\n    return tuple([Charge(n // 2), Charge(n - n // 2)])', 'parts = split($HP)\ncount = Counter(type(p).__name__ for p in parts)\nprint(count)\ncast(spark, reduce(operator.add, [p.power for p in parts]))'],
          solution: ['@dataclass', 'class Charge:', '    power: int', '@cache', 'def split(n):', '    return tuple([Charge(n // 2), Charge(n - n // 2)])', 'parts = split($HP)', 'count = Counter(type(p).__name__ for p in parts)', 'print(count)', 'cast(spark, reduce(operator.add, [p.power for p in parts]))'],
        },
        { type: 'talk', who: 'advoracle', text: 'The advanced arts are yours. Only the Gauntlet and the Heart of Code remain.' },
      ],
      learn: [{ title: 'Act VIII', code: 'lambda  *args  generators  closures  decorators  with\nexceptions  collections  dataclasses  Enum  itertools  functools', text: 'Python itself, from the inside.' }],
    },
  ],
};
WORLDS.push(WORLD49);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    reduceq: () => { const a = rnd(1, 5), b = rnd(1, 5), c = rnd(1, 5); return makeQ(['from functools import reduce', `print(reduce(lambda x, y: x * y, [${a}, ${b}, ${c}], 2))`], [a * b * c, a + b + c + 2, 'TypeError']); },
    operatorq: () => makeQ(['from operator import itemgetter', 'rows = [("b", 2), ("a", 2), ("c", 1)]', 'print([r[0] for r in sorted(rows, key=itemgetter(1, 0))])'], ["['c', 'b', 'a']", "['a', 'b', 'c']", "['b', 'a', 'c']"]),
    partialq: () => { const e = rnd(2, 4); return makeQ(['from functools import partial', 'def p(base, exp):', '    return base ** exp', `f = partial(p, exp=${e})`, 'print(f(3))'], [3 * e, Math.pow(e, 3), 'TypeError']); },
    lrucacheq: () => makeQ(['from functools import cache', 'n = 0', '@cache', 'def f(x):', '    global n', '    n += 1', '    return x', 'for x in [1, 2, 1, 1]:', '    f(x)', 'print(n)'], ['4', '1', '3']),
    totalorder: () => makeQ(['from functools import cmp_to_key', 'print(sorted([3, 10, 2], key=cmp_to_key(lambda a, b: b - a)))'], ['[2, 3, 10]', '[10, 2, 3]', 'TypeError']),
    funcpipe: () => { const x = rnd(1, 5); return makeQ(['comp = lambda f, g: lambda x: f(g(x))', 'inc = lambda x: x + 1', 'sq = lambda x: x * x', `print(comp(inc, sq)(${x}))`], [(x + 1) * (x + 1), x * x, x + 1]); },
  });
})();
