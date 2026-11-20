/* World 16: The Spiral Depths. Recursion: a function that calls itself, base cases,
   the call stack and the order things happen, factorial, recursion over lists and
   strings, branching recursion (Fibonacci, Towers of Hanoi), RecursionError.
   Source: MIT 6.100L. (The game keeps recursion shallow: about 60 calls deep.) */
Object.assign(EXTRA.npcs, {
  mott: { name: 'Delver Mott', colors: ['#5a4a3a', '#9a958a', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  spiralshell: { base: 'crab', name: 'Spiral shell', pal: { R: '#c8a060', M: '#5a3a22' } },
  depthbat: { base: 'echobat', name: 'Depth bat', pal: { P: '#3a2a5a', W: '#c79bff' } },
  spiralwurm: { base: 'wurm', name: 'The Spiral Wurm' },
});

const WORLD16 = {
  id: 16, name: 'The Spiral Depths', topic: 'recursion',
  nodes: [[50, 92], [30, 82], [66, 72], [36, 62], [64, 52], [34, 42], [62, 32], [42, 21], [52, 8]],
  levels: [
    {
      id: '16-1', title: 'Calling yourself', bg: 'cave', npc: 'mott', mentor: 'mott', tags: ['recurbase'],
      steps: [
        { type: 'talk', who: 'mott', text: "Mind the steps, {NAME}. I'm Mott, and these stairs spiral down forever... almost. A RECURSIVE function is one that calls itself, each time on a smaller problem." },
        { type: 'talk', who: 'mott', text: 'Every recursive function needs a BASE CASE: a simple case it answers without calling itself. Without one, it spirals down until Python gives up.' },
        { type: 'demo', vars: R => ({ n: R.int(3, 5) }), text: 'Run it.', code: ['def countdown(n):', '    if n == 0:', '        print("Liftoff!")', '        return', '    print(n)', '    countdown(n - 1)', 'countdown($n)'] },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 4) }),
          text: 'What will it say?', code: ['def steps(n):', '    if n == 0:', '        return', '    print("step", n)', '    steps(n - 1)', 'steps($n)'],
          explain: 'Each call prints its n, then calls itself with n - 1, until n reaches 0.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'No base case. Which error?', code: ['def fall(n):', '    fall(n + 1)', 'fall(0)'],
          explain: 'Nothing ever stops the calls, so Python runs out of room: RecursionError.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(3, 5) }),
          text: 'Add the base case, so it stops at 0.',
          lines: ['def down(n):', '    if n [] 0:', '        print("bottom")', '        return', '    print(n)', '    down(n - 1)', 'down($n)'], chips: ['==', '!=', '>'], answer: [['==']],
          hints: ['Stop when n reaches zero.', 'if n == 0:'],
        },
        {
          type: 'fix', vars: R => ({ n: R.int(3, 5) }),
          text: 'This never reaches the bottom. Run it, then tap the broken line.',
          code: ['def down(n):', '    if n == 0:', '        return', '    print(n)', '    down(n)', 'down($n)'], bad: 4,
          options: ['    down(n - 1)', '    down(n + 1)', '    return down'], answer: 0,
          explain: 'Each call must move closer to the base case.',
        },
        {
          type: 'write', vars: R => ({ n: R.int(3, 6) }),
          text: 'Write up(n) that prints the numbers 1 to n using recursion: call up(n - 1) FIRST, then print n. Stop when n is 0. Then call up($n).',
          starter: [], keys: ['def', 'up', '(', ')', 'n', ':', 'if', '==', '0', 'return', '-', '1', 'print', '$n'],
          require: l => (has(l, /up\s*\(\s*n\s*-\s*1\s*\)/) && !has(l, /\bfor\b|\bwhile\b/) ? null : 'Use recursion (up(n - 1)), not a loop.'),
          hints: ['def up(n): / if n == 0: / return', 'up(n - 1) then print(n), and finally up($n)'],
          solution: ['def up(n):', '    if n == 0:', '        return', '    up(n - 1)', '    print(n)', 'up($n)'],
        },
      ],
      learn: [{ title: 'Recursion', code: 'def f(n):\n    if n == 0:      # base case\n        return\n    f(n - 1)        # smaller problem', text: 'A function that calls itself on a smaller problem, with a base case to stop.' }],
    },
    {
      id: '16-2', title: 'The stack of plates', bg: 'tunnel', npc: 'mott', mentor: 'mott', tags: ['recurstack'],
      steps: [
        { type: 'talk', who: 'mott', text: 'Each call waits for the one below it, like plates in a stack. Code BEFORE the recursive call runs on the way down. Code AFTER it runs on the way back up, in reverse order.' },
        { type: 'demo', text: 'Run it and watch the order.', code: ['def dig(n):', '    if n == 0:', '        return', '    print("down", n)', '    dig(n - 1)', '    print("up", n)', 'dig(3)'] },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 3) }),
          text: 'Only after. What will it say?', code: ['def echo(n):', '    if n == 0:', '        return', '    echo(n - 1)', '    print(n)', 'echo($n)'],
          explain: 'The prints happen on the way back up, so the smallest n prints first.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['ab', 'abc', 'xyz']) }),
          text: 'What will it say?', code: ['def show(s):', '    if s == "":', '        return', '    show(s[1:])', '    print(s[0])', 'show("$w")'],
          explain: 'The first letter waits until all the later ones have printed, so the word comes out backwards, one letter per line.',
        },
        {
          type: 'fill', text: 'Make it print 3, 2, 1 on the way DOWN.',
          lines: ['def go(n):', '    if n == 0:', '        return', '    []', '    go(n - 1)', 'go(3)'], chips: ['print(n)', 'go(n)', 'return n'], answer: [['print(n)']],
          hints: ['Print before the recursive call.', 'print(n)'],
        },
        {
          type: 'write', text: 'Write bounce(n): print n, call bounce(n - 1), then print n again. Stop at 0. Call bounce(2).',
          starter: [], keys: ['def', 'bounce', '(', ')', 'n', ':', 'if', '==', '0', 'return', 'print', '-', '1', '2'],
          require: l => (has(l, /bounce\s*\(\s*n\s*-\s*1\s*\)/) ? null : 'Call bounce(n - 1) between the two prints.'),
          hints: ['print(n) / bounce(n - 1) / print(n)', 'Output: 2 1 1 2'],
          solution: ['def bounce(n):', '    if n == 0:', '        return', '    print(n)', '    bounce(n - 1)', '    print(n)', 'bounce(2)'],
        },
      ],
      learn: [{ title: 'The call stack', code: 'print("down")\nf(n - 1)\nprint("up")', text: 'Before the call: on the way down. After the call: on the way up, in reverse.' }],
    },
    {
      id: '16-3', title: 'Multiplying down', bg: 'cave', npc: 'mott', mentor: 'mott', tags: ['factorial'],
      steps: [
        { type: 'talk', who: 'mott', text: 'Recursive functions can RETURN values that flow back up. Factorial: 4! = 4 × 3 × 2 × 1. Notice 4! = 4 × 3!, so fact(n) = n * fact(n - 1). Base case: fact(1) = 1.' },
        { type: 'demo', text: 'Run it.', code: ['def fact(n):', '    if n <= 1:', '        return 1', '    return n * fact(n - 1)', 'print(fact(5))'] },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 6) }),
          text: 'What will it say?', code: ['def fact(n):', '    if n <= 1:', '        return 1', '    return n * fact(n - 1)', 'print(fact($n))'],
          explain: '$n! = $([...Array(n)].map((_, i) => n - i).join(" × ")).',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 7) }),
          text: 'Adding instead. What will it say?', code: ['def total(n):', '    if n == 0:', '        return 0', '    return n + total(n - 1)', 'print(total($n))'],
          explain: '$n + ... + 1 + 0 = $(n * (n + 1) / 2).',
        },
        {
          type: 'fill', vars: R => ({ b: R.int(2, 3), e: R.int(2, 4) }),
          text: 'power(b, e) multiplies b by itself e times. Finish the recursive line.',
          lines: ['def power(b, e):', '    if e == 0:', '        return 1', '    return b * power(b, [])', 'print(power($b, $e))'], chips: ['e - 1', 'e', 'b - 1'], answer: [['e - 1']],
          hints: ['b ** e = b × b ** (e - 1)', 'power(b, e - 1)'],
        },
        {
          type: 'fix', vars: R => ({ n: R.int(4, 6) }),
          text: 'fact should give $n!, but it always gives 0. Run it, then tap the broken line.',
          code: ['def fact(n):', '    if n <= 1:', '        return 0', '    return n * fact(n - 1)', 'print(fact($n))'], bad: 2,
          options: ['        return 1', '        return -1', '        return fact(0)'], answer: 0,
          explain: 'Anything times 0 is 0. The base case of a product must be 1.',
        },
        {
          type: 'write', vars: R => ({ n: R.int(3, 6) }),
          text: 'Write sum_to(n) that RETURNS 1 + 2 + ... + n recursively (sum_to(0) is 0). Print sum_to($n).',
          starter: [], keys: ['def', 'sum_to', '(', ')', 'n', ':', 'if', '==', '0', 'return', '+', '-', '1', 'print', '$n'],
          require: l => (has(l, /sum_to\s*\(\s*n\s*-\s*1\s*\)/) && !has(l, /\bfor\b|\bwhile\b|sum\s*\(/) ? null : 'Use recursion: n + sum_to(n - 1).'),
          hints: ['if n == 0: return 0', 'return n + sum_to(n - 1)'],
          solution: ['def sum_to(n):', '    if n == 0:', '        return 0', '    return n + sum_to(n - 1)', 'print(sum_to($n))'],
        },
      ],
      learn: [{ title: 'Returning up the stack', code: 'def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)', text: 'Each call hands its answer back to the call above.' }],
    },
    {
      id: '16-4', title: 'Spiral shells', bg: 'geode', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), k = R.int(3, 5); return { kind: 'spiralshell', hp: d + k * (k + 1) / 2 * 3, d, k }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Spiral shells roll up the stairs! $HP HP. A recursive spell can strike again and again, a little weaker each time.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'One strike.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ k: c.foe.k }),
          text: 'It has $HP HP left. volley(n) casts fireball with n × 3, then volley(n - 1), down to 1. Start it at $k.',
          lines: ['def volley(n):', '    if n == 0:', '        return', '    cast(fireball, n * 3)', '    volley([])', 'volley($k)'], chips: ['n - 1', 'n', 'n + 1'], answer: [['n - 1']],
          goal: { foeDown: true },
          hints: ['Each strike is one step closer to 0.', 'volley(n - 1)'],
        },
        { type: 'talk', who: 'narrator', text: 'The great shell coils up!' },
        {
          type: 'write', vars: R => { const k = R.int(3, 5); return { k, hp: k * (k + 1) / 2 * 2 }; },
          spawn: v => ({ kind: 'spiralshell', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Write spin(n): if n is 0, stop; otherwise cast icebolt with n × 2 and spin(n - 1). Call spin($k).',
          starter: [], keys: ['def', 'spin', '(', ')', 'n', ':', 'if', '==', '0', 'return', 'cast', 'icebolt', ',', '*', '2', '-', '1', '$k'],
          goal: { foeDown: true },
          require: l => (has(l, /spin\s*\(\s*n\s*-\s*1\s*\)/) ? null : 'Recurse with spin(n - 1).'),
          hints: ['def spin(n): / if n == 0: / return', 'cast(icebolt, n * 2) / spin(n - 1), then spin($k)'],
          solution: ['def spin(n):', '    if n == 0:', '        return', '    cast(icebolt, n * 2)', '    spin(n - 1)', 'spin($k)'],
        },
      ],
      learn: [{ title: 'Recursive volleys', code: 'def volley(n):\n    if n == 0: return\n    cast(fireball, n)\n    volley(n - 1)', text: 'Recursion can repeat actions too.' }],
    },
    {
      id: '16-5', title: 'Lists all the way down', bg: 'cave', npc: 'mott', mentor: 'mott', tags: ['recurlist'],
      steps: [
        { type: 'talk', who: 'mott', text: 'A list is its first item plus the rest of the list. That makes lists perfect for recursion: handle lst[0], then recurse on lst[1:]. Base case: the empty list.' },
        { type: 'demo', text: 'Run it.', code: ['def total(lst):', '    if not lst:', '        return 0', '    return lst[0] + total(lst[1:])', 'print(total([4, 5, 6]))'] },
        {
          type: 'predict', vars: R => ({ l: [R.int(1, 9), R.int(1, 9), R.int(1, 9), R.int(1, 9)] }),
          text: 'Counting items. What will it say?', code: ['def length(lst):', '    if lst == []:', '        return 0', '    return 1 + length(lst[1:])', 'print(length($(JSON.stringify(l))))'],
          explain: 'Each call adds 1 and passes on the rest.',
        },
        {
          type: 'predict', vars: R => ({ l: [R.int(1, 30), R.int(1, 30), R.int(1, 30), R.int(1, 30)] }),
          text: 'The biggest one. What will it say?', code: ['def biggest(lst):', '    if len(lst) == 1:', '        return lst[0]', '    rest = biggest(lst[1:])', '    return lst[0] if lst[0] > rest else rest', 'print(biggest($(JSON.stringify(l))))'],
          explain: 'Compare the first item with the biggest of the rest.',
        },
        {
          type: 'fill', vars: R => ({ l: [R.int(1, 9), R.int(1, 9), R.int(1, 9)] }),
          text: 'Count how many items are even, recursively.',
          lines: ['def evens(lst):', '    if not lst:', '        return 0', '    here = 1 if lst[0] % 2 == 0 else 0', '    return here + evens([])', 'print(evens($(JSON.stringify(l))))'], chips: ['lst[1:]', 'lst', 'lst[0]'], answer: [['lst[1:]']],
          hints: ['Recurse on everything after the first item.', 'evens(lst[1:])'],
        },
        {
          type: 'write', vars: R => ({ l: [R.int(1, 9), R.int(1, 9), R.int(1, 9), R.int(1, 9)] }),
          text: 'Write product(lst) that multiplies all the items recursively (an empty list gives 1). Print product(nums).',
          starter: ['nums = $(JSON.stringify(l))'], keys: ['def', 'product', '(', ')', 'lst', ':', 'if', 'not', 'return', '1', '[', ']', '0', '*', '1:', 'print', 'nums'],
          require: l => (has(l, /product\s*\(\s*lst\s*\[\s*1\s*:\s*\]\s*\)/) && !has(l, /\bfor\b|\bwhile\b/) ? null : 'Recurse on lst[1:], with no loops.'),
          hints: ['if not lst: return 1', 'return lst[0] * product(lst[1:])'],
          solution: ['def product(lst):', '    if not lst:', '        return 1', '    return lst[0] * product(lst[1:])', 'print(product(nums))'],
        },
      ],
      learn: [{ title: 'First plus the rest', code: 'def total(lst):\n    if not lst:\n        return 0\n    return lst[0] + total(lst[1:])', text: 'Handle the first item, recurse on the rest, stop at the empty list.' }],
    },
    {
      id: '16-6', title: 'Words in the well', bg: 'tunnel', npc: 'mott', mentor: 'mott', tags: ['recurstr'],
      steps: [
        { type: 'talk', who: 'mott', text: 'Strings work the same way. A word is a palindrome if its first and last letters match AND the middle, word[1:-1], is a palindrome too. Base case: 0 or 1 letters.' },
        { type: 'demo', text: 'Run it.', code: ['def is_pal(w):', '    if len(w) <= 1:', '        return True', '    return w[0] == w[-1] and is_pal(w[1:-1])', 'print(is_pal("level"), is_pal("lever"))'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(['racecar', 'rotor', 'robot', 'kayak', 'koala']) }),
          text: 'What will it say?', code: ['def is_pal(w):', '    if len(w) <= 1:', '        return True', '    return w[0] == w[-1] and is_pal(w[1:-1])', 'print(is_pal("$w"))'],
          explain: '"$w" backwards is "$(w.split("").reverse().join(""))".',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['cave', 'echo', 'well', 'deep']) }),
          text: 'What will it say?', code: ['def rev(s):', '    if s == "":', '        return ""', '    return rev(s[1:]) + s[0]', 'print(rev("$w"))'],
          explain: 'Reverse the rest, then put the first letter on the end.',
        },
        {
          type: 'fill', vars: R => ({ w: R.pick(['banana', 'echoes', 'mammoth']), c: 'a' }),
          text: 'Count the letter "a" recursively.',
          lines: ['def count_a(s):', '    if s == "":', '        return 0', '    here = 1 if s[0] == "a" else 0', '    return here + count_a([])', 'print(count_a("$w"))'], chips: ['s[1:]', 's[0]', 's'], answer: [['s[1:]']],
          hints: ['Recurse on everything after the first letter.', 'count_a(s[1:])'],
        },
        {
          type: 'write', vars: R => ({ w: R.pick(['spiral', 'stairs', 'lantern']) }),
          text: 'Write shout(s) that RETURNS s in capitals, letter by letter, with recursion (empty string gives ""). Print shout("$w").',
          starter: [], keys: ['def', 'shout', '(', ')', 's', ':', 'if', '==', '""', 'return', '[', ']', '0', '.upper()', '+', '1:', 'print', '"$w"'],
          require: l => (has(l, /shout\s*\(\s*s\s*\[\s*1\s*:\s*\]\s*\)/) ? null : 'Recurse on s[1:].'),
          hints: ['if s == "": return ""', 'return s[0].upper() + shout(s[1:])'],
          solution: ['def shout(s):', '    if s == "":', '        return ""', '    return s[0].upper() + shout(s[1:])', 'print(shout("$w"))'],
        },
      ],
      learn: [{ title: 'Recursion on strings', code: 'w[0] == w[-1] and is_pal(w[1:-1])', text: 'Peel letters off the ends or the front, and stop at the empty string.' }],
    },
    {
      id: '16-7', title: 'Branching spirals', bg: 'geode', npc: 'mott', mentor: 'mott', tags: ['recurbranch'],
      steps: [
        { type: 'talk', who: 'mott', text: 'Some problems call themselves TWICE. Fibonacci: each number is the sum of the two before it. fib(n) = fib(n - 1) + fib(n - 2), with fib(0) = 0 and fib(1) = 1.' },
        { type: 'demo', text: 'Run it.', code: ['def fib(n):', '    if n < 2:', '        return n', '    return fib(n - 1) + fib(n - 2)', 'print([fib(i) for i in range(8)])'] },
        {
          type: 'predict', vars: R => ({ n: R.int(5, 9) }),
          text: 'What will it say?', code: ['def fib(n):', '    if n < 2:', '        return n', '    return fib(n - 1) + fib(n - 2)', 'print(fib($n))'],
          explain: '0, 1, 1, 2, 3, 5, 8, 13, 21, 34... fib($n) is the number at position $n.',
        },
        { type: 'talk', who: 'mott', text: 'But branching gets expensive FAST. Each call makes two more. Let us count the calls.' },
        {
          type: 'predict', vars: R => ({ n: R.pick([5, 6, 7]) }),
          text: 'How many calls? What will it say?', code: ['calls = 0', 'def fib(n):', '    global calls', '    calls += 1', '    if n < 2:', '        return n', '    return fib(n - 1) + fib(n - 2)', 'fib($n)', 'print(calls)'],
          explain: 'The same small values are worked out again and again. The count grows almost as fast as fib itself. (The Memory Vaults will fix this.)',
        },
        { type: 'talk', who: 'mott', text: 'The Towers of Hanoi: move a stack of disks from peg A to C, one at a time, never a big disk on a small one. To move n disks: move n - 1 out of the way, move the big one, move n - 1 back on top.' },
        {
          type: 'predict', text: 'Two disks. What will it say?', code: ['def hanoi(n, a, b, c):', '    if n == 0:', '        return', '    hanoi(n - 1, a, c, b)', '    print(a, "->", c)', '    hanoi(n - 1, b, a, c)', 'hanoi(2, "A", "B", "C")'],
          explain: 'Small disk A → B, big disk A → C, small disk B → C.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 6) }),
          text: 'Counting the moves. What will it say?', code: ['def moves(n):', '    if n == 0:', '        return 0', '    return moves(n - 1) + 1 + moves(n - 1)', 'print(moves($n))'],
          explain: 'Hanoi with $n disks takes 2 to the power $n, minus 1, moves: $(2 ** n - 1).',
        },
        {
          type: 'write', vars: R => ({ n: R.int(4, 8) }),
          text: 'Write steps(n): a frog climbs 1 or 2 steps at a time. Ways to climb n steps = steps(n - 1) + steps(n - 2), with steps(0) = 1 and steps(1) = 1. Print steps($n).',
          starter: [], keys: ['def', 'steps', '(', ')', 'n', ':', 'if', '<', '2', 'return', '1', '+', '-', 'print', '$n'],
          require: l => (has(l, /steps\s*\(\s*n\s*-\s*1\s*\)/) && has(l, /steps\s*\(\s*n\s*-\s*2\s*\)/) ? null : 'Call steps(n - 1) and steps(n - 2).'),
          hints: ['if n < 2: return 1', 'return steps(n - 1) + steps(n - 2)'],
          solution: ['def steps(n):', '    if n < 2:', '        return 1', '    return steps(n - 1) + steps(n - 2)', 'print(steps($n))'],
        },
      ],
      learn: [
        { title: 'Branching recursion', code: 'def fib(n):\n    if n < 2: return n\n    return fib(n - 1) + fib(n - 2)', text: 'Two recursive calls per step. Elegant, but the number of calls explodes.' },
        { title: 'Towers of Hanoi', code: 'move n - 1 aside, move 1, move n - 1 back', text: 'n disks take 2**n - 1 moves.' },
      ],
    },
    {
      id: '16-8', title: 'Depth bats', bg: 'tunnel', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), l = [R.int(3, 8), R.int(3, 8), R.int(3, 8)]; return { kind: 'depthbat', hp: d + l[0] + l[1] + l[2], d, l }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Depth bats screech up the shaft! $HP HP. Add up a list of powers with recursion and strike once.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ l: c.foe.l }),
          text: 'It has $HP HP left. Total the powers recursively and cast fireball once.',
          lines: ['def total(lst):', '    if not lst:', '        return []', '    return lst[0] + total(lst[1:])', 'cast(fireball, total($(JSON.stringify(l))))'], chips: ['0', '1', 'lst'], answer: [['0']],
          goal: { foeDown: true },
          require: s => (s[0] === '0' ? null : 'The sum of an empty list is 0.'),
          hints: ['Adding nothing gives...', 'return 0'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat matriarch! Her HP is a factorial.' },
        {
          type: 'write', vars: R => { const n = R.int(3, 4); const f = [1, 1, 2, 6, 24][n]; return { n, hp: f }; },
          spawn: v => ({ kind: 'depthbat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP, which is $n!. Write fact(n) recursively and cast icebolt with fact($n).',
          starter: [], keys: ['def', 'fact', '(', ')', 'n', ':', 'if', '<=', '1', 'return', '*', '-', 'cast', 'icebolt', ',', '$n'],
          goal: { foeDown: true },
          require: l => (has(l, /fact\s*\(\s*n\s*-\s*1\s*\)/) ? null : 'Use recursion: n * fact(n - 1).'),
          hints: ['if n <= 1: return 1', 'return n * fact(n - 1), then cast(icebolt, fact($n))'],
          solution: ['def fact(n):', '    if n <= 1:', '        return 1', '    return n * fact(n - 1)', 'cast(icebolt, fact($n))'],
        },
      ],
      learn: [{ title: 'Empty is the base', code: 'if not lst:\n    return 0', text: 'For sums the empty case is 0; for products it is 1.' }],
    },
    {
      id: '16-9', title: 'The Spiral Wurm', bg: 'geode', foe: { kind: 'spiralwurm', hp: 170, weak: 'spark', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'spiralwurm', text: 'DOWN... AND... DOWN... AND... DOWN...' },
        { type: 'talk', who: 'narrator', text: 'The Spiral Wurm has 170 HP. Spark crackles through its coils: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ n: R.int(3, 4) }),
          text: 'How much damage? Spark is doubled.', code: ['def fact(n):', '    if n <= 1:', '        return 1', '    return n * fact(n - 1)', 'cast(spark, fact($n))'],
          explain: '$n! is $([1, 1, 2, 6, 24][n]), doubled.',
        },
        {
          type: 'fix', vars: R => ({ n: R.int(3, 5) }),
          text: 'coil(n) should strike n, n - 1, ... 1 and print each. Run it, then tap the broken line.',
          code: ['def coil(n):', '    if n == 0:', '        return', '    print(n)', '    cast(spark, n)', '    coil(n + 1)', 'coil($n)'], bad: 5,
          options: ['    coil(n - 1)', '    coil(n)', '    return coil'], answer: 0,
          explain: 'Each call must get closer to the base case.',
        },
        { type: 'talk', who: 'spiralwurm', text: 'COUNT... MY... COILS... IF... YOU... CAN...' },
        {
          type: 'fill', text: 'Count its coils with branching recursion and strike with spark.',
          lines: ['def fib(n):', '    if n < 2:', '        return n', '    return fib(n - 1) + fib([])', 'cast(spark, fib(7))'], chips: ['n - 2', 'n - 1', 'n'], answer: [['n - 2']],
          hints: ['Each Fibonacci number adds the two before it.', 'fib(n - 2)'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and spark is doubled. Write half(hp) that returns hp // 2 + 1, and cast spark with half($HP).',
          starter: [], keys: ['def', 'half', '(', ')', 'hp', ':', 'return', '//', '2', '+', '1', 'cast', 'spark', ',', '$HP'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+half/) ? null : 'Define half(hp).'),
          hints: ['def half(hp): / return hp // 2 + 1', 'cast(spark, half($HP))'],
          solution: ['def half(hp):', '    return hp // 2 + 1', 'cast(spark, half($HP))'],
        },
        { type: 'talk', who: 'spiralwurm', text: '...at... last... the... bottom...' },
      ],
      learn: [{ title: 'Recursion toolkit', code: 'base case  smaller call  return up  lst[1:]  fib  hanoi', text: 'Everything from the Spiral Depths.' }],
    },
  ],
};
WORLDS.push(WORLD16);

