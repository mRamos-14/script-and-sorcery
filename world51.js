/* World 51: The Heart of Code. The final trial. Seven trials review every act (their questions
   are drawn from all the Training pools of that act's worlds, weighted toward what you missed),
   the Hall of Mirrors teaches the classic Python gotchas side by side, and the Heart of Code
   itself mixes everything in one last battle. */
Object.assign(EXTRA.npcs, {
  heartvoice: { name: 'The Voice of the Heart', colors: ['#7f5fd6', '#ffd75f', '#e0d4ff'] },
});
Object.assign(EXTRA.foes, {
  trial1: { base: 'knight', name: 'Warden of First Steps', pal: { S: '#c8e0a8' } },
  trial2: { base: 'grimoire', name: 'Warden of Functions', pal: { P: '#a8c8e0' } },
  trial3: { base: 'sphinx', name: 'Warden of Algorithms', pal: { Y: '#7fdcff' } },
  trial4: { base: 'golem', name: 'Warden of Objects', pal: { S: '#9a7fd6' } },
  trial5: { base: 'archivist', name: 'Warden of Practice', pal: { S: '#c98d5f' } },
  trial6: { base: 'tribunal', name: 'Warden of Data', pal: { Y: '#5fd3ff' } },
  trial7: { base: 'lich', name: 'Warden of the Advanced Arts', pal: { W: '#ffd75f' } },
  mirrorimp: { base: 'ghost', name: 'Mirror imp', pal: { F: '#e0d4ff' } },
  heartofcode: { base: 'source', name: 'The Heart of Code', crown: true, pal: { C: '#ff5f9a', L: '#ffd0e0' } },
});

// every Training tag taught in worlds lo..hi (only tags with a question pool)
const HEART_TAGS = (lo, hi) => [...new Set(WORLDS.filter(w => w.id >= lo && w.id <= hi).flatMap(w => w.levels.flatMap(l => l.tags || [])))].filter(t => Arena.GEN[t]);
const HEART_TRIALS = [
  [1, 'The Trial of First Steps', 1, 10, 'Acts I and II: print, numbers, strings, choices, loops, lists, dicts and more.', 'village'],
  [2, 'The Trial of Functions', 11, 15, 'Act III: functions, scope, recursion, errors and files.', 'library'],
  [3, 'The Trial of Algorithms', 16, 20, 'Act IV: searching, sorting, recursion and complexity.', 'observatory'],
  [4, 'The Trial of Objects', 21, 25, 'Act V: classes, inheritance, properties, dunders and data structures.', 'citadel'],
  [5, 'The Trial of Practice', 26, 32, 'Act VI: libraries, regex, files and folders, dates, logging and testing.', 'archive'],
  [6, 'The Trial of Data', 33, 38, 'Act VII: CSV, JSON, XML, SQL and the web.', 'vault'],
  [7, 'The Trial of the Advanced Arts', 39, 50, 'Act VIII and the Gauntlet: from lambdas to functools, and the projects.', 'skytemple'],
];
const HEART_SPELLS = ['spark', 'fireball', 'icebolt'];

