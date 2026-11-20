/* World 31: The Watchtower. Debugging as a skill: reading a traceback, the common error
   types, print debugging, assert as a sanity check, logging levels instead of prints,
   tracing code by hand (and the rubber duck), hunting a bug by halves, and classic
   off-by-one mistakes. Sources: Automate the Boring Stuff chapter 11, MIT 6.100L, ours. */
Object.assign(EXTRA.npcs, {
  watch: { name: 'Watch-captain Brann', colors: ['#4a4a5a', '#c8452f', '#c98d5f'] },
  duck: { name: 'Sir Quackalot', colors: ['#f0c53a', '#ff7a2b', '#f0c53a'] },
});
Object.assign(EXTRA.foes, {
  bugling: { base: 'bugswarm', name: 'Bugling' },
  glitchbat: { base: 'echobat', name: 'Glitch bat', pal: { P: '#5fd3ff', W: '#ff3fd0' } },
  bugqueen: { base: 'bugswarm', name: 'The Bug Queen', s: 4 },
});
const TB_LINES = (file, line, code, err) => ['Traceback (most recent call last):', `  File "${file}", line ${line}, in <module>`, `    ${code}`, err];

const WORLD31 = {
  id: 31, name: 'The Watchtower', topic: 'debugging, logging and assert',
  nodes: [[50, 92], [26, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [38, 21], [52, 8]],
  levels: [
    {
      id: '31-1', title: 'Reading the alarm', bg: 'keep', npc: 'watch', mentor: 'watch', tags: ['traceback'],
      steps: [
        { type: 'talk', who: 'watch', text: "Eyes up, {NAME}! I'm Captain Brann of the Watchtower. When a spell fails, Python rings an alarm called a TRACEBACK. New mages panic. Watchers READ it, from the bottom up." },
        { type: 'talk', who: 'watch', text: 'The LAST line is the most important: the error type and a message. Just above it, Python shows the file, the LINE NUMBER and the line of code where it happened.' },
        { type: 'predict', shell: true, text: 'Read the alarm. Which line of the spell crashed?', code: TB_LINES('spell.py', 7, 'total = gold + "5"', 'TypeError: unsupported operand type(s) for +: \'int\' and \'str\''), choices: ['line 7', 'line 1', 'the last line of the file'], answer: 0, explain: 'The "File ..., line 7" line says exactly where it happened.' },
        { type: 'predict', shell: true, text: 'What went wrong?', code: TB_LINES('spell.py', 3, 'print(scores[5])', 'IndexError: list index out of range'), choices: ['scores has fewer than 6 items', 'print is broken', 'scores is not defined'], answer: 0, explain: 'IndexError: index 5 does not exist, so the list is shorter than 6 items.' },
        {
          type: 'predict', measure: 'errtype', vars: R => R.pick([{ c: 'print(len(5))' }, { c: 'print(undefined_name)' }, { c: 'print({"a": 1}["b"])' }, { c: 'print("abc".push("d"))' }, { c: 'print(int("ten"))' }, { c: 'print(10 / 0)' }]),
          text: 'Which alarm rings?', code: ['$c'],
          explain: 'Learn the usual suspects: TypeError, NameError, KeyError, AttributeError, ValueError, ZeroDivisionError, IndexError.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'The alarm rings inside a function. Which error?', code: ['def average(nums):', '    return sum(nums) / len(nums)', 'print(average([]))'],
          explain: 'An empty list has length 0: ZeroDivisionError. The traceback would show BOTH lines: the call, and the line inside average.',
        },
        {
          type: 'fix', text: 'Read the error, then fix the line it points at. Run it, then tap the broken line.',
          code: ['potions = ["red", "blue"]', 'potions.add("green")', 'print(potions)'], bad: 1,
          options: ['potions.append("green")', 'potions.push("green")', 'potions + "green"'], answer: 0,
          explain: "AttributeError: 'list' object has no attribute 'add'. Lists use append; add is for sets.",
        },
      ],
      learn: [{ title: 'Reading tracebacks', code: 'Traceback (most recent call last):\n  File "spell.py", line 7, in <module>\n    total = gold + "5"\nTypeError: ...', text: 'Read from the bottom: the error type and message, then the file and line number.' }],
    },
    {
      id: '31-2', title: 'Lanterns in the dark', bg: 'tunnel', npc: 'watch', mentor: 'watch', tags: ['printdebug'],
      steps: [
        { type: 'talk', who: 'watch', text: 'When there is no crash, just a WRONG answer, light a lantern: print the values inside the code to see where reality and your plan disagree. Print the name AND the value, like print("total =", total).' },
        { type: 'demo', text: 'The total should be 6, but it says 3. The lanterns show why.', code: ['nums = [1, 2, 3]', 'for n in nums:', '    total = 0', '    total += n', '    print("n =", n, "total =", total)', 'print(total)'] },
        {
          type: 'predict', text: 'What will the lanterns show?', code: ['price = 10', 'for day in range(3):', '    price = price * 2 - 5', '    print("day", day, "price", price)'],
          explain: 'Each round doubles the price and takes 5 away: 15, 25, 45.',
        },
        {
          type: 'fix', text: 'The lanterns in the demo showed it: total resets every round. Run it, then tap the broken line.',
          code: ['total = 0', 'for n in [4, 5, 6]:', '    total = n', 'print(total)'], bad: 2,
          options: ['    total += n', '    total = 0', '    n += total'], answer: 0,
          explain: 'total = n throws away the running total. += adds to it.',
        },
        {
          type: 'fill', text: 'Add a lantern that shows i and the running total.',
          lines: ['total = 0', 'for i in range(1, 4):', '    total += i * i', '    print("i =", i, "total =", [])'], chips: ['total', 'i', '"total"'], answer: [['total']],
          hints: ['Show the variable, not its name in quotes.', 'print("i =", i, "total =", total)'],
        },
        {
          type: 'write', text: 'Count the vowels in word. Inside the loop, print a lantern line showing ch and count; after the loop, print count. (Careful: == compares, it does not change count.)',
          starter: ['word = "lantern"'], keys: ['count', '=', '0', 'for', 'ch', 'in', 'word', ':', 'if', '"aeiou"', '+=', '1', 'print', '(', ')', '"ch =", ch', '"count =", count'],
          require: l => (has(l, /count\s*\+=\s*1|count\s*=\s*count\s*\+\s*1/) && has(l, /print\s*\(\s*"ch =/) ? null : 'Add 1 with +=, and print("ch =", ch, "count =", count) inside the loop.'),
          hints: ['count = 0 / for ch in word: / if ch in "aeiou": count += 1', 'print("ch =", ch, "count =", count) inside the loop, then print(count)'],
          solution: ['count = 0', 'for ch in word:', '    if ch in "aeiou":', '        count += 1', '    print("ch =", ch, "count =", count)', 'print(count)'],
        },
      ],
      learn: [{ title: 'Print debugging', code: 'print("total =", total)', text: 'Show the values inside a loop or function to find where they go wrong.' }],
    },
    {
      id: '31-3', title: 'Sanity checks', bg: 'keep', npc: 'watch', mentor: 'watch', tags: ['assertq'],
      steps: [
        { type: 'talk', who: 'watch', text: 'assert condition, "message" is a sanity check. If the condition is False, the program stops at once with an AssertionError and your message. It catches YOUR mistakes early, close to where they happen.' },
        { type: 'demo', text: 'Run it.', code: ['def heal(hp, amount):', '    assert amount >= 0, "healing cannot be negative"', '    return hp + amount', 'print(heal(10, 5))', 'try:', '    heal(10, -3)', 'except AssertionError as e:', '    print("AssertionError:", e)'] },
        {
          type: 'predict', vars: R => ({ a: R.int(-5, 5) }),
          text: 'Does the check pass? What will it say?', code: ['level = $a', 'assert level >= 0, "level went negative"', 'print("level ok")'],
          explain: 'The assert only stops the spell when the condition is False.',
        },
        {
          type: 'predict', text: 'What will it say?', code: ['def door(open_doors):', '    assert len(open_doors) == 1, f"expected one open door, got {len(open_doors)}"', '    return open_doors[0]', 'try:', '    door(["north", "east"])', 'except AssertionError as e:', '    print("caught:", e)'],
          explain: 'The message of the AssertionError is the text after the comma.',
        },
        {
          type: 'fill', text: 'The stack of shields must never be empty here.',
          lines: ['shields = ["oak", "iron"]', 'shields.pop()', '[] shields, "no shields left!"', 'print(shields)'], chips: ['assert', 'if', 'raise'], answer: [['assert']],
          hints: ['A one-line sanity check.', 'assert shields, "no shields left!"'],
        },
        {
          type: 'write', vars: R => ({ p: R.int(10, 90) }),
          text: 'Write set_volume(v) that asserts 0 <= v <= 100 with the message "volume out of range" and returns v. Print set_volume($p).',
          starter: [], keys: ['def', 'set_volume', '(', ')', 'v', ':', 'assert', '0', '<=', '100', ',', '"volume out of range"', 'return', 'print', '$p'],
          require: l => (has(l, /assert\s+0\s*<=\s*v\s*<=\s*100/) ? null : 'Use assert 0 <= v <= 100, "...".'),
          hints: ['def set_volume(v): / assert 0 <= v <= 100, "volume out of range"', 'return v, then print(set_volume($p))'],
          solution: ['def set_volume(v):', '    assert 0 <= v <= 100, "volume out of range"', '    return v', 'print(set_volume($p))'],
        },
      ],
      learn: [{ title: 'assert', code: 'assert hp >= 0, "hp went negative"', text: 'Check what must be true. A failure stops the program right where the problem started.' }],
    },
    {
      id: '31-4', title: 'Buglings', bg: 'keep', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'bugling', hp: d0 + 6 * 4, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Buglings crawl out of the stones! $HP HP. Fix the bugs in your spells to squash them.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. This should strike 4 times with 6, but the loop count is off by one.',
          lines: ['for i in range(1, []):', '    cast(fireball, 6)'], chips: ['5', '4', '6'], answer: [['5']],
          goal: { foeDown: true },
          require: s => (s[0] === '5' ? null : 'Exactly 4 strikes: range(1, 5) gives 1, 2, 3, 4.'),
          hints: ['range stops BEFORE its end.', 'range(1, 5)'],
        },
        { type: 'talk', who: 'narrator', text: 'The bugling mother hides behind a failing check!' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'bugling', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Assert that power > 0 with the message "no power", then cast icebolt with power twice.',
          starter: ['power = $p'], keys: ['assert', 'power', '>', '0', ',', '"no power"', 'cast', 'icebolt', '(', ')'],
          goal: { foeDown: true },
          require: l => (has(l, /assert\s+power\s*>\s*0/) ? null : 'Start with assert power > 0, "no power".'),
          hints: ['assert power > 0, "no power"', 'cast(icebolt, power) twice'],
          solution: ['assert power > 0, "no power"', 'cast(icebolt, power)', 'cast(icebolt, power)'],
        },
      ],
      learn: [{ title: 'Off by one', code: 'range(1, 5) → 1 2 3 4', text: 'The most common bug of all: one too many or one too few.' }],
    },
    {
      id: '31-5', title: 'The watch log', bg: 'keep', npc: 'watch', mentor: 'watch', tags: ['loggingq'],
      steps: [
        { type: 'talk', who: 'watch', text: 'Prints are fine for a quick look, but you must remember to delete them. The logging module is better: logging.debug("...") lines can stay in the code and be switched off all at once.' },
        { type: 'talk', who: 'watch', text: 'Levels, from least to most serious: DEBUG, INFO, WARNING, ERROR, CRITICAL. basicConfig(level=...) chooses the lowest level that is shown. logging.disable(logging.CRITICAL) silences them all.' },
        { type: 'demo', text: 'Run it.', code: ['import logging', 'logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")', 'logging.debug("starting the patrol")', 'for gate in ["north", "east"]:', '    logging.info("checking %s", gate)', 'logging.warning("the east gate is open!")'] },
        {
          type: 'predict', vars: R => ({ lv: R.pick(['DEBUG', 'INFO', 'WARNING', 'ERROR']) }),
          text: 'Which lines appear? What will it say?', code: ['import logging', 'logging.basicConfig(level=logging.$lv, format="%(levelname)s %(message)s")', 'logging.debug("one")', 'logging.info("two")', 'logging.warning("three")', 'logging.error("four")'],
          explain: 'Only messages at $lv or more serious are shown.',
        },
        {
          type: 'predict', text: 'Switching the log off. What will it say?', code: ['import logging', 'logging.basicConfig(level=logging.DEBUG, format="%(message)s")', 'logging.info("before")', 'logging.disable(logging.CRITICAL)', 'logging.error("hidden")', 'print("done")'],
          explain: 'After disable(CRITICAL), no log message gets through; ordinary prints still work.',
        },
        {
          type: 'predict', text: 'With no setup at all. What will it say?', code: ['import logging', 'logging.info("quiet")', 'logging.warning("loud")'],
          explain: 'By default only WARNING and above show, formatted as LEVEL:root:message.',
        },
        {
          type: 'fill', text: 'Show DEBUG messages too.',
          lines: ['import logging', 'logging.basicConfig(level=logging.[], format="%(levelname)s - %(message)s")', 'logging.debug("x is 5")', 'logging.info("all good")'], chips: ['DEBUG', 'INFO', 'ERROR'], answer: [['DEBUG']],
          hints: ['The lowest level shows everything.', 'level=logging.DEBUG'],
        },
        {
          type: 'write', text: 'Set up logging at INFO level with the format "%(levelname)s: %(message)s". Log "patrol start" as info, a debug message "secret", and "intruder!" as an error.',
          starter: ['import logging'], keys: ['logging.basicConfig', '(', ')', 'level=logging.INFO', ',', 'format="%(levelname)s: %(message)s"', 'logging.info', 'logging.debug', 'logging.error', '"patrol start"', '"secret"', '"intruder!"'],
          require: l => (has(l, /basicConfig/) && has(l, /logging\.error/) ? null : 'Use basicConfig, then logging.info/debug/error.'),
          hints: ['logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")', 'logging.info("patrol start") / logging.debug("secret") / logging.error("intruder!")'],
          solution: ['logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")', 'logging.info("patrol start")', 'logging.debug("secret")', 'logging.error("intruder!")'],
        },
      ],
      learn: [{ title: 'logging', code: 'logging.basicConfig(level=logging.DEBUG,\n    format="%(levelname)s: %(message)s")\nlogging.debug / info / warning / error / critical\nlogging.disable(logging.CRITICAL)', text: 'Leveled messages you can leave in your code and switch on or off.' }],
    },
    {
      id: '31-6', title: 'Explain it to the duck', bg: 'village', npc: 'duck', mentor: 'duck', tags: ['tracing'],
      steps: [
        { type: 'talk', who: 'duck', text: "Quack! I'm Sir Quackalot. When you are stuck, explain your code to me, line by line, out loud. Half the time you will hear the bug yourself. Programmers call it rubber duck debugging." },
        { type: 'talk', who: 'duck', text: 'The duck\'s favourite trick is TRACING: play the computer. Write down each variable and update it as you go through the lines.' },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 6), b: R.int(2, 6) }),
          text: 'Trace it like the duck. What will it say?', code: ['x, y = $a, $b', 'x = x + y', 'y = x - y', 'x = x - y', 'print(x, y)'],
          explain: 'Step by step: x = $(a + b), y = $a, x = $b. The values have swapped!',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 6) }),
          text: 'Trace the loop. What will it say?', code: ['a, b = 1, 1', 'for i in range($n):', '    a, b = b, a + b', 'print(a)'],
          explain: 'Each round shifts the pair along the Fibonacci numbers.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([12, 18, 30]) }),
          text: 'Trace the while loop. What will it say?', code: ['n, steps = $n, 0', 'while n != 1:', '    n = n // 2 if n % 2 == 0 else 3 * n + 1', '    steps += 1', 'print(steps)'],
          explain: 'Follow n: halve when even, 3n + 1 when odd, until it reaches 1.',
        },
        {
          type: 'fix', text: 'Explain this to the duck: it should print the biggest number. Run it, then tap the broken line.',
          code: ['nums = [3, 9, 4]', 'best = 0', 'for n in nums:', '    if n < best:', '        best = n', 'print(best)'], bad: 3,
          options: ['    if n > best:', '    if n == best:', '    if best > n:'], answer: 0,
          explain: '"If n is SMALLER than the best so far, keep it"? Said out loud, the bug is obvious.',
        },
      ],
      learn: [{ title: 'Tracing', code: 'x | y\n3 | 5\n8 | 5\n8 | 3\n5 | 3', text: 'Play the computer: track every variable, line by line. Explaining to a duck helps too.' }],
    },
    {
      id: '31-7', title: 'Hunting by halves', bg: 'keep', npc: 'watch', mentor: 'watch', tags: ['bughunt'],
      steps: [
        { type: 'talk', who: 'watch', text: 'In a long spell, find the bug the way bisection finds a number: check the value HALFWAY through. Right there? The bug is later. Already wrong? It is earlier. Each check halves the search.' },
        { type: 'demo', text: 'The result should be 20. Check the middle.', code: ['x = 4', 'x = x * 3', 'x = x - 2', 'print("middle:", x)', 'x = x * 2', 'x = x // 1', 'print(x)'] },
        {
          type: 'predict', text: 'Which step is wrong? Find the first bad value. What will it say?', code: ['steps = [lambda v: v + 3, lambda v: v * 2, lambda v: v - 10, lambda v: v * 5]', 'v = 1', 'for i, f in enumerate(steps):', '    v = f(v)', '    print(i, v)'],
          explain: 'The value goes negative at step 2. That is where to look.',
        },
        { type: 'talk', who: 'watch', text: 'Test with SMALL and EDGE inputs too: 0, 1, an empty list, the first and last items. Bugs love edges.' },
        {
          type: 'predict', text: 'Which inputs break it? What will it say?', code: ['def last_two(items):', '    return items[-2] + items[-1]', 'for test in [[1, 2, 3], [5, 5], [7], []]:', '    try:', '        print(test, last_two(test))', '    except IndexError:', '        print(test, "breaks!")'],
          explain: 'Lists with fewer than two items break it. Testing the edges reveals that.',
        },
        {
          type: 'fix', vars: R => ({ n: R.int(4, 7) }),
          text: 'This should add up 1 to $n. Test it, then tap the broken line.',
          code: ['n = $n', 'total = 0', 'for i in range(1, n):', '    total += i', 'print(total)'], bad: 2,
          options: ['for i in range(1, n + 1):', 'for i in range(n):', 'for i in range(0, n - 1):'], answer: 0,
          explain: 'range(1, n) stops at n - 1. Off by one, again!',
        },
        {
          type: 'write', text: 'Test is_leap on the edge years and print each year with its result: 1900 (False), 2000 (True), 2024 (True), 2023 (False). Then fix is_leap so all four are right.',
          starter: ['def is_leap(y):', '    return y % 4 == 0'], keys: ['def', 'is_leap', '(y):', 'return', 'y % 4 == 0', 'and', 'y % 100 != 0', 'or', 'y % 400 == 0', '(', ')', 'for', 'y', 'in', '[', ']', '1900', '2000', '2024', '2023', ',', ':', 'print'],
          require: l => (has(l, /400/) && has(l, /for\s+y\s+in/) ? null : 'Test the four years in a loop, and fix the rule with 100 and 400.'),
          hints: ['Century years are only leap if divisible by 400.', 'return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)'],
          solution: ['def is_leap(y):', '    return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)', 'for y in [1900, 2000, 2024, 2023]:', '    print(y, is_leap(y))'],
        },
      ],
      learn: [{ title: 'Hunting bugs', code: 'check the middle → halve the search\ntest edges: 0, 1, [], first, last', text: 'Narrow down where it goes wrong, and test the edges.' }],
    },
    {
      id: '31-8', title: 'Glitch bats', bg: 'tunnel', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'glitchbat', hp: d0 + 15 + 15, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Glitch bats flicker in the tower! $HP HP. Your logged spell must reach them.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. This loop should strike twice with 15 but strikes not at all. Fix the condition.',
          lines: ['hits = 0', 'while hits [] 2:', '    cast(fireball, 15)', '    hits += 1'], chips: ['<', '>', '=='], answer: [['<']],
          goal: { foeDown: true },
          hints: ['Keep going WHILE hits is below 2.', 'while hits < 2:'],
        },
        { type: 'talk', who: 'narrator', text: 'The glitch queen only falls to a well-logged strike!' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'glitchbat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Configure logging at INFO with format "%(message)s", log "striking" as info, then cast icebolt with $p twice.',
          starter: ['import logging'], keys: ['logging.basicConfig', '(', ')', 'level=logging.INFO', ',', 'format="%(message)s"', 'logging.info', '"striking"', 'cast', 'icebolt', '$p'],
          goal: { foeDown: true },
          require: l => (has(l, /logging\.info/) ? null : 'Log the strike with logging.info.'),
          hints: ['logging.basicConfig(level=logging.INFO, format="%(message)s")', 'logging.info("striking") then cast(icebolt, $p) twice'],
          solution: ['logging.basicConfig(level=logging.INFO, format="%(message)s")', 'logging.info("striking")', 'cast(icebolt, $p)', 'cast(icebolt, $p)'],
        },
      ],
      learn: [{ title: 'Loops that never run', code: 'while hits > 2:   # never true at the start', text: 'Check your loop conditions with the starting values.' }],
    },
    {
      id: '31-9', title: 'The Bug Queen', bg: 'dungeon', foe: { kind: 'bugqueen', hp: 180, weak: 'spark', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'bugqueen', text: 'BZZZ... EVERY... SPELL... HAS... A... BUG...' },
        { type: 'talk', who: 'narrator', text: 'The Bug Queen has 180 HP. Spark fries bugs: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', text: 'Trace it carefully. How much damage? Spark is doubled.', code: ['a, b = 3, 4', 'a, b = b, a + b', 'a, b = b, a + b', 'cast(spark, a)'],
          explain: '(3, 4) → (4, 7) → (7, 11): a is 7, doubled.',
        },
        {
          type: 'fix', text: 'This should strike once for each item. Run it, then tap the broken line.',
          code: ['hive = ["drone", "drone", "guard"]', 'for i in range(len(hive) + 1):', '    print(hive[i])', 'cast(spark, 5)'], bad: 1,
          options: ['for i in range(len(hive)):', 'for i in range(1, len(hive) + 1):', 'for i in range(len(hive) - 1):'], answer: 0,
          explain: 'IndexError on the last round: the indexes only go up to len - 1.',
        },
        { type: 'talk', who: 'bugqueen', text: 'CHECK... MY... ROYAL... SEAL...' },
        {
          type: 'fill', text: 'Assert the seal is valid, then strike with spark 6.',
          lines: ['seal = "ok"', 'assert seal [] "ok", "bad seal"', 'cast(spark, 6)'], chips: ['==', '!=', '='], answer: [['==']],
          hints: ['Check that it IS ok.', 'seal == "ok"'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and spark is doubled. Assert that $HP > 0, then cast spark with $HP // 2 + 1.',
          starter: [], keys: ['assert', '$HP', '>', '0', ',', '"already gone"', 'cast', 'spark', '(', ')', '//', '2', '+', '1'],
          goal: { foeDown: true },
          require: l => (has(l, /assert\s+/) ? null : 'Start with an assert.'),
          hints: ['assert $HP > 0, "already gone"', 'cast(spark, $HP // 2 + 1)'],
          solution: ['assert $HP > 0, "already gone"', 'cast(spark, $HP // 2 + 1)'],
        },
        { type: 'talk', who: 'bugqueen', text: '...bzz... debugged...' },
      ],
      learn: [{ title: 'Watchtower toolkit', code: 'read tracebacks  print lanterns  assert  logging  trace  halve  test edges', text: 'Everything from the Watchtower.' }],
    },
  ],
};
WORLDS.push(WORLD31);

