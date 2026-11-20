/* World 18: The Measuring Tower. How fast is a program? Counting steps, orders of
   growth and Big-O, what happens when the input doubles, linear search, binary search,
   and choosing the right data structure (list vs set). Source: MIT 6.100L lectures 21-23. */
Object.assign(EXTRA.npcs, {
  quill2: { name: 'Measurer Tamsin', colors: ['#7d4fc9', '#2b2433', '#fbd9b8'] },
});
Object.assign(EXTRA.foes, {
  tickbot: { base: 'gearbot', name: 'Tick bot', pal: { S: '#b08a3a', Y: '#5fd3ff' } },
  sandglass: { base: 'ghost', name: 'Sandglass spirit', pal: { F: '#e2c890', L: '#fff1d0' } },
  timekeeper: { base: 'clockking', name: 'The Time Keeper' },
});

const WORLD18 = {
  id: 18, name: 'The Measuring Tower', topic: 'efficiency, Big-O and searching',
  nodes: [[50, 92], [28, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [38, 21], [52, 8]],
  levels: [
    {
      id: '18-1', title: 'Counting steps', bg: 'clocktower', npc: 'quill2', mentor: 'quill2', tags: ['countsteps'],
      steps: [
        { type: 'talk', who: 'quill2', text: "Welcome to the Measuring Tower, {NAME}. I'm Tamsin. How fast is a program? Seconds depend on the computer, so we measure something better: how many STEPS it takes as the input grows." },
        { type: 'demo', text: 'Run it: one loop, then two loops inside each other.', code: ['n = 10', 'steps = 0', 'for i in range(n):', '    steps += 1', 'print("one loop:", steps)', 'steps = 0', 'for i in range(n):', '    for j in range(n):', '        steps += 1', 'print("nested:", steps)'] },
        {
          type: 'predict', vars: R => ({ n: R.pick([5, 8, 12, 20]) }),
          text: 'What will it say?', code: ['n = $n', 'steps = 0', 'for i in range(n):', '    steps += 1', 'for j in range(n):', '    steps += 1', 'print(steps)'],
          explain: 'Two loops one AFTER the other: n + n = $(2 * n).',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([3, 4, 6, 7]) }),
          text: 'What will it say?', code: ['n = $n', 'steps = 0', 'for i in range(n):', '    for j in range(n):', '        steps += 1', 'print(steps)'],
          explain: 'A loop INSIDE a loop: n × n = $(n * n).',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([8, 32, 64, 1024]) }),
          text: 'Halving. What will it say?', code: ['n = $n', 'steps = 0', 'while n > 1:', '    n = n // 2', '    steps += 1', 'print(steps)'],
          explain: 'Halving $n down to 1 takes only $(Math.log2(n)) steps.',
        },
        {
          type: 'fill', vars: R => ({ n: R.pick([4, 5, 6]) }),
          text: 'Count every time the INNER line runs.',
          lines: ['n = $n', 'steps = 0', 'for i in range(n):', '    for j in range(n):', '        steps [] 1', 'print(steps)'], chips: ['+=', '=', '-='], answer: [['+=']],
          hints: ['Add one each time.', 'steps += 1'],
        },
        {
          type: 'write', vars: R => ({ n: R.pick([4, 5, 6, 8]) }),
          text: 'The inner loop only goes up to i. Count how many times its body runs for n = $n and print the count.',
          starter: ['n = $n', 'steps = 0'], keys: ['for', 'i', 'j', 'in', 'range', '(', ')', 'n', ':', 'steps', '+=', '1', 'print'],
          require: l => (has(l, /range\s*\(\s*i\s*\)/) ? null : 'The inner loop is range(i).'),
          hints: ['for i in range(n): / for j in range(i): / steps += 1', 'print(steps)'],
          solution: ['for i in range(n):', '    for j in range(i):', '        steps += 1', 'print(steps)'],
        },
      ],
      learn: [{ title: 'Counting steps', code: 'loop then loop  → n + n\nloop in a loop  → n × n\nhalving         → log₂ n', text: 'Measure work by counting steps as the input size n grows.' }],
    },
    {
      id: '18-2', title: 'Orders of growth', bg: 'clocktower', npc: 'quill2', mentor: 'quill2', tags: ['bigo'],
      steps: [
        { type: 'talk', who: 'quill2', text: 'Big-O names how the step count GROWS. O(1): constant, the same however big n is. O(log n): halving. O(n): one pass over the data. O(n²): a loop inside a loop.' },
        { type: 'talk', who: 'quill2', text: 'Big-O keeps only the fastest-growing part and drops constants. 3n + 5 steps is O(n). n² + n is O(n²). When n is huge, the rest does not matter.' },
        { type: 'predict', shell: true, text: 'What is the Big-O of this function?', code: ['def first(items):', '    return items[0]'], choices: ['O(1)', 'O(n)', 'O(n²)'], answer: 0, explain: 'One step, no matter how long the list is: constant time.' },
        { type: 'predict', shell: true, text: 'What is the Big-O?', code: ['def total(items):', '    t = 0', '    for x in items:', '        t += x', '    return t'], choices: ['O(n)', 'O(1)', 'O(n²)'], answer: 0, explain: 'One pass over n items: linear.' },
        { type: 'predict', shell: true, text: 'What is the Big-O?', code: ['def pairs(items):', '    for a in items:', '        for b in items:', '            print(a, b)'], choices: ['O(n²)', 'O(n)', 'O(2n)'], answer: 0, explain: 'For each of n items, another n: quadratic.' },
        { type: 'predict', shell: true, text: 'What is the Big-O?', code: ['def halvings(n):', '    count = 0', '    while n > 1:', '        n = n // 2', '        count += 1', '    return count'], choices: ['O(log n)', 'O(n)', 'O(1)'], answer: 0, explain: 'Halving each time: logarithmic.' },
        { type: 'predict', shell: true, text: 'A program takes 5n² + 300n + 9 steps. What is its Big-O?', code: ['steps = 5n² + 300n + 9'], choices: ['O(n²)', 'O(n)', 'O(5n² + 300n)'], answer: 0, explain: 'Keep the fastest-growing term and drop the constant: O(n²).' },
        {
          type: 'predict', vars: R => ({ n: R.pick([10, 100]) }),
          text: 'Feel the difference. What will it say?', code: ['n = $n', 'print(n, n * n)'],
          explain: 'At n = $n, a linear program takes about $n steps but a quadratic one takes $(n * n).',
        },
      ],
      learn: [{ title: 'Big-O', code: 'O(1) < O(log n) < O(n) < O(n log n) < O(n²)', text: 'How the work grows with n. Keep the biggest term, drop constants.' }],
    },
    {
      id: '18-3', title: 'Searching every shelf', bg: 'library', npc: 'quill2', mentor: 'quill2', tags: ['linsearch'],
      steps: [
        { type: 'talk', who: 'quill2', text: 'Linear search: look at each item in turn until you find the target. If it is last, or missing, you check them ALL: O(n). Python\'s "x in some_list" does exactly this.' },
        { type: 'demo', text: 'Run it.', code: ['def find(items, target):', '    for i, x in enumerate(items):', '        if x == target:', '            return i', '    return -1', 'shelf = ["rope", "lamp", "map", "salt"]', 'print(find(shelf, "map"), find(shelf, "axe"))'] },
        {
          type: 'predict', vars: R => ({ l: R.shuffle([3, 8, 1, 9, 4, 7]), t: R.pick([3, 8, 1, 9, 4, 7, 5]) }),
          text: 'How many comparisons? What will it say?', code: ['nums = $(JSON.stringify(l))', 'checks = 0', 'for x in nums:', '    checks += 1', '    if x == $t:', '        break', 'print(checks)'],
          explain: 'It checks items one by one until it finds $t, or reaches the end.',
        },
        {
          type: 'fill', vars: R => ({ l: R.shuffle([3, 8, 1, 9, 4]), t: R.pick([8, 9, 4]) }),
          text: 'Return the position of the target, or -1 if it is missing.',
          lines: ['def find(items, target):', '    for i in range(len(items)):', '        if items[i] == target:', '            return []', '    return -1', 'print(find($(JSON.stringify(l)), $t))'], chips: ['i', 'target', 'items[i]'], answer: [['i']],
          hints: ['The position is the index.', 'return i'],
        },
        {
          type: 'fix', vars: R => { const l = R.shuffle([3, 8, 1, 9, 4]); if (l[0] === 9) l.push(l.shift()); return { l }; },
          text: 'find should report -1 only after checking EVERY item. Run it, then tap the broken line.',
          code: ['def find(items, target):', '    for i, x in enumerate(items):', '        if x == target:', '            return i', '        return -1', 'print(find($(JSON.stringify(l)), 9))'], bad: 4,
          options: ['    return -1', '        return i', '        print(-1)'], answer: 0,
          explain: 'Return -1 after the loop ends, not inside it, or only the first item is ever checked.',
        },
        {
          type: 'write', vars: R => ({ l: R.shuffle([12, 5, 31, 7, 18, 2]) }),
          text: 'Write count_less(items, limit) that RETURNS how many items are smaller than limit, checking each once. Print count_less(nums, 10).',
          starter: ['nums = $(JSON.stringify(l))'], keys: ['def', 'count_less', '(', ')', 'items', 'limit', ',', ':', 'n', '=', '0', 'for', 'x', 'in', 'if', '<', '+=', '1', 'return', 'print', 'nums', '10'],
          require: l => (has(l, /for\s+\w+\s+in\s+items/) ? null : 'Loop over items once.'),
          hints: ['n = 0 / for x in items: / if x < limit: n += 1', 'return n, then print(count_less(nums, 10))'],
          solution: ['def count_less(items, limit):', '    n = 0', '    for x in items:', '        if x < limit:', '            n += 1', '    return n', 'print(count_less(nums, 10))'],
        },
      ],
      learn: [{ title: 'Linear search', code: 'for i, x in enumerate(items):\n    if x == target: return i\nreturn -1', text: 'Check each item in turn: O(n). "x in list" works this way.' }],
    },
    {
      id: '18-4', title: 'Tick bots', bg: 'gearworks', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), n = R.pick([4, 5, 6]); return { kind: 'tickbot', hp: d + n * n, d, n }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Tick bots! $HP HP. Every step they count makes them weaker. Count the steps of a nested loop and strike with that number.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ n: c.foe.n }),
          text: 'It has $HP HP left: n × n for n = $n. Count the steps of a loop inside a loop.',
          lines: ['n = $n', 'steps = 0', 'for i in range(n):', '    for j in range([]):', '        steps += 1', 'cast(fireball, steps)'], chips: ['n', 'i', '1'], answer: [['n']],
          goal: { foeDown: true },
          hints: ['Both loops run n times.', 'range(n)'],
        },
        { type: 'talk', who: 'narrator', text: 'The foreman bot logs every halving!' },
        {
          type: 'write', vars: R => { const k = R.int(5, 8); return { k, n: 2 ** k, hp: 2 * k }; },
          spawn: v => ({ kind: 'tickbot', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Count how many times $n can be halved down to 1, then cast icebolt with that count, twice.',
          starter: ['n = $n', 'count = 0'], keys: ['while', 'n', '>', '1', ':', '//', '2', '=', 'count', '+=', 'cast', 'icebolt', '(', ')', ','],
          goal: { foeDown: true },
          require: l => (has(l, /\/\/\s*2/) ? null : 'Halve with // 2.'),
          hints: ['while n > 1: / n = n // 2 / count += 1', 'cast(icebolt, count) twice'],
          solution: ['while n > 1:', '    n = n // 2', '    count += 1', 'cast(icebolt, count)', 'cast(icebolt, count)'],
        },
      ],
      learn: [{ title: 'Steps as power', code: 'n × n  vs  log₂ n', text: 'Nested loops grow fast; halving grows slowly.' }],
    },
    {
      id: '18-5', title: 'The sorted shelf', bg: 'library', npc: 'quill2', mentor: 'quill2', tags: ['binsearch'],
      steps: [
        { type: 'talk', who: 'quill2', text: 'If a list is SORTED, we can do far better: binary search. Look at the middle item. Target smaller? It must be in the left half. Bigger? Right half. O(log n): a million items take only about 20 looks.' },
        { type: 'demo', text: 'Run it.', code: ['def bsearch(items, target):', '    low, high = 0, len(items) - 1', '    while low <= high:', '        mid = (low + high) // 2', '        if items[mid] == target:', '            return mid', '        elif items[mid] < target:', '            low = mid + 1', '        else:', '            high = mid - 1', '    return -1', 'nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]', 'print(bsearch(nums, 23), bsearch(nums, 7))'] },
        {
          type: 'predict', vars: R => ({ t: R.pick([2, 12, 56, 91, 23]) }),
          text: 'Which indexes does it look at? What will it say?', code: ['nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]', 'low, high = 0, 9', 'while low <= high:', '    mid = (low + high) // 2', '    print(mid)', '    if nums[mid] == $t:', '        break', '    elif nums[mid] < $t:', '        low = mid + 1', '    else:', '        high = mid - 1'],
          explain: 'Each look halves what is left, closing in on $t.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([1000, 1000000]) }),
          text: 'Worst case looks for each method. What will it say?', code: ['n = $n', 'looks = 0', 'size = n', 'while size >= 1:', '    size = size // 2', '    looks += 1', 'print(n, looks)'],
          explain: 'Linear search may need $n looks. Binary search needs only about $(Math.floor(Math.log2(n)) + 1).',
        },
        {
          type: 'fill', text: 'If the middle item is too SMALL, the target is in the right half.',
          lines: ['nums = [3, 9, 14, 20, 27, 31]', 'low, high = 0, 5', 'while low <= high:', '    mid = (low + high) // 2', '    if nums[mid] == 27:', '        print(mid)', '        break', '    elif nums[mid] < 27:', '        [] = mid + 1', '    else:', '        high = mid - 1'], chips: ['low', 'high', 'mid'], answer: [['low']],
          hints: ['Move the left edge past mid.', 'low = mid + 1'],
        },
        {
          type: 'fix', text: 'Binary search only works on SORTED lists. This one cannot find 9. Run it, then tap the broken line.',
          code: ['nums = [14, 3, 27, 9, 20]', 'low, high = 0, len(nums) - 1', 'found = False', 'while low <= high:', '    mid = (low + high) // 2', '    if nums[mid] == 9:', '        found = True', '        break', '    elif nums[mid] < 9:', '        low = mid + 1', '    else:', '        high = mid - 1', 'print(found)'], bad: 0,
          options: ['nums = sorted([14, 3, 27, 9, 20])', 'nums = [14, 3, 27, 9, 20][::-1]', 'nums = list({14, 3, 27, 9, 20})[:4]'], answer: 0,
          explain: 'Sort the list first; binary search relies on the order.',
        },
        {
          type: 'write', vars: R => ({ t: R.pick([5, 16, 38, 72]) }),
          text: 'Write bsearch(items, target) that RETURNS the index of target in a sorted list, or -1. Print bsearch(nums, $t).',
          starter: ['nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]'], keys: ['def', 'bsearch', '(', ')', 'items', 'target', ',', ':', 'low', 'high', 'mid', '=', '0', 'len', '-', '1', 'while', '<=', '//', '2', 'if', '[', ']', '==', 'return', 'elif', '<', '+', 'else', 'print', 'nums', '$t'],
          require: l => (has(l, /\/\/\s*2/) && has(l, /while\s+/) ? null : 'Use mid = (low + high) // 2 in a while loop.'),
          hints: ['low, high = 0, len(items) - 1 / while low <= high: / mid = (low + high) // 2', 'if items[mid] == target: return mid / elif items[mid] < target: low = mid + 1 / else: high = mid - 1 / after the loop: return -1'],
          solution: ['def bsearch(items, target):', '    low, high = 0, len(items) - 1', '    while low <= high:', '        mid = (low + high) // 2', '        if items[mid] == target:', '            return mid', '        elif items[mid] < target:', '            low = mid + 1', '        else:', '            high = mid - 1', '    return -1', 'print(bsearch(nums, $t))'],
        },
      ],
      learn: [{ title: 'Binary search', code: 'mid = (low + high) // 2\ntoo small → low = mid + 1\ntoo big   → high = mid - 1', text: 'Only on sorted lists. O(log n): about 20 looks for a million items.' }],
    },
    {
      id: '18-6', title: 'The right tool', bg: 'clocktower', npc: 'quill2', mentor: 'quill2', tags: ['dschoice'],
      steps: [
        { type: 'talk', who: 'quill2', text: 'Choosing the right container changes the Big-O. "x in a_list" checks items one by one: O(n). "x in a_set" or "key in a_dict" jumps straight there: O(1) on average.' },
        { type: 'predict', shell: true, text: 'You check whether each of 10,000 visitors is on a list of 10,000 banned names. Which container should the banned names live in?', code: ['banned = ...', 'for v in visitors:', '    if v in banned: ...'], choices: ['a set: each check is O(1)', 'a list: each check is O(1)', 'a string with all the names'], answer: 0, explain: 'With a list that is 10,000 × 10,000 checks. With a set, about 10,000.' },
        { type: 'predict', shell: true, text: 'What is the Big-O of finding duplicates this way?', code: ['for i in range(len(a)):', '    for j in range(i + 1, len(a)):', '        if a[i] == a[j]:', '            print("dup")'], choices: ['O(n²)', 'O(n)', 'O(log n)'], answer: 0, explain: 'Every pair is compared: quadratic.' },
        {
          type: 'predict', vars: R => ({ l: R.pick([[3, 1, 4, 1, 5], [2, 7, 1, 8, 2], [9, 9, 2, 6, 5]]) }),
          text: 'The O(n) way with a set. What will it say?', code: ['seen = set()', 'for x in $(JSON.stringify(l)):', '    if x in seen:', '        print("dup", x)', '    seen.add(x)'],
          explain: 'One pass: each check and add on a set is O(1).',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([4, 5]) }),
          text: 'Count the comparisons of the nested way. What will it say?', code: ['n = $n', 'checks = 0', 'for i in range(n):', '    for j in range(i + 1, n):', '        checks += 1', 'print(checks)'],
          explain: 'n × (n - 1) / 2 = $(n * (n - 1) / 2) pairs, still O(n²).',
        },
        {
          type: 'fill', vars: R => ({ w: R.pick(['ruby', 'opal', 'jade']) }),
          text: 'Make the lookups fast: store the treasure names in a set.',
          lines: ['vault = [](["ruby", "opal", "gold", "jade"])', 'print("$w" in vault)'], chips: ['set', 'list', 'str'], answer: [['set']],
          require: s => (s[0] === 'set' ? null : 'That works, but a set makes every lookup O(1).'),
          hints: ['Sets check membership in one jump.', 'set([...])'],
        },
        {
          type: 'write', vars: R => ({ l: R.pick([[4, 2, 7, 2, 9], [1, 5, 3, 5, 8], [6, 6, 1, 4, 2]]) }),
          text: 'Print True if nums has any duplicate, in O(n): compare len(nums) with len(set(nums)).',
          starter: ['nums = $(JSON.stringify(l))'], keys: ['print', '(', ')', 'len', 'set', 'nums', '!='],
          require: l => (has(l, /set\s*\(\s*nums\s*\)/) ? null : 'Use set(nums).'),
          hints: ['A set drops duplicates, so it is shorter if there were any.', 'print(len(nums) != len(set(nums)))'],
          solution: ['print(len(nums) != len(set(nums)))'],
        },
      ],
      learn: [{ title: 'Choosing containers', code: 'x in list  → O(n)\nx in set   → O(1)\nkey in dict → O(1)', text: 'The right data structure can turn O(n²) into O(n).' }],
    },
    {
      id: '18-7', title: 'Double the input', bg: 'clocktower', npc: 'quill2', mentor: 'quill2', tags: ['doubling'],
      steps: [
        { type: 'talk', who: 'quill2', text: 'A great way to feel Big-O: DOUBLE n and see what happens. O(n) work doubles. O(n²) work becomes FOUR times bigger. O(log n) work grows by just ONE step.' },
        { type: 'demo', text: 'Run it.', code: ['for n in [100, 200, 400]:', '    print(n, n * n)'] },
        {
          type: 'predict', vars: R => ({ n: R.pick([10, 50, 100]) }),
          text: 'A quadratic job with twice the input. What will it say?', code: ['def work(n):', '    return n * n', 'print(work($(2 * n)) // work($n))'],
          explain: 'Twice the input, (2n)² = 4n²: four times the work.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([16, 64, 256]) }),
          text: 'A logarithmic job with twice the input. What will it say?', code: ['def halvings(n):', '    c = 0', '    while n > 1:', '        n //= 2', '        c += 1', '    return c', 'print(halvings($(2 * n)) - halvings($n))'],
          explain: 'Doubling the input adds just one halving.',
        },
        {
          type: 'fill', text: 'A linear job: how much more work for 3 times the input?',
          lines: ['def work(n):', '    return 5 * n', 'print(work(300) // work([]))'], chips: ['100', '300', '3'], answer: [['100']],
          hints: ['Compare n = 300 with n = 100.', 'work(100)'],
        },
        {
          type: 'write', text: 'For n in 10, 20 and 40, print n and how many steps a nested loop takes (n * n), one line each.',
          starter: [], keys: ['for', 'n', 'in', '[', ']', '10', '20', '40', ',', ':', 'print', '(', ')', '*'],
          require: l => (has(l, /for\s+n\s+in/) ? null : 'Loop over the three sizes.'),
          hints: ['for n in [10, 20, 40]:', '    print(n, n * n)'],
          solution: ['for n in [10, 20, 40]:', '    print(n, n * n)'],
        },
      ],
      learn: [{ title: 'The doubling test', code: 'O(n): ×2    O(n²): ×4    O(log n): +1', text: 'Double the input and watch how the work changes.' }],
    },
    {
      id: '18-8', title: 'Sandglass spirits', bg: 'clocktower', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), t = R.pick([9, 15, 21, 30]); return { kind: 'sandglass', hp: d + t, d, t }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Sandglass spirits drift down the stairs! $HP HP. Their weak point hides on a sorted shelf.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ t: c.foe.t }),
          text: 'It has $HP HP left. Binary-search the shelf for $t, then strike with the value you found.',
          lines: ['shelf = [3, 9, 12, 15, 21, 27, 30]', 'low, high = 0, 6', 'while low <= high:', '    mid = (low + high) // 2', '    if shelf[mid] == $t:', '        break', '    elif shelf[mid] < $t:', '        low = mid + 1', '    else:', '        high = mid [] 1', 'cast(fireball, shelf[mid])'], chips: ['-', '+', '*'], answer: [['-']],
          goal: { foeDown: true },
          hints: ['Too big: the right edge moves left of mid.', 'high = mid - 1'],
        },
        { type: 'talk', who: 'narrator', text: 'The great sandglass! It only fears a duplicate found quickly.' },
        {
          type: 'write', vars: R => { const d = R.pick([7, 9, 11]); return { d, hp: 2 * d, l: JSON.stringify([4, d, 2, 8, d, 5]) }; },
          spawn: v => ({ kind: 'sandglass', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Walk the grains once with a seen set; when a grain is already seen, cast icebolt with it twice.',
          starter: ['grains = $l', 'seen = set()'], keys: ['for', 'g', 'in', 'grains', ':', 'if', 'seen', 'cast', 'icebolt', '(', ')', ',', '.add'],
          goal: { foeDown: true },
          require: l => (has(l, /in\s+seen/) && has(l, /seen\.add/) ? null : 'Use the seen set: check "in seen", then seen.add.'),
          hints: ['for g in grains: / if g in seen: cast twice', 'seen.add(g)'],
          solution: ['for g in grains:', '    if g in seen:', '        cast(icebolt, g)', '        cast(icebolt, g)', '    seen.add(g)'],
        },
      ],
      learn: [{ title: 'Fast searches', code: 'binary search  ·  seen = set()', text: 'Sorted data and sets make searching fast.' }],
    },
    {
      id: '18-9', title: 'The Time Keeper', bg: 'clocktower', foe: { kind: 'timekeeper', hp: 170, weak: 'spark', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'timekeeper', text: 'TICK... TOCK... YOUR... STEPS... ARE... COUNTED...' },
        { type: 'talk', who: 'narrator', text: 'The Time Keeper has 170 HP. Spark jams its gears: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ n: R.pick([3, 4]) }),
          text: 'How much damage? Spark is doubled.', code: ['steps = 0', 'for i in range($n):', '    for j in range($n):', '        steps += 1', 'cast(spark, steps)'],
          explain: '$n × $n = $(n * n) steps, doubled.',
        },
        { type: 'predict', shell: true, text: 'Before you strike: what is the Big-O of the Keeper\'s favourite spell?', code: ['def ritual(items):', '    for a in items:', '        for b in items:', '            for c in items:', '                chant(a, b, c)'], choices: ['O(n³)', 'O(n²)', 'O(3n)'], answer: 0, explain: 'Three loops nested inside each other: n × n × n.' },
        {
          type: 'fix', text: 'This should find the gear number 42 and strike with its index. Run it, then tap the broken line.',
          code: ['gears = [8, 15, 23, 42, 57]', 'low, high = 0, 4', 'while low <= high:', '    mid = (low + high) // 2', '    if gears[mid] == 42:', '        break', '    elif gears[mid] < 42:', '        high = mid - 1', '    else:', '        high = mid - 1', 'print(mid)', 'cast(spark, mid + 5)'], bad: 7,
          options: ['        low = mid + 1', '        low = mid - 1', '        high = mid + 1'], answer: 0,
          explain: 'If the middle gear is too small, the left edge must move up.',
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and spark is doubled. Put $HP // 2 + 1 into a set called power, then cast spark with the one value it holds (max(power)).',
          starter: [], keys: ['power', '=', '{', '}', '$HP', '//', '2', '+', '1', 'cast', 'spark', '(', ')', ',', 'max'],
          goal: { foeDown: true },
          require: l => (has(l, /power\s*=\s*\{/) ? null : 'Make power a set with { }.'),
          hints: ['power = {$HP // 2 + 1}', 'cast(spark, max(power))'],
          solution: ['power = {$HP // 2 + 1}', 'cast(spark, max(power))'],
        },
        { type: 'talk', who: 'timekeeper', text: '...time... runs... out...' },
      ],
      learn: [{ title: 'Measuring toolkit', code: 'count steps  O(1) O(log n) O(n) O(n²)  binary search  sets', text: 'Everything from the Measuring Tower.' }],
    },
  ],
};
WORLDS.push(WORLD18);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    countsteps: () => { const n = rnd(3, 6); return rnd(0, 1) === 0 ? makeQ(['s = 0', `for i in range(${n}):`, `    for j in range(${n}):`, '        s += 1', 'print(s)'], [2 * n, n]) : makeQ(['s = 0', `for i in range(${n}):`, '    s += 1', `for j in range(${n}):`, '    s += 1', 'print(s)'], [n * n, n]); },
    bigo: () => { const n = pick([10, 100]); return makeQ([`n = ${n}`, 'print(n * n // n)'], [n * n, 1]); },
    linsearch: () => { const l = [5, 3, 8, 1]; const t = pick(l); return makeQ(['c = 0', `for x in ${JSON.stringify(l)}:`, '    c += 1', `    if x == ${t}:`, '        break', 'print(c)'], [4, l.indexOf(t)]); },
    binsearch: () => makeQ(['a = [1, 3, 5, 7, 9, 11, 13]', 'lo, hi = 0, 6', 'mid = (lo + hi) // 2', 'print(a[mid])'], [5, 3]),
    dschoice: () => { const l = pick([[1, 2, 2, 3], [4, 5, 6, 7]]); return makeQ([`a = ${JSON.stringify(l)}`, 'print(len(a) - len(set(a)))'], [l.length, 'Error']); },
    doubling: () => { const n = pick([10, 20]); return makeQ(['def w(n):', '    return n * n', `print(w(${2 * n}) // w(${n}))`], [2, 8]); },
  });
})();
