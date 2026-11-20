/* World 19: The Sorting Spire. Sorting algorithms by hand: swapping, checking order,
   selection sort, bubble sort (with early exit), insertion sort, merging two sorted
   lists, merge sort (divide and conquer, O(n log n)), and sorted() vs .sort().
   Source: MIT 6.100L lecture 23. */
Object.assign(EXTRA.npcs, {
  ordo: { name: 'Archivist Ordo', colors: ['#2e8a7a', '#d8d0c0', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  shufflebat: { base: 'bat', name: 'Shuffle bat', pal: { P: '#c8742a', W: '#5fd3ff' } },
  jumblegolem: { base: 'construct', name: 'Jumble golem' },
  disordertitan: { base: 'colossus', name: 'The Disorder Titan', pal: { S: '#7d4fc9', G: '#ffd75f' } },
});
const shuffled = (R, n) => { const a = R.sample([3, 7, 1, 9, 4, 6, 2, 8, 5], n); return a.join(', ') === [...a].sort((x, y) => x - y).join(', ') ? a.reverse() : a; };

const WORLD19 = {
  id: 19, name: 'The Sorting Spire', topic: 'sorting algorithms',
  nodes: [[50, 92], [28, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [40, 21], [52, 8]],
  levels: [
    {
      id: '19-1', title: 'Out of order', bg: 'library', npc: 'ordo', mentor: 'ordo', tags: ['sortbasics'],
      steps: [
        { type: 'talk', who: 'ordo', text: "Ah, {NAME}. I'm Ordo, and every shelf in this spire is in a mess. Python can sort for you: sorted(x) returns a NEW sorted list, and x.sort() sorts x itself and returns None. But how does sorting actually WORK?" },
        { type: 'talk', who: 'ordo', text: 'Every sorting method is built from two tiny moves: comparing two items, and swapping them. In Python a swap is one line: a[i], a[j] = a[j], a[i].' },
        { type: 'demo', text: 'Run it.', code: ['books = [3, 1, 2]', 'books[0], books[1] = books[1], books[0]', 'print(books)', 'print(sorted([5, 2, 4]), [5, 2, 4].sort())'] },
        {
          type: 'predict', vars: R => ({ a: shuffled(R, 4), i: R.int(0, 1), j: R.int(2, 3) }),
          text: 'What will it say?', code: ['a = [$(a.join(", "))]', 'a[$i], a[$j] = a[$j], a[$i]', 'print(a)'],
          explain: 'Positions $i and $j trade places.',
        },
        {
          type: 'predict', vars: R => ({ a: R.pick([[1, 3, 5, 7], [2, 4, 3, 8], [1, 2, 2, 9], [5, 4, 6, 7]]) }),
          text: 'Is it sorted? What will it say?', code: ['a = $(JSON.stringify(a))', 'ok = True', 'for i in range(len(a) - 1):', '    if a[i] > a[i + 1]:', '        ok = False', 'print(ok)'],
          explain: 'A list is sorted when no item is bigger than the one after it.',
        },
        {
          type: 'predict', vars: R => ({ a: shuffled(R, 5) }),
          text: 'Where is the smallest? What will it say?', code: ['a = [$(a.join(", "))]', 'best = 0', 'for i in range(1, len(a)):', '    if a[i] < a[best]:', '        best = i', 'print(best, a[best])'],
          explain: 'Walk the list, remembering the INDEX of the smallest so far.',
        },
        {
          type: 'fill', vars: R => ({ a: shuffled(R, 4) }),
          text: 'Swap the first and last books.',
          lines: ['a = [$(a.join(", "))]', 'a[0], a[-1] = [], []', 'print(a)'], chips: ['a[-1]', 'a[0]'], answer: [['a[-1]', 'a[0]']],
          hints: ['The right side gives the new values, in order.', 'a[0], a[-1] = a[-1], a[0]'],
        },
        {
          type: 'write', vars: R => ({ a: shuffled(R, 5) }),
          text: 'Print the index of the LARGEST number in a (walk the list, do not use max).',
          starter: ['a = [$(a.join(", "))]'], keys: ['best', '=', '0', 'for', 'i', 'in', 'range', '(', ')', '1', 'len', 'a', ',', ':', 'if', '[', ']', '>', 'print'],
          require: l => (!has(l, /max\s*\(/) && has(l, /for\s+i\s+in\s+range/) ? null : 'Walk the indexes yourself instead of using max.'),
          hints: ['best = 0 / for i in range(1, len(a)):', '    if a[i] > a[best]: best = i, then print(best)'],
          solution: ['best = 0', 'for i in range(1, len(a)):', '    if a[i] > a[best]:', '        best = i', 'print(best)'],
        },
      ],
      learn: [{ title: 'Sorting moves', code: 'sorted(x)   # new list\nx.sort()    # in place, returns None\na[i], a[j] = a[j], a[i]', text: 'All sorting is comparing and swapping.' }],
    },
    {
      id: '19-2', title: 'Selecting the smallest', bg: 'library', npc: 'ordo', mentor: 'ordo', tags: ['selsort'],
      steps: [
        { type: 'talk', who: 'ordo', text: 'SELECTION SORT: find the smallest item and swap it to position 0. Then find the smallest of the REST and swap it to position 1. And so on. After pass k, the first k items are in their final places.' },
        { type: 'demo', text: 'Run it and watch each pass.', code: ['a = [4, 2, 5, 1, 3]', 'for i in range(len(a)):', '    small = i', '    for j in range(i + 1, len(a)):', '        if a[j] < a[small]:', '            small = j', '    a[i], a[small] = a[small], a[i]', '    print(a)'] },
        {
          type: 'predict', vars: R => ({ a: shuffled(R, 5) }),
          text: 'After just ONE pass, what will it say?', code: ['a = [$(a.join(", "))]', 'i = 0', 'small = i', 'for j in range(1, len(a)):', '    if a[j] < a[small]:', '        small = j', 'a[i], a[small] = a[small], a[i]', 'print(a)'],
          explain: 'The smallest item swaps into position 0. Everything else stays where it was.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([4, 5, 6, 8]) }),
          text: 'How many comparisons for n items? What will it say?', code: ['n = $n', 'checks = 0', 'for i in range(n):', '    for j in range(i + 1, n):', '        checks += 1', 'print(checks)'],
          explain: '(n - 1) + (n - 2) + ... + 1 = $(n * (n - 1) / 2). Selection sort is O(n²).',
        },
        {
          type: 'fill', vars: R => ({ a: shuffled(R, 5) }),
          text: 'Finish selection sort: remember where the smaller item is.',
          lines: ['a = [$(a.join(", "))]', 'for i in range(len(a)):', '    small = i', '    for j in range(i + 1, len(a)):', '        if a[j] < a[small]:', '            small = []', '    a[i], a[small] = a[small], a[i]', 'print(a)'], chips: ['j', 'i', 'a[j]'], answer: [['j']],
          hints: ['Store the INDEX of the new smallest.', 'small = j'],
        },
        {
          type: 'write', vars: R => ({ a: shuffled(R, 5) }),
          text: 'Write selection sort for a, then print a.',
          starter: ['a = [$(a.join(", "))]'], keys: ['for', 'i', 'j', 'in', 'range', '(', ')', 'len', 'a', '+', '1', ',', ':', 'small', '=', 'if', '[', ']', '<', 'print'],
          require: l => (!has(l, /sort\s*\(|sorted\s*\(/) && has(l, /small/) ? null : 'Write the selection sort yourself (no sort or sorted).'),
          hints: ['for i in range(len(a)): / small = i / for j in range(i + 1, len(a)): / if a[j] < a[small]: small = j', 'a[i], a[small] = a[small], a[i], then print(a)'],
          solution: ['for i in range(len(a)):', '    small = i', '    for j in range(i + 1, len(a)):', '        if a[j] < a[small]:', '            small = j', '    a[i], a[small] = a[small], a[i]', 'print(a)'],
        },
      ],
      learn: [{ title: 'Selection sort', code: 'for each position i:\n    find the smallest of a[i:]\n    swap it into a[i]', text: 'Simple, always O(n²) comparisons.' }],
    },
    {
      id: '19-3', title: 'Bubbles rising', bg: 'scriptorium', npc: 'ordo', mentor: 'ordo', tags: ['bubble'],
      steps: [
        { type: 'talk', who: 'ordo', text: 'BUBBLE SORT: walk the list comparing NEIGHBOURS, swapping any pair in the wrong order. After one pass, the biggest item has bubbled to the end. Repeat until a pass makes no swaps.' },
        { type: 'demo', text: 'Run it.', code: ['a = [5, 1, 4, 2, 8]', 'swapped = True', 'while swapped:', '    swapped = False', '    for i in range(len(a) - 1):', '        if a[i] > a[i + 1]:', '            a[i], a[i + 1] = a[i + 1], a[i]', '            swapped = True', '    print(a)'] },
        {
          type: 'predict', vars: R => ({ a: shuffled(R, 5) }),
          text: 'One pass of bubbling. What will it say?', code: ['a = [$(a.join(", "))]', 'for i in range(len(a) - 1):', '    if a[i] > a[i + 1]:', '        a[i], a[i + 1] = a[i + 1], a[i]', 'print(a)'],
          explain: 'Each bigger item is carried right; the largest, $(Math.max(...a)), ends up last.',
        },
        {
          type: 'predict', vars: R => ({ a: R.pick([[1, 2, 3, 4], [2, 1, 3, 4], [4, 3, 2, 1]]) }),
          text: 'How many passes until no swaps? What will it say?', code: ['a = $(JSON.stringify(a))', 'passes = 0', 'swapped = True', 'while swapped:', '    swapped = False', '    passes += 1', '    for i in range(len(a) - 1):', '        if a[i] > a[i + 1]:', '            a[i], a[i + 1] = a[i + 1], a[i]', '            swapped = True', 'print(passes)'],
          explain: 'An already sorted list needs only ONE pass to prove it. A reversed one needs the most.',
        },
        {
          type: 'fill', vars: R => ({ a: shuffled(R, 5) }),
          text: 'Swap neighbours that are in the wrong order.',
          lines: ['a = [$(a.join(", "))]', 'for p in range(len(a)):', '    for i in range(len(a) - 1):', '        if a[i] [] a[i + 1]:', '            a[i], a[i + 1] = a[i + 1], a[i]', 'print(a)'], chips: ['>', '<', '=='], answer: [['>']],
          hints: ['Wrong order means the left one is bigger.', 'a[i] > a[i + 1]'],
        },
        {
          type: 'fix', vars: R => ({ a: shuffled(R, 5) }),
          text: 'This bubble sort crashes. Run it, then tap the broken line.',
          code: ['a = [$(a.join(", "))]', 'for p in range(len(a)):', '    for i in range(len(a)):', '        if a[i] > a[i + 1]:', '            a[i], a[i + 1] = a[i + 1], a[i]', 'print(a)'], bad: 2,
          options: ['    for i in range(len(a) - 1):', '    for i in range(len(a) + 1):', '    for i in range(1, len(a) + 1):'], answer: 0,
          explain: 'a[i + 1] must exist, so i stops one before the end.',
        },
        {
          type: 'write', vars: R => ({ a: shuffled(R, 5) }),
          text: 'Write bubble sort with the "swapped" early exit, then print a.',
          starter: ['a = [$(a.join(", "))]'], keys: ['swapped', '=', 'True', 'False', 'while', ':', 'for', 'i', 'in', 'range', '(', ')', 'len', 'a', '-', '+', '1', 'if', '[', ']', '>', ',', 'print'],
          require: l => (has(l, /swapped/) && !has(l, /sort\s*\(|sorted\s*\(/) ? null : 'Use a swapped flag, and no sort().'),
          hints: ['swapped = True / while swapped: / swapped = False', 'for i in range(len(a) - 1): if a[i] > a[i + 1]: swap and set swapped = True'],
          solution: ['swapped = True', 'while swapped:', '    swapped = False', '    for i in range(len(a) - 1):', '        if a[i] > a[i + 1]:', '            a[i], a[i + 1] = a[i + 1], a[i]', '            swapped = True', 'print(a)'],
        },
      ],
      learn: [{ title: 'Bubble sort', code: 'while swapped:\n    compare neighbours\n    swap if out of order', text: 'O(n²) in general, but only one pass when the list is already sorted.' }],
    },
    {
      id: '19-4', title: 'Shuffle bats', bg: 'stacks', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), a = R.sample([3, 7, 1, 9, 4, 6], 4); return { kind: 'shufflebat', hp: d + Math.max(...a) * 2, d, a }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Shuffle bats scramble the shelves! $HP HP. One bubbling pass brings the biggest power to the end.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ a: c.foe.a }),
          text: 'It has $HP HP left. Bubble once, then cast fireball twice with the LAST item.',
          lines: ['a = $(JSON.stringify(a))', 'for i in range(len(a) - 1):', '    if a[i] > a[i + 1]:', '        a[i], a[i + 1] = a[i + 1], a[i]', 'cast(fireball, a[[]])', 'cast(fireball, a[-1])'], chips: ['-1', '0', '1'], answer: [['-1']],
          goal: { foeDown: true },
          hints: ['After one pass the biggest sits at the end.', 'a[-1]'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat queen guards the smallest power!' },
        {
          type: 'write', vars: R => { const a = R.sample([6, 9, 4, 7, 5], 4); return { a: JSON.stringify(a), hp: Math.min(...a) * 3 }; },
          spawn: v => ({ kind: 'shufflebat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Find the index of the smallest item by walking the list, then cast icebolt with that item three times.',
          starter: ['a = $a'], keys: ['small', '=', '0', 'for', 'i', 'in', 'range', '(', ')', '1', 'len', 'a', ',', ':', 'if', '[', ']', '<', 'cast', 'icebolt'],
          goal: { foeDown: true },
          require: l => (!has(l, /min\s*\(/) ? null : 'Walk the list yourself, no min().'),
          hints: ['small = 0 / for i in range(1, len(a)): if a[i] < a[small]: small = i', 'cast(icebolt, a[small]) three times'],
          solution: ['small = 0', 'for i in range(1, len(a)):', '    if a[i] < a[small]:', '        small = i', 'cast(icebolt, a[small])', 'cast(icebolt, a[small])', 'cast(icebolt, a[small])'],
        },
      ],
      learn: [{ title: 'Partial sorting', code: 'one bubble pass → max at the end', text: 'Sometimes you only need a little sorting.' }],
    },
    {
      id: '19-5', title: 'Cards in hand', bg: 'scriptorium', npc: 'ordo', mentor: 'ordo', tags: ['insertion'],
      steps: [
        { type: 'talk', who: 'ordo', text: 'INSERTION SORT works like sorting playing cards in your hand. Take the next card and slide it LEFT past every bigger card until it fits. The left part is always sorted.' },
        { type: 'demo', text: 'Run it.', code: ['a = [4, 3, 5, 1, 2]', 'for i in range(1, len(a)):', '    card = a[i]', '    j = i - 1', '    while j >= 0 and a[j] > card:', '        a[j + 1] = a[j]', '        j -= 1', '    a[j + 1] = card', '    print(a)'] },
        {
          type: 'predict', vars: R => ({ a: R.pick([[2, 5, 9, 4], [1, 6, 8, 3], [3, 4, 7, 0]]) }),
          text: 'The first three are sorted. Insert the last card. What will it say?', code: ['a = $(JSON.stringify(a))', 'card = a[3]', 'j = 2', 'while j >= 0 and a[j] > card:', '    a[j + 1] = a[j]', '    j -= 1', 'a[j + 1] = card', 'print(a)'],
          explain: 'Bigger cards shift one place right, and $(a[3]) drops into the gap.',
        },
        {
          type: 'predict', vars: R => ({ a: R.pick([[1, 2, 3, 4, 5], [5, 4, 3, 2, 1]]) }),
          text: 'Counting shifts. What will it say?', code: ['a = $(JSON.stringify(a))', 'shifts = 0', 'for i in range(1, len(a)):', '    card = a[i]', '    j = i - 1', '    while j >= 0 and a[j] > card:', '        a[j + 1] = a[j]', '        j -= 1', '        shifts += 1', '    a[j + 1] = card', 'print(shifts)'],
          explain: 'A sorted list needs no shifts at all (O(n)); a reversed one needs the most (O(n²)).',
        },
        {
          type: 'fill', vars: R => ({ a: shuffled(R, 5) }),
          text: 'Shift bigger cards right while they are bigger than the card.',
          lines: ['a = [$(a.join(", "))]', 'for i in range(1, len(a)):', '    card = a[i]', '    j = i - 1', '    while j >= 0 and a[j] [] card:', '        a[j + 1] = a[j]', '        j -= 1', '    a[j + 1] = card', 'print(a)'], chips: ['>', '<', '=='], answer: [['>']],
          hints: ['Only bigger cards move out of the way.', 'a[j] > card'],
        },
        {
          type: 'write', vars: R => ({ a: shuffled(R, 5) }),
          text: 'Write insertion sort for a, then print a.',
          starter: ['a = [$(a.join(", "))]'], keys: ['for', 'i', 'in', 'range', '(', ')', '1', 'len', 'a', ',', ':', 'card', '=', 'j', '-', '+', 'while', '>=', '0', 'and', '>', '[', ']', '-=', 'print'],
          require: l => (has(l, /while\s+j\s*>=\s*0/) && !has(l, /sort\s*\(|sorted\s*\(/) ? null : 'Use the while j >= 0 and a[j] > card loop, no sort().'),
          hints: ['for i in range(1, len(a)): / card = a[i] / j = i - 1', 'while j >= 0 and a[j] > card: a[j + 1] = a[j]; j -= 1 / then a[j + 1] = card'],
          solution: ['for i in range(1, len(a)):', '    card = a[i]', '    j = i - 1', '    while j >= 0 and a[j] > card:', '        a[j + 1] = a[j]', '        j -= 1', '    a[j + 1] = card', 'print(a)'],
        },
      ],
      learn: [{ title: 'Insertion sort', code: 'slide each new card left\nuntil it fits', text: 'O(n²) worst case, but very fast on lists that are nearly sorted.' }],
    },
    {
      id: '19-6', title: 'Two sorted piles', bg: 'library', npc: 'ordo', mentor: 'ordo', tags: ['merge'],
      steps: [
        { type: 'talk', who: 'ordo', text: 'Two piles that are ALREADY sorted can be merged quickly: look at the front of each pile, take the smaller one, repeat. When one pile runs out, add the rest of the other.' },
        { type: 'demo', text: 'Run it.', code: ['def merge(a, b):', '    out = []', '    i = j = 0', '    while i < len(a) and j < len(b):', '        if a[i] <= b[j]:', '            out.append(a[i])', '            i += 1', '        else:', '            out.append(b[j])', '            j += 1', '    return out + a[i:] + b[j:]', 'print(merge([1, 4, 9], [2, 3, 10, 12]))'] },
        {
          type: 'predict', vars: R => ({ a: R.pick([[2, 7], [1, 8, 9], [5]]), b: R.pick([[3, 4, 6], [0, 10], [2, 5, 7]]) }),
          text: 'What will it say?', code: ['def merge(a, b):', '    out = []', '    i = j = 0', '    while i < len(a) and j < len(b):', '        if a[i] <= b[j]:', '            out.append(a[i])', '            i += 1', '        else:', '            out.append(b[j])', '            j += 1', '    return out + a[i:] + b[j:]', 'print(merge($(JSON.stringify(a)), $(JSON.stringify(b))))'],
          explain: 'The smaller front item goes out first, each time.',
        },
        {
          type: 'predict', text: 'Only the main loop, without the leftovers. What will it say?', code: ['a, b = [1, 2], [3, 4, 5]', 'out = []', 'i = j = 0', 'while i < len(a) and j < len(b):', '    if a[i] <= b[j]:', '        out.append(a[i])', '        i += 1', '    else:', '        out.append(b[j])', '        j += 1', 'print(out)'],
          explain: 'The loop stops when a runs out. 3, 4, 5 are still waiting in b, which is why we add a[i:] + b[j:].',
        },
        {
          type: 'fill', text: 'Take from a when its front item is smaller (or equal).',
          lines: ['a, b = [1, 5, 8], [2, 3, 9]', 'out, i, j = list(), 0, 0', 'while i < len(a) and j < len(b):', '    if a[i] [] b[j]:', '        out.append(a[i])', '        i += 1', '    else:', '        out.append(b[j])', '        j += 1', 'print(out + a[i:] + b[j:])'], chips: ['<=', '>=', '!='], answer: [['<=']],
          hints: ['The smaller one goes first.', 'a[i] <= b[j]'],
        },
        {
          type: 'write', text: 'Write merge(a, b) for two sorted lists and print merge([1, 6, 7], [2, 4, 8, 9]).',
          starter: [], keys: ['def', 'merge', '(', ')', 'a', 'b', ',', ':', 'out', '=', '[', ']', 'i', 'j', '0', 'while', '<', 'len', 'and', 'if', '<=', '.append', '+=', '1', 'else', 'return', '+', 'print'],
          require: l => (!has(l, /sort\s*\(|sorted\s*\(/) && has(l, /while\s+/) ? null : 'Merge with two pointers, no sorting.'),
          hints: ['out = [] / i = j = 0 / while i < len(a) and j < len(b): ...', 'return out + a[i:] + b[j:]'],
          solution: ['def merge(a, b):', '    out = []', '    i = j = 0', '    while i < len(a) and j < len(b):', '        if a[i] <= b[j]:', '            out.append(a[i])', '            i += 1', '        else:', '            out.append(b[j])', '            j += 1', '    return out + a[i:] + b[j:]', 'print(merge([1, 6, 7], [2, 4, 8, 9]))'],
        },
      ],
      learn: [{ title: 'Merging', code: 'take the smaller front item\nadd the leftovers at the end', text: 'Merging two sorted lists is O(n).' }],
    },
    {
      id: '19-7', title: 'Divide and conquer', bg: 'scriptorium', npc: 'ordo', mentor: 'ordo', tags: ['mergesort'],
      steps: [
        { type: 'talk', who: 'ordo', text: 'MERGE SORT is the clever one. Split the list in half, sort each half (by recursion!), then merge the halves. A list of 0 or 1 items is already sorted: that is the base case.' },
        { type: 'talk', who: 'ordo', text: 'Halving gives about log n levels, and each level does O(n) merging work. So merge sort is O(n log n): MUCH faster than O(n²) for big lists. Python\'s own sorted() uses a cousin of it, and it is STABLE: equal items keep their original order.' },
        { type: 'demo', text: 'Run it.', code: ['def merge(a, b):', '    out, i, j = [], 0, 0', '    while i < len(a) and j < len(b):', '        if a[i] <= b[j]:', '            out.append(a[i]); i += 1', '        else:', '            out.append(b[j]); j += 1', '    return out + a[i:] + b[j:]', 'def msort(x):', '    if len(x) <= 1:', '        return x', '    mid = len(x) // 2', '    return merge(msort(x[:mid]), msort(x[mid:]))', 'print(msort([5, 2, 9, 1, 7, 3]))'] },
        {
          type: 'predict', vars: R => ({ a: shuffled(R, 6) }),
          text: 'How does it split? What will it say?', code: ['def split(x, depth):', '    print("  " * depth + str(x))', '    if len(x) <= 1:', '        return', '    mid = len(x) // 2', '    split(x[:mid], depth + 1)', '    split(x[mid:], depth + 1)', 'split([$(a.slice(0, 4).join(", "))], 0)'],
          explain: 'Each list splits into two halves until single items remain.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([8, 64, 1024]) }),
          text: 'n × log₂(n) versus n × n. What will it say?', code: ['n = $n', 'levels = 0', 'size = n', 'while size > 1:', '    size //= 2', '    levels += 1', 'print(n * levels, n * n)'],
          explain: 'For n = $n: merge sort does about $(n * Math.log2(n)) steps; an O(n²) sort about $(n * n).',
        },
        {
          type: 'fill', vars: R => ({ a: shuffled(R, 6) }),
          text: 'Finish merge sort: sort both halves, then merge them.',
          lines: ['def merge(a, b):', '    out, i, j = list(), 0, 0', '    while i < len(a) and j < len(b):', '        if a[i] <= b[j]:', '            out.append(a[i]); i += 1', '        else:', '            out.append(b[j]); j += 1', '    return out + a[i:] + b[j:]', 'def msort(x):', '    if len(x) <= 1:', '        return x', '    mid = len(x) // 2', '    return merge(msort(x[:mid]), [](x[mid:]))', 'print(msort([$(a.join(", "))]))'], chips: ['msort', 'merge', 'sorted'], answer: [['msort']],
          require: s => (s[0] === 'msort' ? null : 'Sort the right half with msort too, by recursion.'),
          hints: ['Both halves are sorted the same way.', 'msort(x[mid:])'],
        },
        {
          type: 'write', vars: R => ({ a: shuffled(R, 6) }),
          text: 'merge is given. Write msort(x) recursively and print msort(nums).',
          starter: ['def merge(a, b):', '    out, i, j = [], 0, 0', '    while i < len(a) and j < len(b):', '        if a[i] <= b[j]:', '            out.append(a[i]); i += 1', '        else:', '            out.append(b[j]); j += 1', '    return out + a[i:] + b[j:]', 'nums = [$(a.join(", "))]'], keys: ['def', 'msort', '(', ')', 'x', ':', 'if', 'len', '<=', '1', 'return', 'mid', '=', '//', '2', 'merge', '[', ']', ',', 'print', 'nums'],
          require: l => (has(l, /msort\s*\(\s*x\s*\[/) && !has(l, /sorted\s*\(|\.sort\s*\(/) ? null : 'Call msort on both halves, no built-in sorting.'),
          hints: ['def msort(x): / if len(x) <= 1: return x / mid = len(x) // 2', 'return merge(msort(x[:mid]), msort(x[mid:])), then print(msort(nums))'],
          solution: ['def msort(x):', '    if len(x) <= 1:', '        return x', '    mid = len(x) // 2', '    return merge(msort(x[:mid]), msort(x[mid:]))', 'print(msort(nums))'],
        },
      ],
      learn: [{ title: 'Merge sort', code: 'split in half\nsort each half (recursion)\nmerge', text: 'Divide and conquer: O(n log n). Stable, like Python\'s sorted().' }],
    },
    {
      id: '19-8', title: 'Jumble golems', bg: 'gearworks', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), a = R.sample([3, 7, 1, 9, 4, 6], 4); const s = [...a].sort((x, y) => x - y); return { kind: 'jumblegolem', hp: d + s[1] * 3, d, a }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Jumble golems! $HP HP. Their weak point is the SECOND smallest power. Sort, then strike.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ a: c.foe.a }),
          text: 'It has $HP HP left: three times the second-smallest power. Insertion-sort, then strike with a[1] three times.',
          lines: ['a = $(JSON.stringify(a))', 'for i in range(1, len(a)):', '    card, j = a[i], i - 1', '    while j >= 0 and a[j] > card:', '        a[j + 1] = a[j]', '        j -= 1', '    a[j + 1] = []', 'for k in range(3):', '    cast(fireball, a[1])'], chips: ['card', 'a[j]', 'j'], answer: [['card']],
          goal: { foeDown: true },
          hints: ['The card drops into the gap.', 'a[j + 1] = card'],
        },
        { type: 'talk', who: 'narrator', text: 'A giant golem made of two sorted halves!' },
        {
          type: 'write', vars: R => ({ hp: 2 * (3 + 9) }),
          spawn: v => ({ kind: 'jumblegolem', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Merge the two sorted halves (two pointers), then cast icebolt with the first and the last item of the result, twice each.',
          starter: ['a, b = [3, 5, 8], [4, 6, 9]', 'out, i, j = [], 0, 0'], keys: ['while', 'i', 'j', '<', 'len', 'a', 'b', 'and', ':', 'if', '<=', 'out', '.append', '+=', '1', 'else', '=', '+', '[', ']', 'cast', 'icebolt', '(', ')', ',', '0', '-1'],
          goal: { foeDown: true },
          require: l => (has(l, /while\s+/) && !has(l, /sort/) ? null : 'Merge with two pointers.'),
          hints: ['while i < len(a) and j < len(b): take the smaller', 'out = out + a[i:] + b[j:], then cast out[0] and out[-1] twice each'],
          solution: ['while i < len(a) and j < len(b):', '    if a[i] <= b[j]:', '        out.append(a[i])', '        i += 1', '    else:', '        out.append(b[j])', '        j += 1', 'out = out + a[i:] + b[j:]', 'cast(icebolt, out[0])', 'cast(icebolt, out[0])', 'cast(icebolt, out[-1])', 'cast(icebolt, out[-1])'],
        },
      ],
      learn: [{ title: 'Sort, then strike', code: 'sorted → a[1] is the 2nd smallest', text: 'Once data is sorted, positions mean ranks.' }],
    },
    {
      id: '19-9', title: 'The Disorder Titan', bg: 'library', foe: { kind: 'disordertitan', hp: 170, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'disordertitan', text: 'CHAOS... EVERY... SHELF... SCATTERED...' },
        { type: 'talk', who: 'narrator', text: 'The Disorder Titan has 170 HP. Icebolt freezes it in place: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ a: shuffled(R, 4) }),
          text: 'How much damage? Icebolt is doubled.', code: ['a = [$(a.join(", "))]', 'for i in range(len(a) - 1):', '    if a[i] > a[i + 1]:', '        a[i], a[i + 1] = a[i + 1], a[i]', 'cast(icebolt, a[-1])'],
          explain: 'One bubble pass carries the largest, $(Math.max(...a)), to the end. Doubled.',
        },
        {
          type: 'fix', vars: R => ({ a: shuffled(R, 5) }),
          text: 'This selection sort should sort the list and print it. Run it, then tap the broken line.',
          code: ['a = [$(a.join(", "))]', 'for i in range(len(a)):', '    small = i', '    for j in range(i + 1, len(a)):', '        if a[j] > a[small]:', '            small = j', '    a[i], a[small] = a[small], a[i]', 'print(a)', 'cast(icebolt, a[0])'], bad: 4,
          options: ['        if a[j] < a[small]:', '        if a[j] == a[small]:', '        if a[small] < a[small]:'], answer: 0,
          explain: 'Selection sort picks the SMALLEST each time: a[j] < a[small].',
        },
        { type: 'talk', who: 'disordertitan', text: 'SPLIT... ME... IF... YOU... CAN...' },
        {
          type: 'fill', text: 'Merge sort needs a base case: a list this short is already sorted.',
          lines: ['def msort(x):', '    if len(x) [] 1:', '        return x', '    mid = len(x) // 2', '    left, right = msort(x[:mid]), msort(x[mid:])', '    out = list()', '    while left and right:', '        out.append(left.pop(0) if left[0] <= right[0] else right.pop(0))', '    return out + left + right', 'cast(icebolt, msort([9, 4, 7, 2])[-1])'], chips: ['<=', '>', '=='], answer: [['<=']],
          hints: ['Zero or one item: already sorted.', 'len(x) <= 1'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Sort powers with sorted() (now you know how it works!) and cast icebolt with the last one.',
          starter: ['powers = [12, $HP // 2 + 1, 20]'], keys: ['cast', 'icebolt', '(', ')', ',', 'sorted', 'powers', '[', ']', '-1'],
          goal: { foeDown: true },
          require: l => (has(l, /sorted\s*\(\s*powers\s*\)/) ? null : 'Use sorted(powers).'),
          hints: ['sorted(powers)[-1] is the biggest.', 'cast(icebolt, sorted(powers)[-1])'],
          solution: ['cast(icebolt, sorted(powers)[-1])'],
        },
        { type: 'talk', who: 'disordertitan', text: '...every... thing... in... its... place...' },
      ],
      learn: [{ title: 'Sorting toolkit', code: 'selection  bubble  insertion  merge  sorted()', text: 'Everything from the Sorting Spire: O(n²) sorts and the O(n log n) champion.' }],
    },
  ],
};
WORLDS.push(WORLD19);

(() => {
  const { makeQ, rnd, shuffle } = Arena;
  Object.assign(Arena.GEN, {
    sortbasics: () => { const a = shuffle([4, 8, 1, 6]); return makeQ([`a = ${JSON.stringify(a)}`, 'a[0], a[1] = a[1], a[0]', 'print(a)'], [JSON.stringify(a).replace(/,/g, ', '), JSON.stringify([...a].sort((x, y) => x - y)).replace(/,/g, ', ')]); },
    selsort: () => { const n = rnd(4, 6); return makeQ(['c = 0', `for i in range(${n}):`, `    for j in range(i + 1, ${n}):`, '        c += 1', 'print(c)'], [n * n, n * (n + 1) / 2]); },
    bubble: () => { const a = shuffle([3, 9, 1, 6]); const b = [...a]; for (let i = 0; i < 3; i++) if (b[i] > b[i + 1]) [b[i], b[i + 1]] = [b[i + 1], b[i]]; return makeQ([`a = ${JSON.stringify(a)}`, 'for i in range(3):', '    if a[i] > a[i + 1]:', '        a[i], a[i + 1] = a[i + 1], a[i]', 'print(a[-1])'], [a[3] === 9 ? 6 : a[3], a[0]]); },
    insertion: () => makeQ(['a = [2, 5, 8, 4]', 'card, j = a[3], 2', 'while j >= 0 and a[j] > card:', '    a[j + 1] = a[j]', '    j -= 1', 'a[j + 1] = card', 'print(a)'], ['[2, 5, 4, 8]', '[2, 4, 8, 5]']),
    merge: () => makeQ(['a, b = [1, 7], [3, 4]', 'o, i, j = [], 0, 0', 'while i < 2 and j < 2:', '    if a[i] <= b[j]:', '        o.append(a[i]); i += 1', '    else:', '        o.append(b[j]); j += 1', 'print(o)'], ['[1, 3, 4, 7]', '[1, 7, 3, 4]']),
    mergesort: () => { const n = [8, 16, 32][rnd(0, 2)]; return makeQ([`n = ${n}`, 'c = 0', 'while n > 1:', '    n //= 2', '    c += 1', 'print(c)'], [n / 2, n]); },
  });
})();