(() => {
  const { makeQ, pick, rnd, shuffle } = Arena;
  Object.assign(Arena.GEN, {
    traceback: () => {
      const c = pick(['print([1][3])', 'print(1 + "a")', 'print(x)', 'print({}["k"])', 'print(int("ten"))']);
      const right = Py.run([c]).error.type;
      const choices = shuffle([right, ...shuffle(['TypeError', 'NameError', 'IndexError', 'KeyError', 'ValueError'].filter(t => t !== right)).slice(0, 2)]);
      return { text: 'Which error will this cause?', code: [c], choices, answer: choices.indexOf(right), explain: 'It raises ' + right + '.' };
    },
    printdebug: () => makeQ(['t = 0', 'for n in [2, 3]:', '    t = n', 'print(t)'], [5, 2]),
    assertq: () => { const a = rnd(-3, 3); return makeQ([`x = ${a}`, 'assert x >= 0, "neg"', 'print("ok")'], ['neg', 'AssertionError']); },
    loggingq: () => makeQ(['import logging', 'logging.basicConfig(level=logging.WARNING, format="%(message)s")', 'logging.info("a")', 'logging.error("b")'], ['a\nb', 'a']),
    tracing: () => { const a = rnd(2, 5), b = rnd(6, 9); return makeQ([`x, y = ${a}, ${b}`, 'x = x + y', 'y = x - y', 'print(y)'], [b, a + b]); },
    bughunt: () => { const n = rnd(4, 7); return makeQ(['t = 0', `for i in range(1, ${n}):`, '    t += i', 'print(t)'], [n * (n + 1) / 2, n]); },
  });
})();
