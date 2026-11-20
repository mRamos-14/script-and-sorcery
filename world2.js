/* World 2: The Counting House. Numbers: int and float, / // % **, order of operations,
   converting with int() float() str(), rounding, float precision, a first look at math.
   Sources: Py4E chapter 2, MIT 6.100L lectures 1-2, CS50P week 0. */
Object.assign(EXTRA.npcs, {
  tally: { name: 'Tally', colors: ['#c8a03a', '#5a3a24', '#ecb98d'] },
  minter: { name: 'Minter Hob', colors: ['#6a6a7a', '#d8d0c0', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  coinslime: { base: 'slime', name: 'Coin slime', pal: { G: '#e2b34a', L: '#fff1a8', D: '#a8711a', M: '#5a3a10' } },
  abacusbot: { base: 'sparkbot', name: 'Abacus bot', pal: { S: '#8a5a2b', Y: '#ffd75f', G: '#ff7a2b' } },
  goldgolem: { base: 'colossus', name: 'The Golden Golem', pal: { S: '#e2b34a', G: '#ff5f2b', Y: '#fff1a8', M: '#5a3a10' } },
});

const WORLD2 = {
  id: 2, name: 'The Counting House', topic: 'numbers: int, float, operators and rounding',
  nodes: [[50, 92], [24, 82], [66, 73], [34, 63], [70, 53], [30, 43], [64, 33], [38, 21], [54, 8]],
  levels: [
    {
      id: '2-1', title: 'Two kinds of numbers', bg: 'market', npc: 'tally', mentor: 'tally', tags: ['numtypes'],
      steps: [
        { type: 'talk', who: 'tally', text: "Welcome to the Counting House, {NAME}! I'm Tally, keeper of the ledgers. Every coin in this land passes through my books, and every number in Python has a type." },
        { type: 'talk', who: 'tally', text: 'Whole numbers like 7 or -3 are called int. Numbers with a decimal point, like 7.5 or 2.0, are called float. type() tells you which one you have.' },
        { type: 'demo', vars: R => ({ a: R.int(3, 9), b: R.pick(['2.5', '0.75', '9.0']) }), text: 'Run it and watch the types.', code: ['print(type($a))', 'print(type($b))'] },
        {
          type: 'predict', vars: R => R.pick([{ x: String(R.int(2, 99)) }, { x: R.int(1, 9) + '.' + R.int(0, 9) }, { x: R.int(1, 9) + '.0' }]),
          text: 'What will it say?', code: ['print(type($x))'],
          wrong: ["<class 'int'>", "<class 'float'>", "<class 'str'>"],
          explain: 'A dot makes a float, even when the part after it is 0.',
        },
        { type: 'talk', who: 'tally', text: 'Here is the first surprise. Dividing with / ALWAYS gives a float in Python 3, even when it divides evenly. 6 / 3 is 2.0, not 2.' },
        {
          type: 'predict', vars: R => { const b = R.int(2, 5); return { b, a: b * R.int(2, 6) }; },
          text: 'An even split. What will it say?', code: ['print($a / $b)'],
          wrong: ['$(a / b)', '$(a / b).00', '$(a % b)'],
          explain: '/ always gives a float, so $a / $b is $(a / b).0.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9), b: R.int(1, 9) }),
          text: 'Mixing an int and a float. What will it say?', code: ['print($a + $b.5)'],
          explain: 'When an int meets a float, the answer is a float.',
        },
        {
          type: 'fill', vars: R => ({ a: R.pick([5, 7, 9, 11]), b: 2 }),
          text: 'Make the spellbook show $(a / 2): divide $a coins between $b heroes exactly.',
          lines: ['print($a [] $b)'], chips: ['/', '//', '%'], answer: [['/']],
          hints: ['One slash gives the exact answer, with a decimal point.', 'print($a / $b)'],
        },
        {
          type: 'write', vars: R => { const b = R.int(2, 4); return { b, a: b * R.int(3, 8) + R.int(1, b - 1) }; },
          text: 'Print the exact result of dividing $a by $b.',
          starter: [], keys: ['print', '(', ')', '$a', '$b', '/'],
          require: l => (has(l, /\d\s*\/\s*\d/) && !has(l, /\/\//) ? null : 'Use a single / to divide.'),
          hints: ['One slash: /', 'print($a / $b)'],
          solution: ['print($a / $b)'],
        },
      ],
      learn: [
        { title: 'int and float', code: 'type(7)    → int\ntype(7.5)  → float', text: 'Whole numbers are int. Numbers with a decimal point are float.' },
        { title: '/ gives a float', code: '6 / 3 → 2.0', text: 'Plain division always gives a float, even when it divides evenly.' },
      ],
    },
    {
      id: '2-2', title: 'Splitting the gold', bg: 'market', npc: 'tally', mentor: 'tally', tags: ['floordiv'],
      steps: [
        { type: 'talk', who: 'tally', text: 'When heroes split gold, nobody gets half a coin. // is floor division: it divides and throws away the fraction. % is modulo: it gives what is left over.' },
        { type: 'demo', vars: R => { const h = R.int(3, 5); return { h, c: h * R.int(3, 6) + R.int(1, h - 1) }; }, text: '$c coins, $h heroes. Run it.', code: ['coins = $c', 'print(coins // $h)', 'print(coins % $h)'] },
        {
          type: 'predict', vars: R => { const n = R.int(3, 6); return { n, t: n * R.int(2, 7) + R.int(1, n - 1) }; },
          text: 'What will it say?', code: ['print($t // $n, $t % $n)'],
          wrong: ['$(t / n) $(t % n)', '$(Math.floor(t / n) + 1) $(t % n)', '$(t % n) $(Math.floor(t / n))'],
          explain: '$n goes into $t exactly $(Math.floor(t / n)) times, with $(t % n) left over.',
        },
        {
          type: 'predict', vars: R => ({ x: R.int(10, 99) }),
          text: 'n % 2 is 0 for even numbers and 1 for odd ones. What will it say?', code: ['n = $x', 'print(n % 2)'],
          explain: '$x is $(x % 2 ? "odd" : "even"), so the remainder after dividing by 2 is $(x % 2).',
        },
        { type: 'talk', who: 'tally', text: 'Careful with negative numbers. // rounds DOWN, toward minus infinity, not toward zero. So -7 // 2 is -4.' },
        {
          type: 'predict', vars: R => R.pick([{ a: 7, b: 2 }, { a: 9, b: 4 }, { a: 11, b: 3 }]),
          text: 'A negative split. What will it say?', code: ['print(-$a // $b)'],
          wrong: ['-$(Math.floor(a / b))', '$(Math.floor(a / b))', '-$(a / b)'],
          explain: '-$a / $b is $(-a / b). Rounding DOWN gives $(Math.floor(-a / b)).',
        },
        {
          type: 'fill', vars: R => ({ m: R.int(61, 239) }),
          text: 'Turn $m minutes into hours and minutes.',
          lines: ['m = $m', 'print(m [] 60, "h", m [] 60, "min")'], chips: ['//', '%', '/'], answer: [['//', '%']],
          hints: ['Whole hours: floor division. Leftover minutes: modulo.', 'm // 60 and m % 60'],
        },
        {
          type: 'fix', vars: R => { const h = R.int(3, 5); return { h, c: h * R.int(5, 9) + R.int(1, h - 1) }; },
          text: 'Each hero should get whole coins only, but this hands out fractions. Run it, then tap the broken line.',
          code: ['coins = $c', 'share = coins / $h', 'print(share)'], bad: 1,
          options: ['share = coins // $h', 'share = coins % $h', 'share = $h // coins'], answer: 0,
          explain: '// keeps only the whole part: $(Math.floor(c / h)) coins each.',
        },
        {
          type: 'write', vars: R => { const h = R.int(3, 6); return { h, c: h * R.int(3, 9) + R.int(1, h - 1) }; },
          text: '$c coins split between $h heroes. Print each share, then the coins left over, on two lines.',
          starter: ['coins = $c', 'heroes = $h'], keys: ['print', '(', ')', 'coins', 'heroes', '//', '%'],
          require: l => (has(l, /\/\//) && has(l, /%/) ? null : 'Use // for the share and % for the leftover.'),
          hints: ['Two prints.', 'print(coins // heroes) then print(coins % heroes)'],
          solution: ['print(coins // heroes)', 'print(coins % heroes)'],
        },
      ],
      learn: [
        { title: '// floor division', code: '17 // 5 → 3\n-7 // 2 → -4', text: 'Divides and rounds down to a whole number.' },
        { title: '% remainder', code: '17 % 5 → 2\nn % 2 == 0  (even)', text: 'What is left over after dividing. Great for even/odd checks and wrapping around.' },
      ],
    },
    {
      id: '2-3', title: 'Powers and order', bg: 'study', npc: 'minter', mentor: 'minter', tags: ['precedence'],
      steps: [
        { type: 'talk', who: 'minter', text: "I'm Minter Hob. I stamp coins, and I stamp them in the right ORDER. ** means power: 2 ** 3 is 2 × 2 × 2 = 8." },
        { type: 'talk', who: 'minter', text: 'Python follows the order from maths class: brackets first, then **, then * / // %, then + and -. Same level? Left to right.' },
        { type: 'demo', text: 'Run it and compare the last two lines.', code: ['print(2 ** 5)', 'print(2 + 3 * 4)', 'print((2 + 3) * 4)'] },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9), b: R.int(2, 6), c: R.int(2, 5) }),
          text: 'What will it say?', code: ['print($a + $b * $c)'],
          wrong: ['$((a + b) * c)', '$(a + b + c)'],
          explain: '* goes first: $b * $c = $(b * c), then + $a gives $(a + b * c).',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9), b: R.int(2, 6), c: R.int(2, 5) }),
          text: 'Brackets this time. What will it say?', code: ['print(($a + $b) * $c)'],
          wrong: ['$(a + b * c)', '$(a + b + c)'],
          explain: 'Brackets first: $(a + b), then times $c.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([2, 3, 4]) }),
          text: 'A trap even experts fall into. What will it say?', code: ['print(-$n ** 2)'],
          wrong: ['$(n * n)', '-$(n * 2)'],
          explain: '** is stronger than the minus sign, so it is -($n ** 2) = -$(n * n).',
        },
        {
          type: 'fill', vars: R => ({ s: R.int(3, 12) }),
          text: 'A square field has side $s. Print its area using a power.',
          lines: ['side = $s', 'print(side [] 2)'], chips: ['**', '*', '^'], answer: [['**']],
          hints: ['Area of a square is side to the power 2.', 'side ** 2'],
        },
        {
          type: 'fix', vars: R => { const a = R.int(2, 9) * 2, b = R.int(1, 9) * 2; return { a, b }; },
          text: 'This should print the average of $a and $b, which is $((a + b) / 2). Run it, then tap the broken line.',
          code: ['a = $a', 'b = $b', 'print(a + b / 2)'], bad: 2,
          options: ['print((a + b) / 2)', 'print(a + (b / 2))', 'print(a / 2 + b)'], answer: 0,
          explain: 'Without brackets, only b is divided. (a + b) / 2 adds first.',
        },
        {
          type: 'write', vars: R => ({ a: R.int(2, 30), b: R.int(2, 30), c: R.int(2, 30) }),
          text: 'Print the average of $a, $b and $c.',
          starter: [], keys: ['print', '(', ')', '+', '/', '3', '$a', '$b', '$c'],
          require: l => (has(l, /\(\s*\d+\s*\+\s*\d+\s*\+\s*\d+\s*\)\s*\/\s*3/) ? null : 'Add all three inside brackets, then divide by 3.'),
          hints: ['Brackets around the sum.', 'print(($a + $b + $c) / 3)'],
          solution: ['print(($a + $b + $c) / 3)'],
        },
      ],
      learn: [
        { title: '** power', code: '2 ** 3 → 8\n-2 ** 2 → -4', text: 'Power is done before almost everything, even before a minus sign in front.' },
        { title: 'Order of operations', code: '( )  **  * / // %  + -', text: 'Brackets first, then powers, then multiply and divide, then add and subtract.' },
      ],
    },
    {
      id: '2-4', title: 'Coin slimes', bg: 'alley', mentor: 'narrator', tags: [],
      foe: R => { const p = R.pick([4, 6, 8]), k = R.int(4, 6); return { kind: 'coinslime', hp: p * k, p, k }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Coin slimes ooze out of the vault! This one has $HP HP. Spells can do maths inside their brackets.' },
        { type: 'demo', vars: (R, c) => ({ p: c.foe.p }), text: 'One spark of $p times 2.', code: ['cast(spark, $p * 2)'] },
        {
          type: 'fill', vars: R => ({}),
          text: 'It has $HP HP left. Split it into two equal whole sparks.',
          lines: ['half = $HP [] 2', 'cast(spark, half)', 'cast(spark, half)'], chips: ['//', '%'], answer: [['//']],
          goal: { foeDown: true },
          hints: ['Floor division splits into whole parts.', 'half = $HP // 2'],
        },
        { type: 'talk', who: 'narrator', text: 'A bigger slime rolls in, with coins that do not split evenly.' },
        {
          type: 'write', vars: R => { const q = R.int(5, 9); const r = R.pick([1, 2]); return { q, r, hp: 3 * q + r }; },
          spawn: v => ({ kind: 'coinslime', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Cast spark with $hp // 3 three times, then finish it with icebolt and the leftover $hp % 3.',
          starter: [], keys: ['cast', 'spark', 'icebolt', '(', ')', ',', '$hp', '//', '%', '3'],
          goal: { foeDown: true },
          require: l => (has(l, /\/\/\s*3/) && has(l, /%\s*3/) ? null : 'Use // 3 for the sparks and % 3 for the icebolt.'),
          hints: ['Four lines: three sparks, one icebolt.', 'cast(spark, $hp // 3) three times, then cast(icebolt, $hp % 3)'],
          solution: ['cast(spark, $hp // 3)', 'cast(spark, $hp // 3)', 'cast(spark, $hp // 3)', 'cast(icebolt, $hp % 3)'],
        },
      ],
      learn: [{ title: 'Maths in spells', code: 'cast(spark, 12 // 2)', text: 'Python works out the maths first, then casts with the answer.' }],
    },
    {
      id: '2-5', title: 'Changing shape', bg: 'study', npc: 'tally', mentor: 'tally', tags: ['convert'],
      steps: [
        { type: 'talk', who: 'tally', text: 'Values can change type. int("42") turns text into the number 42. str(42) turns the number into the text "42". float("2.5") makes 2.5.' },
        { type: 'demo', vars: R => ({ a: R.int(2, 9), b: R.int(2, 9) }), text: 'Same digits, different types. Run it.', code: ['print("$a" + "$b")', 'print(int("$a") + int("$b"))'] },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9), b: R.int(10, 40) }),
          text: 'What will it say?', code: ['print(str($a) + str($b))'],
          wrong: ['$(a + b)', '$a + $b', 'Error'],
          explain: 'str() turns both into text, and + glues text together: $a$b.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(2, 9), d: R.int(1, 9) }),
          text: 'int() on a float. What will it say?', code: ['print(int($a.$d))'],
          wrong: ['$(a + 1)', '$a.$d', '$a.0'],
          explain: 'int() chops off the fraction. It does not round: int($a.$d) is $a.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ a: R.int(2, 9), d: R.int(1, 9) }),
          text: 'Text with a dot, straight into int(). Which error?', code: ['print(int("$a.$d"))'],
          explain: 'int() only reads whole-number text. "$a.$d" has a dot, so it raises ValueError. float("$a.$d") would work.',
        },
        { type: 'talk', who: 'tally', text: 'Remember input() from the village? It always gives text. To do maths with what someone types, convert it first.' },
        {
          type: 'fill', vars: R => ({ q: R.int(2, 6) }), input: ['2.5'],
          text: 'Someone types 2.5 as the price. Turn it into a number that can have a decimal point.',
          lines: ['price = [](input("Price? "))', 'print(price * $q)'], chips: ['float', 'int', 'str'], answer: [['float']],
          hints: ['2.5 has a decimal point.', 'float(input("Price? "))'],
        },
        {
          type: 'fix', vars: R => ({ a: R.int(9, 40) }), input: ['$a'],
          text: 'Someone types $a. This should say how old they will be next year. Run it, then tap the broken line.',
          code: ['age = input("Age? ")', 'print(age + 1)'], bad: 0,
          options: ['age = int(input("Age? "))', 'age = str(input("Age? "))', 'age = input(int("Age? "))'], answer: 0,
          explain: 'input() gives text. int() turns it into a number before adding 1.',
        },
        {
          type: 'write', vars: R => ({ c: R.int(3, 40) }), input: ['$c'],
          text: 'Ask for a number of coins with input, then print double that number. (Someone types $c.)',
          starter: [], keys: ['coins', '=', 'int', 'input', '(', ')', '"Coins? "', 'print', '*', '2'],
          require: l => (has(l, /int\s*\(\s*input/) ? null : 'Wrap input() in int() so you can do maths.'),
          hints: ['coins = int(input("Coins? "))', 'Then print(coins * 2)'],
          solution: ['coins = int(input("Coins? "))', 'print(coins * 2)'],
        },
      ],
      learn: [
        { title: 'Converting', code: 'int("42") → 42\nstr(42) → "42"\nfloat("2.5") → 2.5', text: 'Change a value into another type. int() cuts off decimals: int(3.9) is 3.' },
        { title: 'Numbers from input', code: 'n = int(input("N? "))', text: 'input() always gives text. Convert it before doing maths.' },
      ],
    },
    {
      id: '2-6', title: 'Rounding the ledger', bg: 'market', npc: 'tally', mentor: 'tally', tags: ['rounding'],
      steps: [
        { type: 'talk', who: 'tally', text: 'Ledgers need tidy numbers. round(x) rounds to a whole number. round(x, 2) keeps 2 digits after the point. abs(x) drops the minus sign.' },
        { type: 'demo', text: 'Run it.', code: ['print(round(3.7))', 'print(round(3.14159, 2))', 'print(abs(-12))'] },
        {
          type: 'predict', vars: R => R.pick([{ x: '2.71828', n: 2 }, { x: '9.87654', n: 1 }, { x: '1.41421', n: 3 }, { x: '6.66666', n: 2 }]),
          text: 'What will it say?', code: ['print(round($x, $n))'],
          explain: 'Keep $n digits after the point and round the next one.',
        },
        { type: 'talk', who: 'tally', text: 'A Python secret: halves round to the nearest EVEN number. round(2.5) is 2, but round(3.5) is 4. Bankers use this so rounding errors cancel out.' },
        {
          type: 'predict', vars: R => R.pick([{ a: '2.5', b: '3.5' }, { a: '4.5', b: '5.5' }, { a: '0.5', b: '1.5' }]),
          text: 'Two halves. What will it say?', code: ['print(round($a), round($b))'],
          wrong: ['$(Math.ceil(+a)) $(Math.ceil(+b))', '$(Math.floor(+a)) $(Math.floor(+b))'],
          explain: 'Exact halves go to the even neighbour, so one rounds down and the other rounds up.',
        },
        {
          type: 'predict', vars: R => { const a = R.int(10, 40), b = a + R.int(5, 30); return { a, b }; },
          text: 'How far apart are two numbers? What will it say?', code: ['print(abs($a - $b))'],
          wrong: ['-$(b - a)', '$(a + b)'],
          explain: '$a - $b is -$(b - a). abs() drops the sign.',
        },
        {
          type: 'fill', vars: R => { const a = R.int(10, 99), b = R.int(10, 99); let c = R.int(10, 98); if ((a + b + c) % 3 === 0) c++; return { a, b, c }; },
          text: 'Print the average of the three scores, rounded to 1 digit after the point.',
          lines: ['total = $a + $b + $c', 'print([](total / 3, []))'], chips: ['round', 'int', '1', '2'], answer: [['round', '1']],
          hints: ['round(value, digits)', 'round(total / 3, 1)'],
        },
        {
          type: 'write', vars: R => ({ x: R.pick(['3.14159', '2.71828', '1.61803', '9.80665']) }),
          text: 'Print $x rounded to 2 digits after the point.',
          starter: [], keys: ['print', 'round', '(', ')', ',', '2', '$x'],
          require: l => (has(l, /round\s*\(/) ? null : 'Use round(number, 2).'),
          hints: ['round takes a second number: how many digits.', 'print(round($x, 2))'],
          solution: ['print(round($x, 2))'],
        },
      ],
      learn: [
        { title: 'round and abs', code: 'round(3.14159, 2) → 3.14\nabs(-5) → 5', text: 'round to tidy decimals, abs for distance without a sign.' },
        { title: "Banker's rounding", code: 'round(2.5) → 2\nround(3.5) → 4', text: 'Exact halves round to the even neighbour.' },
      ],
    },
    {
      id: '2-7', title: 'The leaky scale', bg: 'vault', npc: 'minter', mentor: 'minter', tags: ['floatprec'],
      steps: [
        { type: 'talk', who: 'minter', text: 'My scale leaks, {NAME}. Floats are stored in binary, and some decimals, like 0.1, cannot be stored exactly. Tiny errors creep in.' },
        { type: 'demo', text: 'Run it. Look closely at the first line.', code: ['print(0.1 + 0.2)', 'print(0.1 + 0.2 == 0.3)'] },
        {
          type: 'predict', vars: R => R.pick([{ a: '0.1', b: '0.2', c: '0.3' }, { a: '0.1', b: '0.7', c: '0.8' }, { a: '0.3', b: '0.6', c: '0.9' }]),
          text: 'Can you trust == with floats? What will it say?', code: ['print($a + $b == $c)'],
          explain: '$a + $b is really $((+a + +b).toString()) inside the computer, so == says $(+a + +b === +c ? "True" : "False").',
        },
        {
          type: 'predict', text: 'Rounding first. What will it say?', code: ['total = 0.1 + 0.2', 'print(round(total, 2) == 0.3)'],
          wrong: ['False', '0.3'],
          explain: 'round() trims the tiny error away, so the two match.',
        },
        { type: 'talk', who: 'minter', text: 'The safest trick for money: count whole cents with ints. A price of 1.10 becomes 110 cents. Ints never leak.' },
        {
          type: 'predict', vars: R => ({ p: R.pick([110, 125, 199, 250]), n: R.int(2, 4) }),
          text: 'Prices in cents. What will it say?', code: ['price = $p', 'total = price * $n', 'print(total)', 'print(total / 100)'],
          explain: '$p × $n = $(p * n) cents. Dividing by 100 turns cents into coins.',
        },
        {
          type: 'fill', vars: R => ({}),
          text: 'math.isclose checks whether two floats are close enough. Make it say True.',
          lines: ['import math', 'print(math.isclose(0.1 + 0.2, []))'], chips: ['0.3', '3', '0.03'], answer: [['0.3']],
          hints: ['Compare with the value you expected.', 'math.isclose(0.1 + 0.2, 0.3)'],
        },
        {
          type: 'fix', text: 'The scale should say True, but it says False. Run it, then tap the broken line.',
          code: ['weight = 0.1 + 0.2', 'print(weight == 0.3)'], bad: 1,
          options: ['print(round(weight, 2) == 0.3)', 'print(weight = 0.3)', 'print(int(weight) == 0.3)'], answer: 0,
          explain: 'Round away the tiny error before comparing floats.',
        },
        {
          type: 'write', vars: R => ({ a: R.pick([120, 135, 250, 99]), b: R.pick([45, 80, 199, 310]) }),
          text: 'An apple costs $a cents and a pear $b cents. Print the total in cents, then in coins (divide by 100).',
          starter: ['apple = $a', 'pear = $b'], keys: ['total', '=', 'apple', '+', 'pear', 'print', '(', ')', '/', '100'],
          require: l => (has(l, /\/\s*100/) ? null : 'Divide the cents by 100 for coins.'),
          hints: ['total = apple + pear', 'print(total) then print(total / 100)'],
          solution: ['total = apple + pear', 'print(total)', 'print(total / 100)'],
        },
      ],
      learn: [
        { title: 'Floats leak', code: '0.1 + 0.2 → 0.30000000000000004', text: 'Never compare floats with ==. Round them, or use math.isclose.' },
        { title: 'Money in cents', code: 'price = 110  # cents', text: 'Count money in whole cents with ints to avoid float errors.' },
      ],
    },
    {
      id: '2-8', title: 'Abacus bots', bg: 'gearworks', mentor: 'narrator', tags: ['mathmod'],
      foe: R => { const k = R.int(3, 6); return { kind: 'abacusbot', hp: 2 * k * k + 1 + 2 * R.int(1, 4) + 2 * k, k }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Abacus bots clatter in! import math borrows Python\'s maths spellbook: math.floor rounds down, math.ceil rounds UP, math.sqrt finds a square root.' },
        { type: 'demo', vars: (R, c) => ({ k: c.foe.k }), text: 'A square-root spark.', code: ['import math', 'cast(spark, math.sqrt($(4 * k * k)))'] },
        {
          type: 'predict', vars: R => R.pick([{ x: '4.2' }, { x: '7.8' }, { x: '2.5' }]),
          text: 'What will it say?', code: ['import math', 'print(math.floor($x), math.ceil($x))'],
          explain: 'floor goes down to $(Math.floor(+x)), ceil goes up to $(Math.ceil(+x)).',
        },
        {
          type: 'fill', vars: R => ({}),
          text: 'It has $HP HP left. Two equal fireballs must be ENOUGH, even though $HP is odd. Round the half up.',
          lines: ['import math', 'half = math.[]($HP / 2)', 'cast(fireball, half)', 'cast(fireball, half)'], chips: ['ceil', 'floor', 'sqrt'], answer: [['ceil']],
          goal: { foeDown: true },
          hints: ['Rounding down leaves 1 HP standing.', 'math.ceil($HP / 2)'],
        },
        { type: 'talk', who: 'narrator', text: 'One more bot, armoured in squares.' },
        {
          type: 'write', vars: R => { const k = R.int(4, 9), extra = R.int(3, 15); return { k, sq: k * k, hp: k + extra, extra }; },
          spawn: v => ({ kind: 'abacusbot', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Cast icebolt with math.sqrt($sq), then cast spark with $hp minus that root.',
          starter: ['import math'], keys: ['root', '=', 'math.sqrt', '(', ')', '$sq', 'cast', 'icebolt', 'spark', ',', '$hp', '-'],
          goal: { foeDown: true },
          require: l => (has(l, /math\.sqrt\s*\(/) ? null : 'Use math.sqrt to find the root.'),
          hints: ['Store the root: root = math.sqrt($sq)', 'cast(icebolt, root) then cast(spark, $hp - root)'],
          solution: ['root = math.sqrt($sq)', 'cast(icebolt, root)', 'cast(spark, $hp - root)'],
        },
      ],
      learn: [{ title: 'math basics', code: 'import math\nmath.floor(4.7) → 4\nmath.ceil(4.2) → 5\nmath.sqrt(16) → 4.0', text: 'floor rounds down, ceil rounds up, sqrt finds square roots.' }],
    },
    {
      id: '2-9', title: 'The Golden Golem', bg: 'palace', foe: { kind: 'goldgolem', hp: 150, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'goldgolem', text: 'COUNT... THE... COINS... ALL... MINE...' },
        { type: 'talk', who: 'narrator', text: 'The Golden Golem has 150 HP. Icebolt cracks gold: double damage. Fireball only melts it a little: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => { const b = R.int(2, 4); return { b, a: b * R.int(4, 8) + R.int(1, b - 1) }; },
          text: 'How much damage will this deal? Remember icebolt is doubled.', code: ['cast(icebolt, $a // $b)'],
          explain: '$a // $b is $(Math.floor(a / b)), doubled.',
        },
        {
          type: 'fix', vars: R => ({ a: R.int(3, 6), b: R.int(3, 6) }),
          text: 'This should strike with ($a + $b) × 2. Run it, then tap the broken line.',
          code: ['power = $a + $b * 2', 'print(power)', 'cast(spark, power)'], bad: 0,
          options: ['power = ($a + $b) * 2', 'power = $a + ($b * 2)', 'power = $a * $b + 2'], answer: 0,
          explain: 'Brackets make the adding happen first.',
        },
        { type: 'talk', who: 'goldgolem', text: 'TELL... ME... YOUR... POWER...' },
        {
          type: 'fill', vars: R => ({ p: R.int(8, 14) }), input: ['$p'],
          text: 'Someone shouts "$p" as your power. Turn it into a number and cast icebolt.',
          lines: ['power = [](input("Power? "))', 'cast(icebolt, power)'], chips: ['int', 'str', 'round'], answer: [['int']],
          hints: ['input() gives text. Spells need numbers.', 'int(input("Power? "))'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Cast icebolt with $HP // 2 + 1: half its HP, plus 1 to be safe.',
          starter: [], keys: ['cast', 'icebolt', '(', ')', ',', '$HP', '//', '+', '1', '2'],
          goal: { foeDown: true },
          require: l => (has(l, /\/\/\s*2/) ? null : 'Use $HP // 2 + 1 for the icebolt.'),
          hints: ['Doubled damage means half the power is enough.', 'cast(icebolt, $HP // 2 + 1)'],
          solution: ['cast(icebolt, $HP // 2 + 1)'],
        },
        { type: 'talk', who: 'goldgolem', text: '...the... ledger... balances...' },
      ],
      learn: [{ title: 'Number toolkit', code: '/  //  %  **  round()  abs()  int()  float()', text: 'Everything from the Counting House: two kinds of numbers and how to work with them.' }],
    },
  ],
};
WORLDS.push(WORLD2);

/* Training questions for this world's topics */
(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    numtypes: () => {
      const v = rnd(0, 2), a = rnd(2, 9), b = rnd(2, 5);
      if (v === 0) return makeQ([`print(${a * b} / ${b})`], [a, `${a}.00`]);
      if (v === 1) return makeQ([`print(type(${a}.0))`], ["<class 'int'>", "<class 'str'>"]);
      return makeQ([`print(${a} * 2.0)`], [a * 2, `${a}2.0`]);
    },
    floordiv: () => {
      const n = rnd(3, 6), t = n * rnd(2, 8) + rnd(1, n - 1), v = rnd(0, 2);
      if (v === 0) return makeQ([`print(${t} // ${n})`], [(t / n).toFixed(1), Math.floor(t / n) + 1]);
      if (v === 1) return makeQ([`print(${t} % ${n})`], [Math.floor(t / n), n - (t % n)]);
      return makeQ([`print(-${t} // ${n})`], [-Math.floor(t / n), Math.floor(t / n)]);
    },
    precedence: () => {
      const a = rnd(2, 9), b = rnd(2, 6), c = rnd(2, 5), v = rnd(0, 2);
      if (v === 0) return makeQ([`print(${a} + ${b} * ${c})`], [(a + b) * c, a + b + c]);
      if (v === 1) return makeQ([`print(${a} * ${b} ** 2)`], [(a * b) ** 2, a * b * 2]);
      return makeQ([`print(-${b} ** 2)`], [b * b, -b * 2]);
    },
    convert: () => {
      const a = rnd(2, 9), b = rnd(2, 9), v = rnd(0, 2);
      if (v === 0) return makeQ([`print("${a}" + "${b}")`], [a + b, 'Error']);
      if (v === 1) return makeQ([`print(int(${a}.${b}))`], [a + 1, `${a}.${b}`]);
      return makeQ([`print(int("${a}.${b}"))`], [a, `${a}.${b}`]);
    },
    rounding: () => {
      const v = rnd(0, 2);
      if (v === 0) { const x = pick(['2.5', '4.5', '6.5']); return makeQ([`print(round(${x}))`], [Math.ceil(+x), x]); }
      if (v === 1) { const x = pick(['3.14159', '2.71828', '1.41421']); return makeQ([`print(round(${x}, 2))`], [x.slice(0, 3), x.slice(0, 5)]); }
      const a = rnd(3, 20), b = a + rnd(2, 20); return makeQ([`print(abs(${a} - ${b}))`], [a - b, a + b]);
    },
    floatprec: () => {
      const v = rnd(0, 1);
      if (v === 0) return makeQ(['print(0.1 + 0.2 == 0.3)'], ['True', '0.3']);
      return makeQ(['print(round(0.1 + 0.2, 1) == 0.3)'], ['False', '0.3']);
    },
    mathmod: () => {
      const x = pick(['4.2', '7.8', '2.5']), v = rnd(0, 1);
      if (v === 0) return makeQ(['import math', `print(math.floor(${x}), math.ceil(${x}))`], [`${Math.ceil(+x)} ${Math.floor(+x)}`, `${Math.round(+x)} ${Math.round(+x)}`]);
      const k = rnd(3, 9); return makeQ(['import math', `print(math.sqrt(${k * k}))`], [k, k * k]);
    },
  });
})();
