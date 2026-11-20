/* World 35: The Vault of Records. Databases with sqlite3: tables, rows and columns,
   CREATE/INSERT/SELECT, WHERE/ORDER BY/LIMIT, ? placeholders (and why f-strings are
   dangerous), executemany, UPDATE/DELETE and rowcount, aggregates and GROUP BY, primary
   keys, lastrowid, UNIQUE and INSERT OR IGNORE. Source: Python for Everybody, chapter 15. */
Object.assign(EXTRA.npcs, {
  quaero: { name: 'Keeper Quaero', colors: ['#2f4f8f', '#a9a7b8', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  rowmimic: { base: 'mimic', name: 'Row mimic', pal: { B: '#3f5a8a', Y: '#a9c8d8' } },
  nullwisp: { base: 'ghost', name: 'Null wisp', pal: { F: '#6a6a7a', L: '#c8c8d0' } },
  querykraken: { base: 'kraken', name: 'The Query Kraken', pal: { P: '#2f4f8f', W: '#5fd3ff' } },
});
const HEROES_SETUP = ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE heroes (name TEXT, cls TEXT, level INTEGER, gold INTEGER)")', 'db.executemany("INSERT INTO heroes VALUES (?, ?, ?, ?)", [("Ada", "mage", 7, 120), ("Wren", "ranger", 4, 35), ("Tam", "knight", 9, 80), ("Mira", "mage", 5, 60), ("Kip", "ranger", 2, 15)])'];

const WORLD35 = {
  id: 35, name: 'The Vault of Records', topic: 'databases and SQL',
  nodes: [[50, 92], [28, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [40, 21], [52, 8]],
  levels: [
    {
      id: '35-1', title: 'Tables of records', bg: 'vault', npc: 'quaero', mentor: 'quaero', tags: ['sqlbasics'],
      steps: [
        { type: 'talk', who: 'quaero', text: "Welcome to the Vault, {NAME}. I'm Quaero. A DATABASE keeps records in TABLES: each row is one record, each column one kind of fact. You talk to it in its own little language, SQL, and Python's sqlite3 module carries your words in." },
        { type: 'talk', who: 'quaero', text: 'sqlite3.connect(":memory:") opens a database (":memory:" keeps it in memory; a file name saves it to disk). db.execute("SQL...") runs one SQL command. CREATE TABLE makes a table, INSERT INTO adds rows, SELECT reads them back as tuples.' },
        { type: 'demo', text: 'Run it.', code: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE potions (name TEXT, price INTEGER)")', 'db.execute("INSERT INTO potions VALUES (\'heal\', 30)")', 'db.execute("INSERT INTO potions VALUES (\'mana\', 45)")', 'for row in db.execute("SELECT * FROM potions"):', '    print(row)'] },
        {
          type: 'predict', text: 'What will it say?', code: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE gems (kind TEXT, carats INTEGER)")', 'db.execute("INSERT INTO gems VALUES (\'ruby\', 3)")', 'db.execute("INSERT INTO gems VALUES (\'opal\', 7)")', 'print(db.execute("SELECT kind FROM gems").fetchall())'],
          explain: 'fetchall gives a list of rows; each row is a tuple, even with one column.',
        },
        {
          type: 'predict', text: 'One row at a time. What will it say?', code: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE t (n INTEGER)")', 'db.execute("INSERT INTO t VALUES (5)")', 'cur = db.execute("SELECT n FROM t")', 'print(cur.fetchone(), cur.fetchone())'],
          explain: 'fetchone gives the next row, or None when there are no more.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Which error?', code: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("SELECT * FROM dragons")'],
          explain: 'There is no dragons table: sqlite3.OperationalError (no such table).',
        },
        {
          type: 'fill', text: 'Make the table before putting rows in it.',
          lines: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("[] TABLE scrolls (title TEXT)")', 'db.execute("INSERT INTO scrolls VALUES (\'Runes\')")', 'print(db.execute("SELECT * FROM scrolls").fetchall())'], chips: ['CREATE', 'SELECT', 'INSERT'], answer: [['CREATE']],
          hints: ['SQL makes tables with CREATE TABLE.', 'CREATE TABLE scrolls (title TEXT)'],
        },
        {
          type: 'write', text: 'Create a table pets (name TEXT, age INTEGER), insert Pip aged 3 and Moss aged 5, then print all rows with fetchall.',
          starter: ['import sqlite3', 'db = sqlite3.connect(":memory:")'], keys: ['db.execute', '(', ')', '"CREATE TABLE pets (name TEXT, age INTEGER)"', '"INSERT INTO pets VALUES (\'Pip\', 3)"', '"INSERT INTO pets VALUES (\'Moss\', 5)"', 'print', '"SELECT * FROM pets"', '.fetchall()'],
          require: l => (has(l, /CREATE TABLE/i) && has(l, /INSERT INTO/i) ? null : 'Use CREATE TABLE and INSERT INTO.'),
          hints: ['db.execute("CREATE TABLE pets (name TEXT, age INTEGER)")', 'Two INSERTs, then print(db.execute("SELECT * FROM pets").fetchall())'],
          solution: ['db.execute("CREATE TABLE pets (name TEXT, age INTEGER)")', 'db.execute("INSERT INTO pets VALUES (\'Pip\', 3)")', 'db.execute("INSERT INTO pets VALUES (\'Moss\', 5)")', 'print(db.execute("SELECT * FROM pets").fetchall())'],
        },
      ],
      learn: [{ title: 'Databases', code: 'db = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE t (a TEXT, b INTEGER)")\ndb.execute("INSERT INTO t VALUES (\'x\', 1)")\ndb.execute("SELECT * FROM t").fetchall()', text: 'Tables of rows and columns, spoken to in SQL. Rows come back as tuples.' }],
    },
    {
      id: '35-2', title: 'Asking questions', bg: 'vault', npc: 'quaero', mentor: 'quaero', tags: ['sqlwhere'],
      steps: [
        { type: 'talk', who: 'quaero', text: 'SELECT name, level FROM heroes picks columns. WHERE level > 4 picks rows; combine tests with AND and OR. ORDER BY gold DESC sorts. LIMIT 2 keeps only the first rows. SQL uses a single = to compare.' },
        { type: 'demo', text: 'Run it.', code: [...HEROES_SETUP, 'for row in db.execute("SELECT name, level FROM heroes WHERE level > 4 ORDER BY level DESC"):', '    print(row)'] },
        {
          type: 'predict', vars: R => ({ c: R.pick(['mage', 'ranger']) }), text: 'What will it say?', code: [...HEROES_SETUP, 'print(db.execute("SELECT name FROM heroes WHERE cls = \'$c\' ORDER BY name").fetchall())'],
          explain: 'Only rows whose cls is $c, sorted by name.',
        },
        {
          type: 'predict', text: 'Two tests at once. What will it say?', code: [...HEROES_SETUP, 'print(db.execute("SELECT name FROM heroes WHERE level >= 5 AND gold < 100").fetchall())'],
          explain: 'Both conditions must be true.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(1, 3) }), text: 'The richest few. What will it say?', code: [...HEROES_SETUP, 'print(db.execute("SELECT name, gold FROM heroes ORDER BY gold DESC LIMIT $n").fetchall())'],
          explain: 'Sort from most gold to least, then keep $n rows.',
        },
        {
          type: 'fill', text: 'List the heroes from lowest level to highest.',
          lines: [...HEROES_SETUP, 'print(db.execute("SELECT name FROM heroes [] BY level").fetchall())'], chips: ['ORDER', 'GROUP', 'SORT'], answer: [['ORDER']],
          hints: ['SQL sorts with ORDER BY.', 'ORDER BY level'],
        },
        {
          type: 'write', text: 'Print the names of rangers OR heroes with more than 100 gold, sorted by name.',
          starter: HEROES_SETUP, keys: ['print', '(', ')', 'db.execute', '"SELECT name FROM heroes WHERE cls = \'ranger\' OR gold > 100 ORDER BY name"', '.fetchall()'],
          require: l => (has(l, /\bOR\b/i) && has(l, /ORDER BY/i) ? null : 'Use OR and ORDER BY name.'),
          hints: ['WHERE cls = \'ranger\' OR gold > 100', 'print(db.execute("SELECT name FROM heroes WHERE cls = \'ranger\' OR gold > 100 ORDER BY name").fetchall())'],
          solution: ['print(db.execute("SELECT name FROM heroes WHERE cls = \'ranger\' OR gold > 100 ORDER BY name").fetchall())'],
        },
      ],
      learn: [{ title: 'SELECT', code: 'SELECT a, b FROM t\nWHERE x > 4 AND y = \'z\'\nORDER BY x DESC\nLIMIT 3', text: 'Pick columns, filter rows, sort, and limit.' }],
    },
    {
      id: '35-3', title: 'Safe placeholders', bg: 'vault', npc: 'quaero', mentor: 'quaero', tags: ['sqlparams'],
      steps: [
        { type: 'talk', who: 'quaero', text: 'NEVER build SQL by gluing in values with f-strings: a sneaky value like "x\'; DROP TABLE heroes" could rewrite your command. That attack is called SQL injection. Instead put ? where values go, and pass the values separately as a tuple.' },
        { type: 'demo', text: 'Run it.', code: [...HEROES_SETUP, 'name = "Tam"', 'row = db.execute("SELECT level, gold FROM heroes WHERE name = ?", (name,)).fetchone()', 'print(row)'] },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 8) }), text: 'What will it say?', code: [...HEROES_SETUP, 'cur = db.execute("SELECT name FROM heroes WHERE level > ? AND gold > ?", ($n, 20))', 'print(cur.fetchall())'],
          explain: 'Each ? is filled, in order, from the tuple.',
        },
        { type: 'talk', who: 'quaero', text: 'The classic trap: one value still needs a TUPLE, with a comma: (name,). Passing just "Ada" makes Python treat the string as three separate letters!' },
        {
          type: 'predict', measure: 'errtype', text: 'Which error?', code: [...HEROES_SETUP, 'db.execute("SELECT * FROM heroes WHERE name = ?", "Ada")'],
          explain: 'One ? but three values (A, d, a): sqlite3.ProgrammingError. Write ("Ada",).',
        },
        {
          type: 'predict', text: 'Many rows at once. What will it say?', code: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE loot (item TEXT, n INTEGER)")', 'db.executemany("INSERT INTO loot VALUES (?, ?)", [("rope", 2), ("lamp", 1), ("gem", 5)])', 'print(db.execute("SELECT SUM(n) FROM loot").fetchone())'],
          explain: 'executemany runs the INSERT once for each tuple in the list.',
        },
        {
          type: 'fill', text: 'Pass the single value as a proper tuple.',
          lines: [...HEROES_SETUP, 'print(db.execute("SELECT gold FROM heroes WHERE name = ?", ("Wren"[])).fetchone())'], chips: [',', ')', ';'], answer: [[',']],
          hints: ['A one-item tuple needs a trailing comma.', '("Wren",)'],
        },
        {
          type: 'fix', text: 'A sneaky visitor typed this "name". With the f-string it changes the question and leaks a hero who is not called that at all! Run it, then tap the line to make safe.',
          code: [...HEROES_SETUP, 'name = "x\' OR \'1\'=\'1"', 'print(db.execute(f"SELECT level FROM heroes WHERE name = \'{name}\'").fetchone())'], bad: 5,
          options: ['print(db.execute("SELECT level FROM heroes WHERE name = ?", (name,)).fetchone())', 'print(db.execute("SELECT level FROM heroes WHERE name = name").fetchone())', 'print(db.execute("SELECT level FROM heroes WHERE name = ?", name).fetchone())'], answer: 0,
          explain: 'With a ? placeholder the whole text is just a name to look for, so nothing matches: None. That is SQL injection, stopped.',
        },
        {
          type: 'write', text: 'Insert three new heroes with ONE executemany call: ("Bo", "mage", 3, 10), ("Lin", "knight", 6, 50), ("Oz", "ranger", 8, 90). Then print how many heroes there are now.',
          starter: HEROES_SETUP, keys: ['db.executemany', '(', ')', '"INSERT INTO heroes VALUES (?, ?, ?, ?)"', '[', ']', '("Bo", "mage", 3, 10)', '("Lin", "knight", 6, 50)', '("Oz", "ranger", 8, 90)', ',', 'print', 'db.execute', '"SELECT COUNT(*) FROM heroes"', '.fetchone()', '[0]'],
          require: l => (has(l, /executemany/) && has(l, /\?/) ? null : 'Use executemany with ? placeholders.'),
          hints: ['db.executemany("INSERT INTO heroes VALUES (?, ?, ?, ?)", [...three tuples...])', 'print(db.execute("SELECT COUNT(*) FROM heroes").fetchone()[0])'],
          solution: ['db.executemany("INSERT INTO heroes VALUES (?, ?, ?, ?)", [("Bo", "mage", 3, 10), ("Lin", "knight", 6, 50), ("Oz", "ranger", 8, 90)])', 'print(db.execute("SELECT COUNT(*) FROM heroes").fetchone()[0])'],
        },
      ],
      learn: [{ title: 'Placeholders', code: 'db.execute("... WHERE name = ?", (name,))\ndb.executemany("INSERT ... VALUES (?, ?)", rows)', text: 'Always pass values separately. One value still needs a tuple: (name,).' }],
    },
    {
      id: '35-4', title: 'Row mimics', bg: 'vault', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'rowmimic', hp: d0 + 7 + 9 + 5, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Row mimics pretend to be records! $HP HP. Every hero of level 5 or more strikes with their level.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Select the levels of heroes with level >= 5 and cast fireball with each.',
          lines: [...HEROES_SETUP, 'for (level,) in db.execute("SELECT level FROM heroes [] level >= 5"):', '    cast(fireball, level)'], chips: ['WHERE', 'ORDER BY', 'LIMIT'], answer: [['WHERE']],
          goal: { foeDown: true },
          hints: ['Filter the rows.', 'WHERE level >= 5'],
        },
        { type: 'talk', who: 'narrator', text: 'The mimic queen is as strong as the poorest hero\'s gold!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 15 }),
          spawn: v => ({ kind: 'rowmimic', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Select the gold of the poorest hero (ORDER BY gold LIMIT 1) and cast icebolt with it, twice.',
          starter: HEROES_SETUP, keys: ['gold', '=', 'db.execute', '(', ')', '"SELECT gold FROM heroes ORDER BY gold LIMIT 1"', '.fetchone()', '[0]', 'cast', 'icebolt', ','],
          goal: { foeDown: true },
          require: l => (has(l, /LIMIT\s+1/i) ? null : 'Use ORDER BY gold LIMIT 1.'),
          hints: ['gold = db.execute("SELECT gold FROM heroes ORDER BY gold LIMIT 1").fetchone()[0]', 'cast(icebolt, gold) twice'],
          solution: ['gold = db.execute("SELECT gold FROM heroes ORDER BY gold LIMIT 1").fetchone()[0]', 'cast(icebolt, gold)', 'cast(icebolt, gold)'],
        },
      ],
      learn: [{ title: 'Unpacking rows', code: 'for (level,) in db.execute("SELECT level ..."):', text: 'One-column rows are one-item tuples; unpack them.' }],
    },
    {
      id: '35-5', title: 'Changing records', bg: 'vault', npc: 'quaero', mentor: 'quaero', tags: ['sqlupdate'],
      steps: [
        { type: 'talk', who: 'quaero', text: 'UPDATE heroes SET gold = gold + 10 WHERE name = ? changes rows. DELETE FROM heroes WHERE ... removes them. Forget the WHERE and EVERY row changes! cursor.rowcount says how many rows were touched, and db.commit() saves the changes for good.' },
        { type: 'demo', text: 'Run it.', code: [...HEROES_SETUP, 'cur = db.execute("UPDATE heroes SET gold = gold + 10 WHERE cls = ?", ("mage",))', 'print(cur.rowcount, "rows changed")', 'db.commit()', 'print(db.execute("SELECT name, gold FROM heroes WHERE cls = \'mage\'").fetchall())'] },
        {
          type: 'predict', text: 'What will it say?', code: [...HEROES_SETUP, 'cur = db.execute("DELETE FROM heroes WHERE level < 5")', 'print(cur.rowcount, db.execute("SELECT COUNT(*) FROM heroes").fetchone()[0])'],
          explain: 'Wren and Kip are below level 5, so 2 rows go and 3 remain.',
        },
        {
          type: 'predict', text: 'A missing WHERE. What will it say?', code: [...HEROES_SETUP, 'db.execute("UPDATE heroes SET level = 1")', 'print(db.execute("SELECT DISTINCT level FROM heroes").fetchall())'],
          explain: 'With no WHERE, every hero is now level 1.',
        },
        {
          type: 'fill', text: 'Raise only Wren\'s level by 1.',
          lines: [...HEROES_SETUP, 'db.execute("UPDATE heroes SET level = level + 1 [] name = ?", ("Wren",))', 'print(db.execute("SELECT level FROM heroes WHERE name = \'Wren\'").fetchone())'], chips: ['WHERE', 'AND', 'SET'], answer: [['WHERE']],
          hints: ['Choose which rows to change.', 'WHERE name = ?'],
        },
        {
          type: 'write', text: 'Delete every knight, then give each remaining ranger 5 more gold, and print the total gold of all heroes.',
          starter: HEROES_SETUP, keys: ['db.execute', '(', ')', '"DELETE FROM heroes WHERE cls = \'knight\'"', '"UPDATE heroes SET gold = gold + 5 WHERE cls = \'ranger\'"', 'print', '"SELECT SUM(gold) FROM heroes"', '.fetchone()', '[0]'],
          require: l => (has(l, /DELETE FROM/i) && has(l, /UPDATE/i) ? null : 'Use DELETE FROM and UPDATE.'),
          hints: ['db.execute("DELETE FROM heroes WHERE cls = \'knight\'")', 'db.execute("UPDATE heroes SET gold = gold + 5 WHERE cls = \'ranger\'"), then print the SUM'],
          solution: ['db.execute("DELETE FROM heroes WHERE cls = \'knight\'")', 'db.execute("UPDATE heroes SET gold = gold + 5 WHERE cls = \'ranger\'")', 'print(db.execute("SELECT SUM(gold) FROM heroes").fetchone()[0])'],
        },
      ],
      learn: [{ title: 'Changing data', code: 'UPDATE t SET a = a + 1 WHERE b = ?\nDELETE FROM t WHERE c < 5\ncur.rowcount   db.commit()', text: 'Always include a WHERE unless you really mean every row.' }],
    },
    {
      id: '35-6', title: 'Counting the vault', bg: 'archive', npc: 'quaero', mentor: 'quaero', tags: ['sqlagg'],
      steps: [
        { type: 'talk', who: 'quaero', text: 'SQL can do the maths for you. COUNT(*) counts rows, SUM, AVG, MIN and MAX work on a column. GROUP BY cls makes one result row per class, so you can count or total each group.' },
        { type: 'demo', text: 'Run it.', code: [...HEROES_SETUP, 'print(db.execute("SELECT COUNT(*), SUM(gold), MAX(level) FROM heroes").fetchone())', 'for row in db.execute("SELECT cls, COUNT(*), AVG(level) FROM heroes GROUP BY cls ORDER BY cls"):', '    print(row)'] },
        {
          type: 'predict', text: 'What will it say?', code: [...HEROES_SETUP, 'print(db.execute("SELECT MIN(gold), AVG(gold) FROM heroes").fetchone())'],
          explain: 'The smallest gold, and the average over all five heroes.',
        },
        {
          type: 'predict', text: 'Groups. What will it say?', code: [...HEROES_SETUP, 'print(db.execute("SELECT cls, SUM(gold) FROM heroes GROUP BY cls ORDER BY SUM(gold) DESC").fetchall())'],
          explain: 'One row per class, with that class\'s total gold, richest class first.',
        },
        {
          type: 'predict', text: 'Filtering groups with HAVING. What will it say?', code: [...HEROES_SETUP, 'print(db.execute("SELECT cls FROM heroes GROUP BY cls HAVING COUNT(*) > 1 ORDER BY cls").fetchall())'],
          explain: 'HAVING filters whole groups after they are counted; WHERE filters single rows before.',
        },
        {
          type: 'fill', text: 'Count the heroes in each class.',
          lines: [...HEROES_SETUP, 'print(db.execute("SELECT cls, COUNT(*) FROM heroes [] BY cls ORDER BY cls").fetchall())'], chips: ['GROUP', 'ORDER', 'COUNT'], answer: [['GROUP']],
          hints: ['One row per class.', 'GROUP BY cls'],
        },
        {
          type: 'write', text: 'Print each class with its highest level, ordered by class name.',
          starter: HEROES_SETUP, keys: ['for', 'row', 'in', 'db.execute', '(', ')', '"SELECT cls, MAX(level) FROM heroes GROUP BY cls ORDER BY cls"', ':', 'print'],
          require: l => (has(l, /GROUP BY/i) && has(l, /MAX\s*\(/i) ? null : 'Use MAX(level) with GROUP BY cls.'),
          hints: ['SELECT cls, MAX(level) FROM heroes GROUP BY cls ORDER BY cls', 'Loop over the rows and print each.'],
          solution: ['for row in db.execute("SELECT cls, MAX(level) FROM heroes GROUP BY cls ORDER BY cls"):', '    print(row)'],
        },
      ],
      learn: [{ title: 'Aggregates', code: 'SELECT COUNT(*), SUM(x), AVG(x), MIN(x), MAX(x)\nSELECT g, COUNT(*) FROM t GROUP BY g HAVING COUNT(*) > 1', text: 'Let the database count and total, per group if you like.' }],
    },
    {
      id: '35-7', title: 'Keys of the vault', bg: 'vault', npc: 'quaero', mentor: 'quaero', tags: ['sqlkeys'],
      steps: [
        { type: 'talk', who: 'quaero', text: 'Every record deserves a unique id. id INTEGER PRIMARY KEY fills itself in: 1, 2, 3... and cursor.lastrowid tells you the id just given. UNIQUE stops duplicates: inserting the same value twice raises IntegrityError.' },
        { type: 'talk', who: 'quaero', text: 'Python for Everybody\'s favourite pattern: INSERT OR IGNORE quietly skips duplicates, then SELECT the id to find the row either way.' },
        { type: 'demo', text: 'Run it.', code: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE Artist (id INTEGER PRIMARY KEY, name TEXT UNIQUE)")', 'for name in ["AC/DC", "Queen", "AC/DC"]:', '    db.execute("INSERT OR IGNORE INTO Artist (name) VALUES (?)", (name,))', '    artist_id = db.execute("SELECT id FROM Artist WHERE name = ?", (name,)).fetchone()[0]', '    print(name, artist_id)'] },
        {
          type: 'predict', text: 'What will it say?', code: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE Item (id INTEGER PRIMARY KEY, name TEXT)")', 'cur = db.execute("INSERT INTO Item (name) VALUES (?)", ("rope",))', 'cur = db.execute("INSERT INTO Item (name) VALUES (?)", ("lamp",))', 'print(cur.lastrowid, db.execute("SELECT * FROM Item").fetchall())'],
          explain: 'The id column numbers the rows by itself; lastrowid is the newest id.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'A duplicate. Which error?', code: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE Tag (name TEXT UNIQUE)")', 'db.execute("INSERT INTO Tag VALUES (\'fire\')")', 'db.execute("INSERT INTO Tag VALUES (\'fire\')")'],
          explain: 'The second "fire" breaks the UNIQUE rule: sqlite3.IntegrityError.',
        },
        {
          type: 'fill', text: 'Skip duplicates quietly.',
          lines: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE Tag (name TEXT UNIQUE)")', 'for t in ["fire", "ice", "fire"]:', '    db.execute("INSERT OR [] INTO Tag VALUES (?)", (t,))', 'print(db.execute("SELECT COUNT(*) FROM Tag").fetchone()[0])'], chips: ['IGNORE', 'REPLACE', 'UNIQUE'], answer: [['IGNORE']],
          require: s => (s[0] === 'IGNORE' ? null : 'IGNORE keeps the first row and skips the duplicate.'),
          hints: ['Ignore the duplicate.', 'INSERT OR IGNORE'],
        },
        {
          type: 'write', text: 'Write get_id(name) that inserts the name into Genre if new (OR IGNORE), then RETURNS its id. Print get_id("Rock"), get_id("Jazz"), get_id("Rock").',
          starter: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE Genre (id INTEGER PRIMARY KEY, name TEXT UNIQUE)")'], keys: ['def', 'get_id', '(', ')', 'name', ':', 'db.execute', '"INSERT OR IGNORE INTO Genre (name) VALUES (?)"', '"SELECT id FROM Genre WHERE name = ?"', '(name,)', ',', 'return', '.fetchone()', '[0]', 'print', '"Rock"', '"Jazz"'],
          require: l => (has(l, /INSERT OR IGNORE/i) && has(l, /SELECT id/i) ? null : 'Insert with OR IGNORE, then SELECT the id.'),
          hints: ['db.execute("INSERT OR IGNORE INTO Genre (name) VALUES (?)", (name,))', 'return db.execute("SELECT id FROM Genre WHERE name = ?", (name,)).fetchone()[0]'],
          solution: ['def get_id(name):', '    db.execute("INSERT OR IGNORE INTO Genre (name) VALUES (?)", (name,))', '    return db.execute("SELECT id FROM Genre WHERE name = ?", (name,)).fetchone()[0]', 'print(get_id("Rock"), get_id("Jazz"), get_id("Rock"))'],
        },
      ],
      learn: [{ title: 'Keys', code: 'id INTEGER PRIMARY KEY\nname TEXT UNIQUE\nINSERT OR IGNORE ...\ncur.lastrowid', text: 'Unique ids for every row, and no duplicates where they do not belong.' }],
    },
    {
      id: '35-8', title: 'Null wisps', bg: 'archive', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'nullwisp', hp: d0 + 4 * 5, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Null wisps drift through the vault! $HP HP. Count the heroes and strike with them.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Cast fireball with 4 for every hero in the table.',
          lines: [...HEROES_SETUP, 'n = db.execute("SELECT [](*) FROM heroes").fetchone()[0]', 'for i in range(n):', '    cast(fireball, 4)'], chips: ['COUNT', 'SUM', 'MAX'], answer: [['COUNT']],
          goal: { foeDown: true },
          hints: ['Count the rows.', 'COUNT(*)'],
        },
        { type: 'talk', who: 'narrator', text: 'The elder wisp hides behind an empty value. In SQL, a missing value is NULL, and IS NULL finds it.' },
        {
          type: 'write', vars: R => ({ hp: 2 * 6 }),
          spawn: v => ({ kind: 'nullwisp', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Insert ("ghost", NULL) and ("moth", 6) into wisps, then select the power from the row where power IS NOT NULL, and cast icebolt with it twice.',
          starter: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE wisps (name TEXT, power INTEGER)")'], keys: ['db.execute', '(', ')', '"INSERT INTO wisps VALUES (\'ghost\', NULL)"', '"INSERT INTO wisps VALUES (\'moth\', 6)"', 'p', '=', '"SELECT power FROM wisps WHERE power IS NOT NULL"', '.fetchone()', '[0]', 'cast', 'icebolt', ','],
          goal: { foeDown: true },
          require: l => (has(l, /IS NOT NULL/i) ? null : 'Filter with IS NOT NULL.'),
          hints: ['Two INSERTs, then p = db.execute("SELECT power FROM wisps WHERE power IS NOT NULL").fetchone()[0]', 'cast(icebolt, p) twice'],
          solution: ['db.execute("INSERT INTO wisps VALUES (\'ghost\', NULL)")', 'db.execute("INSERT INTO wisps VALUES (\'moth\', 6)")', 'p = db.execute("SELECT power FROM wisps WHERE power IS NOT NULL").fetchone()[0]', 'cast(icebolt, p)', 'cast(icebolt, p)'],
        },
      ],
      learn: [{ title: 'NULL', code: 'WHERE x IS NULL\nWHERE x IS NOT NULL', text: 'Missing values are NULL in SQL and None in Python. Test them with IS, not =.' }],
    },
    {
      id: '35-9', title: 'The Query Kraken', bg: 'harbor', foe: { kind: 'querykraken', hp: 190, weak: 'fireball', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'querykraken', text: 'SELECT... * ... FROM... YOUR... NIGHTMARES...' },
        { type: 'talk', who: 'narrator', text: 'The Query Kraken has 190 HP. Fireball boils its ink: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Fireball is doubled.', code: [...HEROES_SETUP, 'cast(fireball, db.execute("SELECT MAX(level) FROM heroes").fetchone()[0])'],
          explain: 'The highest level is 9, doubled.',
        },
        {
          type: 'fix', text: 'This should look Ada up safely. Run it, then tap the broken line.',
          code: [...HEROES_SETUP, 'row = db.execute("SELECT level FROM heroes WHERE name = ?", "Ada").fetchone()', 'print(row)', 'cast(fireball, row[0])'], bad: 4,
          options: ['row = db.execute("SELECT level FROM heroes WHERE name = ?", ("Ada",)).fetchone()', 'row = db.execute("SELECT level FROM heroes WHERE name = Ada").fetchone()', 'row = db.execute("SELECT level FROM heroes WHERE name = ?", ["A", "d", "a"]).fetchone()'], answer: 0,
          explain: 'One value still goes in a tuple: ("Ada",).',
        },
        { type: 'talk', who: 'querykraken', text: 'COUNT... MY... TENTACLES...' },
        {
          type: 'fill', text: 'Total the gold of the mages and strike with fireball, a tenth of it.',
          lines: [...HEROES_SETUP, 'total = db.execute("SELECT [](gold) FROM heroes WHERE cls = \'mage\'").fetchone()[0]', 'cast(fireball, total // 10)'], chips: ['SUM', 'COUNT', 'AVG'], answer: [['SUM']],
          hints: ['Add the gold up.', 'SUM(gold)'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and fireball is doubled. Create a table blows (power INTEGER), insert $HP // 2 + 1 with a ? placeholder, select it back, and cast fireball with it.',
          starter: ['import sqlite3', 'db = sqlite3.connect(":memory:")'], keys: ['db.execute', '(', ')', '"CREATE TABLE blows (power INTEGER)"', '"INSERT INTO blows VALUES (?)"', '($HP // 2 + 1,)', ',', 'p', '=', '"SELECT power FROM blows"', '.fetchone()', '[0]', 'cast', 'fireball'],
          goal: { foeDown: true },
          require: l => (has(l, /VALUES\s*\(\s*\?\s*\)/i) ? null : 'Insert with a ? placeholder.'),
          hints: ['db.execute("CREATE TABLE blows (power INTEGER)") / db.execute("INSERT INTO blows VALUES (?)", ($HP // 2 + 1,))', 'p = db.execute("SELECT power FROM blows").fetchone()[0], then cast(fireball, p)'],
          solution: ['db.execute("CREATE TABLE blows (power INTEGER)")', 'db.execute("INSERT INTO blows VALUES (?)", ($HP // 2 + 1,))', 'p = db.execute("SELECT power FROM blows").fetchone()[0]', 'cast(fireball, p)'],
        },
        { type: 'talk', who: 'querykraken', text: '...0... rows... returned...' },
      ],
      learn: [{ title: 'Vault toolkit', code: 'CREATE  INSERT  SELECT  WHERE  ORDER BY  ?  UPDATE  DELETE  COUNT/SUM  GROUP BY  PRIMARY KEY  UNIQUE', text: 'Everything from the Vault of Records.' }],
    },
  ],
};
WORLDS.push(WORLD35);

