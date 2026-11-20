/* World 42: The Nesting Woods. Closures: functions defined inside functions, functions
   that return functions (factories), what a closure remembers, nonlocal state, the
   late-binding trap in loops, and closures as tiny objects.
   Source: our own (the Python tutorial's scope rules, Fluent Python's closure chapter). */
Object.assign(EXTRA.npcs, {
  rowan: { name: 'Elder Rowan', colors: ['#3f7a3a', '#c8c0a0', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  nestwisp: { base: 'wisp', name: 'Nest wisp', pal: { G: '#2f6a5a', L: '#7fd1b0' } },
  cellsprite: { base: 'sprite', name: 'Cell sprite', pal: { F: '#3f8f6a', L: '#ffd75f' } },
  hollowelder: { base: 'treant', name: 'The Hollow Elder', pal: {} },
});

const WORLD42 = {
  id: 42, name: 'The Nesting Woods', topic: 'closures',
  nodes: [[50, 92], [30, 82], [66, 72], [36, 62], [64, 52], [32, 42], [62, 32], [42, 21], [54, 8]],
  levels: [
    {
      id: '42-1', title: 'Trees within trees', bg: 'grove', npc: 'rowan', mentor: 'rowan', tags: ['nesteddef'],
      steps: [
        { type: 'talk', who: 'rowan', text: 'Welcome to the Nesting Woods, {NAME}. Here trees grow inside trees. A def can sit INSIDE another def. The inner function is made fresh each time the outer one runs, and its name lives only in the outer function\'s local scope.' },
        { type: 'talk', who: 'rowan', text: 'Inner helpers keep big functions tidy: the helper is hidden where it is used. And the inner function can READ the outer function\'s variables, the E (enclosing) in LEGB.' },
        { type: 'demo', text: 'A helper hidden inside. Run it.', code: ['def brew(herb):', '    def crush(x):', '        return x.lower() + " dust"', '    return crush(herb) + " tea"', 'print(brew("MINT"))'] },
        {
          type: 'predict', vars: R => ({ h: R.pick(['Oak', 'Fern', 'Moss']) }), text: 'Two helpers. What will it say?', code: ['def greet(name):', '    def shout(s):', '        return s.upper() + "!"', '    def whisper(s):', '        return s.lower() + "..."', '    return shout(name) + " " + whisper(name)', 'print(greet("$h"))'],
          explain: 'greet calls both inner helpers and joins their results.',
        },
        {
          type: 'predict', vars: R => ({ m: R.int(2, 5), h: R.int(2, 4) }), text: 'The inner function reads an outer variable. What will it say?', code: ['def forge(metal):', '    heat = $h', '    def strike():', '        return metal * heat', '    return strike() + strike()', 'print(forge($m))'],
          explain: 'strike reads metal and heat from forge\'s scope: $m × $h, twice.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Calling the inner function from outside. Which error?', code: ['def outer():', '    def inner():', '        return 1', '    return inner() + 1', 'print(outer())', 'print(inner())'],
          explain: 'outer() works and prints 2, but inner only exists inside outer: NameError.',
        },
        {
          type: 'fill', text: 'Use the inner helper to score each word.',
          lines: ['def tally(words):', '    def score(w):', '        return len(w) * 2', '    return sum([](w) for w in words)', 'print(tally(["oak", "elm", "birch"]))'], chips: ['score', 'tally', 'w'], answer: [['score']],
          hints: ['The helper is called score.', 'sum(score(w) for w in words)'],
        },
        {
          type: 'write', text: 'Write trail(steps) with an inner helper double(n) that returns n * 2. trail returns the sum of double(s) for every s in steps. Print trail([1, 2, 3]).',
          starter: [], keys: ['def', 'trail', 'double', '(', ')', ':', 'steps', 'n', 'return', '*', '2', 'sum', 'for', 's', 'in', 'print', '[1, 2, 3]'],
          require: l => (has(l, /^\s+def double/m) ? null : 'Put def double inside trail.'),
          hints: ['def trail(steps):\n    def double(n):\n        return n * 2', '    return sum(double(s) for s in steps), then print(trail([1, 2, 3]))'],
          solution: ['def trail(steps):', '    def double(n):', '        return n * 2', '    return sum(double(s) for s in steps)', 'print(trail([1, 2, 3]))'],
        },
      ],
      learn: [{ title: 'Nested functions', code: 'def outer(x):\n    def helper(y):\n        return y * 2\n    return helper(x)', text: 'An inner def is made each time outer runs. It can read outer\'s variables; it is invisible outside.' }],
    },
    {
      id: '42-2', title: 'Seeds that grow spells', bg: 'grove', npc: 'rowan', mentor: 'rowan', tags: ['factory'],
      steps: [
        { type: 'talk', who: 'rowan', text: 'Functions are values, {NAME}: you can store them, pass them, and RETURN them. An outer function that returns its inner function (the name, without calling it) is a FACTORY: each call grows a new, customised function.' },
        { type: 'demo', text: 'One factory, two spells. Run it.', code: ['def make_multiplier(n):', '    def multiply(x):', '        return x * n', '    return multiply', 'double = make_multiplier(2)', 'triple = make_multiplier(3)', 'print(double(5), triple(5))', 'print(double.__name__, double.__qualname__)'] },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 6), b: R.int(7, 12) }), text: 'What will it say?', code: ['def make_adder(n):', '    def add(x):', '        return x + n', '    return add', 'plus = make_adder($a)', 'print(plus($b), make_adder($b)($a))'],
          explain: 'plus adds $a. make_adder($b)($a) builds a fresh adder and calls it at once.',
        },
        {
          type: 'predict', vars: R => ({ s: R.pick(['ding', 'dong', 'tok']) }), text: 'The factory hands back the function itself. What will it say?', code: ['def make_bell(sound):', '    def ring():', '        return sound * 2', '    return ring', 'b = make_bell("$s")', 'print(b())', 'print(type(b).__name__)'],
          explain: 'b is the ring function; calling it gives the doubled sound. Its type is function.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'This factory returns ring() instead of ring. Which error?', code: ['def make_bell(sound):', '    def ring():', '        return sound * 2', '    return ring()', 'b = make_bell("dong")', 'print(b())'],
          explain: 'return ring() hands back the STRING "dongdong". Calling a string: TypeError (not callable).',
        },
        {
          type: 'fill', text: 'Return the new function, not its result.',
          lines: ['def make_power(p):', '    def power(x):', '        return x ** p', '    return []', 'square = make_power(2)', 'print(square(7))'], chips: ['power', 'power(x)', 'p'], answer: [['power']],
          hints: ['Return the function by its name, no parentheses.', 'return power'],
        },
        {
          type: 'write', text: 'Write make_greeter(greeting) that returns a function taking name and returning f"{greeting}, {name}!". Make hello = make_greeter("Hello") and print hello("Rowan").',
          starter: [], keys: ['def', 'make_greeter', 'greet', '(', ')', ':', 'greeting', 'name', 'return', 'f"{greeting}, {name}!"', 'hello', '=', '"Hello"', 'print', '"Rowan"'],
          require: l => (has(l, /return\s+greet\s*$/m) ? null : 'Return the inner function itself (no parentheses).'),
          hints: ['def make_greeter(greeting):\n    def greet(name):\n        return f"{greeting}, {name}!"\n    return greet', 'hello = make_greeter("Hello")\nprint(hello("Rowan"))'],
          solution: ['def make_greeter(greeting):', '    def greet(name):', '        return f"{greeting}, {name}!"', '    return greet', 'hello = make_greeter("Hello")', 'print(hello("Rowan"))'],
        },
      ],
      learn: [{ title: 'Function factories', code: 'def make_adder(n):\n    def add(x):\n        return x + n\n    return add\nplus5 = make_adder(5)', text: 'Return the inner function (no parentheses). Each call makes a new one.' }],
    },
    {
      id: '42-3', title: 'What the closure remembers', bg: 'glade', npc: 'rowan', mentor: 'rowan', tags: ['closure'],
      steps: [
        { type: 'talk', who: 'rowan', text: 'Strange, is it not? make_adder has RETURNED, so its n should be gone. But the inner function still uses n, so Python keeps n alive in a little box called a CELL, carried by the inner function. A function plus the cells it carries is a CLOSURE.' },
        { type: 'talk', who: 'rowan', text: 'Each call to the factory makes fresh cells, so every closure has its own memory. And a cell holds the VARIABLE, so the closure sees whatever value the variable has when it finally runs.' },
        { type: 'demo', text: 'Peek inside a cell. Run it.', code: ['def make_tag(label):', '    def tag(text):', '        return "<" + label + ">" + text', '    return tag', 'h1 = make_tag("h1")', 'print(h1("Woods"))', 'print(h1.__closure__[0].cell_contents)'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 3), b: R.int(4, 6), c: R.int(7, 9) }), text: 'Three seeds, three memories. What will it say?', code: ['def make_seed(n):', '    def grow():', '        return n * 10', '    return grow', 'seeds = [make_seed(k) for k in [$a, $b, $c]]', 'print([s() for s in seeds])'],
          explain: 'Each make_seed call made its own cell for n.',
        },
        {
          type: 'predict', vars: R => ({ x: R.int(1, 4), y: R.int(5, 9) }), text: 'The variable changes after the inner def. What will it say?', code: ['def outer():', '    x = $x', '    def inner():', '        return x', '    x = $y', '    return inner', 'print(outer()())'],
          explain: 'The cell holds the variable x, which is $y by the time inner runs.',
        },
        {
          type: 'predict', text: 'A function that uses no outer variables. What will it say?', code: ['def make():', '    def plain(y):', '        return y + 1', '    return plain', 'f = make()', 'print(f.__closure__, f(1))'],
          explain: 'plain needs nothing from make, so it carries no cells: __closure__ is None.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 4) }), text: 'The closure keeps a list alive. What will it say?', code: ['def make_log():', '    entries = []', '    def log(msg):', '        entries.append(msg)', '        return len(entries)', '    return log', 'log = make_log()', 'for i in range($n):', '    log(i)', 'print(log("last"))'],
          explain: 'entries lives on between calls: $n entries, then one more.',
        },
        {
          type: 'fill', text: 'Report how many hits the closure remembers.',
          lines: ['def make_hits():', '    hits = list()', '    def hit():', '        hits.append(1)', '        return []', '    return hit', 'h = make_hits()', 'h()', 'h()', 'print(h())'], chips: ['len(hits)', 'hits', 'sum(hit)'], answer: [['len(hits)']],
          hints: ['Count the items in the remembered list.', 'return len(hits)'],
        },
        {
          type: 'write', text: 'Write make_wall(height) that returns a function build(width) giving width * height. Make w = make_wall(4), then print w(3) and the height remembered in w\'s closure (w.__closure__[0].cell_contents).',
          starter: [], keys: ['def', 'make_wall', 'build', '(', ')', ':', 'height', 'width', 'return', '*', 'w', '=', '4', 'print', '3', ',', 'w.__closure__[0].cell_contents'],
          require: l => (has(l, /__closure__/) ? null : 'Also print w.__closure__[0].cell_contents.'),
          hints: ['def make_wall(height):\n    def build(width):\n        return width * height\n    return build', 'w = make_wall(4)\nprint(w(3), w.__closure__[0].cell_contents)'],
          solution: ['def make_wall(height):', '    def build(width):', '        return width * height', '    return build', 'w = make_wall(4)', 'print(w(3), w.__closure__[0].cell_contents)'],
        },
      ],
      learn: [{ title: 'Closures', code: 'f = make_adder(5)\nf.__closure__[0].cell_contents  # 5', text: 'A closure is a function plus the cells of outer variables it uses. Cells hold the variable, not a snapshot.' }],
    },
    {
      id: '42-4', title: 'Nest wisps', bg: 'forest', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'nestwisp', hp: d0 + 3 + 4 + 5, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Nest wisps swirl out of the hollow trunks! $HP HP. Grow a spell from a seed for each power.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. The factory must hand back strike itself so the loop can call it.',
          lines: ['def make_spell(power):', '    def strike():', '        cast(fireball, power)', '    return []', 'for p in [3, 4, 5]:', '    make_spell(p)()'], chips: ['strike', 'strike()', 'power'], answer: [['strike']],
          goal: { foeDown: true },
          hints: ['make_spell(p)() calls whatever make_spell returns.', 'return strike'],
        },
        { type: 'talk', who: 'narrator', text: 'The wisp mother rises, glowing!' },
        {
          type: 'write', vars: R => ({ n: R.int(5, 9) }),
          spawn: v => ({ kind: 'nestwisp', hp: v.n * 2, tint: 'big' }),
          text: 'It has $n × 2 HP. Write make_bolt(n) whose inner function casts icebolt with n. Make bolt = make_bolt($n) and call bolt() twice.',
          starter: [], keys: ['def', 'make_bolt', 'zap', '(', ')', ':', 'n', 'cast', 'icebolt', ',', 'return', 'bolt', '=', '$n'],
          goal: { foeDown: true },
          require: l => (has(l, /^\s+def /m) && has(l, /bolt\(\)/) ? null : 'Define an inner function, return it, then call bolt().'),
          hints: ['def make_bolt(n):\n    def zap():\n        cast(icebolt, n)\n    return zap', 'bolt = make_bolt($n)\nbolt()\nbolt()'],
          solution: ['def make_bolt(n):', '    def zap():', '        cast(icebolt, n)', '    return zap', 'bolt = make_bolt($n)', 'bolt()', 'bolt()'],
        },
      ],
      learn: [{ title: 'Factories in battle', code: 'make_spell(4)()', text: 'Build the function, then call it.' }],
    },
    {
      id: '42-5', title: 'The nonlocal knot', bg: 'glade', npc: 'rowan', mentor: 'rowan', tags: ['nonlocalq'],
      steps: [
        { type: 'talk', who: 'rowan', text: 'READING an outer variable is free. But ASSIGNING to it inside the inner function makes Python treat it as a brand-new LOCAL. Then n += 1 fails: n is local, yet has no value yet. That is UnboundLocalError.' },
        { type: 'talk', who: 'rowan', text: 'Tie the knot with nonlocal n: "n belongs to the enclosing function; rebind that one". Now the closure can keep a running count. (global does the same for module-level names, but nonlocal reaches only the enclosing function.)' },
        { type: 'demo', text: 'A counter that remembers. Run it.', code: ['def make_counter():', '    count = 0', '    def step():', '        nonlocal count', '        count += 1', '        return count', '    return step', 'c = make_counter()', 'print(c(), c(), c())'] },
        {
          type: 'predict', measure: 'errtype', text: 'Without nonlocal. Which error?', code: ['def make_counter():', '    count = 0', '    def step():', '        count += 1', '        return count', '    return step', 'c = make_counter()', 'print(c())'],
          explain: 'count += 1 assigns, so count is local to step, and it is read before it has a value: UnboundLocalError.',
        },
        {
          type: 'predict', vars: R => ({ k: R.int(2, 5) }), text: 'What will it say?', code: ['def make_counter():', '    count = 0', '    def step():', '        nonlocal count', '        count += 10', '        return count', '    return step', 'a = make_counter()', 'b = make_counter()', 'for i in range($k):', '    a()', 'print(a(), b())'],
          explain: 'a and b each have their own count. a was stepped $k times before the last call.',
        },
        {
          type: 'predict', text: 'Two inner functions, one cell. What will it say?', code: ['def make_pair():', '    n = 0', '    def bump():', '        nonlocal n', '        n += 1', '    def peek():', '        return n', '    return bump, peek', 'bump, peek = make_pair()', 'bump()', 'bump()', 'print(peek())'],
          explain: 'bump and peek share the same cell for n, so peek sees both bumps.',
        },
        {
          type: 'predict', text: 'nonlocal reaches the enclosing function, not the module. What will it say?', code: ['x = "global"', 'def outer():', '    x = "outer"', '    def inner():', '        nonlocal x', '        x = "changed"', '    inner()', '    return x', 'print(outer(), x)'],
          explain: 'inner rebinds outer\'s x. The module\'s x is untouched.',
        },
        {
          type: 'fill', text: 'Let add change the wallet\'s coins.',
          lines: ['def make_wallet():', '    coins = 0', '    def add(n):', '        [] coins', '        coins += n', '        return coins', '    return add', 'w = make_wallet()', 'w(5)', 'print(w(3))'], chips: ['nonlocal', 'global', 'return'], answer: [['nonlocal']],
          hints: ['coins belongs to make_wallet.', 'nonlocal coins'],
        },
        {
          type: 'write', text: 'Write make_accumulator() that returns add(x): it keeps a running total, adds x, and returns the total. Make acc = make_accumulator(), call acc(10) and acc(5), then print acc(1).',
          starter: [], keys: ['def', 'make_accumulator', 'add', '(', ')', ':', 'total', '=', '0', 'nonlocal', '+=', 'x', 'return', 'acc', '10', '5', '1', 'print'],
          require: l => (has(l, /nonlocal\s+\w+/) ? null : 'Use nonlocal so add can change the total.'),
          hints: ['def make_accumulator():\n    total = 0\n    def add(x):\n        nonlocal total\n        total += x\n        return total\n    return add', 'acc = make_accumulator()\nacc(10)\nacc(5)\nprint(acc(1))'],
          solution: ['def make_accumulator():', '    total = 0', '    def add(x):', '        nonlocal total', '        total += x', '        return total', '    return add', 'acc = make_accumulator()', 'acc(10)', 'acc(5)', 'print(acc(1))'],
        },
      ],
      learn: [{ title: 'nonlocal', code: 'def make_counter():\n    n = 0\n    def step():\n        nonlocal n\n        n += 1\n        return n\n    return step', text: 'Assigning makes a name local. nonlocal n rebinds the enclosing function\'s n instead.' }],
    },
    {
      id: '42-6', title: 'The late-binding trap', bg: 'thorns', npc: 'rowan', mentor: 'rowan', tags: ['latebind'],
      steps: [
        { type: 'talk', who: 'rowan', text: 'Here many travellers fall, {NAME}. A closure remembers the VARIABLE, not the value it had when the function was made. Functions made in a loop all share the loop variable, so when you call them later they all see its FINAL value.' },
        { type: 'talk', who: 'rowan', text: 'Two cures. Bind today\'s value as a default argument: lambda i=i: ... (defaults are evaluated when the function is made). Or build each function with a factory call, which gives each one its own cell.' },
        { type: 'demo', text: 'The trap. Run it.', code: ['fns = []', 'for i in range(3):', '    fns.append(lambda: i * 10)', 'print([f() for f in fns])'] },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 5) }), text: 'A def in a loop falls into the same trap. What will it say?', code: ['shouts = []', 'for k in range($n):', '    def shout():', '        return k', '    shouts.append(shout)', 'print([s() for s in shouts])'],
          explain: 'Every shout reads k when it is called, after the loop: k is $n - 1 for all of them.',
        },
        {
          type: 'predict', text: 'The default-argument cure. What will it say?', code: ['fns = []', 'for i in range(3):', '    fns.append(lambda i=i: i * 10)', 'print([f() for f in fns])'],
          explain: 'i=i copies the current i into each lambda\'s default when it is made.',
        },
        {
          type: 'predict', text: 'The factory cure. What will it say?', code: ['def make(i):', '    return lambda: i * 10', 'fns = [make(i) for i in range(3)]', 'print([f() for f in fns])'],
          explain: 'Each make(i) call has its own i cell.',
        },
        {
          type: 'predict', text: 'Comprehensions too. What will it say?', code: ['fns = [lambda: c for c in "abc"]', 'print([f() for f in fns])'],
          explain: 'All three lambdas share c, which ends as "c".',
        },
        {
          type: 'fix', text: 'Every button says the last name. Run it, then tap the broken line.',
          code: ['buttons = []', 'for name in ["oak", "ash", "yew"]:', '    buttons.append(lambda: "pressed " + name)', 'for b in buttons:', '    print(b())'], bad: 2,
          options: ['    buttons.append(lambda name=name: "pressed " + name)', '    buttons.append(lambda: "pressed " + "name")', '    buttons.append(lambda name: "pressed " + name)'], answer: 0,
          explain: 'name=name freezes each button\'s own name as a default.',
        },
        {
          type: 'write', text: 'Build a list spells of three functions, one for each power in [5, 1, 2], where each function returns its OWN power doubled. Print [s() for s in spells].',
          starter: ['powers = [5, 1, 2]'], keys: ['spells', '=', '[', ']', 'lambda', 'p=p', 'p', ':', '*', '2', 'for', 'in', 'powers', 'print', 's()', 's'],
          hints: ['spells = [lambda p=p: p * 2 for p in powers]', 'print([s() for s in spells])'],
          solution: ['spells = [lambda p=p: p * 2 for p in powers]', 'print([s() for s in spells])'],
        },
      ],
      learn: [{ title: 'Late binding', code: 'fns = [lambda: i for i in range(3)]    # all 2\nfns = [lambda i=i: i for i in range(3)]  # 0 1 2', text: 'Closures look variables up when called. Freeze a value with a default argument or a factory.' }],
    },
    {
      id: '42-7', title: 'A closure is a tiny object', bg: 'grove', npc: 'rowan', mentor: 'rowan', tags: ['closurestate'],
      steps: [
        { type: 'talk', who: 'rowan', text: 'A closure bundles behaviour with private data, like an object with one method. Return SEVERAL inner functions that share the same cells and you have a little object with no class at all. Nobody outside can touch the data except through those functions.' },
        { type: 'talk', who: 'rowan', text: 'Which to choose? One or two operations: a closure is light and neat. Many operations, or data others need to inspect: a class reads better. You will meet both everywhere, and decorators (next wood over) are built from closures.' },
        { type: 'demo', text: 'An account made of closures. Run it.', code: ['def make_account(balance):', '    def deposit(n):', '        nonlocal balance', '        balance += n', '        return balance', '    def check():', '        return balance', '    return deposit, check', 'dep, chk = make_account(10)', 'dep(5)', 'print(chk())'] },
        {
          type: 'predict', vars: R => ({ a: R.int(20, 60), b: R.int(2, 9) }), text: 'Two accounts. What will it say?', code: ['def make_account(balance):', '    def deposit(n):', '        nonlocal balance', '        balance += n', '    def check():', '        return balance', '    return deposit, check', 'a_dep, a_chk = make_account(100)', 'b_dep, b_chk = make_account(0)', 'a_dep($a)', 'b_dep($b)', 'print(a_chk(), b_chk())'],
          explain: 'Each make_account call has its own balance cell.',
        },
        {
          type: 'predict', vars: R => ({ k: R.int(1, 4) }), text: 'A dict of closures. What will it say?', code: ['def make_light():', '    on = False', '    def toggle():', '        nonlocal on', '        on = not on', '    def state():', '        return "on" if on else "off"', '    return {"toggle": toggle, "state": state}', 'light = make_light()', 'for i in range($k):', '    light["toggle"]()', 'print(light["state"]())'],
          explain: 'Toggled $k times from off.',
        },
        {
          type: 'predict', text: 'A closure that remembers answers. What will it say?', code: ['def make_cached(fn):', '    memo = {}', '    def wrapper(x):', '        if x not in memo:', '            memo[x] = fn(x)', '        return memo[x]', '    return wrapper', 'calls = []', 'def slow_square(x):', '    calls.append(x)', '    return x * x', 'sq = make_cached(slow_square)', 'print(sq(4), sq(4), sq(3), len(calls))'],
          explain: 'The second sq(4) comes from memo, so slow_square really ran only twice. This is the seed of a decorator.',
        },
        {
          type: 'fill', text: 'A stack made of two closures. Take the top item off.',
          lines: ['def make_stack():', '    items = list()', '    def push(x):', '        items.append(x)', '    def pop():', '        return items.[]()', '    return push, pop', 'push, pop = make_stack()', 'push(1)', 'push(2)', 'push(3)', 'print(pop(), pop())'], chips: ['pop', 'copy', 'clear'], answer: [['pop']],
          hints: ['Lists can remove and return their last item.', 'items.pop()'],
        },
        {
          type: 'write', text: 'Write make_score() returning two functions: add(points), which adds to a private total, and total(), which returns it. Unpack them, add 7 and then 5, and print total().',
          starter: [], keys: ['def', 'make_score', 'add', 'total', '(', ')', ':', 'score', '=', '0', 'nonlocal', '+=', 'points', 'return', ',', '7', '5', 'print'],
          require: l => (has(l, /nonlocal/) ? null : 'add must change the shared total: use nonlocal.'),
          hints: ['def make_score():\n    score = 0\n    def add(points):\n        nonlocal score\n        score += points\n    def total():\n        return score\n    return add, total', 'add, total = make_score()\nadd(7)\nadd(5)\nprint(total())'],
          solution: ['def make_score():', '    score = 0', '    def add(points):', '        nonlocal score', '        score += points', '    def total():', '        return score', '    return add, total', 'add, total = make_score()', 'add(7)', 'add(5)', 'print(total())'],
        },
      ],
      learn: [{ title: 'Closures as objects', code: 'def make_account(b):\n    def deposit(n): ...\n    def check(): ...\n    return deposit, check', text: 'Several inner functions sharing cells act like a small object with private data.' }],
    },
    {
      id: '42-8', title: 'Cell sprites', bg: 'forest', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'cellsprite', hp: d0 + 15, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Cell sprites flicker between the branches! $HP HP. Pump a charger closure and strike with its charge.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. The charger holds 10 already. Pump it once more so the strike reaches 15.',
          lines: ['def make_charger():', '    charge = 0', '    def pump(n):', '        nonlocal charge', '        charge += n', '        return charge', '    return pump', 'pump = make_charger()', 'pump(4)', 'pump(6)', 'cast(fireball, pump([]))'], chips: ['5', '0', '-5'], answer: [['5']],
          goal: { foeDown: true },
          hints: ['10 + ? = 15', 'pump(5)'],
        },
        { type: 'talk', who: 'narrator', text: 'The sprite queen splits into three lights: 5, 1 and 1!' },
        {
          type: 'write', spawn: () => ({ kind: 'cellsprite', hp: 7, tint: 'big' }),
          text: 'It has 7 HP. In a loop over [5, 1, 1], append a lambda that casts icebolt with that power (freeze it with a default!). Then call every lambda.',
          starter: ['bolts = []'], keys: ['for', 'p', 'in', '[5, 1, 1]', ':', 'bolts.append', '(', ')', 'lambda', 'p=p', 'cast', 'icebolt', ',', 'b', 'bolts', 'b()'],
          goal: { foeDown: true },
          require: l => (has(l, /lambda/) ? null : 'Store lambdas in bolts.'),
          hints: ['for p in [5, 1, 1]:\n    bolts.append(lambda p=p: cast(icebolt, p))', 'for b in bolts:\n    b()'],
          solution: ['for p in [5, 1, 1]:', '    bolts.append(lambda p=p: cast(icebolt, p))', 'for b in bolts:', '    b()'],
        },
      ],
      learn: [{ title: 'Closures in battle', code: 'lambda p=p: cast(icebolt, p)', text: 'Freeze loop values, or every spell strikes with the last one.' }],
    },
    {
      id: '42-9', title: 'The Hollow Elder', bg: 'hollow', foe: { kind: 'hollowelder', hp: 200, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'hollowelder', text: 'I... REMEMBER... EVERYTHING... YOU... FORGET...' },
        { type: 'talk', who: 'narrator', text: 'The Hollow Elder has 200 HP. Icebolt freezes its sap: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Icebolt is doubled.', code: ['def make(n):', '    def f():', '        return n * 3', '    return f', 'cast(icebolt, make(4)())'],
          explain: 'make(4)() returns 12, doubled.',
        },
        {
          type: 'fix', text: 'This counter crashes. Run it, then tap the broken line.',
          code: ['def make_counter():', '    hits = 0', '    def hit():', '        hits = hits + 1', '        return hits', '    return hit', 'h = make_counter()', 'h()', 'cast(icebolt, h() * 5)'], bad: 3,
          options: ['        nonlocal hits; hits += 1', '        global hits; hits += 1', '        hits += 1'], answer: 0,
          explain: 'nonlocal hits lets hit rebind the enclosing hits.',
        },
        { type: 'talk', who: 'hollowelder', text: 'ALL... YOUR... SPELLS... ARE... THE... SAME...' },
        {
          type: 'fill', text: 'Break the late-binding curse: each lambda must keep its own p.',
          lines: ['fns = [lambda []: p * 2 for p in [1, 2, 3]]', 'cast(icebolt, sum(f() for f in fns))'], chips: ['p=p', 'p', 'x=p'], answer: [['p=p']],
          hints: ['Freeze the value as a default.', 'lambda p=p: p * 2'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Write make_blast(n) returning a function that casts icebolt with n. Make blast = make_blast($HP // 2 + 1) and call it.',
          starter: [], keys: ['def', 'make_blast', 'boom', '(', ')', ':', 'n', 'cast', 'icebolt', ',', 'return', 'blast', '=', '$HP', '//', '2', '+', '1'],
          goal: { foeDown: true },
          require: l => (has(l, /^\s+def /m) ? null : 'Build the spell with an inner function.'),
          hints: ['def make_blast(n):\n    def boom():\n        cast(icebolt, n)\n    return boom', 'blast = make_blast($HP // 2 + 1)\nblast()'],
          solution: ['def make_blast(n):', '    def boom():', '        cast(icebolt, n)', '    return boom', 'blast = make_blast($HP // 2 + 1)', 'blast()'],
        },
        { type: 'talk', who: 'hollowelder', text: '...the... woods... let... you... pass...' },
      ],
      learn: [{ title: 'Closure toolkit', code: 'nested def   return inner   __closure__   nonlocal   lambda i=i', text: 'Everything from the Nesting Woods.' }],
    },
  ],
};
WORLDS.push(WORLD42);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    nesteddef: () => { const a = rnd(2, 6); return makeQ(['def outer(n):', '    def helper(x):', '        return x + 1', `    return helper(n) * 2`, `print(outer(${a}))`], [a * 2 + 1, a + 1, 'NameError']); },
    factory: () => { const a = rnd(2, 5), b = rnd(3, 9); return makeQ(['def make(n):', '    def f(x):', '        return x * n', '    return f', `g = make(${a})`, `print(g(${b}))`], [a + b, b, 'TypeError']); },
    closure: () => { const a = rnd(1, 4), b = rnd(5, 9); return makeQ(['def outer():', `    x = ${a}`, '    def inner():', '        return x', `    x = ${b}`, '    return inner', 'print(outer()())'], [a, 'None', 'NameError']); },
    nonlocalq: () => pick([
      () => makeQ(['def make():', '    n = 0', '    def step():', '        n += 1', '        return n', '    return step', 'print(make()())'], [1, 0, 'None']),
      () => { const k = rnd(2, 4); return makeQ(['def make():', '    n = 0', '    def step():', '        nonlocal n', '        n += 1', '        return n', '    return step', 's = make()', ...Array.from({ length: k }, () => 's()'), 'print(s())'], [k, 1, 0]); },
    ])(),
    latebind: () => pick([
      () => makeQ(['fs = [lambda: i for i in range(3)]', 'print([f() for f in fs])'], ['[0, 1, 2]', '[2]', '[0, 0, 0]']),
      () => makeQ(['fs = [lambda i=i: i for i in range(3)]', 'print([f() for f in fs])'], ['[2, 2, 2]', '[0, 0, 0]', '[3, 3, 3]']),
    ])(),
    closurestate: () => { const a = rnd(2, 6); return makeQ(['def make():', '    items = []', '    def add(x):', '        items.append(x)', '        return len(items)', '    return add', 'a = make()', 'b = make()', `a(${a})`, 'a(1)', 'print(a(0), b(0))'], ['3 3', '1 1', '2 1']); },
  });
})();
