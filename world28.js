/* World 28: The Labyrinth of Folders. Working with the file system: pathlib.Path and
   the / operator, name/stem/suffix/parent, making folders, reading and writing through
   paths, listing and globbing, os.path and os.listdir, walking a whole tree with os.walk
   and rglob, copying and moving with shutil, and sorting files into folders.
   Source: Automate the Boring Stuff, chapters 9-10. Paths use "/" like Linux and macOS. */
Object.assign(EXTRA.npcs, {
  dedalo: { name: 'Mapmaker Dedalo', colors: ['#6a5a3a', '#d8d0c0', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  dustmimic: { base: 'mimic', name: 'Dust mimic', pal: { B: '#7a6a5a', Y: '#c8a060' } },
  mazebat: { base: 'bat', name: 'Maze bat', pal: { P: '#5a4a3a', W: '#c8a060' } },
  mazeking: { base: 'goblinking', name: 'The Maze King', pal: { G: '#8a7a5a', B: '#5a3a24' } },
});
const MAZE_FILES = { 'maps/north.txt': 'hills\n', 'maps/south.txt': 'river\n', 'maps/legend.md': '# legend\n', 'notes.txt': 'remember the torch\n' };

const WORLD28 = {
  id: 28, name: 'The Labyrinth of Folders', topic: 'paths, folders and file tools',
  nodes: [[50, 92], [28, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [40, 21], [52, 8]],
  levels: [
    {
      id: '28-1', title: 'Paths, not strings', bg: 'tunnel', npc: 'dedalo', mentor: 'dedalo', tags: ['pathparts'],
      steps: [
        { type: 'talk', who: 'dedalo', text: "Lost already, {NAME}? I'm Dedalo, and I map this labyrinth. Files live in FOLDERS, and a PATH says how to reach one: maps/north.txt means the file north.txt inside the folder maps." },
        { type: 'talk', who: 'dedalo', text: 'from pathlib import Path gives you Path objects. Join parts with the / operator: Path("maps") / "north.txt". A path knows its .name, .stem (name without the ending), .suffix (the ending) and .parent (the folder).' },
        { type: 'demo', text: 'Run it.', code: ['from pathlib import Path', 'p = Path("maps") / "north.txt"', 'print(p)', 'print(p.name, p.stem, p.suffix)', 'print(p.parent)'] },
        {
          type: 'predict', vars: R => ({ f: R.pick(['report.pdf', 'spell.py', 'scroll.tar', 'map.png']), d: R.pick(['vault', 'docs', 'old']) }),
          text: 'What will it say?', code: ['from pathlib import Path', 'p = Path("$d") / "$f"', 'print(p.stem, p.suffix)'],
          explain: 'The stem is the name without its ending; the suffix is the ending with its dot.',
        },
        {
          type: 'predict', vars: R => ({ a: R.pick(['home', 'quests', 'castle']), b: R.pick(['north', 'east', 'cellar']) }),
          text: 'Deeper paths. What will it say?', code: ['from pathlib import Path', 'p = Path("$a", "$b", "plan.txt")', 'print(p)', 'print(p.parent.name)'],
          explain: 'Path("a", "b", "c") joins the parts with "/". The parent of the file is the $b folder.',
        },
        {
          type: 'predict', text: 'Changing the ending. What will it say?', code: ['from pathlib import Path', 'p = Path("notes") / "day1.txt"', 'print(p.with_suffix(".md"))'],
          explain: 'with_suffix gives a NEW path with a different ending. It does not rename any file.',
        },
        {
          type: 'fill', vars: R => ({ d: R.pick(['maps', 'logs', 'saves']), f: R.pick(['a.txt', 'b.csv']) }),
          text: 'Join the folder and the file name into one path.',
          lines: ['from pathlib import Path', 'p = Path("$d") [] "$f"', 'print(p)'], chips: ['/', '+', ','], answer: [['/']],
          hints: ['Paths join with the slash operator.', 'Path("$d") / "$f"'],
        },
        {
          type: 'write', vars: R => ({ f: R.pick(['treasure.map', 'letter.txt', 'song.mp3']) }),
          text: 'Make the path vault/old/$f and print its name, then its suffix.',
          starter: ['from pathlib import Path'], keys: ['p', '=', 'Path', '(', ')', '"vault"', '"old"', '"$f"', '/', 'print', '.name', '.suffix'],
          require: l => (has(l, /Path\s*\(/) ? null : 'Build it with Path(...).'),
          hints: ['p = Path("vault") / "old" / "$f"', 'print(p.name) then print(p.suffix)'],
          solution: ['p = Path("vault") / "old" / "$f"', 'print(p.name)', 'print(p.suffix)'],
        },
      ],
      learn: [{ title: 'Paths', code: 'p = Path("maps") / "north.txt"\np.name   p.stem   p.suffix   p.parent', text: 'Build paths with /, and read their parts by name.' }],
    },
    {
      id: '28-2', title: 'Building rooms', bg: 'tunnel', npc: 'dedalo', mentor: 'dedalo', tags: ['mkdirq'],
      steps: [
        { type: 'talk', who: 'dedalo', text: 'Paths can DO things too. p.exists() checks whether something is there. p.mkdir() makes a folder. p.write_text("...") writes a whole file, and p.read_text() reads it all back.' },
        { type: 'talk', who: 'dedalo', text: 'You cannot put a file in a folder that does not exist yet: that is a FileNotFoundError. mkdir(parents=True) makes the missing folders along the way, and exist_ok=True stops it complaining if the folder is already there.' },
        { type: 'demo', text: 'Run it and watch the shelf.', code: ['from pathlib import Path', 'room = Path("camp")', 'print(room.exists())', 'room.mkdir()', 'tent = room / "tent.txt"', 'tent.write_text("sleeping bag")', 'print(tent.read_text(), room.is_dir(), tent.is_file())'] },
        {
          type: 'predict', measure: 'errtype', text: 'Which error?', code: ['from pathlib import Path', 'Path("cellar/wine.txt").write_text("old")'],
          explain: 'There is no cellar folder yet: FileNotFoundError. Make it first with mkdir.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Making the same room twice. Which error?', code: ['from pathlib import Path', 'Path("hall").mkdir()', 'Path("hall").mkdir()'],
          explain: 'The folder already exists: FileExistsError. exist_ok=True would allow it.',
        },
        {
          type: 'predict', text: 'Deep folders in one go. What will it say?', code: ['from pathlib import Path', 'Path("a/b/c").mkdir(parents=True)', 'print(Path("a/b").is_dir(), Path("a/b/c").exists(), Path("a/x").exists())'],
          explain: 'parents=True made a, a/b and a/b/c.',
        },
        {
          type: 'fill', text: 'Make the folder only if it is not already there, without an error.',
          lines: ['from pathlib import Path', 'Path("saves").mkdir()', 'Path("saves").mkdir([]=True)', 'print(Path("saves").is_dir())'], chips: ['exist_ok', 'parents', 'force'], answer: [['exist_ok']],
          hints: ['"It is OK if it exists."', 'exist_ok=True'],
        },
        {
          type: 'write', vars: R => ({ w: R.pick(['rope', 'torch', 'bread']) }),
          text: 'Make a folder pack, write "$w" into pack/list.txt, then print the text read back from the file.',
          starter: ['from pathlib import Path'], keys: ['Path', '(', ')', '"pack"', '.mkdir()', 'p', '=', '/', '"list.txt"', '.write_text', '"$w"', 'print', '.read_text()'],
          require: l => (has(l, /mkdir/) && has(l, /write_text/) ? null : 'Use mkdir() and write_text().'),
          hints: ['Path("pack").mkdir()', 'p = Path("pack") / "list.txt" / p.write_text("$w") / print(p.read_text())'],
          solution: ['Path("pack").mkdir()', 'p = Path("pack") / "list.txt"', 'p.write_text("$w")', 'print(p.read_text())'],
        },
      ],
      learn: [{ title: 'Folders and files', code: 'p.exists()  p.mkdir(parents=True, exist_ok=True)\np.write_text(s)  p.read_text()', text: 'Make folders before putting files in them.' }],
    },
    {
      id: '28-3', title: 'Looking around', bg: 'archive', npc: 'dedalo', mentor: 'dedalo', tags: ['globq'],
      steps: [
        { type: 'talk', who: 'dedalo', text: 'folder.iterdir() lists everything inside a folder. folder.glob("*.txt") finds only the names that match a pattern: * means "anything". Their order is not guaranteed, so sort them.' },
        { type: 'demo', files: MAZE_FILES, text: 'The shelf shows the labyrinth. Run it.', code: ['from pathlib import Path', 'for p in sorted(Path("maps").iterdir()):', '    print(p.name)', 'print([p.name for p in sorted(Path("maps").glob("*.txt"))])'] },
        {
          type: 'predict', files: MAZE_FILES, text: 'What will it say?', code: ['from pathlib import Path', 'print(len(list(Path("maps").iterdir())))'],
          explain: 'The maps folder holds three files.',
        },
        {
          type: 'predict', files: MAZE_FILES, vars: R => ({ pat: R.pick(['*.md', '*.txt', 's*', '*.png']) }),
          text: 'What will it say?', code: ['from pathlib import Path', 'print(sorted(p.name for p in Path("maps").glob("$pat")))'],
          explain: '"$pat" matches the names that fit the pattern.',
        },
        {
          type: 'predict', files: MAZE_FILES, text: 'Folders and files mixed. What will it say?', code: ['from pathlib import Path', 'for p in sorted(Path(".").iterdir()):', '    print(p.name, p.is_dir())'],
          explain: 'The top level holds the maps folder and notes.txt.',
        },
        {
          type: 'fill', files: MAZE_FILES, text: 'Count the text files in maps.',
          lines: ['from pathlib import Path', 'texts = list(Path("maps").glob("[]"))', 'print(len(texts))'], chips: ['*.txt', '*', 'txt'], answer: [['*.txt']],
          hints: ['Anything that ends with .txt', '"*.txt"'],
        },
        {
          type: 'write', files: MAZE_FILES, text: 'Print the STEM of every file in maps whose suffix is .txt, sorted, one per line.',
          starter: ['from pathlib import Path'], keys: ['for', 'p', 'in', 'sorted', '(', ')', 'Path', '"maps"', '.glob', '"*.txt"', ':', 'print', '.stem'],
          require: l => (has(l, /\.glob\s*\(/) ? null : 'Use glob("*.txt").'),
          hints: ['for p in sorted(Path("maps").glob("*.txt")):', '    print(p.stem)'],
          solution: ['for p in sorted(Path("maps").glob("*.txt")):', '    print(p.stem)'],
        },
      ],
      learn: [{ title: 'Listing folders', code: 'sorted(folder.iterdir())\nfolder.glob("*.txt")', text: 'iterdir lists everything; glob filters with patterns like *.txt. Sort for a stable order.' }],
    },
    {
      id: '28-4', title: 'Dust mimics', bg: 'archive', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'dustmimic', hp: d0 + 3 * 6, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Dust mimics pretend to be files! $HP HP. Every real map you find hurts them.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', files: MAZE_FILES, text: 'It has $HP HP left. Cast fireball with 6 for every file in the maps folder.',
          lines: ['from pathlib import Path', 'for p in Path("maps").[]():', '    cast(fireball, 6)'], chips: ['iterdir', 'glob', 'mkdir'], answer: [['iterdir']],
          goal: { foeDown: true },
          hints: ['List everything inside the folder.', 'Path("maps").iterdir()'],
        },
        { type: 'talk', who: 'narrator', text: 'The dust queen hides in a markdown file!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 9 }),
          files: MAZE_FILES,
          spawn: v => ({ kind: 'dustmimic', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Read maps/legend.md and cast icebolt with the length of its text, twice.',
          starter: ['from pathlib import Path'], keys: ['text', '=', 'Path', '(', ')', '"maps/legend.md"', '.read_text()', 'cast', 'icebolt', ',', 'len'],
          goal: { foeDown: true },
          require: l => (has(l, /read_text/) ? null : 'Use read_text().'),
          hints: ['text = Path("maps/legend.md").read_text()', 'cast(icebolt, len(text)) twice'],
          solution: ['text = Path("maps/legend.md").read_text()', 'cast(icebolt, len(text))', 'cast(icebolt, len(text))'],
        },
      ],
      learn: [{ title: 'Files as power', code: 'Path("maps").iterdir()\np.read_text()', text: 'Count and read files to find what you need.' }],
    },
    {
      id: '28-5', title: 'The old ways', bg: 'library', npc: 'dedalo', mentor: 'dedalo', tags: ['ospath'],
      steps: [
        { type: 'talk', who: 'dedalo', text: 'Lots of older code uses the os module instead of pathlib, so a mapmaker reads both. os.path.join builds paths, os.listdir lists a folder, os.path.isfile and isdir check what something is.' },
        { type: 'demo', files: MAZE_FILES, text: 'Run it.', code: ['import os', 'print(os.path.join("maps", "north.txt"))', 'print(sorted(os.listdir("maps")))', 'print(os.path.isdir("maps"), os.path.isfile("notes.txt"))'] },
        {
          type: 'predict', vars: R => ({ f: R.pick(['report.final.pdf', 'archive.tar.gz', 'photo.png']) }),
          text: 'What will it say?', code: ['import os', 'print(os.path.splitext("$f"))'],
          explain: 'splitext cuts off only the LAST ending, as a pair: (name, ending).',
        },
        {
          type: 'predict', text: 'What will it say?', code: ['import os', 'p = "quests/north/plan.txt"', 'print(os.path.basename(p), os.path.dirname(p))'],
          explain: 'basename is the last part, dirname is everything before it.',
        },
        {
          type: 'predict', files: MAZE_FILES, text: 'What will it say?', code: ['import os', 'for name in sorted(os.listdir(".")):', '    full = os.path.join(".", name)', '    print(name, "folder" if os.path.isdir(full) else "file")'],
          explain: 'listdir gives plain names; join them back onto the folder to check them.',
        },
        {
          type: 'fill', files: MAZE_FILES, text: 'Print the size of notes.txt in bytes.',
          lines: ['import os', 'print(os.path.[]("notes.txt"))'], chips: ['getsize', 'exists', 'basename'], answer: [['getsize']],
          hints: ['Size in bytes.', 'os.path.getsize("notes.txt")'],
        },
        {
          type: 'write', files: MAZE_FILES, text: 'With os.listdir and os.path.splitext, print the sorted names in maps whose ending is ".txt".',
          starter: ['import os'], keys: ['for', 'name', 'in', 'sorted', '(', ')', 'os.listdir', '"maps"', ':', 'if', 'os.path.splitext', '[', ']', '1', '==', '".txt"', 'print'],
          require: l => (has(l, /listdir/) && has(l, /splitext/) ? null : 'Use os.listdir and os.path.splitext.'),
          hints: ['for name in sorted(os.listdir("maps")):', '    if os.path.splitext(name)[1] == ".txt": print(name)'],
          solution: ['for name in sorted(os.listdir("maps")):', '    if os.path.splitext(name)[1] == ".txt":', '        print(name)'],
        },
      ],
      learn: [{ title: 'os.path', code: 'os.path.join  os.listdir  os.path.isfile  isdir\nos.path.splitext  basename  dirname  getsize', text: 'The older toolbox for paths. Same ideas, plain strings.' }],
    },
    {
      id: '28-6', title: 'Walking the labyrinth', bg: 'tunnel', npc: 'dedalo', mentor: 'dedalo', tags: ['walk'],
      steps: [
        { type: 'talk', who: 'dedalo', text: 'os.walk(top) walks a WHOLE folder tree. For every folder it hands you three things: its path, the names of the folders inside, and the names of the files inside.' },
        { type: 'demo', files: { 'labyrinth/a.txt': 'A', 'labyrinth/west/b.txt': 'BB', 'labyrinth/west/deep/c.md': 'CCC', 'labyrinth/east/d.txt': 'D' }, text: 'Run it.', code: ['import os', 'for folder, dirs, files in os.walk("labyrinth"):', '    print(folder, dirs, files)'] },
        {
          type: 'predict', files: { 'labyrinth/a.txt': 'A', 'labyrinth/west/b.txt': 'BB', 'labyrinth/west/deep/c.md': 'CCC', 'labyrinth/east/d.txt': 'D' },
          text: 'Count every file in the tree. What will it say?', code: ['import os', 'count = 0', 'for folder, dirs, files in os.walk("labyrinth"):', '    count += len(files)', 'print(count)'],
          explain: 'os.walk visits every folder, so the counts add up to every file in the tree.',
        },
        {
          type: 'predict', files: { 'labyrinth/a.txt': 'A', 'labyrinth/west/b.txt': 'BB', 'labyrinth/west/deep/c.md': 'CCC', 'labyrinth/east/d.txt': 'D' },
          text: 'pathlib can search the whole tree too, with rglob. What will it say?', code: ['from pathlib import Path', 'print(sorted(p.name for p in Path("labyrinth").rglob("*.txt")))'],
          explain: 'rglob searches every folder below, not just the top one.',
        },
        {
          type: 'fill', files: { 'labyrinth/a.txt': 'A', 'labyrinth/west/b.txt': 'BB', 'labyrinth/west/deep/c.md': 'CCC' },
          text: 'Add up the sizes of all files in the tree. Join the folder and file name to get each path.',
          lines: ['import os', 'total = 0', 'for folder, dirs, files in os.walk("labyrinth"):', '    for name in files:', '        total += os.path.getsize(os.path.[](folder, name))', 'print(total)'], chips: ['join', 'split', 'basename'], answer: [['join']],
          hints: ['folder + "/" + name, the os way.', 'os.path.join(folder, name)'],
        },
        {
          type: 'write', files: { 'labyrinth/a.txt': 'A', 'labyrinth/west/b.md': 'BB', 'labyrinth/west/deep/c.md': 'CCC', 'labyrinth/east/d.md': 'D' },
          text: 'Print the names of all .md files anywhere in labyrinth, sorted, using Path.rglob.',
          starter: ['from pathlib import Path'], keys: ['for', 'p', 'in', 'sorted', '(', ')', 'Path', '"labyrinth"', '.rglob', '"*.md"', ':', 'print', '.name'],
          require: l => (has(l, /rglob/) ? null : 'Use rglob("*.md").'),
          hints: ['for p in sorted(Path("labyrinth").rglob("*.md")):', '    print(p.name)'],
          solution: ['for p in sorted(Path("labyrinth").rglob("*.md")):', '    print(p.name)'],
        },
      ],
      learn: [{ title: 'Walking trees', code: 'for folder, dirs, files in os.walk(top):\nPath(top).rglob("*.txt")', text: 'Visit every folder below a starting point.' }],
    },
    {
      id: '28-7', title: 'Moving house', bg: 'archive', npc: 'dedalo', mentor: 'dedalo', tags: ['shutilq'],
      steps: [
        { type: 'talk', who: 'dedalo', text: 'import shutil for the heavy lifting. shutil.copy(src, dst) copies a file; if dst is a folder, the copy keeps its name. shutil.move moves it. Path.rename renames. And Path.unlink deletes a file, with no recycle bin, so be careful!' },
        { type: 'demo', files: { 'loot/gem.txt': 'ruby', 'loot/map.txt': 'west', 'notes.txt': 'hi' }, text: 'Run it and watch the shelf.', code: ['import shutil', 'from pathlib import Path', 'Path("backup").mkdir()', 'shutil.copy("loot/gem.txt", "backup")', 'shutil.move("notes.txt", "loot/notes.txt")', 'print(sorted(p.name for p in Path("loot").iterdir()))', 'print(sorted(p.name for p in Path("backup").iterdir()))'] },
        {
          type: 'predict', files: { 'a.txt': 'x' }, text: 'What will it say?', code: ['import shutil', 'from pathlib import Path', 'shutil.copy("a.txt", "b.txt")', 'Path("a.txt").rename("c.txt")', 'print(sorted(p.name for p in Path(".").iterdir()))'],
          explain: 'The copy adds b.txt; the rename turns a.txt into c.txt.',
        },
        {
          type: 'predict', files: { 'trash/old1.log': '1', 'trash/old2.log': '2', 'trash/keep.txt': 'k' }, text: 'Cleaning up. What will it say?', code: ['from pathlib import Path', 'for p in Path("trash").glob("*.log"):', '    p.unlink()', 'print([p.name for p in Path("trash").iterdir()])'],
          explain: 'Every .log file is deleted; keep.txt stays.',
        },
        {
          type: 'fill', files: { 'scrolls/fire.txt': 'f', 'scrolls/ice.txt': 'i' }, text: 'Copy fire.txt into the vault folder.',
          lines: ['import shutil', 'from pathlib import Path', 'Path("vault").mkdir()', 'shutil.[]("scrolls/fire.txt", "vault")', 'print([p.name for p in Path("vault").iterdir()], Path("scrolls/fire.txt").exists())'], chips: ['copy', 'move', 'rmtree'], answer: [['copy']],
          hints: ['Keep the original too.', 'shutil.copy(...)'],
        },
        { type: 'talk', who: 'dedalo', text: 'Now the classic labyrinth chore: sort a messy folder into sub-folders by file type. Make a folder for each suffix and move each file into it.' },
        {
          type: 'write', files: { 'mess/a.txt': '1', 'mess/b.png': '2', 'mess/c.txt': '3', 'mess/d.md': '4' },
          text: 'For each file in mess, make a folder named after its suffix without the dot (mess/txt, mess/png...) if needed, and move the file into it. Then print the sorted names in mess/txt.',
          starter: ['import shutil', 'from pathlib import Path'], keys: ['for', 'p', 'in', 'list', '(', ')', 'Path', '"mess"', '.iterdir()', ':', 'folder', '=', '/', '.suffix', '[1:]', '.mkdir', 'exist_ok=True', 'shutil.move', 'str', 'print', 'sorted', 'x', '.name', '"mess/txt"'],
          require: l => (has(l, /shutil\.move/) && has(l, /exist_ok\s*=\s*True/) ? null : 'Use mkdir(exist_ok=True) and shutil.move.'),
          hints: ['for p in list(Path("mess").iterdir()): folder = Path("mess") / p.suffix[1:]', 'folder.mkdir(exist_ok=True) / shutil.move(str(p), str(folder)), then print the names in mess/txt'],
          solution: ['for p in list(Path("mess").iterdir()):', '    folder = Path("mess") / p.suffix[1:]', '    folder.mkdir(exist_ok=True)', '    shutil.move(str(p), str(folder))', 'print(sorted(x.name for x in Path("mess/txt").iterdir()))'],
        },
      ],
      learn: [{ title: 'Moving files', code: 'shutil.copy(src, dst)  shutil.move(src, dst)\np.rename(new)  p.unlink()  shutil.rmtree(folder)', text: 'Copy, move, rename and delete. Deleting is forever: double-check first.' }],
    },
    {
      id: '28-8', title: 'Maze bats', bg: 'tunnel', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'mazebat', hp: d0 + 2 * 4 * 3, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Maze bats roost in every corner of the labyrinth! $HP HP. Each file anywhere in the tree is a torch against them.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', files: { 'maze/a.txt': '1', 'maze/b/c.txt': '2', 'maze/b/d/e.txt': '3', 'maze/f/g.txt': '4' },
          text: 'It has $HP HP left. Walk the whole maze and cast fireball twice with 3 for every file.',
          lines: ['import os', 'for folder, dirs, files in os.[]("maze"):', '    for name in files:', '        cast(fireball, 3)', '        cast(fireball, 3)'], chips: ['walk', 'listdir', 'mkdir'], answer: [['walk']],
          goal: { foeDown: true },
          require: s => (s[0] === 'walk' ? null : 'Walk the whole tree, not just the top folder.'),
          hints: ['Visit every folder.', 'os.walk("maze")'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat king hides in the biggest file!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 8 }),
          files: { 'cave/small.txt': 'abc', 'cave/big.txt': 'abcdefgh', 'cave/mid.txt': 'abcde' },
          spawn: v => ({ kind: 'mazebat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Find the size of the biggest file in cave and cast icebolt with it, twice.',
          starter: ['import os'], keys: ['biggest', '=', 'max', '(', ')', 'os.path.getsize', 'os.path.join', '"cave"', 'n', 'for', 'in', 'os.listdir', ',', 'cast', 'icebolt'],
          goal: { foeDown: true },
          require: l => (has(l, /getsize/) ? null : 'Use os.path.getsize.'),
          hints: ['biggest = max(os.path.getsize(os.path.join("cave", n)) for n in os.listdir("cave"))', 'cast(icebolt, biggest) twice'],
          solution: ['biggest = max(os.path.getsize(os.path.join("cave", n)) for n in os.listdir("cave"))', 'cast(icebolt, biggest)', 'cast(icebolt, biggest)'],
        },
      ],
      learn: [{ title: 'Searching trees', code: 'os.walk  os.path.getsize', text: 'Find every file, then measure them.' }],
    },
    {
      id: '28-9', title: 'The Maze King', bg: 'dungeon', foe: { kind: 'mazeking', hp: 180, weak: 'fireball', resist: 'spark' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'mazeking', text: 'NO... ONE... LEAVES... MY... MAZE...' },
        { type: 'talk', who: 'narrator', text: 'The Maze King has 180 HP. Fireball lights the corridors: double damage. Spark: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Fireball is doubled.', code: ['from pathlib import Path', 'p = Path("crown") / "jewels.txt"', 'cast(fireball, len(p.stem))'],
          explain: 'The stem is "jewels": 6 letters, doubled.',
        },
        {
          type: 'fix', text: 'This should save the escape plan in the exit folder. Run it, then tap the broken line.',
          code: ['from pathlib import Path', 'plan = Path("exit") / "plan.txt"', 'plan.write_text("left, left, right")', 'print(plan.read_text())', 'cast(fireball, 9)'], bad: 1,
          options: ['Path("exit").mkdir(); plan = Path("exit") / "plan.txt"', 'plan = Path("exit") + "plan.txt"', 'plan = Path("exit/plan")'], answer: 0,
          explain: 'The exit folder must exist before a file can be written into it.',
        },
        { type: 'talk', who: 'mazeking', text: 'COUNT... MY... SCROLLS...' },
        {
          type: 'fill', files: { 'throne/a.scroll': '1', 'throne/b.scroll': '2', 'throne/c.txt': '3', 'throne/d.scroll': '4' },
          text: 'Count only the .scroll files and strike with fireball, 4 times the count.',
          lines: ['from pathlib import Path', 'n = len(list(Path("throne").glob("[]")))', 'cast(fireball, n * 4)'], chips: ['*.scroll', '*', 'scroll'], answer: [['*.scroll']],
          hints: ['Match the ending.', '"*.scroll"'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and fireball is doubled. Write the text "$HP" into power.txt with Path.write_text, read it back, turn it into a number, and cast fireball with half of it plus 1 (// 2 + 1).',
          starter: ['from pathlib import Path'], keys: ['p', '=', 'Path', '(', ')', '"power.txt"', '.write_text', '"$HP"', 'n', 'int', '.read_text()', 'cast', 'fireball', ',', '//', '2', '+', '1'],
          goal: { foeDown: true },
          require: l => (has(l, /write_text/) && has(l, /read_text/) ? null : 'Write the file, then read it back.'),
          hints: ['p = Path("power.txt") / p.write_text("$HP")', 'n = int(p.read_text()) / cast(fireball, n // 2 + 1)'],
          solution: ['p = Path("power.txt")', 'p.write_text("$HP")', 'n = int(p.read_text())', 'cast(fireball, n // 2 + 1)'],
        },
        { type: 'talk', who: 'mazeking', text: '...you... found... the... way... out...' },
      ],
      learn: [{ title: 'Labyrinth toolkit', code: 'Path  /  mkdir  iterdir  glob  rglob  os.walk  shutil', text: 'Everything from the Labyrinth of Folders.' }],
    },
  ],
};
WORLDS.push(WORLD28);

(() => {
  const { makeQ, pick } = Arena;
  Object.assign(Arena.GEN, {
    pathparts: () => { const f = pick(['map.png', 'a.tar.gz', 'spell.py']); const dot = f.lastIndexOf('.'); return makeQ(['from pathlib import Path', `p = Path("vault") / "${f}"`, 'print(p.suffix)'], [f.slice(0, dot), f.slice(f.indexOf('.'))]); },
    mkdirq: () => makeQ(['from pathlib import Path', 'Path("a/b").mkdir(parents=True)', 'print(Path("a").is_dir())'], ['False', 'Error']),
    globq: () => makeQ(['from pathlib import Path', 'Path("d").mkdir()', 'for n in ["x.txt", "y.md", "z.txt"]:', '    (Path("d") / n).write_text("")', 'print(len(list(Path("d").glob("*.txt"))))'], [3, 1]),
    ospath: () => makeQ(['import os', 'print(os.path.splitext("a.tar.gz")[1])'], ['.tar.gz', 'tar']),
    walk: () => makeQ(['import os', 'os.makedirs("t/u")', 'open("t/a.txt", "w").close()', 'open("t/u/b.txt", "w").close()', 'print(sum(len(f) for _, _, f in os.walk("t")))'], [1, 3]),
    shutilq: () => makeQ(['import shutil', 'open("a.txt", "w").close()', 'shutil.copy("a.txt", "b.txt")', 'import os', 'print(sorted(os.listdir(".")))'], ["['b.txt']", "['a.txt']"]),
  });
})();
