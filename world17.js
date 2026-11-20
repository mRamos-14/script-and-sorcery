/* World 17: The Guessing Halls. Guess-and-check, exhaustive enumeration, approximate
   solutions with epsilon, bisection search (on whole numbers and on floats), and
   Newton-Raphson. Source: MIT 6.100L lectures 3-4. Floats are printed rounded so the
   answers are easy to read. */
Object.assign(EXTRA.npcs, {
  pell: { name: 'Augur Pell', colors: ['#3f6a8f', '#f3efe6', '#ecb98d'] },
});
Object.assign(EXTRA.foes, {
  riddlewisp: { base: 'wisp', name: 'Riddle wisp', pal: { F: '#f0c53a', L: '#fff1a8' } },
  guessgolem: { base: 'golem', name: 'Guess golem', pal: { S: '#6a8a9a', G: '#ffd75f' } },
  guesssphinx: { base: 'sphinx', name: 'The Guessing Sphinx', pal: { Y: '#9a7fd6', B: '#2f4f8f' } },
});

const WORLD17 = {
  id: 17, name: 'The Guessing Halls', topic: 'guess-and-check, bisection and approximation',
  nodes: [[50, 92], [28, 82], [66, 72], [34, 62], [66, 52], [32, 42], [64, 32], [40, 21], [52, 8]],
  levels: [
    {
      id: '17-1', title: 'Guess and check', bg: 'observatory', npc: 'pell', mentor: 'pell', tags: ['guesscheck'],
      steps: [
        { type: 'talk', who: 'pell', text: "Welcome, {NAME}, to the Guessing Halls. I'm Augur Pell. When you cannot work an answer out directly, a computer can simply GUESS, check, and guess again, very fast. This is guess-and-check." },
        { type: 'talk', who: 'pell', text: 'To find a cube root, try every whole number g until g ** 3 reaches the target. If we pass it without a match, it was not a perfect cube.' },
        { type: 'demo', vars: R => ({ c: R.pick([27, 64, 125, 216]) }), text: 'Run it.', code: ['cube = $c', 'for guess in range(cube + 1):', '    if guess ** 3 >= cube:', '        break', 'if guess ** 3 == cube:', '    print("cube root of", cube, "is", guess)', 'else:', '    print(cube, "is not a perfect cube")'] },
        {
          type: 'predict', vars: R => ({ c: R.pick([8, 27, 30, 64, 100, 125]) }),
          text: 'What will it say?', code: ['cube = $c', 'for guess in range(cube + 1):', '    if guess ** 3 >= cube:', '        break', 'if guess ** 3 == cube:', '    print(guess)', 'else:', '    print("no")'],
          explain: 'The loop stops at the first guess whose cube is big enough. Then we check for an exact match.',
        },
        {
          type: 'predict', vars: R => ({ c: R.pick([27, 64, 125]) }),
          text: 'How many guesses did it take? What will it say?', code: ['cube = $c', 'tries = 0', 'for guess in range(cube + 1):', '    tries += 1', '    if guess ** 3 >= cube:', '        break', 'print(tries)'],
          explain: 'Guesses start at 0, so the answer $(Math.round(Math.cbrt(c))) is found on try $(Math.round(Math.cbrt(c)) + 1).',
        },
        {
          type: 'fill', vars: R => ({ s: R.pick([16, 49, 81, 144]) }),
          text: 'Find the square root of $s by guess-and-check.',
          lines: ['n = $s', 'for g in range(n + 1):', '    if g [] 2 == n:', '        print(g)'], chips: ['**', '*', '//'], answer: [['**']],
          hints: ['Square the guess.', 'g ** 2 == n'],
        },
        {
          type: 'write', vars: R => ({ t: R.pick([30, 42, 56, 72, 90]) }),
          text: 'Find the whole number g where g * (g + 1) == $t. Loop g over range($t) and print g when it matches.',
          starter: [], keys: ['for', 'g', 'in', 'range', '(', ')', ':', 'if', '*', '+', '1', '==', '$t', 'print'],
          require: l => (has(l, /for\s+g\s+in\s+range/) ? null : 'Guess every g with a for loop.'),
          hints: ['for g in range($t):', '    if g * (g + 1) == $t: / print(g)'],
          solution: ['for g in range($t):', '    if g * (g + 1) == $t:', '        print(g)'],
        },
      ],
      learn: [{ title: 'Guess and check', code: 'for g in range(n + 1):\n    if good(g):\n        break', text: 'Try every possible answer in order until one works. Simple and always right, but can be slow.' }],
    },
    {
      id: '17-2', title: 'Every combination', bg: 'study', npc: 'pell', mentor: 'pell', tags: ['enumerate2'],
      steps: [
        { type: 'talk', who: 'pell', text: 'Exhaustive enumeration: when there are two unknowns, nest the loops and try EVERY pair. The classic farmyard riddle: 20 heads and 56 legs. How many chickens and pigs?' },
        { type: 'demo', text: 'Run it.', code: ['heads, legs = 20, 56', 'for pigs in range(heads + 1):', '    chickens = heads - pigs', '    if 4 * pigs + 2 * chickens == legs:', '        print(pigs, "pigs and", chickens, "chickens")'] },
        {
          type: 'predict', vars: R => { const p = R.int(2, 8), c = R.int(2, 8); return { h: p + c, l: 4 * p + 2 * c }; },
          text: 'What will it say?', code: ['heads, legs = $h, $l', 'for pigs in range(heads + 1):', '    chickens = heads - pigs', '    if 4 * pigs + 2 * chickens == legs:', '        print(pigs, chickens)'],
          explain: 'Only one split of the heads gives exactly $l legs.',
        },
        {
          type: 'predict', vars: R => ({ t: R.pick([5, 6, 7]) }),
          text: 'Pairs that add up. What will it say?', code: ['count = 0', 'for a in range(1, $t):', '    for b in range(a, $t):', '        if a + b == $t:', '            count += 1', 'print(count)'],
          explain: 'With a ≤ b, the pairs adding to $t are counted once each.',
        },
        {
          type: 'fill', vars: R => { const p = R.int(2, 6), c = R.int(2, 6); return { h: p + c, l: 4 * p + 2 * c }; },
          text: 'Solve the riddle: check that the legs add up.',
          lines: ['heads, legs = $h, $l', 'for pigs in range(heads + 1):', '    chickens = heads - pigs', '    if 4 * pigs + 2 * [] == legs:', '        print(pigs, chickens)'], chips: ['chickens', 'pigs', 'heads'], answer: [['chickens']],
          hints: ['Chickens have 2 legs.', '2 * chickens'],
        },
        {
          type: 'write', vars: R => { const a = R.int(2, 9), b = R.int(2, 9); return { s: a + b, p: a * b }; },
          text: 'Find two whole numbers a ≤ b (each from 1 to 20) that add up to $s and multiply to $p. Print a and b.',
          starter: [], keys: ['for', 'a', 'b', 'in', 'range', '(', ')', '1', '21', ',', ':', 'if', '+', '*', '==', 'and', '<=', '$s', '$p', 'print'],
          require: l => ((typed(l).match(/\bfor\b/g) || []).length >= 2 ? null : 'Use two nested for loops.'),
          hints: ['for a in range(1, 21): / for b in range(a, 21):', 'if a + b == $s and a * b == $p: / print(a, b)'],
          solution: ['for a in range(1, 21):', '    for b in range(a, 21):', '        if a + b == $s and a * b == $p:', '            print(a, b)'],
        },
      ],
      learn: [{ title: 'Exhaustive enumeration', code: 'for a in ...:\n    for b in ...:\n        if works(a, b): ...', text: 'Try every combination. Correct, but the work multiplies with each loop.' }],
    },
    {
      id: '17-3', title: 'Close enough', bg: 'observatory', npc: 'pell', mentor: 'pell', tags: ['approx'],
      steps: [
        { type: 'talk', who: 'pell', text: 'The square root of 2 is not a whole number, and not even a finite decimal. So we accept CLOSE ENOUGH: stop when abs(guess ** 2 - x) < epsilon, a tiny number we choose.' },
        { type: 'demo', text: 'Creep up in tiny steps. Run it.', code: ['x = 25', 'epsilon = 0.01', 'step = 0.01', 'guess = 0.0', 'while abs(guess ** 2 - x) >= epsilon and guess <= x:', '    guess += step', 'print(round(guess, 2))'] },
        {
          type: 'predict', vars: R => ({ x: R.pick([9, 16, 36]) }),
          text: 'What will it say?', code: ['x = $x', 'guess = 0.0', 'while abs(guess ** 2 - x) >= 0.01:', '    guess += 0.01', 'print(round(guess, 1))'],
          explain: 'The guess creeps up until its square is within 0.01 of $x: about $(Math.sqrt(x)).',
        },
        {
          type: 'predict', vars: R => ({ s: R.pick(['0.1', '0.5']) }),
          text: 'A bigger step can jump right past the answer. What will it say?', code: ['x = 2', 'guess = 0.0', 'steps = 0', 'while abs(guess ** 2 - x) >= 0.01 and guess <= x:', '    guess += $s', '    steps += 1', 'print(round(guess, 1), steps)'],
          explain: 'With step $s the guesses never land close enough to the square root of 2, so the loop only stops when guess passes x.',
        },
        {
          type: 'fill', vars: R => ({ x: R.pick([4, 9, 49]) }),
          text: 'Stop when the guess is close ENOUGH.',
          lines: ['x = $x', 'guess = 0.0', 'while abs(guess ** 2 - x) [] 0.01:', '    guess += 0.01', 'print(round(guess))'], chips: ['>=', '<', '=='], answer: [['>=']],
          hints: ['Keep going while it is still too far away.', 'abs(...) >= 0.01'],
        },
        {
          type: 'write', vars: R => ({ x: R.pick([4, 9, 16]) }),
          text: 'Approximate the square root of $x: start guess at 0.0, add 0.01 while abs(guess ** 2 - $x) >= 0.01, then print round(guess, 1).',
          starter: [], keys: ['guess', '=', '0.0', 'while', 'abs', '(', ')', '**', '2', '-', '$x', '>=', '0.01', ':', '+=', 'print', 'round', ',', '1'],
          require: l => (has(l, /while\s+abs\s*\(/) ? null : 'Loop while abs(guess ** 2 - x) is still too big.'),
          hints: ['while abs(guess ** 2 - $x) >= 0.01:', '    guess += 0.01, then print(round(guess, 1))'],
          solution: ['guess = 0.0', 'while abs(guess ** 2 - $x) >= 0.01:', '    guess += 0.01', 'print(round(guess, 1))'],
        },
      ],
      learn: [{ title: 'Approximation', code: 'while abs(guess ** 2 - x) >= epsilon:\n    guess += step', text: 'Accept an answer that is close enough. Small steps are accurate but slow; big steps can overshoot.' }],
    },
    {
      id: '17-4', title: 'Riddle wisps', bg: 'study', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), c = R.pick([27, 64, 125]); return { kind: 'riddlewisp', hp: d + 3 * Math.round(Math.cbrt(c)), d, c }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Riddle wisps! $HP HP. They only fall to answers you FIND, not answers you know.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ c: c.foe.c }),
          text: 'It has $HP HP left: three times the cube root of $c. Find the root by guessing, then cast fireball three times.',
          lines: ['for g in range($c + 1):', '    if g ** 3 [] $c:', '        break', 'for i in range(3):', '    cast(fireball, g)'], chips: ['==', '!=', '<'], answer: [['==']],
          goal: { foeDown: true },
          hints: ['Stop when the cube matches exactly.', 'g ** 3 == $c'],
        },
        { type: 'talk', who: 'narrator', text: 'A wisp made of two riddles!' },
        {
          type: 'write', vars: R => { const a = R.int(3, 7), b = R.int(3, 7); return { s: a + b, p: a * b, hp: (a + b) * 2 }; },
          spawn: v => ({ kind: 'riddlewisp', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Find a ≤ b (1 to 10) with a + b == $s and a * b == $p, then cast icebolt with a + b, twice.',
          starter: [], keys: ['for', 'a', 'b', 'in', 'range', '(', ')', '1', '11', ',', ':', 'if', '+', '*', '==', 'and', 'cast', 'icebolt', '$s', '$p'],
          goal: { foeDown: true },
          require: l => ((typed(l).match(/\bfor\b/g) || []).length >= 2 ? null : 'Search with two nested loops.'),
          hints: ['for a in range(1, 11): / for b in range(a, 11):', 'if a + b == $s and a * b == $p: cast twice'],
          solution: ['for a in range(1, 11):', '    for b in range(a, 11):', '        if a + b == $s and a * b == $p:', '            cast(icebolt, a + b)', '            cast(icebolt, a + b)'],
        },
      ],
      learn: [{ title: 'Search, then strike', code: 'for g in range(n + 1):\n    if g ** 3 == n: break', text: 'A found answer is as good as a known one.' }],
    },
    {
      id: '17-5', title: 'Halving the hall', bg: 'observatory', npc: 'pell', mentor: 'pell', tags: ['bisectint'],
      steps: [
        { type: 'talk', who: 'pell', text: 'Guessing every number is slow. BISECTION is clever: guess the MIDDLE. Too low? Throw away the bottom half. Too high? Throw away the top. Each guess halves what is left.' },
        { type: 'talk', who: 'pell', text: 'Think of me guessing your secret number from 0 to 100. I need at most 7 guesses, because 100 halved 7 times is less than 1.' },
        { type: 'demo', vars: R => ({ s: R.int(1, 99) }), text: 'Run it.', code: ['secret = $s', 'low, high = 0, 100', 'guesses = 0', 'while True:', '    guess = (low + high) // 2', '    guesses += 1', '    if guess == secret:', '        break', '    elif guess < secret:', '        low = guess + 1', '    else:', '        high = guess - 1', 'print("found", guess, "in", guesses, "guesses")'] },
        {
          type: 'predict', vars: R => ({ s: R.pick([25, 50, 75, 12, 88]) }),
          text: 'What is the first guess, and the second? What will it say?', code: ['secret = $s', 'low, high = 0, 100', 'for i in range(2):', '    guess = (low + high) // 2', '    print(guess)', '    if guess < secret:', '        low = guess + 1', '    elif guess > secret:', '        high = guess - 1'],
          explain: 'First the middle of 0..100. Then the middle of whichever half could still hold $s.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick([16, 100, 1000, 1000000]) }),
          text: 'How many halvings until 1 is left? What will it say?', code: ['n = $n', 'count = 0', 'while n > 1:', '    n = n // 2', '    count += 1', 'print(count)'],
          explain: 'Halving shrinks things FAST. That count is about log₂ of the size.',
        },
        {
          type: 'fill', vars: R => ({ s: R.int(1, 63) }),
          text: 'Too low means the answer is above the guess. Move the right end.',
          lines: ['secret = $s', 'low, high = 0, 63', 'while low <= high:', '    guess = (low + high) // 2', '    if guess == secret:', '        print(guess)', '        break', '    elif guess < secret:', '        [] = guess + 1', '    else:', '        high = guess - 1'], chips: ['low', 'high', 'guess'], answer: [['low']],
          hints: ['The bottom of the range moves up.', 'low = guess + 1'],
        },
        {
          type: 'fix', vars: R => ({ s: R.int(60, 99) }),
          text: 'This search for $s never finishes. Run it, then tap the broken line.',
          code: ['secret = $s', 'low, high = 0, 100', 'steps = 0', 'while low <= high and steps < 20:', '    steps += 1', '    guess = (low + high) // 2', '    if guess == secret:', '        break', '    elif guess < secret:', '        high = guess - 1', '    else:', '        high = guess - 1', 'print(guess, steps)'], bad: 9,
          options: ['        low = guess + 1', '        low = 0', '        high = guess + 1'], answer: 0,
          explain: 'When the guess is too low, the bottom of the range must move up.',
        },
        {
          type: 'write', vars: R => ({ n: R.pick([64, 500, 4096]) }),
          text: 'Print how many times $n can be halved (with //) before it reaches 1.',
          starter: ['n = $n'], keys: ['count', '=', '0', 'while', 'n', '>', '1', ':', '//', '2', '+=', 'print'],
          require: l => (has(l, /while\s+/) && has(l, /\/\/\s*2/) ? null : 'Halve n with // 2 in a while loop.'),
          hints: ['count = 0 / while n > 1:', '    n = n // 2 / count += 1, then print(count)'],
          solution: ['count = 0', 'while n > 1:', '    n = n // 2', '    count += 1', 'print(count)'],
        },
      ],
      learn: [{ title: 'Bisection search', code: 'guess = (low + high) // 2\ntoo low:  low = guess + 1\ntoo high: high = guess - 1', text: 'Halve the possibilities each guess: about log₂(n) guesses instead of n.' }],
    },
    {
      id: '17-6', title: 'Halving to a root', bg: 'study', npc: 'pell', mentor: 'pell', tags: ['bisectfloat'],
      steps: [
        { type: 'talk', who: 'pell', text: 'Bisection works on decimals too. The square root of x lies between 0 and x (for x ≥ 1). Try the middle, square it, and keep the half that still holds the answer, until it is close enough.' },
        { type: 'demo', text: 'Run it.', code: ['x = 25', 'low, high = 0.0, x', 'guess = (low + high) / 2', 'steps = 0', 'while abs(guess ** 2 - x) >= 0.01:', '    if guess ** 2 < x:', '        low = guess', '    else:', '        high = guess', '    guess = (low + high) / 2', '    steps += 1', 'print(round(guess, 2), steps)'] },
        {
          type: 'predict', vars: R => ({ x: R.pick([16, 49, 81]) }),
          text: 'What will it say?', code: ['x = $x', 'low, high = 0.0, x', 'guess = (low + high) / 2', 'while abs(guess ** 2 - x) >= 0.001:', '    if guess ** 2 < x:', '        low = guess', '    else:', '        high = guess', '    guess = (low + high) / 2', 'print(round(guess, 1))'],
          explain: 'The bracket around the root keeps halving until guess is about $(Math.sqrt(x)).',
        },
        {
          type: 'predict', vars: R => ({ x: R.pick([2, 3, 10]) }),
          text: 'Just the first two guesses. What will it say?', code: ['x = $x', 'low, high = 0.0, x', 'for i in range(2):', '    guess = (low + high) / 2', '    print(guess)', '    if guess ** 2 < x:', '        low = guess', '    else:', '        high = guess'],
          explain: 'First the middle of 0 and $x, then the middle of the half that still holds the root.',
        },
        {
          type: 'fill', vars: R => ({ x: R.pick([9, 36, 64]) }),
          text: 'If the square is too SMALL, the root is higher: move low up.',
          lines: ['x = $x', 'low, high = 0.0, x', 'guess = x / 2', 'while abs(guess ** 2 - x) >= 0.01:', '    if guess ** 2 [] x:', '        low = guess', '    else:', '        high = guess', '    guess = (low + high) / 2', 'print(round(guess))'], chips: ['<', '>', '=='], answer: [['<']],
          hints: ['Too small → the answer is above guess.', 'if guess ** 2 < x:'],
        },
        {
          type: 'write', vars: R => ({ x: R.pick([27, 64, 125]) }),
          text: 'Find the CUBE root of $x with bisection between 0 and $x: loop while abs(guess ** 3 - $x) >= 0.01, then print round(guess).',
          starter: ['low, high = 0.0, $x', 'guess = (low + high) / 2'], keys: ['while', 'abs', '(', ')', '**', '3', '-', '$x', '>=', '0.01', ':', 'if', '<', 'low', 'high', '=', 'guess', 'else', '+', '/', '2', 'print', 'round'],
          require: l => (has(l, /\*\*\s*3/) && has(l, /\/\s*2/) ? null : 'Cube the guess and halve the range each time.'),
          hints: ['while abs(guess ** 3 - $x) >= 0.01: / if guess ** 3 < $x: low = guess / else: high = guess', 'guess = (low + high) / 2, then print(round(guess))'],
          solution: ['while abs(guess ** 3 - $x) >= 0.01:', '    if guess ** 3 < $x:', '        low = guess', '    else:', '        high = guess', '    guess = (low + high) / 2', 'print(round(guess))'],
        },
      ],
      learn: [{ title: 'Bisection on floats', code: 'if guess ** 2 < x: low = guess\nelse: high = guess\nguess = (low + high) / 2', text: 'Keep the half that holds the root. Very few steps for great accuracy.' }],
    },
    {
      id: '17-7', title: "Newton's leap", bg: 'observatory', npc: 'pell', mentor: 'pell', tags: ['newton'],
      steps: [
        { type: 'talk', who: 'pell', text: 'Newton and Raphson found something even faster for roots. For the square root of x, improve any guess with: guess = guess - (guess ** 2 - x) / (2 * guess). Each leap roughly DOUBLES the correct digits.' },
        { type: 'demo', text: 'Run it and count the leaps.', code: ['x = 25', 'guess = x / 2', 'leaps = 0', 'while abs(guess ** 2 - x) >= 0.01:', '    guess = guess - (guess ** 2 - x) / (2 * guess)', '    leaps += 1', 'print(round(guess, 3), leaps)'] },
        {
          type: 'predict', vars: R => ({ x: R.pick([16, 36, 100]) }),
          text: 'One leap from x / 2. What will it say?', code: ['x = $x', 'guess = x / 2', 'guess = guess - (guess ** 2 - x) / (2 * guess)', 'print(guess)'],
          explain: 'From $(x / 2), one Newton leap lands at $((x / 2) - ((x / 2) ** 2 - x) / x).',
        },
        {
          type: 'predict', vars: R => ({ x: R.pick([2, 50, 1000]) }),
          text: 'Bisection versus Newton. What will it say?', code: ['x = $x', 'low, high, g, bis = 0.0, x, x / 2, 0', 'while abs(g ** 2 - x) >= 0.001:', '    if g ** 2 < x:', '        low = g', '    else:', '        high = g', '    g = (low + high) / 2', '    bis += 1', 'g, newt = x / 2, 0', 'while abs(g ** 2 - x) >= 0.001:', '    g = g - (g ** 2 - x) / (2 * g)', '    newt += 1', 'print(bis, newt)'],
          explain: 'Both reach the same root, but Newton needs far fewer steps.',
        },
        {
          type: 'fill', vars: R => ({ x: R.pick([9, 49, 81]) }),
          text: 'Finish the Newton step.',
          lines: ['x = $x', 'guess = x / 2', 'while abs(guess ** 2 - x) >= 0.001:', '    guess = guess - (guess ** 2 - x) / ([] * guess)', 'print(round(guess))'], chips: ['2', '1', 'x'], answer: [['2']],
          hints: ['The slope of guess ** 2 is 2 * guess.', '(2 * guess)'],
        },
        {
          type: 'write', vars: R => ({ x: R.pick([10, 20, 30]) }),
          text: 'Use Newton to find the square root of $x: start at guess = $x / 2, loop while abs(guess ** 2 - $x) >= 0.0001, then print round(guess, 3).',
          starter: [], keys: ['guess', '=', '$x', '/', '2', 'while', 'abs', '(', ')', '**', '-', '>=', '0.0001', ':', '*', 'print', 'round', ',', '3'],
          require: l => (has(l, /2\s*\*\s*guess/) ? null : 'Use the Newton step: guess - (guess ** 2 - x) / (2 * guess).'),
          hints: ['guess = $x / 2 / while abs(guess ** 2 - $x) >= 0.0001:', '    guess = guess - (guess ** 2 - $x) / (2 * guess), then print(round(guess, 3))'],
          solution: ['guess = $x / 2', 'while abs(guess ** 2 - $x) >= 0.0001:', '    guess = guess - (guess ** 2 - $x) / (2 * guess)', 'print(round(guess, 3))'],
        },
      ],
      learn: [{ title: 'Newton-Raphson', code: 'guess = guess - (guess**2 - x) / (2*guess)', text: 'Each step uses the slope to leap toward the root. Usually the fastest method of all.' }],
    },
    {
      id: '17-8', title: 'Guess golems', bg: 'study', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), s = R.int(10, 40); return { kind: 'guessgolem', hp: d + s, d, s }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Guess golems stomp in! $HP HP. Their weak point is a hidden number. Find it with as few guesses as you can.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ s: c.foe.s }),
          text: 'It has $HP HP left: exactly its hidden number $s. Bisection-search 0 to 63 for it, then cast fireball with it.',
          lines: ['secret = $s', 'low, high = 0, 63', 'while low <= high:', '    guess = (low + high) [] 2', '    if guess == secret:', '        break', '    elif guess < secret:', '        low = guess + 1', '    else:', '        high = guess - 1', 'cast(fireball, guess)'], chips: ['//', '/', '%'], answer: [['//']],
          goal: { foeDown: true },
          hints: ['Guesses must be whole numbers.', '(low + high) // 2'],
        },
        { type: 'talk', who: 'narrator', text: 'A giant golem: its heart is the square root of a big number.' },
        {
          type: 'write', vars: R => { const r = R.int(6, 12); return { r, sq: r * r, hp: 2 * r }; },
          spawn: v => ({ kind: 'guessgolem', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Find the square root of $sq with Newton (start at $sq / 2, stop when abs(guess ** 2 - $sq) < 0.0001), then cast icebolt with round(guess) twice.',
          starter: [], keys: ['guess', '=', '$sq', '/', '2', 'while', 'abs', '(', ')', '**', '-', '>=', '0.0001', ':', '*', 'cast', 'icebolt', 'round', ','],
          goal: { foeDown: true },
          require: l => (has(l, /2\s*\*\s*guess/) ? null : 'Use the Newton step.'),
          hints: ['guess = $sq / 2 / while abs(guess ** 2 - $sq) >= 0.0001:', '    guess = guess - (guess ** 2 - $sq) / (2 * guess), then cast(icebolt, round(guess)) twice'],
          solution: ['guess = $sq / 2', 'while abs(guess ** 2 - $sq) >= 0.0001:', '    guess = guess - (guess ** 2 - $sq) / (2 * guess)', 'cast(icebolt, round(guess))', 'cast(icebolt, round(guess))'],
        },
      ],
      learn: [{ title: 'Search in battle', code: 'guess = (low + high) // 2', text: 'Bisection finds hidden numbers in a handful of steps.' }],
    },
    {
      id: '17-9', title: 'The Guessing Sphinx', bg: 'observatory', foe: { kind: 'guesssphinx', hp: 170, weak: 'icebolt', resist: 'spark' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'guesssphinx', text: 'I... THINK... OF... A... NUMBER...' },
        { type: 'talk', who: 'narrator', text: 'The Guessing Sphinx has 170 HP. Icebolt freezes its riddles: double damage. Spark: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ c: R.pick([27, 64, 125]) }),
          text: 'How much damage? Icebolt is doubled.', code: ['for g in range($c + 1):', '    if g ** 3 == $c:', '        break', 'cast(icebolt, g)'],
          explain: 'The cube root of $c is $(Math.round(Math.cbrt(c))), doubled.',
        },
        {
          type: 'fix', vars: R => ({ s: R.int(6, 60) }),
          text: 'This search should find $s and print how many guesses it took, then strike. Run it, then tap the broken line.',
          code: ['secret = $s', 'low, high, tries = 0, 63, 0', 'while low <= high and tries < 30:', '    guess = (low + high) % 2', '    tries += 1', '    if guess == secret:', '        break', '    elif guess < secret:', '        low = guess + 1', '    else:', '        high = guess - 1', 'print(guess, tries)', 'cast(icebolt, 5)'], bad: 3,
          options: ['    guess = (low + high) // 2', '    guess = low', '    guess = (low - high) // 2'], answer: 0,
          explain: 'The middle is (low + high) // 2. % 2 only gives 0 or 1.',
        },
        { type: 'talk', who: 'guesssphinx', text: 'WHAT... IS... THE... ROOT... OF... MY... POWER...' },
        {
          type: 'fill', vars: R => ({ r: R.int(5, 9) }),
          text: 'Leap to the square root of $(r * r) with Newton and strike with icebolt.',
          lines: ['x = $(r * r)', 'guess = x / 2', 'while abs(guess ** 2 - x) >= 0.0001:', '    guess = guess - (guess ** 2 - x) / (2 * [])', 'cast(icebolt, round(guess))'], chips: ['guess', 'x', '2'], answer: [['guess']],
          hints: ['The Newton step divides by 2 × guess.', '(2 * guess)'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Bisection-search 0 to 200 for the smallest whole p where 2 * p >= $HP, then cast icebolt with p.',
          starter: ['low, high = 0, 200'], keys: ['while', 'low', '<', 'high', ':', 'mid', '=', '+', '//', '2', 'if', '*', '>=', '$HP', 'else', '1', 'cast', 'icebolt', '(', ')', ','],
          goal: { foeDown: true },
          require: l => (has(l, /\/\/\s*2/) && has(l, /while\s+/) ? null : 'Use bisection: mid = (low + high) // 2 inside a while loop.'),
          hints: ['while low < high: / mid = (low + high) // 2', 'if 2 * mid >= $HP: high = mid / else: low = mid + 1, then cast(icebolt, low)'],
          solution: ['while low < high:', '    mid = (low + high) // 2', '    if 2 * mid >= $HP:', '        high = mid', '    else:', '        low = mid + 1', 'cast(icebolt, low)'],
        },
        { type: 'talk', who: 'guesssphinx', text: '...you... guessed... well...' },
      ],
      learn: [{ title: 'Guessing toolkit', code: 'guess-and-check  enumeration  epsilon  bisection  Newton', text: 'Everything from the Guessing Halls: from slow-but-sure to blazing fast.' }],
    },
  ],
};
WORLDS.push(WORLD17);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    guesscheck: () => { const c = pick([8, 27, 64, 50]); const r = Math.cbrt(c); return makeQ([`for g in range(${c} + 1):`, `    if g ** 3 >= ${c}:`, '        break', 'print(g)'], [Math.floor(r) - 1 < 0 ? 9 : Math.floor(r) - 1, c]); },
    enumerate2: () => { const t = pick([4, 5, 6]); let n = 0; for (let a = 1; a < t; a++) for (let b = a; b < t; b++) if (a + b === t) n++; return makeQ(['n = 0', `for a in range(1, ${t}):`, `    for b in range(a, ${t}):`, `        if a + b == ${t}:`, '            n += 1', 'print(n)'], [n * 2, t - 1]); },
    approx: () => makeQ(['g = 0.0', 'while abs(g ** 2 - 9) >= 0.01:', '    g += 0.01', 'print(round(g))'], [9, 'Error']),
    bisectint: () => { const n = pick([16, 64, 100, 1000]); let c = 0, m = n; while (m > 1) { m = Math.floor(m / 2); c++; } return makeQ([`n = ${n}`, 'c = 0', 'while n > 1:', '    n //= 2', '    c += 1', 'print(c)'], [n / 2, c + 1]); },
    bisectfloat: () => { const x = pick([2, 10]); return makeQ([`x = ${x}`, 'lo, hi = 0.0, x', 'g = (lo + hi) / 2', 'if g ** 2 < x:', '    lo = g', 'else:', '    hi = g', 'print((lo + hi) / 2)'], [x / 2, x / 4 * 3 === (x / 2 + x) / 2 ? x / 8 : x / 4 * 3]); },
    newton: () => { const x = pick([16, 36, 100]); const g = x / 2; return makeQ([`x = ${x}`, 'g = x / 2', 'g = g - (g ** 2 - x) / (2 * g)', 'print(g)'], [Math.sqrt(x), g]); },
  });
})();
