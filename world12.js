/* World 12: The Hall of Echoes. Scope and clean functions: local names, LEGB lookup,
   shadowing, UnboundLocalError, return vs print and None, side effects on lists passed in,
   pure functions, functions as values, docstrings. Source: MIT 6.100L lectures 5-6. */
Object.assign(EXTRA.npcs, {
  sable: { name: 'Echo-keeper Sable', colors: ['#34303f', '#a9a7b8', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  echowraith: { base: 'ghost', name: 'Echo wraith', pal: { F: '#7f9fd6', L: '#e0ecff' } },
  mirrorknight: { base: 'knight', name: 'Mirror knight', pal: { S: '#d9d4c6', K: '#7d4fc9' } },
  echolord: { base: 'shadowmage', name: 'The Echo Lord' },
});
const ECHO_WORDS = ['ember', 'frost', 'gale', 'stone', 'dusk', 'dawn'];

const WORLD12 = {
  id: 12, name: 'The Hall of Echoes', topic: 'scope, docstrings and clean functions',
  nodes: [[50, 92], [26, 82], [68, 72], [34, 62], [68, 52], [30, 42], [66, 31], [38, 20], [52, 8]],
  levels: [
    {
      id: '12-1', title: 'What happens inside', bg: 'greathall', npc: 'sable', mentor: 'sable', tags: ['localscope'],
      steps: [
        { type: 'talk', who: 'sable', text: "Listen, {NAME}... I'm Sable, keeper of these echoing halls. Every function is a room of its own. Names made inside the room are LOCAL: they exist only while the function runs, then vanish." },
        { type: 'demo', vars: R => ({ w: R.pick(ECHO_WORDS) }), text: 'Run it.', code: ['def brew():', '    potion = "$w"', '    print("inside:", potion)', 'brew()'] },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ w: R.pick(ECHO_WORDS) }),
          text: 'Use a local name outside its room. Which error?', code: ['def brew():', '    potion = "$w"', 'brew()', 'print(potion)'],
          explain: 'potion only lived inside brew(). Outside, Python has never heard of it: NameError.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9) }),
          text: 'Parameters are local too. What will it say?', code: ['def double(n):', '    n = n * 2', '    return n', 'n = $a', 'print(double(n), n)'],
          wrong: ['$(a * 2) $(a * 2)', '$a $a', '$a $(a * 2)'],
          explain: 'The n inside double is a separate local name. Changing it does not touch the n outside.',
        },
        {
          type: 'fill', vars: R => ({ g: R.pick(['ruby', 'opal', 'jade']) }),
          text: 'Get the gem out of the room so it can be printed.',
          lines: ['def make():', '    gem = "$g"', '    [] gem', 'print(make())'], chips: ['return', 'print', 'global'], answer: [['return']],
          hints: ['A function hands a value back with...', 'return gem'],
        },
        {
          type: 'fix', vars: R => ({ a: R.int(2, 6) }),
          text: 'This should print the dice roll. Run it, then tap the broken line.',
          code: ['def roll():', '    return $a', 'roll()', 'print(result)'], bad: 2,
          options: ['result = roll()', 'roll(result)', 'return roll()'], answer: 0,
          explain: 'Catch the returned value in a name outside the function.',
        },
        {
          type: 'write', vars: R => ({ a: R.int(2, 12), b: R.int(2, 12) }),
          text: 'Write area(w, h) that RETURNS w times h, then print area($a, $b).',
          starter: [], keys: ['def', 'area', '(', ')', 'w', 'h', ',', ':', 'return', '*', 'print', '$a', '$b'],
          require: l => (has(l, /return\s+/) ? null : 'Use return to hand back the answer.'),
          hints: ['def area(w, h):', '    return w * h  then  print(area($a, $b))'],
          solution: ['def area(w, h):', '    return w * h', 'print(area($a, $b))'],
        },
      ],
      learn: [{ title: 'Local names', code: 'def f():\n    x = 1   # local\nf()\nprint(x)    # NameError', text: 'Names made inside a function, including its parameters, vanish when it ends. Use return to get a value out.' }],
    },
    {
      id: '12-2', title: 'Shadows on the wall', bg: 'hollow', npc: 'sable', mentor: 'sable', tags: ['legb'],
      steps: [
        { type: 'talk', who: 'sable', text: 'When Python meets a name, it searches four rooms in order: Local, then Enclosing (an outer function), then Global (the main spell), then Built-in (print, len...). LEGB. The first match wins.' },
        { type: 'talk', who: 'sable', text: 'So a local name can SHADOW a global one with the same name. Inside, you see the local one. Outside, the global one is untouched.' },
        { type: 'demo', vars: R => { const [a, b] = R.sample(ECHO_WORDS, 2); return { a, b }; }, text: 'Run it.', code: ['x = "$a"', 'def f():', '    x = "$b"', '    print(x)', 'f()', 'print(x)'] },
        {
          type: 'predict', vars: R => { const [a, b] = R.sample(ECHO_WORDS, 2); return { a, b }; },
          text: 'What will it say?', code: ['color = "$a"', 'def paint():', '    color = "$b"', 'paint()', 'print(color)'],
          wrong: ['$b', 'Error', 'None'],
          explain: 'paint made its own local color. The global color is still "$a".',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(ECHO_WORDS) }),
          text: 'Enclosing. What will it say?', code: ['def outer():', '    msg = "$w"', '    def inner():', '        print(msg.upper())', '    inner()', 'outer()'],
          explain: 'inner has no msg of its own, so Python looks in the enclosing function and finds it.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 20) }),
          text: 'Reading a global is fine. What will it say?', code: ['level = $a', 'def show():', '    print(level + 1)', 'show()'],
          explain: 'show never assigns to level, so it simply reads the global one.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Built-ins can be shadowed too. Which error?', code: ['max = 5', 'print(max(3, 9))'],
          explain: 'max now names the number 5, hiding the built-in function. Calling a number raises TypeError. Never reuse built-in names.',
        },
        {
          type: 'fill', vars: R => ({ w: R.pick(ECHO_WORDS) }),
          text: 'Make inner print the secret from the enclosing function.',
          lines: ['def outer():', '    [] = "$w"', '    def inner():', '        print(secret)', '    inner()', 'outer()'], chips: ['secret', 'inner', 'print'], answer: [['secret']],
          hints: ['inner looks outward for a name called secret.', 'secret = "$w"'],
        },
        {
          type: 'write', vars: R => ({ w: R.pick(ECHO_WORDS) }),
          text: 'Write shout(): inside, make a LOCAL name loud holding word in capitals and print it. Call shout(), then print word to show it did not change.',
          starter: ['word = "$w"'], keys: ['def', 'shout', '(', ')', ':', 'loud', '=', 'word', '.upper()', 'print'],
          require: l => (has(l, /def\s+shout/) && has(l, /loud\s*=/) ? null : 'Define shout() with a local name loud.'),
          hints: ['def shout(): / loud = word.upper() / print(loud)', 'Then shout() and print(word)'],
          solution: ['def shout():', '    loud = word.upper()', '    print(loud)', 'shout()', 'print(word)'],
        },
      ],
      learn: [{ title: 'LEGB', code: 'Local → Enclosing → Global → Built-in', text: 'Python looks for a name in these rooms, in this order. A local name can shadow a global one.' }],
    },
    {
      id: '12-3', title: 'The vanishing value', bg: 'greathall', npc: 'sable', mentor: 'sable', tags: ['unboundlocal'],
      steps: [
        { type: 'talk', who: 'sable', text: 'Now the cruellest echo. If a function ASSIGNS to a name anywhere inside, that name is local for the WHOLE function. So reading it before the assignment crashes, even if a global with that name exists.' },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ a: R.int(3, 9) }),
          text: 'Which error?', code: ['coins = $a', 'def spend():', '    coins = coins - 1', 'spend()'],
          explain: 'coins is assigned inside spend, so it is local there, and it has no value yet when read: UnboundLocalError.',
        },
        { type: 'talk', who: 'sable', text: 'Two cures. You met global in the Mage Tower: it says "use the main spell\'s name". The cleaner cure: pass the value IN as a parameter and hand the new value back with return.' },
        {
          type: 'predict', vars: R => ({ a: R.int(5, 15) }),
          text: 'The clean way. What will it say?', code: ['def spend(coins):', '    return coins - 1', 'coins = $a', 'coins = spend(coins)', 'coins = spend(coins)', 'print(coins)'],
          explain: 'Each call hands back one less, and we store it each time.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(10, 40), b: R.int(2, 9) }),
          text: 'Heal the hero the clean way: pass hp in and store what comes back.',
          lines: ['hp = $a', 'def heal(hp):', '    return hp + $b', 'hp = [](hp)', 'print(hp)'], chips: ['heal', 'print', 'return'], answer: [['heal']],
          hints: ['Call the function and store its answer.', 'hp = heal(hp)'],
        },
        {
          type: 'fix', text: 'This should count one tick. Run it, then tap the broken line.',
          code: ['count = 0', 'def tick():', '    count += 1', 'tick()', 'print(count)'], bad: 2,
          options: ['    global count; count += 1', '    count = count + 1', '    count == count + 1'], answer: 0,
          explain: 'global count tells the function to use the main spell\'s count. (Two statements can share a line with a semicolon.)',
        },
        {
          type: 'write', vars: R => ({ g: R.int(10, 50), a: R.int(2, 20) }),
          text: 'Write add_gold(gold, amount) that RETURNS the new total. Then store add_gold(gold, $a) back in gold and print gold.',
          starter: ['gold = $g'], keys: ['def', 'add_gold', '(', ')', 'gold', 'amount', ',', ':', 'return', '+', '=', '$a', 'print'],
          require: l => (has(l, /return\s+/) && !has(l, /global/) ? null : 'Use return, not global.'),
          hints: ['def add_gold(gold, amount): / return gold + amount', 'gold = add_gold(gold, $a) then print(gold)'],
          solution: ['def add_gold(gold, amount):', '    return gold + amount', 'gold = add_gold(gold, $a)', 'print(gold)'],
        },
      ],
      learn: [{ title: 'UnboundLocalError', code: 'x = 5\ndef f():\n    x = x + 1   # crash\n\ndef f(x):\n    return x + 1  # cure', text: 'Assigning a name inside a function makes it local everywhere in that function. Pass values in and return them.' }],
    },
    {
      id: '12-4', title: 'Echo wraiths', bg: 'tunnel', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(5, 9), k = R.int(4, 7); return { kind: 'echowraith', hp: d + 3 * k, d, k }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Echo wraiths drift through the walls! $HP HP. They only fear powers that come back from a spell.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spell that casts for you.', code: ['def echo(p):', '    cast(spark, p)', 'echo($d)'] },
        {
          type: 'fill', vars: (R, c) => ({ k: c.foe.k }),
          text: 'It has $HP HP left. power() must hand back 3 times n, so fireball can use it.',
          lines: ['def power(n):', '    [] n * 3', 'cast(fireball, power($k))'], chips: ['return', 'print'], answer: [['return']],
          goal: { foeDown: true },
          hints: ['print shows it, but the spell would get None.', 'return n * 3'],
        },
        { type: 'talk', who: 'narrator', text: 'A wraith that only falls to doubled echoes!' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'echowraith', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Write echo(power) that casts icebolt TWICE with power, then call echo($p).',
          starter: [], keys: ['def', 'echo', '(', ')', 'power', ':', 'cast', 'icebolt', ',', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+echo\s*\(/) ? null : 'Define echo(power) first.'),
          hints: ['def echo(power): / cast(icebolt, power) / cast(icebolt, power)', 'Then echo($p)'],
          solution: ['def echo(power):', '    cast(icebolt, power)', '    cast(icebolt, power)', 'echo($p)'],
        },
      ],
      learn: [{ title: 'Returned power', code: 'def power(n):\n    return n * 3\ncast(fireball, power(4))', text: 'A returned value can go straight into another call.' }],
    },
    {
      id: '12-5', title: 'Return, not print', bg: 'greathall', npc: 'sable', mentor: 'sable', tags: ['returnnone'],
      steps: [
        { type: 'talk', who: 'sable', text: 'print SHOWS a value on the screen. return HANDS it back to whoever called. They are not the same! A function without return hands back None.' },
        { type: 'demo', text: 'Run it.', code: ['def a():', '    print(5)', 'def b():', '    return 5', 'x = a()', 'y = b()', 'print(x, y)'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(['hi', 'hello', 'ahoy']) }),
          text: 'What will it say?', code: ['def greet():', '    print("$w")', 'result = greet()', 'print(result)'],
          explain: 'greet prints "$w", but returns nothing, so result is None.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9) }),
          text: 'Forgot something? What will it say?', code: ['def double(n):', '    n * 2', 'print(double($a))'],
          wrong: ['$(a * 2)', 'Error', '$a'],
          explain: 'n * 2 is worked out and thrown away. Without return, the function gives None.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([-3, 0, 4, 7]) }),
          text: 'return ends the function at once. What will it say?', code: ['def sign(n):', '    if n > 0:', '        return "positive"', '        print("never")', '    return "not positive"', 'print(sign($n))'],
          explain: 'As soon as a return runs, the function stops. "never" can never print.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(2, 9), b: R.int(2, 9), c: R.int(2, 6) }),
          text: 'Add up the area of two rooms. The function must hand its answer back.',
          lines: ['def area(w, h):', '    [] w * h', 'total = area($a, $b) + area($c, $c)', 'print(total)'], chips: ['return', 'print'], answer: [['return']],
          hints: ['None + None crashes.', 'return w * h'],
        },
        {
          type: 'fix', vars: R => ({ a: R.int(2, 20) * 2, b: R.int(2, 20) * 2 }),
          text: 'This should print "Average:" followed by the number. Run it, then tap the broken line.',
          code: ['def avg(a, b):', '    print((a + b) / 2)', 'result = avg($a, $b)', 'print("Average:", result)'], bad: 1,
          options: ['    return (a + b) / 2', '    (a + b) / 2', '    print(return (a + b) / 2)'], answer: 0,
          explain: 'The function must return the value so result can hold it.',
        },
        {
          type: 'write', vars: R => ({ a: R.int(2, 99) }),
          text: 'Write is_even(n) that RETURNS True or False, then print is_even($a).',
          starter: [], keys: ['def', 'is_even', '(', ')', 'n', ':', 'return', '%', '2', '==', '0', 'print', '$a'],
          require: l => (has(l, /return\s+/) ? null : 'Return the answer instead of printing it.'),
          hints: ['n % 2 == 0 is already True or False.', 'def is_even(n): / return n % 2 == 0'],
          solution: ['def is_even(n):', '    return n % 2 == 0', 'print(is_even($a))'],
        },
      ],
      learn: [{ title: 'return vs print', code: 'def f():\n    print(1)    # shows\ndef g():\n    return 1    # hands back\nf() → None', text: 'Only return gives a value back. No return means None.' }],
    },
    {
      id: '12-6', title: 'Borrowed lists', bg: 'keep', npc: 'sable', mentor: 'sable', tags: ['sideeffect'],
      steps: [
        { type: 'talk', who: 'sable', text: 'Pass a list into a function and the function gets the SAME list, not a copy. If it changes the list, with append or sort, the change echoes back outside. That is called a side effect.' },
        { type: 'demo', text: 'Run it.', code: ['def add_gem(bag):', '    bag.append("ruby")', 'gems = ["opal"]', 'add_gem(gems)', 'print(gems)'] },
        {
          type: 'predict', vars: R => ({ g: R.pick(['opal', 'jade', 'onyx']) }),
          text: 'This time the function gives the name a NEW list. What will it say?', code: ['def reset(bag):', '    bag = []', 'gems = ["$g"]', 'reset(gems)', 'print(gems)'],
          wrong: ['[]', 'None', 'Error'],
          explain: 'bag = [] only points the local name somewhere new. The caller\'s list is untouched.',
        },
        {
          type: 'predict', vars: R => ({ g: R.pick(['opal', 'jade', 'onyx']) }),
          text: 'And this one? What will it say?', code: ['def empty(bag):', '    bag.clear()', 'gems = ["$g", "ruby"]', 'empty(gems)', 'print(gems)'],
          explain: 'clear() changes the shared list itself, so the caller sees it emptied.',
        },
        { type: 'talk', who: 'sable', text: 'A PURE function never changes its inputs and only hands back a new value. Pure functions are easy to test and never surprise you.' },
        {
          type: 'predict', vars: R => ({ g: R.pick(['opal', 'jade', 'onyx']) }),
          text: 'A pure version. What will it say?', code: ['def with_gem(bag):', '    return bag + ["ruby"]', 'gems = ["$g"]', 'more = with_gem(gems)', 'print(len(gems), len(more))'],
          explain: 'bag + [...] builds a new list. gems still has one item.',
        },
        {
          type: 'fill', text: 'Finish the pure function: it must build its new list from its own parameter.',
          lines: ['def doubled(nums):', '    return [n * 2 for n in []]', 'a = [1, 2, 3]', 'b = doubled(a)', 'print(a, b)'], chips: ['nums', 'b', 'doubled'], answer: [['nums']],
          hints: ['Use the parameter.', 'for n in nums'],
        },
        {
          type: 'fix', vars: R => { const [a, b, c] = R.sample([3, 8, 5, 9, 1, 7], 3).sort((x, y) => x - y); return { a, b, c }; },
          text: 'top_two should not reorder the caller\'s list. Run it, then tap the broken line.',
          code: ['def top_two(scores):', '    scores.sort(reverse=True)', '    return scores[:2]', 'nums = [$a, $b, $c]', 'print(top_two(nums), nums)'], bad: 1,
          options: ['    scores = sorted(scores, reverse=True)', '    scores.sort()', '    sorted(scores, reverse=True)'], answer: 0,
          explain: 'sorted() makes a new list, so the caller\'s list keeps its order.',
        },
        {
          type: 'write', text: 'Write a PURE add_item(bag, item) that returns a new list with item on the end. Then print inv and add_item(inv, "lamp").',
          starter: ['inv = ["rope"]'], keys: ['def', 'add_item', '(', ')', 'bag', 'item', ',', ':', 'return', '+', '[', ']', 'print', 'inv', '"lamp"'],
          require: l => (has(l, /return\s+bag\s*\+/) && !has(l, /append/) ? null : 'Return bag + [item] instead of using append.'),
          hints: ['def add_item(bag, item): / return bag + [item]', 'print(inv, add_item(inv, "lamp"))'],
          solution: ['def add_item(bag, item):', '    return bag + [item]', 'print(inv, add_item(inv, "lamp"))'],
        },
      ],
      learn: [{ title: 'Side effects', code: 'def f(lst):\n    lst.append(1)   # caller sees it\ndef g(lst):\n    return lst + [1]  # pure', text: 'Functions share the caller\'s list. Prefer pure functions that return new values.' }],
    },
    {
      id: '12-7', title: 'Spells as values', bg: 'hollow', npc: 'sable', mentor: 'sable', tags: ['funcvalue'],
      steps: [
        { type: 'talk', who: 'sable', text: 'Functions are values too. Write the name WITHOUT brackets and you talk about the function itself: store it, put it in a list, or pass it to another function.' },
        { type: 'demo', text: 'Run it.', code: ['def shout(w):', '    return w.upper() + "!"', 'say = shout', 'print(say("hello"))'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9) }),
          text: 'A function that takes a function. What will it say?', code: ['def twice(f, x):', '    return f(f(x))', 'def inc(n):', '    return n + 1', 'print(twice(inc, $a))'],
          explain: 'inc runs twice: $a → $(a + 1) → $(a + 2).',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 9) }),
          text: 'A list of spells. What will it say?', code: ['def add1(x):', '    return x + 1', 'def times2(x):', '    return x * 2', 'for f in [add1, times2]:', '    print(f($n))'],
          explain: 'Each function in the list is called with $n.',
        },
        { type: 'talk', who: 'sable', text: 'A string right under the def line is a DOCSTRING. It explains what the function does, and Python keeps it in f.__doc__. Good names plus a docstring make code read like a book.' },
        {
          type: 'predict', text: 'What will it say?', code: ['def heal(hp):', '    """Restore 10 HP."""', '    return hp + 10', 'print(heal.__doc__)', 'print(heal.__name__)'],
          explain: '__doc__ holds the docstring, __name__ the function\'s name.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(2, 9) }),
          text: 'apply should call whatever function it is given.',
          lines: ['def apply(f, value):', '    return [](value)', 'def triple(n):', '    return n * 3', 'print(apply(triple, $a))'], chips: ['f', 'value', 'print'], answer: [['f']],
          hints: ['The function arrives in the parameter f.', 'return f(value)'],
        },
        {
          type: 'fix', text: 'action should hold the greet function itself, to be called later. Run it, then tap the broken line.',
          code: ['def greet():', '    return "hello"', 'action = greet()', 'print(action())'], bad: 2,
          options: ['action = greet', 'action = "greet"', 'action = greet()()'], answer: 0,
          explain: 'With brackets you store the RESULT ("hello"). Without them you store the function.',
        },
        {
          type: 'write', vars: R => ({ n: R.pick(['Ada', 'Wren', 'Tam']) }),
          text: 'Write wave(name) with the docstring "Say hello." that returns "Hello, " + name. Then print wave.__doc__ and wave("$n").',
          starter: [], keys: ['def', 'wave', '(', ')', 'name', ':', '"""Say hello."""', 'return', '"Hello, "', '+', 'print', '.__doc__', '"$n"'],
          require: l => (has(l, /"""Say hello\."""/) ? null : 'Add the docstring """Say hello.""" under the def line.'),
          hints: ['def wave(name): / """Say hello.""" / return "Hello, " + name', 'print(wave.__doc__) then print(wave("$n"))'],
          solution: ['def wave(name):', '    """Say hello."""', '    return "Hello, " + name', 'print(wave.__doc__)', 'print(wave("$n"))'],
        },
      ],
      learn: [
        { title: 'Functions are values', code: 'say = shout       # no brackets\nfor f in [a, b]:\n    f(5)', text: 'Store, list and pass functions like any other value.' },
        { title: 'Docstrings', code: 'def f():\n    """What f does."""\nf.__doc__', text: 'Explain each function right under its def line.' },
      ],
    },
    {
      id: '12-8', title: 'Mirror knights', bg: 'keep', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(5, 9), p = R.int(4, 8); return { kind: 'mirrorknight', hp: d + 3 * p, d, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Mirror knights march out of the glass! $HP HP. Store your moves in a list and fight with a combo.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'One jab.', code: ['def jab():', '    cast(spark, $d)', 'jab()'] },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p }),
          text: 'It has $HP HP left. Run every move in the combo.',
          lines: ['def slash():', '    cast(fireball, $p)', 'combo = [slash, slash, slash]', 'for move in combo:', '    []'], chips: ['move()', 'move', 'slash'], answer: [['move()']],
          goal: { foeDown: true },
          hints: ['A stored function runs only when you add brackets.', 'move()'],
        },
        { type: 'talk', who: 'narrator', text: 'The mirror captain reflects every spell back... unless you count your strikes.' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'mirrorknight', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Write strike(power) that casts icebolt with power and RETURNS power. Print strike($p) + strike($p).',
          starter: [], keys: ['def', 'strike', '(', ')', 'power', ':', 'cast', 'icebolt', ',', 'return', 'print', '+', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /return\s+power/) ? null : 'strike must return power.'),
          hints: ['def strike(power): / cast(icebolt, power) / return power', 'print(strike($p) + strike($p))'],
          solution: ['def strike(power):', '    cast(icebolt, power)', '    return power', 'print(strike($p) + strike($p))'],
        },
      ],
      learn: [{ title: 'Combos', code: 'combo = [slash, jab]\nfor move in combo:\n    move()', text: 'A list of functions, called one by one.' }],
    },
    {
      id: '12-9', title: 'The Echo Lord', bg: 'throne', foe: { kind: 'echolord', hp: 170, weak: 'fireball', resist: 'spark' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'echolord', text: 'YOUR... WORDS... ARE... MINE... MINE... MINE...' },
        { type: 'talk', who: 'narrator', text: 'The Echo Lord has 170 HP. Fireball burns away echoes: double damage. Spark is swallowed: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ a: R.int(3, 6) }),
          text: 'How much damage? Fireball is doubled.', code: ['def boom(n):', '    return n * 3', 'cast(fireball, boom($a))'],
          explain: 'boom($a) returns $(a * 3), doubled.',
        },
        {
          type: 'fix', vars: R => ({ r: R.int(20, 30) }),
          text: 'calm() should lower the Lord\'s rage by 5 and strike with what is left. Run it, then tap the broken line.',
          code: ['rage = $r', 'def calm():', '    rage = rage - 5', '    return rage', 'cast(fireball, calm())', 'print(rage)'], bad: 2,
          options: ['    global rage; rage = rage - 5', '    rage == rage - 5', '    local rage = rage - 5'], answer: 0,
          explain: 'Assigning rage made it local. global rage uses the main spell\'s rage.',
        },
        { type: 'talk', who: 'echolord', text: 'GIVE... ME... YOUR... SPELL...' },
        {
          type: 'fill', vars: R => ({ p: R.int(5, 9) }),
          text: 'Hand boost the blaze function itself, not its result.',
          lines: ['def blaze(p):', '    cast(fireball, p * 2)', 'def boost(spell, p):', '    spell(p)', 'boost([], $p)'], chips: ['blaze', 'blaze()', 'boost'], answer: [['blaze']],
          hints: ['No brackets: pass the function.', 'boost(blaze, $p)'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and fireball is doubled. Write finish(hp) that returns hp // 2 + 1, then cast fireball with finish($HP).',
          starter: [], keys: ['def', 'finish', '(', ')', 'hp', ':', 'return', '//', '2', '+', '1', 'cast', 'fireball', ',', '$HP'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+finish/) && has(l, /return\s+/) ? null : 'Define finish(hp) and return the power.'),
          hints: ['def finish(hp): / return hp // 2 + 1', 'cast(fireball, finish($HP))'],
          solution: ['def finish(hp):', '    return hp // 2 + 1', 'cast(fireball, finish($HP))'],
        },
        { type: 'talk', who: 'echolord', text: '...my... echoes... fade...' },
      ],
      learn: [{ title: 'Clean functions', code: 'local names  LEGB  return  pure  f without ()', text: 'Everything from the Hall of Echoes.' }],
    },
  ],
};
WORLDS.push(WORLD12);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    localscope: () => {
      const a = rnd(2, 9);
      return rnd(0, 1) === 0
        ? makeQ(['def f():', `    x = ${a}`, 'f()', 'print(x)'], [a, 'None'])
        : makeQ(['def f(n):', '    n = n + 1', '    return n', `n = ${a}`, 'f(n)', 'print(n)'], [a + 1, 'None']);
    },
    legb: () => {
      const [a, b] = ['ember', 'frost'];
      return rnd(0, 1) === 0
        ? makeQ([`x = "${a}"`, 'def f():', `    x = "${b}"`, 'f()', 'print(x)'], [b, 'Error'])
        : makeQ(['def outer():', `    m = "${a}"`, '    def inner():', '        return m', '    return inner()', 'print(outer())'], ['Error', 'None']);
    },
    unboundlocal: () => {
      const a = rnd(3, 9);
      return rnd(0, 1) === 0
        ? makeQ([`hp = ${a}`, 'def hit():', '    hp = hp - 1', 'hit()', 'print(hp)'], [a - 1, a])
        : makeQ([`hp = ${a}`, 'def hit(hp):', '    return hp - 1', 'hp = hit(hp)', 'print(hp)'], [a, 'Error']);
    },
    returnnone: () => {
      const a = rnd(2, 9);
      return rnd(0, 1) === 0
        ? makeQ(['def f(n):', '    n * 2', `print(f(${a}))`], [a * 2, 'Error'])
        : makeQ(['def f():', '    print("hi")', 'x = f()', 'print(x)'], ['hi\nhi', 'hi']);
    },
    sideeffect: () => {
      return rnd(0, 1) === 0
        ? makeQ(['def f(b):', '    b.append(1)', 'x = []', 'f(x)', 'print(x)'], ['[]', 'None'])
        : makeQ(['def f(b):', '    b = [1]', 'x = []', 'f(x)', 'print(x)'], ['[1]', 'None']);
    },
    funcvalue: () => {
      const a = rnd(1, 9);
      return makeQ(['def inc(n):', '    return n + 1', 'g = inc', `print(g(g(${a})))`], [a + 1, 'Error']);
    },
  });
})();
