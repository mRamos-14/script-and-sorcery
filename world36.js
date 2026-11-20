/* World 36: The Web of Tables. Relational data: why we split data into several tables,
   foreign keys, JOIN ... ON, joining three tables, building linked rows with the
   INSERT OR IGNORE + SELECT id pattern, many-to-many tables with composite keys,
   LEFT JOIN, counting per group across tables, and subqueries.
   Source: Python for Everybody, chapter 15 (Tracks/Albums/Artists, the course roster). */
Object.assign(EXTRA.npcs, {
  nexa: { name: 'Weaver Nexa', colors: ['#7d4fc9', '#e2b34a', '#ecb98d'] },
});
Object.assign(EXTRA.foes, {
  linkspider: { base: 'crab', name: 'Link spider', pal: { R: '#5a3a8a', M: '#2a1a4a' } },
  keybat: { base: 'bat', name: 'Key bat', pal: { P: '#3a5a8a', W: '#e2b34a' } },
  joinweaver: { base: 'hydra', name: 'The Join Weaver', pal: {} },
});
const MUSIC_SETUP = [
  'import sqlite3',
  'db = sqlite3.connect(":memory:")',
  'db.executescript("""',
  'CREATE TABLE Artist (id INTEGER PRIMARY KEY, name TEXT UNIQUE);',
  'CREATE TABLE Album (id INTEGER PRIMARY KEY, artist_id INTEGER, title TEXT UNIQUE);',
  'CREATE TABLE Track (id INTEGER PRIMARY KEY, title TEXT, album_id INTEGER, len INTEGER);',
  'INSERT INTO Artist (name) VALUES (\'Aria\'), (\'Bryn\');',
  'INSERT INTO Album (artist_id, title) VALUES (1, \'Dawn\'), (1, \'Dusk\'), (2, \'Storm\');',
  'INSERT INTO Track (title, album_id, len) VALUES (\'Rise\', 1, 210), (\'Glow\', 1, 185), (\'Fade\', 2, 240), (\'Thunder\', 3, 300), (\'Rain\', 3, 150);',
  '""")',
];
const ROSTER_SETUP = [
  'import sqlite3',
  'db = sqlite3.connect(":memory:")',
  'db.executescript("""',
  'CREATE TABLE User (id INTEGER PRIMARY KEY, name TEXT UNIQUE);',
  'CREATE TABLE Course (id INTEGER PRIMARY KEY, title TEXT UNIQUE);',
  'CREATE TABLE Member (user_id INTEGER, course_id INTEGER, role INTEGER, PRIMARY KEY (user_id, course_id));',
  'INSERT INTO User (name) VALUES (\'Ada\'), (\'Wren\'), (\'Tam\');',
  'INSERT INTO Course (title) VALUES (\'Runes\'), (\'Potions\');',
  'INSERT INTO Member VALUES (1, 1, 1), (2, 1, 0), (1, 2, 0), (3, 2, 1), (2, 2, 0);',
  '""")',
];

