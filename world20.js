/* World 20: The Memory Vaults. Memoization (remember answers in a dict), memo keys
   that are tuples, bottom-up tables (tabulation), grid paths, making change (greedy vs
   dynamic programming), the 0/1 knapsack, and the Act IV review boss.
   Sources: MIT 6.100L / 6.0002 (dynamic programming, knapsack). */
Object.assign(EXTRA.npcs, {
  mnemo: { name: 'Vault-keeper Mnemo', colors: ['#4a4a5a', '#e2b34a', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  vaultmimic: { base: 'mimic', name: 'Vault mimic', pal: { B: '#5a5a6a', Y: '#5fd3ff' } },
  memoryshade: { base: 'ghost', name: 'Memory shade', pal: { F: '#9a7fd6', L: '#e0d4ff' } },
  vaultwarden: { base: 'archivist', name: 'The Vault Warden', pal: { S: '#5a5a6a', G: '#5fd3ff' } },
  algosage: { base: 'sphinx', name: 'The Algorithm Sage', pal: { Y: '#e2b34a', B: '#7d4fc9' } },
});
const MEMO_FIB = ['memo = {}', 'def fib(n):', '    if n in memo:', '        return memo[n]', '    if n < 2:', '        result = n', '    else:', '        result = fib(n - 1) + fib(n - 2)', '    memo[n] = result', '    return result'];

const WORLD20 = {
  id: 20, name: 'The Memory Vaults', topic: 'memoization and dynamic programming',
  nodes: [[50, 93], [26, 84], [66, 75], [34, 66], [68, 57], [30, 48], [66, 39], [36, 29], [62, 19], [50, 7]],
  levels: [
    {
      id: '20-1', title: 'Remembered answers', bg: 'vault', npc: 'mnemo', mentor: 'mnemo', tags: ['memo'],
      steps: [
        { type: 'talk', who: 'mnemo', text: "Welcome to the Memory Vaults, {NAME}. I'm Mnemo. Down in the Spiral Depths, fib(n) worked out the same small answers over and over. Here we never forget." },
        { type: 'talk', who: 'mnemo', text: 'MEMOIZATION: keep a dictionary of answers already found. Before working anything out, look in the dict. After working it out, store it. Each answer is computed only ONCE.' },
        { type: 'demo', text: 'fib(30) instantly. Run it.', code: [...MEMO_FIB, 'print(fib(30))'] },
        {
          type: 'predict', vars: R => ({ n: R.pick([6, 8, 10]) }),
          text: 'Count the calls with a memo. What will it say?', code: ['calls = 0', 'memo = {}', 'def fib(n):', '    global calls', '    calls += 1', '    if n in memo:', '        return memo[n]', '    result = n if n < 2 else fib(n - 1) + fib(n - 2)', '    memo[n] = result', '    return result', 'fib($n)', 'print(calls)'],
          explain: 'With the memo, the calls grow in a straight line: 2 × $n - 1 = $(2 * n - 1).',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([8, 10]) }),
          text: 'Without versus with. What will it say?', code: ['slow = 0', 'def fib_slow(n):', '    global slow', '    slow += 1', '    return n if n < 2 else fib_slow(n - 1) + fib_slow(n - 2)', 'fast = 0', 'memo = {}', 'def fib_fast(n):', '    global fast', '    fast += 1', '    if n not in memo:', '        memo[n] = n if n < 2 else fib_fast(n - 1) + fib_fast(n - 2)', '    return memo[n]', 'fib_slow($n)', 'fib_fast($n)', 'print(slow, fast)'],
          explain: 'The plain version explodes exponentially; the memo version stays tiny.',
        },
        {
          type: 'fill', vars: R => ({ n: R.pick([20, 25, 30]) }),
          text: 'Store the answer before returning it.',
          lines: ['memo = {}', 'def fib(n):', '    if n in memo:', '        return memo[n]', '    result = n if n < 2 else fib(n - 1) + fib(n - 2)', '    memo[n] = []', '    return result', 'print(fib($n))'], chips: ['result', 'n', 'memo'], answer: [['result']],
          hints: ['The dict maps n to its answer.', 'memo[n] = result'],
        },
        {
          type: 'write', vars: R => ({ n: R.pick([30, 35, 40]) }),
          text: 'A frog climbs 1 or 2 steps at a time: ways(n) = ways(n - 1) + ways(n - 2), with ways(0) = ways(1) = 1. Memoize it with a dict called memo, then print ways($n).',
          starter: ['memo = {}'], keys: ['def', 'ways', '(', ')', 'n', ':', 'if', 'in', 'memo', 'return', '[', ']', '<', '2', '1', '=', '+', '-', 'print', '$n'],
          require: l => (has(l, /in\s+memo/) && has(l, /memo\s*\[\s*n\s*\]\s*=/) ? null : 'Check "n in memo" and store memo[n] = ...'),
          hints: ['if n in memo: return memo[n] / if n < 2: return 1', 'memo[n] = ways(n - 1) + ways(n - 2) / return memo[n]'],
          solution: ['def ways(n):', '    if n in memo:', '        return memo[n]', '    if n < 2:', '        return 1', '    memo[n] = ways(n - 1) + ways(n - 2)', '    return memo[n]', 'print(ways($n))'],
        },
      ],
      learn: [{ title: 'Memoization', code: 'if n in memo: return memo[n]\n... work it out ...\nmemo[n] = result', text: 'Remember every answer in a dict, so each one is computed only once.' }],
    },
    {
      id: '20-2', title: 'Keys of two parts', bg: 'vault', npc: 'mnemo', mentor: 'mnemo', tags: ['memotuple'],
      steps: [
        { type: 'talk', who: 'mnemo', text: 'When a function takes TWO arguments, its memo key is a tuple: memo[(r, c)]. Tuples can be dict keys because they never change.' },
        { type: 'talk', who: 'mnemo', text: 'A classic: how many paths cross a grid from the top-left to the bottom-right corner, only moving right or down? paths(r, c) = paths(r - 1, c) + paths(r, c - 1). A row or column of 0 has exactly 1 path.' },
        { type: 'demo', text: 'Run it.', code: ['memo = {}', 'def paths(r, c):', '    if (r, c) in memo:', '        return memo[(r, c)]', '    if r == 0 or c == 0:', '        return 1', '    memo[(r, c)] = paths(r - 1, c) + paths(r, c - 1)', '    return memo[(r, c)]', 'print(paths(2, 2), paths(10, 10))'] },
        {
          type: 'predict', vars: R => ({ r: R.int(1, 3), c: R.int(1, 3) }),
          text: 'What will it say?', code: ['memo = {}', 'def paths(r, c):', '    if (r, c) in memo:', '        return memo[(r, c)]', '    if r == 0 or c == 0:', '        return 1', '    memo[(r, c)] = paths(r - 1, c) + paths(r, c - 1)', '    return memo[(r, c)]', 'print(paths($r, $c))'],
          explain: 'Each cell adds the ways from above and from the left.',
        },
        {
          type: 'predict', vars: R => ({ r: R.int(2, 4) }),
          text: 'How many answers got stored? What will it say?', code: ['memo = {}', 'def paths(r, c):', '    if (r, c) in memo:', '        return memo[(r, c)]', '    if r == 0 or c == 0:', '        return 1', '    memo[(r, c)] = paths(r - 1, c) + paths(r, c - 1)', '    return memo[(r, c)]', 'paths($r, $r)', 'print(len(memo))'],
          explain: 'One stored answer for each inner cell: $r × $r = $(r * r).',
        },
        {
          type: 'fill', vars: R => ({ r: R.int(3, 6), c: R.int(3, 6) }),
          text: 'Use a tuple as the memo key.',
          lines: ['memo = {}', 'def paths(r, c):', '    key = []', '    if key in memo:', '        return memo[key]', '    if r == 0 or c == 0:', '        return 1', '    memo[key] = paths(r - 1, c) + paths(r, c - 1)', '    return memo[key]', 'print(paths($r, $c))'], chips: ['(r, c)', 'r + c', 'r'], answer: [['(r, c)']],
          hints: ['Both numbers matter.', 'key = (r, c)'],
        },
        {
          type: 'write', vars: R => ({ a: R.int(10, 16), b: R.int(10, 16) }),
          text: 'Memoize choose(n, k) = choose(n - 1, k - 1) + choose(n - 1, k), with choose(n, 0) = choose(n, n) = 1. Use memo[(n, k)]. Print choose($a, 5).',
          starter: ['memo = {}'], keys: ['def', 'choose', '(', ')', 'n', 'k', ',', ':', 'if', 'in', 'memo', 'return', '[', ']', '==', '0', 'or', '1', '=', '+', '-', 'print', '$a', '5'],
          require: l => (has(l, /memo\s*\[\s*\(\s*n\s*,\s*k\s*\)\s*\]/) ? null : 'Store answers in memo[(n, k)].'),
          hints: ['if (n, k) in memo: return memo[(n, k)] / if k == 0 or k == n: return 1', 'memo[(n, k)] = choose(n - 1, k - 1) + choose(n - 1, k) / return memo[(n, k)]'],
          solution: ['def choose(n, k):', '    if (n, k) in memo:', '        return memo[(n, k)]', '    if k == 0 or k == n:', '        return 1', '    memo[(n, k)] = choose(n - 1, k - 1) + choose(n - 1, k)', '    return memo[(n, k)]', 'print(choose($a, 5))'],
        },
      ],
      learn: [{ title: 'Tuple memo keys', code: 'memo[(r, c)] = ...', text: 'Functions of several arguments remember answers under a tuple key.' }],
    },
    {
      id: '20-3', title: 'From the bottom up', bg: 'archive', npc: 'mnemo', mentor: 'mnemo', tags: ['bottomup'],
      steps: [
        { type: 'talk', who: 'mnemo', text: 'Memoization works TOP-DOWN, starting from the big question. Dynamic programming can also work BOTTOM-UP: fill a table from the smallest answers to the biggest, with a plain loop and no recursion at all.' },
        { type: 'demo', text: 'Run it.', code: ['n = 10', 'table = [0, 1]', 'for i in range(2, n + 1):', '    table.append(table[i - 1] + table[i - 2])', 'print(table)'] },
        {
          type: 'predict', vars: R => ({ n: R.pick([6, 9, 12]) }),
          text: 'What will it say?', code: ['n = $n', 'table = [0, 1]', 'for i in range(2, n + 1):', '    table.append(table[-1] + table[-2])', 'print(table[n])'],
          explain: 'Each new entry is the sum of the two before it.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([7, 10, 15]) }),
          text: 'Only two numbers are ever needed. What will it say?', code: ['a, b = 0, 1', 'for i in range($n):', '    a, b = b, a + b', 'print(a)'],
          explain: 'Keep just the last two values: the same answers with almost no memory.',
        },
        {
          type: 'fill', vars: R => ({ n: R.pick([8, 11]) }),
          text: 'Fill the table: each ways count adds the two before it.',
          lines: ['n = $n', 'ways = [1, 1]', 'for i in range(2, n + 1):', '    ways.append(ways[i - 1] + ways[[]])', 'print(ways[n])'], chips: ['i - 2', 'i', 'i + 1'], answer: [['i - 2']],
          hints: ['One step or two steps back.', 'ways[i - 2]'],
        },
        {
          type: 'write', vars: R => ({ n: R.pick([10, 15, 20]) }),
          text: 'Tribonacci: each number adds the THREE before it, starting [0, 0, 1]. Build the table bottom-up and print entry $n.',
          starter: ['t = [0, 0, 1]'], keys: ['for', 'i', 'in', 'range', '(', ')', '3', '$n', '+', '1', ',', ':', 't', '.append', '[', ']', '-', '2', 'print'],
          require: l => (has(l, /for\s+i\s+in\s+range/) && !has(l, /def\s+/) ? null : 'Use a loop, no recursion.'),
          hints: ['for i in range(3, $n + 1):', '    t.append(t[i - 1] + t[i - 2] + t[i - 3]), then print(t[$n])'],
          solution: ['for i in range(3, $n + 1):', '    t.append(t[i - 1] + t[i - 2] + t[i - 3])', 'print(t[$n])'],
        },
      ],
      learn: [{ title: 'Bottom-up tables', code: 'table = [0, 1]\nfor i in range(2, n + 1):\n    table.append(table[i-1] + table[i-2])', text: 'Fill answers from smallest to biggest with a loop. No recursion needed.' }],
    },
    {
      id: '20-4', title: 'Vault mimics', bg: 'vault', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), n = R.pick([7, 8, 9]); const f = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34][n]; return { kind: 'vaultmimic', hp: d + f, d, n }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Vault mimics snap open! $HP HP. Their lock opens to a Fibonacci number.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ n: c.foe.n }),
          text: 'It has $HP HP left: fib($n). Build it bottom-up and cast fireball.',
          lines: ['a, b = 0, 1', 'for i in range($n):', '    a, b = b, []', 'cast(fireball, a)'], chips: ['a + b', 'a', 'b'], answer: [['a + b']],
          goal: { foeDown: true },
          hints: ['The next number is the sum of the last two.', 'a, b = b, a + b'],
        },
        { type: 'talk', who: 'narrator', text: 'The great mimic hides behind a grid of locks!' },
        {
          type: 'write', vars: R => { const r = R.int(2, 3), c = R.int(2, 3); const ch = (n, k) => { let x = 1; for (let i = 0; i < k; i++) x = x * (n - i) / (i + 1); return x; }; return { r, c, hp: ch(r + c, r) }; },
          spawn: v => ({ kind: 'vaultmimic', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Count the grid paths to ($r, $c) with a memo, then cast icebolt with that count.',
          starter: ['memo = {}'], keys: ['def', 'paths', '(', ')', 'r', 'c', ',', ':', 'if', 'in', 'memo', 'return', '[', ']', '==', '0', 'or', '1', '=', '+', '-', 'cast', 'icebolt', '$r', '$c'],
          goal: { foeDown: true },
          require: l => (has(l, /memo\s*\[/) ? null : 'Use the memo dict.'),
          hints: ['if (r, c) in memo: return memo[(r, c)] / if r == 0 or c == 0: return 1', 'memo[(r, c)] = paths(r - 1, c) + paths(r, c - 1) / return memo[(r, c)], then cast(icebolt, paths($r, $c))'],
          solution: ['def paths(r, c):', '    if (r, c) in memo:', '        return memo[(r, c)]', '    if r == 0 or c == 0:', '        return 1', '    memo[(r, c)] = paths(r - 1, c) + paths(r, c - 1)', '    return memo[(r, c)]', 'cast(icebolt, paths($r, $c))'],
        },
      ],
      learn: [{ title: 'Remembered power', code: 'a, b = b, a + b', text: 'Bottom-up answers are fast enough for battle.' }],
    },
    {
      id: '20-5', title: 'A table of paths', bg: 'archive', npc: 'mnemo', mentor: 'mnemo', tags: ['gridpaths'],
      steps: [
        { type: 'talk', who: 'mnemo', text: 'Grid paths, bottom-up: make a table with a 1 in every cell of the top row and left column. Every other cell is the cell above plus the cell to the left. The answer sits in the bottom-right corner.' },
        { type: 'demo', text: 'Run it.', code: ['rows, cols = 3, 4', 'grid = [[1] * cols for _ in range(rows)]', 'for r in range(1, rows):', '    for c in range(1, cols):', '        grid[r][c] = grid[r - 1][c] + grid[r][c - 1]', 'for row in grid:', '    print(row)'] },
        {
          type: 'predict', vars: R => ({ r: R.int(2, 4), c: R.int(2, 4) }),
          text: 'What will it say?', code: ['rows, cols = $r, $c', 'grid = [[1] * cols for _ in range(rows)]', 'for r in range(1, rows):', '    for c in range(1, cols):', '        grid[r][c] = grid[r - 1][c] + grid[r][c - 1]', 'print(grid[-1][-1])'],
          explain: 'The corner holds the number of paths through a $r × $c grid.',
        },
        {
          type: 'predict', text: 'A rock blocks one square (it can hold no paths). What will it say?', code: ['grid = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]', 'for r in range(1, 3):', '    for c in range(1, 3):', '        if (r, c) != (1, 1):', '            grid[r][c] = grid[r - 1][c] + grid[r][c - 1]', 'print(grid[2][2])'],
          explain: 'With the middle blocked, only the two paths around the edges remain.',
        },
        {
          type: 'fill', vars: R => ({ r: R.int(3, 5), c: R.int(3, 5) }),
          text: 'Each cell adds the cell above and the cell to the left.',
          lines: ['rows, cols = $r, $c', 'grid = [[1] * cols for _ in range(rows)]', 'for r in range(1, rows):', '    for c in range(1, cols):', '        grid[r][c] = grid[r - 1][c] + grid[r][[]]', 'print(grid[-1][-1])'], chips: ['c - 1', 'c', 'c + 1'], answer: [['c - 1']],
          hints: ['To the left means one column back.', 'grid[r][c - 1]'],
        },
        {
          type: 'write', vars: R => ({ r: R.int(4, 6), c: R.int(4, 6) }),
          text: 'Build the paths table for a $r × $c grid bottom-up and print the bottom-right corner.',
          starter: ['rows, cols = $r, $c'], keys: ['grid', '=', '[', ']', '1', '*', 'cols', 'for', '_', 'in', 'range', '(', ')', 'rows', 'r', 'c', ',', ':', '+', '-', 'print'],
          require: l => (has(l, /for\s+_\s+in\s+range/) && !has(l, /def\s+/) ? null : 'Build the grid with a comprehension and fill it with loops.'),
          hints: ['grid = [[1] * cols for _ in range(rows)]', 'nested loops from 1: grid[r][c] = grid[r - 1][c] + grid[r][c - 1], then print(grid[-1][-1])'],
          solution: ['grid = [[1] * cols for _ in range(rows)]', 'for r in range(1, rows):', '    for c in range(1, cols):', '        grid[r][c] = grid[r - 1][c] + grid[r][c - 1]', 'print(grid[-1][-1])'],
        },
      ],
      learn: [{ title: 'A 2-D table', code: 'grid[r][c] = grid[r-1][c] + grid[r][c-1]', text: 'Fill a table row by row; every cell builds on cells already filled.' }],
    },
    {
      id: '20-6', title: 'Making change', bg: 'market', npc: 'mnemo', mentor: 'mnemo', tags: ['coinchange'],
      steps: [
        { type: 'talk', who: 'mnemo', text: 'A shopkeeper must give 6 coins of change using coins worth 1, 3 and 4, with as FEW coins as possible. The GREEDY way grabs the biggest coin each time: 4 + 1 + 1 = three coins. But 3 + 3 is only two!' },
        { type: 'demo', text: 'Greedy versus dynamic programming. Run it.', code: ['coins, amount = [1, 3, 4], 6', 'left, greedy = amount, 0', 'for c in sorted(coins, reverse=True):', '    while left >= c:', '        left -= c', '        greedy += 1', 'best = [0] + [99] * amount', 'for a in range(1, amount + 1):', '    for c in coins:', '        if c <= a:', '            best[a] = min(best[a], best[a - c] + 1)', 'print(greedy, best[amount])'] },
        { type: 'talk', who: 'mnemo', text: 'The DP table best[a] holds the fewest coins for amount a. For each a, try every coin c: best[a - c] + 1 uses one c on top of the best way to make a - c.' },
        {
          type: 'predict', vars: R => ({ amt: R.pick([5, 7, 8, 10]) }),
          text: 'What will it say?', code: ['coins, amount = [1, 3, 4], $amt', 'best = [0] + [99] * amount', 'for a in range(1, amount + 1):', '    for c in coins:', '        if c <= a:', '            best[a] = min(best[a], best[a - c] + 1)', 'print(best[amount])'],
          explain: 'The fewest coins from 1, 3 and 4 that add up to $amt.',
        },
        {
          type: 'predict', text: 'The whole table. What will it say?', code: ['coins, amount = [1, 5], 7', 'best = [0] + [99] * amount', 'for a in range(1, amount + 1):', '    for c in coins:', '        if c <= a:', '            best[a] = min(best[a], best[a - c] + 1)', 'print(best)'],
          explain: 'With 1s and 5s: amounts 1 to 4 need that many 1s, 5 is one coin, 6 and 7 add 1s.',
        },
        {
          type: 'fill', vars: R => ({ amt: R.pick([6, 9, 11]) }),
          text: 'Using one coin c on top of the best way to make a - c.',
          lines: ['coins, amount = [1, 3, 4], $amt', 'best = [0] + [99] * amount', 'for a in range(1, amount + 1):', '    for c in coins:', '        if c <= a:', '            best[a] = min(best[a], best[a - c] [] 1)', 'print(best[amount])'], chips: ['+', '-', '*'], answer: [['+']],
          hints: ['One more coin.', 'best[a - c] + 1'],
        },
        {
          type: 'write', vars: R => ({ amt: R.pick([11, 12, 15]) }),
          text: 'Coins are worth 1, 5 and 6. Fill the best table for amount $amt and print the fewest coins.',
          starter: ['coins, amount = [1, 5, 6], $amt', 'best = [0] + [99] * amount'], keys: ['for', 'a', 'c', 'in', 'range', '(', ')', '1', 'amount', '+', ',', ':', 'coins', 'if', '<=', 'best', '[', ']', '=', 'min', '-', 'print'],
          require: l => (has(l, /min\s*\(/) ? null : 'Take the min of best[a] and best[a - c] + 1.'),
          hints: ['for a in range(1, amount + 1): / for c in coins: / if c <= a:', '    best[a] = min(best[a], best[a - c] + 1), then print(best[amount])'],
          solution: ['for a in range(1, amount + 1):', '    for c in coins:', '        if c <= a:', '            best[a] = min(best[a], best[a - c] + 1)', 'print(best[amount])'],
        },
      ],
      learn: [{ title: 'Greedy vs DP', code: 'best[a] = min(best[a], best[a - c] + 1)', text: 'Greedy grabs the biggest piece and can be wrong. DP tries every option and builds on smaller answers.' }],
    },
    {
      id: '20-7', title: 'The knapsack', bg: 'vault', npc: 'mnemo', mentor: 'mnemo', tags: ['knapsack'],
      steps: [
        { type: 'talk', who: 'mnemo', text: 'The famous KNAPSACK problem: your bag holds a limited weight. Each treasure has a value and a weight. Which treasures give the most value without breaking the bag?' },
        { type: 'talk', who: 'mnemo', text: 'For each item you have two choices: SKIP it, or TAKE it (if it fits). best(i, room) = the better of those two. Memoize on (i, room) and it is fast.' },
        { type: 'demo', text: 'Run it.', code: ['items = [(60, 1), (100, 2), (120, 3)]', 'memo = {}', 'def best(i, room):', '    if i == len(items):', '        return 0', '    if (i, room) in memo:', '        return memo[(i, room)]', '    value, weight = items[i]', '    answer = best(i + 1, room)', '    if weight <= room:', '        answer = max(answer, value + best(i + 1, room - weight))', '    memo[(i, room)] = answer', '    return answer', 'print(best(0, 5))'] },
        {
          type: 'predict', vars: R => ({ room: R.pick([3, 4, 6]) }),
          text: 'What will it say?', code: ['items = [(60, 1), (100, 2), (120, 3)]', 'def best(i, room):', '    if i == len(items):', '        return 0', '    value, weight = items[i]', '    answer = best(i + 1, room)', '    if weight <= room:', '        answer = max(answer, value + best(i + 1, room - weight))', '    return answer', 'print(best(0, $room))'],
          explain: 'The best total value that fits in a bag of size $room.',
        },
        {
          type: 'predict', text: 'Greedy by value fails here too. What will it say?', code: ['items = [(10, 5), (6, 3), (6, 3)]', 'room, total = 6, 0', 'for value, weight in sorted(items, reverse=True):', '    if weight <= room:', '        room -= weight', '        total += value', 'print(total)'],
          explain: 'Greedy grabs the 10 first and then nothing else fits. Taking both 6s gives 12.',
        },
        {
          type: 'fill', text: 'If you TAKE the item, you gain its value and lose its weight.',
          lines: ['items = [(5, 2), (4, 1), (7, 3)]', 'def best(i, room):', '    if i == len(items):', '        return 0', '    value, weight = items[i]', '    answer = best(i + 1, room)', '    if weight <= room:', '        answer = max(answer, value + best(i + 1, room [] weight))', '    return answer', 'print(best(0, 4))'], chips: ['-', '+', '*'], answer: [['-']],
          hints: ['Less room is left.', 'room - weight'],
        },
        {
          type: 'write', text: 'Write best(i, room) for these items (skip or take) and print best(0, 5).',
          starter: ['items = [(3, 2), (4, 3), (5, 4), (6, 5)]'], keys: ['def', 'best', '(', ')', 'i', 'room', ',', ':', 'if', '==', 'len', 'items', 'return', '0', 'value', 'weight', '=', '[', ']', 'answer', '+', '1', '<=', 'max', '-', 'print', '5'],
          require: l => (has(l, /max\s*\(/) && has(l, /best\s*\(\s*i\s*\+\s*1/) ? null : 'Compare skipping and taking with max, recursing on i + 1.'),
          hints: ['if i == len(items): return 0 / value, weight = items[i] / answer = best(i + 1, room)', 'if weight <= room: answer = max(answer, value + best(i + 1, room - weight)) / return answer'],
          solution: ['def best(i, room):', '    if i == len(items):', '        return 0', '    value, weight = items[i]', '    answer = best(i + 1, room)', '    if weight <= room:', '        answer = max(answer, value + best(i + 1, room - weight))', '    return answer', 'print(best(0, 5))'],
        },
      ],
      learn: [{ title: '0/1 knapsack', code: 'skip: best(i + 1, room)\ntake: value + best(i + 1, room - weight)', text: 'Try both choices for each item and keep the better. Memoize on (i, room).' }],
    },
    {
      id: '20-8', title: 'Memory shades', bg: 'archive', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8); return { kind: 'memoryshade', hp: d + 2 * 2, d }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Memory shades! $HP HP. They are weak to the FEWEST coins it takes to pay them.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Fewest coins (1, 3, 4) to make 6, times 2. Fill the table and cast fireball.',
          lines: ['coins, amount = [1, 3, 4], 6', 'best = [0] + [99] * amount', 'for a in range(1, amount + 1):', '    for c in coins:', '        if c <= a:', '            best[a] = [](best[a], best[a - c] + 1)', 'cast(fireball, best[amount] * 2)'], chips: ['min', 'max', 'sum'], answer: [['min']],
          goal: { foeDown: true },
          require: s => (s[0] === 'min' ? null : 'Fewest coins: keep the smaller count.'),
          hints: ['Fewest means the smallest.', 'min(best[a], best[a - c] + 1)'],
        },
        { type: 'talk', who: 'narrator', text: 'The elder shade guards a knapsack of power!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 220 / 20 }),
          spawn: v => ({ kind: 'memoryshade', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Find the best knapsack value for items [(60, 1), (100, 2), (120, 3)] with room 5, then cast icebolt with that value // 20, twice.',
          starter: ['items = [(60, 1), (100, 2), (120, 3)]'], keys: ['def', 'best', '(', ')', 'i', 'room', ',', ':', 'if', '==', 'len', 'items', 'return', '0', 'value', 'weight', '=', '[', ']', 'answer', '+', '1', '<=', 'max', '-', 'cast', 'icebolt', '//', '20', '5'],
          goal: { foeDown: true },
          require: l => (has(l, /max\s*\(/) ? null : 'Use the skip-or-take recursion with max.'),
          hints: ['best(i, room): skip = best(i + 1, room); take if it fits', 'power = best(0, 5) // 20, cast icebolt with it twice'],
          solution: ['def best(i, room):', '    if i == len(items):', '        return 0', '    value, weight = items[i]', '    answer = best(i + 1, room)', '    if weight <= room:', '        answer = max(answer, value + best(i + 1, room - weight))', '    return answer', 'power = best(0, 5) // 20', 'cast(icebolt, power)', 'cast(icebolt, power)'],
        },
      ],
      learn: [{ title: 'DP in battle', code: 'best[a] = min(...)   max(skip, take)', text: 'The fewest, the most: DP finds the best choice.' }],
    },
    {
      id: '20-9', title: 'The Vault Warden', bg: 'vault', foe: { kind: 'vaultwarden', hp: 170, weak: 'fireball', resist: 'spark' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'vaultwarden', text: 'I... REMEMBER... EVERYTHING... DO... YOU...' },
        { type: 'talk', who: 'narrator', text: 'The Vault Warden has 170 HP. Fireball melts its memory: double damage. Spark: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ n: R.pick([6, 7]) }),
          text: 'How much damage? Fireball is doubled.', code: ['a, b = 0, 1', 'for i in range($n):', '    a, b = b, a + b', 'cast(fireball, a)'],
          explain: 'fib($n) is $([0, 1, 1, 2, 3, 5, 8, 13][n]), doubled.',
        },
        {
          type: 'fix', text: 'This memo should make fib(25) fast, but it never remembers anything. Run it, then tap the broken line.',
          code: ['memo = {}', 'calls = 0', 'def fib(n):', '    global calls', '    calls += 1', '    if n in memo:', '        return memo[n]', '    result = n if n < 2 else fib(n - 1) + fib(n - 2)', '    memo[result] = n', '    return result', 'fib(12)', 'print(fib(12), calls)', 'cast(fireball, 5)'], bad: 8,
          options: ['    memo[n] = result', '    memo[n] = n', '    memo = result'], answer: 0,
          explain: 'The memo maps the QUESTION (n) to its ANSWER (result).',
        },
        { type: 'talk', who: 'vaultwarden', text: 'PAY... MY... TOLL... IN... FEW... COINS...' },
        {
          type: 'fill', text: 'Fewest coins (1, 4, 5) to make 8, cast fireball with 3 times that.',
          lines: ['coins, amount = [1, 4, 5], 8', 'best = [0] + [99] * amount', 'for a in range(1, amount + 1):', '    for c in coins:', '        if c [] a:', '            best[a] = min(best[a], best[a - c] + 1)', 'cast(fireball, best[amount] * 3)'], chips: ['<=', '>', '=='], answer: [['<=']],
          hints: ['A coin can only be used if it is not bigger than the amount.', 'if c <= a:'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and fireball is doubled. Build the bottom-up table power = [0] * ($HP // 2 + 2); then for i in range(1, len(power)): power[i] = power[i - 1] + 1. Cast fireball with power[-1].',
          starter: [], keys: ['power', '=', '[', ']', '0', '*', '(', ')', '$HP', '//', '2', '+', 'for', 'i', 'in', 'range', '1', 'len', ',', ':', '-', 'cast', 'fireball'],
          goal: { foeDown: true },
          require: l => (has(l, /for\s+i\s+in\s+range/) ? null : 'Fill the table with a loop.'),
          hints: ['power = [0] * ($HP // 2 + 2)', 'for i in range(1, len(power)): power[i] = power[i - 1] + 1, then cast(fireball, power[-1])'],
          solution: ['power = [0] * ($HP // 2 + 2)', 'for i in range(1, len(power)):', '    power[i] = power[i - 1] + 1', 'cast(fireball, power[-1])'],
        },
        { type: 'talk', who: 'vaultwarden', text: '...I... forget...' },
      ],
      learn: [{ title: 'DP toolkit', code: 'memo dict  tuple keys  tables  greedy vs DP  knapsack', text: 'Everything from the Memory Vaults.' }],
    },
    {
      id: '20-R', title: 'The Algorithm Sage', bg: 'observatory', foe: { kind: 'algosage', hp: 280 }, mentor: 'narrator', boss: true, review: true, tags: [],
      steps: [
        { type: 'talk', who: 'algosage', text: 'Twenty worlds, {NAME}. You no longer just write code. You THINK about it: how it repeats, how it searches, how fast it grows. Show me.' },
        { type: 'talk', who: 'narrator', text: 'The Act IV review! Recursion, guessing, measuring, sorting and remembering, all mixed. 280 HP. Each right answer strikes.' },
        { type: 'review', tags: ['recurbase', 'recurstack', 'factorial', 'recurlist', 'recurstr', 'recurbranch'], reward: { spell: 'spark', power: 25 }, text: 'The Spiral Depths. What will it say?' },
        { type: 'review', tags: ['guesscheck', 'enumerate2', 'approx', 'bisectint', 'bisectfloat', 'newton'], reward: { spell: 'fireball', power: 25 }, text: 'The Guessing Halls. What will it say?' },
        { type: 'review', tags: ['countsteps', 'bigo', 'linsearch', 'binsearch', 'dschoice', 'doubling'], reward: { spell: 'icebolt', power: 25 }, text: 'The Measuring Tower. What will it say?' },
        { type: 'review', tags: ['sortbasics', 'selsort', 'bubble', 'insertion', 'merge', 'mergesort'], reward: { spell: 'spark', power: 25 }, text: 'The Sorting Spire. What will it say?' },
        { type: 'review', tags: ['memo', 'memotuple', 'bottomup', 'gridpaths', 'coinchange', 'knapsack'], reward: { spell: 'fireball', power: 25 }, text: 'The Memory Vaults. What will it say?' },
        { type: 'review', tags: ['mutdefault', 'aliasing', 'truthy', 'loopmut', 'legb', 'sideeffect', 'setunion', 'zippair'], reward: { spell: 'icebolt', power: 25 }, text: 'Old traps, never forgotten. What will it say?' },
        { type: 'talk', who: 'algosage', text: 'One last proof. Sort my numbers with your own merge sort, then search them with your own binary search.' },
        {
          type: 'write', vars: (R, c) => ({ h: c.foe.hp }),
          text: 'Write msort(x) (merge sort, merging inline) and bsearch(a, t) (binary search returning the index). Then cast fireball with $h if bsearch(msort([9, 3, 7, 1]), 7) == 2, else with 1.',
          starter: [], keys: ['def', 'msort', 'bsearch', '(', ')', 'x', 'a', 't', ',', ':', 'if', 'len', '<=', '1', 'return', 'mid', '=', '//', '2', 'while', 'and', 'out', '.append', '.pop(0)', '[', ']', '+', 'low', 'high', '<', '-', 'elif', 'else', 'cast', 'fireball', '==', '$h'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+msort/) && has(l, /def\s+bsearch/) && !has(l, /sorted\s*\(|\.sort\s*\(/) ? null : 'Write both msort and bsearch yourself.'),
          hints: ['msort: split, recurse on both halves, then merge with two lists and pop(0)', 'bsearch: low, high = 0, len(a) - 1; while low <= high: mid = (low + high) // 2 ...'],
          solution: ['def msort(x):', '    if len(x) <= 1:', '        return x', '    mid = len(x) // 2', '    left, right = msort(x[:mid]), msort(x[mid:])', '    out = []', '    while left and right:', '        out.append(left.pop(0) if left[0] <= right[0] else right.pop(0))', '    return out + left + right', 'def bsearch(a, t):', '    low, high = 0, len(a) - 1', '    while low <= high:', '        mid = (low + high) // 2', '        if a[mid] == t:', '            return mid', '        elif a[mid] < t:', '            low = mid + 1', '        else:', '            high = mid - 1', '    return -1', 'cast(fireball, $h if bsearch(msort([9, 3, 7, 1]), 7) == 2 else 1)'],
        },
        { type: 'talk', who: 'algosage', text: 'You think like an algorithm-smith now. Act V awaits: you will build your own kinds of things, with classes.' },
      ],
      learn: [{ title: 'Act IV', code: 'recursion  bisection  Big-O  sorting  dynamic programming', text: 'The thinking tools of every programmer.' }],
    },
  ],
};
WORLDS.push(WORLD20);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    memo: () => { const n = pick([5, 6, 7]); return makeQ(['memo = {}', 'calls = 0', 'def f(n):', '    global calls', '    calls += 1', '    if n not in memo:', '        memo[n] = n if n < 2 else f(n - 1) + f(n - 2)', '    return memo[n]', `f(${n})`, 'print(calls)'], [[1, 1, 3, 5, 9, 15, 25, 41][n], n]); },
    memotuple: () => makeQ(['m = {}', 'm[(1, 2)] = 5', 'm[(2, 1)] = 7', 'print(m[(1, 2)], len(m))'], ['7 2', '5 1']),
    bottomup: () => { const n = rnd(5, 9); const f = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34][n]; return makeQ(['a, b = 0, 1', `for i in range(${n}):`, '    a, b = b, a + b', 'print(a)'], [[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55][n + 1], f - 1]); },
    gridpaths: () => { const r = rnd(2, 3); const c = rnd(2, 3); const ch = { '2,2': 6, '2,3': 10, '3,2': 10, '3,3': 20 }; return makeQ([`g = [[1] * ${c + 1} for _ in range(${r + 1})]`, `for i in range(1, ${r + 1}):`, `    for j in range(1, ${c + 1}):`, '        g[i][j] = g[i - 1][j] + g[i][j - 1]', 'print(g[-1][-1])'], [r * c, r + c]); },
    coinchange: () => makeQ(['coins, amt = [1, 3, 4], 6', 'b = [0] + [99] * amt', 'for a in range(1, amt + 1):', '    for c in coins:', '        if c <= a:', '            b[a] = min(b[a], b[a - c] + 1)', 'print(b[amt])'], [3, 6]),
    knapsack: () => makeQ(['items = [(5, 2), (4, 1), (7, 3)]', 'def best(i, room):', '    if i == len(items):', '        return 0', '    v, w = items[i]', '    a = best(i + 1, room)', '    if w <= room:', '        a = max(a, v + best(i + 1, room - w))', '    return a', 'print(best(0, 3))'], [16, 7]),
  });
})();
