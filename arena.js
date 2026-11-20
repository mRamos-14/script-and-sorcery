/* Training grounds question generator. Every answer is computed by the
   interpreter, so the correct choice always matches what the code prints. */
const Arena = (() => {
  'use strict';
  let rand = Math.random;
  const pick = a => a[Math.floor(rand() * a.length)];
  const rnd = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const WORDS = ['dragon', 'potion', 'wizard', 'castle', 'goblin', 'scroll', 'ember', 'frost', 'rune', 'tower', 'lantern', 'crystal'];
  const NAMES = ['Ada', 'Wren', 'Mira', 'Quill', 'Brin', 'Hazel', 'Rowan'];
  function outText(lines, o) { const r = Py.run(lines, o); return r.error ? 'Error' : r.output.join('\n'); }
  function outErr(lines, o) { const r = Py.run(lines, o); return r.error; }
  function makeQ(code, wrongs, text, o) {
    const right = outText(code, o);
    const opts = [right];
    for (const w of wrongs) { const s = String(w); if (!opts.includes(s)) opts.push(s); if (opts.length === 3) break; }
    const fill = ['Error', '0', 'None', '""'];
    while (opts.length < 3) { const f = fill.shift(); if (!opts.includes(f)) opts.push(f); }
    const choices = shuffle(opts);
    const err = outErr(code, o);
    return {
      ...(o || {}),
      text: text || 'What will the spellbook say?', code, choices, answer: choices.indexOf(right),
      explain: err ? `It crashes with ${err.type}: ${err.msg}` : `The spellbook says ${right.replace(/\n/g, ' then ')}.`,
    };
  }
  const GEN = {
    print: () => { const a = pick(WORDS), b = pick(WORDS); return rand() < 0.5 ? makeQ([`print("${a}")`], [`"${a}"`, `print("${a}")`]) : makeQ([`print("${a}")`, `print("${b}")`], [`${b}\n${a}`, `${a} ${b}`]); },
    math: lv => {
      const a = rnd(2, 6 + lv), b = rnd(2, 9), c = rnd(2, 5);
      const v = rnd(0, 3);
      if (v === 0) return makeQ([`print(${a} * ${b})`], [a + b, `${a}${b}`, `${a} * ${b}`]);
      if (v === 1) return makeQ([`print(${a} + ${b} * ${c})`], [(a + b) * c, a + b + c]);
      if (v === 2) return makeQ([`print(${a * b} / ${b})`], [a, `${a * b} / ${b}`]);
      return makeQ([`print("${a} + ${b}")`], [a + b, `${a}${b}`]);
    },
    vars: () => {
      const a = rnd(2, 20), b = rnd(21, 40), n = pick(['gold', 'gems', 'keys', 'mana']);
      const v = rnd(0, 2);
      if (v === 0) return makeQ([`${n} = ${a}`, `print("${n}")`], [a, `"${n}"`]);
      if (v === 1) return makeQ([`${n} = ${a}`, `${n} = ${b}`, `print(${n})`], [a, `${a}${b}`]);
      return makeQ([`a = ${a}`, 'b = a', `a = ${b}`, 'print(b)'], [b, 'a']);
    },
    update: lv => {
      const a = rnd(5, 20), b = rnd(2, 9), c = rnd(2, 5), n = pick(['hp', 'xp', 'mana']);
      const v = rnd(0, 2);
      if (v === 0) return makeQ([`${n} = ${a}`, `${n} = ${n} - ${b}`, `print(${n})`], [a, a + b, b]);
      if (v === 1) return makeQ([`${n} = ${a}`, `${n} += ${b}`, `${n} *= ${c}`, `print(${n})`], [a + b * c, a * c + b, a + b]);
      return makeQ([`${n} = ${a}`, `${n} + ${b}`, `print(${n})`], [a + b, b, 'Error'], 'Careful! What will it say?');
    },
    concat: () => { const a = pick(WORDS), b = pick(WORDS); return rand() < 0.5 ? makeQ([`print("${a}" + "${b}")`], [`${a} ${b}`, `${a} + ${b}`]) : makeQ([`x = "${a}"`, `y = "${b}"`, 'print(x + " " + y)'], [`${a}${b}`, 'x y']); },
    repeat: () => { const w = pick(['ha', 'ho', 'zap', 'boo']), n = rnd(2, 4); return makeQ([`print("${w}" * ${n})`], [`${w}${n}`, w.repeat(n + 1), 'Error']); },
    types: () => {
      const a = rnd(2, 9), b = rnd(2, 9), v = rnd(0, 3);
      if (v === 0) return makeQ([`print("${a}" + "${b}")`], [a + b, 'Error']);
      if (v === 1) return makeQ([`print("Gold: " + ${a * 5})`], [`Gold: ${a * 5}`, `Gold:${a * 5}`]);
      if (v === 2) return makeQ([`print("Gold:", ${a * 5})`], [`Gold:${a * 5}`, 'Error']);
      return makeQ([`print(int("${a}0") + ${b})`], [`${a}0${b}`, 'Error']);
    },
    len: () => { const w = rand() < 0.6 ? pick(WORDS) : `${pick(WORDS)} ${pick(WORDS)}`; return makeQ([`print(len("${w}"))`], [w.length - 1, w.length + 1, w.replace(' ', '').length]); },
    case: () => { const w = `${pick(WORDS)} ${pick(WORDS)}`; const m = pick(['upper', 'title', 'lower']); return makeQ([`print("${w}".${m}())`], [w.toUpperCase(), w.replace(/\b\w/g, c => c.toUpperCase()), w, w.charAt(0).toUpperCase() + w.slice(1)]); },
    index: () => {
      const w = pick(WORDS), i = rnd(-2, w.length);
      const alt = [w[Math.max(0, i - 1)], w[Math.min(w.length - 1, i + 1)], 'Error'].filter(Boolean);
      return makeQ([`word = "${w}"`, `print(word[${i}])`], alt);
    },
    slice: () => {
      const w = pick(WORDS), a = rnd(0, 2), b = rnd(a + 2, w.length), v = rnd(0, 2);
      if (v === 0) return makeQ([`word = "${w}"`, `print(word[${a}:${b}])`], [w.slice(a, b + 1), w.slice(a + 1, b + 1), w.slice(a, b - 1)]);
      if (v === 1) return makeQ([`word = "${w}"`, `print(word[:${b}])`], [w.slice(0, b + 1), w.slice(b)]);
      return makeQ([`word = "${w}"`, `print(word[${a + 1}:])`], [w.slice(a + 2), w.slice(0, a + 1), w.slice(a)]);
    },
    fstr: () => {
      const n = pick(NAMES), g = rnd(3, 40), v = rnd(0, 2);
      if (v === 0) return makeQ([`who = "${n}"`, `gems = ${g}`, 'print(f"{who} has {gems} gems")'], ['{who} has {gems} gems', 'Error', `who has gems gems`]);
      if (v === 1) return makeQ([`gems = ${g}`, 'print("Gems: {gems}")'], [`Gems: ${g}`, 'Error']);
      return makeQ([`a = ${g}`, 'print(f"{a * 2} coins")'], [`${g}${g} coins`, 'a * 2 coins', `${g * 2}`]);
    },
    methods: () => {
      const v = rnd(0, 2), w = pick(WORDS);
      if (v === 0) { const ch = pick([...new Set(w)]); return makeQ([`print("${w}".count("${ch}"))`], [w.split(ch).length, 0, 2].map(String)); }
      if (v === 1) { const b = pick(WORDS); return makeQ([`s = "the ${w}"`, `print(s.replace("${w}", "${b}"))`], [`the ${w}`, `${b}`, `the ${b} ${w}`]); }
      return makeQ([`s = "  ${w}  "`, 's.strip()', 'print(len(s))'], [w.length, w.length + 2, 'Error'], 'Careful! What will it say?');
    },

    /* ---- World 3 ---- */
    compare: () => {
      const a = rnd(1, 20), b = rnd(1, 20), op = pick(['>', '<', '==', '!=', '>=', '<=']);
      const v = rnd(0, 2);
      if (v === 0) return makeQ([`print(${a} ${op} ${b})`], ['True', 'False', 'Error']);
      if (v === 1) { const w = pick(WORDS); const x = rand() < 0.5 ? w : w[0].toUpperCase() + w.slice(1); return makeQ([`print("${w}" == "${x}")`], ['True', 'False', 'Error']); }
      return makeQ([`x = ${a}`, `print(x ${op} ${a})`], ['True', 'False', String(a)]);
    },
    ifs: () => {
      const a = rnd(1, 20), b = rnd(1, 20), w1 = pick(WORDS), w2 = pick(WORDS.filter(x => x !== w1));
      return makeQ([`hp = ${a}`, `if hp > ${b}:`, `    print("${w1}")`, `print("${w2}")`], [`${w1}\n${w2}`, w2, w1, 'Nothing']);
    },
    ifelse: () => {
      const a = rnd(1, 20), b = rnd(1, 20), w1 = pick(WORDS), w2 = pick(WORDS.filter(x => x !== w1));
      const v = rnd(0, 1);
      if (v === 0) return makeQ([`gold = ${a}`, `if gold >= ${b}:`, `    print("${w1}")`, 'else:', `    print("${w2}")`], [w1, w2, `${w1}\n${w2}`]);
      return makeQ([`n = ${a}`, `if n < ${b}:`, `    n = n + ${b}`, 'else:', `    n = n - ${b}`, 'print(n)'], [a + b, a - b, a]);
    },
    elif: () => {
      const t = rnd(0, 40);
      return makeQ([`temp = ${t}`, 'if temp > 25:', '    print("Hot")', 'elif temp > 10:', '    print("Warm")', 'else:', '    print("Cold")'], ['Hot', 'Warm', 'Cold', 'Hot\nWarm']);
    },
    logic: () => {
      const a = pick(['True', 'False']), b = pick(['True', 'False']), op = pick(['and', 'or']);
      const v = rnd(0, 2);
      if (v === 0) return makeQ([`print(${a} ${op} ${b})`], ['True', 'False', 'Error']);
      if (v === 1) return makeQ([`print(not ${a})`], ['True', 'False', 'Error']);
      const x = rnd(1, 10), y = rnd(1, 10);
      return makeQ([`a = ${x}`, `b = ${y}`, `if a > 5 ${op} b > 5:`, '    print("Go")', 'else:', '    print("Wait")'], ['Go', 'Wait', 'Go\nWait']);
    },
    mod: () => {
      const a = rnd(5, 30), b = rnd(2, 6), v = rnd(0, 1);
      if (v === 0) return makeQ([`print(${a} % ${b})`], [Math.floor(a / b), a / b, (a % b) + 1, 0]);
      return makeQ([`n = ${a}`, 'if n % 2 == 0:', '    print("even")', 'else:', '    print("odd")'], ['even', 'odd', String(a % 2)]);
    },
    in: () => {
      const w = pick(WORDS), part = rand() < 0.5 ? w.slice(1, 4) : pick(['ice', 'oak', 'rain', 'gem']);
      return rand() < 0.5
        ? makeQ([`print("${part}" in "${w}")`], ['True', 'False', 'Error'])
        : makeQ([`scroll = "the ${w} awaits"`, `if "${part}" in scroll:`, '    print("Found it")', 'else:', '    print("Nothing here")'], ['Found it', 'Nothing here', 'Error']);
    },

    /* ---- World 4: loops ---- */
    forloop: () => {
      const n = rnd(2, 4), v = rnd(0, 2), w = pick(WORDS);
      if (v === 0) return makeQ([`for i in range(${n}):`, '    print(i)'], [range(1, n + 1).join('\n'), range(0, n + 1).join('\n'), String(n)]);
      if (v === 1) return makeQ([`for i in range(${n}):`, `    print("${w}")`, 'print("end")'], [[...Array(n).fill(w), 'end'].join('\n').replace(/\nend$/, '') + '\nend\nend', [w, 'end'].join('\n'), [...Array(n + 1).fill(w), 'end'].join('\n')]);
      return makeQ([`total = 0`, `for i in range(1, ${n + 2}):`, '    total += i', 'print(total)'], [(n + 1) * (n + 2) / 2 - (n + 1), (n + 2) * (n + 3) / 2, n + 1]);
    },
    range: () => {
      const a = rnd(0, 4), b = a + rnd(3, 6), s = rnd(2, 3);
      return rand() < 0.5
        ? makeQ([`print(list(range(${a}, ${b})))`], [`[${range(a, b + 1).join(', ')}]`, `[${range(a + 1, b + 1).join(', ')}]`])
        : makeQ([`print(list(range(${a}, ${b}, ${s})))`], [`[${range(a, b + 1).filter((x, i) => i % s === 0).join(', ')}]`, `[${range(a, b).join(', ')}]`]);
    },
    while: () => {
      const lim = rnd(10, 50), n = rnd(10, 20), s = rnd(3, 5);
      return rand() < 0.5
        ? makeQ(['x = 1', `while x < ${lim}:`, '    x = x * 2', 'print(x)'], [String(lim), 'Error'])
        : makeQ([`n = ${n}`, 'count = 0', 'while n > 0:', `    n -= ${s}`, '    count += 1', 'print(count)'], [Math.floor(n / s), Math.ceil(n / s) + 1, n]);
    },
    break: () => {
      const k = rnd(2, 5), m = rnd(2, 3);
      return rand() < 0.5
        ? makeQ(['for n in range(1, 8):', `    if n == ${k}:`, '        break', '    print(n)'], [range(1, k + 1).join('\n'), range(1, 8).filter(x => x !== k).join('\n')])
        : makeQ(['for n in range(1, 7):', `    if n % ${m} == 0:`, '        continue', '    print(n)'], [range(1, 7).filter(x => x % m === 0).join('\n'), range(1, m).join('\n')]);
    },

    /* ---- World 5: lists ---- */
    lists: () => {
      const items = shuffle(ITEMS).slice(0, 3), i = pick([0, 1, 2, -1, 3]);
      return rand() < 0.6
        ? makeQ([`bag = ${pyl(items)}`, `print(bag[${i}])`], items.concat(['Error']))
        : makeQ([`nums = [${nums3()}]`, 'print(nums[1:])'], ['Error']);
    },
    listmeth: () => {
      const [a, b, c] = shuffle(ITEMS).slice(0, 3), v = rnd(0, 3);
      if (v === 0) return makeQ([`bag = ["${a}", "${b}"]`, `bag.append("${c}")`, 'print(bag)'], [`['${c}', '${a}', '${b}']`, `['${a}', '${b}']`]);
      if (v === 1) return makeQ([`bag = ["${a}", "${b}", "${c}"]`, 'bag.pop()', 'print(bag)'], [`['${b}', '${c}']`, `['${a}', '${b}', '${c}']`]);
      if (v === 2) return makeQ([`bag = ["${a}", "${b}"]`, `bag.insert(0, "${c}")`, 'print(len(bag), bag[0])'], [`3 ${a}`, `2 ${c}`]);
      return makeQ([`nums = [${nums3()}]`, 'result = nums.sort()', 'print(result)'], ['Error']);
    },
    listloop: () => {
      const L = [rnd(1, 9), rnd(1, 9), rnd(1, 9), rnd(1, 9)], lim = rnd(3, 7);
      return rand() < 0.5
        ? makeQ([`nums = [${L.join(', ')}]`, 'total = 0', 'for n in nums:', `    if n > ${lim}:`, '        total += n', 'print(total)'], [L.reduce((s, x) => s + x, 0), L.filter(x => x >= lim).reduce((s, x) => s + x, 0) + 1])
        : makeQ([`nums = [${L.join(', ')}]`, 'print(max(nums) - min(nums))'], [Math.max(...L), Math.min(...L)]);
    },
    comp: () => {
      const k = rnd(2, 4), lim = rnd(2, 4);
      return rand() < 0.5
        ? makeQ([`print([n * ${k} for n in range(1, 4)])`], [`[${[0, 1, 2].map(n => n * k).join(', ')}]`, `[${[1, 2, 3, 4].map(n => n * k).join(', ')}]`])
        : makeQ([`print([n for n in range(7) if n > ${lim}])`], [`[${range(lim, 7).join(', ')}]`, `[${range(0, lim + 1).join(', ')}]`]);
    },

    /* ---- World 6: dictionaries ---- */
    dicts: () => {
      const [a, b] = shuffle(ITEMS).slice(0, 2), x = rnd(1, 9), y = rnd(10, 30), v = rnd(0, 2);
      if (v === 0) return makeQ([`d = {"${a}": ${x}, "${b}": ${y}}`, `print(d["${b}"])`], [x, 'Error', b]);
      if (v === 1) return makeQ([`d = {"${a}": ${x}}`, `d["${a}"] += ${y}`, 'print(d)'], [`{'${a}': ${y}}`, 'Error']);
      return makeQ([`d = {"${a}": ${x}}`, `print(d.get("${b}", 0), "${b}" in d)`], [`0 True`, 'Error', `None False`]);
    },
    dictloop: () => {
      const [a, b, c] = shuffle(ITEMS).slice(0, 3), x = rnd(1, 9), y = rnd(1, 9), z = rnd(1, 9);
      return rand() < 0.5
        ? makeQ([`d = {"${a}": ${x}, "${b}": ${y}, "${c}": ${z}}`, 'total = 0', 'for k in d:', '    total += d[k]', 'print(total)'], [x + y, 'Error', 3])
        : makeQ(['counts = {}', `for ch in "${pick(WORDS)}":`, '    counts[ch] = counts.get(ch, 0) + 1', 'print(len(counts))'], ['Error']);
    },

    /* ---- World 7: functions ---- */
    func: () => {
      const w = pick(WORDS), a = rnd(2, 9);
      return rand() < 0.5
        ? makeQ(['def chant():', `    print("${w}")`, 'print("start")', 'chant()'], [`${w}\nstart`, 'start', `start\n${w}\n${w}`])
        : makeQ(['def chant():', `    print("${w}")`, 'chant', 'print("end")'], [`${w}\nend`, 'Error']);
    },
    params: () => {
      const a = rnd(2, 9), b = rnd(2, 9), d = rnd(2, 5);
      return rand() < 0.5
        ? makeQ(['def brew(a, b):', '    return a - b', `print(brew(${b + a}, ${b}))`], [b - (b + a), 'Error'])
        : makeQ([`def stack(x, times=${d}):`, '    return x * times', `print(stack(${a}), stack(${a}, 1))`], [`${a} ${a}`, `${a * d} ${a * d}`]);
    },
    return: () => {
      const a = rnd(2, 9), b = rnd(1, 5);
      return rand() < 0.5
        ? makeQ(['def triple(n):', '    return n * 3', `print(triple(${a}) + ${b})`], [a * 3, a + b])
        : makeQ(['def triple(n):', '    print(n * 3)', `result = triple(${a})`, 'print(result)'], [`${a * 3}\n${a * 3}`, String(a * 3), 'Error']);
    },
    scope: () => {
      const a = rnd(1, 9), b = rnd(10, 20);
      return rand() < 0.5
        ? makeQ([`x = ${a}`, 'def change():', `    x = ${b}`, 'change()', 'print(x)'], [b, 'Error'])
        : makeQ(['def make():', `    secret = ${a}`, 'make()', 'print(secret)'], [a, 'None']);
    },
    recursion: () => {
      const n = rnd(3, 5);
      return makeQ(['def fact(n):', '    if n <= 1:', '        return 1', '    return n * fact(n - 1)', `print(fact(${n}))`], [factorial(n - 1), factorial(n + 1), 'Error']);
    },

    /* ---- World 8: errors ---- */
    errors: () => errQ(pick(ERR_SNIPPETS)()),
    tryexcept: () => {
      const a = rnd(1, 9), d = pick([0, 2]), w = pick(['abc', '12', 'x7', '40']);
      return rand() < 0.5
        ? makeQ(['try:', `    print(${a * 2} // ${d})`, 'except ZeroDivisionError:', '    print("trap")'], [String(a), 'trap', 'Error'].filter(x => x !== (d ? String(a) : 'trap')).concat(d ? ['trap'] : [String(a)]))
        : makeQ(['try:', `    n = int("${w}")`, '    print("ok", n)', 'except ValueError:', '    print("bad")', 'finally:', '    print("done")'], ['bad', 'done', `ok ${w}\ndone`, 'bad\ndone']);
    },
    raise: () => {
      const x = pick([-3, -1, 4, 7]);
      return makeQ(['def check(age):', '    if age < 0:', '        raise ValueError("bad age")', '    return age', 'try:', `    print(check(${x}))`, 'except ValueError as e:', '    print("Caught:", e)'], ['Caught: ValueError', String(x), 'Error', 'Caught: bad age']);
    },
  };
  /* ---- World 9: files (each question writes its own scroll first) ---- */
  const writeLines = (name, items) => [`with open("${name}", "w") as f:`, `    f.write("${items.join('\\n')}\\n")`];
  Object.assign(GEN, {
    files: () => {
      const ws = shuffle(WORDS).slice(0, rnd(2, 3)), v = rnd(0, 2);
      if (v === 0) return makeQ([...writeLines('notes.txt', ws), 'with open("notes.txt") as f:', '    text = f.read()', 'print(len(text))'], [ws.join('').length, ws.join('\n').length, 'Error']);
      if (v === 1) return makeQ([...writeLines('notes.txt', ws), 'with open("notes.txt") as f:', '    first = f.readline()', 'print(first.strip(), f.closed)'], [`${ws[0]} True`, `${ws[1]} False`, 'Error']);
      return makeQ([...writeLines('notes.txt', ws), `f = open("${pick(['notes.txt', 'note.txt', 'Notes.txt'])}")`, 'print(f.read().split()[0])'], [ws[0], ws[ws.length - 1], 'None']);
    },
    fileloop: () => {
      const ws = shuffle(WORDS).slice(0, rnd(2, 4)), w = ws[rnd(0, ws.length - 1)];
      return rand() < 0.5
        ? makeQ([...writeLines('list.txt', ws), 'count = 0', 'with open("list.txt") as f:', '    for line in f:', '        count += 1', 'print(count)'], [ws.length + 1, ws.length - 1, 1])
        : makeQ([...writeLines('list.txt', ws), 'with open("list.txt") as f:', '    lines = f.readlines()', `print(lines[${rnd(0, ws.length)}].strip())`], [...ws, 'Error']);
    },
    filewrite: () => {
      const [a, b] = shuffle(WORDS).slice(0, 2), m = pick(['w', 'a']);
      return rand() < 0.5
        ? makeQ(['with open("log.txt", "w") as f:', `    f.write("${a}")`, `    f.write("${b}")`, 'with open("log.txt") as f:', '    print(f.read())'], [`${a}\n${b}`, `${a} ${b}`, 'Error'])
        : makeQ([...writeLines('log.txt', [a]), `with open("log.txt", "${m}") as f:`, `    f.write("${b}\\n")`, 'with open("log.txt") as f:', '    print(len(f.readlines()))'], ['1', '2', '0', 'Error']);
    },
    parse: () => {
      const names = shuffle(['Ada', 'Wren', 'Mira', 'Quill']).slice(0, 3), ns = names.map(() => rnd(1, 30));
      const rec = names.map((x, i) => `${x},${ns[i]}`);
      return rand() < 0.5
        ? makeQ([...writeLines('crew.csv', rec), 'total = 0', 'with open("crew.csv") as f:', '    for line in f:', '        name, n = line.strip().split(",")', '        total += int(n)', 'print(total)'], [ns.join(''), ns[0], 'Error'])
        : makeQ([...writeLines('crew.csv', rec), 'with open("crew.csv") as f:', '    line = f.readline()', 'print(line.strip().split(",")[1])'], [names[0], ns[1], `['${names[0]}', '${ns[0]}']`]);
    },
  });

  /* ---- Worlds 10 to 12: classes ---- */
  const GN = ['Bolt', 'Rivet', 'Cog', 'Flint', 'Brass'];
  const initLines = (cls, fields) => [`class ${cls}:`, `    def __init__(self, ${fields.join(', ')}):`, ...fields.map(f => `        self.${f} = ${f}`)];
  Object.assign(GEN, {
    class: () => {
      const a = rnd(2, 20), b = rnd(2, 20), v = rnd(0, 2);
      if (v === 0) return makeQ(['class Box:', '    pass', 'x = Box()', 'y = Box()', `x.n = ${a}`, `y.n = ${b}`, 'x.n = x.n + y.n', 'print(x.n, y.n)'], [`${a + b} ${a + b}`, `${a} ${b}`]);
      if (v === 1) return makeQ(['class Box:', '    pass', 'x = Box()', 'y = x', `y.n = ${a}`, 'print(x.n)'], ['Error', 'None']);
      return makeQ(['class Box:', '    pass', 'b = Box()', `b.size = ${a}`, 'print(b.sizes)'], [a, 'None']);
    },
    init: () => {
      const n = pick(GN), p = rnd(2, 30), v = rnd(0, 2);
      if (v === 0) return makeQ([...initLines('Golem', ['name', 'power']), `g = Golem("${n}", ${p})`, 'print(g.power * 2)'], [p, `${p}${p}`]);
      if (v === 1) return makeQ(['class Golem:', '    def __init__(self, hp=10):', '        self.hp = hp', `print(Golem().hp + Golem(${p}).hp)`], [p, 20]);
      return makeQ([...initLines('Golem', ['name', 'power']), `g = Golem("${n}")`, 'print(g.name)'], [n, 'None']);
    },
    method: () => {
      const p = rnd(2, 12), k = rnd(2, 5), v = rnd(0, 1);
      if (v === 0) return makeQ([...initLines('Golem', ['power']), '    def boost(self, k):', '        return self.power * k', `print(Golem(${p}).boost(${k}))`], [p + k, p]);
      return makeQ(['class Golem:', '    def roar():', '        return "ROAR"', 'print(Golem().roar())'], ['ROAR', 'roar']);
    },
    state: () => {
      const a = rnd(5, 20), b = rnd(2, 9), k = rnd(2, 4), v = rnd(0, 1);
      if (v === 0) return makeQ(['class Purse:', '    def __init__(self):', '        self.gold = 0', '    def add(self, n):', '        self.gold += n', 'p = Purse()', `for i in range(${k}):`, `    p.add(${b})`, 'print(p.gold)'], [b, k + b]);
      return makeQ(['class Cell:', `    def __init__(self):`, `        self.hp = ${a}`, '    def hit(self):', `        self.hp -= ${b}`, 'a = Cell()', 'b = Cell()', 'a.hit()', 'a.hit()', 'b.hit()', 'print(a.hp, b.hp)'], [`${a - b} ${a - b}`, `${a - 2 * b} ${a - 2 * b}`]);
    },
    strdunder: () => {
      const n = pick(GN), v = rnd(0, 1);
      if (v === 0) return makeQ(['class Golem:', '    def __init__(self, name):', '        self.name = name', '    def __str__(self):', '        return "Golem " + self.name', `g = Golem("${n}")`, 'print(g)', 'print(len(str(g)))'], [`Golem ${n}\n${n.length}`, `${n}\n${n.length + 6}`]);
      return makeQ(['class Golem:', '    def __str__(self):', '        return "G"', 'print(f"[{Golem()}]", str(Golem()) * 2)'], ['[G] G', 'Error']);
    },
    objlist: () => {
      const ps = [rnd(1, 9), rnd(1, 9), rnd(1, 9)], t = rnd(3, 7);
      return rand() < 0.5
        ? makeQ([...initLines('Golem', ['power']), `army = [Golem(p) for p in [${ps.join(', ')}]]`, 'print(sum(g.power for g in army))'], [ps.join(''), Math.max(...ps)])
        : makeQ([...initLines('Golem', ['power']), `army = [Golem(p) for p in [${ps.join(', ')}]]`, `print(len([g for g in army if g.power > ${t}]))`], [3, 0, 1, 2]);
    },
    ooperr: () => errQ(pick([
      () => ['class G:', '    pass', 'print(G().power)'],
      () => ['class G:', '    def f():', '        return 1', 'print(G().f())'],
      () => ['class G:', '    def __init__(self, n):', '        self.n = n', 'print(G().n)'],
      () => ['class G:', '    def __init__(self, n):', '        self.n = n', `print(G(${rnd(1, 9)}).n)`],
      () => ['class G:', '    def f(self):', '        return x', 'G().f()'],
    ])()),
    inherit: () => {
      const n = pick(GN), v = rnd(0, 1);
      if (v === 0) return makeQ(['class Hero:', '    def greet(self):', '        return "hi"', 'class Knight(Hero):', '    def charge(self):', '        return "go"', 'k = Knight()', 'print(k.greet(), k.charge())'], ['Error', 'go go']);
      return makeQ(['class Hero:', '    def __init__(self, name):', '        self.name = name', 'class Knight(Hero):', '    pass', `print(Knight("${n}").name)`], ['Error', 'None']);
    },
    override: () => {
      const s = pick(['meow', 'woof', 'moo']), v = rnd(0, 1);
      if (v === 0) return makeQ(['class A:', '    def speak(self):', '        return "..."', '    def intro(self):', '        return "I say " + self.speak()', 'class B(A):', '    def speak(self):', `        return "${s}"`, 'print(B().intro(), A().intro())'], [`I say ... I say ...`, `I say ${s} I say ${s}`]);
      return makeQ(['class A:', '    def f(self):', '        return 1', 'class B(A):', '    def f(self):', '        return 2', 'class C(B):', '    pass', 'print(A().f(), B().f(), C().f())'], ['1 2 1', '1 2 Error']);
    },
    superc: () => {
      const a = rnd(2, 9), v = rnd(0, 1);
      if (v === 0) return makeQ(['class Hero:', '    def __init__(self, hp):', '        self.hp = hp', 'class Mage(Hero):', '    def __init__(self, hp, mana):', '        super().__init__(hp)', '        self.mana = mana', `m = Mage(${a}, ${a + 3})`, 'print(m.hp + m.mana)'], [a, a + 3, 'Error']);
      return makeQ(['class A:', '    def name(self):', '        return "A"', 'class B(A):', '    def name(self):', '        return super().name() + "B"', 'print(B().name())'], ['B', 'BA']);
    },
    isinst: () => rand() < 0.5
      ? makeQ(['class A:', '    pass', 'class B(A):', '    pass', 'b = B()', 'print(isinstance(b, A), type(b) == A)'], ['True True', 'False False'])
      : makeQ([`items = [${rnd(1, 9)}, "x", ${rnd(1, 9)}.5, True]`, 'print(len([i for i in items if isinstance(i, int)]))'], [1, 3]),
    eqdunder: () => {
      const v = rnd(1, 9);
      return rand() < 0.5
        ? makeQ(['class C:', '    def __init__(self, v):', '        self.v = v', `print(C(${v}) == C(${v}))`], ['True', 'Error'])
        : makeQ(['class C:', '    def __init__(self, v):', '        self.v = v', '    def __eq__(self, o):', '        return self.v == o.v', `a = C(${v})`, `b = C(${v})`, 'print(a == b, a is b)'], ['True True', 'False False']);
    },
    opdunder: () => {
      const a = rnd(1, 20), b = rnd(1, 20), v = rnd(0, 1);
      if (v === 0) return makeQ(['class G:', '    def __init__(self, n):', '        self.n = n', '    def __add__(self, o):', '        return G(self.n + o.n)', `print((G(${a}) + G(${b})).n)`], [`${a}${b}`, 'Error']);
      return makeQ(['class Bag:', '    def __init__(self, items):', '        self.items = items', '    def __len__(self):', '        return len(self.items)', `print(len(Bag([${a}, ${b}])), len(Bag(list())) == 0)`], ['2 False', '0 True']);
    },
    classattr: () => rand() < 0.5
      ? makeQ(['class Bot:', '    count = 0', '    def __init__(self):', '        Bot.count += 1', `for i in range(${rnd(2, 5)}):`, '    Bot()', 'print(Bot.count)'], [0, 1])
      : makeQ(['class Bot:', `    wheels = ${rnd(2, 6)}`, 'a = Bot()', 'b = Bot()', 'a.wheels = 9', 'print(b.wheels == a.wheels)'], ['True', 'Error']),
    property: () => {
      const w = rnd(2, 9), h = rnd(2, 9);
      return makeQ(['class P:', '    def __init__(self, w, h):', '        self.w = w', '        self.h = h', '    @property', '    def area(self):', '        return self.w * self.h', `p = P(${w}, ${h})`, 'p.h = p.h + 1', 'print(p.area)'], [w * h, 'Error']);
    },
    setter: () => {
      const x = rnd(11, 40);
      return makeQ(['class D:', '    def __init__(self):', '        self._v = 0', '    @property', '    def v(self):', '        return self._v', '    @v.setter', '    def v(self, n):', '        self._v = min(n, 10)', 'd = D()', `d.v = ${x}`, 'print(d.v)'], [x, 0]);
    },
    clsmethod: () => {
      const a = rnd(1, 9), b = rnd(1, 9);
      return makeQ(['class P:', '    def __init__(self, a, b):', '        self.a = a', '        self.b = b', '    @classmethod', '    def parse(cls, t):', '        x, y = t.split(",")', '        return cls(int(x), int(y))', `p = P.parse("${a},${b}")`, 'print(p.a * p.b)'], [`${a}${b}`, a + b]);
    },
    staticm: () => {
      const v = rnd(-3, 13);
      return makeQ(['class G:', '    @staticmethod', '    def ok(v):', '        return 0 <= v <= 10', `print(G.ok(${v}), G().ok(5))`], [`${!(v >= 0 && v <= 10) ? 'True' : 'False'} True`, 'Error']);
    },
    compose: () => {
      const ws = [rnd(1, 9), rnd(1, 9)];
      return makeQ(['class Part:', '    def __init__(self, w):', '        self.w = w', 'class M:', '    def __init__(self):', '        self.parts = list()', '    def add(self, p):', '        self.parts.append(p)', 'm = M()', `m.add(Part(${ws[0]}))`, `m.add(Part(${ws[1]}))`, 'print(len(m.parts), sum(p.w for p in m.parts))'], [`2 ${ws[0]}${ws[1]}`, `1 ${ws[1]}`]);
    },
    poly: () => makeQ(['class A:', '    def go(self):', '        return "a"', 'class B(A):', '    def go(self):', '        return "b"', 'print("".join(x.go() for x in [A(), B(), B(), A()]))'], ['aaaa', 'bbbb', 'abab']),
  });

  /* ---- Worlds 13 to 15: libraries, regex, tests ---- */
  const PT = { pytest: true };
  Object.assign(GEN, {
    modules: () => {
      const n = rnd(2, 12), x = rnd(1, 30) + pick([0.3, 0.7]), v = rnd(0, 2);
      if (v === 0) return makeQ(['import math', `print(math.sqrt(${n * n}))`], [n, `${n * n}`]);
      if (v === 1) return makeQ(['import math', `print(math.floor(${x}), math.ceil(${x}))`], [`${Math.ceil(x)} ${Math.floor(x)}`, `${Math.round(x)} ${Math.round(x)}`]);
      return makeQ(['import math', `print(sqrt(${n * n}))`], [`${n}.0`, n]);
    },
    randomq: () => {
      const a = rnd(1, 5), b = rnd(6, 20), v = rnd(0, 2);
      if (v === 0) return makeQ(['import random', `r = random.randint(${a}, ${b})`, `print(${a} <= r <= ${b})`], ['False', a]);
      if (v === 1) return makeQ(['import random', 'items = ["a", "b", "c", "d"]', 'random.shuffle(items)', 'print(len(items), sorted(items) == ["a", "b", "c", "d"])'], ['4 False', '3 True']);
      return makeQ(['import random', `random.seed(${rnd(1, 99)})`, 'a = random.random()', 'random.seed(0)', 'random.seed(0)', 'b = random.random()', 'c = random.random()', 'print(a == b, b == c)'], ['True True', 'True False']);
    },
    stats: () => {
      const a = rnd(1, 10), d = rnd(1, 5), xs = [a, a + d, a + 2 * d], v = rnd(0, 1);
      if (v === 0) return makeQ(['import statistics', `print(statistics.mean([${xs.join(', ')}]))`], [a + d + 0.5, `${a + d}.0`]);
      return makeQ(['import statistics', `print(statistics.median([${[xs[2], xs[0], xs[1], xs[1] + 1].join(', ')}]))`], [xs[1], (xs[0] + xs[2]) / 2 === xs[1] + 0.5 ? xs[1] : xs[1] + 0.5 + 1]);
    },
    argv: () => {
      const n = pick(NAMES), m = pick(NAMES), v = rnd(0, 1);
      if (v === 0) return makeQ(['import sys', 'print(len(sys.argv), sys.argv[1])'], [`2 ${n}`, `3 hello.py`], `Typed: python hello.py ${n} ${m}. What will it say?`, { argv: ['hello.py', n, m] });
      return makeQ(['import sys', 'if len(sys.argv) != 2:', '    sys.exit("usage: hello.py NAME")', 'print("hi", sys.argv[1])'], [`hi ${n}`, 'Error'], 'Typed: python hello.py. What will it say?', { argv: ['hello.py'] });
    },
    jsonq: () => {
      const p = rnd(1, 99), v = rnd(0, 1);
      if (v === 0) return makeQ(['import json', `print(json.dumps({"ok": True, "gold": ${p}, "x": None}))`], [`{'ok': True, 'gold': ${p}, 'x': None}`, `{"ok": True, "gold": ${p}, "x": None}`]);
      return makeQ(['import json', `d = json.loads('{"gold": ${p}}')`, 'print(d["gold"] + 1, type(d).__name__)'], [`${p}1 str`, `${p + 1} str`]);
    },
    mymodule: () => {
      const k = rnd(2, 9);
      return makeQ(['import tools', `print(tools.twice(${k}), __name__)`], [`${2 * k} tools`, `${k}${k} __main__`], 'tools.py is on the shelf. What will it say?', { files: { 'tools.py': 'def twice(n):\n    return n * 2\nif __name__ == "__main__":\n    print("tools main")\n' } });
    },
    requestsq: () => {
      const p = rnd(5, 40);
      return makeQ(['import requests', 'r = requests.get("https://api.bazaar.dev/spell")', 'print(r.status_code, r.json()["power"] * 2)'], [`404 ${p * 2}`, `200 ${p}${p}`], 'What will it say?', { web: { 'https://api.bazaar.dev/spell': { power: p } } });
    },
    research: () => {
      const [a, b] = shuffle(WORDS).slice(0, 2);
      return rand() < 0.5
        ? makeQ(['import re', `log = "a ${a} and a ${a}"`, `print(bool(re.search("${a}", log)), re.search("${b}", log))`], ['True True', 'False None'])
        : makeQ(['import re', `m = re.search("${a}", "xx${a}")`, 'print(m.group(), m.start())'], [`${a} 0`, `xx${a} 2`]);
    },
    rewild: () => {
      const w = pick(['cat', 'ct', 'caat', 'cut']), n = rnd(1, 5);
      return rand() < 0.5
        ? makeQ(['import re', `print(bool(re.search(r"^c.t$", "${w}")), bool(re.search(r"^ca*t$", "${w}")))`], ['True True', 'False False'])
        : makeQ(['import re', `print(re.search(r"o+", "g${'o'.repeat(n)}al").group())`], ['o', `g${'o'.repeat(n)}al`]);
    },
    reclass: () => {
      const a = rnd(1, 99), b = rnd(1, 99);
      return rand() < 0.5
        ? makeQ(['import re', `print(re.findall(r"\\d+", "x${a}y${b}z"))`], [`['${a}${b}']`, `[${a}, ${b}]`])
        : makeQ(['import re', `print(len(re.findall(r"[aeiou]", "${pick(WORDS)}")))`], [0, 1, 4]);
    },
    reanchor: () => {
      const c = pick(['123', '1234', 'a123', '12']);
      return makeQ(['import re', `print(re.fullmatch(r"\\d{3}", "${c}") is not None, re.search(r"\\d{3}", "${c}") is not None)`], ['True True', 'False False', 'True False']);
    },
    regroup: () => {
      const [a, b] = shuffle(NAMES).slice(0, 2);
      return makeQ(['import re', `m = re.search(r"(\\w+), (\\w+)", "${a}, ${b}")`, 'print(m.group(2), m.group(1))'], [`${a} ${b}`, `${a}, ${b} ${a}`]);
    },
    rerepeat: () => {
      const w = pick(['Cat', 'dog', 'DOG', 'cow']);
      return makeQ(['import re', `print(bool(re.fullmatch(r"cat|dog", "${w}")), bool(re.fullmatch(r"cat|dog", "${w}", re.IGNORECASE)))`], ['True True', 'False False', 'True False']);
    },
    resub: () => {
      const [a, b] = shuffle(NAMES).slice(0, 2);
      return rand() < 0.5
        ? makeQ(['import re', `print(re.sub(r"(\\w+) (\\w+)", r"\\2 \\1", "${a} ${b}"))`], [`${a} ${b}`, `\\2 \\1`])
        : makeQ(['import re', 'print(re.sub(r"\\s+", "-", "a  b   c"))'], ['a--b---c', 'a-b-c-']);
    },
    asserts: () => {
      const n = rnd(2, 9);
      return rand() < 0.5
        ? makeQ(['def sq(n):', '    return n * n', `assert sq(${n}) == ${n * n}`, 'print("ok")'], ['Error', 'True'])
        : makeQ(['try:', `    assert ${n} > 10, "too small"`, 'except AssertionError as e:', '    print("caught", e)'], ['caught', 'Error']);
    },
    pytestq: () => {
      const n = rnd(2, 9);
      return makeQ(['def sq(n):', '    return n * n', 'def test_a():', `    assert sq(${n}) == ${n * n}`, 'def test_b():', `    assert sq(${n}) == ${n * 2}`, 'def check_c():', '    assert False'], [`test_a PASSED\ntest_b PASSED\n== 2 passed ==`, `test_a PASSED\ntest_b FAILED - assert ${n * n} == ${n * 2}\ncheck_c FAILED\n== 2 failed, 1 passed ==`], 'Run with pytest. What will it say?', PT);
    },
    edge: () => makeQ(['def first(s):', '    return s[0]', 'def test_word():', '    assert first("hi") == "h"', 'def test_empty():', '    assert first("") == ""'], ['test_word PASSED\ntest_empty PASSED\n== 2 passed ==', 'test_word FAILED - IndexError\n== 1 failed =='], 'Run with pytest. What will it say?', PT),
    raisesq: () => {
      const n = pick([-1, 3]);
      return makeQ(['import pytest', 'def check(n):', '    if n < 0:', '        raise ValueError("neg")', '    return n', 'def test_neg():', '    with pytest.raises(ValueError):', `        check(${n})`], ['test_neg FAILED - ValueError: neg\n== 1 failed ==', 'test_neg PASSED\n== 1 passed ==', "test_neg FAILED - Failed: DID NOT RAISE <class 'ValueError'>\n== 1 failed =="].filter((x, i) => true), 'Run with pytest. What will it say?', PT);
    },
    cases: () => {
      const bad = rnd(0, 2);
      const cases = [[2, 4], [3, 9], [4, 16]].map((c, i) => (i === bad ? [c[0], c[1] + 1] : c));
      return makeQ(['def sq(n):', '    return n * n', 'def test_many():', `    for n, want in [${cases.map(c => `(${c[0]}, ${c[1]})`).join(', ')}]:`, '        assert sq(n) == want'], ['test_many PASSED\n== 1 passed ==', `test_many FAILED - assert ${cases[bad][1]} == ${cases[bad][1]}\n== 1 failed ==`], 'Run with pytest. What will it say?', PT);
    },
    tdd: () => makeQ(['def test_greet():', '    assert greet("Ada") == "hi Ada"', 'def greet(name):', '    return "hi " + name'], ['test_greet FAILED - NameError: name \'greet\' is not defined\n== 1 failed ==', 'Error'], 'Tests run after the whole file is read. What will pytest say?', PT),
  });

  /* ---- Worlds 16 to 18: collections, flexible functions, generators ---- */
  const nl = xs => '[' + xs.join(', ') + ']';
  Object.assign(GEN, {
    sets: () => {
      const xs = [rnd(0, 3), rnd(0, 3), rnd(4, 7), rnd(0, 7)];
      return rand() < 0.5
        ? makeQ([`nums = ${nl(xs)}`, 'print(len(nums), len(set(nums)))'], [`${xs.length} ${xs.length}`, `${new Set(xs).size} ${xs.length}`])
        : makeQ([`s = {${xs[0]}, ${xs[2]}}`, `s.add(${xs[0]})`, 's.add(1)', `print(sorted(s), ${xs[2]} in s)`], ['Error', `[${xs[0]}, ${xs[0]}, 1, ${xs[2]}] True`]);
    },
    setops: () => {
      const a = rnd(0, 2), b = rnd(3, 5);
      return makeQ([`x = {${a}, ${b}, 6}`, `y = {${b}, 7}`, 'print(x & y, x - y)'], [`{${b}} {${a}, 6, 7}`, `{${a}, ${b}, 6, 7} {${a}, 6}`]);
    },
    lambdaq: () => {
      const a = rnd(2, 9), b = rnd(2, 9);
      return rand() < 0.5
        ? makeQ(['f = lambda x, y=10: x * y', `print(f(${a}), f(${a}, ${b}))`], [`${a * 10} ${a * 10}`, 'Error'])
        : makeQ(['fs = [lambda x: x + 1, lambda x: x * 2]', `print([f(${a}) for f in fs])`], [`[${a * 2}, ${a + 1}]`, `[${a + 1}, ${a + 1}]`]);
    },
    sortkey: () => {
      const ws = shuffle(['fig', 'lily', 'iris', 'oak', 'tulip']).slice(0, 4);
      return rand() < 0.5
        ? makeQ([`print(sorted(${JSON.stringify(ws)}, key=len))`], [JSON.stringify(ws.slice().sort()).replace(/"/g, "'").replace(/,/g, ', '), 'Error'])
        : makeQ([`print(max(${JSON.stringify(ws)}, key=len), min(${JSON.stringify(ws)}, key=len))`], [`${ws[0]} ${ws[1]}`, `${ws.slice().sort()[3]} ${ws.slice().sort()[0]}`]);
    },
    mapfilter: () => {
      const xs = [rnd(1, 9), rnd(1, 9), rnd(1, 9)];
      const v = rnd(0, 2);
      if (v === 0) return makeQ([`print(list(map(lambda n: n * 2, ${nl(xs)})))`], [nl(xs), `[${xs.join(', ')}, ${xs.join(', ')}]`]);
      if (v === 1) return makeQ([`print(list(filter(lambda n: n > 4, ${nl(xs)})))`], [nl(xs), '[]']);
      return makeQ([`m = map(abs, ${nl(xs)})`, 'print(sum(m), sum(m))'], [`${xs[0] + xs[1] + xs[2]} ${xs[0] + xs[1] + xs[2]}`, 'Error']);
    },
    zipq: () => {
      const v = rnd(0, 1);
      if (v === 0) return makeQ(['print(list(zip("abc", [1, 2])))'], ["[('a', 1), ('b', 2), ('c', None)]", 'Error']);
      return makeQ([`print(any(x > 5 for x in [1, ${rnd(2, 9)}]), all([1, "", 2]))`], ['True True', 'False False']);
    },
    argsq: () => {
      const xs = [rnd(1, 9), rnd(1, 9)];
      return makeQ(['def f(first, *rest):', '    return len(rest), first', `print(f(${xs[0]}, ${xs[1]}, 3))`], [`(3, ${xs[0]})`, `(1, ${xs[0]})`]);
    },
    kwargsq: () => makeQ(['def f(**opts):', '    return sorted(opts)', 'print(f(b=1, a=2), f())'], ["['b', 'a'] []", 'Error']),
    unpackcall: () => {
      const a = rnd(1, 20), b = rnd(1, 20);
      return rand() < 0.5
        ? makeQ(['def f(x, y):', '    return x - y', `print(f(*[${a}, ${b}]), f(**{"y": ${a}, "x": ${b}}))`], [`${a - b} ${a - b}`, 'Error'])
        : makeQ([`print(*[${a}, ${b}], sep="-")`], [`[${a}, ${b}]`, `${a} ${b}`]);
    },
    unpackassign: () => {
      const xs = [rnd(1, 9), rnd(1, 9), rnd(1, 9), rnd(1, 9)];
      return rand() < 0.5
        ? makeQ([`first, *rest = ${nl(xs)}`, 'print(first, rest)'], [`${xs[0]} ${xs[3]}`, 'Error'])
        : makeQ([`a, b = ${xs[0]}, ${xs[1]}`, 'a, b = b, a', 'print(a, b)'], [`${xs[0]} ${xs[1]}`, `${xs[1]} ${xs[1]}`]);
    },
    kwonly: () => rand() < 0.5
      ? makeQ(['def f(a, *, b=2):', '    return a * b', `print(f(${rnd(2, 9)}), f(1, b=5))`], ['Error', '2 5'])
      : makeQ(['def add(x, bag=[]):', '    bag.append(x)', '    return len(bag)', 'add(1)', 'print(add(2))'], ['1', 'Error']),
    hints: () => makeQ(['def f(n: int) -> int:', '    return n * 2', 'print(f("ab"))'], ['Error', '4']),
    sigerr: () => errQ(pick([
      () => ['def f(a, b):', '    return a', 'f(1, c=2)'],
      () => ['def f(a):', '    return a', 'f(1, a=2)'],
      () => ['x, y = [1, 2, 3]'],
      () => ['def f(*n):', '    return sum(n)', `print(f(${rnd(1, 9)}, 2))`],
    ])()),
    iterq: () => {
      const xs = [rnd(1, 9), rnd(1, 9), rnd(1, 9)];
      return rand() < 0.5
        ? makeQ([`it = iter(${nl(xs)})`, 'next(it)', 'print(list(it))'], [nl(xs), `[${xs[0]}]`])
        : makeQ([`it = iter([${xs[0]}])`, 'next(it)', 'print(next(it, "done"))'], ['Error', `${xs[0]}`]);
    },
    yieldq: () => {
      const a = rnd(1, 9), b = rnd(10, 20);
      return rand() < 0.5
        ? makeQ(['def g():', `    yield ${a}`, `    yield ${b}`, 'it = g()', 'print(next(it), next(it))'], [`${a} ${a}`, 'Error'])
        : makeQ(['def g():', '    print("start")', '    yield 1', 'x = g()', 'print("made")'], ['start\nmade', 'made\nstart']);
    },
    infgen: () => {
      const k = rnd(3, 5);
      return makeQ(['def nat():', '    n = 0', '    while True:', '        yield n', '        n += 2', 'g = nat()', `print([next(g) for _ in range(${k})])`], ['Error', nl([...Array(k).keys()])]);
    },
    genexp: () => {
      const xs = [rnd(1, 9), rnd(1, 9), rnd(1, 9)];
      return rand() < 0.5
        ? makeQ([`g = (x * 2 for x in ${nl(xs)})`, 'print(sum(g), sum(g))'], [`${2 * (xs[0] + xs[1] + xs[2])} ${2 * (xs[0] + xs[1] + xs[2])}`, 'Error'])
        : makeQ([`print(sum(x for x in ${nl(xs)} if x % 2))`], [xs[0] + xs[1] + xs[2], 0]);
    },
    dictcomp: () => {
      const n = rnd(3, 5);
      return rand() < 0.5
        ? makeQ([`d = {i: i * i for i in range(${n})}`, `print(d[${n - 1}], len(d))`], [`${n * n} ${n}`, `${(n - 1) * (n - 1)} ${n + 1}`])
        : makeQ([`print(len({x % 2 for x in range(${n * 2})}))`], [n * 2, n]);
    },
    nestcomp: () => {
      const a = rnd(1, 4), b = rnd(5, 9);
      return rand() < 0.5
        ? makeQ([`grid = [[${a}, 2], [3, ${b}]]`, 'print([x for row in grid for x in row])'], [`[[${a}, 2], [3, ${b}]]`, `[${a}, 3, 2, ${b}]`])
        : makeQ([`print(["hi" if i % 2 else "lo" for i in range(${rnd(3, 4)})])`], ["['hi', 'lo', 'hi']", 'Error']);
    },
    pipeline: () => makeQ(['def src():', '    for i in range(1, 6):', '        yield i', 'def odd(xs):', '    for x in xs:', '        if x % 2:', '            yield x', 'print(list(odd(src())))'], ['[2, 4]', '[1, 2, 3, 4, 5]']),
  });

  /* ---- CS50P extras: input, match, global, csv, argparse ---- */
  Object.assign(GEN, {
    inputq: () => {
      const a = rnd(2, 20), b = rnd(2, 20), v = rnd(0, 1);
      if (v === 0) return makeQ(['x = input("x: ")', 'y = input("y: ")', 'print(x + y)'], [`x: ${a}\ny: ${b}\n${a + b}`, `${a + b}`], `Someone types ${a}, then ${b}. What will it say?`, { input: [String(a), String(b)] });
      return makeQ(['n = int(input("n: "))', 'print(n * 2)'], [`n: ${a}\n${a}${a}`, `${a * 2}`], `Someone types ${a}. What will it say?`, { input: [String(a)] });
    },
    matchq: () => {
      const w = pick(['n', 'north', 'south', 'up', 'w']);
      return makeQ(['way = "' + w + '"', 'match way:', '    case "north" | "n":', '        print("hill")', '    case "south":', '        print("river")', '    case _:', '        print("stay")'], ['hill', 'river', 'stay', 'Error']);
    },
    globalq: () => {
      const g = rnd(2, 20), a = rnd(1, 9);
      return rand() < 0.6
        ? makeQ([`gold = ${g}`, 'def earn():', '    global gold', `    gold += ${a}`, 'earn()', 'print(gold)'], [g, `${g}${a}`, 'Error'])
        : makeQ([`gold = ${g}`, 'def earn():', `    gold += ${a}`, 'earn()', 'print(gold)'], [g + a, g]);
    },
    csvq: () => {
      const [a, b] = shuffle(NAMES).slice(0, 2);
      return makeQ(['import csv', 'with open("h.csv") as f:', '    for row in csv.DictReader(f):', '        print(row["name"])'], [`name\n${a}\n${b}`, `${a},Oak\n${b},Elm`], 'h.csv is on the shelf. What will it say?', { files: { 'h.csv': `name,home\n${a},"Oak, North"\n${b},Elm\n` } });
    },
    argparseq: () => {
      const n = rnd(2, 4);
      return rand() < 0.5
        ? makeQ(['import argparse', 'p = argparse.ArgumentParser()', 'p.add_argument("-n", type=int, default=1)', 'args = p.parse_args()', 'print("hi" * args.n)'], ['hi', `hi${n}`, 'Error'], `Typed: python hi.py -n ${n}. What will it say?`, { argv: ['hi.py', '-n', String(n)] })
        : makeQ(['import argparse', 'p = argparse.ArgumentParser()', 'p.add_argument("-n", type=int, default=1)', 'args = p.parse_args()', 'print("hi" * args.n)'], ['hihi', 'Error', ''], 'Typed: python hi.py. What will it say?', { argv: ['hi.py'] });
    },
  });

  function range(a, b) { const out = []; for (let i = a; i < b; i++) out.push(i); return out; }
  function nums3() { return [rnd(1, 9), rnd(1, 9), rnd(1, 9)].join(', '); }
  function pyl(a) { return '[' + a.map(x => `"${x}"`).join(', ') + ']'; }
  function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }
  const ITEMS = ['potion', 'map', 'key', 'torch', 'rope', 'gem', 'scroll', 'herb'];
  const ERR_TYPES = ['NameError', 'TypeError', 'ValueError', 'IndexError', 'KeyError', 'ZeroDivisionError', 'No error'];
  const ERR_SNIPPETS = [
    () => [`print(int("${pick(WORDS)}"))`],
    () => ['nums = [1, 2, 3]', `print(nums[${rnd(3, 6)}])`],
    () => [`print("gold: " + ${rnd(1, 99)})`],
    () => [`print(${rnd(1, 99)} / 0)`],
    () => ['d = {"a": 1}', `print(d["${pick(WORDS)}"])`],
    () => [`print(${pick(WORDS)})`],
    () => [`print(len(${rnd(1, 99)}))`],
    () => ['nums = [1, 2, 3]', `print(nums[${rnd(0, 2)}])`],
  ];
  function errQ(code) {
    const r = Py.run(code);
    const right = r.error ? r.error.type : 'No error';
    const wrongs = shuffle(ERR_TYPES.filter(t => t !== right)).slice(0, 2);
    const choices = shuffle([right, ...wrongs]);
    return { text: 'Which error will this cause?', code, choices, answer: choices.indexOf(right), explain: r.error ? `It raises ${r.error.type}: ${r.error.msg}` : 'It runs fine with no error.' };
  }
  // several level tags share a question pool
  const ALIAS = { accum: 'forloop', forstr: 'forloop', nested: 'forloop', sort: 'listmeth', listslice: 'lists', dictmod: 'dicts', get: 'dicts', dictcount: 'dictloop', dictnest: 'dicts', defaults: 'params', compose: 'return', errtypes: 'errors', multiexcept: 'tryexcept', finally: 'tryexcept', validate: 'tryexcept', with: 'files', append: 'filewrite' };
  for (const k in ALIAS) GEN[k] = GEN[ALIAS[k]];
  // seeded randomness for review bosses and the checker
  const useRandom = fn => { rand = fn || Math.random; };
  // world files add their own question pools with these helpers
  return { GEN, useRandom, makeQ, pick, rnd, shuffle, WORDS, NAMES };
})();
