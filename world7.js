/* World 7: Mage Tower. Functions: def, calling, parameters, return, defaults, keyword
   arguments, scope, composition, recursion. */
const FN_NAMES = ['sparkle', 'glimmer', 'chant', 'hum', 'flicker'];

const WORLD7 = {
  id: 7, name: 'Mage Tower', topic: 'functions', map: 'bg-map7.jpg',
  nodes: [[50, 93], [30, 84], [70, 75], [30, 65], [70, 55], [30, 45], [70, 35], [34, 24], [50, 9]],
  levels: [
    {
      id: '7-1', title: 'Your first spell', bg: 'study', npc: 'archmage', mentor: 'archmage', tags: ['func'],
      steps: [
        { type: 'talk', who: 'archmage', text: 'So, {NAME}, you reached my tower. I am Archmage Solen. Here you learn to make your OWN spells. In Python they are called functions.' },
        { type: 'talk', who: 'archmage', text: 'def gives a name to a block of code. The block does nothing until you call the name with brackets. Watch the spellbook jump into the function when it is called.' },
        { type: 'demo', vars: R => ({ a: R.pick(['Abra', 'Hocus', 'Ala']), b: R.pick(['kadabra!', 'pocus!', 'kazam!']) }), text: 'Run it.', code: ['def chant():', '    print("$a")', '    print("$b")', 'chant()', 'chant()'] },
        {
          type: 'predict', vars: R => ({ f: R.pick(FN_NAMES), w: R.word() }), text: 'Order matters. What will it say?', code: ['def $f():', '    print("$w")', 'print("start")', '$f()'],
          explain: 'def only defines. The body runs when $f() is called, after "start".',
        },
        {
          type: 'predict', vars: R => ({ f: R.pick(FN_NAMES), w: R.word() }), text: 'Never called. What will it say?', code: ['def $f():', '    print("$w")', 'print("start")'],
          wrong: ['start / $w', '$w / start'],
          explain: 'The function is defined but never called, so its body never runs.',
        },
        {
          type: 'fix', vars: R => ({ f: R.pick(FN_NAMES) }),
          text: 'This should print Glowing, but prints nothing. Run it, then tap the broken line.',
          code: ['def $f():', '    print("Glowing")', '$f'], bad: 2,
          options: ['$f()', '$f[]', 'def $f()'], answer: 0,
          explain: 'Writing just the name does not call it. You need the brackets: $f()',
        },
        {
          type: 'fill', vars: R => ({ w: R.word() }),
          text: 'Define sparkle so the last line can call it.',
          lines: ['[] sparkle[]', '    print("$w")', 'sparkle()'], chips: ['def', '():', ':', 'for'], answer: [['def', '():']],
          hints: ['Functions start with def.', 'def sparkle():'],
        },
        {
          type: 'write', vars: R => ({ f: R.pick(FN_NAMES), w: R.word() }),
          text: 'Define a function called $f that prints "$w", then call it twice.',
          starter: [], keys: ['def', '$f', '():', 'print', '(', ')', '"$w"', '$f()'],
          require: (l, v) => (new RegExp(`def\\s+${v.f}\\s*\\(\\s*\\)\\s*:`).test(typed(l)) ? null : `Start with def ${v.f}():`),
          hints: ['def $f(): then an indented print.', 'Then $f() twice at the left edge.'],
          solution: ['def $f():', '    print("$w")', '$f()', '$f()'],
        },
      ],
      learn: [{ title: 'Functions', code: 'def chant():\n    print("hi")\nchant()', text: 'def names a block. Calling the name with () runs it.' }],
    },
    {
      id: '7-2', title: 'Ingredients', bg: 'study', npc: 'archmage', mentor: 'archmage', tags: ['params'],
      steps: [
        { type: 'talk', who: 'archmage', text: 'Functions can take ingredients called parameters. They are jars that get filled with the values you pass in when you call.' },
        { type: 'demo', vars: R => { const [a, b] = R.sample(Engine.NAMES, 2); return { a, b }; }, text: 'Run it.', code: ['def greet(name):', '    print("Welcome,", name)', 'greet("$a")', 'greet("$b")'] },
        {
          type: 'predict', vars: R => ({ x: R.int(2, 20) }), text: 'What will it say?', code: ['def double(n):', '    print(n * 2)', 'double($x)'],
          explain: 'n gets the value $x, so it prints $(x * 2).',
        },
        {
          type: 'predict', vars: R => ({ x: R.int(2, 9), y: R.int(10, 20) }), text: 'Order of ingredients. What will it say?', code: ['def brew(a, b):', '    print(a - b)', 'brew($y, $x)'],
          wrong: ['$(x - y)'],
          explain: 'Values fill the parameters in order: a is $y and b is $x.',
        },
        {
          type: 'fix', vars: R => ({ x: R.int(5, 20) }),
          text: 'This call crashes. Run it, then tap the broken line.',
          code: ['def heal(amount):', '    print("Healed", amount)', 'heal()'], bad: 2,
          options: ['heal($x)', 'heal(amount)', 'def heal():'], answer: 0,
          explain: 'heal needs one value for amount. Pass it inside the brackets.',
        },
        {
          type: 'fill', vars: R => ({ x: R.int(2, 9), y: R.int(2, 9) }),
          text: 'Make power_up add its two ingredients, then call it with $x and $y.',
          lines: ['def power_up(base, bonus):', '    print(base [] bonus)', 'power_up([], $y)'], chips: ['+', '*', '$x', '"$x"'], answer: [['+', '$x']],
          hints: ['Add means +.', 'power_up($x, $y)'],
        },
        {
          type: 'write', vars: R => ({ w: R.int(2, 9), h: R.int(2, 9) }),
          text: 'Write a function area(w, h) that prints w * h. Then call area($w, $h).',
          starter: [], keys: ['def', 'area', '(', ')', 'w', 'h', ',', ':', 'print', '*', 'area($w, $h)'],
          require: l => (has(l, /def\s+area\s*\(\s*w\s*,\s*h\s*\)\s*:/) ? null : 'Start with def area(w, h):'),
          hints: ['def area(w, h): / print(w * h)', 'area($w, $h) at the left edge.'],
          solution: ['def area(w, h):', '    print(w * h)', 'area($w, $h)'],
        },
      ],
      learn: [{ title: 'Parameters', code: 'def brew(a, b):\nbrew(5, 3)', text: 'Values passed in a call fill the parameters in order.' }],
    },
    {
      id: '7-3', title: 'Return to sender', bg: 'study', npc: 'apprentice', mentor: 'apprentice', tags: ['return'],
      steps: [
        { type: 'talk', who: 'apprentice', text: "I'm Kip, the apprentice! I mixed up print and return for weeks. print SHOWS a value. return HANDS the value back to whoever called the function." },
        { type: 'demo', vars: R => ({ a: R.int(2, 9) }), text: 'Run it.', code: ['def double(n):', '    return n * 2', 'x = double($a)', 'print(x + 1)'] },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9), b: R.int(1, 9) }), text: 'What will it say?', code: ['def triple(n):', '    return n * 3', 'print(triple($a) + $b)'],
          explain: 'triple($a) hands back $(a * 3), then $b is added.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9) }), text: 'The famous trap. What will it say?', code: ['def triple(n):', '    print(n * 3)', 'result = triple($a)', 'print(result)'],
          wrong: ['$(a * 3) / $(a * 3)'],
          explain: 'triple prints $(a * 3) but returns nothing. A function with no return gives back None.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 20), lim: R.int(5, 15) }), text: 'return ends the function right away. What will it say?', code: ['def check(n):', '    if n > $lim:', '        return "big"', '    return "small"', 'print(check($a))'],
          explain: 'The first return that runs ends the function.',
        },
        {
          type: 'fix', vars: R => ({ a: R.int(2, 9), b: R.int(2, 9) }),
          text: 'This crashes when it adds 1. Run it, then tap the broken line.',
          code: ['def add(a, b):', '    print(a + b)', 'total = add($a, $b) + 1', 'print(total)'], bad: 1,
          options: ['    return a + b', '    print(a + b + 1)', '    a + b'], answer: 0,
          explain: 'add printed its answer but returned None. None + 1 is a TypeError. return hands the value back.',
        },
        {
          type: 'write', vars: R => ({ a: R.int(2, 9), b: R.int(2, 9) }),
          text: 'Write square(n) that returns n * n. Then print square($a) + square($b).',
          starter: [], keys: ['def', 'square', '(', ')', 'n', ':', 'return', '*', 'print', '+', 'square($a)', 'square($b)'],
          require: l => (has(l, /def\s+square\s*\(\s*n\s*\)/) && has(l, /return/) ? null : 'Define square(n) with a return line.'),
          hints: ['def square(n): / return n * n', 'print(square($a) + square($b))'],
          solution: ['def square(n):', '    return n * n', 'print(square($a) + square($b))'],
        },
      ],
      learn: [{ title: 'return', code: 'def double(n):\n    return n * 2', text: 'Hands a value back to the caller. Without return, a function gives back None.' }],
    },
    {
      id: '7-4', title: 'Clockwork golems', bg: 'stairs', mentor: 'narrator', tags: [],
      foe: R => { const m = R.int(3, 5), k = R.int(3, 5); return { kind: 'golem', hp: 20 + 2 * m * k, weak: 'spark', resist: 'fireball', m, k }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Clockwork golems clank down the stairs! They are weak to spark, and only break under spells made by your own functions.' },
        { type: 'demo', text: 'Run it.', code: ['def power(level):', '    return level * 5', 'cast(spark, power(2))'] },
        {
          type: 'fill', vars: (R, c) => ({ m: c.foe.m, k: c.foe.k }),
          text: 'The golem has $HP HP. power must hand back level * $m. Spark is doubled.',
          lines: ['def power(level):', '    [] level * $m', 'cast(spark, power([]))'], chips: ['return', 'print', '$k', '"$k"'], answer: [['return', '$k']],
          goal: { foeDown: true },
          hints: ['Use return to hand back the value.', '$k * $m, doubled, is $(2 * k * m).'],
        },
        { type: 'talk', who: 'narrator', text: 'A heavy golem stomps in!' },
        {
          type: 'write', vars: R => { const a = R.int(5, 10), b = R.int(5, 10); return { a, b }; },
          spawn: v => ({ kind: 'golem', hp: 2 * (v.a + v.b), weak: 'spark', tint: 'big' }),
          text: 'Write combo(a, b) that returns a + b. Then cast spark with combo($a, $b).',
          starter: [], keys: ['def', 'combo', '(', ')', 'a', 'b', ',', ':', 'return', '+', 'cast', 'spark', 'combo($a, $b)'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+combo/) && has(l, /return/) ? null : 'Define combo(a, b) with a return line.'),
          hints: ['def combo(a, b): / return a + b', 'cast(spark, combo($a, $b))'],
          solution: ['def combo(a, b):', '    return a + b', 'cast(spark, combo($a, $b))'],
        },
      ],
      learn: [{ title: 'Functions in battle', code: 'cast(spark, power(3))', text: 'A returned value can go straight into another call.' }],
    },
    {
      id: '7-5', title: 'Default enchantments', bg: 'study', npc: 'archmage', mentor: 'archmage', tags: ['defaults'],
      steps: [
        { type: 'talk', who: 'archmage', text: 'A parameter can have a default. If you leave it out, the default is used. You can also name arguments when you call, in any order.' },
        { type: 'demo', vars: R => { const [a, b] = R.items(2); return { a, b }; }, text: 'Run it.', code: ['def enchant(item, level=1):', '    print(item, "+" + str(level))', 'enchant("$a")', 'enchant("$b", 3)'] },
        {
          type: 'predict', vars: R => ({ d: R.int(2, 4), a: R.int(2, 9) }), text: 'What will it say?', code: ['def stack(x, times=$d):', '    return x * times', 'print(stack($a), stack($a, 1))'],
          explain: 'The first call uses the default $d. The second passes 1.',
        },
        {
          type: 'predict', vars: R => { const [a, b] = R.sample(['tower', 'gate', 'bridge', 'well'], 2); return { a, b }; }, text: 'Named arguments. What will it say?', code: ['def trip(start, end):', '    print(start, "to", end)', 'trip(end="$a", start="$b")'],
          wrong: ['$a to $b'],
          explain: 'Named arguments go to the parameter with that name, whatever order you write them in.',
        },
        {
          type: 'fix', vars: R => ({ n: R.name() }),
          text: 'This will not even start. Run it, then tap the broken line.',
          code: ['def greet(greeting="Hi", name):', '    print(greeting, name)', 'greet(name="$n")'], bad: 0,
          options: ['def greet(name, greeting="Hi"):', 'def greet(greeting="Hi", name=):', 'def greet(greeting, name="Hi"):'], answer: 0,
          explain: 'Parameters with defaults must come after the ones without.',
        },
        {
          type: 'write', vars: R => ({ w: R.pick(['hey', 'boo', 'go']) }),
          text: 'Write shout(word, times=2) that returns word.upper() * times. Print shout("$w").',
          starter: [], keys: ['def', 'shout', '(', ')', 'word', ',', 'times=2', ':', 'return', '.upper()', '*', 'times', 'print', 'shout("$w")'],
          require: l => (has(l, /times\s*=\s*2/) ? null : 'Give times a default of 2 in the def line.'),
          hints: ['def shout(word, times=2):', 'return word.upper() * times, then print(shout("$w"))'],
          solution: ['def shout(word, times=2):', '    return word.upper() * times', 'print(shout("$w"))'],
        },
      ],
      learn: [{ title: 'Defaults and names', code: 'def f(x, times=2):\nf(times=3, x=1)', text: 'Defaults fill in missing values. Named arguments can go in any order.' }],
    },
    {
      id: '7-6', title: 'Inside the circle', bg: 'study', npc: 'apprentice', mentor: 'apprentice', tags: ['scope'],
      steps: [
        { type: 'talk', who: 'apprentice', text: 'Jars made inside a function stay inside it. They are local. The world outside the function cannot see them.' },
        { type: 'demo', vars: R => ({ x: R.int(1, 99) }), text: 'Run it.', code: ['def mix():', '    secret = $x', '    print("Inside:", secret)', 'mix()', 'print("Outside: done")'] },
        {
          type: 'predict', vars: R => ({ x: R.int(1, 99) }), text: 'Peeking from outside. What will it say?', code: ['def mix():', '    secret = $x', 'mix()', 'print(secret)'],
          wrong: ['$x'],
          explain: 'secret only exists inside mix, so outside it is a NameError.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 99) }), text: 'Looking out is fine. What will it say?', code: ['level = $a', 'def show():', '    print(level)', 'show()'],
          explain: 'A function can read jars from outside.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9), b: R.int(10, 20) }), text: 'Same name, different jars. What will it say?', code: ['x = $a', 'def change():', '    x = $b', 'change()', 'print(x)'],
          wrong: ['$b'],
          explain: 'x = $b inside the function makes a new local x. The outside x is untouched.',
        },
        {
          type: 'fix', vars: R => ({ a: R.int(1, 20) }),
          text: 'The score never goes up. Run it, then tap the broken line.',
          code: ['score = $a', 'def add_point(score):', '    score += 1', '    return score', 'add_point(score)', 'print(score)'], bad: 4,
          options: ['score = add_point(score)', 'add_point(score + 1)', 'score == add_point(score)'], answer: 0,
          explain: 'The function returns the new score, but it is thrown away. Store it: score = add_point(score).',
        },
        {
          type: 'write', vars: R => ({ a: R.int(1, 20), k: R.int(2, 9) }),
          text: 'Write bonus(points) that returns points + $k. Store bonus(score) back in score, then print score.',
          starter: ['score = $a'], keys: ['def', 'bonus', '(', ')', 'points', ':', 'return', '+', '$k', 'score', '=', 'print'],
          require: l => (has(l, /return/) && has(l, /score\s*=\s*bonus\(/) ? null : 'Return from the function, and store the result with score = bonus(score).'),
          hints: ['def bonus(points): / return points + $k', 'score = bonus(score) / print(score)'],
          solution: ['def bonus(points):', '    return points + $k', 'score = bonus(score)', 'print(score)'],
        },
      ],
      learn: [{ title: 'Scope', code: 'local inside, global outside', text: 'Jars created in a function are local to it. Pass values in and return them out.' }],
    },
    {
      id: '7-7', title: 'Spells that call spells', bg: 'study', npc: 'archmage', mentor: 'archmage', tags: ['compose', 'recursion'],
      steps: [
        { type: 'talk', who: 'archmage', text: 'Functions can call other functions. A function can even call itself. That is recursion, and it always needs a stopping point.' },
        { type: 'demo', vars: R => ({ a: R.int(2, 9) }), text: 'Run it and follow the calls.', code: ['def double(n):', '    return n * 2', 'def quad(n):', '    return double(double(n))', 'print(quad($a))'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 20) }), text: 'What will it say?', code: ['def add_one(n):', '    return n + 1', 'def twice(n):', '    return add_one(add_one(n))', 'print(twice($a))'],
          explain: 'add_one runs twice: $a + 2.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 4) }), text: 'A function calling itself. What will it say?', code: ['def countdown(n):', '    if n == 0:', '        print("Go!")', '        return', '    print(n)', '    countdown(n - 1)', 'countdown($n)'],
          explain: 'Each call prints n, then calls itself with n - 1, until n is 0.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 5) }), text: 'The famous factorial. What will it say?', code: ['def fact(n):', '    if n <= 1:', '        return 1', '    return n * fact(n - 1)', 'print(fact($n))'],
          explain: '$n × $(n - 1) × ... × 1.',
        },
        {
          type: 'fix', vars: R => ({ n: R.int(3, 6) }),
          text: 'This recursion never reaches its stopping point. Run it, then tap the broken line.',
          code: ['def total(n):', '    if n == 0:', '        return 0', '    return n + total(n + 1)', 'print(total($n))'], bad: 3,
          options: ['    return n + total(n - 1)', '    return n + total(n)', '    return total(n - 1)'], answer: 0,
          explain: 'n + 1 moves away from 0 forever. n - 1 moves toward the stopping point.',
        },
        {
          type: 'write', vars: R => ({ a: R.int(1, 20) }),
          text: 'Write add3(n) that returns n + 3, and add6(n) that returns add3(add3(n)). Print add6($a).',
          starter: [], keys: ['def', 'add3', 'add6', '(', ')', 'n', ':', 'return', '+', '3', 'print', 'add6($a)'],
          require: l => (has(l, /add3\(\s*add3\(/) ? null : 'add6 should call add3 twice: add3(add3(n)).'),
          hints: ['def add3(n): / return n + 3', 'def add6(n): / return add3(add3(n)) / print(add6($a))'],
          solution: ['def add3(n):', '    return n + 3', 'def add6(n):', '    return add3(add3(n))', 'print(add6($a))'],
        },
      ],
      learn: [
        { title: 'Composition', code: 'double(double(n))', text: 'Build big spells from small ones.' },
        { title: 'Recursion', code: 'def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)', text: 'A function calling itself. It must move toward a case that does not call itself.' },
      ],
    },
    {
      id: '7-8', title: 'Elemental golems', bg: 'stairs', mentor: 'narrator', tags: [],
      foe: { kind: 'golem', hp: 30, weak: 'fireball', resist: 'icebolt', tint: 'ice' },
      steps: [
        { type: 'talk', who: 'narrator', text: 'A squad of elemental golems! Write one function that picks the right spell for any element.' },
        {
          type: 'fill', text: 'An ice golem with $HP HP. Finish pick so ice returns the right spell.',
          lines: ['def pick(element):', '    if element == "fire":', '        return icebolt', '    elif element == "ice":', '        return []', '    return spark', 'cast(pick("ice"), 15)'], chips: ['fireball', 'icebolt', 'spark'], answer: [['fireball']],
          goal: { foeDown: true },
          hints: ['Ice is weak to fire.', 'return fireball'],
        },
        { type: 'talk', who: 'narrator', text: 'Another golem steps forward. Its element changes every time!' },
        {
          type: 'write', vars: R => { const e = R.pick(['fire', 'ice']); return { e }; },
          spawn: v => ({ kind: 'golem', hp: 30, weak: v.e === 'ice' ? 'fireball' : 'icebolt', resist: v.e === 'ice' ? 'icebolt' : 'fireball' }),
          text: 'Write weak_to(e) that returns fireball if e is "ice", otherwise icebolt. Then cast weak_to("$e") with 15.',
          starter: [], keys: ['def', 'weak_to', '(', ')', 'e', ':', 'if', '==', '"ice"', 'return', 'fireball', 'icebolt', 'cast', 'weak_to("$e")', ',', '15'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+weak_to\s*\(\s*e\s*\)/) && has(l, /return/) ? null : 'Define weak_to(e) with return lines.'),
          hints: ['def weak_to(e): / if e == "ice": / return fireball', 'return icebolt (outside the if), then cast(weak_to("$e"), 15)'],
          solution: ['def weak_to(e):', '    if e == "ice":', '        return fireball', '    return icebolt', 'cast(weak_to("$e"), 15)'],
        },
      ],
      learn: [{ title: 'Functions that decide', code: 'def pick(e):\n    if e == "ice":\n        return fireball', text: 'Wrap decisions in a function so you can reuse them everywhere.' }],
    },
    {
      id: '7-9', title: 'The Shadow Mage', bg: 'observatory', foe: { kind: 'shadowmage', hp: 160 }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'shadowmage', text: '{NAME}... I am the mage you could have been. Every spell you know, I know backwards.' },
        { type: 'talk', who: 'narrator', text: 'Your own shadow, with 160 HP. Only well-built functions can reach it.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ a: R.int(5, 8), k: R.int(3, 4) }),
          text: 'How much damage will this deal?', code: ['def charge(n):', '    return n * $k', 'cast(fireball, charge($a))'],
          explain: 'charge($a) returns $(a * k).',
        },
        {
          type: 'fix', vars: R => ({ a: R.int(5, 8) }),
          text: 'This crashes inside cast. Run it, then tap the broken line.',
          code: ['def power(n):', '    n * 3', 'cast(spark, power($a))'], bad: 1,
          options: ['    return n * 3', '    print(n * 3)', '    power = n * 3'], answer: 0,
          explain: 'Without return, power gives back None, and None is not a spell power.',
        },
        { type: 'talk', who: 'shadowmage', text: 'Clever. But can you go deeper?' },
        {
          type: 'fill', vars: R => ({ s: R.int(2, 3), t: R.pick([30, 40]) }),
          text: 'Boost the power by doubling until it reaches $t, then print it and cast icebolt with it.',
          lines: ['def boost(n):', '    if n >= $t:', '        return n', '    return boost(n [] 2)', 'print(boost($s))', 'cast(icebolt, boost($s))'], chips: ['*', '+', '-'], answer: [['*']],
          hints: ['Doubling means multiply.', 'boost(n * 2)'],
        },
        {
          type: 'write', text: 'Final blow! $HP HP left. Write finish(hp) that returns hp, then cast spark with finish($HP).',
          starter: [], keys: ['def', 'finish', '(', ')', 'hp', ':', 'return', 'cast', 'spark', 'finish($HP)', ','],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+finish/) && has(l, /return/) ? null : 'Define finish(hp) with a return line.'),
          hints: ['def finish(hp): / return hp', 'cast(spark, finish($HP))'],
          solution: ['def finish(hp):', '    return hp', 'cast(spark, finish($HP))'],
        },
        { type: 'talk', who: 'shadowmage', text: 'So... you ARE the better mage. Go on. One dungeon remains.' },
      ],
      learn: [{ title: 'Function toolkit', code: 'def  parameters  return  defaults  recursion', text: 'Functions turn repeated code into named, reusable spells.' }],
    },
  ],
};
WORLDS.push(WORLD7);
