/* World 6: Echo Caves. for loops, range, strings in loops, while, break, continue, patterns. */
const WORLD6 = {
  id: 6, name: 'Echo Caves', topic: 'for and while loops', map: 'bg-map4.jpg',
  nodes: [[50, 92], [26, 83], [70, 74], [32, 64], [68, 55], [28, 45], [66, 35], [36, 23], [52, 9]],
  levels: [
    {
      id: '6-1', title: 'Echoes', bg: 'cave', npc: 'miner', mentor: 'miner', tags: ['forloop'],
      steps: [
        { type: 'talk', who: 'miner', text: "Hello down there, {NAME}! I'm Dusty, cave miner. Every sound echoes in these caves. Python echoes too, with loops." },
        { type: 'talk', who: 'miner', text: 'A for loop repeats its indented lines. for i in range(3): runs the block 3 times, while i counts 0, 1, 2. Watch the loop tags.' },
        { type: 'demo', vars: R => ({ n: R.int(3, 4) }), text: 'Run it.', code: ['for i in range($n):', '    print("Echo!")'] },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 5) }), text: 'What will the spellbook say?', code: ['for i in range($n):', '    print(i)'],
          explain: 'range($n) counts from 0 up to $(n - 1). It stops before $n.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 4), w: R.pick(['Drip', 'Boom', 'Ping']) }), text: 'Which lines repeat? What will it say?', code: ['for i in range($n):', '    print("$w")', 'print("Silence")'],
          explain: 'Only the indented line repeats. Silence is outside the loop, so it prints once at the end.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(3, 6), w: R.pick(['Hello', 'Echo', 'Rumble']) }),
          text: 'Make the cave echo "$w" exactly $n times.',
          lines: ['[] i in range([]):', '    print("$w")'], chips: ['for', 'if', '$n', '$(n + 1)'], answer: [['for', '$n']],
          hints: ['Loops start with for.', 'range($n) runs $n times.'],
        },
        {
          type: 'fix', vars: R => ({ n: R.int(3, 5) }),
          text: 'This should print 0 to $(n - 1), but it will not even start. Run it, then tap the broken line.',
          code: ['for i in range($n):', 'print(i)'], bad: 1,
          options: ['    print(i)', 'print(i):', 'for print(i)'], answer: 0,
          explain: 'The loop body must be indented, just like under an if.',
        },
        {
          type: 'write', vars: R => ({ n: R.int(3, 6), w: R.pick(['Boom', 'Drip', 'Clang']) }),
          text: 'Write a loop that prints $w exactly $n times.',
          starter: [], keys: ['for', 'i', 'in', 'range', '(', ')', ':', '$n', 'print', '"$w"'],
          require: (l, v) => (new RegExp(`for\\s+\\w+\\s+in\\s+range\\(\\s*${v.n}\\s*\\)\\s*:`).test(typed(l)) ? null : `Use a for loop with range(${v.n}).`),
          hints: ['for i in range($n):', 'Then an indented print("$w")'],
          solution: ['for i in range($n):', '    print("$w")'],
        },
      ],
      learn: [
        { title: 'for loops', code: 'for i in range(3):\n    print(i)', text: 'Repeats the indented block once for every value. The loop jar (i) changes each round.' },
        { title: 'range(n)', code: 'range(4) → 0 1 2 3', text: 'Counts from 0 up to, but not including, n.' },
      ],
    },
    {
      id: '6-2', title: 'Counting steps', bg: 'cave', npc: 'miner', mentor: 'miner', tags: ['range', 'accum'],
      steps: [
        { type: 'talk', who: 'miner', text: 'range can start somewhere else: range(start, stop). A third number is the step: range(0, 10, 2) counts by twos.' },
        { type: 'demo', vars: R => ({ a: R.int(1, 4) }), text: 'Run it.', code: ['for n in range($a, $(a + 4)):', '    print(n)'] },
        {
          type: 'predict', vars: R => { const a = R.int(1, 5); return { a, b: a + R.int(2, 4) }; }, text: 'What will it say?', code: ['for n in range($a, $b):', '    print(n)'],
          explain: 'Starts at $a, stops before $b.',
        },
        {
          type: 'predict', vars: R => ({ s: R.int(2, 3), stop: R.int(7, 11) }), text: 'With a step. What will it say?', code: ['for n in range(0, $stop, $s):', '    print(n)'],
          explain: 'Counts from 0 by $s, stopping before $stop.',
        },
        { type: 'talk', who: 'miner', text: 'Loops can build up a total. Start a jar at 0, then add to it every round. Miners call it an accumulator.' },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 5) }), text: 'What will it say?', code: ['total = 0', 'for i in range(1, $(n + 1)):', '    total += i', 'print(total)'],
          explain: '1 + 2 + ... + $n = $(n * (n + 1) / 2). The print is outside the loop, so it runs once.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(4, 7) }),
          text: 'Add up the numbers 1 to $n and print the total once.',
          lines: ['total = 0', 'for i in range(1, []):', '    total += []', 'print(total)'], chips: ['$(n + 1)', '$n', 'i', '1'], answer: [['$(n + 1)', 'i']],
          hints: ['range stops before its stop number.', 'range(1, $(n + 1)) and total += i'],
        },
        {
          type: 'write', vars: R => ({ n: R.int(3, 6) }),
          text: 'Print every even number from 0 up to $(2 * n), using range with a step of 2.',
          starter: [], keys: ['for', 'n', 'in', 'range', '(', ')', ',', ':', '0', '2', '$(2 * n + 1)', 'print'],
          require: l => (has(l, /range\([^)]*,\s*2\s*\)/) ? null : 'Use range with a step of 2, like range(0, 11, 2).'),
          hints: ['The stop must be past $(2 * n).', 'for n in range(0, $(2 * n + 1), 2):'],
          solution: ['for n in range(0, $(2 * n + 1), 2):', '    print(n)'],
        },
      ],
      learn: [
        { title: 'range(start, stop, step)', code: 'range(2, 10, 3) → 2 5 8', text: 'Start is included, stop is not, step is the jump size.' },
        { title: 'Accumulator', code: 'total = 0\nfor x in ...:\n    total += x', text: 'Start a jar at 0 and add to it each round.' },
      ],
    },
    {
      id: '6-3', title: 'Walking the string', bg: 'cave', npc: 'bard', mentor: 'bard', tags: ['forstr'],
      steps: [
        { type: 'talk', who: 'bard', text: "I'm Lyra the bard. My songs echo letter by letter. A for loop can walk through a string, one character at a time." },
        { type: 'demo', vars: R => ({ w: R.pick(['echo', 'song', 'cave']) }), text: 'Run it.', code: ['for ch in "$w":', '    print(ch)'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(['owl', 'bat', 'gem', 'ore']) }), text: 'end="" keeps printing on the same line. What will it say?', code: ['for ch in "$w":', '    print(ch.upper(), end="")'],
          explain: 'Each letter is printed in capitals, all on one line.',
        },
        {
          type: 'predict', vars: R => R.pick([{ w: 'banana', c: 'a' }, { w: 'crystal', c: 'r' }, { w: 'tunnels', c: 'n' }, { w: 'stalactite', c: 't' }]),
          text: 'Counting letters. What will it say?', code: ['count = 0', 'for ch in "$w":', '    if ch == "$c":', '        count += 1', 'print(count)'],
          explain: 'The loop checks every letter and adds 1 for each "$c".',
        },
        {
          type: 'fill', vars: R => ({ w: R.pick(['mountain', 'lantern', 'echoing', 'crystal']) }),
          text: 'Count the vowels in the word.',
          lines: ['word = "$w"', 'vowels = 0', 'for ch in word:', '    if ch [] "aeiou":', '        vowels [] 1', 'print(vowels)'], chips: ['in', '==', '+=', '='], answer: [['in', '+=']],
          hints: ['in checks whether ch is one of the vowels.', 'if ch in "aeiou": then vowels += 1'],
        },
        {
          type: 'write', vars: R => ({ w: R.pick(['gem', 'ore', 'bat', 'rock']) }),
          text: 'Print each letter of word on its own line, in capitals.',
          starter: ['word = "$w"'], keys: ['for', 'ch', 'in', 'word', ':', 'print', '.upper()', '(', ')'],
          require: l => (has(l, /for\s+\w+\s+in\s+word\s*:/) ? null : 'Loop through the word with for ch in word:'),
          hints: ['for ch in word:', 'Then an indented print(ch.upper())'],
          solution: ['for ch in word:', '    print(ch.upper())'],
        },
      ],
      learn: [{ title: 'Looping over strings', code: 'for ch in "cave":', text: 'A for loop can go through anything with items inside, including the letters of a string.' }],
    },
    {
      id: '6-4', title: 'Echo bats', bg: 'tunnel', mentor: 'narrator', tags: [],
      foe: R => { const p = R.int(6, 9), k = R.int(4, 5); return { kind: 'echobat', hp: p * k, p, k }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'A swarm of echo bats! It has $HP HP. Each spark echoes, so cast it again and again with a loop.' },
        { type: 'demo', vars: (R, c) => ({ p: c.foe.p }), text: 'Two sparks in a loop.', code: ['for i in range(2):', '    cast(spark, $p)'] },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p, n: c.foe.k - 2 }),
          text: 'It has $HP HP left and each spark does $p. How many rounds should the loop run?',
          lines: ['for i in range([]):', '    cast(spark, $p)'], chips: ['$n', '$(n + 3)', '$(n - 1)', '"$n"'], answer: [['$n']],
          goal: { foeDown: true },
          require: (s, v) => (s[0] === String(v.n) ? null : 'That works, but it wastes mana. Use exactly enough rounds.'),
          hints: ['$HP divided by $p.', 'range($n)'],
        },
        { type: 'talk', who: 'narrator', text: 'More bats! These echoes grow louder each round.' },
        {
          type: 'write', vars: R => { const n = R.int(3, 4), m = R.int(4, 6); return { n, m, hp: m * n * (n + 1) / 2 }; },
          spawn: v => ({ kind: 'echobat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Loop i from 1 to $n, casting spark with i * $m each round.',
          starter: [], keys: ['for', 'i', 'in', 'range', '(', ')', ',', ':', '1', '$(n + 1)', 'cast', 'spark', '*', '$m'],
          goal: { foeDown: true },
          require: (l, v) => (has(l, /for\s+i\s+in\s+range\(/) && new RegExp(`i\\s*\\*\\s*${v.m}|${v.m}\\s*\\*\\s*i`).test(typed(l)) ? null : 'Use a for loop and cast spark with i * the number.'),
          hints: ['range(1, $(n + 1)) gives 1 to $n.', 'for i in range(1, $(n + 1)): / cast(spark, i * $m)'],
          solution: ['for i in range(1, $(n + 1)):', '    cast(spark, i * $m)'],
        },
      ],
      learn: [{ title: 'Loops in battle', code: 'for i in range(3):\n    cast(spark, 5)', text: 'A loop repeats any action, including spells.' }],
    },
    {
      id: '6-5', title: 'While the lantern burns', bg: 'cave', npc: 'miner', mentor: 'miner', tags: ['while'],
      steps: [
        { type: 'talk', who: 'miner', text: 'A while loop keeps going as long as its question is True. Careful: if the question never becomes False, it never stops!' },
        { type: 'demo', vars: R => ({ n: R.int(3, 4) }), text: 'Run it.', code: ['oil = $n', 'while oil > 0:', '    print("Glowing...")', '    oil -= 1', 'print("Dark!")'] },
        {
          type: 'predict', vars: R => ({ lim: R.int(10, 60) }), text: 'What will it say?', code: ['x = 1', 'while x < $lim:', '    x = x * 2', 'print(x)'],
          explain: 'x doubles until it is no longer below $lim.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(10, 20), s: R.int(3, 4) }), text: 'How many rounds? What will it say?', code: ['n = $n', 'count = 0', 'while n > 0:', '    n -= $s', '    count += 1', 'print(count)'],
          explain: 'Count how many times you can take $s away before n reaches 0 or less.',
        },
        {
          type: 'fix', vars: R => ({ n: R.int(3, 5) }),
          text: 'This loop never ends! Run it, then tap the broken line.',
          code: ['steps = 0', 'while steps < $n:', '    print(steps)', '    steps - 1'], bad: 3,
          options: ['    steps += 1', '    steps -= 1', '    steps = 0'], answer: 0,
          explain: 'steps - 1 works out a value and throws it away, so steps never changes. The loop must move toward its end.',
        },
        {
          type: 'write', vars: R => ({ n: R.int(3, 5) }),
          text: 'Use a while loop to count down from $n to 1, then print Liftoff!',
          starter: ['n = $n'], keys: ['while', 'n', '>', '0', ':', 'print', '(', ')', '-=', '1', '"Liftoff!"'],
          require: l => (has(l, /while\s+/) ? null : 'Use a while loop.'),
          hints: ['while n > 0: then print(n) and n -= 1', 'print("Liftoff!") goes after the loop, not indented.'],
          solution: ['while n > 0:', '    print(n)', '    n -= 1', 'print("Liftoff!")'],
        },

        {
          type: 'predict', vars: R => ({ a: -R.int(1, 9), b: R.int(1, 9) }), input: ['$a', '0', '$b'], text: 'A classic: keep asking until the answer is good. The person types $a, then 0, then $b. What will it say?', code: ['n = int(input("n: "))', 'while n <= 0:', '    n = int(input("n: "))', 'print("thanks", n)'],
          wrong: ['n: $a / thanks $a', 'n: $a / n: 0 / thanks 0'],
          explain: 'The loop asks again while the number is not positive, so it asks three times.',
        },
      ],
      learn: [{ title: 'while loops', code: 'while n > 0:\n    n -= 1', text: 'Repeats while the question is True. Something inside must change so it can stop.' }],
    },
    {
      id: '6-6', title: 'Break and continue', bg: 'cave', npc: 'bard', mentor: 'bard', tags: ['break'],
      steps: [
        { type: 'talk', who: 'bard', text: 'Two loop controls. break stops the loop right away. continue skips the rest of this round and jumps to the next one.' },
        { type: 'demo', text: 'Run it.', code: ['for n in range(1, 10):', '    if n == 4:', '        break', '    print(n)'] },
        {
          type: 'predict', vars: R => ({ k: R.int(2, 5) }), text: 'What will it say?', code: ['for n in range(1, 8):', '    if n == $k:', '        break', '    print(n)'],
          explain: 'The loop stops completely when n reaches $k.',
        },
        {
          type: 'predict', vars: R => ({ m: R.int(2, 3) }), text: 'Now with continue. What will it say?', code: ['for n in range(1, 7):', '    if n % $m == 0:', '        continue', '    print(n)'],
          explain: 'Multiples of $m are skipped, but the loop keeps going.',
        },
        {
          type: 'fill', vars: R => ({ s: R.pick(['rrcrrcr', 'rcrrrc', 'rrrcrc']) }),
          text: 'Search the cave for the first crystal (c) and stop as soon as you find it.',
          lines: ['cave = "$s"', 'spot = 0', 'for ch in cave:', '    if ch == "c":', '        print("Crystal at", spot)', '        []', '    spot += 1'], chips: ['break', 'continue', 'pass'], answer: [['break']],
          hints: ['You want to stop the whole loop.', 'break'],
        },
        {
          type: 'write', vars: R => ({ m: R.int(3, 4) }),
          text: 'Loop n from 1 to 10. Skip numbers divisible by $m using continue, and print the rest.',
          starter: [], keys: ['for', 'n', 'in', 'range', '(', ')', ',', ':', 'if', '%', '==', '0', 'continue', 'print', '1', '11', '$m'],
          require: l => (has(l, /continue/) ? null : 'Use continue to skip.'),
          hints: ['for n in range(1, 11): / if n % $m == 0: / continue', 'print(n) at the same level as the if.'],
          solution: ['for n in range(1, 11):', '    if n % $m == 0:', '        continue', '    print(n)'],
        },
      ],
      learn: [{ title: 'break and continue', code: 'break     continue', text: 'break leaves the loop. continue skips to the next round.' }],
    },
    {
      id: '6-7', title: 'Patterns in the stone', bg: 'cave', npc: 'miner', mentor: 'miner', tags: ['nested'],
      steps: [
        { type: 'talk', who: 'miner', text: 'Loops can carve patterns. And a loop inside a loop runs the inner one completely, for every round of the outer one.' },
        { type: 'demo', vars: R => ({ n: R.int(3, 4) }), text: 'Run it.', code: ['for i in range(1, $(n + 1)):', '    print("*" * i)'] },
        {
          type: 'predict', vars: R => ({ x: 2, y: R.int(2, 3) }), text: 'A loop inside a loop. What will it say?', code: ['for a in range($x):', '    for b in range($y):', '        print(a, b)'],
          explain: 'For each a, b runs through all its values.',
        },
        {
          type: 'predict', vars: R => ({ x: R.int(2, 5), y: R.int(2, 5) }), text: 'How many times does the inner line run?', code: ['count = 0', 'for a in range($x):', '    for b in range($y):', '        count += 1', 'print(count)'],
          explain: '$x rounds of $y is $(x * y).',
        },
        {
          type: 'predict', vars: R => ({ d: String(R.int(1000, 9999)) }), text: 'Finding the biggest digit. What will it say?', code: ['best = 0', 'for ch in "$d":', '    if int(ch) > best:', '        best = int(ch)', 'print(best)'],
          explain: 'best only changes when a bigger digit appears.',
        },
        {
          type: 'write', vars: R => ({ n: R.int(3, 5) }),
          text: 'Print a staircase of $n lines: 1 #, then 2, up to $n.',
          starter: [], keys: ['for', 'i', 'in', 'range', '(', ')', ',', ':', '1', '$(n + 1)', 'print', '"#"', '*'],
          require: l => (has(l, /for/) ? null : 'Use a for loop.'),
          hints: ['"#" * i repeats the # i times.', 'for i in range(1, $(n + 1)): / print("#" * i)'],
          solution: ['for i in range(1, $(n + 1)):', '    print("#" * i)'],
        },
      ],
      learn: [{ title: 'Nested loops', code: 'for a in ...:\n    for b in ...:', text: 'The inner loop runs fully for each round of the outer loop.' }],
    },
    {
      id: '6-8', title: 'Crystal slimes', bg: 'tunnel', mentor: 'narrator', tags: [],
      foe: R => ({ kind: 'crystalslime', hp: R.int(25, 35), p: R.int(7, 10) }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'Crystal slimes! They keep regrowing, so you must keep casting while they still stand. A jar can track their health.' },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p }),
          text: 'The slime has $HP HP and fireball does $p. Keep casting while hp is above 0.',
          lines: ['hp = $HP', 'while hp > 0:', '    cast(fireball, $p)', '    hp [] []'], chips: ['-=', '+=', '$p', '$(p * 3)'], answer: [['-=', '$p']],
          goal: { foeDown: true },
          hints: ['Each fireball takes $p away from hp.', 'hp -= $p'],
        },
        { type: 'talk', who: 'narrator', text: 'The slimes merge into one giant crystal!' },
        {
          type: 'write', vars: R => { const k = R.int(3, 4), p = R.int(8, 12); return { k, p, hp: k * p }; },
          spawn: v => ({ kind: 'crystalslime', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. While shots is above 0, cast fireball with $p and take 1 from shots.',
          starter: ['shots = $k'], keys: ['while', 'shots', '>', '0', ':', 'cast', 'fireball', '$p', '(', ')', ',', '-=', '1'],
          goal: { foeDown: true },
          require: l => (has(l, /while\s+shots/) ? null : 'Use while shots > 0:'),
          hints: ['Two indented lines inside the loop.', 'while shots > 0: / cast(fireball, $p) / shots -= 1'],
          solution: ['while shots > 0:', '    cast(fireball, $p)', '    shots -= 1'],
        },
      ],
      learn: [{ title: 'Loop until done', code: 'while hp > 0:', text: 'while loops are perfect when you do not know in advance how many rounds you need.' }],
    },
    {
      id: '6-9', title: 'The Crystal Wyrm', bg: 'geode', foe: { kind: 'wyrm', hp: 160, weak: 'spark', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'wyrm', text: 'SSSOUND... ECHOES... FOREVERRR...' },
        { type: 'talk', who: 'narrator', text: 'The Crystal Wyrm has 160 HP. Spark shatters crystal: double damage. Fireball barely warms it: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ n: R.int(2, 3), p: R.int(5, 8) }),
          text: 'How much damage will this loop deal? Remember spark is doubled.', code: ['for i in range($n):', '    cast(spark, $p)'],
          explain: '$n sparks of $p, doubled.',
        },
        {
          type: 'fix', vars: R => ({ p: R.int(5, 8) }),
          text: 'This should strike 4 times but strikes 3. Run it, then tap the broken line.',
          code: ['for i in range(1, 4):', '    print("Strike", i)', '    cast(spark, $p)'], bad: 0,
          options: ['for i in range(1, 5):', 'for i in range(4, 1):', 'for i in range(1, 4, 2):'], answer: 0,
          explain: 'range stops before its stop number, so range(1, 5) gives 1, 2, 3, 4.',
        },
        { type: 'talk', who: 'wyrm', text: 'CHAAARGE... MY CRYSTALS!' },
        {
          type: 'fill', vars: R => ({ t: R.pick([8, 16]) }),
          text: 'Double your charge until it reaches $t, then break out and cast spark with it.',
          lines: ['charge = 1', 'while True:', '    charge = charge * 2', '    if charge >= $t:', '        []', 'cast(spark, charge)'], chips: ['break', 'continue', 'pass'], answer: [['break']],
          goal: { output: 'auto' },
          hints: ['while True never stops by itself.', 'break'],
        },
        {
          type: 'write', vars: (R, c) => { const p = R.int(8, 12); return { p, k: Math.ceil(c.foe.hp / (2 * p)) }; },
          text: 'Final blow! $HP HP left. Use a for loop to cast spark $k times with power $p.',
          starter: [], keys: ['for', 'i', 'in', 'range', '(', ')', ':', '$k', 'cast', 'spark', ',', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /for\s+\w+\s+in\s+range/) ? null : 'Use a for loop with range.'),
          hints: ['range($k) runs $k times.', 'for i in range($k): / cast(spark, $p)'],
          solution: ['for i in range($k):', '    cast(spark, $p)'],
        },
        { type: 'talk', who: 'wyrm', text: '...silence... at last...' },
      ],
      learn: [{ title: 'Loop toolkit', code: 'for  while  range  break  continue', text: 'Repeat a known number of times with for, or until something changes with while.' }],
    },
  ],
};
WORLDS.push(WORLD6);