const WORLD36 = {
  id: 36, name: 'The Web of Tables', topic: 'relational data and JOIN',
  nodes: [[50, 92], [28, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [40, 21], [52, 8]],
  levels: [
    {
      id: '36-1', title: 'Why split the table', bg: 'library', npc: 'nexa', mentor: 'nexa', tags: ['relations'],
      steps: [
        { type: 'talk', who: 'nexa', text: "Welcome to the Web, {NAME}. I'm Nexa. Imagine one big table where every track repeats its album title AND the artist's name. Fix a typo in an artist's name and you must fix it a hundred times." },
        { type: 'talk', who: 'nexa', text: 'So we SPLIT: an Artist table, an Album table, a Track table. Each row has an id. An album stores artist_id, the id of its artist: a FOREIGN KEY, a thread pointing to another table. Each fact is now stored exactly once.' },
        { type: 'demo', vars: () => ({}), text: 'Peek at the three tables. Run it.', code: [...MUSIC_SETUP, 'print(db.execute("SELECT * FROM Artist").fetchall())', 'print(db.execute("SELECT * FROM Album").fetchall())', 'print(db.execute("SELECT * FROM Track").fetchall())'] },
        {
          type: 'predict', text: 'Follow the threads by hand. Which artist made the album "Storm"? What will it say?', code: [...MUSIC_SETUP, 'artist_id = db.execute("SELECT artist_id FROM Album WHERE title = \'Storm\'").fetchone()[0]', 'print(db.execute("SELECT name FROM Artist WHERE id = ?", (artist_id,)).fetchone()[0])'],
          explain: 'Storm has artist_id 2, and artist 2 is Bryn.',
        },
        {
          type: 'predict', text: 'Fix once, fixed everywhere. What will it say?', code: [...MUSIC_SETUP, 'db.execute("UPDATE Artist SET name = \'Aria Moon\' WHERE id = 1")', 'for (title,) in db.execute("SELECT title FROM Album WHERE artist_id = 1"):', '    name = db.execute("SELECT name FROM Artist WHERE id = 1").fetchone()[0]', '    print(title, "by", name)'],
          explain: 'One UPDATE changed the artist name for every album that points to her.',
        },
        {
          type: 'fill', text: 'Find the album id that each track points to.',
          lines: [...MUSIC_SETUP, 'print(db.execute("SELECT title, [] FROM Track WHERE len > 200").fetchall())'], chips: ['album_id', 'artist_id', 'id'], answer: [['album_id']],
          hints: ['Tracks point to albums.', 'album_id'],
        },
        {
          type: 'write', text: 'By following the ids yourself (no JOIN yet), print the titles of all tracks on the album "Dawn".',
          starter: MUSIC_SETUP, keys: ['album', '=', 'db.execute', '(', ')', '"SELECT id FROM Album WHERE title = ?"', '("Dawn",)', '.fetchone()', '[0]', 'for', '(title,)', 'in', '"SELECT title FROM Track WHERE album_id = ?"', '(album,)', ':', 'print', 'title', ','],
          require: l => (has(l, /album_id\s*=\s*\?/) ? null : 'Look up the album id, then select tracks WHERE album_id = ?.'),
          hints: ['album = db.execute("SELECT id FROM Album WHERE title = ?", ("Dawn",)).fetchone()[0]', 'for (title,) in db.execute("SELECT title FROM Track WHERE album_id = ?", (album,)): print(title)'],
          solution: ['album = db.execute("SELECT id FROM Album WHERE title = ?", ("Dawn",)).fetchone()[0]', 'for (title,) in db.execute("SELECT title FROM Track WHERE album_id = ?", (album,)):', '    print(title)'],
        },
      ],
      learn: [{ title: 'Splitting data', code: 'Artist(id, name)\nAlbum(id, artist_id, title)\nTrack(id, title, album_id)', text: 'Each fact lives in one place; foreign keys point between tables.' }],
    },
    {
      id: '36-2', title: 'Joining the threads', bg: 'library', npc: 'nexa', mentor: 'nexa', tags: ['joins'],
      steps: [
        { type: 'talk', who: 'nexa', text: 'JOIN does the thread-following for you. FROM Album JOIN Artist ON Album.artist_id = Artist.id pairs every album with ITS artist. Use Table.column to say which table a column belongs to.' },
        { type: 'demo', text: 'Run it.', code: [...MUSIC_SETUP, 'for row in db.execute("SELECT Album.title, Artist.name FROM Album JOIN Artist ON Album.artist_id = Artist.id"):', '    print(row)'] },
        {
          type: 'predict', text: 'What will it say?', code: [...MUSIC_SETUP, 'print(db.execute("SELECT Track.title, Album.title FROM Track JOIN Album ON Track.album_id = Album.id WHERE Track.len > 200 ORDER BY Track.title").fetchall())'],
          explain: 'Each long track is paired with the album it belongs to.',
        },
        {
          type: 'predict', text: 'Without ON, every row pairs with every row. What will it say?', code: [...MUSIC_SETUP, 'print(db.execute("SELECT COUNT(*) FROM Artist JOIN Album").fetchone()[0])'],
          explain: '2 artists × 3 albums = 6 pairs, most of them wrong. The ON condition keeps only the true links.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Both tables have a title column. Which error?', code: [...MUSIC_SETUP, 'db.execute("SELECT title FROM Track JOIN Album ON Track.album_id = Album.id").fetchall()'],
          explain: 'title exists in both tables, so SQL cannot know which you mean: OperationalError (ambiguous column name). Write Track.title.',
        },
        {
          type: 'fill', text: 'Pair each album with its artist.',
          lines: [...MUSIC_SETUP, 'print(db.execute("SELECT Album.title, Artist.name FROM Album JOIN Artist [] Album.artist_id = Artist.id ORDER BY Album.title").fetchall())'], chips: ['ON', 'WHERE', 'AND'], answer: [['ON']],
          require: s => (s[0] === 'ON' ? null : 'That works here, but ON is the clear way to say how two tables link.'),
          hints: ['JOIN ... ON the linking columns.', 'ON Album.artist_id = Artist.id'],
        },
        {
          type: 'write', text: 'With a JOIN, print the names of the artists of every track longer than 200 seconds, with the track title, sorted by track title.',
          starter: MUSIC_SETUP, keys: ['for', 'row', 'in', 'db.execute', '(', ')', '"SELECT Track.title, Artist.name FROM Track JOIN Album ON Track.album_id = Album.id JOIN Artist ON Album.artist_id = Artist.id WHERE Track.len > 200 ORDER BY Track.title"', ':', 'print'],
          require: l => ((typed(l).match(/JOIN/gi) || []).length >= 2 ? null : 'You need two JOINs: Track to Album, Album to Artist.'),
          hints: ['FROM Track JOIN Album ON Track.album_id = Album.id JOIN Artist ON Album.artist_id = Artist.id', 'WHERE Track.len > 200 ORDER BY Track.title, and print each row'],
          solution: ['for row in db.execute("SELECT Track.title, Artist.name FROM Track JOIN Album ON Track.album_id = Album.id JOIN Artist ON Album.artist_id = Artist.id WHERE Track.len > 200 ORDER BY Track.title"):', '    print(row)'],
        },
      ],
      learn: [{ title: 'JOIN', code: 'SELECT A.x, B.y\nFROM A JOIN B ON A.b_id = B.id', text: 'Pair rows of two tables along their link. Name columns as Table.column when both have one.' }],
    },
    {
      id: '36-3', title: 'Three-way threads', bg: 'archive', npc: 'nexa', mentor: 'nexa', tags: ['join3'],
      steps: [
        { type: 'talk', who: 'nexa', text: 'Joins chain: Track JOIN Album JOIN Artist follows two threads in one query. Short ALIASES keep it readable: FROM Track AS t JOIN Album AS al ON t.album_id = al.id.' },
        { type: 'demo', text: 'Run it.', code: [...MUSIC_SETUP, 'q = "SELECT t.title, al.title, ar.name FROM Track AS t JOIN Album AS al ON t.album_id = al.id JOIN Artist AS ar ON al.artist_id = ar.id ORDER BY ar.name, t.title"', 'for row in db.execute(q):', '    print(row)'] },
        {
          type: 'predict', vars: R => ({ n: R.pick(['Aria', 'Bryn']) }), text: 'What will it say?', code: [...MUSIC_SETUP, 'q = "SELECT t.title FROM Track t JOIN Album al ON t.album_id = al.id JOIN Artist ar ON al.artist_id = ar.id WHERE ar.name = ? ORDER BY t.len DESC"', 'print(db.execute(q, ("$n",)).fetchall())'],
          explain: 'All of $n\'s tracks, across every album, longest first.',
        },
        {
          type: 'predict', text: 'Totals per artist. What will it say?', code: [...MUSIC_SETUP, 'q = "SELECT ar.name, COUNT(*), SUM(t.len) FROM Track t JOIN Album al ON t.album_id = al.id JOIN Artist ar ON al.artist_id = ar.id GROUP BY ar.name ORDER BY ar.name"', 'print(db.execute(q).fetchall())'],
          explain: 'GROUP BY works across joins: one row per artist with their track count and total length.',
        },
        {
          type: 'fill', text: 'Finish the second thread: albums link to artists.',
          lines: [...MUSIC_SETUP, 'q = "SELECT t.title, ar.name FROM Track t JOIN Album al ON t.album_id = al.id JOIN Artist ar ON al.[] = ar.id ORDER BY t.title"', 'print(db.execute(q).fetchall()[:2])'], chips: ['artist_id', 'album_id', 'id'], answer: [['artist_id']],
          hints: ['Albums store the id of their artist.', 'al.artist_id = ar.id'],
        },
        {
          type: 'write', text: 'Print the title of each album with the number of tracks on it, ordered by album title.',
          starter: MUSIC_SETUP, keys: ['for', 'row', 'in', 'db.execute', '(', ')', '"SELECT al.title, COUNT(*) FROM Track t JOIN Album al ON t.album_id = al.id GROUP BY al.title ORDER BY al.title"', ':', 'print'],
          require: l => (has(l, /JOIN/i) && has(l, /GROUP BY/i) ? null : 'JOIN Track to Album and GROUP BY the album.'),
          hints: ['SELECT al.title, COUNT(*) FROM Track t JOIN Album al ON t.album_id = al.id', 'GROUP BY al.title ORDER BY al.title, then print each row'],
          solution: ['for row in db.execute("SELECT al.title, COUNT(*) FROM Track t JOIN Album al ON t.album_id = al.id GROUP BY al.title ORDER BY al.title"):', '    print(row)'],
        },
      ],
      learn: [{ title: 'Chained joins', code: 'FROM Track t\nJOIN Album al ON t.album_id = al.id\nJOIN Artist ar ON al.artist_id = ar.id', text: 'Follow several threads in one query; aliases keep it short.' }],
    },
    {
      id: '36-4', title: 'Link spiders', bg: 'library', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'linkspider', hp: d0 + 300 / 30 + 150 / 30, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Link spiders spin false threads! $HP HP. Follow the true ones: every track of the album "Storm" strikes with its length / 30.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Join tracks to albums and strike with each Storm track.',
          lines: [...MUSIC_SETUP, 'q = "SELECT Track.len FROM Track JOIN Album ON Track.album_id = Album.[] WHERE Album.title = \'Storm\'"', 'for (length,) in db.execute(q):', '    cast(fireball, length // 30)'], chips: ['id', 'artist_id', 'title'], answer: [['id']],
          goal: { foeDown: true },
          hints: ['The track stores the album\'s id.', 'Track.album_id = Album.id'],
        },
        { type: 'talk', who: 'narrator', text: 'The spider queen counts Aria\'s albums!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 2 * 3 }),
          spawn: v => ({ kind: 'linkspider', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Count Aria\'s albums with a JOIN and cast icebolt with the count × 3, twice.',
          starter: MUSIC_SETUP, keys: ['n', '=', 'db.execute', '(', ')', '"SELECT COUNT(*) FROM Album JOIN Artist ON Album.artist_id = Artist.id WHERE Artist.name = ?"', '("Aria",)', '.fetchone()', '[0]', 'cast', 'icebolt', ',', '*', '3'],
          goal: { foeDown: true },
          require: l => (has(l, /JOIN/i) ? null : 'Use a JOIN.'),
          hints: ['n = db.execute("SELECT COUNT(*) FROM Album JOIN Artist ON Album.artist_id = Artist.id WHERE Artist.name = ?", ("Aria",)).fetchone()[0]', 'cast(icebolt, n * 3) twice'],
          solution: ['n = db.execute("SELECT COUNT(*) FROM Album JOIN Artist ON Album.artist_id = Artist.id WHERE Artist.name = ?", ("Aria",)).fetchone()[0]', 'cast(icebolt, n * 3)', 'cast(icebolt, n * 3)'],
        },
      ],
      learn: [{ title: 'Joins in battle', code: 'JOIN ... ON Track.album_id = Album.id', text: 'Only true links survive the ON.' }],
    },
    {
      id: '36-5', title: 'Spinning new threads', bg: 'scriptorium', npc: 'nexa', mentor: 'nexa', tags: ['linkinsert'],
      steps: [
        { type: 'talk', who: 'nexa', text: 'Adding linked data means getting the ids right. The Py4E pattern: INSERT OR IGNORE the artist, SELECT its id, then INSERT the album with that artist_id. Repeat for tracks. Repeated artists are not duplicated.' },
        { type: 'demo', text: 'Run it.', code: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE Artist (id INTEGER PRIMARY KEY, name TEXT UNIQUE)")', 'db.execute("CREATE TABLE Album (id INTEGER PRIMARY KEY, artist_id INTEGER, title TEXT UNIQUE)")', 'for title, artist in [("Dawn", "Aria"), ("Storm", "Bryn"), ("Dusk", "Aria")]:', '    db.execute("INSERT OR IGNORE INTO Artist (name) VALUES (?)", (artist,))', '    artist_id = db.execute("SELECT id FROM Artist WHERE name = ?", (artist,)).fetchone()[0]', '    db.execute("INSERT OR IGNORE INTO Album (title, artist_id) VALUES (?, ?)", (title, artist_id))', 'print(db.execute("SELECT * FROM Artist").fetchall())', 'print(db.execute("SELECT * FROM Album").fetchall())'] },
        {
          type: 'predict', text: 'What will it say?', code: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE Tag (id INTEGER PRIMARY KEY, name TEXT UNIQUE)")', 'ids = []', 'for name in ["fire", "ice", "fire", "storm", "ice"]:', '    db.execute("INSERT OR IGNORE INTO Tag (name) VALUES (?)", (name,))', '    ids.append(db.execute("SELECT id FROM Tag WHERE name = ?", (name,)).fetchone()[0])', 'print(ids)'],
          explain: 'Repeated names get their existing id; new ones get the next number.',
        },
        {
          type: 'fill', text: 'Store the artist\'s id in the album row.',
          lines: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE Artist (id INTEGER PRIMARY KEY, name TEXT UNIQUE)")', 'db.execute("CREATE TABLE Album (id INTEGER PRIMARY KEY, artist_id INTEGER, title TEXT)")', 'db.execute("INSERT OR IGNORE INTO Artist (name) VALUES (\'Aria\')")', 'aid = db.execute("SELECT id FROM Artist WHERE name = \'Aria\'").fetchone()[0]', 'db.execute("INSERT INTO Album (title, artist_id) VALUES (?, ?)", ("Dawn", []))', 'print(db.execute("SELECT * FROM Album").fetchall())'], chips: ['aid', '"Aria"', '1.0'], answer: [['aid']],
          hints: ['The album points to its artist by id.', 'aid'],
        },
        {
          type: 'write', text: 'Load the songs into Artist and Song (with artist_id) using the INSERT OR IGNORE + SELECT id pattern, then print every Song row.',
          starter: ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE Artist (id INTEGER PRIMARY KEY, name TEXT UNIQUE)")', 'db.execute("CREATE TABLE Song (id INTEGER PRIMARY KEY, title TEXT, artist_id INTEGER)")', 'songs = [("Rise", "Aria"), ("Rain", "Bryn"), ("Glow", "Aria")]'], keys: ['for', 'title', 'artist', 'in', 'songs', ':', 'db.execute', '(', ')', '"INSERT OR IGNORE INTO Artist (name) VALUES (?)"', '(artist,)', 'aid', '=', '"SELECT id FROM Artist WHERE name = ?"', '.fetchone()', '[0]', '"INSERT INTO Song (title, artist_id) VALUES (?, ?)"', '(title, aid)', ',', 'print', '"SELECT * FROM Song"', '.fetchall()'],
          require: l => (has(l, /INSERT OR IGNORE/i) && has(l, /SELECT id/i) ? null : 'Use INSERT OR IGNORE, then SELECT id.'),
          hints: ['for title, artist in songs: insert-or-ignore the artist, select its id as aid', 'then INSERT INTO Song (title, artist_id) VALUES (?, ?) with (title, aid); finally print all Song rows'],
          solution: ['for title, artist in songs:', '    db.execute("INSERT OR IGNORE INTO Artist (name) VALUES (?)", (artist,))', '    aid = db.execute("SELECT id FROM Artist WHERE name = ?", (artist,)).fetchone()[0]', '    db.execute("INSERT INTO Song (title, artist_id) VALUES (?, ?)", (title, aid))', 'print(db.execute("SELECT * FROM Song").fetchall())'],
        },
      ],
      learn: [{ title: 'Inserting linked rows', code: 'INSERT OR IGNORE INTO Artist (name) VALUES (?)\nid = SELECT id FROM Artist WHERE name = ?\nINSERT INTO Album (title, artist_id) VALUES (?, ?)', text: 'Make sure the parent exists, fetch its id, then link the child to it.' }],
    },
    {
      id: '36-6', title: 'Many to many', bg: 'library', npc: 'nexa', mentor: 'nexa', tags: ['manytomany'],
      steps: [
        { type: 'talk', who: 'nexa', text: 'A student takes many courses, and a course has many students. Neither table can hold that link alone, so a third JUNCTION table holds pairs: Member(user_id, course_id, role). Its PRIMARY KEY is the pair, so each pair appears once.' },
        { type: 'demo', text: 'Run it.', code: [...ROSTER_SETUP, 'q = "SELECT User.name, Course.title, Member.role FROM User JOIN Member ON Member.user_id = User.id JOIN Course ON Member.course_id = Course.id ORDER BY Course.title, User.name"', 'for row in db.execute(q):', '    print(row)'] },
        {
          type: 'predict', vars: R => ({ n: R.pick(['Ada', 'Wren', 'Tam']) }), text: 'Which courses? What will it say?', code: [...ROSTER_SETUP, 'q = "SELECT Course.title FROM User JOIN Member ON Member.user_id = User.id JOIN Course ON Member.course_id = Course.id WHERE User.name = ? ORDER BY Course.title"', 'print(db.execute(q, ("$n",)).fetchall())'],
          explain: 'Follow $n through Member to every course they are in.',
        },
        {
          type: 'predict', text: 'Class sizes. What will it say?', code: [...ROSTER_SETUP, 'q = "SELECT Course.title, COUNT(*) FROM Member JOIN Course ON Member.course_id = Course.id GROUP BY Course.title ORDER BY Course.title"', 'print(db.execute(q).fetchall())'],
          explain: 'Count the Member rows for each course.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Enrolling Ada in Runes twice. Which error?', code: [...ROSTER_SETUP, 'db.execute("INSERT INTO Member VALUES (1, 1, 0)")'],
          explain: 'The pair (1, 1) already exists and is the primary key: IntegrityError.',
        },
        {
          type: 'fill', text: 'Who teaches each course (role 1)?',
          lines: [...ROSTER_SETUP, 'q = "SELECT Course.title, User.name FROM User JOIN Member ON Member.user_id = User.id JOIN Course ON Member.course_id = Course.id WHERE Member.[] = 1 ORDER BY Course.title"', 'print(db.execute(q).fetchall())'], chips: ['role', 'user_id', 'id'], answer: [['role']],
          hints: ['The junction table also stores the role.', 'Member.role = 1'],
        },
        {
          type: 'write', text: 'Enrol Tam in Runes as a student (role 0) with INSERT OR IGNORE, then print the sorted names of everyone in Runes.',
          starter: ROSTER_SETUP, keys: ['db.execute', '(', ')', '"INSERT OR IGNORE INTO Member VALUES (3, 1, 0)"', 'q', '=', '"SELECT User.name FROM User JOIN Member ON Member.user_id = User.id JOIN Course ON Member.course_id = Course.id WHERE Course.title = \'Runes\' ORDER BY User.name"', 'print', '.fetchall()'],
          require: l => (has(l, /INSERT OR IGNORE INTO Member/i) && has(l, /JOIN/i) ? null : 'Insert the pair into Member, then join to list Runes.'),
          hints: ['db.execute("INSERT OR IGNORE INTO Member VALUES (3, 1, 0)")', 'Join User, Member and Course WHERE Course.title = \'Runes\' ORDER BY User.name'],
          solution: ['db.execute("INSERT OR IGNORE INTO Member VALUES (3, 1, 0)")', 'q = "SELECT User.name FROM User JOIN Member ON Member.user_id = User.id JOIN Course ON Member.course_id = Course.id WHERE Course.title = \'Runes\' ORDER BY User.name"', 'print(db.execute(q).fetchall())'],
        },
      ],
      learn: [{ title: 'Many-to-many', code: 'Member(user_id, course_id, role,\n       PRIMARY KEY (user_id, course_id))', text: 'A junction table of id pairs links two tables both ways.' }],
    },
    {
      id: '36-7', title: 'Loose threads', bg: 'archive', npc: 'nexa', mentor: 'nexa', tags: ['leftjoin'],
      steps: [
        { type: 'talk', who: 'nexa', text: 'A plain JOIN drops rows with no match. LEFT JOIN keeps every row of the LEFT table, filling the missing side with NULL (None in Python). And a query can sit inside another: WHERE id IN (SELECT ...).' },
        { type: 'demo', text: 'Run it.', code: [...MUSIC_SETUP, 'db.execute("INSERT INTO Artist (name) VALUES (\'Cass\')")', 'print(db.execute("SELECT Artist.name, Album.title FROM Artist LEFT JOIN Album ON Album.artist_id = Artist.id ORDER BY Artist.name").fetchall())'] },
        {
          type: 'predict', text: 'Counting with a LEFT JOIN. What will it say?', code: [...MUSIC_SETUP, 'db.execute("INSERT INTO Artist (name) VALUES (\'Cass\')")', 'q = "SELECT Artist.name, COUNT(Album.id) FROM Artist LEFT JOIN Album ON Album.artist_id = Artist.id GROUP BY Artist.name ORDER BY Artist.name"', 'print(db.execute(q).fetchall())'],
          explain: 'COUNT(Album.id) skips NULLs, so an artist with no albums gets 0.',
        },
        {
          type: 'predict', text: 'Who has nothing? What will it say?', code: [...MUSIC_SETUP, 'db.execute("INSERT INTO Artist (name) VALUES (\'Cass\')")', 'print(db.execute("SELECT Artist.name FROM Artist LEFT JOIN Album ON Album.artist_id = Artist.id WHERE Album.id IS NULL").fetchall())'],
          explain: 'Rows where the right side is NULL are the ones with no match.',
        },
        {
          type: 'predict', text: 'A query inside a query. What will it say?', code: [...MUSIC_SETUP, 'q = "SELECT title FROM Track WHERE album_id IN (SELECT id FROM Album WHERE artist_id = 1) ORDER BY title"', 'print(db.execute(q).fetchall())'],
          explain: 'The inner SELECT finds Aria\'s album ids; the outer one picks their tracks.',
        },
        {
          type: 'fill', text: 'Keep artists even when they have no albums.',
          lines: [...MUSIC_SETUP, 'db.execute("INSERT INTO Artist (name) VALUES (\'Cass\')")', 'print(len(db.execute("SELECT Artist.name FROM Artist [] JOIN Album ON Album.artist_id = Artist.id").fetchall()))'], chips: ['LEFT', 'INNER', 'CROSS'], answer: [['LEFT']],
          hints: ['Keep everything from the left table.', 'LEFT JOIN'],
        },
        {
          type: 'write', text: 'Print the titles of tracks that are on albums by Bryn, using a subquery (IN) instead of a JOIN, sorted by title.',
          starter: MUSIC_SETUP, keys: ['print', '(', ')', 'db.execute', '"SELECT title FROM Track WHERE album_id IN (SELECT Album.id FROM Album JOIN Artist ON Album.artist_id = Artist.id WHERE Artist.name = \'Bryn\') ORDER BY title"', '.fetchall()'],
          require: l => (has(l, /\bIN\s*\(\s*SELECT/i) ? null : 'Use WHERE album_id IN (SELECT ...).'),
          hints: ['The inner query finds Bryn\'s album ids.', 'SELECT title FROM Track WHERE album_id IN (SELECT Album.id ...) ORDER BY title'],
          solution: ['print(db.execute("SELECT title FROM Track WHERE album_id IN (SELECT Album.id FROM Album JOIN Artist ON Album.artist_id = Artist.id WHERE Artist.name = \'Bryn\') ORDER BY title").fetchall())'],
        },
      ],
      learn: [{ title: 'LEFT JOIN and subqueries', code: 'FROM A LEFT JOIN B ON ...   # keeps all of A\nWHERE x IN (SELECT ...)', text: 'Keep unmatched rows, find the gaps, and nest queries.' }],
    },
    {
      id: '36-8', title: 'Key bats', bg: 'library', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'keybat', hp: d0 + 5 * 3, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Key bats steal the threads between tables! $HP HP. Every enrolment in the roster is a strike.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Cast fireball with 3 for every Member row that links a real user to a real course.',
          lines: [...ROSTER_SETUP, 'q = "SELECT COUNT(*) FROM Member JOIN User ON Member.user_id = User.id JOIN Course ON Member.[] = Course.id"', 'for i in range(db.execute(q).fetchone()[0]):', '    cast(fireball, 3)'], chips: ['course_id', 'user_id', 'role'], answer: [['course_id']],
          goal: { foeDown: true },
          hints: ['The member row points to its course.', 'Member.course_id = Course.id'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat king hides behind the busiest course!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 3 }),
          spawn: v => ({ kind: 'keybat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Find the size of the biggest course (GROUP BY course_id, ORDER BY COUNT(*) DESC LIMIT 1) and cast icebolt with it twice.',
          starter: ROSTER_SETUP, keys: ['n', '=', 'db.execute', '(', ')', '"SELECT COUNT(*) FROM Member GROUP BY course_id ORDER BY COUNT(*) DESC LIMIT 1"', '.fetchone()', '[0]', 'cast', 'icebolt', ','],
          goal: { foeDown: true },
          require: l => (has(l, /GROUP BY/i) ? null : 'Use GROUP BY course_id.'),
          hints: ['n = db.execute("SELECT COUNT(*) FROM Member GROUP BY course_id ORDER BY COUNT(*) DESC LIMIT 1").fetchone()[0]', 'cast(icebolt, n) twice'],
          solution: ['n = db.execute("SELECT COUNT(*) FROM Member GROUP BY course_id ORDER BY COUNT(*) DESC LIMIT 1").fetchone()[0]', 'cast(icebolt, n)', 'cast(icebolt, n)'],
        },
      ],
      learn: [{ title: 'Counting links', code: 'GROUP BY course_id ORDER BY COUNT(*) DESC', text: 'Junction tables are easy to count.' }],
    },
    {
      id: '36-9', title: 'The Join Weaver', bg: 'citadel', foe: { kind: 'joinweaver', hp: 190, weak: 'spark', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'joinweaver', text: 'EVERY... THREAD... LEADS... TO... ME...' },
        { type: 'talk', who: 'narrator', text: 'The Join Weaver has 190 HP. Spark cuts its threads: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Spark is doubled.', code: [...MUSIC_SETUP, 'n = db.execute("SELECT COUNT(*) FROM Track JOIN Album ON Track.album_id = Album.id WHERE Album.artist_id = 1").fetchone()[0]', 'cast(spark, n * 2)'],
          explain: 'Aria has 3 tracks, × 2 = 6, doubled.',
        },
        {
          type: 'fix', text: 'This should pair each track with its OWN album only. Run it, then tap the broken line.',
          code: [...MUSIC_SETUP, 'rows = db.execute("SELECT Track.title, Album.title FROM Track JOIN Album").fetchall()', 'print(len(rows))', 'cast(spark, len(rows))'], bad: 10,
          options: ['rows = db.execute("SELECT Track.title, Album.title FROM Track JOIN Album ON Track.album_id = Album.id").fetchall()', 'rows = db.execute("SELECT Track.title, Album.title FROM Track JOIN Album ON Track.id = Album.id").fetchall()', 'rows = db.execute("SELECT Track.title FROM Track").fetchall() * 3'], answer: 0,
          explain: 'Without ON, every track pairs with every album: 15 rows instead of 5.',
        },
        { type: 'talk', who: 'joinweaver', text: 'WHO... TEACHES... THE... POTIONS...' },
        {
          type: 'fill', text: 'Find the Potions teacher\'s id and strike with spark, 4 times it.',
          lines: [...ROSTER_SETUP, 'q = "SELECT user_id FROM Member WHERE role = 1 AND course_id = (SELECT id FROM Course WHERE title = [])"', 'cast(spark, db.execute(q).fetchone()[0] * 4)'], chips: ["'Potions'", 'Potions', "'Runes'"], answer: [["'Potions'"]],
          hints: ['SQL text needs single quotes.', "'Potions'"],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and spark is doubled. Create Power (id INTEGER PRIMARY KEY, amount INTEGER) and Blow (power_id INTEGER), link a Blow row to a Power row holding $HP // 2 + 1, then JOIN them to get the amount and cast spark with it.',
          starter: ['import sqlite3', 'db = sqlite3.connect(":memory:")'], keys: ['db.execute', '(', ')', '"CREATE TABLE Power (id INTEGER PRIMARY KEY, amount INTEGER)"', '"CREATE TABLE Blow (power_id INTEGER)"', 'pid', '=', '"INSERT INTO Power (amount) VALUES (?)"', '($HP // 2 + 1,)', '.lastrowid', '"INSERT INTO Blow VALUES (?)"', '(pid,)', 'a', '"SELECT Power.amount FROM Blow JOIN Power ON Blow.power_id = Power.id"', '.fetchone()', '[0]', 'cast', 'spark', ','],
          goal: { foeDown: true },
          require: l => (has(l, /JOIN/i) && has(l, /lastrowid/) ? null : 'Use lastrowid to link them, and a JOIN to read it back.'),
          hints: ['pid = db.execute("INSERT INTO Power (amount) VALUES (?)", ($HP // 2 + 1,)).lastrowid', 'db.execute("INSERT INTO Blow VALUES (?)", (pid,)); then JOIN Blow to Power and cast spark with the amount'],
          solution: ['db.execute("CREATE TABLE Power (id INTEGER PRIMARY KEY, amount INTEGER)")', 'db.execute("CREATE TABLE Blow (power_id INTEGER)")', 'pid = db.execute("INSERT INTO Power (amount) VALUES (?)", ($HP // 2 + 1,)).lastrowid', 'db.execute("INSERT INTO Blow VALUES (?)", (pid,))', 'a = db.execute("SELECT Power.amount FROM Blow JOIN Power ON Blow.power_id = Power.id").fetchone()[0]', 'cast(spark, a)'],
        },
        { type: 'talk', who: 'joinweaver', text: '...the... web... unravels...' },
      ],
      learn: [{ title: 'Web toolkit', code: 'foreign keys  JOIN ON  aliases  INSERT OR IGNORE + SELECT id  junction tables  LEFT JOIN  IN (SELECT)', text: 'Everything from the Web of Tables.' }],
    },
  ],
};
WORLDS.push(WORLD36);

(() => {
  const { makeQ, pick } = Arena;
  const setup = ['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.executescript("CREATE TABLE A (id INTEGER PRIMARY KEY, n TEXT); CREATE TABLE B (id INTEGER PRIMARY KEY, a_id INTEGER, t TEXT); INSERT INTO A (n) VALUES (\'x\'), (\'y\'), (\'z\'); INSERT INTO B (a_id, t) VALUES (1, \'p\'), (1, \'q\'), (2, \'r\');")'];
  Object.assign(Arena.GEN, {
    relations: () => makeQ([...setup, 'print(db.execute("SELECT a_id FROM B WHERE t = \'r\'").fetchone()[0])'], [3, 'y']),
    joins: () => makeQ([...setup, 'print(db.execute("SELECT B.t, A.n FROM B JOIN A ON B.a_id = A.id WHERE B.t = \'q\'").fetchone())'], ["('q', 'y')", "('x', 'q')"]),
    join3: () => makeQ([...setup, 'print(db.execute("SELECT COUNT(*) FROM A JOIN B").fetchone()[0])'], [3, 6]),
    linkinsert: () => makeQ(['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE T (id INTEGER PRIMARY KEY, n TEXT UNIQUE)")', 'ids = []', 'for n in ["a", "b", "a"]:', '    db.execute("INSERT OR IGNORE INTO T (n) VALUES (?)", (n,))', '    ids.append(db.execute("SELECT id FROM T WHERE n = ?", (n,)).fetchone()[0])', 'print(ids)'], ['[1, 2, 3]', '[1, 1, 1]']),
    manytomany: () => makeQ(['import sqlite3', 'db = sqlite3.connect(":memory:")', 'db.execute("CREATE TABLE M (u INTEGER, c INTEGER, PRIMARY KEY (u, c))")', 'db.execute("INSERT INTO M VALUES (1, 1)")', 'db.execute("INSERT OR IGNORE INTO M VALUES (1, 1)")', 'db.execute("INSERT INTO M VALUES (1, 2)")', 'print(db.execute("SELECT COUNT(*) FROM M").fetchone()[0])'], [3, 1]),
    leftjoin: () => makeQ([...setup, 'print(db.execute("SELECT A.n, COUNT(B.id) FROM A LEFT JOIN B ON B.a_id = A.id GROUP BY A.n ORDER BY A.n").fetchall())'], ["[('x', 2), ('y', 1)]", "[('x', 2), ('y', 1), ('z', 1)]"]),
  });
})();
