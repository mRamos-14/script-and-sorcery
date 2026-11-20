/* World 32: The Proving Grounds. Testing: assert, pytest-style test_ functions (steps with
   pytest: true run every test_ function after the spell, like the pytest command), edge
   cases, pytest.raises, many cases per test, tests first. Ends with review boss 15-R. */
const SQ = ['def square(n):', '    return n * n'];

const WORLD32 = {
  id: 32, name: 'The Proving Grounds', topic: 'testing', map: 'bg-map15.jpg',
  nodes: [[50, 93], [28, 84], [70, 76], [32, 67], [68, 58], [30, 49], [68, 40], [34, 30], [64, 20], [50, 8]],
  levels: [
    {
      id: '32-1', title: 'Prove it', bg: 'proving', npc: 'inspector', mentor: 'inspector', tags: ['asserts'],
      steps: [
        { type: 'talk', who: 'inspector', text: "Inspector Vale. Here nothing is trusted until it is proven. assert checks that something is true. If it is, nothing happens. If not, Python stops with AssertionError." },
        { type: 'demo', vars: R => ({ n: R.int(2, 9) }), text: 'Run it.', code: [...SQ, 'assert square($n) == $(n * n)', 'assert square(0) == 0', 'print("square works")'] },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 9) }), text: 'What will it say?',
          code: [...SQ, 'assert square($n) == $(n * n)', 'print("first check passed")', 'assert square(-$n) == $(n * n)', 'print("second check passed")'],
          explain: 'Both asserts are true, so both prints run. A negative squared is positive.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ n: R.int(2, 9) }), text: 'A wrong expectation. Which error will this cause?',
          code: [...SQ, 'assert square($n) == $(n * 2)'],
          explain: 'square($n) is $(n * n), not $(n * 2), so the assert fails: AssertionError.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 9) }), text: 'An assert with a message. What will it say?',
          code: ['def half(n):', '    return n // 2', 'try:', '    assert half($(2 * n + 1)) == $n + 0.5, "half lost the .5"', 'except AssertionError as e:', '    print("caught:", e)'],
          explain: '// drops the remainder, so the assert fails and its message is printed.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(2, 9) }), text: 'Check that cube works.',
          lines: ['def cube(n):', '    return n ** 3', '[] cube($n) == []', 'print("cube checked")'], chips: ['assert', '$(n ** 3)', 'if', '$(n * 3)'], answer: [['assert', '$(n ** 3)']],
          hints: ['assert expression', 'assert cube($n) == $(n ** 3)'],
        },
        {
          type: 'write', vars: R => ({ a: R.int(2, 9), b: R.int(2, 9) }), text: 'Write two asserts: add($a, $b) equals $(a + b), and add(0, 0) equals 0. Then print "add checked".',
          starter: ['def add(a, b):', '    return a + b'], keys: ['assert', 'add', '(', ')', '$a', '$b', ',', '==', '$(a + b)', '0', 'print', '"add checked"'],
          require: l => ((typed(l).match(/\bassert\b/g) || []).length >= 2 ? null : 'Write two assert lines.'),
          hints: ['assert add($a, $b) == $(a + b)', 'assert add(0, 0) == 0, then print("add checked")'],
          solution: ['assert add($a, $b) == $(a + b)', 'assert add(0, 0) == 0', 'print("add checked")'],
        },
      ],
      learn: [{ title: 'assert', code: 'assert square(3) == 9\nassert ok, "message"', text: 'Silent when true, AssertionError when false. The simplest test.' }],
    },
    {
      id: '32-2', title: 'The test runner', bg: 'proving', npc: 'apprentice', mentor: 'apprentice', tags: ['pytestq'],
      steps: [
        { type: 'talk', who: 'apprentice', text: "It's me, Kip! I'm an inspector's apprentice now. Real projects keep tests in functions whose names start with test_. The pytest command finds every one, runs it, and reports PASSED or FAILED." },
        { type: 'demo', vars: R => ({ n: R.int(2, 9) }), pytest: true, text: 'Run it with pytest.', code: ['def double(n):', '    return n * 2', 'def test_double():', '    assert double($n) == $(2 * n)', '    assert double(0) == 0', 'def test_negative():', '    assert double(-1) == -2'] },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 9) }), pytest: true, text: 'One test has a wrong expectation. What will pytest say?',
          code: [...SQ, 'def test_small():', '    assert square(2) == 4', 'def test_big():', '    assert square($n) == $(n * 2)'],
          explain: 'test_small passes. test_big expects $(n * 2) but gets $(n * n), and pytest shows both values.',
        },
        {
          type: 'predict', pytest: true, text: 'pytest only runs functions named test_... What will it say?',
          code: [...SQ, 'def check_square():', '    assert square(3) == 9', 'def test_zero():', '    assert square(0) == 0'],
          explain: 'check_square does not start with test_, so pytest ignores it.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(2, 9) }), pytest: true, text: 'Name the test so pytest finds it.',
          lines: ['def triple(n):', '    return n * 3', 'def [_triple():', '    [] triple($n) == $(3 * n)'].map(l => l.replace('[_', '[]_')), chips: ['test', 'assert', 'check', 'print'], answer: [['test', 'assert']],
          hints: ['Test names start with test_', 'def test_triple(): with an assert inside'],
        },
        {
          type: 'write', vars: R => ({ a: R.int(2, 9) }), pytest: true, text: 'Write a test function test_half with two asserts: half($(2 * a)) == $a and half(0) == 0.',
          starter: ['def half(n):', '    return n // 2'], keys: ['def', 'test_half', '():', 'assert', 'half', '(', ')', '$(2 * a)', '==', '$a', '0'],
          require: l => (has(l, /def\s+test_half\s*\(\s*\)/) && (typed(l).match(/\bassert\b/g) || []).length >= 2 ? null : 'Write def test_half(): with two asserts.'),
          hints: ['def test_half():', '    assert half($(2 * a)) == $a / assert half(0) == 0'],
          solution: ['def test_half():', '    assert half($(2 * a)) == $a', '    assert half(0) == 0'],
        },
      ],
      learn: [{ title: 'pytest', code: 'def test_square():\n    assert square(3) == 9', text: 'pytest runs every test_ function and reports PASSED or FAILED, showing the values that did not match.' }],
    },
    {
      id: '32-3', title: 'Edges of the map', bg: 'proving', npc: 'inspector', mentor: 'inspector', tags: ['edge'],
      steps: [
        { type: 'talk', who: 'inspector', text: 'Bugs hide at the edges: zero, negatives, empty strings, a single item, the biggest value. A good tester always tries them.' },
        {
          type: 'predict', vars: R => ({ w: R.pick(['ada', 'kip', 'vale']) }), pytest: true, text: 'Testing an empty name. What will pytest say?',
          code: ['def initial(name):', '    return name[0].upper()', 'def test_initial():', '    assert initial("$w") == "$(w[0].toUpperCase())"', 'def test_empty():', '    assert initial("") == ""'],
          explain: 'An empty string has no name[0], so test_empty crashes with IndexError.',
        },
        {
          type: 'predict', vars: R => ({ xs: [R.int(2, 9), R.int(2, 9)] }), pytest: true, text: 'The average of nothing. What will pytest say?',
          code: ['def average(nums):', '    return sum(nums) / len(nums)', 'def test_two():', '    assert average($(JSON.stringify(xs))) == $((xs[0] + xs[1]) / 2)', 'def test_none():', '    assert average(list()) == 0'],
          explain: 'An empty list makes len 0, and dividing by zero fails.',
        },
        {
          type: 'fix', vars: R => ({ n: R.int(3, 9) }), pytest: true, text: 'The test caught a bug at the edge. Run pytest, then tap the broken line.',
          code: ['def is_adult(age):', '    return age > 18', 'def test_adult():', '    assert is_adult($(18 + n)) == True', '    assert is_adult(18) == True', '    assert is_adult($(18 - n)) == False'], bad: 1,
          options: ['    return age >= 18', '    return age < 18', '    return age == 18'], answer: 0,
          explain: 'Exactly 18 counts as adult, so the check must be >=.',
        },
        {
          type: 'write', vars: R => ({ w: R.pick(['spark', 'rune', 'wand']) }), pytest: true, text: 'Write test_shout with two asserts: shout("$w") == "$(w.toUpperCase())!" and the edge case shout("") == "!".',
          starter: ['def shout(word):', '    return word.upper() + "!"'], keys: ['def', 'test_shout', '():', 'assert', 'shout', '(', ')', '"$w"', '==', '"$(w.toUpperCase())!"', '""', '"!"'],
          require: l => (has(l, /def\s+test_shout/) && has(l, /shout\(\s*""\s*\)/) ? null : 'Write test_shout and include the empty string case.'),
          hints: ['def test_shout():', '    assert shout("$w") == "$(w.toUpperCase())!" / assert shout("") == "!"'],
          solution: ['def test_shout():', '    assert shout("$w") == "$(w.toUpperCase())!"', '    assert shout("") == "!"'],
        },
      ],
      learn: [{ title: 'Edge cases', code: '0  -1  ""  []  one item  the limit', text: 'Test the boundaries. That is where most bugs live.' }],
    },
    {
      id: '32-4', title: 'Bug swarm', bg: 'gauntlet', mentor: 'narrator', tags: [],
      foe: R => { const k = R.int(3, 5); return { kind: 'bugswarm', hp: k * k, k }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'A swarm of bugs pours out of the gauntlet! These tests cast a spell only when their assert passes. Fix the code and the tests fight for you.' },
        {
          type: 'fill', vars: (R, c) => ({ k: c.foe.k }), pytest: true, text: 'The swarm has $HP HP. power should square its number. Make the test pass.',
          lines: ['def power(n):', '    return n [] 2', 'def test_power():', '    assert power($k) == $(k * k)', '    cast(spark, power([]))'], chips: ['**', '*', '$k', '2'], answer: [['**', '$k']],
          goal: { foeDown: true },
          hints: ['** raises to a power.', 'cast with power($k)'],
        },
        { type: 'talk', who: 'narrator', text: 'The queen bug buzzes in!' },
        {
          type: 'write', vars: R => ({ a: R.int(8, 15) }), spawn: v => ({ kind: 'bugswarm', hp: v.a * 2, tint: 'big' }), pytest: true, text: 'Write test_strike: assert double($a) == $(2 * a), then cast fireball with double($a).',
          starter: ['def double(n):', '    return n * 2'], keys: ['def', 'test_strike', '():', 'assert', 'double($a)', '==', '$(2 * a)', 'cast', '(', ')', 'fireball', ','],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+test_strike/) && has(l, /assert/) ? null : 'Write def test_strike(): with an assert, then the cast.'),
          hints: ['def test_strike():', '    assert double($a) == $(2 * a) / cast(fireball, double($a))'],
          solution: ['def test_strike():', '    assert double($a) == $(2 * a)', '    cast(fireball, double($a))'],
        },
      ],
      learn: [{ title: 'Green tests', code: 'assert power(3) == 9', text: 'When a test fails, fix the code it tests, not the test.' }],
    },
    {
      id: '32-5', title: 'Expecting trouble', bg: 'proving', npc: 'apprentice', mentor: 'apprentice', tags: ['raisesq'],
      steps: [
        { type: 'talk', who: 'apprentice', text: 'Sometimes the right answer is an error! with pytest.raises(ValueError): passes only if the code inside raises that error.' },
        { type: 'demo', pytest: true, text: 'Run it with pytest.', code: ['import pytest', 'def check_age(age):', '    if age < 0:', '        raise ValueError("age cannot be negative")', '    return age', 'def test_negative():', '    with pytest.raises(ValueError):', '        check_age(-1)'] },
        {
          type: 'predict', vars: R => ({ n: R.int(1, 9) }), pytest: true, text: 'What will pytest say?',
          code: ['import pytest', 'def check_age(age):', '    if age < 0:', '        raise ValueError("negative")', '    return age', 'def test_bad_age():', '    with pytest.raises(ValueError):', '        check_age($n)'],
          explain: '$n is a fine age, so nothing is raised, and pytest fails the test: DID NOT RAISE.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(1, 9) }), pytest: true, text: 'Test that dividing by zero raises the right error.',
          lines: ['import pytest', 'def split_gold(gold, people):', '    return gold // people', 'def test_nobody():', '    with pytest.[]([]):', '        split_gold($n, 0)'], chips: ['raises', 'ZeroDivisionError', 'ValueError', 'assert'], answer: [['raises', 'ZeroDivisionError']],
          hints: ['pytest.raises(...)', 'Dividing by zero raises ZeroDivisionError.'],
        },
        {
          type: 'write', pytest: true, text: 'Write test_empty_name that uses pytest.raises(ValueError) around greet("").',
          starter: ['import pytest', 'def greet(name):', '    if not name:', '        raise ValueError("name required")', '    return "hi " + name'], keys: ['def', 'test_empty_name', '():', 'with', 'pytest.raises', '(ValueError)', ':', 'greet', '("")'],
          require: l => (has(l, /pytest\.raises\(\s*ValueError\s*\)/) ? null : 'Use with pytest.raises(ValueError):'),
          hints: ['def test_empty_name():', '    with pytest.raises(ValueError): / greet("")'],
          solution: ['def test_empty_name():', '    with pytest.raises(ValueError):', '        greet("")'],
        },
      ],
      learn: [{ title: 'pytest.raises', code: 'with pytest.raises(ValueError):\n    check_age(-1)', text: 'A test that passes only when the right error happens.' }],
    },
    {
      id: '32-6', title: 'Many cases', bg: 'proving', npc: 'inspector', mentor: 'inspector', tags: ['cases'],
      steps: [
        { type: 'talk', who: 'inspector', text: 'One test can check many cases: keep pairs of input and expected answer in a list, and loop.' },
        {
          type: 'predict', pytest: true, text: 'One case is wrong. What will pytest say?',
          code: [...SQ, 'def test_many():', '    for n, want in [(2, 4), (3, 10), (4, 16)]:', '        assert square(n) == want'],
          explain: 'The loop stops at the first failure: 3 squared is 9, not 10.',
        },
        {
          type: 'predict', vars: R => ({ k: R.int(2, 4) }), pytest: true, text: 'All cases right. What will pytest say?',
          code: ['def is_even(n):', '    return n % 2 == 0', 'def test_evens():', '    for n in range(0, $(2 * k), 2):', '        assert is_even(n)', 'def test_odds():', '    for n in range(1, $(2 * k), 2):', '        assert not is_even(n)'],
          explain: 'Every case checks out, so both tests pass.',
        },
        {
          type: 'fill', pytest: true, text: 'Unpack each case and check it.',
          lines: ['def add(a, b):', '    return a + b', 'def test_add():', '    for a, b, want in [(1, 2, 3), (0, 0, 0), (-1, 1, 0)]:', '        [] add([], b) == want'], chips: ['assert', 'a', 'want', 'print'], answer: [['assert', 'a']],
          hints: ['Each case gives a, b and want.', 'assert add(a, b) == want'],
        },
        {
          type: 'write', pytest: true, text: 'Write test_lengths that loops over the pairs in cases and asserts len(word) == n for each.',
          starter: ['cases = [("a", 1), ("rune", 4), ("", 0)]'], keys: ['def', 'test_lengths', '():', 'for', 'word', ',', 'n', 'in', 'cases', ':', 'assert', 'len(word)', '=='],
          require: l => (has(l, /def\s+test_lengths/) && has(l, /for\b/) ? null : 'Loop over cases inside test_lengths.'),
          hints: ['def test_lengths(): / for word, n in cases:', '        assert len(word) == n'],
          solution: ['def test_lengths():', '    for word, n in cases:', '        assert len(word) == n'],
        },
      ],
      learn: [{ title: 'Table of cases', code: 'for n, want in [(2, 4), (3, 9)]:\n    assert square(n) == want', text: 'Many checks, one test. Easy to add more cases.' }],
    },
    {
      id: '32-7', title: 'Tests first', bg: 'proving', npc: 'apprentice', mentor: 'apprentice', tags: ['tdd'],
      steps: [
        { type: 'talk', who: 'apprentice', text: 'Some mages write the tests FIRST, then write code until every test is green. It means you always know when you are done.' },
        {
          type: 'predict', pytest: true, text: 'The tests exist, the function does not yet. What will pytest say?',
          code: ['def test_greet():', '    assert greet("Ada") == "hello, Ada"'],
          explain: 'greet does not exist yet, so the test fails with NameError. That red test is the to-do list.',
        },
        {
          type: 'write', vars: R => ({ n: R.pick(['Ada', 'Kip', 'Vale', 'Rue']) }), pytest: true, text: 'Make these tests pass: write greet(name) that returns "hello, " followed by the name.',
          starter: ['def test_greet():', '    assert greet("$n") == "hello, $n"', '    assert greet("") == "hello, "'], keys: ['def', 'greet', '(name):', 'return', '"hello, "', '+', 'name'],
          require: l => (has(l, /def\s+greet\s*\(/) ? null : 'Write def greet(name):'),
          hints: ['def greet(name):', '    return "hello, " + name'],
          solution: ['def greet(name):', '    return "hello, " + name'],
        },
        {
          type: 'write', pytest: true, text: 'Make these tests pass too: is_vowel(c) returns True when c is one of a, e, i, o, u.',
          starter: ['def test_vowels():', '    for c in "aeiou":', '        assert is_vowel(c)', 'def test_consonants():', '    for c in "bcdz":', '        assert not is_vowel(c)'], keys: ['def', 'is_vowel', '(c):', 'return', 'c', 'in', '"aeiou"'],
          require: l => (has(l, /def\s+is_vowel/) ? null : 'Write def is_vowel(c):'),
          hints: ['def is_vowel(c):', '    return c in "aeiou"'],
          solution: ['def is_vowel(c):', '    return c in "aeiou"'],
        },
      ],
      learn: [{ title: 'Test first', code: 'red: write a failing test\ngreen: make it pass\nrefactor: tidy up', text: 'Tests written first tell you exactly what to build and when you are done.' }],
    },
    {
      id: '32-8', title: 'The saboteur', bg: 'gauntlet', mentor: 'narrator', tags: [],
      foe: R => ({ kind: 'bugswarm', hp: 60, weak: 'spark' }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'A saboteur bug swapped symbols in your spells! Only tests can reveal the damage.' },
        {
          type: 'fix', vars: R => ({ a: R.int(4, 8), b: R.int(4, 8) }), pytest: true, text: 'The test fails, so no spell is cast. Run pytest, then tap the sabotaged line.',
          code: ['def total(a, b):', '    return a - b', 'def test_total():', '    assert total($a, $b) == $(a + b)', '    cast(spark, total($a, $b))'], bad: 1,
          options: ['    return a + b', '    return a * b', '    return b - a'], answer: 0,
          explain: 'total should add. Now the test passes and the spell fires.',
        },
        {
          type: 'predict', pytest: true, measure: 'damage', vars: R => ({ k: R.int(2, 4) }), text: 'Only passing tests reach their cast. How much damage will this deal? Spark is doubled.',
          code: ['def test_a():', '    assert 1 + 1 == 2', '    cast(spark, $k)', 'def test_b():', '    assert 2 * 2 == 5', '    cast(spark, 50)', 'def test_c():', '    cast(spark, $k)'],
          explain: 'test_b fails before its cast. The other two cast $k each, doubled: $(4 * k).',
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), pytest: true, text: 'Finish it! $HP HP left, spark is doubled. Write test_final: assert check($q) is True, then cast spark with $q.',
          starter: ['def check(n):', '    return n > 0'], keys: ['def', 'test_final', '():', 'assert', 'check($q)', 'is', 'True', 'cast', '(', ')', 'spark', ',', '$q'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+test_final/) && has(l, /assert/) ? null : 'Write def test_final(): with an assert and the cast.'),
          hints: ['def test_final():', '    assert check($q) is True / cast(spark, $q)'],
          solution: ['def test_final():', '    assert check($q) is True', '    cast(spark, $q)'],
        },
      ],
      learn: [{ title: 'Tests catch sabotage', code: 'assert total(2, 3) == 5', text: 'A tiny change like - for + is caught instantly by a test.' }],
    },
    {
      id: '32-9', title: 'The Grand Inspector', bg: 'tribunal', foe: { kind: 'inspectorboss', hp: 220, weak: 'icebolt', resist: 'spark' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'inspectorboss', text: 'NOTHING PASSES MY INSPECTION. PROVE YOUR SPELLS... OR FAIL.' },
        { type: 'talk', who: 'narrator', text: 'The Grand Inspector has 220 HP. Icebolt freezes the ink in its stamps for double. Spark is halved.' },
        {
          type: 'predict', pytest: true, measure: 'damage', vars: R => ({ a: R.int(5, 9), b: R.int(5, 9) }), text: 'How much damage will this deal? Icebolt is doubled.',
          code: ['def test_one():', '    assert "ice"[0] == "i"', '    cast(icebolt, $a)', 'def test_two():', '    assert len("ice") == 4', '    cast(icebolt, 99)', 'def test_three():', '    cast(icebolt, $b)'],
          explain: 'test_two fails before it casts. $a + $b = $(a + b), doubled: $(2 * (a + b)).',
        },
        {
          type: 'fix', vars: R => ({ p: R.int(10, 15) }), pytest: true, text: 'The Inspector rejected your test. Run pytest, then tap the broken line.',
          code: ['import pytest', 'def freeze(n):', '    if n <= 0:', '        raise ValueError("too weak")', '    cast(icebolt, n)', 'def test_weak():', '    with pytest.raises(TypeError):', '        freeze(0)', 'def test_strong():', '    freeze($p)'], bad: 6,
          options: ['    with pytest.raises(ValueError):', '    with pytest.raises(ZeroDivisionError):', '    with pytest.raises(freeze):'], answer: 0,
          explain: 'freeze(0) raises ValueError, so that is what the test must expect.',
        },
        { type: 'talk', who: 'inspectorboss', text: 'THEN I SHALL TEST YOU WITH MANY CASES AT ONCE.' },
        {
          type: 'fill', vars: R => ({ xs: [R.int(4, 8), R.int(4, 8), R.int(4, 8)] }), pytest: true, text: 'Every passing case casts icebolt.',
          lines: ['def ok(n):', '    return n > 0', 'def test_cases():', '    for n in $(JSON.stringify(xs)):', '        [] ok(n)', '        cast(icebolt, [])'], chips: ['assert', 'n', 'print', 'ok'], answer: [['assert', 'n']],
          hints: ['Check each n with assert.', 'cast(icebolt, n)'],
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), pytest: true, text: 'Final blow! $HP HP left, icebolt is doubled. Write power(n) that returns n, and test_power that asserts power($q) == $q and casts icebolt with power($q).',
          starter: [], keys: ['def', 'power', '(n):', 'return', 'n', 'test_power', '():', 'assert', 'power($q)', '==', '$q', 'cast', '(', ')', 'icebolt', ','],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+power/) && has(l, /def\s+test_power/) ? null : 'Write both power and test_power.'),
          hints: ['def power(n): / return n', 'def test_power(): / assert power($q) == $q / cast(icebolt, power($q))'],
          solution: ['def power(n):', '    return n', 'def test_power():', '    assert power($q) == $q', '    cast(icebolt, power($q))'],
        },
        { type: 'talk', who: 'inspectorboss', text: '...ALL TESTS... PASSED. APPROVED.' },
      ],
      learn: [{ title: 'Testing toolkit', code: 'assert  def test_...  pytest\npytest.raises  edge cases  tests first', text: 'CS50P week 5: proving your code works, and keeping it working.' }],
    },
    {
      id: '32-R', title: 'The Tribunal', bg: 'court', foe: { kind: 'tribunal', hp: 200 }, mentor: 'narrator', boss: true, review: true, tags: [],
      steps: [
        { type: 'talk', who: 'tribunal', text: 'WE ARE THE TRIBUNAL. LIBRARIES. PATTERNS. PROOF. ANSWER FOR ALL THREE.' },
        { type: 'talk', who: 'narrator', text: 'Review boss! Worlds 13 to 15, plus older lessons. 200 HP. Each right answer strikes.' },
        { type: 'review', tags: ['modules', 'stats', 'jsonq'], reward: { spell: 'spark', power: 20 }, text: 'The Bazaar. What will the spellbook say?' },
        { type: 'review', tags: ['randomq', 'argv', 'mymodule'], reward: { spell: 'fireball', power: 20 }, text: 'Libraries at work. What will it say?' },
        { type: 'review', tags: ['research', 'rewild', 'reclass'], reward: { spell: 'icebolt', power: 20 }, text: 'The Marsh. What will it say?' },
        { type: 'review', tags: ['reanchor', 'regroup', 'rerepeat', 'resub'], reward: { spell: 'spark', power: 20 }, text: 'Deep patterns. What will it say?' },
        {
          type: 'write', vars: R => ({ n: R.int(2, 99) }), text: 'Use re.search with a group to pull the number out of order, then print it times 2.',
          starter: ['import re', 'order = "order #$n confirmed"'], keys: ['m', '=', 're.search', '(', ')', 'r"#(\\d+)"', ',', 'order', 'print', 'int', 'm.group(1)', '*', '2'],
          require: l => (has(l, /group\(1\)/) ? null : 'Catch the number with a group.'),
          hints: ['m = re.search(r"#(\\d+)", order)', 'print(int(m.group(1)) * 2)'],
          solution: ['m = re.search(r"#(\\d+)", order)', 'print(int(m.group(1)) * 2)'],
        },
        { type: 'review', tags: ['asserts', 'pytestq', 'raisesq'], reward: { spell: 'fireball', power: 20 }, text: 'The Proving Grounds. What will it say?' },
        { type: 'review', tags: ['edge', 'cases', 'tdd'], reward: { spell: 'icebolt', power: 20 }, text: 'Proof in many cases. What will it say?' },
        { type: 'review', tags: ['inherit', 'property', 'compose', 'dictloop', 'tryexcept'], reward: { spell: 'spark', power: 20 }, text: 'An old lesson returns. What will it say?' },
        { type: 'talk', who: 'tribunal', text: 'FINAL VERDICT: WRITE A SPELL, AND PROVE IT.' },
        {
          type: 'write', vars: (R, c) => ({ h: Math.max(1, c.foe.hp) }), pytest: true, text: 'Write strike(n) that casts fireball with n, and test_strike that asserts strike is called on a positive number ($h > 0) and then calls strike($h).',
          starter: [], keys: ['def', 'strike', '(n):', 'cast', '(', ')', 'fireball', ',', 'n', 'test_strike', '():', 'assert', '$h', '>', '0', 'strike($h)'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+strike/) && has(l, /def\s+test_strike/) && has(l, /assert/) ? null : 'Write strike and test_strike with an assert.'),
          hints: ['def strike(n): / cast(fireball, n)', 'def test_strike(): / assert $h > 0 / strike($h)'],
          solution: ['def strike(n):', '    cast(fireball, n)', 'def test_strike():', '    assert $h > 0', '    strike($h)'],
        },
        { type: 'talk', who: 'tribunal', text: 'THE VERDICT IS IN. YOU HAVE COMPLETED EVERY WEEK OF CS50P. GO ON, AND LEARN THE REST.' },
      ],
      learn: [{ title: 'CS50P, complete', code: 'functions  conditionals  loops  exceptions\nlibraries  tests  files  regex  classes', text: 'Every week of CS50P, practised and tested. Next: the deeper toolkit of Python.' }],
    },
  ],
};
WORLDS.push(WORLD32);