(() => {
  const { makeQ, rnd } = Arena;
  Object.assign(Arena.GEN, {
    recurbase: () => { const n = rnd(2, 4); return makeQ(['def f(n):', '    if n == 0:', '        return', '    print(n)', '    f(n - 1)', `f(${n})`], [[...Array(n)].map((_, i) => i + 1).join('\n'), n - 1]); },
    recurstack: () => { const n = rnd(2, 3); return makeQ(['def f(n):', '    if n == 0:', '        return', '    f(n - 1)', '    print(n)', `f(${n})`], [[...Array(n)].map((_, i) => n - i).join('\n'), n]); },
    factorial: () => { const n = rnd(3, 6); const f = [1, 1, 2, 6, 24, 120, 720][n]; return makeQ(['def fact(n):', '    if n <= 1:', '        return 1', '    return n * fact(n - 1)', `print(fact(${n}))`], [f / n, n * (n + 1) / 2]); },
    recurlist: () => { const l = [rnd(1, 9), rnd(1, 9), rnd(1, 9)]; return makeQ(['def t(x):', '    if not x:', '        return 0', '    return x[0] + t(x[1:])', `print(t(${JSON.stringify(l)}))`], [l[0], l[1] + l[2]]); },
    recurstr: () => { const w = ['cave', 'deep', 'well'][rnd(0, 2)]; return makeQ(['def r(s):', '    if s == "":', '        return ""', '    return r(s[1:]) + s[0]', `print(r("${w}"))`], [w, w.slice(1) + w[0]]); },
    recurbranch: () => { const n = rnd(4, 8); const fib = [0, 1, 1, 2, 3, 5, 8, 13, 21][n]; return makeQ(['def fib(n):', '    if n < 2:', '        return n', '    return fib(n - 1) + fib(n - 2)', `print(fib(${n}))`], [fib + 1, [0, 1, 1, 2, 3, 5, 8, 13, 21][n - 1]]); },
  });
})();