const WORLD51 = {
  id: 51, name: 'The Heart of Code', topic: 'the final trial',
  nodes: [[50, 93], [30, 84], [68, 75], [34, 65], [66, 55], [32, 45], [64, 35], [40, 24], [52, 9]],
  levels: [
    ...HEART_TRIALS.map(([n, title, lo, hi, about, bg]) => ({
      id: `51-${n}`, title, bg, foe: { kind: `trial${n}`, hp: 150 }, mentor: 'narrator', boss: true, review: true, tags: [],
      steps: [
        { type: 'talk', who: `trial${n}`, text: n === 1 ? 'You have walked fifty worlds, {NAME}. Before the Heart will speak to you, seven wardens must be satisfied. I am the first.' : 'Another warden. Another test. Show me you still remember.' },
        { type: 'talk', who: 'narrator', text: `${about} 150 HP. Each right answer strikes.` },
        ...Array.from({ length: 6 }, (_, k) => ({ type: 'review', tags: HEART_TAGS(lo, hi), reward: { spell: HEART_SPELLS[k % 3], power: 25 }, text: 'What will it say?' })),
        { type: 'talk', who: `trial${n}`, text: n === 7 ? 'The last warden yields. Go. The Hall of Mirrors, and then the Heart.' : 'You remember. Pass.' },
      ],
      learn: [{ title, code: `worlds ${lo}–${hi}`, text: about }],
    })),
    {
      id: '51-8', title: 'The Hall of Mirrors', bg: 'palace', npc: 'heartvoice', mentor: 'heartvoice', tags: ['gotchamix'],
      steps: [
        { type: 'talk', who: 'heartvoice', text: 'Before the Heart, the Hall of Mirrors, {NAME}. Here Python shows you its tricks: code that LOOKS like it does one thing and does another. You have met most of them on your way. See them side by side, and they will never fool you again.' },
        { type: 'demo', text: 'The mutable default, once more. Run it.', code: ['def add(item, bag=[]):', '    bag.append(item)', '    return bag', 'print(add("rope"))', 'print(add("lamp"))', 'def add_safe(item, bag=None):', '    if bag is None:', '        bag = []', '    bag.append(item)', '    return bag', 'print(add_safe("rope"), add_safe("lamp"))'] },
        {
          type: 'predict', text: 'A grid made by multiplying. What will it say?', code: ['grid = [[0] * 2] * 3', 'grid[0][0] = 7', 'print(grid)', 'safe = [[0] * 2 for _ in range(3)]', 'safe[0][0] = 7', 'print(safe)'],
          explain: '[row] * 3 repeats the SAME row three times; the comprehension builds three separate rows.',
        },
        {
          type: 'predict', text: 'Removing while looping. What will it say?', code: ['nums = [2, 4, 6, 7]', 'for n in nums:', '    if n % 2 == 0:', '        nums.remove(n)', 'print(nums)', 'nums = [2, 4, 6, 7]', 'print([n for n in nums if n % 2])'],
          explain: 'Removing shifts the items left, so the loop skips the one after each removal. Build a new list instead.',
        },
        {
          type: 'predict', text: 'Floats and rounding. What will it say?', code: ['import math', 'print(0.1 + 0.2 == 0.3, math.isclose(0.1 + 0.2, 0.3))', 'print(round(2.5), round(3.5), round(0.125, 2))'],
          explain: 'Floats are binary approximations: compare with isclose. round sends exact halves to the EVEN neighbour.',
        },
        {
          type: 'predict', text: 'and / or return one of their operands. What will it say?', code: ['print(0 or "default", "" and "never", [] or [0], 3 and 4)', 'name = ""', 'print(name or "stranger")'],
          explain: 'or gives the first truthy operand (or the last); and gives the first falsy one (or the last).',
        },
        {
          type: 'predict', text: 'Chained comparisons and is. What will it say?', code: ['print(1 < 3 > 2, 1 < 3 < 2)', 'a = [1, 2]', 'b = [1, 2]', 'print(a == b, a is b, a is a)'],
          explain: '1 < 3 > 2 means (1 < 3) and (3 > 2). == compares values, is asks whether it is the same object.',
        },
        {
          type: 'predict', text: 'Negative division and immutable strings. What will it say?', code: ['print(-7 // 2, -7 % 2, int(-3.5))', 's = "spell"', 's.upper()', 'print(s, s.upper())'],
          explain: '// rounds DOWN (towards minus infinity), int() truncates towards zero. String methods return new strings; s is unchanged.',
        },
        {
          type: 'fill', text: 'Use the safe default.',
          lines: ['def log(msg, lines=None):', '    if lines [] None:', '        lines = list()', '    lines.append(msg)', '    return lines', 'print(log("a"), log("b"))'], chips: ['is', '==', 'in'], answer: [['is']],
          require: s => (s[0] === 'is' ? null : 'Compare with None using is.'),
          hints: ['None is checked by identity.', 'if lines is None:'],
        },
        {
          type: 'write', text: 'The classic fix: write remember(item, seen=None) that starts a fresh list when seen is None, appends item and returns seen. Print remember("a") and then remember("b") on separate lines; each should be a one-item list.',
          starter: [], keys: ['def', 'remember', '(', ')', ':', 'item', 'seen=None', ',', 'if', 'seen', 'is', 'None', '=', 'list()', 'seen.append(item)', 'return', 'print', '"a"', '"b"'],
          require: l => (has(l, /seen=None/) && has(l, /is None/) ? null : 'Use seen=None and check it with is None.'),
          hints: ['def remember(item, seen=None):\n    if seen is None:\n        seen = list()', '    seen.append(item)\n    return seen\nprint(remember("a"))\nprint(remember("b"))'],
          solution: ['def remember(item, seen=None):', '    if seen is None:', '        seen = list()', '    seen.append(item)', '    return seen', 'print(remember("a"))', 'print(remember("b"))'],
        },
      ],
      learn: [{ title: 'The Hall of Mirrors', code: 'bag=None  [[0]*n for _ in range(m)]  new list, not remove  isclose  round half even\nx or default  is vs ==  -7 // 2 == -4  strings are immutable', text: 'Python\'s classic tricks, never to fool you again.' }],
    },
    {
      id: '51-9', title: 'The Heart of Code', bg: 'source', foe: { kind: 'heartofcode', hp: 300 }, mentor: 'narrator', boss: true, review: true, tags: [],
      steps: [
        { type: 'talk', who: 'heartofcode', text: 'So. The one who learned to speak to me. Every program you ever wrote passed through me, {NAME}. Every print, every loop, every class.' },
        { type: 'talk', who: 'narrator', text: 'The Heart of Code has 300 HP. Everything you learned, all at once.' },
        { type: 'review', tags: HEART_TAGS(1, 20), reward: { spell: 'spark', power: 30 }, text: 'From the first worlds. What will it say?' },
        { type: 'review', tags: HEART_TAGS(21, 38), reward: { spell: 'fireball', power: 30 }, text: 'From the middle worlds. What will it say?' },
        { type: 'review', tags: HEART_TAGS(39, 50), reward: { spell: 'icebolt', power: 30 }, text: 'From the last worlds. What will it say?' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Beware the mirror.', code: ['def strike(n, log=[]):', '    log.append(n)', '    return len(log)', 'cast(spark, strike(1) + strike(1) * 10)'],
          explain: 'The default list is shared: the first call returns 1, the second 2, so 1 + 20.',
        },
        {
          type: 'fix', text: 'Every row of the grid changed. Run it, then tap the broken line.',
          goal: { output: 'auto' },
          code: ['grid = [[0] * 3] * 3', 'grid[0][0] = 9', 'print(sum(sum(row) for row in grid))', 'cast(fireball, 9)'], bad: 0,
          options: ['grid = [[0] * 3 for _ in range(3)]', 'grid = [[0, 0, 0]] * 3', 'grid = [[0] * 3] * 1 * 3'], answer: 0,
          explain: 'Build each row separately so they are not the same list.',
        },
        { type: 'talk', who: 'heartofcode', text: 'Then answer as I would: exactly.' },
        {
          type: 'fill', text: 'Floats are approximations. Compare them the safe way.',
          lines: ['import math', 'cast(icebolt, 20 if math.[](0.1 + 0.2, 0.3) else 1)'], chips: ['isclose', 'floor', 'isnan'], answer: [['isclose']],
          hints: ['The function for "close enough".', 'math.isclose'],
        },
        {
          type: 'write',
          text: 'The last spell. It has $HP HP. Write a generator charge(n) that yields n // 3 + 1 three times. Sum what charge($HP) yields and cast spark with it.',
          starter: [], keys: ['def', 'charge', '(', ')', ':', 'n', 'for', '_', 'in', 'range', '3', 'yield', '//', '+', '1', 'cast', 'spark', ',', 'sum', 'charge($HP)'],
          goal: { foeDown: true },
          require: l => (has(l, /yield/) ? null : 'Make charge a generator with yield.'),
          hints: ['def charge(n):\n    for _ in range(3):\n        yield n // 3 + 1', 'cast(spark, sum(charge($HP)))'],
          solution: ['def charge(n):', '    for _ in range(3):', '        yield n // 3 + 1', 'cast(spark, sum(charge($HP)))'],
        },
        { type: 'talk', who: 'heartofcode', text: '...you do not need me any more. You can write your own worlds now, {NAME}. Go and build them.' },
        { type: 'talk', who: 'narrator', text: 'You have beaten every world of Script & Sorcery. The Hard worlds are open; the Daily Tower climbs every day; Training remembers what you missed. And beyond this game: real projects, real code. Well done.' },
      ],
      learn: [{ title: 'The Heart of Code', code: 'print  if  for  def  class  with  yield  @decorator  import\n...and everything between', text: 'Everything. You know Python.' }],
    },
  ],
};
WORLDS.push(WORLD51);

(() => {
  const { makeQ, pick } = Arena;
  Object.assign(Arena.GEN, {
    gotchamix: () => pick([
      () => makeQ(['def f(x, acc=[]):', '    acc.append(x)', '    return acc', 'f(1)', 'print(f(2))'], ['[2]', '[1]', 'TypeError']),
      () => makeQ(['g = [[0]] * 2', 'g[0][0] = 5', 'print(g)'], ['[[5], [0]]', '[[0], [0]]', '[5, 5]']),
      () => makeQ(['print(round(2.5), round(1.5))'], ['3 2', '3 1', '2 1']),
      () => makeQ(['print("" or "x", 0 and 5)'], ['x 5', 'True False', '"" 0']),
      () => makeQ(['print(-9 // 4, -9 % 4)'], ['-2 -1', '-2 3', '-3 -3']),
      () => makeQ(['a = [1]', 'b = [1]', 'print(a == b, a is b)'], ['True True', 'False False', 'False True']),
    ])(),
  });
})();
