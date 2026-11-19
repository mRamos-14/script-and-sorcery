/* World 5: Merchant Town. Lists: indexing, append/insert/pop/remove, loops, sum/max/min,
   sort/sorted, slices, item assignment, split/join, comprehensions. */
const nums = (R, n, a, b) => Array.from({ length: n }, () => R.int(a, b));
const pyList = a => '[' + a.map(x => (typeof x === 'string' ? `"${x}"` : x)).join(', ') + ']';

const WORLD5 = {
  id: 5, name: 'Merchant Town', topic: 'lists', map: 'bg-map5.jpg',
  nodes: [[50, 92], [24, 83], [72, 75], [30, 65], [70, 56], [26, 46], [68, 36], [34, 25], [50, 9]],
  levels: [
    {
      id: '5-1', title: 'The shopping list', bg: 'market', npc: 'trader', mentor: 'trader', tags: ['lists'],
      steps: [
        { type: 'talk', who: 'trader', text: "Welcome to Merchant Town, {NAME}! I'm Trader Bo. Mages carry many things, so they keep them in lists." },
        { type: 'talk', who: 'trader', text: 'A list holds many values in order, inside square brackets: ["potion", "map", "key"]. Positions start at 0, like strings.' },
        { type: 'demo', vars: R => { const [a, b, c] = R.items(3); return { a, b, c }; }, text: 'Run it and watch the list jar.', code: ['bag = ["$a", "$b", "$c"]', 'print(bag)', 'print(bag[0])', 'print(len(bag))'] },
        {
          type: 'predict', vars: R => { const [a, b, c] = R.items(3); return { a, b, c, i: R.pick([0, 1, 2, -1]) }; }, text: 'What will it say?', code: ['bag = ["$a", "$b", "$c"]', 'print(bag[$i])'],
          explain: 'Positions start at 0. -1 is the last item.',
        },
        {
          type: 'predict', vars: R => ({ x: R.int(1, 9), y: R.int(1, 9), z: R.int(1, 9) }), text: 'What will it say?', code: ['coins = [$x, $y, $z]', 'print(coins[1] + coins[2])'],
          explain: 'coins[1] is $y and coins[2] is $z.',
        },
        {
          type: 'fix', vars: R => { const [a, b, c] = R.items(3); return { a, b, c }; },
          text: 'This should print the last item, but crashes. Run it, then tap the broken line.',
          code: ['bag = ["$a", "$b", "$c"]', 'print(bag[3])'], bad: 1,
          options: ['print(bag[2])', 'print(bag[4])', 'print(bag["2"])'], answer: 0,
          explain: 'A list of 3 items has positions 0, 1 and 2.',
        },
        {
          type: 'fill', vars: R => { const [a, b, c] = R.sample(['ruby', 'opal', 'jade', 'onyx', 'pearl'], 3); return { a, b, c }; },
          text: 'Finish the gems list, then print the last gem.',
          lines: ['gems = [[], "$b", "$c"]', 'print(gems[[]])'], chips: ['"$a"', '$a', '-1', '3'], answer: [['"$a"', '-1']],
          hints: ['Text in a list needs quotes too.', '-1 is always the last position.'],
        },
        {
          type: 'write', vars: R => { const [a, b] = R.items(2); return { a, b }; },
          text: 'Make a list called pack holding "$a" and "$b", then print it.',
          starter: [], keys: ['pack', '=', '[', ']', '"$a"', '"$b"', ',', 'print', '(', ')'],
          require: l => (has(l, /pack\s*=\s*\[/) ? null : 'Make the list with pack = [...]'),
          hints: ['Items go inside [ ], separated by commas.', 'pack = ["$a", "$b"] / print(pack)'],
          solution: ['pack = ["$a", "$b"]', 'print(pack)'],
        },
      ],
      learn: [{ title: 'Lists', code: 'bag = ["map", "key"]\nbag[0]   len(bag)', text: 'An ordered collection of values. Index from 0, -1 for the last.' }],
    },
    {
      id: '5-2', title: 'Stocking shelves', bg: 'market', npc: 'trader', mentor: 'trader', tags: ['listmeth'],
      steps: [
        { type: 'talk', who: 'trader', text: 'Lists can change! append adds to the end, insert puts something at a position, pop takes the last one off, remove deletes a value.' },
        { type: 'demo', vars: R => { const [a, b, c] = R.items(3); return { a, b, c }; }, text: 'Run it.', code: ['shelf = ["$a"]', 'shelf.append("$b")', 'shelf.append("$c")', 'print(shelf)'] },
        {
          type: 'predict', vars: R => { const [a, b, c] = R.items(3); return { a, b, c }; }, text: 'What will it say?', code: ['shelf = ["$a", "$b", "$c"]', 'shelf.pop()', 'print(shelf)'],
          explain: 'pop() with no position takes the last item.',
        },
        {
          type: 'predict', vars: R => { const [a, b, c] = R.items(3); return { a, b, c }; }, text: 'What will it say?', code: ['shelf = ["$a", "$b"]', 'shelf.insert(0, "$c")', 'print(shelf)'],
          wrong: ["['$a', '$b', '$c']"],
          explain: 'insert(0, ...) puts the new item at the front.',
        },
        {
          type: 'predict', vars: R => { const [a, b, c] = R.items(3); return { a, b, c }; }, text: 'What will it say?', code: ['shelf = ["$a", "$b", "$c"]', 'shelf.remove("$b")', 'print(len(shelf), shelf[1])'],
          explain: 'remove takes "$b" out, so the list shrinks to 2 and "$c" moves into position 1.',
        },
        {
          type: 'fix', vars: R => { const [a, b] = R.items(2); return { a, b }; },
          text: 'This should add "$b" to the shelf. Run it, then tap the broken line.',
          code: ['shelf = ["$a"]', 'shelf + "$b"', 'print(shelf)'], bad: 1,
          options: ['shelf.append("$b")', 'shelf.append($b)', 'shelf = "$b"'], answer: 0,
          explain: 'A list and a string cannot be added with +. append() adds one item to the list.',
        },
        {
          type: 'write', vars: R => { const [a, b, c] = R.items(3); return { a, b, c }; },
          text: 'Add "$c" to the end of the shelf list, then print the shelf.',
          starter: ['shelf = ["$a", "$b"]'], keys: ['shelf', '.append', '(', ')', '"$c"', 'print'],
          require: l => (has(l, /append/) ? null : 'Use append().'),
          hints: ['shelf.append("$c")', 'Then print(shelf)'],
          solution: ['shelf.append("$c")', 'print(shelf)'],
        },
      ],
      learn: [{ title: 'Changing lists', code: 'append  insert  pop  remove', text: 'Lists change in place. append adds to the end, pop takes from the end.' }],
    },
    {
      id: '5-3', title: 'Looping the stalls', bg: 'market', npc: 'tailor', mentor: 'tailor', tags: ['listloop'],
      steps: [
        { type: 'talk', who: 'tailor', text: "I'm Fen the tailor. A for loop walks through a list one item at a time, just like a string." },
        { type: 'demo', vars: R => { const [a, b, c] = R.items(3); return { a, b, c }; }, text: 'Run it.', code: ['for item in ["$a", "$b", "$c"]:', '    print("Selling", item)'] },
        {
          type: 'predict', vars: R => ({ L: pyList(nums(R, 3, 2, 15)) }), text: 'What will it say?', code: ['prices = $L', 'total = 0', 'for p in prices:', '    total += p', 'print(total)'],
          explain: 'The loop adds every price into total.',
        },
        {
          type: 'predict', vars: R => ({ L: pyList(nums(R, 4, 1, 30)) }), text: 'Built-in helpers. What will it say?', code: ['prices = $L', 'print(max(prices), min(prices), sum(prices))'],
          explain: 'max finds the biggest, min the smallest, sum adds them all.',
        },
        {
          type: 'predict', vars: R => ({ L: pyList(nums(R, 4, 1, 20)), lim: R.int(6, 14) }), text: 'Counting cheap items. What will it say?', code: ['prices = $L', 'cheap = 0', 'for p in prices:', '    if p < $lim:', '        cheap += 1', 'print(cheap)'],
          explain: 'Count each price below $lim.',
        },
        {
          type: 'fill', vars: R => ({ L: pyList(nums(R, 5, 1, 20)), lim: R.int(6, 12) }),
          text: 'Print only the prices above $lim.',
          lines: ['prices = $L', 'for p in []:', '    if p [] $lim:', '        print(p)'], chips: ['prices', 'p', '>', '<'], answer: [['prices', '>']],
          hints: ['Loop through the list, check each p.', 'for p in prices: / if p > $lim:'],
        },
        {
          type: 'write', vars: R => ({ L: pyList(nums(R, 3, 3, 20)) }),
          text: 'Print the total of the prices list using sum().',
          starter: ['prices = $L'], keys: ['print', 'sum', 'prices', '(', ')'],
          require: l => (has(l, /sum\(/) ? null : 'Use sum().'),
          hints: ['sum() adds up a whole list.', 'print(sum(prices))'],
          solution: ['print(sum(prices))'],
        },
      ],
      learn: [{ title: 'Lists and loops', code: 'for p in prices:\nsum()  max()  min()', text: 'Loop through items, or let sum, max and min do the work.' }],
    },
    {
      id: '5-4', title: 'Mimics!', bg: 'alley', mentor: 'narrator', tags: [],
      foe: R => ({ kind: 'mimic', hp: R.int(40, 50) }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'A treasure chest snaps open: it is a mimic with $HP HP! Mimics take a hit from every power in your combo list.' },
        { type: 'demo', vars: R => ({ a: R.int(3, 6), b: R.int(3, 6) }), text: 'Cast a small combo.', code: ['combo = [$a, $b]', 'for p in combo:', '    cast(fireball, p)'] },
        {
          type: 'fill', vars: (R, c) => { const a = R.int(3, 6), b = R.int(3, 6); return { a, b, need: c.foe.hp - a - b }; },
          text: 'The mimic has $HP HP. Fill the combo so the loop finishes it exactly.',
          lines: ['combo = [$a, $b, []]', 'for p in combo:', '    cast(fireball, p)'], chips: ['$need', '$(need - 5)', '"$need"', '$(a + b)'], answer: [['$need']],
          goal: { foeDown: true },
          hints: ['$a + $b + ? = $HP', '$need'],
        },
        { type: 'talk', who: 'narrator', text: 'A bigger mimic lurches out of a crate!' },
        {
          type: 'write', vars: R => { const a = R.int(5, 9), b = R.int(5, 9), n = R.int(8, 14); return { a, b, n, hp: a + b + n }; },
          spawn: v => ({ kind: 'mimic', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Append $n to combo, then loop through combo casting icebolt with each power.',
          starter: ['combo = [$a, $b]'], keys: ['combo', '.append', '(', ')', '$n', 'for', 'p', 'in', ':', 'cast', 'icebolt', ','],
          goal: { foeDown: true },
          require: l => (has(l, /append/) && has(l, /for\s+\w+\s+in\s+combo/) ? null : 'Use append, then a for loop over combo.'),
          hints: ['combo.append($n) first.', 'for p in combo: / cast(icebolt, p)'],
          solution: ['combo.append($n)', 'for p in combo:', '    cast(icebolt, p)'],
        },
      ],
      learn: [{ title: 'Lists as data', code: 'for p in combo:\n    cast(fireball, p)', text: 'Store a plan in a list, then let a loop carry it out.' }],
    },
    {
      id: '5-5', title: 'Sorting the stock', bg: 'market', npc: 'trader', mentor: 'trader', tags: ['sort'],
      steps: [
        { type: 'talk', who: 'trader', text: 'Customers like things in order. list.sort() changes the list itself. sorted(list) gives you a new sorted list. reverse=True flips the order.' },
        { type: 'demo', vars: R => ({ L: pyList(nums(R, 4, 1, 50)) }), text: 'Run it.', code: ['stock = $L', 'stock.sort()', 'print(stock)'] },
        {
          type: 'predict', vars: R => ({ L: pyList(nums(R, 3, 1, 50)) }), text: 'What will it say?', code: ['stock = $L', 'print(sorted(stock, reverse=True))'],
          explain: 'reverse=True sorts from biggest to smallest.',
        },
        {
          type: 'predict', vars: R => { const a = nums(R, 3, 1, 50); return { L: pyList(a), S: pyList(a.slice().sort((x, y) => x - y)) }; }, text: 'A classic trap. What will it say?', code: ['stock = $L', 'result = stock.sort()', 'print(result)'],
          wrong: ['$S'],
          explain: 'sort() changes the list in place and returns None. Use sorted() if you want a new list back.',
        },
        {
          type: 'predict', vars: R => { const [a, b, c] = R.items(3); return { a, b, c: R.pick([a, c]) }; }, text: 'What will it say?', code: ['bag = ["$a", "$b"]', 'print("$c" in bag)'],
          explain: 'in checks whether the value is somewhere in the list.',
        },
        {
          type: 'fix', vars: R => { const [x, y, z] = R.sample(Engine.NAMES, 3); return { x, y, z }; },
          text: 'This should print the names in order, but prints None. Run it, then tap the broken line.',
          code: ['names = ["$x", "$y", "$z"]', 'names = names.sort()', 'print(names)'], bad: 1,
          options: ['names.sort()', 'names = names.sort', 'names.sort(reverse=True)'], answer: 0,
          explain: 'sort() returns None, so names = names.sort() throws the list away. Just call names.sort().',
        },
        {
          type: 'write', vars: R => ({ L: pyList(nums(R, 4, 1, 99)) }),
          text: 'Print the scores from highest to lowest.',
          starter: ['scores = $L'], keys: ['print', 'sorted', 'scores', ',', 'reverse', '=', 'True', '(', ')'],
          require: l => (has(l, /sort/) ? null : 'Use sorted() or sort().'),
          hints: ['sorted(scores, reverse=True)', 'print(sorted(scores, reverse=True))'],
          solution: ['print(sorted(scores, reverse=True))'],
        },
      ],
      learn: [{ title: 'Sorting', code: 'nums.sort()   sorted(nums, reverse=True)', text: 'sort() changes the list and returns None. sorted() returns a new list.' }],
    },
    {
      id: '5-6', title: 'Slices of bread', bg: 'market', npc: 'tailor', mentor: 'tailor', tags: ['listslice'],
      steps: [
        { type: 'talk', who: 'tailor', text: 'Slices work on lists too. You can also change one item by its position. Strings cannot do that.' },
        { type: 'demo', vars: R => { const [a, b, c, d, e] = R.items(5); return { a, b, c, d, e }; }, text: 'Run it.', code: ['loaves = ["$a", "$b", "$c", "$d"]', 'print(loaves[1:3])', 'loaves[0] = "$e"', 'print(loaves)'] },
        {
          type: 'predict', vars: R => { const i = R.int(0, 2); return { i, j: i + R.int(1, 3) }; }, text: 'What will it say?', code: ['nums = [10, 20, 30, 40, 50]', 'print(nums[$i:$j])'],
          explain: 'From position $i up to, but not including, $j.',
        },
        {
          type: 'predict', vars: R => ({ i: R.int(0, 2), v: R.int(1, 9) }), text: 'What will it say?', code: ['row = [0, 0, 0]', 'row[$i] = $v', 'print(row)'],
          explain: 'Assigning to a position replaces that one item.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 9) }), text: 'Two names, one list. What will it say?', code: ['a = [1, 2]', 'b = a', 'b.append($n)', 'print(a)'],
          wrong: ['[1, 2]'],
          explain: 'b = a does not copy the list. Both names point to the same list, so a sees the change.',
        },
        {
          type: 'fix', vars: R => ({ w: R.pick(['bread', 'bagel', 'scone']) }),
          text: 'Strings cannot be changed in place. Run it, then tap the broken line.',
          code: ['word = "$w"', 'word[0] = "X"', 'print(word)'], bad: 1,
          options: ['word = "X" + word[1:]', 'word[0] == "X"', 'word.replace(0, "X")'], answer: 0,
          explain: 'Build a new string instead: "X" plus everything after position 0.',
        },
        {
          type: 'write', vars: R => { const [a, b, c, e] = R.items(4); return { a, b, c, e }; },
          text: 'Change the middle item of row to "$e", then print row.',
          starter: ['row = ["$a", "$b", "$c"]'], keys: ['row', '[', ']', '1', '=', '"$e"', 'print', '(', ')'],
          require: l => (has(l, /row\[\s*1\s*\]\s*=/) ? null : 'Assign to row[1].'),
          hints: ['The middle of 3 items is position 1.', 'row[1] = "$e" / print(row)'],
          solution: ['row[1] = "$e"', 'print(row)'],
        },
      ],
      learn: [{ title: 'Slices and assignment', code: 'nums[1:3]   nums[0] = 5', text: 'Lists can be sliced and changed in place. Two names can point to the same list.' }],
    },
    {
      id: '5-7', title: 'Quick lists', bg: 'market', npc: 'trader', mentor: 'trader', tags: ['comp'],
      steps: [
        { type: 'talk', who: 'trader', text: 'Two shortcuts. split() breaks a string into a list. A list comprehension builds a new list in one line: [x * 2 for x in nums].' },
        { type: 'demo', vars: R => { const [a, b, c] = R.items(3); return { a, b, c }; }, text: 'Run it.', code: ['words = "$a $b $c".split()', 'print(words)', 'print([w.upper() for w in words])'] },
        {
          type: 'predict', vars: R => { const [a, b, c] = R.items(3); return { a, b, c }; }, text: 'What will it say?', code: ['print("$a,$b,$c".split(","))'],
          explain: 'split(",") cuts the string at every comma.',
        },
        {
          type: 'predict', vars: R => ({ k: R.int(2, 5) }), text: 'What will it say?', code: ['nums = [1, 2, 3, 4]', 'print([n * $k for n in nums])'],
          explain: 'Each n becomes n * $k.',
        },
        {
          type: 'predict', vars: R => ({ L: pyList(nums(R, 5, 1, 20)), lim: R.int(6, 12) }), text: 'With a filter. What will it say?', code: ['nums = $L', 'print([n for n in nums if n > $lim])'],
          explain: 'Only items that pass the if are kept.',
        },
        {
          type: 'predict', vars: R => { const [a, b, c] = R.items(3); return { a, b, c, s: R.pick(['-', ', ', ' + ']) }; }, text: 'Joining. What will it say?', code: ['print("$s".join(["$a", "$b", "$c"]))'],
          explain: 'join puts the separator between the items.',
        },
        {
          type: 'write', vars: R => ({ n: R.int(3, 6) }),
          text: 'Use a list comprehension to make the squares of 1 to $n, and print the list.',
          starter: [], keys: ['print', '[', ']', 'n', '*', 'for', 'in', 'range', '(', ')', ',', '1', '$(n + 1)'],
          require: l => (has(l, /\[.*for.*in.*\]/) ? null : 'Use a list comprehension: [... for n in ...]'),
          hints: ['n * n for n in range(1, $(n + 1))', 'print([n * n for n in range(1, $(n + 1))])'],
          solution: ['print([n * n for n in range(1, $(n + 1))])'],
        },
      ],
      learn: [
        { title: 'split and join', code: '"a b".split()   "-".join(lst)', text: 'Turn text into a list and back again.' },
        { title: 'Comprehensions', code: '[n * 2 for n in nums if n > 0]', text: 'Build a new list from another in one line, with an optional filter.' },
      ],
    },
    {
      id: '5-8', title: 'Goblin thieves', bg: 'alley', mentor: 'narrator', tags: [],
      foe: R => { const i = R.int(0, 2), sp = ['fireball', 'icebolt', 'spark'][i], p = R.int(10, 15); return { kind: 'goblin', hp: 2 * p, weak: sp, i, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Goblin thieves grab at your bag! Check the weak tag, then pick that spell from your spell list.' },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p, i: c.foe.i }),
          text: 'The goblin has $HP HP. Pick the right position in the spells list.',
          lines: ['spells = [fireball, icebolt, spark]', 'cast(spells[[]], $p)'], chips: ['0', '1', '2', '3'], answer: [['$i']],
          goal: { foeDown: true },
          hints: ['fireball is 0, icebolt is 1, spark is 2.', 'Use the weak spell.'],
        },
        { type: 'talk', who: 'narrator', text: 'The goblin boss of the alley jumps in!' },
        {
          type: 'write', vars: R => { const L = nums(R, 5, 2, 14), lim = R.int(5, 8); return { L: pyList(L), lim, hp: L.filter(x => x >= lim).reduce((a, b) => a + b, 0) || 1 }; },
          spawn: v => ({ kind: 'goblin', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Loop through powers and cast spark with each, but skip any power below $lim using continue.',
          starter: ['powers = $L'], keys: ['for', 'p', 'in', 'powers', ':', 'if', '<', '$lim', 'continue', 'cast', 'spark', '(', ')', ','],
          goal: { foeDown: true },
          require: l => (has(l, /continue/) ? null : 'Use continue to skip the weak powers.'),
          hints: ['if p < $lim: / continue', 'Then cast(spark, p) at the same level as the if.'],
          solution: ['for p in powers:', '    if p < $lim:', '        continue', '    cast(spark, p)'],
        },
      ],
      learn: [{ title: 'Lists of anything', code: 'spells = [fireball, icebolt, spark]', text: 'Lists can hold any values, even spells. Pick one by position.' }],
    },
    {
      id: '5-9', title: 'The Goblin King', bg: 'vault', foe: { kind: 'goblinking', hp: 150, weak: 'spark', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'goblinking', text: 'MINE! ALL THE GOLD IS MINE! Count it if you can, little mage!' },
        { type: 'talk', who: 'narrator', text: 'The Goblin King has 150 HP. Spark does double damage, icebolt only half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ L: pyList(nums(R, 3, 10, 20)) }),
          text: 'How much damage will this deal? Remember spark is doubled.', code: ['gold = $L', 'cast(spark, max(gold))'],
          explain: 'max picks the biggest, then spark doubles it.',
        },
        {
          type: 'fix', vars: R => ({ L: pyList(nums(R, 3, 10, 20)) }),
          text: 'This should add up the loot, but only keeps the last coin. Run it, then tap the broken line.',
          code: ['loot = $L', 'total = 0', 'for coin in loot:', '    total = coin', 'print(total)', 'cast(icebolt, total)'], bad: 3,
          options: ['    total += coin', '    total = total', '    coin += total'], answer: 0,
          explain: 'total = coin replaces the total every round. += adds to it.',
        },
        { type: 'talk', who: 'goblinking', text: 'NO! NOT MY BIG COINS!' },
        {
          type: 'fill', vars: R => { const L = nums(R, 5, 2, 9); return { L: pyList(L), lim: Math.min(...L) }; },
          text: 'Keep only the coins bigger than $lim, print them, and cast spark with their sum.',
          lines: ['coins = $L', 'big = [c for c in coins if c [] $lim]', 'print(big)', 'cast(spark, sum(big))'], chips: ['>', '<', '=='], answer: [['>']],
          hints: ['Bigger than means >.', 'if c > $lim'],
        },
        {
          type: 'write', vars: (R, c) => { const a = R.int(4, 8), b = R.int(4, 8); return { a, b, x: Math.max(1, Math.ceil(c.foe.hp / 2) - a - b) }; },
          text: 'Final blow! $HP HP left. Append $x to power, then cast spark with sum(power).',
          starter: ['power = [$a, $b]'], keys: ['power', '.append', '(', ')', '$x', 'cast', 'spark', 'sum', ','],
          goal: { foeDown: true },
          require: l => (has(l, /append/) && has(l, /sum\(\s*power\s*\)/) ? null : 'Append first, then cast with sum(power).'),
          hints: ['power.append($x)', 'cast(spark, sum(power))'],
          solution: ['power.append($x)', 'cast(spark, sum(power))'],
        },
        { type: 'talk', who: 'goblinking', text: 'Fine... FINE! Take a coin. Just one!' },
      ],
      learn: [{ title: 'List toolkit', code: 'append  sum  max  sorted  [x for x in ...]', text: 'Lists store, change, loop, sort and build. You will use them everywhere.' }],
    },
  ],
};
WORLDS.push(WORLD5);
