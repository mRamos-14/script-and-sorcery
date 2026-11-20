/* World 43: The Enchanter's Workshop. Decorators: functions that wrap functions, the @
   syntax and when it runs, stacking, wrappers that pass *args/**kwargs and return results,
   functools.wraps, decorators that take arguments, and real uses (counting, registries,
   validation, caching, class-based decorators).
   Source: our own (PEP 318, the functools docs, Real Python's decorator primer). */
Object.assign(EXTRA.npcs, {
  vela: { name: 'Enchantress Vela', colors: ['#9a3f8f', '#2b2433', '#ecb98d'] },
});
Object.assign(EXTRA.foes, {
  runebat: { base: 'bat', name: 'Rune bat', pal: { P: '#9a3f8f', W: '#7fdcff' } },
  wrapmimic: { base: 'mimic', name: 'Wrap mimic', pal: { B: '#5a3a8a', Y: '#e2b34a' } },
  grandenchanter: { base: 'shadowmage', name: 'The Grand Enchanter', pal: {} },
});

const WORLD43 = {
  id: 43, name: "The Enchanter's Workshop", topic: 'decorators',
  nodes: [[50, 92], [70, 82], [34, 72], [64, 62], [36, 52], [66, 42], [38, 32], [58, 21], [48, 8]],
  levels: [
    {
      id: '43-1', title: 'Spells that wrap spells', bg: 'study', npc: 'vela', mentor: 'vela', tags: ['wrapfn'],
      steps: [
        { type: 'talk', who: 'vela', text: 'Welcome to my workshop, {NAME}. You know closures now, so you can learn enchanting. A function can TAKE a function and RETURN a new one that does something extra before or after calling the original. That wrapping function is a DECORATOR.' },
        { type: 'demo', text: 'Wrap a spell by hand. Run it.', code: ['def loud(fn):', '    def wrapper():', '        return fn().upper() + "!"', '    return wrapper', 'def hello():', '    return "hello"', 'shout = loud(hello)', 'print(hello(), shout())'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(['rune', 'charm', 'glyph']) }), text: 'Reassign the name to its wrapped version. What will it say?', code: ['def loud(fn):', '    def wrapper():', '        return fn().upper() + "!"', '    return wrapper', 'def word():', '    return "$w"', 'word = loud(word)', 'print(word())'],
          explain: 'word now names the wrapper, which calls the original and shouts it.',
        },
        {
          type: 'predict', text: 'Before and after. What will it say?', code: ['def announce(fn):', '    def wrapper():', '        print("before")', '        fn()', '        print("after")', '    return wrapper', 'def work():', '    print("working")', 'work = announce(work)', 'work()'],
          explain: 'The wrapper runs its own lines around the original call.',
        },
        {
          type: 'predict', text: 'Wrapped twice. What will it say?', code: ['def loud(fn):', '    def wrapper():', '        return fn().upper() + "!"', '    return wrapper', 'def hi():', '    return "hi"', 'hi = loud(loud(hi))', 'print(hi())'],
          explain: 'The inner wrapper gives "HI!", the outer one shouts that again: "HI!!".',
        },
        {
          type: 'predict', measure: 'errtype', text: 'This decorator forgot to return its wrapper. Which error?', code: ['def loud(fn):', '    def wrapper():', '        return fn().upper()', 'def hi():', '    return "hi"', 'hi = loud(hi)', 'print(hi())'],
          explain: 'loud returns None, so hi becomes None. Calling None: TypeError.',
        },
        {
          type: 'fill', text: 'The wrapper should run the chant twice.',
          lines: ['def twice(fn):', '    def wrapper():', '        fn()', '        []', '    return wrapper', 'def chant():', '    print("om")', 'chant = twice(chant)', 'chant()'], chips: ['fn()', 'wrapper()', 'chant()'], answer: [['fn()']],
          hints: ['Call the ORIGINAL function again.', 'fn()'],
        },
        {
          type: 'write', text: 'Write bracket(fn) that returns a wrapper giving "[" + fn() + "]". Define name() returning "vela", wrap it with name = bracket(name), and print name().',
          starter: [], keys: ['def', 'bracket', 'wrapper', 'name', '(', ')', ':', 'fn', 'return', '"["', '"]"', '+', '"vela"', '=', 'print'],
          require: l => (has(l, /name\s*=\s*bracket\(\s*name\s*\)/) ? null : 'Wrap it by hand: name = bracket(name).'),
          hints: ['def bracket(fn):\n    def wrapper():\n        return "[" + fn() + "]"\n    return wrapper', 'def name():\n    return "vela"\nname = bracket(name)\nprint(name())'],
          solution: ['def bracket(fn):', '    def wrapper():', '        return "[" + fn() + "]"', '    return wrapper', 'def name():', '    return "vela"', 'name = bracket(name)', 'print(name())'],
        },
      ],
      learn: [{ title: 'Decorators by hand', code: 'def loud(fn):\n    def wrapper():\n        return fn().upper()\n    return wrapper\nhi = loud(hi)', text: 'A decorator takes a function and returns a new one wrapped around it.' }],
    },
    {
      id: '43-2', title: 'The @ rune', bg: 'study', npc: 'vela', mentor: 'vela', tags: ['atsyntax'],
      steps: [
        { type: 'talk', who: 'vela', text: 'Writing hi = loud(hi) after every def is tiresome. The @ rune does it for you: @loud on the line above def hi means exactly hi = loud(hi), done once, right when the def runs. Not on every call!' },
        { type: 'talk', who: 'vela', text: 'Runes stack. With @a above @b above def f, the one CLOSEST to the def is applied first: f = a(b(f)). So the top decorator is the outermost layer.' },
        { type: 'demo', text: 'The rune. Run it.', code: ['def loud(fn):', '    def wrapper():', '        return fn().upper() + "!"', '    return wrapper', '@loud', 'def hello():', '    return "hello"', 'print(hello())'] },
        {
          type: 'predict', text: 'When does decorating happen? What will it say?', code: ['def mark(fn):', '    print("marking", fn.__name__)', '    return fn', '@mark', 'def a():', '    return 1', '@mark', 'def b():', '    return 2', 'print(a() + b())'],
          explain: 'mark runs once per def, at definition time, before anything is called.',
        },
        {
          type: 'predict', vars: R => ({ t: R.pick(['hi', 'yo', 'ok']) }), text: 'Stacked runes. What will it say?', code: ['def bold(fn):', '    def w():', '        return "<b>" + fn() + "</b>"', '    return w', 'def italic(fn):', '    def w():', '        return "<i>" + fn() + "</i>"', '    return w', '@bold', '@italic', 'def text():', '    return "$t"', 'print(text())'],
          explain: 'italic wraps first (closest), bold wraps that: bold is the outer layer.',
        },
        {
          type: 'predict', text: 'Swap the order. What will it say?', code: ['def add1(fn):', '    def w():', '        return fn() + 1', '    return w', 'def double(fn):', '    def w():', '        return fn() * 2', '    return w', '@add1', '@double', 'def five():', '    return 5', '@double', '@add1', 'def six():', '    return 5', 'print(five(), six())'],
          explain: 'five is add1(double(five)) = 5 × 2 + 1. six is double(add1(...)) = (5 + 1) × 2.',
        },
        {
          type: 'predict', text: 'A decorator may return any function at all. What will it say?', code: ['def replace(fn):', '    return lambda: "replaced"', '@replace', 'def original():', '    return "original"', 'print(original())'],
          explain: 'The name original now points at whatever replace returned.',
        },
        {
          type: 'fill', text: 'Decorate cheer with exclaim.',
          lines: ['def exclaim(fn):', '    def wrapper():', '        return fn() + "!"', '    return wrapper', '[]exclaim', 'def cheer():', '    return "hooray"', 'print(cheer())'], chips: ['@', '#', '*'], answer: [['@']],
          hints: ['The decorator rune.', '@exclaim'],
        },
        {
          type: 'write', text: 'Write a decorator stars(fn) whose wrapper returns "*" + fn() + "*". Use @stars on title(), which returns "spell", and print title().',
          starter: [], keys: ['def', 'stars', 'wrapper', 'title', '(', ')', ':', 'fn', 'return', '"*"', '+', '"spell"', '@stars', 'print'],
          require: l => (has(l, /^@stars/m) ? null : 'Decorate with the @ rune.'),
          hints: ['def stars(fn):\n    def wrapper():\n        return "*" + fn() + "*"\n    return wrapper', '@stars\ndef title():\n    return "spell"\nprint(title())'],
          solution: ['def stars(fn):', '    def wrapper():', '        return "*" + fn() + "*"', '    return wrapper', '@stars', 'def title():', '    return "spell"', 'print(title())'],
        },
      ],
      learn: [{ title: 'The @ syntax', code: '@a\n@b\ndef f(): ...\n# same as f = a(b(f))', text: 'Applied once, when the def runs. The decorator closest to def wraps first.' }],
    },
    {
      id: '43-3', title: 'Wrappers that pass everything on', bg: 'scriptorium', npc: 'vela', mentor: 'vela', tags: ['decoargs'],
      steps: [
        { type: 'talk', who: 'vela', text: 'Real functions take arguments and return results. A general wrapper accepts anything with *args, **kwargs, passes it all on with fn(*args, **kwargs), and RETURNS what fn gave back. Forget the return and every caller gets None.' },
        { type: 'demo', text: 'A logging wrapper. Run it.', code: ['def logged(fn):', '    def wrapper(*args, **kwargs):', '        print("calling", fn.__name__, args, kwargs)', '        return fn(*args, **kwargs)', '    return wrapper', '@logged', 'def add(a, b=0):', '    return a + b', 'print(add(2, b=5))'] },
        {
          type: 'predict', measure: 'errtype', text: 'This wrapper takes no parameters. Which error?', code: ['def logged(fn):', '    def wrapper():', '        return fn()', '    return wrapper', '@logged', 'def add(a, b):', '    return a + b', 'print(add(2, 3))'],
          explain: 'add is now wrapper, which accepts nothing: TypeError (takes 0 positional arguments but 2 were given).',
        },
        {
          type: 'predict', text: 'This wrapper forgot to return. What will it say?', code: ['def logged(fn):', '    def wrapper(*args):', '        fn(*args)', '    return wrapper', '@logged', 'def add(a, b):', '    return a + b', 'print(add(2, 3))'],
          explain: 'add\'s result is thrown away; the wrapper itself returns None.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 6), b: R.int(2, 6) }), text: 'The wrapper changes the result. What will it say?', code: ['def doubled(fn):', '    def wrapper(*args, **kwargs):', '        return 2 * fn(*args, **kwargs)', '    return wrapper', '@doubled', 'def area(w, h=1):', '    return w * h', 'print(area($a), area($a, h=$b))'],
          explain: 'Both calls pass through, and each result is doubled.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([-5, 15, 25]) }), text: 'The wrapper changes the arguments. What will it say?', code: ['def clamp(fn):', '    def wrapper(x):', '        return fn(max(0, min(x, 10)))', '    return wrapper', '@clamp', 'def show(x):', '    return "level " + str(x)', 'print(show($n), show(7))'],
          explain: 'The wrapper squeezes x into 0..10 before the original sees it.',
        },
        {
          type: 'fill', text: 'Pass every argument through, unchanged.',
          lines: ['def doubled(fn):', '    def wrapper(*args, **kwargs):', '        return 2 * fn([])', '    return wrapper', '@doubled', 'def area(w, h=1):', '    return w * h', 'print(area(3, h=4))'], chips: ['*args, **kwargs', 'args, kwargs', '*args'], answer: [['*args, **kwargs']],
          hints: ['Unpack the tuple and the dict again.', 'fn(*args, **kwargs)'],
        },
        {
          type: 'write', text: 'Write a decorator safe(fn): its wrapper(*args, **kwargs) returns fn(*args, **kwargs), but returns 0 if that raises ZeroDivisionError. Decorate divide(a, b), which returns a / b, and print divide(6, 3) and divide(1, 0).',
          starter: [], keys: ['def', 'safe', 'wrapper', 'divide', '(', ')', ':', 'fn', '*args', '**kwargs', ',', 'try', 'except', 'ZeroDivisionError', 'return', '0', '@safe', 'a', 'b', '/', 'print', '6', '3', '1'],
          require: l => (has(l, /^@safe/m) && has(l, /\*args/) ? null : 'Use @safe and a wrapper(*args, **kwargs).'),
          hints: ['def safe(fn):\n    def wrapper(*args, **kwargs):\n        try:\n            return fn(*args, **kwargs)\n        except ZeroDivisionError:\n            return 0\n    return wrapper', '@safe\ndef divide(a, b):\n    return a / b\nprint(divide(6, 3), divide(1, 0))'],
          solution: ['def safe(fn):', '    def wrapper(*args, **kwargs):', '        try:', '            return fn(*args, **kwargs)', '        except ZeroDivisionError:', '            return 0', '    return wrapper', '@safe', 'def divide(a, b):', '    return a / b', 'print(divide(6, 3), divide(1, 0))'],
        },
      ],
      learn: [{ title: 'A general wrapper', code: 'def deco(fn):\n    def wrapper(*args, **kwargs):\n        # before\n        result = fn(*args, **kwargs)\n        # after\n        return result\n    return wrapper', text: 'Accept anything, pass it all on, return the result.' }],
    },
    {
      id: '43-4', title: 'Rune bats', bg: 'tunnel', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'runebat', hp: d0 + 12, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Rune bats swarm the workshop! $HP HP. Amplify a plain spell with a decorator.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. The amplifier must triple the power.',
          lines: ['def amplify(fn):', '    def wrapper(*args):', '        return fn(*args) * []', '    return wrapper', '@amplify', 'def power(n):', '    return n', 'cast(fireball, power(4))'], chips: ['3', '1', '0'], answer: [['3']],
          goal: { foeDown: true },
          hints: ['Triple it.', '* 3'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat king screeches!' },
        {
          type: 'write', vars: R => ({ n: R.int(5, 9) }),
          spawn: v => ({ kind: 'runebat', hp: v.n * 2, tint: 'big' }),
          text: 'It has $n × 2 HP. Write a decorator twice(fn) whose wrapper calls fn() two times. Use @twice on bolt(), which casts icebolt with $n, then call bolt() once.',
          starter: [], keys: ['def', 'twice', 'wrapper', 'bolt', '(', ')', ':', 'fn', 'fn()', 'return', '@twice', 'cast', 'icebolt', ',', '$n'],
          goal: { foeDown: true },
          require: l => (has(l, /^@twice/m) && (typed(l).match(/^bolt\(\)/gm) || []).length === 1 ? null : 'Decorate with @twice and call bolt() just once.'),
          hints: ['def twice(fn):\n    def wrapper():\n        fn()\n        fn()\n    return wrapper', '@twice\ndef bolt():\n    cast(icebolt, $n)\nbolt()'],
          solution: ['def twice(fn):', '    def wrapper():', '        fn()', '        fn()', '    return wrapper', '@twice', 'def bolt():', '    cast(icebolt, $n)', 'bolt()'],
        },
      ],
      learn: [{ title: 'Decorators in battle', code: '@amplify\ndef power(n): ...', text: 'One decorator upgrades every spell it touches.' }],
    },
    {
      id: '43-5', title: 'Keeping the true name', bg: 'archive', npc: 'vela', mentor: 'vela', tags: ['wrapsq'],
      steps: [
        { type: 'talk', who: 'vela', text: 'Decorating has a cost: the name now points at wrapper, so __name__ says "wrapper" and the docstring is gone. Error messages, help() and debuggers all see the wrong spell.' },
        { type: 'talk', who: 'vela', text: 'The cure is @functools.wraps(fn) on the wrapper. It copies __name__, __doc__ and friends from fn, and leaves __wrapped__ pointing at the original. Use it in every decorator you write.' },
        { type: 'demo', text: 'The lost name. Run it.', code: ['def logged(fn):', '    def wrapper(*args):', '        return fn(*args)', '    return wrapper', '@logged', 'def add(a, b):', '    """Add two numbers."""', '    return a + b', 'print(add.__name__, add.__doc__)'] },
        {
          type: 'predict', text: 'With wraps. What will it say?', code: ['from functools import wraps', 'def logged(fn):', '    @wraps(fn)', '    def wrapper(*args):', '        return fn(*args)', '    return wrapper', '@logged', 'def add(a, b):', '    """Add two numbers."""', '    return a + b', 'print(add.__name__, add.__doc__)'],
          explain: 'wraps copied the original name and docstring onto the wrapper.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9), b: R.int(2, 9) }), text: 'Reaching past the wrapper. What will it say?', code: ['from functools import wraps', 'def doubled(fn):', '    @wraps(fn)', '    def wrapper(*args):', '        return fn(*args) * 2', '    return wrapper', '@doubled', 'def add(a, b):', '    return a + b', 'print(add($a, $b), add.__wrapped__($a, $b))'],
          explain: '__wrapped__ is the original, undecorated add.',
        },
        {
          type: 'predict', text: 'Without wraps, every decorated function shares one name. What will it say?', code: ['def plain(fn):', '    def wrapper():', '        return fn()', '    return wrapper', '@plain', 'def north():', '    return "N"', '@plain', 'def south():', '    return "S"', 'print(north.__name__ == south.__name__, north(), south())'],
          explain: 'Both are called wrapper, though they still do different things.',
        },
        {
          type: 'fill', text: 'Keep greet\'s real name.',
          lines: ['from functools import wraps', 'def polite(fn):', '    @[](fn)', '    def wrapper(name):', '        return fn(name) + ", please"', '    return wrapper', '@polite', 'def greet(name):', '    return "hi " + name', 'print(greet("Vela"), greet.__name__)'], chips: ['wraps', 'wrapper', 'fn'], answer: [['wraps']],
          hints: ['The tool from functools.', '@wraps(fn)'],
        },
        {
          type: 'write', text: 'Write a decorator traced that uses @wraps(fn). Its wrapper(*args) prints "->" and fn.__name__, then returns fn(*args). Decorate heal(n), which returns n + 1. Print heal(4), then print heal.__name__.',
          starter: ['from functools import wraps'], keys: ['def', 'traced', 'wrapper', 'heal', '(', ')', ':', 'fn', '@wraps(fn)', '*args', 'print', '"->"', 'fn.__name__', ',', 'return', '@traced', 'n', '+', '1', '4', 'heal.__name__'],
          require: l => (has(l, /@wraps\(fn\)/) ? null : 'Use @wraps(fn) on the wrapper.'),
          hints: ['def traced(fn):\n    @wraps(fn)\n    def wrapper(*args):\n        print("->", fn.__name__)\n        return fn(*args)\n    return wrapper', '@traced\ndef heal(n):\n    return n + 1\nprint(heal(4))\nprint(heal.__name__)'],
          solution: ['def traced(fn):', '    @wraps(fn)', '    def wrapper(*args):', '        print("->", fn.__name__)', '        return fn(*args)', '    return wrapper', '@traced', 'def heal(n):', '    return n + 1', 'print(heal(4))', 'print(heal.__name__)'],
        },
      ],
      learn: [{ title: 'functools.wraps', code: 'from functools import wraps\ndef deco(fn):\n    @wraps(fn)\n    def wrapper(*a, **k):\n        return fn(*a, **k)\n    return wrapper', text: 'Keeps __name__ and __doc__; adds __wrapped__.' }],
    },
    {
      id: '43-6', title: 'Runes with settings', bg: 'study', npc: 'vela', mentor: 'vela', tags: ['decofactory'],
      steps: [
        { type: 'talk', who: 'vela', text: 'Some decorators take settings: @repeat(3). Look closely: repeat(3) is CALLED first, and whatever it returns must be the real decorator. So there are three layers: the factory takes the settings, the decorator takes fn, the wrapper takes the call\'s arguments.' },
        { type: 'demo', text: 'Three layers. Run it.', code: ['def repeat(n):', '    def deco(fn):', '        def wrapper(*args):', '            return [fn(*args) for _ in range(n)]', '        return wrapper', '    return deco', '@repeat(3)', 'def hi():', '    return "hi"', 'print(hi())'] },
        {
          type: 'predict', vars: R => ({ p: R.pick(['>> ', '~ ', '* ']) }), text: 'What will it say?', code: ['def prefix(mark):', '    def deco(fn):', '        def wrapper(text):', '            return mark + fn(text)', '        return wrapper', '    return deco', '@prefix("$p")', 'def say(text):', '    return text.title()', 'print(say("into the woods"))'],
          explain: 'prefix("$p") built a decorator that remembers the mark.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'The parentheses were forgotten. Which error?', code: ['def repeat(n):', '    def deco(fn):', '        def wrapper(*a):', '            return [fn(*a) for _ in range(n)]', '        return wrapper', '    return deco', '@repeat', 'def hi():', '    return "hi"', 'print(hi())'],
          explain: '@repeat passed hi in as n, so hi became deco. Calling deco() without fn: TypeError.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 3), b: R.int(4, 5) }), text: 'Two settings, two decorators. What will it say?', code: ['def times(k):', '    def deco(fn):', '        def wrapper(x):', '            return fn(x) * k', '        return wrapper', '    return deco', '@times($a)', 'def a(x):', '    return x', '@times($b)', 'def b(x):', '    return x', 'print(a(10), b(10))'],
          explain: 'Each times(...) call made a decorator with its own k.',
        },
        {
          type: 'fill', text: 'The factory must hand back the decorator.',
          lines: ['def tag(name):', '    def deco(fn):', '        def wrapper():', '            return "<" + name + ">" + fn()', '        return wrapper', '    return []', '@tag("b")', 'def word():', '    return "rune"', 'print(word())'], chips: ['deco', 'wrapper', 'deco(fn)'], answer: [['deco']],
          hints: ['tag("b") must return something that takes fn.', 'return deco'],
        },
        {
          type: 'write', text: 'Write a decorator factory wrap_in(name): its wrapper returns f"<{name}>{fn()}</{name}>". Use @wrap_in("i") on word(), which returns "rune", and print word().',
          starter: [], keys: ['def', 'wrap_in', 'deco', 'wrapper', 'word', '(', ')', ':', 'name', 'fn', 'return', 'f"<{name}>{fn()}</{name}>"', '@wrap_in("i")', '"rune"', 'print'],
          require: l => (has(l, /@wrap_in\(/) ? null : 'Decorate with @wrap_in("i").'),
          hints: ['def wrap_in(name):\n    def deco(fn):\n        def wrapper():\n            return f"<{name}>{fn()}</{name}>"\n        return wrapper\n    return deco', '@wrap_in("i")\ndef word():\n    return "rune"\nprint(word())'],
          solution: ['def wrap_in(name):', '    def deco(fn):', '        def wrapper():', '            return f"<{name}>{fn()}</{name}>"', '        return wrapper', '    return deco', '@wrap_in("i")', 'def word():', '    return "rune"', 'print(word())'],
        },
      ],
      learn: [{ title: 'Decorator factories', code: 'def repeat(n):\n    def deco(fn):\n        def wrapper(*a, **k):\n            ...\n        return wrapper\n    return deco\n@repeat(3)', text: '@repeat(3) calls repeat first; it must return the decorator.' }],
    },
    {
      id: '43-7', title: "The enchanter's toolkit", bg: 'forge', npc: 'vela', mentor: 'vela', tags: ['decouse'],
      steps: [
        { type: 'talk', who: 'vela', text: 'What are decorators FOR? Counting calls, registering functions in a table (commands, routes, plugins), checking arguments, caching answers, timing and logging. And a class with __call__ can be a decorator too, keeping its state in attributes.' },
        { type: 'demo', text: 'Counting calls with a function attribute. Run it.', code: ['def counted(fn):', '    def wrapper(*args, **kwargs):', '        wrapper.calls += 1', '        return fn(*args, **kwargs)', '    wrapper.calls = 0', '    return wrapper', '@counted', 'def ping():', '    return "pong"', 'ping()', 'ping()', 'print(ping(), ping.calls)'] },
        {
          type: 'predict', text: 'A registry. What will it say?', code: ['commands = {}', 'def command(fn):', '    commands[fn.__name__] = fn', '    return fn', '@command', 'def north():', '    return "you go north"', '@command', 'def look():', '    return "trees everywhere"', 'print(sorted(commands))', 'print(commands["look"]())'],
          explain: 'Each decorated function registers itself by name and is returned unchanged.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([16, 25, 49]) }), text: 'A guard. What will it say?', code: ['def positive(fn):', '    def wrapper(n):', '        if n < 0:', '            raise ValueError("negative!")', '        return fn(n)', '    return wrapper', '@positive', 'def root(n):', '    return n ** 0.5', 'print(root($n))', 'try:', '    root(-4)', 'except ValueError as e:', '    print("refused:", e)'],
          explain: 'The wrapper checks the argument before the original ever runs.',
        },
        {
          type: 'predict', text: 'A class as a decorator. What will it say?', code: ['class CountCalls:', '    def __init__(self, fn):', '        self.fn = fn', '        self.calls = 0', '    def __call__(self, *args):', '        self.calls += 1', '        return self.fn(*args)', '@CountCalls', 'def ping():', '    return "pong"', 'ping()', 'ping()', 'print(ping(), ping.calls)'],
          explain: 'ping is now a CountCalls object; calling it runs __call__.',
        },
        {
          type: 'predict', text: 'A caching decorator. What will it say?', code: ['calls = 0', 'def memo(fn):', '    cache = {}', '    def wrapper(n):', '        if n not in cache:', '            cache[n] = fn(n)', '        return cache[n]', '    return wrapper', '@memo', 'def fib(n):', '    global calls', '    calls += 1', '    return n if n < 2 else fib(n - 1) + fib(n - 2)', 'print(fib(10), calls)'],
          explain: 'With the cache, each fib(0)..fib(10) is computed once: 11 real calls instead of 177.',
        },
        {
          type: 'fill', text: 'Register each route under its function\'s name.',
          lines: ['routes = {}', 'def route(fn):', '    routes[[]] = fn', '    return fn', '@route', 'def home():', '    return "home page"', '@route', 'def about():', '    return "about page"', 'print(sorted(routes), routes["about"]())'], chips: ['fn.__name__', 'fn', 'fn()'], answer: [['fn.__name__']],
          hints: ['The key is the name string.', 'routes[fn.__name__] = fn'],
        },
        {
          type: 'write', text: 'Write a decorator once(fn): the first call runs fn and saves its result; later calls just return the saved result. Use @once on setup(), which prints "setting up" and returns 42. Print setup() twice.',
          starter: [], keys: ['def', 'once', 'wrapper', 'setup', '(', ')', ':', 'fn', 'done', '=', '{}', 'if', 'not', 'in', '"r"', '[', ']', 'fn()', 'return', '@once', 'print', '"setting up"', '42'],
          require: l => (has(l, /^@once/m) ? null : 'Decorate setup with @once.'),
          hints: ['def once(fn):\n    done = {}\n    def wrapper():\n        if "r" not in done:\n            done["r"] = fn()\n        return done["r"]\n    return wrapper', '@once\ndef setup():\n    print("setting up")\n    return 42\nprint(setup())\nprint(setup())'],
          solution: ['def once(fn):', '    done = {}', '    def wrapper():', '        if "r" not in done:', '            done["r"] = fn()', '        return done["r"]', '    return wrapper', '@once', 'def setup():', '    print("setting up")', '    return 42', 'print(setup())', 'print(setup())'],
        },
      ],
      learn: [{ title: 'Decorator uses', code: 'counting   registries   guards   caching   logging\nclass Deco:\n    def __call__(self, *a): ...', text: 'Add behaviour to many functions without touching their bodies.' }],
    },
    {
      id: '43-8', title: 'Wrap mimics', bg: 'vault', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'wrapmimic', hp: d0 + 18, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Chests snap open: wrap mimics! $HP HP. Stack your runes in the right order.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. base gives 4. Choose the top rune so the strike is (4 + 2) × 3.',
          lines: ['def plus2(fn):', '    def w():', '        return fn() + 2', '    return w', 'def times3(fn):', '    def w():', '        return fn() * 3', '    return w', '@[]', '@plus2', 'def base():', '    return 4', 'cast(fireball, base())'], chips: ['times3', 'plus2', 'base'], answer: [['times3']],
          goal: { foeDown: true },
          hints: ['The top rune is the outer layer, so it acts last.', '@times3'],
        },
        { type: 'talk', who: 'narrator', text: 'The mimic king grinds its lid!' },
        {
          type: 'write', vars: R => ({ n: R.int(5, 9) }),
          spawn: v => ({ kind: 'wrapmimic', hp: v.n * 2, tint: 'big' }),
          text: 'It has $n × 2 HP. Write a decorator factory power(n) whose wrapper casts icebolt with n and then returns fn(). Use @power($n) on zap() (its body can just be pass) and call zap() twice.',
          starter: [], keys: ['def', 'power', 'deco', 'wrapper', 'zap', '(', ')', ':', 'n', 'fn', 'cast', 'icebolt', ',', 'return', 'fn()', '@power($n)', 'pass'],
          goal: { foeDown: true },
          require: l => (has(l, /@power\(/) ? null : 'Decorate zap with @power($n).'),
          hints: ['def power(n):\n    def deco(fn):\n        def wrapper():\n            cast(icebolt, n)\n            return fn()\n        return wrapper\n    return deco', '@power($n)\ndef zap():\n    pass\nzap()\nzap()'],
          solution: ['def power(n):', '    def deco(fn):', '        def wrapper():', '            cast(icebolt, n)', '            return fn()', '        return wrapper', '    return deco', '@power($n)', 'def zap():', '    pass', 'zap()', 'zap()'],
        },
      ],
      learn: [{ title: 'Stacking in battle', code: '@times3\n@plus2\ndef base(): ...', text: 'Bottom rune first, top rune last.' }],
    },
    {
      id: '43-9', title: 'The Grand Enchanter', bg: 'citadel', foe: { kind: 'grandenchanter', hp: 200, weak: 'fireball', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'grandenchanter', text: 'Every spell you cast, I WRAP. Every name you trust, I REPLACE.' },
        { type: 'talk', who: 'narrator', text: 'The Grand Enchanter has 200 HP. Fireball burns through its wards: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Fireball is doubled.', code: ['def doubled(fn):', '    def w(*a):', '        return fn(*a) * 2', '    return w', '@doubled', 'def f(n):', '    return n + 1', 'cast(fireball, f(5))'],
          explain: 'f(5) is (5 + 1) × 2 = 12, then doubled again by the weakness.',
        },
        {
          type: 'fix', text: 'This boost loses its power. Run it, then tap the broken line.',
          code: ['def boost(fn):', '    def wrapper(n):', '        fn(n + 1)', '    return wrapper', '@boost', 'def power(n):', '    return n * 2', 'cast(fireball, power(4))'], bad: 2,
          options: ['        return fn(n + 1)', '        return fn', '        print(fn(n + 1))'], answer: 0,
          explain: 'The wrapper must return the original\'s result.',
        },
        { type: 'talk', who: 'grandenchanter', text: 'Then face my THREE-LAYER ward!' },
        {
          type: 'fill', text: 'The decorator must return the wrapper.',
          lines: ['def times(n):', '    def deco(fn):', '        def wrapper():', '            return fn() * n', '        return []', '    return deco', '@times(3)', 'def base():', '    return 4', 'cast(fireball, base())'], chips: ['wrapper', 'deco', 'fn'], answer: [['wrapper']],
          hints: ['deco gets fn and hands back the new function.', 'return wrapper'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and fireball is doubled. Write a decorator finisher whose wrapper returns fn() + 1. Use @finisher on strike(), which returns $HP // 2, then cast fireball with strike().',
          starter: [], keys: ['def', 'finisher', 'wrapper', 'strike', '(', ')', ':', 'fn', 'return', 'fn()', '+', '1', '@finisher', '$HP', '//', '2', 'cast', 'fireball', ','],
          goal: { foeDown: true },
          require: l => (has(l, /^@finisher/m) ? null : 'Decorate strike with @finisher.'),
          hints: ['def finisher(fn):\n    def wrapper():\n        return fn() + 1\n    return wrapper', '@finisher\ndef strike():\n    return $HP // 2\ncast(fireball, strike())'],
          solution: ['def finisher(fn):', '    def wrapper():', '        return fn() + 1', '    return wrapper', '@finisher', 'def strike():', '    return $HP // 2', 'cast(fireball, strike())'],
        },
        { type: 'talk', who: 'grandenchanter', text: '...unwrapped... at last...' },
      ],
      learn: [{ title: 'Decorator toolkit', code: '@deco   *args, **kwargs   return fn(...)   @wraps(fn)   @factory(arg)', text: 'Everything from the Enchanter\'s Workshop.' }],
    },
  ],
};
WORLDS.push(WORLD43);

