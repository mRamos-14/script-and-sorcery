/* The full path: 51 worlds in 9 acts. Every topic gets its own world.
   Sources: CS50P (Harvard), Py4E (Python for Everybody), MIT 6.100L, ATBS (Automate the
   Boring Stuff), plus extra worlds of our own (gotchas, debugging, data structures).
   Worlds whose files are not built yet appear on the map as "being built" and never
   block the path. This file loads after every world file and puts WORLDS in order. */
const ACTS = [
  [1, 'Act I · First steps'], [7, 'Act II · Collections'], [11, 'Act III · Functions, errors and files'],
  [16, 'Act IV · Thinking in algorithms'], [21, 'Act V · Objects'], [26, 'Act VI · Practical Python'],
  [33, 'Act VII · Data and the web'], [39, 'Act VIII · Advanced Python'], [50, 'Act IX · Mastery'],
];
const ROADMAP = [
  [1, 'Starter Village', 'print, variables and input', 'CS50P'],
  [2, 'The Counting House', 'numbers: int, float, operators and rounding', 'Py4E · MIT · CS50P', 'bg-map5.jpg', 'hue-rotate(40deg)'],
  [3, 'Whispering Library', 'strings in depth', 'CS50P'],
  [4, 'The Scriptorium', 'indexing, slicing and parsing text', 'Py4E', 'bg-map2.jpg', 'hue-rotate(200deg)'],
  [5, 'Crossroads Forest', 'if, elif, else and match', 'CS50P'],
  [6, 'Echo Caves', 'for and while loops', 'CS50P · Py4E'],
  [7, 'Merchant Town', 'lists', 'CS50P · Py4E'],
  [8, 'The Twin Isles', 'tuples, unpacking, enumerate and zip', 'Py4E', 'bg-map6.jpg', 'hue-rotate(120deg)'],
  [9, 'Trading Port', 'dictionaries', 'CS50P · Py4E'],
  [10, 'The Prism Gardens', 'sets and set operations', 'Py4E · ours', 'bg-map16.jpg', 'hue-rotate(250deg)'],
  [11, 'Mage Tower', 'functions', 'CS50P · MIT'],
  [12, 'The Hall of Echoes', 'scope, docstrings and clean functions', 'MIT', 'bg-map7.jpg', 'hue-rotate(160deg)'],
  [13, 'Trap Dungeon', 'errors and try/except', 'CS50P'],
  [14, 'The Ancient Archive', 'files', 'CS50P · Py4E'],
  [15, 'The Hall of Mirrors', 'gotchas and Pythonic idioms', 'ours', 'bg-map12.jpg', 'hue-rotate(290deg)'],
  [16, 'The Spiral Depths', 'recursion', 'MIT', 'bg-map4.jpg', 'hue-rotate(80deg)'],
  [17, 'The Guessing Halls', 'guess-and-check, bisection and approximation', 'MIT', 'bg-map8.jpg', 'hue-rotate(210deg)'],
  [18, 'The Measuring Tower', 'efficiency, Big-O and searching', 'MIT', 'bg-map7.jpg', 'hue-rotate(60deg)'],
  [19, 'The Sorting Spire', 'sorting algorithms', 'MIT', 'bg-map12.jpg', 'hue-rotate(120deg)'],
  [20, 'The Memory Vaults', 'memoization and dynamic programming', 'MIT 6.0002', 'bg-map9.jpg', 'hue-rotate(240deg)'],
  [21, 'The Golem Forge', 'classes and objects', 'CS50P · MIT · Py4E'],
  [22, 'The Bloodline Keep', 'inheritance and special methods', 'CS50P · MIT'],
  [23, 'The Clockwork Citadel', 'properties, class methods and composition', 'CS50P'],
  [24, "The Builder's Yard", 'stacks, queues and linked lists', 'ours · MIT 6.0002', 'bg-map10.jpg', 'hue-rotate(180deg)'],
  [25, 'The Rootwood', 'trees and graphs', 'MIT 6.0002', 'bg-map3.jpg', 'hue-rotate(260deg)'],
  [26, 'The Great Bazaar', 'libraries and modules', 'CS50P'],
  [27, 'The Sundial Plaza', 'dates and times', 'ATBS', 'bg-map17.jpg', 'hue-rotate(320deg)'],
  [28, 'The Labyrinth of Folders', 'paths, folders and file tools', 'ATBS', 'bg-map9.jpg', 'hue-rotate(100deg)'],
  [29, 'The Pattern Marsh', 'regular expressions', 'CS50P · Py4E · ATBS'],
  [30, "The Copyist's Guild", 'text processing in practice', 'Py4E · ATBS', 'bg-map2.jpg', 'hue-rotate(90deg)'],
  [31, 'The Watchtower', 'debugging, logging and assert', 'ATBS · MIT · ours', 'bg-map8.jpg', 'hue-rotate(320deg)'],
  [32, 'The Proving Grounds', 'testing', 'CS50P · MIT'],
  [33, 'The Ledger Hall', 'CSV and JSON in depth', 'Py4E · ATBS', 'bg-map13.jpg', 'hue-rotate(200deg)'],
  [34, 'The Root Library', 'XML', 'Py4E', 'bg-map9.jpg', 'hue-rotate(320deg)'],
  [35, 'The Vault of Records', 'databases and SQL', 'Py4E', 'bg-map11.jpg', 'hue-rotate(160deg)'],
  [36, 'The Web of Tables', 'relational data and JOIN', 'Py4E', 'bg-map11.jpg', 'hue-rotate(280deg)'],
  [37, 'The Sky Post', 'the web, HTTP and APIs', 'Py4E · CS50P', 'bg-map16.jpg', 'hue-rotate(60deg)'],
  [38, "The Spider's Lair", 'web scraping and HTML', 'Py4E · ATBS', 'bg-map14.jpg', 'hue-rotate(150deg)'],
  [39, 'The Skyward Gardens', 'lambda, map, filter and sorting keys', 'CS50P'],
  [40, 'The Shifting Sands', 'flexible functions and type hints', 'CS50P'],
  [41, 'The River of Time', 'iterators, generators and comprehensions', 'CS50P'],
  [42, 'The Nesting Woods', 'closures', 'ours', 'bg-map3.jpg', 'hue-rotate(140deg)'],
  [43, "The Enchanter's Workshop", 'decorators', 'ours', 'bg-map7.jpg', 'hue-rotate(260deg)'],
  [44, 'The Sealed Chambers', 'context managers', 'ours', 'bg-map8.jpg', 'hue-rotate(100deg)'],
  [45, 'The Court of Exceptions', 'custom exceptions', 'ours · CS50P', 'bg-map15.jpg', 'hue-rotate(200deg)'],
  [46, "The Collector's Hoard", 'collections: Counter, defaultdict, namedtuple, deque', 'ours', 'bg-map6.jpg', 'hue-rotate(300deg)'],
  [47, 'The Archetype Forge', 'dataclasses and Enum', 'ours', 'bg-map10.jpg', 'hue-rotate(90deg)'],
  [48, 'The Loom of Fate', 'itertools', 'ours', 'bg-map18.jpg', 'hue-rotate(120deg)'],
  [49, "The Alchemist's Tools", 'functools', 'ours', 'bg-map13.jpg', 'hue-rotate(100deg)'],
  [50, 'The Gauntlet', 'capstone projects', 'Py4E · fCC · ours', 'bg-map15.jpg', 'hue-rotate(330deg)'],
  [51, 'The Heart of Code', 'the final trial', 'everything', 'bg-map18.jpg', 'hue-rotate(250deg)'],
];
(function () {
  const have = new Map(WORLDS.map(w => [w.id, w]));
  for (const [id, name, topic, src, map, filter] of ROADMAP) {
    const act = ACTS.filter(a => a[0] <= id).pop()[1];
    const w = have.get(id);
    if (w) {
      Object.assign(w, { act, src });
      if (!w.map) Object.assign(w, { map: map || 'bg-map.jpg', mapFilter: filter || '' });
    }
    else WORLDS.push({ id, name, topic, act, src, soon: true, map: map || 'bg-map.jpg', mapFilter: filter || '', nodes: [], levels: [] });
  }
  WORLDS.sort((a, b) => a.id - b.id);
})();
