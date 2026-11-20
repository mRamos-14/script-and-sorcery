/* World 47: The Archetype Forge. dataclasses: generated __init__/__repr__/__eq__, defaults and
   the field-order rule, the mutable-default trap and field(default_factory=...), __post_init__,
   frozen and ordered dataclasses, replace and asdict. Enum: named choices, name/value, lookup
   by value and name, iteration, auto(), methods, aliases and @unique, enums in match.
   Source: our own (the dataclasses and enum docs, PEP 557, PEP 435). */
Object.assign(EXTRA.npcs, {
  orla: { name: 'Forgemaster Orla', colors: ['#b06a3a', '#3a2a14', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  moldgolem: { base: 'construct', name: 'Mold golem', pal: { S: '#8a6a4a', G: '#5fd3ff' } },
  enumsprite: { base: 'sparkbot', name: 'Choice sprite', pal: { S: '#7d4fc9', Y: '#ffd75f' } },
  archetype: { base: 'colossus', name: 'The Archetype', pal: {} },
});

const WORLD47 = {
  id: 47, name: 'The Archetype Forge', topic: 'dataclasses and Enum',
  nodes: [[50, 92], [70, 82], [36, 72], [62, 62], [32, 52], [66, 42], [40, 32], [62, 21], [50, 8]],
  levels: [
    {
      id: '47-1', title: 'Molds without the toil', bg: 'forge', npc: 'orla', mentor: 'orla', tags: ['dcbasics'],
      steps: [
        { type: 'talk', who: 'orla', text: 'Welcome to the forge, {NAME}. How many times have you written def __init__(self, name, hp): self.name = name; self.hp = hp... then __repr__, then __eq__? A data class does it for you.' },
        { type: 'talk', who: 'orla', text: 'Put @dataclass on a class and list its fields with type hints: name: str, hp: int = 100. Python writes __init__ (in that order, with those defaults), a readable __repr__, and an __eq__ that compares the fields.' },
        { type: 'demo', text: 'One mold, many heroes. Run it.', code: ['from dataclasses import dataclass', '@dataclass', 'class Hero:', '    name: str', '    hp: int = 100', 'a = Hero("Ada")', 'b = Hero("Bo", 80)', 'print(a, b)', 'print(a == Hero("Ada", 100), a.hp + b.hp)'] },
        {
          type: 'predict', text: 'The hand-written version. What will it say?', code: ['class Hero:', '    def __init__(self, name, hp=100):', '        self.name = name', '        self.hp = hp', 'a = Hero("Ada")', 'print(a == Hero("Ada"), a.name)'],
          explain: 'Without __eq__, two objects are equal only if they are the SAME object. The dataclass gave us __eq__ for free.',
        },
        {
          type: 'predict', vars: R => ({ x: R.int(1, 9), y: R.int(1, 9) }), text: 'What will it say?', code: ['from dataclasses import dataclass', '@dataclass', 'class Point:', '    x: int', '    y: int = 0', 'p = Point($x, y=$y)', 'q = Point($x)', 'print(p, q, p == q)'],
          explain: 'The repr lists the fields; equality compares every field.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'A missing field. Which error?', code: ['from dataclasses import dataclass', '@dataclass', 'class Hero:', '    name: str', '    hp: int', 'Hero("Ada")'],
          explain: 'hp has no default, so the generated __init__ needs it: TypeError.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'A field without a default after one with. Which error?', code: ['from dataclasses import dataclass', '@dataclass', 'class Hero:', '    name: str = "nobody"', '    hp: int', 'print(Hero("Ada", 5))'],
          explain: 'Like def f(a=1, b), required parameters cannot follow defaults: TypeError when the class is made.',
        },
        {
          type: 'fill', text: 'Turn the class into a data class.',
          lines: ['from dataclasses import dataclass', '[]', 'class Gem:', '    kind: str', '    carats: int', 'print(Gem("ruby", 3))'], chips: ['@dataclass', '@property', '@staticmethod'], answer: [['@dataclass']],
          hints: ['The decorator from dataclasses.', '@dataclass'],
        },
        {
          type: 'write', text: 'Make a dataclass Sword with fields name (str) and damage (int, default 10). Print Sword("Fang") and whether Sword("Fang", 10) == Sword("Fang").',
          starter: ['from dataclasses import dataclass'], keys: ['@dataclass', 'class', 'Sword', ':', 'name', 'damage', 'str', 'int', '=', '10', 'print', '(', ')', '"Fang"', '==', ','],
          require: l => (has(l, /@dataclass/) && has(l, /damage:\s*int\s*=\s*10/) ? null : 'Use @dataclass and damage: int = 10.'),
          hints: ['@dataclass\nclass Sword:\n    name: str\n    damage: int = 10', 'print(Sword("Fang"), Sword("Fang", 10) == Sword("Fang"))'],
          solution: ['@dataclass', 'class Sword:', '    name: str', '    damage: int = 10', 'print(Sword("Fang"), Sword("Fang", 10) == Sword("Fang"))'],
        },
      ],
      learn: [{ title: '@dataclass', code: '@dataclass\nclass Hero:\n    name: str\n    hp: int = 100', text: 'Writes __init__, __repr__ and __eq__ from the fields. Defaults come last.' }],
    },
    {
      id: '47-2', title: 'Fields with care', bg: 'forge', npc: 'orla', mentor: 'orla', tags: ['dcfield'],
      steps: [
        { type: 'talk', who: 'orla', text: 'A mutable default like bag: list = [] would be SHARED by every object: the old default-argument trap. Data classes refuse it with a ValueError. Instead write bag: list = field(default_factory=list): each object gets its own new list.' },
        { type: 'talk', who: 'orla', text: '__post_init__(self) runs right after the generated __init__: use it to check values or compute extra fields. field(init=False) marks a field that __init__ does not take, so __post_init__ can fill it.' },
        { type: 'demo', text: 'A fresh list each time. Run it.', code: ['from dataclasses import dataclass, field', '@dataclass', 'class Pack:', '    owner: str', '    items: list = field(default_factory=list)', 'a = Pack("Ada")', 'b = Pack("Bo")', 'a.items.append("rope")', 'print(a, b)'] },
        {
          type: 'predict', measure: 'errtype', text: 'A plain list default. Which error?', code: ['from dataclasses import dataclass', '@dataclass', 'class Pack:', '    owner: str', '    items: list = []'],
          explain: 'Data classes reject mutable defaults: ValueError (use default_factory).',
        },
        {
          type: 'predict', vars: R => ({ w: R.int(2, 6), h: R.int(2, 6) }), text: 'A computed field. What will it say?', code: ['from dataclasses import dataclass, field', '@dataclass', 'class Room:', '    width: int', '    depth: int', '    area: int = field(init=False)', '    def __post_init__(self):', '        self.area = self.width * self.depth', 'r = Room($w, $h)', 'print(r, r.area)'],
          explain: '__post_init__ fills area after the generated __init__ runs.',
        },
        {
          type: 'predict', text: 'Checking values. What will it say?', code: ['from dataclasses import dataclass', '@dataclass', 'class Potion:', '    name: str', '    dose: int', '    def __post_init__(self):', '        if self.dose <= 0:', '            raise ValueError("dose must be positive")', 'print(Potion("heal", 2))', 'try:', '    Potion("poison", 0)', 'except ValueError as e:', '    print("rejected:", e)'],
          explain: '__post_init__ can refuse bad values right when the object is made.',
        },
        {
          type: 'predict', text: 'Hiding a field from repr. What will it say?', code: ['from dataclasses import dataclass, field', '@dataclass', 'class Account:', '    user: str', '    password: str = field(repr=False)', 'print(Account("ada", "hunter2"))'],
          explain: 'repr=False keeps the field out of the printed form.',
        },
        {
          type: 'fill', text: 'Give every quiver its own list of arrows.',
          lines: ['from dataclasses import dataclass, field', '@dataclass', 'class Quiver:', '    arrows: list = field([]=list)', 'a = Quiver()', 'b = Quiver()', 'a.arrows.append("fire")', 'print(a.arrows, b.arrows)'], chips: ['default_factory', 'default', 'init'], answer: [['default_factory']],
          hints: ['A factory called once per object.', 'field(default_factory=list)'],
        },
        {
          type: 'write', text: 'Make a dataclass Recipe with name (str) and steps (a list, via field(default_factory=list)), plus count: int = field(init=False) set in __post_init__ to len(self.steps). Print Recipe("tea", ["boil", "steep"]).count and Recipe("air").steps.',
          starter: ['from dataclasses import dataclass, field'], keys: ['@dataclass', 'class', 'Recipe', ':', 'name', 'str', 'steps', 'list', '=', 'field', '(', ')', 'default_factory=list', 'count', 'int', 'init=False', 'def', '__post_init__', 'self', 'self.count', 'len', 'self.steps', 'print', '"tea"', '["boil", "steep"]', '.count', '"air"', '.steps', ','],
          require: l => (has(l, /default_factory\s*=\s*list/) && has(l, /__post_init__/) ? null : 'Use field(default_factory=list) and __post_init__.'),
          hints: ['@dataclass\nclass Recipe:\n    name: str\n    steps: list = field(default_factory=list)\n    count: int = field(init=False)', '    def __post_init__(self):\n        self.count = len(self.steps)\nprint(Recipe("tea", ["boil", "steep"]).count, Recipe("air").steps)'],
          solution: ['@dataclass', 'class Recipe:', '    name: str', '    steps: list = field(default_factory=list)', '    count: int = field(init=False)', '    def __post_init__(self):', '        self.count = len(self.steps)', 'print(Recipe("tea", ["boil", "steep"]).count, Recipe("air").steps)'],
        },
      ],
      learn: [{ title: 'field and __post_init__', code: 'items: list = field(default_factory=list)\narea: int = field(init=False)\ndef __post_init__(self): ...', text: 'Never a mutable default. Compute or check fields in __post_init__.' }],
    },
    {
      id: '47-3', title: 'Frozen and ordered', bg: 'foundry', npc: 'orla', mentor: 'orla', tags: ['dcfrozen'],
      steps: [
        { type: 'talk', who: 'orla', text: '@dataclass(frozen=True) casts the object in iron: assigning to a field raises FrozenInstanceError. Frozen data classes are also HASHABLE, so they can be dict keys and set members. (A normal data class with __eq__ is not hashable.)' },
        { type: 'talk', who: 'orla', text: '@dataclass(order=True) adds <, <=, >, >= comparing the fields in order, like tuples, so sorted() just works. replace(obj, field=new) makes a changed copy, and asdict(obj) turns it into a dict.' },
        { type: 'demo', text: 'Iron and order. Run it.', code: ['from dataclasses import dataclass, replace, asdict', '@dataclass(frozen=True, order=True)', 'class Coin:', '    value: int', '    metal: str', 'coins = [Coin(5, "silver"), Coin(1, "copper"), Coin(5, "gold")]', 'print(sorted(coins))', 'print(replace(coins[0], metal="tin"), asdict(coins[1]))', 'print({Coin(1, "copper"): "found"}[Coin(1, "copper")])'] },
        {
          type: 'predict', text: 'Changing frozen iron. What will it say?', code: ['from dataclasses import dataclass, FrozenInstanceError', '@dataclass(frozen=True)', 'class Rune:', '    mark: str', 'r = Rune("fire")', 'try:', '    r.mark = "ice"', 'except FrozenInstanceError as e:', '    print("frozen:", e)', 'print(r)'],
          explain: 'Frozen fields cannot be assigned; the rune is unchanged.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'A normal data class as a dict key. Which error?', code: ['from dataclasses import dataclass', '@dataclass', 'class Spot:', '    x: int', 'seen = {Spot(1): True}'],
          explain: 'With __eq__ but not frozen, the class is unhashable: TypeError.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 5), b: R.int(6, 9) }), text: 'Ordered by fields, in order. What will it say?', code: ['from dataclasses import dataclass', '@dataclass(order=True)', 'class Rank:', '    level: int', '    name: str', 'print(Rank($a, "zed") < Rank($b, "amy"), Rank(3, "amy") < Rank(3, "bo"))', 'print(max([Rank($a, "x"), Rank($b, "y")]).name)'],
          explain: 'level is compared first; only on a tie does name decide.',
        },
        {
          type: 'predict', vars: R => ({ h: R.int(10, 50) }), text: 'replace and asdict. What will it say?', code: ['from dataclasses import dataclass, replace, asdict', '@dataclass', 'class Hero:', '    name: str', '    hp: int', 'a = Hero("Ada", 100)', 'b = replace(a, hp=$h)', 'print(a.hp, b.hp, asdict(b))'],
          explain: 'replace builds a new object; a keeps its hp.',
        },
        {
          type: 'fill', text: 'Let sorted() order the trophies.',
          lines: ['from dataclasses import dataclass', '@dataclass([]=True)', 'class Trophy:', '    points: int', '    name: str', 'print([t.name for t in sorted([Trophy(9, "cup"), Trophy(2, "pin")])])'], chips: ['order', 'frozen', 'repr'], answer: [['order']],
          hints: ['The option that adds < and >.', '@dataclass(order=True)'],
        },
        {
          type: 'write', text: 'Make a frozen dataclass Tile with x and y (ints). Put Tile(0, 0) and Tile(0, 1) in a set called visited, add Tile(0, 0) again, and print len(visited).',
          starter: ['from dataclasses import dataclass'], keys: ['@dataclass', '(', ')', 'frozen=True', 'class', 'Tile', ':', 'x', 'y', 'int', 'visited', '=', '{', '}', 'Tile(0, 0)', 'Tile(0, 1)', ',', '.add', 'print', 'len'],
          require: l => (has(l, /frozen\s*=\s*True/) ? null : 'Freeze it so it can live in a set.'),
          hints: ['@dataclass(frozen=True)\nclass Tile:\n    x: int\n    y: int', 'visited = {Tile(0, 0), Tile(0, 1)}\nvisited.add(Tile(0, 0))\nprint(len(visited))'],
          solution: ['@dataclass(frozen=True)', 'class Tile:', '    x: int', '    y: int', 'visited = {Tile(0, 0), Tile(0, 1)}', 'visited.add(Tile(0, 0))', 'print(len(visited))'],
        },
      ],
      learn: [{ title: 'frozen, order, replace', code: '@dataclass(frozen=True, order=True)\nreplace(obj, field=new)\nasdict(obj)', text: 'Frozen: unchangeable and hashable. Order: compares fields like a tuple.' }],
    },
    {
      id: '47-4', title: 'Mold golems', bg: 'foundry', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'moldgolem', hp: d0 + 16, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Half-cast mold golems lurch off the anvils! $HP HP. Forge your strikes from a data class.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Strike with each blade\'s damage.',
          lines: ['from dataclasses import dataclass', '@dataclass', 'class Blade:', '    name: str', '    damage: int = 8', 'for b in [Blade("fang"), Blade("claw")]:', '    cast(fireball, b.[])'], chips: ['damage', 'name', '8()'], answer: [['damage']],
          goal: { foeDown: true },
          hints: ['The field holding the strike power.', 'b.damage'],
        },
        { type: 'talk', who: 'narrator', text: 'The great mold lifts a hammer of slag!' },
        {
          type: 'write', vars: R => ({ n: R.int(5, 9) }),
          spawn: v => ({ kind: 'moldgolem', hp: v.n * 2, tint: 'big' }),
          text: 'It has $n × 2 HP. Make a dataclass Frost with field power: int = $n. Make two Frost() objects and cast icebolt with each one\'s power.',
          starter: ['from dataclasses import dataclass'], keys: ['@dataclass', 'class', 'Frost', ':', 'power', 'int', '=', '$n', 'for', 'f', 'in', '[Frost(), Frost()]', 'cast', 'icebolt', '(', ')', ',', 'f.power'],
          goal: { foeDown: true },
          require: l => (has(l, /@dataclass/) && has(l, /\.power/) ? null : 'Use @dataclass and read .power.'),
          hints: ['@dataclass\nclass Frost:\n    power: int = $n', 'for f in [Frost(), Frost()]:\n    cast(icebolt, f.power)'],
          solution: ['@dataclass', 'class Frost:', '    power: int = $n', 'for f in [Frost(), Frost()]:', '    cast(icebolt, f.power)'],
        },
      ],
      learn: [{ title: 'Data classes in battle', code: 'Blade("fang").damage', text: 'Defaults forge the strike.' }],
    },
    {
      id: '47-5', title: 'Named choices', bg: 'library', npc: 'orla', mentor: 'orla', tags: ['enumbasics'],
      steps: [
        { type: 'talk', who: 'orla', text: 'Some values are one of a fixed set: a direction, a rune colour, a quest state. Using strings like "nroth" lets typos slip through. An Enum gives each choice a NAME: class Dir(Enum): NORTH = 1; SOUTH = 2. Misspell Dir.NROTH and Python stops you with AttributeError.' },
        { type: 'talk', who: 'orla', text: 'Each member has .name and .value. Look one up by value with Dir(1) or by name with Dir["NORTH"]. You can loop over the enum, and len() counts its members. Compare members with is or ==.' },
        { type: 'demo', text: 'Named choices. Run it.', code: ['from enum import Enum', 'class Rune(Enum):', '    FIRE = 1', '    ICE = 2', '    STORM = 3', 'print(Rune.ICE, repr(Rune.ICE))', 'print(Rune.ICE.name, Rune.ICE.value)', 'print(Rune(3), Rune["FIRE"], len(Rune))'] },
        {
          type: 'predict', vars: R => ({ v: R.int(1, 3) }), text: 'What will it say?', code: ['from enum import Enum', 'class Rune(Enum):', '    FIRE = 1', '    ICE = 2', '    STORM = 3', 'r = Rune($v)', 'print(r.name, r is Rune($v), [m.name for m in Rune])'],
          explain: 'Rune($v) finds the member with that value; there is only ever one of each.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'A typo in a member name. Which error?', code: ['from enum import Enum', 'class Dir(Enum):', '    NORTH = 1', '    SOUTH = 2', 'print(Dir.NROTH)'],
          explain: 'Enums catch typos: AttributeError.',
        },
        {
          type: 'predict', text: 'A member is not its value. What will it say?', code: ['from enum import Enum', 'class Dir(Enum):', '    NORTH = 1', '    SOUTH = 2', 'print(Dir.NORTH == 1, Dir.NORTH.value == 1, Dir.NORTH == Dir(1))'],
          explain: 'A plain Enum member never equals a bare number; compare .value, or compare members.',
        },
        {
          type: 'predict', text: 'Looking up a value that is not there. What will it say?', code: ['from enum import Enum', 'class Size(Enum):', '    SMALL = 1', '    LARGE = 3', 'for v in [3, 2]:', '    try:', '        print(Size(v))', '    except ValueError as e:', '        print("no:", e)'],
          explain: 'Size(2) has no member: ValueError (2 is not a valid Size).',
        },
        {
          type: 'fill', text: 'Look the rune up by its name.',
          lines: ['from enum import Enum', 'class Rune(Enum):', '    FIRE = 1', '    ICE = 2', 'chosen = "ICE"', 'print(Rune[].value)'], chips: ['[chosen]', '(chosen)', '.chosen'], answer: [['[chosen]']],
          hints: ['By name uses square brackets.', 'Rune[chosen]'],
        },
        {
          type: 'write', text: 'Make an Enum Day with MON = 1, TUE = 2 and WED = 3. Print every member\'s name in a loop, then print Day(2).',
          starter: ['from enum import Enum'], keys: ['class', 'Day', '(', ')', ':', 'Enum', 'MON', 'TUE', 'WED', '=', '1', '2', '3', 'for', 'd', 'in', 'print', 'd.name'],
          require: l => (has(l, /class Day\(Enum\)/) ? null : 'Define class Day(Enum).'),
          hints: ['class Day(Enum):\n    MON = 1\n    TUE = 2\n    WED = 3', 'for d in Day:\n    print(d.name)\nprint(Day(2))'],
          solution: ['class Day(Enum):', '    MON = 1', '    TUE = 2', '    WED = 3', 'for d in Day:', '    print(d.name)', 'print(Day(2))'],
        },
      ],
      learn: [{ title: 'Enum', code: 'class Dir(Enum):\n    NORTH = 1\nDir.NORTH.name   Dir.NORTH.value\nDir(1)   Dir["NORTH"]   list(Dir)', text: 'Named, fixed choices. Typos fail loudly.' }],
    },
    {
      id: '47-6', title: 'Enums with powers', bg: 'library', npc: 'orla', mentor: 'orla', tags: ['enumpower'],
      steps: [
        { type: 'talk', who: 'orla', text: 'auto() numbers the members for you when the values do not matter. An Enum is a class, so it can have METHODS that use self.name and self.value. Two names with the same value make an ALIAS of the first; @unique forbids that.' },
        { type: 'demo', text: 'auto and a method. Run it.', code: ['from enum import Enum, auto', 'class Dir(Enum):', '    NORTH = auto()', '    EAST = auto()', '    SOUTH = auto()', '    WEST = auto()', '    def turn_right(self):', '        members = list(Dir)', '        return members[(members.index(self) + 1) % len(members)]', 'print(Dir.NORTH.value, Dir.WEST.value)', 'print(Dir.WEST.turn_right(), Dir.EAST.turn_right())'] },
        {
          type: 'predict', vars: R => ({ s: R.pick(['NORTH', 'EAST', 'SOUTH', 'WEST']) }), text: 'What will it say?', code: ['from enum import Enum, auto', 'class Dir(Enum):', '    NORTH = auto()', '    EAST = auto()', '    SOUTH = auto()', '    WEST = auto()', '    def opposite(self):', '        return Dir((self.value + 1) % 4 + 1)', 'print(Dir.$s.opposite())'],
          explain: 'Values 1..4; adding 2 (wrapping round) gives the opposite direction.',
        },
        {
          type: 'predict', text: 'An alias. What will it say?', code: ['from enum import Enum', 'class Mood(Enum):', '    HAPPY = 1', '    GLAD = 1', '    SAD = 2', 'print(Mood.GLAD, Mood.GLAD is Mood.HAPPY, len(Mood), [m.name for m in Mood])'],
          explain: 'GLAD is just another name for HAPPY. Aliases are not listed when you iterate.',
        },
        {
          type: 'predict', measure: 'errtype', text: '@unique refuses aliases. Which error?', code: ['from enum import Enum, unique', '@unique', 'class Mood(Enum):', '    HAPPY = 1', '    GLAD = 1'],
          explain: 'Duplicate values: ValueError.',
        },
        {
          type: 'predict', vars: R => ({ s: R.pick(['IDLE', 'RUNNING', 'DONE']) }), text: 'Enums in match and as dict keys. What will it say?', code: ['from enum import Enum', 'class State(Enum):', '    IDLE = "idle"', '    RUNNING = "running"', '    DONE = "done"', 'icons = {State.IDLE: "-", State.RUNNING: ">", State.DONE: "+"}', 's = State.$s', 'match s:', '    case State.DONE:', '        print("finished", icons[s])', '    case _:', '        print("not yet", icons[s], s.value)'],
          explain: 'Members work as case patterns (with the dotted name) and as dict keys.',
        },
        {
          type: 'fill', text: 'Let Python pick the numbers.',
          lines: ['from enum import Enum, auto', 'class Gem(Enum):', '    RUBY = []', '    OPAL = auto()', 'print(Gem.RUBY.value, Gem.OPAL.value)'], chips: ['auto()', 'auto', '0'], answer: [['auto()']],
          hints: ['Call it, like the line below.', 'auto()'],
        },
        {
          type: 'write', text: 'Make an Enum Coin with COPPER = 1, SILVER = 10, GOLD = 100, and a method worth(self, n) returning self.value * n. Print Coin.SILVER.worth(3) and the name of the coin whose value is 100.',
          starter: ['from enum import Enum'], keys: ['class', 'Coin', '(', ')', ':', 'Enum', 'COPPER', 'SILVER', 'GOLD', '=', '1', '10', '100', 'def', 'worth', 'self', 'n', ',', 'return', 'self.value', '*', 'print', 'Coin.SILVER.worth', '3', 'Coin(100)', '.name'],
          require: l => (has(l, /def worth/) ? null : 'Give Coin a worth method.'),
          hints: ['class Coin(Enum):\n    COPPER = 1\n    SILVER = 10\n    GOLD = 100\n    def worth(self, n):\n        return self.value * n', 'print(Coin.SILVER.worth(3), Coin(100).name)'],
          solution: ['class Coin(Enum):', '    COPPER = 1', '    SILVER = 10', '    GOLD = 100', '    def worth(self, n):', '        return self.value * n', 'print(Coin.SILVER.worth(3), Coin(100).name)'],
        },
      ],
      learn: [{ title: 'Richer enums', code: 'A = auto()\ndef method(self): ... self.value\n@unique\ncase State.DONE:', text: 'auto numbers members; enums can have methods; @unique bans aliases.' }],
    },
    {
      id: '47-7', title: 'Archetypes together', bg: 'forge', npc: 'orla', mentor: 'orla', tags: ['dcenum'],
      steps: [
        { type: 'talk', who: 'orla', text: 'The two work beautifully together: an Enum names the choices, a data class holds the record. A Quest with a status: Status field reads clearly, and the status can only ever be one of the real states.' },
        { type: 'demo', text: 'Records with named states. Run it.', code: ['from dataclasses import dataclass', 'from enum import Enum', 'class Status(Enum):', '    OPEN = 1', '    DONE = 2', '@dataclass', 'class Quest:', '    title: str', '    status: Status = Status.OPEN', 'qs = [Quest("dragon"), Quest("herbs", Status.DONE)]', 'print(qs[0])', 'print([q.title for q in qs if q.status is Status.OPEN])'] },
        {
          type: 'predict', text: 'A little state machine. What will it say?', code: ['from enum import Enum', 'class Light(Enum):', '    RED = 1', '    GREEN = 2', '    AMBER = 3', 'NEXT = {Light.RED: Light.GREEN, Light.GREEN: Light.AMBER, Light.AMBER: Light.RED}', 'state = Light.RED', 'seen = []', 'for i in range(4):', '    seen.append(state.name)', '    state = NEXT[state]', 'print(seen)'],
          explain: 'The dict maps each state to the next; after AMBER it wraps to RED.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 3) }), text: 'Sorting by an enum\'s value. What will it say?', code: ['from dataclasses import dataclass', 'from enum import Enum', 'class Rank(Enum):', '    SQUIRE = 1', '    KNIGHT = 2', '    LORD = 3', '@dataclass', 'class Member:', '    name: str', '    rank: Rank', 'court = [Member("Pip", Rank.LORD), Member("Ada", Rank($a)), Member("Bo", Rank.SQUIRE)]', 'print([m.name for m in sorted(court, key=lambda m: m.rank.value)])'],
          explain: 'Plain enums do not compare with <, so sort by .value.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Comparing members with <. Which error?', code: ['from enum import Enum', 'class Rank(Enum):', '    SQUIRE = 1', '    LORD = 3', 'print(Rank.SQUIRE < Rank.LORD)'],
          explain: 'Enum members have no order: TypeError. Compare their values instead.',
        },
        {
          type: 'predict', text: 'Counting states. What will it say?', code: ['from collections import Counter', 'from enum import Enum', 'class Status(Enum):', '    OPEN = 1', '    DONE = 2', 'log = [Status.OPEN, Status.DONE, Status.DONE, Status.OPEN, Status.DONE]', 'c = Counter(s.name for s in log)', 'print(c["DONE"], c.most_common(1))'],
          explain: 'Count the names: three DONE, two OPEN.',
        },
        {
          type: 'fill', text: 'Keep only the finished quests.',
          lines: ['from dataclasses import dataclass', 'from enum import Enum', 'class Status(Enum):', '    OPEN = 1', '    DONE = 2', '@dataclass', 'class Quest:', '    title: str', '    status: Status', 'qs = [Quest("a", Status.DONE), Quest("b", Status.OPEN)]', 'print([q.title for q in qs if q.status is Status.[]])'], chips: ['DONE', 'OPEN', 'value'], answer: [['DONE']],
          hints: ['Finished means...', 'Status.DONE'],
        },
        {
          type: 'write', text: 'Make an Enum Element (FIRE = 1, WATER = 2) and a dataclass Spell with name: str and element: Element. Make Spell("blaze", Element.FIRE) and print its element\'s name and the spell itself.',
          starter: ['from dataclasses import dataclass', 'from enum import Enum'], keys: ['class', 'Element', '(', ')', ':', 'Enum', 'FIRE', 'WATER', '=', '1', '2', '@dataclass', 'Spell', 'name', 'str', 'element', 's', '"blaze"', 'Element.FIRE', ',', 'print', 's.element.name'],
          require: l => (has(l, /class Element\(Enum\)/) && has(l, /@dataclass/) ? null : 'Define Element(Enum) and a @dataclass Spell.'),
          hints: ['class Element(Enum):\n    FIRE = 1\n    WATER = 2\n@dataclass\nclass Spell:\n    name: str\n    element: Element', 's = Spell("blaze", Element.FIRE)\nprint(s.element.name, s)'],
          solution: ['class Element(Enum):', '    FIRE = 1', '    WATER = 2', '@dataclass', 'class Spell:', '    name: str', '    element: Element', 's = Spell("blaze", Element.FIRE)', 'print(s.element.name, s)'],
        },
      ],
      learn: [{ title: 'Together', code: '@dataclass\nclass Quest:\n    title: str\n    status: Status = Status.OPEN', text: 'Enums name the choices; data classes hold the records.' }],
    },
    {
      id: '47-8', title: 'Choice sprites', bg: 'gearworks', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'enumsprite', hp: d0 + 6, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Choice sprites flicker between colours! $HP HP. Each rune\'s value is its power.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Strike with every rune\'s value.',
          lines: ['from enum import Enum', 'class Rune(Enum):', '    LOW = 1', '    MID = 2', '    HIGH = 3', 'for r in Rune:', '    cast(fireball, r.[])'], chips: ['value', 'name', 'Rune'], answer: [['value']],
          goal: { foeDown: true },
          hints: ['The number behind each name.', 'r.value'],
        },
        { type: 'talk', who: 'narrator', text: 'The sprite queen chooses... you!' },
        {
          type: 'write', vars: R => ({ n: R.int(6, 12) }),
          spawn: v => ({ kind: 'enumsprite', hp: v.n * 2, tint: 'big' }),
          text: 'It has $n × 2 HP. Make an Enum Power with BOLT = $n. Look the member up by its name (Power["BOLT"]) and cast icebolt with its value, twice.',
          starter: ['from enum import Enum'], keys: ['class', 'Power', '(', ')', ':', 'Enum', 'BOLT', '=', '$n', 'p', 'Power["BOLT"]', 'cast', 'icebolt', ',', 'p.value'],
          goal: { foeDown: true },
          require: l => (has(l, /Power\["BOLT"\]/) ? null : 'Look it up with Power["BOLT"].'),
          hints: ['class Power(Enum):\n    BOLT = $n\np = Power["BOLT"]', 'cast(icebolt, p.value)\ncast(icebolt, p.value)'],
          solution: ['class Power(Enum):', '    BOLT = $n', 'p = Power["BOLT"]', 'cast(icebolt, p.value)', 'cast(icebolt, p.value)'],
        },
      ],
      learn: [{ title: 'Enums in battle', code: 'for r in Rune: cast(fireball, r.value)', text: 'Every member, by value.' }],
    },
    {
      id: '47-9', title: 'The Archetype', bg: 'foundry', foe: { kind: 'archetype', hp: 200, weak: 'fireball', resist: 'spark' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'archetype', text: 'I AM THE MOLD OF ALL MOLDS. EVERY FORM YOU MAKE, I MADE FIRST.' },
        { type: 'talk', who: 'narrator', text: 'The Archetype has 200 HP. Fireball melts its mold: double damage. Spark: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Fireball is doubled.', code: ['from dataclasses import dataclass', '@dataclass(order=True)', 'class Ore:', '    weight: int', 'cast(fireball, max([Ore(4), Ore(11), Ore(7)]).weight)'],
          explain: 'order=True lets max compare by weight: 11, doubled.',
        },
        {
          type: 'fix', text: 'The forge refuses this mold. Run it, then tap the broken line.',
          code: ['from dataclasses import dataclass, field', '@dataclass', 'class Anvil:', '    marks: list = []', 'a = Anvil()', 'a.marks.append(9)', 'cast(fireball, sum(a.marks))'], bad: 3,
          options: ['    marks: list = field(default_factory=list)', '    marks: list = field(default=[])', '    marks: list = list'], answer: 0,
          explain: 'A mutable default must come from default_factory.',
        },
        { type: 'talk', who: 'archetype', text: 'THEN NAME MY FORMS!' },
        {
          type: 'fill', text: 'Look the form up by its value.',
          lines: ['from enum import Enum', 'class Form(Enum):', '    STONE = 3', '    IRON = 8', 'cast(fireball, Form([]).value)'], chips: ['8', '"IRON"', 'IRON'], answer: [['8']],
          hints: ['Calling the enum looks up by VALUE.', 'Form(8)'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and fireball is doubled. Make a frozen dataclass Strike with power: int, build Strike($HP // 2 + 1), and cast fireball with its power.',
          starter: ['from dataclasses import dataclass'], keys: ['@dataclass', '(', ')', 'frozen=True', 'class', 'Strike', ':', 'power', 'int', 's', '=', '$HP', '//', '2', '+', '1', 'cast', 'fireball', ',', 's.power'],
          goal: { foeDown: true },
          require: l => (has(l, /frozen\s*=\s*True/) ? null : 'Make it frozen.'),
          hints: ['@dataclass(frozen=True)\nclass Strike:\n    power: int', 's = Strike($HP // 2 + 1)\ncast(fireball, s.power)'],
          solution: ['@dataclass(frozen=True)', 'class Strike:', '    power: int', 's = Strike($HP // 2 + 1)', 'cast(fireball, s.power)'],
        },
        { type: 'talk', who: 'archetype', text: '...a new form... stronger than mine...' },
      ],
      learn: [{ title: 'Forge toolkit', code: '@dataclass   field(default_factory=...)   __post_init__   frozen   order   Enum   auto()', text: 'Everything from the Archetype Forge.' }],
    },
  ],
};
WORLDS.push(WORLD47);