(() => {
  const { makeQ, pick, rnd } = Arena;
  const LOUD = ['def loud(fn):', '    def w():', '        return fn() + "!"', '    return w'];
  Object.assign(Arena.GEN, {
    wrapfn: () => { const w = pick(['oak', 'ash', 'elm']); return makeQ([...LOUD, 'def f():', `    return "${w}"`, 'f = loud(loud(f))', 'print(f())'], [`${w}!`, w, 'TypeError']); },
    atsyntax: () => makeQ(['def add1(fn):', '    def w():', '        return fn() + 1', '    return w', 'def dbl(fn):', '    def w():', '        return fn() * 2', '    return w', '@add1', '@dbl', 'def f():', `    return ${rnd(2, 6)}`, 'print(f())'], ['8', '14', '12']),
    decoargs: () => makeQ(['def deco(fn):', '    def w(*args):', '        fn(*args)', '    return w', '@deco', 'def add(a, b):', '    return a + b', `print(add(${rnd(1, 5)}, ${rnd(1, 5)}))`], ['5', '0', 'TypeError']),
    wrapsq: () => pick([
      () => makeQ(['def deco(fn):', '    def wrapper():', '        return fn()', '    return wrapper', '@deco', 'def spell():', '    return 1', 'print(spell.__name__)'], ['spell', 'deco', 'None']),
      () => makeQ(['from functools import wraps', 'def deco(fn):', '    @wraps(fn)', '    def wrapper():', '        return fn()', '    return wrapper', '@deco', 'def spell():', '    return 1', 'print(spell.__name__)'], ['wrapper', 'deco', 'None']),
    ])(),
    decofactory: () => { const k = rnd(2, 4); return makeQ(['def times(k):', '    def deco(fn):', '        def w(x):', '            return fn(x) * k', '        return w', '    return deco', `@times(${k})`, 'def f(x):', '    return x + 1', 'print(f(2))'], [k * 2 + 1, 3, 'TypeError']); },
    decouse: () => { const k = rnd(2, 4); return makeQ(['def counted(fn):', '    def w():', '        w.calls += 1', '        return fn()', '    w.calls = 0', '    return w', '@counted', 'def f():', '    return 0', ...Array.from({ length: k }, () => 'f()'), 'print(f.calls)'], [k + 1, 0, 'AttributeError']); },
  });
})();