(() => {
  const { makeQ, pick, rnd } = Arena;
  const setup = ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE t (n TEXT, v INTEGER)")', 'db.executemany("INSERT INTO t VALUES (?, ?)", [("a", 3), ("b", 8), ("c", 5)])'];
  Object.assign(Arena.GEN, {
    sqlbasics: () => makeQ([...setup, 'print(db.execute("SELECT n FROM t").fetchone())'], ['a', "['a']"]),
    sqlwhere: () => { const k = pick([4, 6]); return makeQ([...setup, `print(db.execute("SELECT n FROM t WHERE v > ${k} ORDER BY v DESC").fetchall())`], ["[('a',)]", "['b', 'c']"]); },
    sqlparams: () => makeQ([...setup, 'print(db.execute("SELECT v FROM t WHERE n = ?", ("b",)).fetchone()[0])'], ['b', 3]),
    sqlupdate: () => makeQ([...setup, 'c = db.execute("UPDATE t SET v = 0 WHERE v < 6")', 'print(c.rowcount)'], [1, 3]),
    sqlagg: () => makeQ([...setup, 'print(db.execute("SELECT COUNT(*), SUM(v) FROM t").fetchone())'], ['(3, 3)', '[3, 16]']),
    sqlkeys: () => { const n = rnd(2, 4); return makeQ(['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE k (id INTEGER PRIMARY KEY, x TEXT)")', `for i in range(${n}):`, '    c = db.execute("INSERT INTO k (x) VALUES (?)", ("q",))', 'print(c.lastrowid)'], [n - 1, 0]); },
  });
})();
