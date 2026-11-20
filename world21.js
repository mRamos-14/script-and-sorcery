/* World 21: The Golem Forge. Classes and objects: class, attributes, __init__ and self,
   methods, changing state, __str__, lists of objects, and the classic OOP mistakes. */
const GOLEMS = ['Bolt', 'Rivet', 'Cog', 'Anvil', 'Flint', 'Brass', 'Gizmo', 'Ember'];
const golem2 = R => R.sample(GOLEMS, 2);

const WORLD21 = {
  id: 21, name: 'The Golem Forge', topic: 'classes and objects', map: 'bg-map10.jpg',
  nodes: [[50, 92], [28, 82], [70, 73], [34, 63], [68, 53], [30, 43], [66, 33], [38, 22], [50, 9]],
  levels: [
    {
      id: '21-1', title: 'Blueprints', bg: 'forge', npc: 'forgemaster', mentor: 'forgemaster', tags: ['class'],
      steps: [
        { type: 'talk', who: 'forgemaster', text: "Welcome to the Golem Forge, {NAME}. I'm Forgemaster Brann. Here we build golems from blueprints. In Python a blueprint is a class, and each thing built from it is an object." },
        { type: 'talk', who: 'forgemaster', text: 'class Golem: writes the blueprint. Golem() builds one golem. The dot puts a jar on that object: g.name = "Bolt" gives it a name. Jars on an object are called attributes.' },
        { type: 'demo', vars: R => ({ n: R.pick(GOLEMS), p: R.int(5, 30) }), text: 'Run it. One blueprint, one golem.', code: ['class Golem:', '    pass', 'g = Golem()', 'g.name = "$n"', 'g.power = $p', 'print(g.name, "has power", g.power)'] },
        {
          type: 'predict', vars: R => ({ x: R.int(3, 20), y: R.int(3, 20) }), text: 'Two golems from one blueprint. What will it say?',
          code: ['class Golem:', '    pass', 'a = Golem()', 'b = Golem()', 'a.power = $x', 'b.power = $y', 'print(a.power + b.power)'],
          wrong: ['$y', '$x$y'],
          explain: 'Each object keeps its own attributes. $x + $y = $(x + y).',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ n: R.pick(GOLEMS) }), text: 'This golem was never given power. Which error will this cause?',
          code: ['class Golem:', '    pass', 'g = Golem()', 'g.name = "$n"', 'print(g.power)'],
          explain: 'Asking an object for an attribute it does not have raises AttributeError.',
        },
        {
          type: 'fill', vars: R => ({ n: R.pick(GOLEMS) }), text: 'Build a golem from the blueprint and name it $n.',
          lines: ['class Golem:', '    pass', 'g = []()', 'g.[] = "$n"', 'print(g.name)'], chips: ['Golem', 'name', 'golem', 'class'], answer: [['Golem', 'name']],
          hints: ['The blueprint is called Golem, with a capital G.', 'g = Golem(), then g.name = "$n"'],
        },
        {
          type: 'write', vars: R => ({ p: R.int(10, 60) }), text: 'Build a Golem called g, give it the attribute power with the value $p, then print g.power.',
          starter: ['class Golem:', '    pass'], keys: ['g', '=', 'Golem()', '.power', '$p', 'print', '(', ')'],
          require: l => (has(l, /Golem\(\)/) && has(l, /\.power\s*=/) ? null : 'Build the golem with Golem(), then set g.power.'),
          hints: ['g = Golem()', 'g.power = $p then print(g.power)'],
          solution: ['g = Golem()', 'g.power = $p', 'print(g.power)'],
        },
      ],
      learn: [
        { title: 'class', code: 'class Golem:\n    pass\ng = Golem()', text: 'A class is a blueprint. Calling it like a function builds an object.' },
        { title: 'Attributes', code: 'g.name = "Bolt"\nprint(g.name)', text: 'Jars that belong to one object, reached with a dot.' },
      ],
    },
    {
      id: '21-2', title: 'The __init__ rune', bg: 'forge', npc: 'tinker', mentor: 'tinker', tags: ['init'],
      steps: [
        { type: 'talk', who: 'tinker', text: "I'm Tinker Lio! Setting every attribute by hand gets old. Carve an __init__ rune into the blueprint and it runs by itself every time a golem is built." },
        { type: 'talk', who: 'tinker', text: 'Inside the class, self means "the golem being built". self.name = name copies the value into that golem. Golem("Bolt", 12) fills name and power.' },
        { type: 'demo', vars: R => ({ n: R.pick(GOLEMS), p: R.int(5, 40) }), text: 'Run it and watch self fill up.', code: ['class Golem:', '    def __init__(self, name, power):', '        self.name = name', '        self.power = power', 'g = Golem("$n", $p)', 'print(g.name, g.power)'] },
        {
          type: 'predict', vars: R => { const [a, b] = golem2(R); return { a, b, x: R.int(2, 15), y: R.int(16, 40) }; }, text: 'What will it say?',
          code: ['class Golem:', '    def __init__(self, name, power):', '        self.name = name', '        self.power = power', 'a = Golem("$a", $x)', 'b = Golem("$b", $y)', 'print(b.power - a.power)'],
          explain: '$y - $x = $(y - x). Each golem got its own power.',
        },
        {
          type: 'predict', vars: R => { const [a, b] = golem2(R); return { a, b, h: R.int(11, 30) }; }, text: 'One parameter has a default. What will it say?',
          code: ['class Golem:', '    def __init__(self, name, hp=10):', '        self.name = name', '        self.hp = hp', 'g1 = Golem("$a")', 'g2 = Golem("$b", $h)', 'print(g1.hp, g2.hp)'],
          wrong: ['$h $h', '10 10'],
          explain: 'g1 skipped hp, so it got the default 10. g2 passed $h.',
        },
        {
          oneOf: [
            {
              type: 'fix', vars: R => ({ n: R.pick(GOLEMS), p: R.int(5, 30) }), text: 'This golem forgets its power. Run it, then tap the broken line.',
              code: ['class Golem:', '    def __init__(self, name, power):', '        self.name = name', '        power = power', 'g = Golem("$n", $p)', 'print(g.name, g.power)'], bad: 3,
              options: ['        self.power = power', '        power = self.power', '        self.power = Power'], answer: 0,
              explain: 'Without self. the value goes into a jar that vanishes when __init__ ends. self.power keeps it on the golem.',
            },
            {
              type: 'fix', vars: R => ({ n: R.pick(GOLEMS), p: R.int(5, 30) }), text: 'The forge refuses to build this golem. Run it, then tap the broken line.',
              code: ['class Golem:', '    def __init__(self, name, power):', '        self.name = name', '        self.power = power', 'g = Golem("$n")', 'print(g.name, g.power)'], bad: 4,
              options: ['g = Golem("$n", $p)', 'g = Golem(self, "$n")', 'g = Golem("$n", power)'], answer: 0,
              explain: '__init__ needs a name and a power. self is filled in by Python, so you pass the other two.',
            },
          ],
        },
        {
          type: 'write', vars: R => ({ n: R.pick(GOLEMS), h: R.int(20, 90) }), text: 'Finish the blueprint: an __init__ that stores name and hp on self. Then build Golem("$n", $h) and print its hp.',
          starter: ['class Golem:'], keys: ['def', '__init__', '(', ')', 'self', ',', 'name', 'hp', ':', 'self.name', 'self.hp', '=', 'g', 'Golem', '"$n"', '$h', 'print', 'g.hp'],
          require: l => (has(l, /def\s+__init__\s*\(\s*self/) && has(l, /self\.hp\s*=/) ? null : 'Write def __init__(self, name, hp): and store self.hp.'),
          hints: ['    def __init__(self, name, hp):', '        self.name = name / self.hp = hp, then g = Golem("$n", $h) at the left edge and print(g.hp)'],
          solution: ['    def __init__(self, name, hp):', '        self.name = name', '        self.hp = hp', 'g = Golem("$n", $h)', 'print(g.hp)'],
        },
      ],
      learn: [{ title: '__init__ and self', code: 'def __init__(self, name):\n    self.name = name', text: 'Runs when an object is built. self is the new object; self.x = ... stores an attribute on it.' }],
    },
    {
      id: '21-3', title: 'Teaching tricks', bg: 'forge', npc: 'forgemaster', mentor: 'forgemaster', tags: ['method'],
      steps: [
        { type: 'talk', who: 'forgemaster', text: 'A golem that only stands there is a statue. Teach it tricks: functions written inside the class. They are called methods, and their first parameter is always self.' },
        { type: 'demo', vars: R => ({ n: R.pick(GOLEMS) }), text: 'Run it. g.greet() calls the method on that golem.', code: ['class Golem:', '    def __init__(self, name):', '        self.name = name', '    def greet(self):', '        return f"I am {self.name}"', 'g = Golem("$n")', 'print(g.greet())'] },
        {
          type: 'predict', vars: R => ({ p: R.int(3, 12), k: R.int(2, 5) }), text: 'A method with a parameter. What will it say?',
          code: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def boost(self, times):', '        return self.power * times', 'g = Golem($p)', 'print(g.boost($k))'],
          explain: 'g.boost($k) runs boost with self as g and times as $k: $p * $k = $(p * k).',
        },
        {
          type: 'predict', vars: R => { const [a, b] = golem2(R); return { a, b }; }, text: 'Same method, two golems. What will it say?',
          code: ['class Golem:', '    def __init__(self, name):', '        self.name = name', '    def tag(self):', '        return self.name[0]', 'x = Golem("$a")', 'y = Golem("$b")', 'print(x.tag() + y.tag())'],
          explain: 'Each call uses its own golem as self: "$(a[0])" + "$(b[0])".',
        },
        {
          type: 'fill', vars: R => ({ p: R.int(4, 25) }), text: 'Finish the double trick and call it.',
          lines: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def double(self):', '        return [].power * 2', 'g = Golem($p)', 'print(g.[]())'],
          chips: ['self', 'g', 'double', 'power'], answer: [['self', 'double']],
          hints: ['Inside the method, the golem is called self.', 'self.power, then call g.double()'],
        },
        {
          type: 'fix', vars: R => ({ n: R.pick(GOLEMS) }), text: 'This trick breaks when called. Run it, then tap the broken line.',
          code: ['class Golem:', '    def __init__(self, name):', '        self.name = name', '    def roar():', '        return "ROAR"', 'g = Golem("$n")', 'print(g.roar())'], bad: 3,
          options: ['    def roar(self):', '    def roar(self, sound):', '    roar(self):'], answer: 0,
          explain: 'Python always passes the object in as the first argument, so every method needs self.',
        },
        {
          type: 'write', vars: R => ({ n: R.pick(GOLEMS) }), text: 'Add a method shout(self) that returns the name in capitals with "!" on the end. Then build Golem("$n") and print g.shout().',
          starter: ['class Golem:', '    def __init__(self, name):', '        self.name = name'], keys: ['def', 'shout', '(self):', 'return', 'self.name', '.upper()', '+', '"!"', 'g', '=', 'Golem', '"$n"', 'print', 'g.shout()'],
          require: l => (has(l, /def\s+shout\s*\(\s*self\s*\)/) && has(l, /\.shout\(\)/) ? null : 'Define shout(self) inside the class and call g.shout().'),
          hints: ['    def shout(self):', '        return self.name.upper() + "!"  then  g = Golem("$n") and print(g.shout())'],
          solution: ['    def shout(self):', '        return self.name.upper() + "!"', 'g = Golem("$n")', 'print(g.shout())'],
        },
      ],
      learn: [{ title: 'Methods', code: 'def greet(self):\n    return self.name\ng.greet()', text: 'Functions inside a class. Call them on an object; Python passes the object in as self.' }],
    },
    {
      id: '21-4', title: 'Rogue sparkbots', bg: 'foundry', mentor: 'narrator', tags: [],
      foe: R => { const p = R.int(14, 26); return { kind: 'sparkbot', hp: p, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Sparkbots broke loose in the foundry! Your golems can cast spells from inside their methods.' },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p }), text: 'The sparkbot has $HP HP. Give the golem an attack method that casts fireball with its own power.',
          lines: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(fireball, self.[])', 'g = Golem($p)', 'g.[]()'],
          chips: ['power', 'attack', 'Golem', 'self'], answer: [['power', 'attack']], goal: { foeDown: true },
          hints: ['The golem stores its power in self.power.', 'cast(fireball, self.power) and then g.attack()'],
        },
        { type: 'talk', who: 'narrator', text: 'A big sparkbot rolls out of the smoke!' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ a: R.int(6, 12), b: R.int(6, 12), hp: 0 }), spawn: (v, R) => ({ kind: 'sparkbot', hp: v.a + v.b + R.int(8, 20), tint: 'big' }),
          text: 'Two golems attack. How much damage will this deal?',
          code: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(spark, self.power)', 'army = [Golem($a), Golem($b)]', 'for g in army:', '    g.attack()'],
          explain: 'Each golem casts its own power: $a + $b = $(a + b).',
        },
        {
          type: 'write', vars: (R, c) => ({ h: c.foe.hp }), text: 'Finish it! $HP HP left. Build a Golem with exactly enough power and call its attack().',
          starter: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(fireball, self.power)'], keys: ['g', '=', 'Golem', '(', ')', '$h', 'g.attack()'],
          goal: { foeDown: true },
          require: l => (has(l, /Golem\(/) && has(l, /\.attack\(\)/) ? null : 'Build a Golem and call its attack() method.'),
          hints: ['g = Golem($h)', 'g.attack()'],
          solution: ['g = Golem($h)', 'g.attack()'],
        },
      ],
      learn: [{ title: 'Objects that act', code: 'def attack(self):\n    cast(fireball, self.power)', text: 'A method can use the object\'s attributes to do things.' }],
    },
    {
      id: '21-5', title: 'Changing state', bg: 'forge', npc: 'tinker', mentor: 'tinker', tags: ['state'],
      steps: [
        { type: 'talk', who: 'tinker', text: 'Objects remember. A method can change self.something, and the change stays on that object for later. That memory is called state.' },
        { type: 'demo', vars: R => ({ c: R.int(50, 100), u: R.int(5, 20) }), text: 'Run it. The battery drains and remembers.', code: ['class Battery:', '    def __init__(self, charge):', '        self.charge = charge', '    def use(self, n):', '        self.charge -= n', 'b = Battery($c)', 'b.use($u)', 'b.use($u)', 'print(b.charge)'] },
        {
          type: 'predict', vars: R => ({ k: R.int(2, 5) }), text: 'A clicker counts its clicks. What will it say?',
          code: ['class Clicker:', '    def __init__(self):', '        self.count = 0', '    def click(self):', '        self.count += 1', 'c = Clicker()', 'for i in range($k):', '    c.click()', 'print(c.count)'],
          explain: '$k clicks, each adding 1 to c.count.',
        },
        {
          type: 'predict', vars: R => ({ x: R.int(5, 20), y: R.int(5, 20), z: R.int(5, 20) }), text: 'Two purses. What will it say?',
          code: ['class Purse:', '    def __init__(self):', '        self.gold = 0', '    def gain(self, n):', '        self.gold += n', 'a = Purse()', 'b = Purse()', 'a.gain($x)', 'b.gain($y)', 'a.gain($z)', 'print(a.gold, b.gold)'],
          wrong: ['$(x + y + z) $y', '$(x + z) $(x + y + z)'],
          explain: 'a got $x and $z, so $(x + z). b only got $y.',
        },
        {
          type: 'predict', vars: R => ({ h: R.int(10, 20), d: R.int(21, 35) }), text: 'The shield never drops below zero. What will it say?',
          code: ['class Shield:', '    def __init__(self, hp):', '        self.hp = hp', '    def hit(self, n):', '        self.hp -= n', '        if self.hp < 0:', '            self.hp = 0', '        return self.hp', 's = Shield($h)', 'print(s.hit($d))'],
          explain: '$h - $d is below zero, so hit sets hp to 0.',
        },
        {
          type: 'fill', vars: R => ({ h: R.int(30, 60), n: R.int(3, 9) }), text: 'Make take_damage lower the golem\'s hp.',
          lines: ['class Golem:', '    def __init__(self, hp):', '        self.hp = hp', '    def take_damage(self, n):', '        self.[] -= []', 'g = Golem($h)', 'g.take_damage($n)', 'print(g.hp)'],
          chips: ['hp', 'n', 'self', 'h'], answer: [['hp', 'n']],
          hints: ['Change the golem\'s own hp.', 'self.hp -= n'],
        },
        {
          type: 'write', vars: R => ({ a: R.int(5, 40), b: R.int(5, 40) }), text: 'Give Vault a method deposit(self, n) that adds n to self.gold. Then make a vault, deposit $a and $b, and print its gold.',
          starter: ['class Vault:', '    def __init__(self):', '        self.gold = 0'], keys: ['def', 'deposit', '(self, n):', 'self.gold', '+=', 'n', 'v', '=', 'Vault()', 'v.deposit', '(', ')', '$a', '$b', 'print', 'v.gold'],
          require: l => (has(l, /def\s+deposit\s*\(\s*self\s*,/) && has(l, /self\.gold\s*\+=/) ? null : 'Define deposit(self, n) that does self.gold += n.'),
          hints: ['    def deposit(self, n):', '        self.gold += n   then  v = Vault(), v.deposit($a), v.deposit($b), print(v.gold)'],
          solution: ['    def deposit(self, n):', '        self.gold += n', 'v = Vault()', 'v.deposit($a)', 'v.deposit($b)', 'print(v.gold)'],
        },
      ],
      learn: [{ title: 'State', code: 'def use(self, n):\n    self.charge -= n', text: 'Methods can change an object\'s attributes. The object remembers until the next change.' }],
    },
    {
      id: '21-6', title: 'Speaking objects', bg: 'forge', npc: 'forgemaster', mentor: 'forgemaster', tags: ['strdunder'],
      steps: [
        { type: 'talk', who: 'forgemaster', text: 'Print a golem and you get a strange label with a memory address. Carve a __str__ rune and the golem chooses what print shows. It must return a string.' },
        {
          type: 'predict', vars: R => ({ n: R.pick(GOLEMS) }), text: 'No __str__ yet. What will it say?',
          code: ['class Golem:', '    def __init__(self, name):', '        self.name = name', 'g = Golem("$n")', 'print(g)'],
          wrong: ['$n', 'Golem'],
          explain: 'Without __str__, Python prints the class name and where the object lives in memory. The address is different on every computer.',
        },
        { type: 'demo', vars: R => ({ n: R.pick(GOLEMS), h: R.int(10, 99) }), text: 'Now with __str__. Run it.', code: ['class Golem:', '    def __init__(self, name, hp):', '        self.name = name', '        self.hp = hp', '    def __str__(self):', '        return f"{self.name} ({self.hp} HP)"', 'g = Golem("$n", $h)', 'print(g)'] },
        {
          type: 'predict', vars: R => { const [a, b] = golem2(R); return { a, b }; }, text: 'f-strings and str() use __str__ too. What will it say?',
          code: ['class Golem:', '    def __init__(self, name):', '        self.name = name', '    def __str__(self):', '        return "Golem " + self.name', 'a = Golem("$a")', 'b = Golem("$b")', 'print(f"{a} and {b}")', 'print(len(str(a)))'],
          explain: 'Both golems speak through __str__. "Golem $a" has $(6 + a.length) characters.',
        },
        {
          type: 'fix', vars: R => ({ n: R.pick(GOLEMS) }), text: 'This __str__ prints instead of returning. Run it, then tap the broken line.',
          code: ['class Golem:', '    def __init__(self, name):', '        self.name = name', '    def __str__(self):', '        print(f"Golem {self.name}")', 'g = Golem("$n")', 'print(g)'], bad: 4,
          options: ['        return f"Golem {self.name}"', '        return "Golem {self.name}"', '        return self'], answer: 0,
          explain: '__str__ must return a string. print inside it returns None, and Python refuses that.',
        },
        {
          type: 'write', vars: R => ({ p: R.pick(['healing', 'fire', 'frost', 'speed']) }), text: 'Give Potion a __str__ that returns the kind followed by " potion". Then print(Potion("$p")).',
          starter: ['class Potion:', '    def __init__(self, kind):', '        self.kind = kind'], keys: ['def', '__str__', '(self):', 'return', 'self.kind', '+', '" potion"', 'print', 'Potion', '(', ')', '"$p"'],
          require: l => (has(l, /def\s+__str__\s*\(\s*self\s*\)/) && has(l, /return/) ? null : 'Define __str__(self) that returns a string.'),
          hints: ['    def __str__(self):', '        return self.kind + " potion"  then  print(Potion("$p"))'],
          solution: ['    def __str__(self):', '        return self.kind + " potion"', 'print(Potion("$p"))'],
        },
      ],
      learn: [{ title: '__str__', code: 'def __str__(self):\n    return f"{self.name}"', text: 'Decides what print(obj), str(obj) and f"{obj}" show. Must return a string.' }],
    },
    {
      id: '21-7', title: 'Golem armies', bg: 'forge', npc: 'tinker', mentor: 'tinker', tags: ['objlist'],
      steps: [
        { type: 'talk', who: 'tinker', text: 'One golem is nice. An army is better! Objects go in lists like any other value, and a for loop visits each one.' },
        { type: 'demo', vars: R => ({ ns: R.sample(GOLEMS, 3) }), text: 'Run it.', code: ['class Golem:', '    def __init__(self, name):', '        self.name = name', 'army = [Golem("$(ns[0])"), Golem("$(ns[1])"), Golem("$(ns[2])")]', 'for g in army:', '    print(g.name, "reporting")'] },
        {
          type: 'predict', vars: R => ({ ps: [R.int(2, 20), R.int(2, 20), R.int(2, 20)] }), text: 'Adding up the army. What will it say?',
          code: ['class Golem:', '    def __init__(self, power):', '        self.power = power', 'army = [Golem($(ps[0])), Golem($(ps[1])), Golem($(ps[2]))]', 'total = 0', 'for g in army:', '    total += g.power', 'print(total)'],
          explain: '$(ps.join(" + ")) = $(ps[0] + ps[1] + ps[2]).',
        },
        {
          type: 'predict', vars: R => { const ns = R.sample(GOLEMS, 3); return { ns, ps: R.sample([4, 9, 13, 17, 22, 28], 3) }; }, text: 'Which golem is strongest? What will it say?',
          code: ['class Golem:', '    def __init__(self, name, power):', '        self.name = name', '        self.power = power', 'army = [Golem("$(ns[0])", $(ps[0])), Golem("$(ns[1])", $(ps[1])), Golem("$(ns[2])", $(ps[2]))]', 'best = army[0]', 'for g in army:', '    if g.power > best.power:', '        best = g', 'print(best.name)'],
          explain: 'The loop keeps whichever golem has the most power.',
        },
        {
          type: 'predict', vars: R => ({ ns: R.sample(GOLEMS, 3), ps: R.sample([3, 8, 12, 15, 21, 26], 3), t: 11 }), text: 'A comprehension over objects. What will it say?',
          code: ['class Golem:', '    def __init__(self, name, power):', '        self.name = name', '        self.power = power', 'army = [Golem("$(ns[0])", $(ps[0])), Golem("$(ns[1])", $(ps[1])), Golem("$(ns[2])", $(ps[2]))]', 'print([g.name for g in army if g.power > $t])'],
          explain: 'Only golems with more than $t power make the list.',
        },
        {
          type: 'fill', vars: R => ({ ps: [R.int(2, 15), R.int(2, 15), R.int(2, 15)] }), text: 'Build a golem for each power in the list.',
          lines: ['class Golem:', '    def __init__(self, power):', '        self.power = power', 'army = list()', 'for p in [$(ps.join(", "))]:', '    army.append([](p))', 'print(len(army), army[-1].[])'],
          chips: ['Golem', 'power', 'p', 'army'], answer: [['Golem', 'power']],
          hints: ['Golem(p) builds one golem with power p.', 'army[-1].power is the last golem\'s power.'],
        },
        {
          type: 'write', vars: R => ({ ps: [R.int(3, 30), R.int(3, 30), R.int(3, 30)] }), text: 'powers holds three numbers. Build a Golem for each into a list called army, then print the total power of the army.',
          starter: ['class Golem:', '    def __init__(self, power):', '        self.power = power', 'powers = [$(ps.join(", "))]'], keys: ['army', '=', '[', ']', 'Golem', '(', ')', 'for', 'p', 'in', 'powers', ':', 'g', 'army', 'sum', 'g.power', 'print'],
          require: l => (has(l, /Golem\(/) && has(l, /army/) ? null : 'Build Golem objects into a list called army.'),
          hints: ['army = [Golem(p) for p in powers]', 'print(sum(g.power for g in army))  or add them up with a loop'],
          solution: ['army = [Golem(p) for p in powers]', 'total = 0', 'for g in army:', '    total += g.power', 'print(total)'],
        },
      ],
      learn: [{ title: 'Lists of objects', code: 'for g in army:\n    total += g.power', text: 'Store objects in lists and loop over them like any other values.' }],
    },
    {
      id: '21-8', title: 'Broken blueprints', bg: 'foundry', mentor: 'narrator', tags: ['ooperr'],
      foe: R => ({ kind: 'construct', hp: 60 }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'A construct built from broken blueprints stomps toward you! Spot each classic mistake before it spots you.' },
        {
          oneOf: [
            { type: 'predict', measure: 'errtype', vars: R => ({ n: R.pick(GOLEMS) }), text: 'Which error will this cause?', code: ['class Golem:', '    def __init__(self, name):', '        self.name = name', 'g = Golem("$n")', 'print(g.nmae)'], explain: 'nmae is a typo. The object has no such attribute: AttributeError.' },
            { type: 'predict', measure: 'errtype', vars: R => ({ n: R.pick(GOLEMS) }), text: 'Which error will this cause?', code: ['class Golem:', '    def __init__(self, name):', '        self.name = name', 'g = Golem()'], explain: '__init__ needs a name, and none was given: TypeError.' },
            { type: 'predict', measure: 'errtype', vars: R => ({ n: R.pick(GOLEMS) }), text: 'Which error will this cause?', code: ['class Golem:', '    def wave():', '        return "hi"', 'g = Golem()', 'print(g.wave())'], explain: 'wave has no self, but Python passes the golem anyway: TypeError.' },
          ],
        },
        {
          type: 'fix', vars: R => ({ p: R.int(20, 30) }), text: 'The construct has $HP HP. This attack crashes. Run it, then tap the broken line.',
          code: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(spark, power)', 'g = Golem($p)', 'g.attack()'], bad: 4,
          options: ['        cast(spark, self.power)', '        cast(spark, self.Power)', '        cast(spark, self)'], answer: 0,
          explain: 'Inside a method, attributes are reached through self. A bare power is a jar that does not exist there.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ p: R.int(5, 9) }), text: 'Calling the blueprint itself instead of a golem. Which error will this cause?',
          code: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(spark, self.power)', 'Golem.attack()'],
          explain: 'Golem.attack() has no golem to be self: TypeError. Build an object first.',
        },
        {
          type: 'write', vars: (R, c) => ({ h: c.foe.hp }), text: 'End it! $HP HP left. Build Golem($h) and make it attack.',
          starter: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def attack(self):', '        cast(spark, self.power)'], keys: ['g', '=', 'Golem', '(', ')', '$h', 'g.attack()'],
          goal: { foeDown: true },
          require: l => (has(l, /\.attack\(\)/) ? null : 'Call attack() on a golem object.'),
          hints: ['g = Golem($h)', 'g.attack()'],
          solution: ['g = Golem($h)', 'g.attack()'],
        },
      ],
      learn: [{ title: 'Classic OOP mistakes', code: 'self.power  not  power\ndef m(self):\nGolem(...)  then  g.m()', text: 'Use self. inside methods, give every method self, and call methods on objects, not the class.' }],
    },
    {
      id: '21-9', title: 'The Iron Colossus', bg: 'forgeheart', foe: { kind: 'colossus', hp: 200, weak: 'spark', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'colossus', text: 'I AM THE FIRST GOLEM. NO BLUEPRINT CAN MATCH ME.' },
        { type: 'talk', who: 'narrator', text: 'The Iron Colossus has 200 HP. Spark shorts its circuits for double damage. Icebolt barely chills it.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ a: R.int(5, 9), b: R.int(5, 9) }), text: 'How much damage will this deal? Spark is doubled.',
          code: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def zap(self):', '        cast(spark, self.power)', 'for p in [$a, $b]:', '    Golem(p).zap()'],
          explain: '($a + $b) doubled by spark = $(2 * (a + b)).',
        },
        {
          type: 'fix', vars: R => ({ p: R.int(10, 16) }), text: 'The Colossus jammed your golem\'s blueprint! Run it, then tap the broken line.',
          code: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def zap(self):', '        cast(spark, self.power)', '        return self.power', 'g = Golem($p)', 'print(g.zap)'], bad: 7,
          options: ['print(g.zap())', 'print(Golem.zap())', 'print(zap(g))'], answer: 0,
          explain: 'Without brackets the method is only looked at, never called. Python just prints what it is.',
        },
        { type: 'talk', who: 'colossus', text: 'MY ARMOR... REMEMBERS EVERY HIT.' },
        {
          type: 'fill', vars: R => ({ c: R.int(10, 15), k: 3 }), text: 'Charge the golem three times, then release the charge as a spark.',
          lines: ['class Golem:', '    def __init__(self):', '        self.charge = 0', '    def charge_up(self, n):', '        self.[] += n', '    def release(self):', '        cast(spark, self.charge)', 'g = Golem()', 'for i in range($k):', '    g.charge_up($c)', 'g.[]()'],
          chips: ['charge', 'release', 'n', 'zap'], answer: [['charge', 'release']],
          hints: ['charge_up should add n to self.charge.', 'Then call g.release().'],
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), text: 'Final blow! $HP HP left, and spark is doubled. Write class Golem with __init__(self, power) and a method zap(self) that casts spark with self.power. Then build Golem($q) and zap.',
          starter: [], keys: ['class', 'Golem', ':', 'def', '__init__', 'zap', '(self, power):', '(self):', 'self.power', '=', 'power', 'cast', 'spark', ',', 'g', 'Golem($q)', 'g.zap()'],
          goal: { foeDown: true },
          require: l => (has(l, /class\s+Golem/) && has(l, /def\s+__init__/) && has(l, /def\s+zap\s*\(\s*self/) ? null : 'Write the whole class: __init__ and zap.'),
          hints: ['class Golem: / def __init__(self, power): / self.power = power', 'def zap(self): / cast(spark, self.power)  then  g = Golem($q) and g.zap()'],
          solution: ['class Golem:', '    def __init__(self, power):', '        self.power = power', '    def zap(self):', '        cast(spark, self.power)', 'g = Golem($q)', 'g.zap()'],
        },
        { type: 'talk', who: 'colossus', text: '...a blueprint... better than mine... build well, maker.' },
      ],
      learn: [{ title: 'Your first class', code: 'class Golem:\n    def __init__(self, power):\n        self.power = power\n    def zap(self):\n        ...', text: 'Blueprint, __init__, attributes, methods. That is the heart of object-oriented programming.' }],
    },
  ],
};
WORLDS.push(WORLD21);