(() => {
  const { makeQ, pick, rnd } = Arena;
  const DC = ['from dataclasses import dataclass', '@dataclass', 'class P:', '    x: int', '    y: int = 0'];
  Object.assign(Arena.GEN, {
    dcbasics: () => { const a = rnd(1, 9); return makeQ([...DC, `print(P(${a}), P(${a}) == P(${a}, 0))`], [`P(${a}) True`, `P(x=${a}, y=0) False`, 'TypeError']); },
    dcfield: () => makeQ(['from dataclasses import dataclass, field', '@dataclass', 'class B:', '    items: list = field(default_factory=list)', 'a, b = B(), B()', 'a.items.append(1)', 'print(b.items)'], ['[1]', 'None', 'ValueError']),
    dcfrozen: () => makeQ(['from dataclasses import dataclass', '@dataclass(frozen=True)', 'class T:', '    x: int', 'print(len({T(1), T(1), T(2)}))'], ['3', '1', 'TypeError']),
    enumbasics: () => { const v = rnd(1, 3); return makeQ(['from enum import Enum', 'class C(Enum):', '    R = 1', '    G = 2', '    B = 3', `print(C(${v}).name, C(${v}) == ${v})`], [`${'RGB'[v - 1]} True`, `C.${'RGB'[v - 1]} False`, 'ValueError']); },
    enumpower: () => makeQ(['from enum import Enum, auto', 'class D(Enum):', '    A = auto()', '    B = auto()', '    C = auto()', 'print(D.C.value, len(D))'], ['2 3', '3 2', 'C 3']),
    dcenum: () => makeQ(['from enum import Enum', 'class S(Enum):', '    ON = 1', '    OFF = 0', 'nxt = {S.ON: S.OFF, S.OFF: S.ON}', 's = S.ON', 'for i in range(3):', '    s = nxt[s]', 'print(s.name)'], ['ON', 'S.OFF', 'KeyError']),
  });
})();
