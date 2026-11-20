/* World 23: The Clockwork Citadel. Class attributes, @property and setters with checks,
   @classmethod and @staticmethod, composition, debugging objects. Ends with the review
   boss 12-R, The Grand Automaton (Worlds 10 to 12). */
const PARTS = ['gear', 'spring', 'cog', 'piston', 'valve', 'lever'];

const WORLD23 = {
  id: 23, name: 'The Clockwork Citadel', topic: 'properties, class methods and composition', map: 'bg-map12.jpg',
  nodes: [[50, 93], [26, 84], [70, 76], [32, 67], [70, 58], [28, 49], [70, 40], [32, 30], [64, 20], [50, 8]],
  levels: [
    {
      id: '23-1', title: 'Shared gears', bg: 'citadel', npc: 'artificer', mentor: 'artificer', tags: ['classattr'],
      steps: [
        { type: 'talk', who: 'artificer', text: "I'm Artificer Quinn, keeper of the Citadel's clocks. A jar written inside the class, outside any method, is a class attribute. Every object shares it." },
        { type: 'demo', vars: R => ({ k: R.int(2, 4) }), text: 'Run it. Every automaton built adds one to the shared count.', code: ['class Automaton:', '    count = 0', '    def __init__(self):', '        Automaton.count += 1', 'for i in range($k):', '    Automaton()', 'print(Automaton.count)'] },
        {
          type: 'predict', vars: R => ({ w: R.int(2, 6) }), text: 'Shared until you give one its own. What will it say?',
          code: ['class Bot:', '    wheels = $w', 'a = Bot()', 'b = Bot()', 'a.wheels = 9', 'print(a.wheels, b.wheels, Bot.wheels)'],
          wrong: ['9 9 9', '9 9 $w'],
          explain: 'a.wheels = 9 gives a its own attribute. b still reads the shared class value.',
        },
        {
          type: 'predict', vars: R => ({ k: R.int(2, 5), t: R.int(2, 5) }), text: 'A shared list. What will it say?',
          code: ['class Clock:', '    log = list()', '    def tick(self):', '        self.log.append("tick")', 'a = Clock()', 'b = Clock()', 'for i in range($k):', '    a.tick()', 'for i in range($t):', '    b.tick()', 'print(len(a.log))'],
          explain: 'Both clocks share one list on the class, so it holds all $(k + t) ticks. A list per object belongs in __init__.',
        },
        {
          type: 'fill', vars: R => ({ k: R.int(2, 5) }), text: 'Count how many gears were made.',
          lines: ['class Gear:', '    made = 0', '    def __init__(self):', '        [].made += 1', 'for i in range($k):', '    Gear()', 'print(Gear.[])'],
          chips: ['Gear', 'self', 'made', 'count'], answer: [['Gear', 'made']],
          hints: ['Change the class attribute through the class name.', 'Gear.made += 1, then print(Gear.made)'],
        },
        {
          type: 'write', vars: R => ({ k: R.int(2, 5) }), text: 'Give Spring a class attribute total = 0. Its __init__ should add 1 to Spring.total. Build $k springs in a loop and print Spring.total.',
          starter: [], keys: ['class', 'Spring', ':', 'total', '=', '0', 'def', '__init__', '(self):', 'Spring.total', '+=', '1', 'for', 'i', 'in', 'range($k)', 'Spring()', 'print'],
          require: l => (has(l, /^\s+total\s*=\s*0/m) && has(l, /Spring\.total\s*\+=/) ? null : 'Put total = 0 in the class and add to Spring.total in __init__.'),
          hints: ['class Spring: / total = 0 / def __init__(self): / Spring.total += 1', 'for i in range($k): / Spring()  then print(Spring.total)'],
          solution: ['class Spring:', '    total = 0', '    def __init__(self):', '        Spring.total += 1', 'for i in range($k):', '    Spring()', 'print(Spring.total)'],
        },
      ],
      learn: [{ title: 'Class attributes', code: 'class Bot:\n    count = 0', text: 'Written in the class body, shared by all objects. Per-object values go in __init__.' }],
    },
    {
      id: '23-2', title: 'Computed dials', bg: 'citadel', npc: 'warden2', mentor: 'warden2', tags: ['property'],
      steps: [
        { type: 'talk', who: 'warden2', text: "Warden Pell. Some values should be worked out, not stored. Put @property above a method and it is read like an attribute: no brackets." },
        { type: 'demo', vars: R => ({ c: R.int(0, 40) }), text: 'Run it. f is calculated fresh each time.', code: ['class Thermo:', '    def __init__(self, c):', '        self.c = c', '    @property', '    def f(self):', '        return self.c * 9 / 5 + 32', 't = Thermo($c)', 'print(t.f)', 't.c = 100', 'print(t.f)'] },
        {
          type: 'predict', vars: R => ({ w: R.int(2, 9), h: R.int(2, 9) }), text: 'What will it say?',
          code: ['class Panel:', '    def __init__(self, w, h):', '        self.w = w', '        self.h = h', '    @property', '    def area(self):', '        return self.w * self.h', 'p = Panel($w, $h)', 'p.w += 1', 'print(p.area)'],
          explain: 'area is computed when read: ($w + 1) * $h = $((w + 1) * h).',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ w: R.int(2, 9) }), text: 'A property without a setter. Which error will this cause?',
          code: ['class Panel:', '    def __init__(self, w):', '        self.w = w', '    @property', '    def double(self):', '        return self.w * 2', 'p = Panel($w)', 'p.double = 5'],
          explain: 'A plain @property can be read but not assigned: AttributeError.',
        },
        {
          type: 'fill', vars: R => ({ a: R.pick(['Ada', 'Quinn', 'Pell']), b: R.pick(['Clock', 'Gear', 'Brass']) }), text: 'Make full_name readable without brackets.',
          lines: ['class Smith:', '    def __init__(self, first, last):', '        self.first = first', '        self.last = last', '    []', '    def full_name(self):', '        return self.first + " " + self.last', 's = Smith("$a", "$b")', 'print(s.[])'],
          chips: ['@property', '@staticmethod', 'full_name', 'full_name()'], answer: [['@property', 'full_name']],
          hints: ['@property goes on the line above def.', 'Read it like an attribute: s.full_name'],
        },
        {
          type: 'write', vars: R => ({ h: R.int(10, 80), m: R.int(81, 120) }), text: 'Give Golem a property percent that returns self.hp * 100 // self.max_hp. Then print the percent of Golem($h, $m).',
          starter: ['class Golem:', '    def __init__(self, hp, max_hp):', '        self.hp = hp', '        self.max_hp = max_hp'], keys: ['@property', 'def', 'percent', '(self):', 'return', 'self.hp', '*', '100', '//', 'self.max_hp', 'g', '=', 'Golem($h, $m)', 'print', 'g.percent'],
          require: l => (has(l, /@property/) && has(l, /\.percent\b(?!\()/) ? null : 'Use @property and read g.percent without brackets.'),
          hints: ['    @property / def percent(self):', '        return self.hp * 100 // self.max_hp  then  g = Golem($h, $m) and print(g.percent)'],
          solution: ['    @property', '    def percent(self):', '        return self.hp * 100 // self.max_hp', 'g = Golem($h, $m)', 'print(g.percent)'],
        },
      ],
      learn: [{ title: '@property', code: '@property\ndef area(self):\n    return self.w * self.h', text: 'A method read like an attribute, without brackets. Always up to date.' }],
    },
    {
      id: '23-3', title: 'Guarded values', bg: 'citadel', npc: 'warden2', mentor: 'warden2', tags: ['setter'],
      steps: [
        { type: 'talk', who: 'warden2', text: 'A setter guards the gate. Store the real value as self._hp, then @hp.setter runs every time someone writes obj.hp = ..., so you can refuse bad values.' },
        { type: 'demo', vars: R => ({ h: R.int(20, 50) }), text: 'Run it. The setter refuses a negative hp.', code: ['class Golem:', '    def __init__(self, hp):', '        self.hp = hp', '    @property', '    def hp(self):', '        return self._hp', '    @hp.setter', '    def hp(self, value):', '        if value < 0:', '            raise ValueError("hp cannot be negative")', '        self._hp = value', 'g = Golem($h)', 'print(g.hp)', 'try:', '    g.hp = -5', 'except ValueError as e:', '    print("refused:", e)'] },
        {
          type: 'predict', vars: R => ({ h: R.int(20, 50), x: R.int(51, 200) }), text: 'This setter clamps instead of refusing. What will it say?',
          code: ['class Dial:', '    def __init__(self):', '        self._level = 0', '    @property', '    def level(self):', '        return self._level', '    @level.setter', '    def level(self, v):', '        self._level = min(v, 50)', 'd = Dial()', 'd.level = $h', 'a = d.level', 'd.level = $x', 'print(a, d.level)'],
          explain: 'The setter keeps the level at 50 or less.',
        },
        {
          type: 'predict', vars: R => ({ v: R.pick([-3, -1, 0]) }), text: 'The setter even runs inside __init__. What will it say?',
          code: ['class Gem:', '    def __init__(self, carats):', '        self.carats = carats', '    @property', '    def carats(self):', '        return self._carats', '    @carats.setter', '    def carats(self, v):', '        if v <= 0:', '            raise ValueError("too small")', '        self._carats = v', 'try:', '    Gem($v)', '    print("made")', 'except ValueError:', '    print("rejected")'],
          explain: 'self.carats = carats in __init__ goes through the setter, which raises for $v.',
        },
        {
          type: 'fix', vars: R => ({ h: R.int(10, 40) }), text: 'This setter calls itself forever. Run it, then tap the broken line.',
          code: ['class Golem:', '    def __init__(self, hp):', '        self.hp = hp', '    @property', '    def hp(self):', '        return self._hp', '    @hp.setter', '    def hp(self, value):', '        self.hp = value', 'print(Golem($h).hp)'], bad: 8,
          options: ['        self._hp = value', '        hp = value', '        self.hp = self._hp'], answer: 0,
          explain: 'Writing self.hp inside the hp setter calls the setter again, forever. Store the real value in self._hp.',
        },
        {
          type: 'write', vars: R => ({ n: R.int(1, 99) }), text: 'Finish the setter for name: raise ValueError("name required") if the value is an empty string, otherwise store it in self._name. Then print(Smith("Quinn").name).',
          starter: ['class Smith:', '    def __init__(self, name):', '        self.name = name', '    @property', '    def name(self):', '        return self._name'],
          keys: ['@name.setter', 'def', 'name', '(self, value):', 'if', 'value', '==', '""', ':', 'raise', 'ValueError', '("name required")', 'self._name', '=', 'print', 'Smith("Quinn")', '.name'],
          require: l => (has(l, /@name\.setter/) && has(l, /raise\s+ValueError/) ? null : 'Use @name.setter and raise ValueError for an empty name.'),
          hints: ['    @name.setter / def name(self, value): / if value == "":', '            raise ValueError("name required") / self._name = value, then print(Smith("Quinn").name)'],
          solution: ['    @name.setter', '    def name(self, value):', '        if value == "":', '            raise ValueError("name required")', '        self._name = value', 'print(Smith("Quinn").name)'],
        },
      ],
      learn: [{ title: 'Setters', code: '@hp.setter\ndef hp(self, value):\n    self._hp = value', text: 'Runs on every obj.hp = value. Check the value, then store it in a hidden _hp.' }],
    },
    {
      id: '23-4', title: 'Guard bots', bg: 'gearworks', mentor: 'narrator', tags: [],
      foe: R => ({ kind: 'gearbot', hp: 64, weak: 'spark' }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'Guard bots patrol the gearworks! Your staff has a charge dial. A property turns the charge into spell power.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ c: R.int(4, 8) }), text: 'How much damage will this deal? Spark is doubled.',
          code: ['class Staff:', '    def __init__(self, charge):', '        self.charge = charge', '    @property', '    def power(self):', '        return self.charge * 2', 's = Staff($c)', 'cast(spark, s.power)'],
          explain: 'power is $c * 2 = $(c * 2), doubled by spark to $(c * 4).',
        },
        {
          type: 'fill', vars: R => ({ c: R.int(4, 7) }), text: 'Charge the staff with the setter, then cast with its power.',
          lines: ['class Staff:', '    def __init__(self):', '        self._charge = 0', '    @property', '    def charge(self):', '        return self._charge', '    @charge.setter', '    def charge(self, v):', '        self._charge = min(v, 10)', 's = Staff()', 's.[] = $c', 'cast(spark, s.charge * [])'],
          chips: ['charge', '_hp', '2', '"2"'], answer: [['charge', '2']],
          hints: ['Set the charge through the property.', 'Multiply by the number 2.'],
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Finish the bot! $HP HP left, spark is doubled. Set s.charge = $q and cast spark with s.charge.',
          starter: ['class Staff:', '    def __init__(self):', '        self._charge = 0', '    @property', '    def charge(self):', '        return self._charge', '    @charge.setter', '    def charge(self, v):', '        self._charge = v', 's = Staff()'],
          keys: ['s.charge', '=', '$q', 'cast', '(', ')', 'spark', ','], goal: { foeDown: true },
          require: l => (has(l, /s\.charge\s*=/) ? null : 'Set s.charge first.'),
          hints: ['s.charge = $q', 'cast(spark, s.charge)'],
          solution: ['s.charge = $q', 'cast(spark, s.charge)'],
        },
      ],
      learn: [{ title: 'Properties in battle', code: 's.charge = 5\ncast(spark, s.power)', text: 'Properties look like plain attributes, but run code behind the scenes.' }],
    },
    {
      id: '23-5', title: 'Other ways to build', bg: 'citadel', npc: 'artificer', mentor: 'artificer', tags: ['clsmethod'],
      steps: [
        { type: 'talk', who: 'artificer', text: '@classmethod makes a method that gets the class itself as cls, not an object. It is perfect for other ways to build objects, like from a text record.' },
        { type: 'demo', vars: R => ({ n: R.pick(PARTS), w: R.int(1, 20) }), text: 'Run it.', code: ['class Part:', '    def __init__(self, name, weight):', '        self.name = name', '        self.weight = weight', '    @classmethod', '    def from_text(cls, text):', '        name, weight = text.split(":")', '        return cls(name, int(weight))', 'p = Part.from_text("$n:$w")', 'print(p.name, p.weight + 1)'] },
        {
          type: 'predict', vars: R => ({ k: R.int(2, 4) }), text: 'A factory method. What will it say?',
          code: ['class Gear:', '    def __init__(self, teeth):', '        self.teeth = teeth', '    @classmethod', '    def small(cls):', '        return cls(8)', '    @classmethod', '    def big(cls):', '        return cls(40)', 'gears = [Gear.small()] * $k + [Gear.big()]', 'print(sum(g.teeth for g in gears))'],
          explain: '$k small gears of 8 plus one big gear of 40: $(8 * k + 40).',
        },
        {
          type: 'predict', text: 'cls is whichever class called it. What will it say?',
          code: ['class Bot:', '    @classmethod', '    def make(cls):', '        return cls()', 'class Drone(Bot):', '    pass', 'print(type(Drone.make()).__name__, type(Bot.make()).__name__)'],
          explain: 'Drone.make() passes Drone as cls, so it builds a Drone.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(1, 30), b: R.int(1, 30) }), text: 'Build a Pair from text like "3,4".',
          lines: ['class Pair:', '    def __init__(self, a, b):', '        self.a = a', '        self.b = b', '    []', '    def parse(cls, text):', '        x, y = text.split(",")', '        return [](int(x), int(y))', 'p = Pair.parse("$a,$b")', 'print(p.a + p.b)'],
          chips: ['@classmethod', '@property', 'cls', 'self'], answer: [['@classmethod', 'cls']],
          hints: ['parse gets the class as cls, so it needs @classmethod.', 'return cls(int(x), int(y))'],
        },
        {
          type: 'write', vars: R => ({ n: R.pick(['Ada', 'Quinn', 'Pell', 'Iva']), l: R.int(1, 30) }), text: 'Add a classmethod from_record(cls, text) that splits "name-level" on "-" and returns cls(name, int(level)). Then print the level of Hero.from_record("$n-$l").',
          starter: ['class Hero:', '    def __init__(self, name, level):', '        self.name = name', '        self.level = level'], keys: ['@classmethod', 'def', 'from_record', '(cls, text):', 'name', 'level', ',', '=', 'text.split', '("-")', 'return', 'cls', '(', ')', 'int', 'print', 'Hero.from_record("$n-$l")', '.level'],
          require: l => (has(l, /@classmethod/) && has(l, /cls\(/) ? null : 'Use @classmethod and return cls(...).'),
          hints: ['    @classmethod / def from_record(cls, text):', '        name, level = text.split("-") / return cls(name, int(level)), then print(Hero.from_record("$n-$l").level)'],
          solution: ['    @classmethod', '    def from_record(cls, text):', '        name, level = text.split("-")', '        return cls(name, int(level))', 'print(Hero.from_record("$n-$l").level)'],
        },
      ],
      learn: [{ title: '@classmethod', code: '@classmethod\ndef from_text(cls, text):\n    return cls(...)', text: 'Gets the class as cls. Great for extra ways to build objects.' }],
    },
    {
      id: '23-6', title: 'Tools on the wall', bg: 'citadel', npc: 'warden2', mentor: 'warden2', tags: ['staticm'],
      steps: [
        { type: 'talk', who: 'warden2', text: '@staticmethod is a plain function that lives in the class because it belongs there. It gets no self and no cls.' },
        {
          type: 'predict', vars: R => ({ v: R.int(-5, 15) }), text: 'What will it say?',
          code: ['class Gauge:', '    @staticmethod', '    def valid(v):', '        return 0 <= v <= 10', 'print(Gauge.valid($v), Gauge().valid(11))'],
          explain: 'A static method works from the class or from an object, with no self.',
        },
        {
          type: 'predict', vars: R => ({ c: R.int(0, 30) }), text: 'Mixing all three kinds. What will it say?',
          code: ['class Temp:', '    def __init__(self, c):', '        self.c = c', '    @staticmethod', '    def to_f(c):', '        return c * 9 // 5 + 32', '    @property', '    def f(self):', '        return Temp.to_f(self.c)', 'print(Temp($c).f)'],
          explain: 'The property calls the static helper: $c * 9 // 5 + 32 = $(Math.floor(c * 9 / 5) + 32).',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9) }), text: 'A helper that needs no object.',
          lines: ['class Mathy:', '    []', '    def add(a, b):', '        return a + b', 'print(Mathy.[]($a, $b))'],
          chips: ['@staticmethod', '@classmethod', 'add', 'self'], answer: [['@staticmethod', 'add']],
          hints: ['No self and no cls: @staticmethod.', 'Mathy.add($a, $b)'],
        },
        {
          type: 'write', vars: R => ({ w: R.pick(['gear', 'Spring', 'COG', 'valve']) }), text: 'Write class Tools with a static method shout(word) that returns word.upper() + "!". Print Tools.shout("$w").',
          starter: [], keys: ['class', 'Tools', ':', '@staticmethod', 'def', 'shout', '(word):', 'return', 'word.upper()', '+', '"!"', 'print', 'Tools.shout', '("$w")'],
          require: l => (has(l, /@staticmethod/) ? null : 'Use @staticmethod.'),
          hints: ['class Tools: / @staticmethod / def shout(word):', 'return word.upper() + "!"  then  print(Tools.shout("$w"))'],
          solution: ['class Tools:', '    @staticmethod', '    def shout(word):', '        return word.upper() + "!"', 'print(Tools.shout("$w"))'],
        },
      ],
      learn: [{ title: '@staticmethod', code: '@staticmethod\ndef valid(v):\n    return v > 0', text: 'A plain function kept inside the class. No self, no cls.' }],
    },
    {
      id: '23-7', title: 'Built from parts', bg: 'citadel', npc: 'artificer', mentor: 'artificer', tags: ['compose'],
      steps: [
        { type: 'talk', who: 'artificer', text: 'Big machines are built from smaller ones. An object can hold other objects in its attributes. That is called composition: a Clock HAS gears, it is not a gear.' },
        { type: 'demo', vars: R => ({ ps: R.sample(PARTS, 3) }), text: 'Run it.', code: ['class Part:', '    def __init__(self, name):', '        self.name = name', 'class Machine:', '    def __init__(self):', '        self.parts = list()', '    def add(self, part):', '        self.parts.append(part)', 'm = Machine()', 'for n in $(JSON.stringify(ps)):', '    m.add(Part(n))', 'print([p.name for p in m.parts])'] },
        {
          type: 'predict', vars: R => ({ ws: [R.int(1, 9), R.int(1, 9), R.int(1, 9)] }), text: 'The machine asks its parts. What will it say?',
          code: ['class Part:', '    def __init__(self, weight):', '        self.weight = weight', 'class Machine:', '    def __init__(self, parts):', '        self.parts = parts', '    def weight(self):', '        return sum(p.weight for p in self.parts)', 'm = Machine([Part($(ws[0])), Part($(ws[1])), Part($(ws[2]))])', 'print(m.weight())'],
          explain: 'The machine adds up its parts: $(ws[0] + ws[1] + ws[2]).',
        },
        {
          type: 'predict', vars: R => ({ h: R.int(20, 40), d: R.int(3, 9) }), text: 'A hero holds a shield object. What will it say?',
          code: ['class Shield:', '    def __init__(self, block):', '        self.block = block', 'class Hero:', '    def __init__(self, hp, shield):', '        self.hp = hp', '        self.shield = shield', '    def hit(self, n):', '        self.hp -= max(0, n - self.shield.block)', 'h = Hero($h, Shield($d))', 'h.hit(10)', 'print(h.hp)'],
          explain: 'The shield blocks $d, so the hero loses $(Math.max(0, 10 - d)).',
        },
        {
          type: 'fill', vars: R => ({ n: R.pick(['Ada', 'Quinn', 'Iva']), it: R.item() }), text: 'Give the hero a pack, and reach into it.',
          lines: ['class Pack:', '    def __init__(self):', '        self.items = list()', 'class Hero:', '    def __init__(self, name):', '        self.name = name', '        self.pack = []()', 'h = Hero("$n")', 'h.pack.items.append("$it")', 'print(h.[].items)'],
          chips: ['Pack', 'pack', 'Hero', 'items'], answer: [['Pack', 'pack']],
          hints: ['The hero builds a Pack object in __init__.', 'h.pack.items'],
        },
        {
          type: 'write', vars: R => ({ ps: R.sample([3, 5, 8, 13, 21], 3) }), text: 'Write class Party that stores a list of heroes in __init__(self, heroes) and has a method total_hp(self) that adds up every hero\'s hp. Then print the total for the given heroes.',
          starter: ['class Hero:', '    def __init__(self, hp):', '        self.hp = hp', 'heroes = [Hero($(ps[0])), Hero($(ps[1])), Hero($(ps[2]))]'], keys: ['class', 'Party', ':', 'def', '__init__', '(self, heroes):', 'self.heroes', '=', 'heroes', 'total_hp', '(self):', 'return', 'sum', 'h.hp', 'for', 'h', 'in', 'p', 'Party(heroes)', 'print', 'p.total_hp()'],
          require: l => (has(l, /class\s+Party/) && has(l, /def\s+total_hp/) ? null : 'Write class Party with total_hp.'),
          hints: ['class Party: / def __init__(self, heroes): / self.heroes = heroes', 'def total_hp(self): / return sum(h.hp for h in self.heroes), then print(Party(heroes).total_hp())'],
          solution: ['class Party:', '    def __init__(self, heroes):', '        self.heroes = heroes', '    def total_hp(self):', '        return sum(h.hp for h in self.heroes)', 'print(Party(heroes).total_hp())'],
        },
      ],
      learn: [{ title: 'Composition', code: 'self.shield = Shield(3)\nself.parts = [Part(...), ...]', text: 'Objects holding other objects. Prefer "has a" over "is a" when building big things.' }],
    },
    {
      id: '23-8', title: 'The broken engine', bg: 'gearworks', mentor: 'narrator', tags: ['ooperr'],
      foe: R => ({ kind: 'gearbot', hp: 80, tint: 'big' }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'The citadel engine is jammed and a giant gearbot guards it. Every jam is a real Python mistake.' },
        {
          oneOf: [
            { type: 'predict', measure: 'errtype', text: 'Which error will this cause?', code: ['class Dial:', '    @property', '    def level(self):', '        return 5', 'd = Dial()', 'print(d.level())'], explain: 'd.level is already the number 5. Adding () tries to call 5: TypeError.' },
            { type: 'predict', measure: 'errtype', text: 'Which error will this cause?', code: ['class Gear:', '    count = 0', '    def turn(self):', '        count += 1', 'Gear().turn()'], explain: 'count inside the method is a local jar, read before it has a value: UnboundLocalError. Write Gear.count += 1.' },
            { type: 'predict', measure: 'errtype', text: 'Which error will this cause?', code: ['class Bot:', '    def __init__(self, name):', '        self.name = name', 'class Drone(Bot):', '    def __init__(self, name):', '        self.wings = 2', 'print(Drone("D").name)'], explain: 'Drone never called super().__init__, so name was never set: AttributeError.' },
          ],
        },
        {
          type: 'fix', vars: R => ({ p: R.int(15, 25) }), text: 'The engine will not start. Run it, then tap the broken line.',
          code: ['class Engine:', '    def __init__(self, power):', '        self.power = power', '    @staticmethod', '    def fire(self):', '        cast(fireball, self.power)', 'Engine($p).fire()'], bad: 3,
          options: ['    @property', '    @classmethod', '    # (no decorator here)'], answer: 2,
          explain: 'fire needs the object as self, so it must be a normal method. @staticmethod drops self.',
        },
        {
          type: 'fix', vars: R => ({ p: R.int(15, 25) }), text: 'This part is never added. Run it, then tap the broken line.',
          code: ['class Machine:', '    def __init__(self):', '        self.parts = list()', '    def add(self, n):', '        parts.append(n)', 'm = Machine()', 'm.add($p)', 'cast(spark, sum(m.parts))'], bad: 4,
          options: ['        self.parts.append(n)', '        self.parts = n', '        Machine.parts.append(n)'], answer: 0,
          explain: 'parts belongs to the object, so reach it through self.',
        },
        {
          type: 'write', vars: (R, c) => ({ h: c.foe.hp }), text: 'Finish it! $HP HP left. Fix the engine yourself: write class Engine with __init__(self, power) and a normal method fire(self) that casts fireball with self.power. Then Engine($h).fire().',
          starter: [], keys: ['class', 'Engine', ':', 'def', '__init__', '(self, power):', 'self.power', '=', 'power', 'fire', '(self):', 'cast', 'fireball', ',', 'Engine($h)', '.fire()'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+fire\s*\(\s*self\s*\)/) ? null : 'fire must take self.'),
          hints: ['class Engine: / def __init__(self, power): / self.power = power', 'def fire(self): / cast(fireball, self.power), then Engine($h).fire()'],
          solution: ['class Engine:', '    def __init__(self, power):', '        self.power = power', '    def fire(self):', '        cast(fireball, self.power)', 'Engine($h).fire()'],
        },
      ],
      learn: [{ title: 'Object bugs', code: 'self.parts   Gear.count   super().__init__\nproperties: no ()', text: 'Most object bugs are a missing self, a missing super(), or a property called like a method.' }],
    },
    {
      id: '23-9', title: 'The Clockwork King', bg: 'clocktower', foe: { kind: 'clockking', hp: 220, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'clockking', text: 'TICK. TOCK. EVERY GEAR IN THIS CITADEL OBEYS MY CLASS.' },
        { type: 'talk', who: 'narrator', text: 'The Clockwork King has 220 HP. Icebolt freezes his gears for double. Fireball only oils them.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ k: R.int(2, 4), p: R.int(5, 8) }), text: 'How much damage will this deal? Icebolt is doubled.',
          code: ['class Frost:', '    made = 0', '    def __init__(self):', '        Frost.made += 1', 'for i in range($k):', '    Frost()', 'cast(icebolt, Frost.made * $p)'],
          explain: '$k frost charges times $p = $(k * p), doubled: $(2 * k * p).',
        },
        {
          type: 'fill', vars: R => ({ c: R.int(8, 14) }), text: 'Let the property decide the power, then cast icebolt.',
          lines: ['class Rod:', '    def __init__(self, cold):', '        self.cold = cold', '    []', '    def power(self):', '        return self.cold * 2', 'cast(icebolt, Rod($c).[])'],
          chips: ['@property', '@staticmethod', 'power', 'power()'], answer: [['@property', 'power']],
          hints: ['Read power like an attribute.', '@property, then Rod($c).power'],
        },
        { type: 'talk', who: 'clockking', text: 'I WILL REBUILD MYSELF FROM MY OWN BLUEPRINT.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ a: R.int(4, 8), b: R.int(4, 8) }), text: 'A machine of frost parts. How much damage will this deal?',
          code: ['class Part:', '    def __init__(self, cold):', '        self.cold = cold', 'class Cannon:', '    def __init__(self, parts):', '        self.parts = parts', '    def fire(self):', '        cast(icebolt, sum(p.cold for p in self.parts))', 'Cannon([Part($a), Part($b)]).fire()'],
          explain: '$a + $b = $(a + b), doubled by icebolt: $(2 * (a + b)).',
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Final blow! $HP HP left, icebolt is doubled. Write class Frost with a classmethod strong(cls) that returns cls($q), and a method fire(self) that casts icebolt with self.cold. Its __init__ takes cold. Then Frost.strong().fire().',
          starter: [], keys: ['class', 'Frost', ':', 'def', '__init__', '(self, cold):', 'self.cold', '=', 'cold', '@classmethod', 'strong', '(cls):', 'return', 'cls($q)', 'fire', '(self):', 'cast', 'icebolt', ',', 'Frost.strong()', '.fire()'],
          goal: { foeDown: true },
          require: l => (has(l, /@classmethod/) && has(l, /cls\(/) ? null : 'strong must be a @classmethod that returns cls(...).'),
          hints: ['class Frost: / def __init__(self, cold): / self.cold = cold', '@classmethod / def strong(cls): / return cls($q) / def fire(self): / cast(icebolt, self.cold), then Frost.strong().fire()'],
          solution: ['class Frost:', '    def __init__(self, cold):', '        self.cold = cold', '    @classmethod', '    def strong(cls):', '        return cls($q)', '    def fire(self):', '        cast(icebolt, self.cold)', 'Frost.strong().fire()'],
        },
        { type: 'talk', who: 'clockking', text: 'tick... tock... ...the citadel... keeps your time now.' },
      ],
      learn: [{ title: 'Citadel toolkit', code: 'count = 0  @property  @x.setter\n@classmethod  @staticmethod', text: 'Shared values, guarded attributes, and other ways to build. Your classes are complete.' }],
    },
    {
      id: '23-R', title: 'The Grand Automaton', bg: 'automaton', foe: { kind: 'automaton', hp: 200 }, mentor: 'narrator', boss: true, review: true, tags: [],
      steps: [
        { type: 'talk', who: 'automaton', text: 'I AM THE GRAND AUTOMATON. I WAS BUILT FROM EVERY LESSON OF THE FORGE, THE KEEP AND THE CITADEL. PROVE YOU UNDERSTAND MY PARTS.' },
        { type: 'talk', who: 'narrator', text: 'Review boss! Worlds 10 to 12, plus a few old favorites. Every right answer strikes it. 200 HP.' },
        { type: 'review', tags: ['class', 'init', 'method'], reward: { spell: 'spark', power: 20 }, text: 'The Forge. What will the spellbook say?' },
        { type: 'review', tags: ['state', 'strdunder', 'objlist'], reward: { spell: 'fireball', power: 20 }, text: 'Golems at work. What will it say?' },
        { type: 'review', tags: ['inherit', 'override', 'superc'], reward: { spell: 'icebolt', power: 20 }, text: 'The Keep. What will it say?' },
        { type: 'review', tags: ['isinst', 'eqdunder', 'opdunder'], reward: { spell: 'spark', power: 20 }, text: 'Family secrets. What will it say?' },
        {
          type: 'write', vars: R => ({ n: R.pick(['Ada', 'Bryn', 'Cora']), h: R.int(20, 60) }), text: 'Write class Hero with __init__(self, name, hp) and a __str__ that returns the name, a colon, a space and the hp, like "Ada: 30". Then print(Hero("$n", $h)).',
          starter: [], keys: ['class', 'Hero', ':', 'def', '__init__', '(self, name, hp):', 'self.name', 'self.hp', '=', 'name', 'hp', '__str__', '(self):', 'return', 'f"{self.name}: {self.hp}"', 'print', 'Hero("$n", $h)'],
          require: l => (has(l, /def\s+__str__/) ? null : 'Define __str__.'),
          hints: ['class Hero: / def __init__(self, name, hp): / self.name = name / self.hp = hp', 'def __str__(self): / return f"{self.name}: {self.hp}"  then  print(Hero("$n", $h))'],
          solution: ['class Hero:', '    def __init__(self, name, hp):', '        self.name = name', '        self.hp = hp', '    def __str__(self):', '        return f"{self.name}: {self.hp}"', 'print(Hero("$n", $h))'],
        },
        { type: 'review', tags: ['classattr', 'property', 'setter'], reward: { spell: 'fireball', power: 20 }, text: 'The Citadel. What will it say?' },
        { type: 'review', tags: ['clsmethod', 'staticm', 'compose'], reward: { spell: 'icebolt', power: 20 }, text: 'Gears within gears. What will it say?' },
        { type: 'review', tags: ['dicts', 'comp', 'return', 'tryexcept', 'fileloop'], reward: { spell: 'spark', power: 20 }, text: 'An old lesson returns. What will it say?' },
        { type: 'talk', who: 'automaton', text: 'ONE FINAL TEST. BUILD A FAMILY THAT FIGHTS.' },
        {
          type: 'write', vars: (R, c) => ({ h: Math.max(1, c.foe.hp) }), text: 'Write class Caster with __init__(self, power) and attack(self) that casts spark with self.power. Then write Pyro(Caster) that overrides attack to cast fireball with self.power. Finish with Pyro($h).attack().',
          starter: [], keys: ['class', 'Caster', 'Pyro', '(Caster):', ':', 'def', '__init__', '(self, power):', 'self.power', '=', 'power', 'attack', '(self):', 'cast', 'spark', 'fireball', ',', 'Pyro($h)', '.attack()'],
          goal: { foeDown: true },
          require: l => (has(l, /class\s+Pyro\s*\(\s*Caster\s*\)/) && has(l, /fireball/) ? null : 'Pyro must inherit from Caster and cast fireball.'),
          hints: ['class Caster: / def __init__(self, power): / self.power = power / def attack(self): / cast(spark, self.power)', 'class Pyro(Caster): / def attack(self): / cast(fireball, self.power), then Pyro($h).attack()'],
          solution: ['class Caster:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(spark, self.power)', 'class Pyro(Caster):', '    def attack(self):', '        cast(fireball, self.power)', 'Pyro($h).attack()'],
        },
        { type: 'talk', who: 'automaton', text: 'SYSTEMS... RESPECT... MAKER. OBJECTS ARE YOURS TO COMMAND.' },
      ],
      learn: [{ title: 'Object-oriented Python', code: 'class  __init__  self  methods\ninheritance  super()  @property', text: 'CS50P week 8, practised and tested. Next: libraries, regex and tests.' }],
    },
  ],
};
WORLDS.push(WORLD23);
