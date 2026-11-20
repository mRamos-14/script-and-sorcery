/* World 46: The Collector's Hoard. The collections module: Counter (counting, most_common,
   arithmetic between counts), defaultdict (grouping without KeyError, and its one trap),
   namedtuple (light records), deque (fast at both ends, maxlen windows, rotate) and
   OrderedDict, with practice choosing the right container.
   Source: our own (the collections docs; Python for Everybody's word counting, redone). */
Object.assign(EXTRA.npcs, {
  brix: { name: 'Hoardkeeper Brix', colors: ['#8a5a2b', '#f0c53a', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  hoardslime: { base: 'crystalslime', name: 'Hoard slime', pal: { G: '#e2b34a', L: '#fff1a8', D: '#8a6a1a' } },
  tallybat: { base: 'echobat', name: 'Tally bat', pal: { P: '#8a5a2b', W: '#f0c53a' } },
  hoarddragon: { base: 'dragon', name: 'The Hoard Dragon', pal: {} },
});

const WORLD46 = {
  id: 46, name: "The Collector's Hoard", topic: 'collections',
  nodes: [[50, 92], [30, 82], [68, 72], [40, 62], [66, 52], [34, 42], [62, 32], [42, 21], [54, 8]],
  levels: [
    {
      id: '46-1', title: 'Counting the hoard', bg: 'vault', npc: 'brix', mentor: 'brix', tags: ['counterq'],
      steps: [
        { type: 'talk', who: 'brix', text: 'Gold, gems, goblets! Welcome, {NAME}. You have counted things with a dict: d[x] = d.get(x, 0) + 1. Counter from collections does it in one go: Counter(iterable) counts every item.' },
        { type: 'talk', who: 'brix', text: 'A Counter is a dict underneath, with gifts: a missing item counts as 0 (no KeyError), most_common(n) lists the top n, update() adds more counts, and total() sums them all.' },
        { type: 'demo', text: 'Count the hoard. Run it.', code: ['from collections import Counter', 'loot = ["gem", "coin", "coin", "cup", "coin", "gem"]', 'c = Counter(loot)', 'print(c)', 'print(c["coin"], c["crown"])', 'print(c.most_common(2))'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(['banana', 'mississippi', 'abracadabra']) }), text: 'Counting letters. What will it say?', code: ['from collections import Counter', 'c = Counter("$w")', 'print(c.most_common(1), len(c))'],
          explain: 'most_common(1) is the single most frequent letter; len counts the distinct letters.',
        },
        {
          type: 'predict', text: 'The old way and the new way. What will it say?', code: ['from collections import Counter', 'words = "the cat and the hat and the bat".split()', 'manual = {}', 'for w in words:', '    manual[w] = manual.get(w, 0) + 1', 'print(manual == Counter(words), Counter(words).most_common(2))'],
          explain: 'Same counts either way (a Counter equals the plain dict). Ties keep the order items were first seen.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 5) }), text: 'Adding to the count. What will it say?', code: ['from collections import Counter', 'c = Counter(coin=3, gem=1)', 'c.update(["gem"] * $n)', 'c["cup"] += 2', 'print(c, c.total())'],
          explain: 'update adds counts; += on a missing item starts from 0.',
        },
        {
          type: 'predict', text: 'Missing items. What will it say?', code: ['from collections import Counter', 'c = Counter("aab")', 'print(c["z"], "z" in c, len(c))'],
          explain: 'Reading a missing item gives 0 but does NOT add it.',
        },
        {
          type: 'fill', text: 'Find the two most common treasures.',
          lines: ['from collections import Counter', 'loot = ["ring", "coin", "ring", "gem", "coin", "ring"]', 'print(Counter(loot).[](2))'], chips: ['most_common', 'total', 'update'], answer: [['most_common']],
          hints: ['The method that ranks counts.', 'most_common(2)'],
        },
        {
          type: 'write', text: 'Count the words in the sentence "gold and gems and gold and more gold" with a Counter, then print the most common word with its count (most_common(1)), and the count of "gems".',
          starter: ['from collections import Counter', 'text = "gold and gems and gold and more gold"'], keys: ['c', '=', 'Counter', '(', ')', 'text.split()', 'print', 'c.most_common', '1', ',', 'c["gems"]'],
          require: l => (has(l, /Counter\(/) ? null : 'Use a Counter.'),
          hints: ['c = Counter(text.split())', 'print(c.most_common(1), c["gems"])'],
          solution: ['c = Counter(text.split())', 'print(c.most_common(1), c["gems"])'],
        },
      ],
      learn: [{ title: 'Counter', code: 'c = Counter(items)\nc[x]            # 0 if missing\nc.most_common(3)\nc.update(more)\nc.total()', text: 'A dict that counts, with no KeyError for missing items.' }],
    },
    {
      id: '46-2', title: 'Weighing one hoard against another', bg: 'vault', npc: 'brix', mentor: 'brix', tags: ['counterops'],
      steps: [
        { type: 'talk', who: 'brix', text: 'Counters do arithmetic. a + b adds counts; a - b subtracts and DROPS anything that falls to zero or below; a & b keeps the smaller count of each (the overlap); a | b the larger. Perfect for recipes: what am I still missing?' },
        { type: 'demo', text: 'Recipe minus stock. Run it.', code: ['from collections import Counter', 'recipe = Counter(herb=3, egg=2, salt=1)', 'stock = Counter(herb=1, egg=2, salt=5)', 'print("missing:", recipe - stock)', 'print("leftover:", stock - recipe)'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 4), b: R.int(1, 4) }), text: 'What will it say?', code: ['from collections import Counter', 'mine = Counter(coin=$a, gem=2)', 'yours = Counter(coin=$b, cup=1)', 'print(mine + yours)'],
          explain: 'Counts of the same item add together.',
        },
        {
          type: 'predict', text: 'Overlap and union. What will it say?', code: ['from collections import Counter', 'a = Counter("aaab")', 'b = Counter("abbc")', 'print(a & b)', 'print(a | b)'],
          explain: '& keeps the smaller count of each, | the larger.',
        },
        {
          type: 'predict', text: 'subtract keeps the negatives. What will it say?', code: ['from collections import Counter', 'c = Counter(arrow=2)', 'c.subtract({"arrow": 5})', 'print(c, Counter(arrow=2) - Counter(arrow=5))'],
          explain: 'subtract() keeps -3; the - operator drops counts that are not positive.',
        },
        {
          type: 'predict', text: 'Back to items. What will it say?', code: ['from collections import Counter', 'c = Counter(x=2, y=1)', 'print(sorted(c.elements()), list(c.keys()))'],
          explain: 'elements() repeats each item by its count.',
        },
        {
          type: 'fill', text: 'What is still missing for the potion?',
          lines: ['from collections import Counter', 'recipe = Counter(moss=2, ash=1)', 'bag = Counter(moss=1, ash=4)', 'print(recipe [] bag)'], chips: ['-', '+', '&'], answer: [['-']],
          hints: ['Take away what you have from what you need.', 'recipe - bag'],
        },
        {
          type: 'write', text: 'You need Counter(plank=4, nail=10) to build a raft and you have Counter(plank=1, nail=12). Print what you are missing, and whether you can build it now (the missing Counter is empty: use not).',
          starter: ['from collections import Counter', 'need = Counter(plank=4, nail=10)', 'have = Counter(plank=1, nail=12)'], keys: ['missing', '=', 'need', '-', 'have', 'print', 'not', ','],
          require: l => (has(l, /need\s*-\s*have/) ? null : 'Compute need - have.'),
          hints: ['missing = need - have', 'print(missing, not missing)'],
          solution: ['missing = need - have', 'print(missing, not missing)'],
        },
      ],
      learn: [{ title: 'Counter arithmetic', code: 'a + b   a - b   a & b   a | b\nc.subtract(other)   c.elements()', text: '- drops counts that are not positive; subtract() keeps them.' }],
    },
    {
      id: '46-3', title: 'Shelves that build themselves', bg: 'archive', npc: 'brix', mentor: 'brix', tags: ['defaultdictq'],
      steps: [
        { type: 'talk', who: 'brix', text: 'Grouping things into lists usually starts with "if key not in d: d[key] = []". defaultdict(list) builds the missing shelf for you: reading a missing key CALLS the factory (list, int, set...) and stores the result.' },
        { type: 'talk', who: 'brix', text: 'The one trap: merely LOOKING with d[key] creates the key. Use key in d or d.get(key) when you only want to check.' },
        { type: 'demo', text: 'Grouping by first letter. Run it.', code: ['from collections import defaultdict', 'groups = defaultdict(list)', 'for item in ["axe", "bow", "arrow", "boot", "cloak"]:', '    groups[item[0]].append(item)', 'print(groups)', 'print(dict(groups))'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(['hello', 'banana', 'kayak']) }), text: 'Counting with int. What will it say?', code: ['from collections import defaultdict', 'n = defaultdict(int)', 'for ch in "$w":', '    n[ch] += 1', 'print(dict(n))'],
          explain: 'int() is 0, so every new letter starts at 0 before += 1.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'A plain dict cannot do that. Which error?', code: ['groups = {}', 'for item in ["axe", "bow"]:', '    groups[item[0]].append(item)'],
          explain: 'Without a default, the missing key "a" raises KeyError.',
        },
        {
          type: 'predict', text: 'The looking trap. What will it say?', code: ['from collections import defaultdict', 'd = defaultdict(list)', 'print("gold" in d, len(d))', 'print(d["gold"], len(d))', 'print(d.get("silver"), len(d))'],
          explain: 'in and get only look. d["gold"] created an empty list for "gold".',
        },
        {
          type: 'predict', text: 'A set factory and a lambda factory. What will it say?', code: ['from collections import defaultdict', 'seen = defaultdict(set)', 'for who, place in [("ann", "cave"), ("bo", "hill"), ("ann", "cave"), ("ann", "lake")]:', '    seen[who].add(place)', 'print(sorted(seen["ann"]), len(seen["bo"]))', 'label = defaultdict(lambda: "unknown")', 'label["a"] = "axe"', 'print(label["a"], label["z"])'],
          explain: 'set removes duplicate places; the lambda supplies "unknown" for any new key.',
        },
        {
          type: 'fill', text: 'Each new key should start with an empty list.',
          lines: ['from collections import defaultdict', 'by_owner = defaultdict([])', 'for owner, item in [("ann", "ring"), ("bo", "cup"), ("ann", "gem")]:', '    by_owner[owner].append(item)', 'print(dict(by_owner))'], chips: ['list', 'list()', 'int'], answer: [['list']],
          hints: ['Pass the factory itself, not a list you already made.', 'defaultdict(list)'],
        },
        {
          type: 'write', text: 'Using defaultdict(list), group the words in ["ant", "bee", "asp", "cat", "bat"] by their LAST letter. Print dict() of the result.',
          starter: ['from collections import defaultdict', 'words = ["ant", "bee", "asp", "cat", "bat"]'], keys: ['g', '=', 'defaultdict', '(', ')', 'list', 'for', 'w', 'in', 'words', ':', 'g[w[-1]]', '.append', 'print', 'dict'],
          require: l => (has(l, /defaultdict\(list\)/) ? null : 'Use defaultdict(list).'),
          hints: ['g = defaultdict(list)\nfor w in words:\n    g[w[-1]].append(w)', 'print(dict(g))'],
          solution: ['g = defaultdict(list)', 'for w in words:', '    g[w[-1]].append(w)', 'print(dict(g))'],
        },
      ],
      learn: [{ title: 'defaultdict', code: 'd = defaultdict(list)\nd[key].append(x)   # no KeyError\nkey in d           # checks without creating', text: 'Missing keys are built by the factory. Looking with d[key] creates them.' }],
    },
    {
      id: '46-4', title: 'Hoard slimes', bg: 'vault', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'hoardslime', hp: d0 + 15, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Hoard slimes ooze out of the coin piles! $HP HP. Count your weapons and strike with each count × 5.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Count the weapons and strike with each count × 5.',
          lines: ['from collections import Counter', 'weapons = ["axe", "axe", "bow"]', 'for name, n in [](weapons).items():', '    cast(fireball, n * 5)'], chips: ['Counter', 'list', 'set'], answer: [['Counter']],
          goal: { foeDown: true },
          hints: ['Make the counts.', 'Counter(weapons)'],
        },
        { type: 'talk', who: 'narrator', text: 'The slime king swells with gold!' },
        {
          type: 'write', vars: R => ({ n: R.int(3, 6) }),
          spawn: v => ({ kind: 'hoardslime', hp: v.n * 4, tint: 'big' }),
          text: 'It has $n × 4 HP. Make a defaultdict(int) called power, add $n to power["ice"] four times in a loop, then cast icebolt with power["ice"].',
          starter: ['from collections import defaultdict'], keys: ['power', '=', 'defaultdict', '(', ')', 'int', 'for', 'i', 'in', 'range', '4', ':', 'power["ice"]', '+=', '$n', 'cast', 'icebolt', ','],
          goal: { foeDown: true },
          require: l => (has(l, /defaultdict\(int\)/) ? null : 'Use defaultdict(int).'),
          hints: ['power = defaultdict(int)\nfor i in range(4):\n    power["ice"] += $n', 'cast(icebolt, power["ice"])'],
          solution: ['power = defaultdict(int)', 'for i in range(4):', '    power["ice"] += $n', 'cast(icebolt, power["ice"])'],
        },
      ],
      learn: [{ title: 'Counting in battle', code: 'for name, n in Counter(items).items(): ...', text: 'Counts become strikes.' }],
    },
    {
      id: '46-5', title: 'Records with names', bg: 'library', npc: 'brix', mentor: 'brix', tags: ['namedtupleq'],
      steps: [
        { type: 'talk', who: 'brix', text: 'A tuple (3, 4) works, but what IS item 0? namedtuple("Point", "x y") makes a tiny class: Point(3, 4) is still a tuple (index it, unpack it, compare it), but you can also write p.x and p.y.' },
        { type: 'talk', who: 'brix', text: 'Like any tuple it is immutable: p.x = 5 fails. To "change" one, _replace(x=5) makes a new record. _asdict() turns it into a dict, and defaults=[...] fills in the rightmost fields.' },
        { type: 'demo', text: 'A named record. Run it.', code: ['from collections import namedtuple', 'Item = namedtuple("Item", ["name", "value"])', 'gem = Item("ruby", 50)', 'print(gem)', 'print(gem.name, gem[1], gem == ("ruby", 50))', 'name, value = gem', 'print(value * 2)'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9) }), text: 'What will it say?', code: ['from collections import namedtuple', 'Point = namedtuple("Point", "x y")', 'p = Point($a, $b)', 'q = p._replace(y=0)', 'print(p, q, p.x + q.y)'],
          explain: '_replace builds a new Point; p is unchanged.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Changing a field. Which error?', code: ['from collections import namedtuple', 'Point = namedtuple("Point", "x y")', 'p = Point(1, 2)', 'p.x = 10'],
          explain: 'Named tuples are immutable: AttributeError (can\'t set attribute).',
        },
        {
          type: 'predict', text: 'Defaults and dicts. What will it say?', code: ['from collections import namedtuple', 'Card = namedtuple("Card", ["rank", "suit"], defaults=["hearts"])', 'print(Card("A"), Card("K", "spades").suit)', 'print(Card("Q")._asdict(), Card._fields)'],
          explain: 'The default fills the last field. _asdict gives a plain dict, _fields the names.',
        },
        {
          type: 'predict', text: 'Sorting records. What will it say?', code: ['from collections import namedtuple', 'Hero = namedtuple("Hero", "name level")', 'party = [Hero("Ada", 7), Hero("Bo", 3), Hero("Cy", 5)]', 'print([h.name for h in sorted(party, key=lambda h: h.level)])', 'print(max(party, key=lambda h: h.level).name)'],
          explain: 'Fields make sort keys readable.',
        },
        {
          type: 'fill', text: 'Read the weight field by name.',
          lines: ['from collections import namedtuple', 'Crate = namedtuple("Crate", "label weight")', 'crates = [Crate("tools", 12), Crate("food", 30)]', 'print(sum(c.[] for c in crates))'], chips: ['weight', 'label', 'value'], answer: [['weight']],
          hints: ['The field you want to add up.', 'c.weight'],
        },
        {
          type: 'write', text: 'Make a namedtuple Potion with fields name and power. Build a list of Potion("heal", 5) and Potion("fire", 9), and print the name of the most powerful one.',
          starter: ['from collections import namedtuple'], keys: ['Potion', '=', 'namedtuple', '(', ')', '"Potion"', '"name power"', ',', 'potions', '[', ']', '"heal"', '5', '"fire"', '9', 'print', 'max', 'key=lambda p: p.power', '.name'],
          require: l => (has(l, /namedtuple\(/) && has(l, /\.name/) ? null : 'Use namedtuple and read the .name field.'),
          hints: ['Potion = namedtuple("Potion", "name power")\npotions = [Potion("heal", 5), Potion("fire", 9)]', 'print(max(potions, key=lambda p: p.power).name)'],
          solution: ['Potion = namedtuple("Potion", "name power")', 'potions = [Potion("heal", 5), Potion("fire", 9)]', 'print(max(potions, key=lambda p: p.power).name)'],
        },
      ],
      learn: [{ title: 'namedtuple', code: 'P = namedtuple("P", "x y")\np = P(1, 2)\np.x  p[0]  p._replace(x=5)  p._asdict()', text: 'A tuple with field names. Immutable; _replace makes a changed copy.' }],
    },
    {
      id: '46-6', title: 'The double-ended queue', bg: 'harbor', npc: 'brix', mentor: 'brix', tags: ['dequeq'],
      steps: [
        { type: 'talk', who: 'brix', text: 'A list is fast at its END, but list.pop(0) and insert(0, x) shuffle every other item along. A deque ("deck") is fast at BOTH ends: append and appendleft, pop and popleft. It is the right shape for queues.' },
        { type: 'talk', who: 'brix', text: 'deque(maxlen=n) keeps only the last n items: adding to a full one pushes the oldest out the other side. rotate(k) turns it like a wheel.' },
        { type: 'demo', text: 'Both ends. Run it.', code: ['from collections import deque', 'line = deque(["ann", "bo"])', 'line.append("cy")', 'line.appendleft("dee")', 'print(line)', 'print(line.popleft(), line.pop(), line)'] },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 5) }), text: 'A queue: first in, first out. What will it say?', code: ['from collections import deque', 'q = deque()', 'for i in range($n):', '    q.append(i)', 'served = [q.popleft(), q.popleft()]', 'print(served, list(q))'],
          explain: 'popleft takes from the front, in arrival order.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(6, 9) }), text: 'Only the last three. What will it say?', code: ['from collections import deque', 'recent = deque(maxlen=3)', 'for i in range($n):', '    recent.append(i)', 'print(recent, len(recent))'],
          explain: 'Each append beyond 3 pushes the oldest out.',
        },
        {
          type: 'predict', text: 'Turning the wheel. What will it say?', code: ['from collections import deque', 'd = deque([1, 2, 3, 4, 5])', 'd.rotate(2)', 'print(d)', 'd.rotate(-3)', 'print(d)'],
          explain: 'rotate(2) moves the last two to the front; a negative turn goes the other way.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Serving an empty queue. Which error?', code: ['from collections import deque', 'q = deque(["ann"])', 'q.popleft()', 'q.popleft()'],
          explain: 'Nothing left to pop: IndexError (pop from an empty deque).',
        },
        {
          type: 'fill', text: 'Take the next traveller from the FRONT of the queue.',
          lines: ['from collections import deque', 'ferry = deque(["ann", "bo", "cy"])', 'while ferry:', '    print("boarding", ferry.[]())'], chips: ['popleft', 'pop', 'rotate'], answer: [['popleft']],
          hints: ['First in, first out.', 'ferry.popleft()'],
        },
        {
          type: 'write', text: 'Keep a running "last 2 moves" history: make history = deque(maxlen=2), append each move in ["north", "east", "south"], then print list(history).',
          starter: ['from collections import deque'], keys: ['history', '=', 'deque', '(', ')', 'maxlen=2', 'for', 'm', 'in', '["north", "east", "south"]', ':', '.append', 'print', 'list'],
          require: l => (has(l, /maxlen\s*=\s*2/) ? null : 'Use deque(maxlen=2).'),
          hints: ['history = deque(maxlen=2)\nfor m in ["north", "east", "south"]:\n    history.append(m)', 'print(list(history))'],
          solution: ['history = deque(maxlen=2)', 'for m in ["north", "east", "south"]:', '    history.append(m)', 'print(list(history))'],
        },
      ],
      learn: [{ title: 'deque', code: 'q = deque()\nq.append(x)  q.appendleft(x)\nq.pop()  q.popleft()\ndeque(maxlen=3)  q.rotate(1)', text: 'Fast at both ends: the shape of a queue.' }],
    },
    {
      id: '46-7', title: 'The right chest for the job', bg: 'market', npc: 'brix', mentor: 'brix', tags: ['collchoice'],
      steps: [
        { type: 'talk', who: 'brix', text: 'One more: OrderedDict. Plain dicts keep insertion order now, but OrderedDict can move_to_end(key) and popitem(last=False), handy for "least recently used" caches.' },
        { type: 'talk', who: 'brix', text: 'Choosing: counting things, Counter. Grouping into lists or sets, defaultdict. A queue or a sliding window, deque. Small fixed records, namedtuple. Order you can rearrange, OrderedDict. Everything else, a plain dict or list.' },
        { type: 'demo', text: 'A tiny LRU shelf. Run it.', code: ['from collections import OrderedDict', 'shelf = OrderedDict()', 'for book in ["atlas", "bestiary", "codex"]:', '    shelf[book] = True', 'shelf.move_to_end("atlas")', 'print(list(shelf))', 'oldest = shelf.popitem(last=False)', 'print("evicted", oldest[0], list(shelf))'] },
        {
          type: 'predict', text: 'Breadth-first through rooms with a deque. What will it say?', code: ['from collections import deque', 'doors = {"hall": ["kitchen", "stairs"], "kitchen": ["cellar"], "stairs": ["tower"], "cellar": [], "tower": []}', 'order = []', 'q = deque(["hall"])', 'while q:', '    room = q.popleft()', '    order.append(room)', '    q.extend(doors[room])', 'print(order)'],
          explain: 'A queue visits rooms level by level: hall, then its doors, then theirs.',
        },
        {
          type: 'predict', text: 'Grouping then counting. What will it say?', code: ['from collections import defaultdict, Counter', 'sales = [("ann", "gem"), ("bo", "cup"), ("ann", "gem"), ("ann", "cup")]', 'by_seller = defaultdict(list)', 'for who, item in sales:', '    by_seller[who].append(item)', 'print({who: Counter(items).most_common(1)[0][0] for who, items in by_seller.items()})'],
          explain: 'Group each seller\'s items, then count within each group.',
        },
        {
          type: 'predict', text: 'Records in a queue. What will it say?', code: ['from collections import namedtuple, deque', 'Job = namedtuple("Job", "name hours")', 'jobs = deque([Job("forge", 3), Job("mend", 1)])', 'jobs.appendleft(Job("rush", 2))', 'print([j.name for j in jobs], sum(j.hours for j in jobs))'],
          explain: 'The rush job jumps to the front; the hours add up.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['red', 'blue']) }), text: 'Which is quicker to write? What will it say?', code: ['from collections import Counter', 'votes = ["red", "blue", "red", "green", "red", "blue"]', 'tally = Counter(votes)', 'winner, n = tally.most_common(1)[0]', 'print(winner, n, tally["$w"])'],
          explain: 'One Counter replaces a whole counting loop.',
        },
        {
          type: 'fill', text: 'Pick the container that counts.',
          lines: ['from collections import Counter, deque, defaultdict', 'rolls = [6, 2, 6, 3, 6, 2]', 'print([](rolls).most_common(2))'], chips: ['Counter', 'deque', 'defaultdict'], answer: [['Counter']],
          hints: ['You want counts ranked.', 'Counter(rolls)'],
        },
        {
          type: 'write', text: 'Process the orders queue (a deque) one by one from the front. Count how many of each item was served with a Counter, and print the Counter at the end.',
          starter: ['from collections import deque, Counter', 'orders = deque(["tea", "pie", "tea", "tea"])', 'served = Counter()'], keys: ['while', 'orders', ':', 'item', '=', 'orders.popleft()', 'served', '[item]', '+=', '1', 'print'],
          require: l => (has(l, /popleft/) ? null : 'Serve from the front with popleft.'),
          hints: ['while orders:\n    item = orders.popleft()\n    served[item] += 1', 'print(served)'],
          solution: ['while orders:', '    item = orders.popleft()', '    served[item] += 1', 'print(served)'],
        },
      ],
      learn: [{ title: 'Choosing a container', code: 'count: Counter   group: defaultdict   queue: deque\nrecord: namedtuple   reorder: OrderedDict', text: 'Match the container to the shape of the job.' }],
    },
    {
      id: '46-8', title: 'Tally bats', bg: 'cave', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'tallybat', hp: d0 + 18, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Tally bats circle, screeching numbers! $HP HP. Fire the arrows from the back of the quiver.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. The quiver keeps only its last two arrows. Fire them all.',
          lines: ['from collections import deque', 'quiver = deque(maxlen=[])', 'for power in [2, 8, 10]:', '    quiver.append(power)', 'while quiver:', '    cast(fireball, quiver.pop())'], chips: ['2', '1', '0'], answer: [['2']],
          goal: { foeDown: true },
          hints: ['Keep two arrows: 8 and 10.', 'maxlen=2'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat queen counts your mistakes!' },
        {
          type: 'write', vars: R => ({ n: R.int(4, 8) }),
          spawn: v => ({ kind: 'tallybat', hp: v.n * 3, tint: 'big' }),
          text: 'It has $n × 3 HP. Make a namedtuple Bolt with field power, build a list of three Bolt($n), and cast icebolt with each bolt\'s power.',
          starter: ['from collections import namedtuple'], keys: ['Bolt', '=', 'namedtuple', '(', ')', '"Bolt"', '"power"', ',', 'bolts', '[', ']', '*', '3', 'for', 'b', 'in', ':', 'cast', 'icebolt', 'b.power', '$n'],
          goal: { foeDown: true },
          require: l => (has(l, /\.power/) ? null : 'Read each bolt\'s .power field.'),
          hints: ['Bolt = namedtuple("Bolt", "power")\nbolts = [Bolt($n)] * 3', 'for b in bolts:\n    cast(icebolt, b.power)'],
          solution: ['Bolt = namedtuple("Bolt", "power")', 'bolts = [Bolt($n)] * 3', 'for b in bolts:', '    cast(icebolt, b.power)'],
        },
      ],
      learn: [{ title: 'Collections in battle', code: 'deque(maxlen=2)   Bolt(5).power', text: 'The right container makes the strike simple.' }],
    },
    {
      id: '46-9', title: 'The Hoard Dragon', bg: 'geode', foe: { kind: 'hoarddragon', hp: 200, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'hoarddragon', text: 'I KNOW EVERY COIN IN MY HOARD. EVERY ONE. COUNT THEM IF YOU DARE.' },
        { type: 'talk', who: 'narrator', text: 'The Hoard Dragon has 200 HP. Icebolt cracks its scales: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Icebolt is doubled.', code: ['from collections import Counter', 'scales = Counter("gold gold gem gold".split())', 'cast(icebolt, scales["gold"] * 4)'],
          explain: 'Three golds × 4 = 12, doubled.',
        },
        {
          type: 'fix', text: 'This grouping crashes. Run it, then tap the broken line.',
          code: ['from collections import defaultdict', 'by_kind = dict()', 'for kind, power in [("ice", 4), ("ice", 3), ("fire", 1)]:', '    by_kind[kind].append(power)', 'cast(icebolt, sum(by_kind["ice"]))'], bad: 1,
          options: ['by_kind = defaultdict(list)', 'by_kind = defaultdict(int)', 'by_kind = defaultdict()'], answer: 0,
          explain: 'defaultdict(list) builds an empty list for each new kind.',
        },
        { type: 'talk', who: 'hoarddragon', text: 'MY CLAWS STRIKE FROM BOTH SIDES!' },
        {
          type: 'fill', text: 'Strike with the item at the FRONT of the deque.',
          lines: ['from collections import deque', 'claws = deque([9, 1, 1])', 'cast(icebolt, claws.[]())'], chips: ['popleft', 'pop', 'rotate'], answer: [['popleft']],
          hints: ['The front, not the back.', 'claws.popleft()'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Make a Counter of the word "hoard" repeated ($HP // 2 + 1) times (a list: ["hoard"] * ($HP // 2 + 1)), and cast icebolt with its count of "hoard".',
          starter: ['from collections import Counter'], keys: ['c', '=', 'Counter', '(', ')', '["hoard"]', '*', '$HP', '//', '2', '+', '1', 'cast', 'icebolt', ',', 'c["hoard"]'],
          goal: { foeDown: true },
          require: l => (has(l, /Counter\(/) ? null : 'Use a Counter.'),
          hints: ['c = Counter(["hoard"] * ($HP // 2 + 1))', 'cast(icebolt, c["hoard"])'],
          solution: ['c = Counter(["hoard"] * ($HP // 2 + 1))', 'cast(icebolt, c["hoard"])'],
        },
        { type: 'talk', who: 'hoarddragon', text: '...you... counted... true... the hoard... is... yours...' },
      ],
      learn: [{ title: 'Collections toolkit', code: 'Counter   defaultdict   namedtuple   deque   OrderedDict', text: 'Everything from the Collector\'s Hoard.' }],
    },
  ],
};
WORLDS.push(WORLD46);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    counterq: () => { const w = pick(['apple', 'letter', 'balloon']); return makeQ(['from collections import Counter', `c = Counter("${w}")`, 'print(c.most_common(1)[0][1], c["z"])'], ['1 0', '2 None', 'KeyError']); },
    counterops: () => { const a = rnd(2, 5), b = rnd(1, 6); return makeQ(['from collections import Counter', `print(Counter(x=${a}) - Counter(x=${b}))`], a > b ? [`Counter({'x': ${b - a}})`, 'Counter()', `Counter({'x': ${a + b}})`] : [`Counter({'x': ${a - b}})`, "Counter({'x': 0})", `Counter({'x': ${a + b}})`]); },
    defaultdictq: () => makeQ(['from collections import defaultdict', 'd = defaultdict(list)', 'd["a"]', 'print(len(d), "b" in d)'], ['0 False', '1 True', 'KeyError']),
    namedtupleq: () => { const a = rnd(1, 9), b = rnd(1, 9); return makeQ(['from collections import namedtuple', 'P = namedtuple("P", "x y")', `p = P(${a}, ${b})`, 'print(p.y, p == (' + a + ', ' + b + '))'], [`${a} True`, `${b} False`, 'AttributeError']); },
    dequeq: () => { const n = rnd(4, 7); return makeQ(['from collections import deque', 'd = deque(maxlen=2)', `for i in range(${n}):`, '    d.append(i)', 'print(list(d))'], [`[0, 1]`, `[${n - 1}]`, `[${n - 2}, ${n - 1}, ${n}]`]); },
    collchoice: () => makeQ(['from collections import deque', 'q = deque([1, 2, 3])', 'q.append(q.popleft())', 'print(list(q))'], ['[1, 2, 3]', '[3, 1, 2]', '[2, 3]']),
  });
})();
