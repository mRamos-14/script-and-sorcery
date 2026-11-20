/* World 22: The Bloodline Keep. Inheritance and special methods: child classes,
   overriding, super(), isinstance, __eq__, __add__ / __lt__ / __len__, polymorphism. */
const KNIGHTS = ['Aldric', 'Bryn', 'Cora', 'Dunstan', 'Elsa', 'Gareth', 'Ivy', 'Rolf'];
const HERO_CLS = ['class Hero:', '    def __init__(self, name):', '        self.name = name', '    def greet(self):', '        return "I am " + self.name'];

const WORLD22 = {
  id: 22, name: 'The Bloodline Keep', topic: 'inheritance and special methods', map: 'bg-map11.jpg',
  nodes: [[50, 92], [26, 82], [68, 73], [36, 63], [70, 53], [30, 43], [64, 33], [36, 22], [50, 9]],
  levels: [
    {
      id: '22-1', title: 'Family trees', bg: 'keep', npc: 'seren', mentor: 'seren', tags: ['inherit'],
      steps: [
        { type: 'talk', who: 'seren', text: "Welcome to the Bloodline Keep, {NAME}. I'm Lady Seren. Here, families of classes pass their gifts down. Write class Knight(Hero): and every Knight gets everything a Hero has." },
        { type: 'talk', who: 'seren', text: 'Hero is the parent class. Knight is the child class. The child can add its own methods on top of what it inherits.' },
        { type: 'demo', vars: R => ({ n: R.pick(KNIGHTS) }), text: 'Run it. Knight has no greet of its own, yet it can greet.', code: [...HERO_CLS, 'class Knight(Hero):', '    pass', 'k = Knight("$n")', 'print(k.greet())'] },
        {
          type: 'predict', vars: R => ({ n: R.pick(KNIGHTS) }), text: 'The child adds a method. What will it say?',
          code: [...HERO_CLS, 'class Knight(Hero):', '    def charge(self):', '        return self.name + " charges!"', 'k = Knight("$n")', 'print(k.greet())', 'print(k.charge())'],
          explain: 'greet comes from Hero, charge from Knight. self.name was set by Hero\'s __init__.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ n: R.pick(KNIGHTS) }), text: 'Gifts flow down, not up. Which error will this cause?',
          code: [...HERO_CLS, 'class Knight(Hero):', '    def charge(self):', '        return self.name + " charges!"', 'h = Hero("$n")', 'print(h.charge())'],
          explain: 'A plain Hero never got charge. Only Knights have it: AttributeError.',
        },
        {
          type: 'fill', vars: R => ({ n: R.pick(KNIGHTS) }), text: 'Make Mage a child of Hero, so it can greet.',
          lines: [...HERO_CLS, 'class Mage([]):', '    def spell(self):', '        return "zap"', 'm = Mage("$n")', 'print(m.[](), m.spell())'],
          chips: ['Hero', 'greet', 'self', 'Mage'], answer: [['Hero', 'greet']],
          hints: ['The parent goes in the brackets after the class name.', 'class Mage(Hero):, then m.greet()'],
        },
        {
          type: 'write', vars: R => ({ n: R.pick(KNIGHTS) }), text: 'Write class Archer as a child of Hero, with a method shoot(self) that returns the name followed by " shoots". Then print Archer("$n").shoot().',
          starter: HERO_CLS, keys: ['class', 'Archer', '(Hero):', 'def', 'shoot', '(self):', 'return', 'self.name', '+', '" shoots"', 'print', 'Archer("$n")', '.shoot()'],
          require: l => (has(l, /class\s+Archer\s*\(\s*Hero\s*\)/) ? null : 'Archer must be written as class Archer(Hero):'),
          hints: ['class Archer(Hero): / def shoot(self):', 'return self.name + " shoots"  then  print(Archer("$n").shoot())'],
          solution: ['class Archer(Hero):', '    def shoot(self):', '        return self.name + " shoots"', 'print(Archer("$n").shoot())'],
        },
      ],
      learn: [{ title: 'Inheritance', code: 'class Knight(Hero):\n    ...', text: 'A child class gets every method and attribute of its parent, and can add its own.' }],
    },
    {
      id: '22-2', title: 'Overriding', bg: 'keep', npc: 'squire', mentor: 'squire', tags: ['override'],
      steps: [
        { type: 'talk', who: 'squire', text: "Squire Tam, at your service! If a child writes a method with the same name as the parent's, the child's version wins for that child. That's called overriding." },
        { type: 'demo', text: 'Run it.', code: ['class Animal:', '    def speak(self):', '        return "..."', 'class Cat(Animal):', '    def speak(self):', '        return "meow"', 'print(Animal().speak(), Cat().speak())'] },
        {
          type: 'predict', vars: R => ({ s: R.pick(['woof', 'baa', 'moo', 'quack']) }), text: 'The parent calls self.speak(). Whose speak runs? What will it say?',
          code: ['class Animal:', '    def speak(self):', '        return "..."', '    def intro(self):', '        return "I say " + self.speak()', 'class Pet(Animal):', '    def speak(self):', '        return "$s"', 'print(Pet().intro())'],
          wrong: ['I say ...'],
          explain: 'intro comes from Animal, but self is a Pet, so self.speak() finds Pet\'s version: "$s".',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick(KNIGHTS) }), text: 'A family in one loop. What will it say?',
          code: ['class Hero:', '    def title(self):', '        return "hero"', 'class Knight(Hero):', '    def title(self):', '        return "knight"', 'class Squire(Knight):', '    pass', 'for h in [Hero(), Knight(), Squire()]:', '    print(h.title())'],
          explain: 'Squire has no title of its own, so it uses its parent Knight\'s.',
        },
        {
          type: 'fix', vars: R => ({ s: R.pick(['roar', 'hiss', 'howl']) }), text: 'The dragon should roar, but it keeps saying "...". Run it, then tap the broken line.',
          code: ['class Monster:', '    def sound(self):', '        return "..."', 'class Dragon(Monster):', '    def sond(self):', '        return "$s"', 'print(Dragon().sound())'], bad: 4,
          options: ['    def sound(self):', '    def Sound(self):', '    def sound():'], answer: 0,
          explain: 'To override, the name must match exactly. sond was a new, unused method.',
        },
        {
          type: 'write', vars: R => ({ n: R.pick(['Wyrm', 'Drake', 'Smaug', 'Ember']) }), text: 'Monster.describe returns "a monster". Write Dragon(Monster) that overrides describe to return "a dragon". Then print Dragon().describe().',
          starter: ['class Monster:', '    def describe(self):', '        return "a monster"'], keys: ['class', 'Dragon', '(Monster):', 'def', 'describe', '(self):', 'return', '"a dragon"', 'print', 'Dragon()', '.describe()'],
          require: l => (has(l, /class\s+Dragon\s*\(\s*Monster\s*\)/) && has(l, /def\s+describe/) ? null : 'Write class Dragon(Monster): with its own describe.'),
          hints: ['class Dragon(Monster): / def describe(self):', 'return "a dragon"  then  print(Dragon().describe())'],
          solution: ['class Dragon(Monster):', '    def describe(self):', '        return "a dragon"', 'print(Dragon().describe())'],
        },
      ],
      learn: [{ title: 'Overriding', code: 'class Cat(Animal):\n    def speak(self):\n        return "meow"', text: 'Same method name in the child replaces the parent\'s, even when the parent\'s own methods call it.' }],
    },
    {
      id: '22-3', title: 'Calling the elders', bg: 'keep', npc: 'seren', mentor: 'seren', tags: ['superc'],
      steps: [
        { type: 'talk', who: 'seren', text: 'When a child writes its own __init__, the parent\'s never runs, and its attributes are never set. super().__init__(...) calls the parent\'s version first. Then add your extras.' },
        { type: 'demo', vars: R => ({ n: R.pick(KNIGHTS), a: R.int(2, 9) }), text: 'Run it.', code: ['class Hero:', '    def __init__(self, name):', '        self.name = name', 'class Knight(Hero):', '    def __init__(self, name, armor):', '        super().__init__(name)', '        self.armor = armor', 'k = Knight("$n", $a)', 'print(k.name, k.armor)'] },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ n: R.pick(KNIGHTS), a: R.int(2, 9) }), text: 'This knight forgot its elders. Which error will this cause?',
          code: ['class Hero:', '    def __init__(self, name):', '        self.name = name', 'class Knight(Hero):', '    def __init__(self, name, armor):', '        self.armor = armor', 'k = Knight("$n", $a)', 'print(k.name)'],
          explain: 'Knight\'s __init__ replaced Hero\'s, so self.name was never set: AttributeError.',
        },
        {
          type: 'predict', vars: R => ({ n: R.pick(KNIGHTS) }), text: 'super() works for any method. What will it say?',
          code: ['class Hero:', '    def describe(self):', '        return "brave"', 'class Knight(Hero):', '    def describe(self):', '        return super().describe() + " and armored"', 'print(Knight().describe())'],
          explain: 'super().describe() gives "brave", then the knight adds its part.',
        },
        {
          type: 'fill', vars: R => ({ n: R.pick(KNIGHTS), h: R.int(20, 60) }), text: 'Let Mage set up the Hero part first.',
          lines: ['class Hero:', '    def __init__(self, name, hp):', '        self.name = name', '        self.hp = hp', 'class Mage(Hero):', '    def __init__(self, name, hp):', '        [].__init__(name, hp)', '        self.mana = 50', 'm = Mage("$n", $h)', 'print(m.name, m.hp, m.[])'],
          chips: ['super()', 'Hero', 'self', 'mana'], answer: [['super()', 'mana']],
          hints: ['super() reaches the parent class.', 'super().__init__(name, hp), then print m.mana'],
        },
        {
          type: 'write', vars: R => ({ n: R.pick(KNIGHTS), h: R.int(30, 90), f: R.int(5, 20) }), text: 'Write Paladin(Hero) whose __init__(self, name, hp, faith) calls super().__init__(name, hp) and stores faith. Then print the hp and faith of Paladin("$n", $h, $f).',
          starter: ['class Hero:', '    def __init__(self, name, hp):', '        self.name = name', '        self.hp = hp'], keys: ['class', 'Paladin', '(Hero):', 'def', '__init__', '(self, name, hp, faith):', 'super()', '.__init__', '(name, hp)', 'self.faith', '=', 'faith', 'p', 'Paladin', '"$n"', '$h', '$f', 'print', 'p.hp', 'p.faith', ','],
          require: l => (has(l, /class\s+Paladin\s*\(\s*Hero\s*\)/) && has(l, /super\(\)\.__init__/) ? null : 'Use class Paladin(Hero): and call super().__init__(name, hp).'),
          hints: ['class Paladin(Hero): / def __init__(self, name, hp, faith):', 'super().__init__(name, hp) / self.faith = faith, then p = Paladin("$n", $h, $f) and print(p.hp, p.faith)'],
          solution: ['class Paladin(Hero):', '    def __init__(self, name, hp, faith):', '        super().__init__(name, hp)', '        self.faith = faith', 'p = Paladin("$n", $h, $f)', 'print(p.hp, p.faith)'],
        },
      ],
      learn: [{ title: 'super()', code: 'super().__init__(name)', text: 'Calls the parent class\'s version of a method. Use it so the parent can set up its attributes.' }],
    },
    {
      id: '22-4', title: 'The armory', bg: 'greathall', mentor: 'narrator', tags: [],
      foe: R => ({ kind: 'knight', hp: 70, weak: 'icebolt', resist: 'fireball' }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'An enchanted suit of armor walks out of the armory! It is weak to icebolt and resists fireball. Choose your mage family wisely.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ p: R.int(6, 10) }), text: 'Two kinds of mage attack. How much damage will this deal?',
          code: ['class Mage:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(fireball, self.power)', 'class IceMage(Mage):', '    def attack(self):', '        cast(icebolt, self.power)', 'Mage($p).attack()', 'IceMage($p).attack()'],
          explain: 'Fireball is halved to $(Math.floor(p / 2)), icebolt is doubled to $(2 * p).',
        },
        {
          type: 'fill', vars: R => ({ p: R.int(8, 12) }), text: 'Give IceMage its own attack that casts icebolt.',
          lines: ['class Mage:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(fireball, self.power)', 'class IceMage([]):', '    def attack(self):', '        cast([], self.power)', 'IceMage($p).attack()'],
          chips: ['Mage', 'icebolt', 'fireball', 'self'], answer: [['Mage', 'icebolt']],
          hints: ['IceMage is a child of Mage.', 'Override attack to cast icebolt.'],
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Finish it! $HP HP left, and icebolt is doubled. Build an IceMage with power $q and attack.',
          starter: ['class Mage:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(fireball, self.power)', 'class IceMage(Mage):', '    def attack(self):', '        cast(icebolt, self.power)'],
          keys: ['IceMage', '(', ')', '$q', '.attack()', 'm', '='], goal: { foeDown: true },
          require: l => (has(l, /IceMage\(/) ? null : 'Use an IceMage.'),
          hints: ['IceMage($q).attack()'],
          solution: ['IceMage($q).attack()'],
        },
      ],
      learn: [{ title: 'Families that fight', code: 'class IceMage(Mage):\n    def attack(self): ...', text: 'Children keep the parent\'s setup and change only what differs.' }],
    },
    {
      id: '22-5', title: 'Who are you?', bg: 'keep', npc: 'squire', mentor: 'squire', tags: ['isinst'],
      steps: [
        { type: 'talk', who: 'squire', text: 'isinstance(x, Hero) asks: is x a Hero, or a child of Hero? type(x) gives the exact class. issubclass(Knight, Hero) asks about the classes themselves.' },
        {
          type: 'predict', vars: R => ({ n: R.pick(KNIGHTS) }), text: 'A knight is also a hero. What will it say?',
          code: ['class Hero:', '    pass', 'class Knight(Hero):', '    pass', 'k = Knight()', 'print(isinstance(k, Hero), type(k) == Hero, type(k) == Knight)'],
          wrong: ['True True True', 'False False True'],
          explain: 'isinstance counts parents too. type gives exactly Knight.',
        },
        {
          type: 'predict', text: 'Asking about the classes. What will it say?',
          code: ['class Hero:', '    pass', 'class Knight(Hero):', '    pass', 'class Squire(Knight):', '    pass', 'print(issubclass(Squire, Hero), issubclass(Hero, Knight))'],
          explain: 'Squire comes from Knight, which comes from Hero. A parent is not a child of its child.',
        },
        {
          type: 'predict', vars: R => ({ k: R.int(1, 3), h: R.int(1, 3) }), text: 'Counting the knights. What will it say?',
          code: ['class Hero:', '    pass', 'class Knight(Hero):', '    pass', 'party = [Knight()] * $k + [Hero()] * $h', 'count = 0', 'for p in party:', '    if isinstance(p, Knight):', '        count += 1', 'print(count, len(party))'],
          explain: '$k knights out of $(k + h) heroes.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(2, 9) }), text: 'Only numbers should be added up.',
          lines: ['items = [$n, "sword", 3, "shield"]', 'total = 0', 'for x in items:', '    if isinstance(x, []):', '        total += x', 'print(total)'],
          chips: ['int', 'str', 'list'], answer: [['int']],
          hints: ['isinstance works with built-in types too.', 'isinstance(x, int)'],
        },
        {
          type: 'write', vars: R => ({ k: R.int(2, 4) }), text: 'party holds Heroes and Knights. Print how many members are Knights, using isinstance.',
          starter: ['class Hero:', '    pass', 'class Knight(Hero):', '    pass', 'party = [Knight(), Hero()] * $k + [Hero()]'], keys: ['count', '=', '0', 'for', 'p', 'in', 'party', ':', 'if', 'isinstance', '(p, Knight)', '+=', '1', 'print', '(', ')'],
          require: l => (has(l, /isinstance\(/) ? null : 'Use isinstance(p, Knight).'),
          hints: ['count = 0 / for p in party: / if isinstance(p, Knight):', 'count += 1, then print(count)'],
          solution: ['count = 0', 'for p in party:', '    if isinstance(p, Knight):', '        count += 1', 'print(count)'],
        },
      ],
      learn: [{ title: 'isinstance', code: 'isinstance(k, Hero)\ntype(k) == Knight', text: 'isinstance includes parent classes; type() is the exact class.' }],
    },
    {
      id: '22-6', title: 'Twins or the same?', bg: 'keep', npc: 'seren', mentor: 'seren', tags: ['eqdunder'],
      steps: [
        { type: 'talk', who: 'seren', text: 'Two coins both worth 5 are still two different coins. For objects, == normally means "the very same object", like is. Write __eq__ to decide what equal means.' },
        {
          type: 'predict', vars: R => ({ v: R.int(2, 20) }), text: 'No __eq__ yet. What will it say?',
          code: ['class Coin:', '    def __init__(self, value):', '        self.value = value', 'a = Coin($v)', 'b = Coin($v)', 'c = a', 'print(a == b, a == c)'],
          wrong: ['True True'],
          explain: 'a and b are separate objects. c is a second name for the same object.',
        },
        {
          type: 'predict', vars: R => ({ v: R.int(2, 20) }), text: 'Now with __eq__. What will it say?',
          code: ['class Coin:', '    def __init__(self, value):', '        self.value = value', '    def __eq__(self, other):', '        return self.value == other.value', 'a = Coin($v)', 'b = Coin($v)', 'print(a == b, a is b)'],
          wrong: ['True True', 'False False'],
          explain: '__eq__ compares values, so == is True. is still checks for the very same object.',
        },
        {
          type: 'predict', vars: R => ({ c: R.pick(['red', 'blue', 'green']), d: R.pick(['gold', 'black']) }), text: 'in uses == too. What will it say?',
          code: ['class Gem:', '    def __init__(self, color):', '        self.color = color', '    def __eq__(self, other):', '        return self.color == other.color', 'bag = [Gem("$c"), Gem("$d")]', 'print(Gem("$c") in bag, Gem("white") in bag)'],
          explain: 'in compares with ==, which now means "same color".',
        },
        {
          type: 'fix', vars: R => ({ v: R.int(2, 20) }), text: 'These equal coins come out unequal. Run it, then tap the broken line.',
          code: ['class Coin:', '    def __init__(self, value):', '        self.value = value', '    def __eq__(self, other):', '        return self.value is other', 'print(Coin($v) == Coin($v))'], bad: 4,
          options: ['        return self.value == other.value', '        return self is other', '        return self.value != other.value'], answer: 0,
          explain: 'Compare the value to the other coin\'s value, not to the whole coin.',
        },
        {
          type: 'write', vars: R => ({ c: R.pick(['amber', 'jade', 'onyx', 'ruby']) }), text: 'Give Rune an __eq__ that says two runes are equal when their symbol matches. Then print(Rune("$c") == Rune("$c")).',
          starter: ['class Rune:', '    def __init__(self, symbol):', '        self.symbol = symbol'], keys: ['def', '__eq__', '(self, other):', 'return', 'self.symbol', '==', 'other.symbol', 'print', 'Rune("$c")'],
          require: l => (has(l, /def\s+__eq__\s*\(\s*self\s*,/) ? null : 'Define __eq__(self, other).'),
          hints: ['    def __eq__(self, other):', '        return self.symbol == other.symbol  then  print(Rune("$c") == Rune("$c"))'],
          solution: ['    def __eq__(self, other):', '        return self.symbol == other.symbol', 'print(Rune("$c") == Rune("$c"))'],
        },
      ],
      learn: [{ title: '__eq__ and is', code: 'def __eq__(self, other):\n    return self.v == other.v', text: '__eq__ decides what == means. is always means the very same object.' }],
    },
    {
      id: '22-7', title: 'Magic math', bg: 'keep', npc: 'squire', mentor: 'squire', tags: ['opdunder'],
      steps: [
        { type: 'talk', who: 'squire', text: 'Special methods teach objects Python\'s signs. __add__ handles +, __lt__ handles <, so sorted() and max() work, and __len__ handles len().' },
        { type: 'demo', vars: R => ({ a: R.int(5, 50), b: R.int(5, 50) }), text: 'Run it. + calls __add__.', code: ['class Gold:', '    def __init__(self, n):', '        self.n = n', '    def __add__(self, other):', '        return Gold(self.n + other.n)', 'total = Gold($a) + Gold($b)', 'print(total.n)'] },
        {
          type: 'predict', vars: R => ({ ns: R.sample(KNIGHTS, 3), ls: R.sample([3, 7, 12, 18, 25], 3) }), text: 'sorted() uses <. What will it say?',
          code: ['class Knight:', '    def __init__(self, name, level):', '        self.name = name', '        self.level = level', '    def __lt__(self, other):', '        return self.level < other.level', 'ks = [Knight("$(ns[0])", $(ls[0])), Knight("$(ns[1])", $(ls[1])), Knight("$(ns[2])", $(ls[2]))]', 'print([k.name for k in sorted(ks)])', 'print(max(ks).name)'],
          explain: '__lt__ compares levels, so sorted goes from lowest level to highest.',
        },
        {
          type: 'predict', vars: R => ({ its: R.items(R.int(2, 4)) }), text: 'len() of a bag. What will it say?',
          code: ['class Bag:', '    def __init__(self):', '        self.items = list()', '    def add(self, item):', '        self.items.append(item)', '    def __len__(self):', '        return len(self.items)', 'b = Bag()', 'for it in $(JSON.stringify(its)):', '    b.add(it)', 'print(len(b), bool(Bag()))'],
          explain: 'len(b) calls __len__. An empty bag has length 0, which counts as False.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(1, 9), b: R.int(1, 9), c: R.int(1, 9), d: R.int(1, 9) }), text: 'Teach Vec how to be added with +.',
          lines: ['class Vec:', '    def __init__(self, x, y):', '        self.x = x', '        self.y = y', '    def [](self, other):', '        return Vec(self.x + other.x, self.y + [].y)', 'v = Vec($a, $b) + Vec($c, $d)', 'print(v.x, v.y)'],
          chips: ['__add__', '__plus__', 'other', 'self'], answer: [['__add__', 'other']],
          hints: ['+ is handled by __add__.', 'Add other.y to self.y.'],
        },
        {
          type: 'write', vars: R => ({ ns: R.sample(KNIGHTS, R.int(2, 4)) }), text: 'Give Party a __len__ that returns how many members it has. Then print(len(p)).',
          starter: ['class Party:', '    def __init__(self, members):', '        self.members = members'], keys: ['def', '__len__', '(self):', 'return', 'len', '(', ')', 'self.members', 'p', '=', 'Party', '$(JSON.stringify(ns))', 'print', 'len(p)'],
          require: l => (has(l, /def\s+__len__\s*\(\s*self\s*\)/) ? null : 'Define __len__(self).'),
          hints: ['    def __len__(self):', '        return len(self.members)  then  p = Party($(JSON.stringify(ns))) and print(len(p))'],
          solution: ['    def __len__(self):', '        return len(self.members)', 'p = Party($(JSON.stringify(ns)))', 'print(len(p))'],
        },
      ],
      learn: [{ title: 'Special methods', code: '__add__  __lt__  __len__  __str__  __eq__', text: 'Double-underscore methods let your objects work with +, <, len(), print and ==.' }],
    },
    {
      id: '22-8', title: 'Many shapes', bg: 'greathall', mentor: 'narrator', tags: ['poly'],
      foe: R => ({ kind: 'knight', hp: 90, weak: 'spark', tint: 'big' }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'A giant armored knight blocks the hall. Different heroes answer the same call, attack(), each in their own way. That idea is called polymorphism.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ a: R.int(5, 9), b: R.int(5, 9) }), text: 'One loop, different attacks. How much damage will this deal? Spark is doubled.',
          code: ['class Hero:', '    def attack(self):', '        cast(fireball, $a)', 'class Wizard(Hero):', '    def attack(self):', '        cast(spark, $b)', 'for h in [Hero(), Wizard()]:', '    h.attack()'],
          explain: '$a from the hero, and $b doubled to $(2 * b) from the wizard.',
        },
        {
          type: 'fix', vars: R => ({ b: R.int(8, 12) }), text: 'The wizard attacks like a plain hero. Run it, then tap the broken line.',
          code: ['class Hero:', '    def attack(self):', '        cast(fireball, 3)', '        return "fire"', 'class Wizard(Hero):', '    def atack(self):', '        cast(spark, $b)', '        return "spark"', 'print(Wizard().attack())'], bad: 5,
          options: ['    def attack(self):', '    def Attack(self):', '    def attack():'], answer: 0,
          goal: { output: 'auto' },
          explain: 'The override must be spelled exactly like the parent\'s method.',
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Finish it! $HP HP left. Write class Storm(Hero) that overrides attack to cast spark with $q, then make every hero in party attack.',
          starter: ['class Hero:', '    def attack(self):', '        cast(fireball, 1)', 'party = list()'],
          keys: ['class', 'Storm', '(Hero):', 'def', 'attack', '(self):', 'cast', 'spark', ',', '$q', 'party', '.append', 'Storm()', 'for', 'h', 'in', ':', 'h.attack()'], goal: { foeDown: true },
          require: l => (has(l, /class\s+Storm\s*\(\s*Hero\s*\)/) && has(l, /for\s+\w+\s+in\s+party/) ? null : 'Write class Storm(Hero):, add one to party, and loop over party.'),
          hints: ['class Storm(Hero): / def attack(self): / cast(spark, $q)', 'party.append(Storm()) / for h in party: / h.attack()'],
          solution: ['class Storm(Hero):', '    def attack(self):', '        cast(spark, $q)', 'party.append(Storm())', 'for h in party:', '    h.attack()'],
        },
      ],
      learn: [{ title: 'Polymorphism', code: 'for h in party:\n    h.attack()', text: 'Many classes, one method name. Each object does its own version.' }],
    },
    {
      id: '22-9', title: 'The Usurper', bg: 'keepthrone', foe: { kind: 'usurper', hp: 220, weak: 'fireball', resist: 'spark' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'usurper', text: 'I stole this throne by overriding every rule. Your little classes will bow to mine.' },
        { type: 'talk', who: 'narrator', text: 'The Usurper has 220 HP. Fireball burns him for double. Spark only tickles.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ p: R.int(6, 10) }), text: 'How much damage will this deal? Fireball is doubled, spark is halved.',
          code: ['class Caster:', '    def __init__(self, power):', '        self.power = power', '    def spell(self):', '        return spark', '    def attack(self):', '        cast(self.spell(), self.power)', 'class Pyro(Caster):', '    def spell(self):', '        return fireball', 'Caster($p).attack()', 'Pyro($p).attack()'],
          explain: 'Caster casts spark: $(Math.floor(p / 2)). Pyro overrides spell, so the same attack casts fireball: $(2 * p).',
        },
        {
          type: 'fix', vars: R => ({ p: R.int(10, 15) }), text: 'The Usurper cursed your blueprint! Run it, then tap the broken line.',
          code: ['class Hero:', '    def __init__(self, power):', '        self.power = power', 'class Pyro(Hero):', '    def __init__(self, power):', '        self.ready = True', '    def attack(self):', '        cast(fireball, self.power)', 'Pyro($p).attack()'], bad: 5,
          options: ['        super().__init__(power)', '        self.power = self.power', '        self.power = Power'], answer: 0,
          goal: { output: 'auto' },
          explain: 'Pyro\'s __init__ replaced Hero\'s, so power was never stored. Call super().__init__(power).',
        },
        { type: 'talk', who: 'usurper', text: 'Then I shall sort my guards by strength... wait, why is that helping you?' },
        {
          type: 'fill', vars: R => ({ ps: R.sample([6, 9, 11, 14, 17], 3) }), text: 'Attack with the strongest guard spell, chosen with max().',
          lines: ['class Spell:', '    def __init__(self, power):', '        self.power = power', '    def [](self, other):', '        return self.power < other.power', 'best = max([Spell($(ps[0])), Spell($(ps[1])), Spell($(ps[2]))])', 'cast(fireball, best.[])'],
          chips: ['__lt__', '__add__', 'power', 'best'], answer: [['__lt__', 'power']],
          hints: ['max compares with <, which is __lt__.', 'cast(fireball, best.power)'],
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Final blow! $HP HP left, fireball is doubled. Write Pyro(Hero) whose attack casts fireball with self.power, then Pyro($q).attack().',
          starter: ['class Hero:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(spark, self.power)'],
          keys: ['class', 'Pyro', '(Hero):', 'def', 'attack', '(self):', 'cast', 'fireball', ',', 'self.power', 'Pyro($q)', '.attack()'], goal: { foeDown: true },
          require: l => (has(l, /class\s+Pyro\s*\(\s*Hero\s*\)/) ? null : 'Write class Pyro(Hero): that overrides attack.'),
          hints: ['class Pyro(Hero): / def attack(self): / cast(fireball, self.power)', 'Pyro($q).attack() at the left edge'],
          solution: ['class Pyro(Hero):', '    def attack(self):', '        cast(fireball, self.power)', 'Pyro($q).attack()'],
        },
        { type: 'talk', who: 'usurper', text: 'Inherited... and overthrown. The keep is yours.' },
      ],
      learn: [{ title: 'Family toolkit', code: 'class Child(Parent)  super()  isinstance\n__eq__  __lt__  __add__  __len__', text: 'Reuse code through inheritance, and teach objects to work with Python\'s signs.' }],
    },
  ],
};
WORLDS.push(WORLD22);
