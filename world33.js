/* World 33: The Ledger Hall. CSV and JSON in depth: csv.reader with headers and quoted
   commas, converting types, DictReader totals and filters, csv.writer / DictWriter and
   delimiters, JSON text and Python types, nested JSON data, saving and loading with
   json.dump / json.load, and JSONDecodeError. Sources: Py4E chapter 13, ATBS chapter 16. */
Object.assign(EXTRA.npcs, {
  ledgermaster: { name: 'Ledger-master Oswin', colors: ['#3f6a3a', '#e2b34a', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  coinbat: { base: 'bat', name: 'Coin bat', pal: { P: '#a8711a', W: '#ffd75f' } },
  tallyimp: { base: 'goblin', name: 'Tally imp', pal: { G: '#7a9a5a', Y: '#ffd75f' } },
  hoarddragon: { base: 'dragon', name: 'The Hoard Dragon', pal: { G: '#c8a03a', Y: '#fff1a8', L: '#ffe0a8' } },
});
const LEDGER_CSV = 'name,item,qty,price\nAda,rope,2,3.5\nWren,lamp,1,12\nAda,"oil, lamp",3,1.25\nTam,rope,5,3.5\n';
const QUEST_JSON = '{"guild": "Ledger Hall", "members": [{"name": "Ada", "level": 7, "skills": ["fire", "ice"]}, {"name": "Wren", "level": 4, "skills": ["luck"]}, {"name": "Tam", "level": 9, "skills": ["storm"]}], "open": true, "treasurer": null}';

const WORLD33 = {
  id: 33, name: 'The Ledger Hall', topic: 'CSV and JSON in depth',
  nodes: [[50, 92], [28, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [40, 21], [52, 8]],
  levels: [
    {
      id: '33-1', title: 'Rows and columns', bg: 'archive', npc: 'ledgermaster', mentor: 'ledgermaster', tags: ['csvread'],
      steps: [
        { type: 'talk', who: 'ledgermaster', text: "Welcome to the Ledger Hall, {NAME}. I'm Oswin. Every sale in the land ends up here in CSV files: one row per line, columns split by commas. Never split them yourself with split(\",\"): a comma INSIDE quotes would break you. Let csv.reader do it." },
        { type: 'talk', who: 'ledgermaster', text: 'Each row comes out as a list of STRINGS. next(reader) takes the header row off first. Numbers must be converted with int() or float().' },
        { type: 'demo', files: { 'sales.csv': LEDGER_CSV }, text: 'Run it.', code: ['import csv', 'with open("sales.csv", newline="") as f:', '    reader = csv.reader(f)', '    header = next(reader)', '    print(header)', '    for row in reader:', '        print(row)'] },
        {
          type: 'predict', files: { 'sales.csv': LEDGER_CSV }, text: 'The quoted comma. What will it say?', code: ['line = \'Ada,"oil, lamp",3,1.25\'', 'print(len(line.split(",")))', 'import csv', 'print(len(next(csv.reader([line]))))'],
          explain: 'split(",") cuts inside the quotes and gets 5 pieces; csv.reader knows better: 4.',
        },
        {
          type: 'predict', files: { 'sales.csv': LEDGER_CSV }, text: 'Strings, not numbers. What will it say?', code: ['import csv', 'with open("sales.csv", newline="") as f:', '    rows = list(csv.reader(f))[1:]', 'print(rows[0][2] + rows[1][2])', 'print(int(rows[0][2]) + int(rows[1][2]))'],
          explain: 'CSV values are text: "2" + "1" glues to "21". Convert them first.',
        },
        {
          type: 'fill', files: { 'sales.csv': LEDGER_CSV }, text: 'Skip the header row before looping.',
          lines: ['import csv', 'total = 0', 'with open("sales.csv", newline="") as f:', '    reader = csv.reader(f)', '    [](reader)', '    for row in reader:', '        total += int(row[2])', 'print(total)'], chips: ['next', 'list', 'iter'], answer: [['next']],
          hints: ['Take one row off the front.', 'next(reader)'],
        },
        {
          type: 'write', files: { 'sales.csv': LEDGER_CSV }, text: 'Print the total money taken: the sum of qty × price over all rows (skip the header).',
          starter: ['import csv'], keys: ['total', '=', '0', 'with', 'open', '(', ')', '"sales.csv"', 'newline=""', 'as', 'f', ':', 'reader', 'csv.reader', 'next', 'for', 'row', 'in', '+=', 'int', 'float', '[', ']', '2', '3', '*', 'print'],
          require: l => (has(l, /csv\.reader/) ? null : 'Use csv.reader.'),
          hints: ['total = 0 / with open("sales.csv", newline="") as f: reader = csv.reader(f); next(reader)', 'for row in reader: total += int(row[2]) * float(row[3]), then print(total)'],
          solution: ['total = 0', 'with open("sales.csv", newline="") as f:', '    reader = csv.reader(f)', '    next(reader)', '    for row in reader:', '        total += int(row[2]) * float(row[3])', 'print(total)'],
        },
      ],
      learn: [{ title: 'csv.reader', code: 'with open(path, newline="") as f:\n    reader = csv.reader(f)\n    header = next(reader)\n    for row in reader: ...', text: 'Rows are lists of strings. It handles quoted commas. Convert numbers yourself.' }],
    },
    {
      id: '33-2', title: 'Named columns', bg: 'archive', npc: 'ledgermaster', mentor: 'ledgermaster', tags: ['dictreader'],
      steps: [
        { type: 'talk', who: 'ledgermaster', text: 'csv.DictReader uses the header row as KEYS, so each row is a dict: row["price"] instead of row[3]. Much harder to get wrong.' },
        { type: 'demo', files: { 'sales.csv': LEDGER_CSV }, text: 'Run it.', code: ['import csv', 'with open("sales.csv", newline="") as f:', '    for row in csv.DictReader(f):', '        print(row["name"], "bought", row["item"])'] },
        {
          type: 'predict', files: { 'sales.csv': LEDGER_CSV }, vars: R => ({ n: R.pick(['Ada', 'Tam', 'Wren']) }),
          text: 'Filtering rows. What will it say?', code: ['import csv', 'with open("sales.csv", newline="") as f:', '    mine = [r["item"] for r in csv.DictReader(f) if r["name"] == "$n"]', 'print(mine)'],
          explain: 'Only the rows whose name column is $n.',
        },
        {
          type: 'predict', files: { 'sales.csv': LEDGER_CSV }, text: 'Totals per customer. What will it say?', code: ['import csv', 'spent = {}', 'with open("sales.csv", newline="") as f:', '    for r in csv.DictReader(f):', '        cost = int(r["qty"]) * float(r["price"])', '        spent[r["name"]] = spent.get(r["name"], 0) + cost', 'print(spent)'],
          explain: 'A dict adds up each customer\'s spending, row by row.',
        },
        {
          type: 'fill', files: { 'sales.csv': LEDGER_CSV }, text: 'Use the column NAME to read the quantity.',
          lines: ['import csv', 'with open("sales.csv", newline="") as f:', '    qtys = [int(r[[]]) for r in csv.DictReader(f)]', 'print(max(qtys))'], chips: ['"qty"', '2', 'qty'], answer: [['"qty"']],
          hints: ['Rows are dicts keyed by the header.', 'r["qty"]'],
        },
        {
          type: 'write', files: { 'sales.csv': LEDGER_CSV }, text: 'Print how many ropes were sold in total (sum the qty of rows whose item is "rope"), using DictReader.',
          starter: ['import csv'], keys: ['total', '=', '0', 'with', 'open', '(', ')', '"sales.csv"', 'newline=""', 'as', 'f', ':', 'for', 'r', 'in', 'csv.DictReader', 'if', '[', ']', '"item"', '==', '"rope"', '+=', 'int', '"qty"', 'print'],
          require: l => (has(l, /DictReader/) ? null : 'Use csv.DictReader.'),
          hints: ['for r in csv.DictReader(f): if r["item"] == "rope": total += int(r["qty"])', 'print(total) at the end'],
          solution: ['total = 0', 'with open("sales.csv", newline="") as f:', '    for r in csv.DictReader(f):', '        if r["item"] == "rope":', '            total += int(r["qty"])', 'print(total)'],
        },
      ],
      learn: [{ title: 'DictReader', code: 'for row in csv.DictReader(f):\n    row["price"]', text: 'Each row becomes a dict keyed by the header.' }],
    },
    {
      id: '33-3', title: 'Writing ledgers', bg: 'scriptorium', npc: 'ledgermaster', mentor: 'ledgermaster', tags: ['csvwrite'],
      steps: [
        { type: 'talk', who: 'ledgermaster', text: 'To write: open with "w" and newline="", then csv.writer(f).writerow([...]) writes one row, quoting anything with a comma. DictWriter writes dicts; call writeheader() first. A delimiter=";" makes semicolon files.' },
        { type: 'demo', text: 'Run it and watch the shelf.', code: ['import csv', 'with open("stock.csv", "w", newline="") as f:', '    w = csv.writer(f)', '    w.writerow(["item", "count"])', '    w.writerows([["rope", 5], ["oil, lamp", 2]])', 'print(open("stock.csv").read())'] },
        {
          type: 'predict', text: 'What does the file hold? What will it say?', code: ['import csv', 'with open("x.csv", "w", newline="") as f:', '    csv.writer(f).writerow(["Ada", "fire, ice", 7])', 'print(open("x.csv").read().strip())'],
          explain: 'The value with a comma inside gets quotes so it stays one column.',
        },
        {
          type: 'predict', text: 'Semicolons. What will it say?', code: ['import csv', 'with open("x.csv", "w", newline="") as f:', '    csv.writer(f, delimiter=";").writerow(["a", "b", "c"])', 'print(open("x.csv").read().strip())'],
          explain: 'delimiter=";" separates the columns with semicolons.',
        },
        {
          type: 'fill', text: 'Write the header row from the fieldnames first.',
          lines: ['import csv', 'with open("guests.csv", "w", newline="") as f:', '    w = csv.DictWriter(f, fieldnames=["name", "seat"])', '    w.[]()', '    w.writerow({"name": "Ada", "seat": 4})', 'print(open("guests.csv").read().strip())'], chips: ['writeheader', 'writerow', 'close'], answer: [['writeheader']],
          hints: ['DictWriter has a method just for the header.', 'w.writeheader()'],
        },
        {
          type: 'write', text: 'Write scores.csv with a header name,score and the rows for Ada (9) and Wren (7) using csv.writer, then print the file.',
          starter: ['import csv'], keys: ['with', 'open', '(', ')', '"scores.csv"', '"w"', 'newline=""', 'as', 'f', ':', 'w', '=', 'csv.writer', '.writerow', '.writerows', '[', ']', '"name"', '"score"', '"Ada"', '9', '"Wren"', '7', ',', 'print', '.read()'],
          require: l => (has(l, /csv\.writer/) ? null : 'Use csv.writer.'),
          hints: ['w = csv.writer(f) / w.writerow(["name", "score"])', 'w.writerows([["Ada", 9], ["Wren", 7]]), then print(open("scores.csv").read())'],
          solution: ['with open("scores.csv", "w", newline="") as f:', '    w = csv.writer(f)', '    w.writerow(["name", "score"])', '    w.writerows([["Ada", 9], ["Wren", 7]])', 'print(open("scores.csv").read())'],
        },
      ],
      learn: [{ title: 'Writing CSV', code: 'with open(p, "w", newline="") as f:\n    w = csv.writer(f)\n    w.writerow([...])\ncsv.DictWriter(f, fieldnames=[...])', text: 'Write rows safely; values with commas get quoted.' }],
    },
    {
      id: '33-4', title: 'Coin bats', bg: 'vault', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'coinbat', hp: d0 + 2 + 1 + 3 + 5, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Coin bats swoop through the ledgers! $HP HP. Every unit sold is a strike.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', files: { 'sales.csv': LEDGER_CSV }, text: 'It has $HP HP left. Cast fireball with the qty of every row.',
          lines: ['import csv', 'with open("sales.csv", newline="") as f:', '    for r in csv.DictReader(f):', '        cast(fireball, [](r["qty"]))'], chips: ['int', 'str', 'len'], answer: [['int']],
          goal: { foeDown: true },
          hints: ['CSV values are text; spells need numbers.', 'int(r["qty"])'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat matriarch counts the columns!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 4 }),
          files: { 'sales.csv': LEDGER_CSV },
          spawn: v => ({ kind: 'coinbat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Read the header row of sales.csv with csv.reader and cast icebolt with the number of columns, twice.',
          starter: ['import csv'], keys: ['with', 'open', '(', ')', '"sales.csv"', 'newline=""', 'as', 'f', ':', 'header', '=', 'next', 'csv.reader', 'cast', 'icebolt', ',', 'len'],
          goal: { foeDown: true },
          require: l => (has(l, /next\s*\(/) ? null : 'Take the header with next(...).'),
          hints: ['header = next(csv.reader(f))', 'cast(icebolt, len(header)) twice'],
          solution: ['with open("sales.csv", newline="") as f:', '    header = next(csv.reader(f))', 'cast(icebolt, len(header))', 'cast(icebolt, len(header))'],
        },
      ],
      learn: [{ title: 'Numbers from CSV', code: 'int(row["qty"])', text: 'Always convert before doing maths.' }],
    },
    {
      id: '33-5', title: 'Text that travels', bg: 'scriptorium', npc: 'ledgermaster', mentor: 'ledgermaster', tags: ['jsontypes'],
      steps: [
        { type: 'talk', who: 'ledgermaster', text: 'JSON is how programs send data to each other, especially over the web. json.dumps(obj) turns Python data into JSON text; json.loads(text) turns it back.' },
        { type: 'talk', who: 'ledgermaster', text: 'The spelling changes a little: None becomes null, True becomes true, tuples become lists, and JSON strings always use double quotes.' },
        { type: 'demo', text: 'Run it.', code: ['import json', 'data = {"name": "Ada", "pet": None, "ok": True, "pos": (3, 4)}', 'text = json.dumps(data)', 'print(text)', 'back = json.loads(text)', 'print(back)'] },
        {
          type: 'predict', vars: R => ({ v: R.pick(['None', 'True', 'False', '[1, (2, 3)]', '"hi"']) }),
          text: 'What will it say?', code: ['import json', 'print(json.dumps($v))'],
          explain: 'None → null, True/False → true/false, tuples → lists, strings keep double quotes.',
        },
        {
          type: 'predict', text: 'A round trip. What will it say?', code: ['import json', 'pos = (3, 4)', 'back = json.loads(json.dumps(pos))', 'print(back, back == pos)'],
          explain: 'JSON has no tuples, so it comes back as a list, which is not equal to the tuple.',
        },
        {
          type: 'predict', text: 'Pretty printing. What will it say?', code: ['import json', 'print(json.dumps({"b": 1, "a": [2]}, indent=2, sort_keys=True))'],
          explain: 'indent spreads it over lines; sort_keys orders the keys.',
        },
        {
          type: 'fill', text: 'Turn the JSON text into Python data.',
          lines: ['import json', 'text = \'{"hp": 30, "items": ["rope"]}\'', 'hero = json.[](text)', 'print(hero["hp"] + 5, hero["items"][0])'], chips: ['loads', 'dumps', 'load'], answer: [['loads']],
          hints: ['load from a String: loads.', 'json.loads(text)'],
        },
        {
          type: 'write', text: 'Turn hero into JSON text with sorted keys and print it.',
          starter: ['import json', 'hero = {"name": "Wren", "hp": 12, "alive": True}'], keys: ['print', '(', ')', 'json.dumps', 'hero', ',', 'sort_keys=True'],
          require: l => (has(l, /sort_keys\s*=\s*True/) ? null : 'Use sort_keys=True.'),
          hints: ['json.dumps(hero, sort_keys=True)', 'print(json.dumps(hero, sort_keys=True))'],
          solution: ['print(json.dumps(hero, sort_keys=True))'],
        },
      ],
      learn: [{ title: 'JSON', code: 'json.dumps(obj, indent=2, sort_keys=True)\njson.loads(text)\nNone ↔ null  True ↔ true  tuple → list', text: 'Text that any language can read.' }],
    },
    {
      id: '33-6', title: 'Nested treasure', bg: 'vault', npc: 'ledgermaster', mentor: 'ledgermaster', tags: ['jsonnest'],
      steps: [
        { type: 'talk', who: 'ledgermaster', text: 'Real JSON is NESTED: dicts holding lists holding dicts. Walk in one step at a time: data["members"] is a list, data["members"][0] is a dict, data["members"][0]["skills"] is a list again.' },
        { type: 'demo', vars: () => ({ j: QUEST_JSON }), text: 'Run it.', code: ['import json', "data = json.loads('$j')", 'print(data["guild"])', 'for m in data["members"]:', '    print(m["name"], m["level"], len(m["skills"]))'] },
        {
          type: 'predict', vars: R => ({ j: QUEST_JSON, k: R.int(0, 2) }),
          text: 'Walk in. What will it say?', code: ['import json', "data = json.loads('$j')", 'print(data["members"][$k]["name"], data["treasurer"])'],
          explain: 'Member number $k, and null came back as None.',
        },
        {
          type: 'predict', vars: () => ({ j: QUEST_JSON }),
          text: 'Collect from the inside. What will it say?', code: ['import json', "data = json.loads('$j')", 'skills = [s for m in data["members"] for s in m["skills"]]', 'print(skills)'],
          explain: 'A nested comprehension pulls every skill out of every member.',
        },
        {
          type: 'predict', vars: () => ({ j: QUEST_JSON }),
          text: 'Missing keys. What will it say?', code: ['import json', "data = json.loads('$j')", 'print(data["members"][0].get("title", "none"))'],
          explain: 'get with a default avoids a KeyError when a key may be missing.',
        },
        {
          type: 'fill', vars: () => ({ j: QUEST_JSON }), text: 'Find the highest level in the guild.',
          lines: ['import json', "data = json.loads('$j')", 'print(max(m[[]] for m in data["members"]))'], chips: ['"level"', '"name"', 'level'], answer: [['"level"']],
          hints: ['Each member dict has a level key.', 'm["level"]'],
        },
        {
          type: 'write', vars: () => ({ j: QUEST_JSON }), text: 'Print the names of members with level 5 or more, as a list.',
          starter: ['import json', "data = json.loads('$j')"], keys: ['print', '(', ')', '[', ']', 'm', 'for', 'in', 'data', '"members"', '"name"', 'if', '"level"', '>=', '5'],
          require: l => (has(l, /\["members"\]/) ? null : 'Walk through data["members"].'),
          hints: ['A comprehension with an if.', 'print([m["name"] for m in data["members"] if m["level"] >= 5])'],
          solution: ['print([m["name"] for m in data["members"] if m["level"] >= 5])'],
        },
      ],
      learn: [{ title: 'Nested data', code: 'data["members"][0]["skills"][1]\nm.get("title", "none")', text: 'Walk in one level at a time. get() handles missing keys.' }],
    },
    {
      id: '33-7', title: 'Saving the game', bg: 'archive', npc: 'ledgermaster', mentor: 'ledgermaster', tags: ['jsonfile'],
      steps: [
        { type: 'talk', who: 'ledgermaster', text: 'json.dump(obj, f) writes straight into a file and json.load(f) reads it back: that is how most games save. No s on the end means "file", with s means "string".' },
        { type: 'demo', text: 'Run it and watch the shelf.', code: ['import json', 'save = {"hero": "Ada", "level": 3, "items": ["rope"]}', 'with open("save.json", "w") as f:', '    json.dump(save, f, indent=2)', 'with open("save.json") as f:', '    loaded = json.load(f)', 'print(loaded["items"])'] },
        {
          type: 'predict', text: 'Load, change, save, load again. What will it say?', code: ['import json', 'with open("save.json", "w") as f:', '    json.dump({"gold": 10}, f)', 'with open("save.json") as f:', '    s = json.load(f)', 's["gold"] += 5', 'with open("save.json", "w") as f:', '    json.dump(s, f)', 'print(open("save.json").read())'],
          explain: 'The file now holds the updated JSON text.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Bad JSON. Which error?', code: ['import json', "json.loads(\"{'gold': 10}\")"],
          explain: 'JSON needs double quotes. This raises json.JSONDecodeError (a kind of ValueError).',
        },
        {
          type: 'fill', text: 'Read the save file back.',
          lines: ['import json', 'with open("s.json", "w") as f:', '    json.dump([1, 2, 3], f)', 'with open("s.json") as f:', '    nums = json.[](f)', 'print(sum(nums))'], chips: ['load', 'loads', 'dump'], answer: [['load']],
          hints: ['Reading from a FILE.', 'json.load(f)'],
        },
        {
          type: 'write', text: 'Save {"hp": 20, "potions": 2} to hero.json with json.dump, load it back with json.load, and print hp + potions.',
          starter: ['import json'], keys: ['with', 'open', '(', ')', '"hero.json"', '"w"', 'as', 'f', ':', 'json.dump', 'json.load', '{"hp": 20, "potions": 2}', ',', 'data', '=', 'print', '[', ']', '"hp"', '"potions"', '+'],
          require: l => (has(l, /json\.dump\s*\(/) && has(l, /json\.load\s*\(/) ? null : 'Use json.dump and json.load with files.'),
          hints: ['with open("hero.json", "w") as f: json.dump({"hp": 20, "potions": 2}, f)', 'with open("hero.json") as f: data = json.load(f), then print(data["hp"] + data["potions"])'],
          solution: ['with open("hero.json", "w") as f:', '    json.dump({"hp": 20, "potions": 2}, f)', 'with open("hero.json") as f:', '    data = json.load(f)', 'print(data["hp"] + data["potions"])'],
        },
      ],
      learn: [{ title: 'Saving with JSON', code: 'json.dump(obj, f)   json.load(f)\njson.dumps(obj)     json.loads(text)', text: 'With s: strings. Without: files. Bad JSON raises JSONDecodeError.' }],
    },
    {
      id: '33-8', title: 'Tally imps', bg: 'vault', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'tallyimp', hp: d0 + 7 + 4 + 9, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Tally imps scribble over the records! $HP HP. Every member\'s level is a strike.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', vars: () => ({ j: QUEST_JSON }), text: 'It has $HP HP left. Cast fireball with the level of every member.',
          lines: ['import json', "data = json.loads('$j')", 'for m in data[[]]:', '    cast(fireball, m["level"])'], chips: ['"members"', '"guild"', 'members'], answer: [['"members"']],
          goal: { foeDown: true },
          hints: ['The members list is under its key.', 'data["members"]'],
        },
        { type: 'talk', who: 'narrator', text: 'The imp king hides inside a saved game!' },
        {
          type: 'write', vars: R => { const p = R.int(6, 12); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'tallyimp', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Save {"power": $p} to boss.json, load it back, and cast icebolt with its power, twice.',
          starter: ['import json'], keys: ['with', 'open', '(', ')', '"boss.json"', '"w"', 'as', 'f', ':', 'json.dump', 'json.load', '{"power": $p}', ',', 'data', '=', 'cast', 'icebolt', '[', ']', '"power"'],
          goal: { foeDown: true },
          require: l => (has(l, /json\.load\s*\(/) ? null : 'Load it back with json.load.'),
          hints: ['json.dump({"power": $p}, f) inside a with', 'data = json.load(f), then cast(icebolt, data["power"]) twice'],
          solution: ['with open("boss.json", "w") as f:', '    json.dump({"power": $p}, f)', 'with open("boss.json") as f:', '    data = json.load(f)', 'cast(icebolt, data["power"])', 'cast(icebolt, data["power"])'],
        },
      ],
      learn: [{ title: 'Data in battle', code: 'for m in data["members"]: ...', text: 'Walk the data, use the numbers.' }],
    },
    {
      id: '33-9', title: 'The Hoard Dragon', bg: 'vault', foe: { kind: 'hoarddragon', hp: 190, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'hoarddragon', text: 'EVERY... COIN... IS... RECORDED... IN... MY... LEDGER...' },
        { type: 'talk', who: 'narrator', text: 'The Hoard Dragon has 190 HP. Icebolt freezes its gold: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', files: { 'sales.csv': LEDGER_CSV }, text: 'How much damage? Icebolt is doubled.', code: ['import csv', 'with open("sales.csv", newline="") as f:', '    rows = list(csv.DictReader(f))', 'cast(icebolt, len(rows))'],
          explain: 'Four rows after the header, doubled.',
        },
        {
          type: 'fix', text: 'This should total the qty column. Run it, then tap the broken line.',
          code: ['import csv', 'total = 0', 'for row in csv.reader(["item,qty", "rope,2", "lamp,5"]):', '    total += int(row[1])', 'print(total)', 'cast(icebolt, total)'], bad: 2,
          options: ['for row in list(csv.reader(["item,qty", "rope,2", "lamp,5"]))[1:]:', 'for row in csv.reader(["rope,2", "item,qty", "lamp,5"]):', 'for row in csv.reader("item,qty,rope,2,lamp,5"):'], answer: 0,
          explain: 'The header row "qty" cannot become an int: skip the header.',
        },
        { type: 'talk', who: 'hoarddragon', text: 'READ... MY... HOARD...' },
        {
          type: 'fill', text: 'Load the hoard and strike with icebolt, the sum of all the gold.',
          lines: ['import json', "hoard = json.loads('{\"chests\": [{\"gold\": 5}, {\"gold\": 7}]}')", 'cast(icebolt, sum(c["gold"] for c in hoard[[]]))'], chips: ['"chests"', '"gold"', 'chests'], answer: [['"chests"']],
          hints: ['The list of chests is under its key.', 'hoard["chests"]'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Write a CSV file final.csv with the header power and one row holding $HP // 2 + 1, read it back with DictReader, and cast icebolt with int(row["power"]).',
          starter: ['import csv'], keys: ['with', 'open', '(', ')', '"final.csv"', '"w"', 'newline=""', 'as', 'f', ':', 'w', '=', 'csv.writer', '.writerow', '[', ']', '"power"', '$HP', '//', '2', '+', '1', 'for', 'row', 'in', 'csv.DictReader', 'cast', 'icebolt', 'int', ','],
          goal: { foeDown: true },
          require: l => (has(l, /DictReader/) && has(l, /csv\.writer/) ? null : 'Write with csv.writer and read back with DictReader.'),
          hints: ['w = csv.writer(f) / w.writerow(["power"]) / w.writerow([$HP // 2 + 1])', 'with open("final.csv", newline="") as f: for row in csv.DictReader(f): cast(icebolt, int(row["power"]))'],
          solution: ['with open("final.csv", "w", newline="") as f:', '    w = csv.writer(f)', '    w.writerow(["power"])', '    w.writerow([$HP // 2 + 1])', 'with open("final.csv", newline="") as f:', '    for row in csv.DictReader(f):', '        cast(icebolt, int(row["power"]))'],
        },
        { type: 'talk', who: 'hoarddragon', text: '...the... books... are... balanced...' },
      ],
      learn: [{ title: 'Ledger toolkit', code: 'csv.reader  DictReader  writer  DictWriter  json.dumps/loads/dump/load', text: 'Everything from the Ledger Hall.' }],
    },
  ],
};
WORLDS.push(WORLD33);

(() => {
  const { makeQ, pick } = Arena;
  Object.assign(Arena.GEN, {
    csvread: () => makeQ(['import csv', 'row = next(csv.reader([\'a,"b, c",d\']))', 'print(len(row))'], [4, 3 + 1 === 4 ? 2 : 2]),
    dictreader: () => makeQ(['import csv', 'rows = list(csv.DictReader(["n,q", "x,2", "y,3"]))', 'print(rows[1]["q"])'], [2, 'q']),
    csvwrite: () => makeQ(['import csv', 'with open("o.csv", "w", newline="") as f:', '    csv.writer(f).writerow(["a b", "c,d"])', 'print(open("o.csv").read().strip())'], ['a b,c,d', '"a b","c,d"']),
    jsontypes: () => { const v = pick(['None', 'True', '(1, 2)']); return makeQ(['import json', `print(json.dumps(${v}))`], [v, `"${v}"`]); },
    jsonnest: () => makeQ(['import json', 'd = json.loads(\'{"a": [{"b": 5}, {"b": 6}]}\')', 'print(d["a"][1]["b"])'], [5, 'b']),
    jsonfile: () => makeQ(['import json', 'with open("j.json", "w") as f:', '    json.dump({"x": [1, 2]}, f)', 'print(json.load(open("j.json"))["x"][-1])'], [1, '[1, 2]']),
  });
})();
