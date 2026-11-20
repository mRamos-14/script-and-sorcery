/* World 50: The Gauntlet. Capstone projects, each built step by step:
   the arithmetic arranger, the time calculator, the budget ledger, the shape calculator and
   the probability hat (freeCodeCamp's Scientific Computing with Python projects), a mailbox
   report (Python for Everybody, chapters 9-10), and two of our own: a text adventure and a
   grade book. Then the Champion of the Gauntlet. */
Object.assign(EXTRA.npcs, {
  marshal: { name: 'Marshal Tova', colors: ['#c23b2e', '#f0c53a', '#91603e'] },
});
Object.assign(EXTRA.foes, {
  champion: { base: 'usurper', name: 'The Gauntlet Champion', pal: {} },
});

const G50_ARR_START = ['def arrange(problems, show=False):', '    if len(problems) > 5:', '        return "Error: Too many problems."', '    tops, bottoms, dashes, sums = list(), list(), list(), list()', '    for p in problems:', '        a, op, b = p.split()', '        if op not in "+-":', '            return "Error: Operator must be \'+\' or \'-\'."', '        if not (a.isdigit() and b.isdigit()):', '            return "Error: Numbers must only contain digits."', '        if len(a) > 4 or len(b) > 4:', '            return "Error: Numbers cannot be more than four digits."'];
const G50_ARR_BODY = ['        width = max(len(a), len(b)) + 2', '        tops.append(a.rjust(width))', '        bottoms.append(op + b.rjust(width - 1))', '        dashes.append("-" * width)', '        result = int(a) + int(b) if op == "+" else int(a) - int(b)', '        sums.append(str(result).rjust(width))', '    rows = [tops, bottoms, dashes] + ([sums] if show else [])', '    return "\\n".join("    ".join(r) for r in rows)'];
const G50_TIME_HELP = ['def to_minutes(clock):', '    hm, half = clock.split()', '    h, m = map(int, hm.split(":"))', '    if half == "PM" and h != 12:', '        h += 12', '    if half == "AM" and h == 12:', '        h = 0', '    return h * 60 + m', 'def to_clock(minutes):', '    h, m = divmod(minutes % 1440, 60)', '    half = "AM" if h < 12 else "PM"', '    return f"{h % 12 or 12}:{m:02d} {half}"'];
const G50_CATEGORY = ['class Category:', '    def __init__(self, name):', '        self.name = name', '        self.ledger = list()', '    def deposit(self, amount, description=""):', '        self.ledger.append({"amount": amount, "description": description})', '    def get_balance(self):', '        return sum(item["amount"] for item in self.ledger)', '    def check_funds(self, amount):', '        return amount <= self.get_balance()', '    def withdraw(self, amount, description=""):', '        if not self.check_funds(amount):', '            return False', '        self.ledger.append({"amount": -amount, "description": description})', '        return True'];
const G50_RECT = ['class Rectangle:', '    def __init__(self, width, height):', '        self.width = width', '        self.height = height', '    def __str__(self):', '        return f"Rectangle(width={self.width}, height={self.height})"', '    def get_area(self):', '        return self.width * self.height', '    def get_perimeter(self):', '        return 2 * (self.width + self.height)', '    def get_diagonal(self):', '        return (self.width ** 2 + self.height ** 2) ** 0.5', '    def get_picture(self):', '        if self.width > 50 or self.height > 50:', '            return "Too big for picture."', '        return ("*" * self.width + "\\n") * self.height', '    def get_amount_inside(self, shape):', '        return (self.width // shape.width) * (self.height // shape.height)'];
const G50_SQUARE = ['class Square(Rectangle):', '    def __init__(self, side):', '        super().__init__(side, side)', '    def __str__(self):', '        return f"Square(side={self.width})"', '    def set_side(self, side):', '        self.width = side', '        self.height = side'];
const G50_HAT = ['import random, copy', 'class Hat:', '    def __init__(self, **balls):', '        self.contents = list()', '        for colour, n in balls.items():', '            self.contents += [colour] * n', '    def draw(self, n):', '        if n >= len(self.contents):', '            drawn = self.contents', '            self.contents = list()', '            return drawn', '        drawn = list()', '        for i in range(n):', '            drawn.append(self.contents.pop(random.randrange(len(self.contents))))', '        return drawn'];
const G50_MBOX = { 'mbox.txt': 'From ann@guild.org Sat Jan  5 09:14:16 2008\nSubject: maps\n\nFrom bo@keep.net Sat Jan  5 18:10:48 2008\nSubject: gold\n\nFrom ann@guild.org Fri Jan  4 16:10:39 2008\nSubject: dragons\n\nFrom cy@guild.org Fri Jan  4 09:32:12 2008\nSubject: tea\n\nFrom ann@guild.org Thu Jan  3 18:01:00 2008\nSubject: more maps\n' };
const G50_ROOMS = ['rooms = {', '    "gate": {"text": "A rusty gate.", "exits": {"north": "hall"}, "items": list()},', '    "hall": {"text": "A dusty hall.", "exits": {"south": "gate", "east": "vault"}, "items": ["key"]},', '    "vault": {"text": "A locked vault.", "exits": {"west": "hall"}, "items": ["crown"]},', '}'];
const G50_GRADES = { 'grades.csv': 'name,score\nada,91\nbo,78\ncy,85\nada,87\nbo,62\ncy,95\n' };

const WORLD50 = {
  id: 50, name: 'The Gauntlet', topic: 'capstone projects',
  nodes: [[50, 92], [28, 82], [66, 72], [34, 62], [68, 52], [32, 42], [64, 32], [40, 21], [54, 8]],
  levels: [
    {
      id: '50-1', title: 'The Arithmetic Arranger', bg: 'proving', npc: 'marshal', mentor: 'marshal', tags: ['projarith'],
      steps: [
        { type: 'talk', who: 'marshal', text: 'Welcome to the Gauntlet, {NAME}. No new spells here: only PROJECTS, built from everything you know. First, freeCodeCamp\'s arithmetic arranger: take problems like "32 + 698" and stack them the way children write sums, side by side.' },
        { type: 'talk', who: 'marshal', text: 'Each problem is as wide as its longest number plus 2 (room for the operator and a space). The top number is right-aligned; the bottom line is the operator then the number right-aligned in width - 1; then dashes. Problems sit 4 spaces apart. Bad input returns an error message instead.' },
        { type: 'demo', text: 'One problem, stacked. Run it.', code: ['a, op, b = "32 + 698".split()', 'width = max(len(a), len(b)) + 2', 'print(a.rjust(width))', 'print(op + b.rjust(width - 1))', 'print("-" * width)'] },
        {
          type: 'predict', vars: R => ({ a: R.pick(['7', '45', '123', '9999']), b: R.pick(['3', '80', '512']) }), text: 'How wide is the problem "$a + $b"? What will it say?', code: ['a, op, b = "$a + $b".split()', 'width = max(len(a), len(b)) + 2', 'print(width, repr(a.rjust(width)))'],
          explain: 'The longer number decides the width, plus 2.',
        },
        {
          type: 'predict', text: 'Validation first. What will it say?', code: [...G50_ARR_START, '    return "ok"', 'print(arrange(["1 + 2", "3 * 4"]))', 'print(arrange(["12345 + 1"]))', 'print(arrange(["1 + 2"] * 6))', 'print(arrange(["1a + 2"]))'],
          explain: 'Each rule returns its own error message; the first broken rule wins.',
        },
        {
          type: 'fill', text: 'Join the problems on one line, four spaces apart.',
          lines: ['tops = ["   32", "  3801", "   45"]', 'print("[]".join(tops))'], chips: ['    ', ' ', '\\t'], answer: [['    ']],
          hints: ['Four spaces between problems.', '"    ".join(tops)'],
        },
        {
          type: 'predict', text: 'The whole arranger. What will it say?', code: [...G50_ARR_START, ...G50_ARR_BODY, 'print(arrange(["32 + 698", "3801 - 2", "45 + 43"], True))'],
          explain: 'Three stacked problems, with answers because show is True.',
        },
        {
          type: 'write', text: 'Finish the arranger loop (no answers line this time): for each problem compute width, append the right-aligned top, the operator line and the dashes, then after the loop return the three rows joined with "\\n", each row joined with four spaces. Print arrange(["3 + 855", "988 + 40"]).',
          starter: ['def arrange(problems):', '    tops, bottoms, dashes = list(), list(), list()', '    for p in problems:', '        a, op, b = p.split()'], keys: ['width', '=', 'max', '(', ')', 'len(a)', 'len(b)', ',', '+', '2', 'tops.append', 'a.rjust(width)', 'bottoms.append', 'op', 'b.rjust(width - 1)', 'dashes.append', '"-" * width', 'return', '"\\n".join', '"    ".join(tops)', '"    ".join(bottoms)', '"    ".join(dashes)', '[', ']', 'print', 'arrange', '["3 + 855", "988 + 40"]'],
          require: l => (has(l, /rjust\(width - 1\)/) ? null : 'The bottom line is op + b.rjust(width - 1).'),
          hints: ['        width = max(len(a), len(b)) + 2\n        tops.append(a.rjust(width))\n        bottoms.append(op + b.rjust(width - 1))\n        dashes.append("-" * width)', '    return "\\n".join(["    ".join(tops), "    ".join(bottoms), "    ".join(dashes)])\nprint(arrange(["3 + 855", "988 + 40"]))'],
          solution: ['        width = max(len(a), len(b)) + 2', '        tops.append(a.rjust(width))', '        bottoms.append(op + b.rjust(width - 1))', '        dashes.append("-" * width)', '    return "\\n".join(["    ".join(tops), "    ".join(bottoms), "    ".join(dashes)])', 'print(arrange(["3 + 855", "988 + 40"]))'],
        },
      ],
      learn: [{ title: 'Arithmetic arranger', code: 'width = max(len(a), len(b)) + 2\na.rjust(width)\nop + b.rjust(width - 1)\n"    ".join(row)', text: 'Validate first, then build each row and join.' }],
    },
    {
      id: '50-2', title: 'The Time Calculator', bg: 'clocktower', npc: 'marshal', mentor: 'marshal', tags: ['projtime'],
      steps: [
        { type: 'talk', who: 'marshal', text: 'Second trial, also from freeCodeCamp: add_time("11:43 PM", "24:20") should say "12:03 AM (2 days later)". The trick is to stop thinking in clocks: turn everything into MINUTES since midnight, add, then turn it back.' },
        { type: 'talk', who: 'marshal', text: 'divmod(total, 1440) splits minutes into whole days and the minute of the day. Back on a 12-hour clock: hour 0 is 12 AM, 12 is 12 PM, 13 is 1 PM. h % 12 or 12 does that in one go.' },
        { type: 'demo', text: 'The helpers. Run it.', code: [...G50_TIME_HELP, 'print(to_minutes("3:30 PM"), to_minutes("12:05 AM"), to_minutes("12:05 PM"))', 'print(to_clock(930), to_clock(5), to_clock(725), to_clock(1500))'] },
        {
          type: 'predict', vars: R => ({ m: R.int(1500, 4400) }), text: 'Days and minutes. What will it say?', code: ['days, rest = divmod($m, 1440)', 'print(days, rest, divmod(rest, 60))'],
          explain: '1440 minutes per day, then 60 minutes per hour.',
        },
        {
          type: 'predict', text: 'The 12-hour clock. What will it say?', code: ['for h in [0, 9, 12, 13, 23]:', '    print(h, "->", h % 12 or 12, "AM" if h < 12 else "PM")'],
          explain: 'h % 12 is 0 at midnight and noon, and "or 12" turns that 0 into 12.',
        },
        {
          type: 'predict', text: 'Zero-padding the minutes. What will it say?', code: ['for m in [5, 30]:', '    print(f"7:{m:02d}", f"7:{m}")'],
          explain: ':02d pads with a zero to two digits.',
        },
        {
          type: 'fill', text: 'Say how many days later it is.',
          lines: [...G50_TIME_HELP, 'def later(days):', '    if days == 0:', '        return ""', '    if days == 1:', '        return " (next day)"', '    return f" ({[]} days later)"', 'print(repr(later(0)), later(1), later(3))'], chips: ['days', 'days + 1', '"days"'], answer: [['days']],
          hints: ['Put the number of days in the message.', '{days}'],
        },
        {
          type: 'write', text: 'Using the helpers, write add_time(start, duration): duration is "H:MM". Work out total = to_minutes(start) + hours * 60 + minutes, then days = total // 1440. Return to_clock(total), plus " (next day)" when days is 1, or f" ({days} days later)" when more. Print add_time("11:43 PM", "24:20") and add_time("3:00 PM", "3:10").',
          starter: G50_TIME_HELP, keys: ['def', 'add_time', '(', ')', ':', 'start', 'duration', ',', 'dh', 'dm', '=', 'map', 'int', 'duration.split(":")', 'total', 'to_minutes(start)', '+', 'dh * 60', 'days', 'total // 1440', 'text', 'to_clock(total)', 'if', 'elif', '==', '1', '>', '+=', '" (next day)"', 'f" ({days} days later)"', 'return', 'print', '"11:43 PM"', '"24:20"', '"3:00 PM"', '"3:10"'],
          require: l => (has(l, /def add_time/) && has(l, /1440/) ? null : 'Write add_time and use 1440 minutes per day.'),
          hints: ['def add_time(start, duration):\n    dh, dm = map(int, duration.split(":"))\n    total = to_minutes(start) + dh * 60 + dm\n    days = total // 1440\n    text = to_clock(total)', '    if days == 1:\n        text += " (next day)"\n    elif days > 1:\n        text += f" ({days} days later)"\n    return text\nprint(add_time("11:43 PM", "24:20"))\nprint(add_time("3:00 PM", "3:10"))'],
          solution: ['def add_time(start, duration):', '    dh, dm = map(int, duration.split(":"))', '    total = to_minutes(start) + dh * 60 + dm', '    days = total // 1440', '    text = to_clock(total)', '    if days == 1:', '        text += " (next day)"', '    elif days > 1:', '        text += f" ({days} days later)"', '    return text', 'print(add_time("11:43 PM", "24:20"))', 'print(add_time("3:00 PM", "3:10"))'],
        },
      ],
      learn: [{ title: 'Time calculator', code: 'total = to_minutes(start) + added\ndays, rest = divmod(total, 1440)\nf"{h % 12 or 12}:{m:02d}"', text: 'Convert to one unit, do the maths, convert back.' }],
    },
    {
      id: '50-3', title: 'The Budget Ledger', bg: 'bazaar', npc: 'marshal', mentor: 'marshal', tags: ['projbudget'],
      steps: [
        { type: 'talk', who: 'marshal', text: 'Third trial: freeCodeCamp\'s budget app. A Category ("Food", "Gear") keeps a LEDGER, a list of {"amount", "description"} entries. Deposits are positive, withdrawals negative, and the balance is their sum.' },
        { type: 'talk', who: 'marshal', text: 'withdraw refuses (returns False) when funds are short. transfer is a withdraw here plus a deposit there. And printing a category shows a 30-wide title line of stars, each entry as description (23 wide) and amount (7 wide, 2 decimals), then the total.' },
        { type: 'demo', text: 'The ledger. Run it.', code: [...G50_CATEGORY, 'food = Category("Food")', 'food.deposit(100, "starting gold")', 'print(food.withdraw(10.15, "bread"), food.withdraw(500, "feast"))', 'print(food.get_balance(), food.ledger[-1])'] },
        {
          type: 'predict', vars: R => ({ a: R.int(20, 60), b: R.int(5, 15) }), text: 'What will it say?', code: [...G50_CATEGORY, 'gear = Category("Gear")', 'gear.deposit($a, "pay")', 'gear.withdraw($b, "rope")', 'print(gear.check_funds($a), gear.get_balance())'],
          explain: 'After the rope, $a is more than the balance of $a - $b.',
        },
        {
          type: 'predict', text: 'The title line. What will it say?', code: ['for name in ["Food", "Gear"]:', '    print(name.center(30, "*"))', 'print(f"{\'bread\':<23}{-10.15:>7.2f}")'],
          explain: 'center pads both sides with stars; the entry line is 23 + 7 = 30 wide.',
        },
        {
          type: 'predict', text: 'Long descriptions are cut. What will it say?', code: ['desc = "restaurant and more food for dessert"', 'print(repr(desc[:23]), len(f"{desc[:23]:<23}{1234.5:>7.2f}"))'],
          explain: 'Only the first 23 characters of a description are shown, keeping every line 30 wide.',
        },
        {
          type: 'fill', text: 'A transfer: take it out here, then put it in there.',
          lines: [...G50_CATEGORY, '    def transfer(self, amount, other):', '        if not self.withdraw(amount, f"Transfer to {other.name}"):', '            return False', '        other.[](amount, f"Transfer from {self.name}")', '        return True', 'food, gear = Category("Food"), Category("Gear")', 'food.deposit(50)', 'print(food.transfer(20, gear), food.get_balance(), gear.get_balance())'], chips: ['deposit', 'withdraw', 'transfer'], answer: [['deposit']],
          hints: ['The other category receives the money.', 'other.deposit(...)'],
        },
        {
          type: 'write', text: 'Add __str__ to Category: a title line name.center(30, "*"), then a line per entry f"{desc[:23]:<23}{amount:>7.2f}", then f"Total: {balance:.2f}", all joined with "\\n". Make Food, deposit 900 "deposit", withdraw 45.67 "milk, cereal, eggs, bacon, bread", and print it.',
          starter: [...G50_CATEGORY], keys: ['    def __str__(self):', 'lines', '=', '[', ']', 'self.name.center(30, "*")', 'for', 'item', 'in', 'self.ledger', ':', 'lines.append', 'f"{item[\'description\'][:23]:<23}{item[\'amount\']:>7.2f}"', 'f"Total: {self.get_balance():.2f}"', 'return', '"\\n".join(lines)', 'food', 'Category("Food")', 'food.deposit(900, "deposit")', 'food.withdraw(45.67, "milk, cereal, eggs, bacon, bread")', 'print(food)'],
          require: l => (has(l, /def __str__/) && has(l, /center\(30/) ? null : 'Write __str__ with a centred 30-wide title.'),
          hints: ['    def __str__(self):\n        lines = [self.name.center(30, "*")]\n        for item in self.ledger:\n            lines.append(f"{item[\'description\'][:23]:<23}{item[\'amount\']:>7.2f}")', '        lines.append(f"Total: {self.get_balance():.2f}")\n        return "\\n".join(lines)\nfood = Category("Food")\nfood.deposit(900, "deposit")\nfood.withdraw(45.67, "milk, cereal, eggs, bacon, bread")\nprint(food)'],
          solution: ['    def __str__(self):', '        lines = [self.name.center(30, "*")]', '        for item in self.ledger:', '            lines.append(f"{item[\'description\'][:23]:<23}{item[\'amount\']:>7.2f}")', '        lines.append(f"Total: {self.get_balance():.2f}")', '        return "\\n".join(lines)', 'food = Category("Food")', 'food.deposit(900, "deposit")', 'food.withdraw(45.67, "milk, cereal, eggs, bacon, bread")', 'print(food)'],
        },
      ],
      learn: [{ title: 'Budget ledger', code: 'ledger.append({"amount": -x, "description": d})\nsum(i["amount"] for i in ledger)\nname.center(30, "*")', text: 'A list of entries is the whole truth; the balance is computed from it.' }],
    },
    {
      id: '50-4', title: 'The Shape Calculator', bg: 'gearworks', npc: 'marshal', mentor: 'marshal', tags: ['projshapes'],
      steps: [
        { type: 'talk', who: 'marshal', text: 'Fourth trial: freeCodeCamp\'s polygon area calculator. A Rectangle knows its area, perimeter, diagonal and can draw itself in stars. A Square IS a Rectangle whose sides match, so it inherits all of that and only changes how it is made and named.' },
        { type: 'demo', text: 'Shapes. Run it.', code: [...G50_RECT, ...G50_SQUARE, 'r = Rectangle(5, 3)', 'print(r, r.get_area(), r.get_perimeter())', 'print(r.get_picture())', 's = Square(2)', 'print(s, s.get_area(), isinstance(s, Rectangle))'] },
        {
          type: 'predict', vars: R => ({ w: R.int(3, 6), h: R.int(2, 4) }), text: 'What will it say?', code: [...G50_RECT, 'r = Rectangle($w, $h)', 'print(r.get_area(), r.get_perimeter(), round(r.get_diagonal(), 2))'],
          explain: 'Area w × h, perimeter 2(w + h), diagonal by Pythagoras.',
        },
        {
          type: 'predict', text: 'How many fit inside? What will it say?', code: [...G50_RECT, ...G50_SQUARE, 'big = Rectangle(16, 8)', 'print(big.get_amount_inside(Square(4)), big.get_amount_inside(Rectangle(5, 3)))'],
          explain: '(16 // 4) × (8 // 4) = 8 squares; (16 // 5) × (8 // 3) = 3 × 2 rectangles.',
        },
        {
          type: 'predict', text: 'Changing a square. What will it say?', code: [...G50_RECT, ...G50_SQUARE, 's = Square(9)', 's.set_side(4)', 'print(s, s.get_area(), Rectangle(60, 2).get_picture())'],
          explain: 'set_side changes both sides; anything over 50 wide is too big to draw.',
        },
        {
          type: 'predict', text: 'A small picture. What will it say?', code: [...G50_RECT, 'print(Rectangle(4, 2).get_picture(), end="")'],
          explain: 'Each row is width stars and a newline, repeated height times.',
        },
        {
          type: 'fill', text: 'A square is made from one side, used twice.',
          lines: [...G50_RECT, 'class Square(Rectangle):', '    def __init__(self, side):', '        super().__init__([])', 's = Square(6)', 'print(s.get_area(), s.get_perimeter())'], chips: ['side, side', 'side', 'side * side'], answer: [['side, side']],
          hints: ['Rectangle needs a width and a height.', 'super().__init__(side, side)'],
        },
        {
          type: 'write', text: 'Write class Square(Rectangle) with __init__(self, side) calling super().__init__(side, side), and __str__ returning f"Square(side={self.width})". Print Square(3), its area and Rectangle(9, 6).get_amount_inside(Square(3)).',
          starter: G50_RECT, keys: ['class', 'Square', '(', ')', 'Rectangle', ':', 'def', '__init__', 'self', 'side', ',', 'super().__init__', 'side, side', '__str__', 'return', 'f"Square(side={self.width})"', 'print', 'Square(3)', '.get_area()', 'Rectangle(9, 6)', '.get_amount_inside'],
          require: l => (has(l, /class Square\(Rectangle\)/) && has(l, /super\(\)\.__init__/) ? null : 'Inherit from Rectangle and call super().__init__.'),
          hints: ['class Square(Rectangle):\n    def __init__(self, side):\n        super().__init__(side, side)\n    def __str__(self):\n        return f"Square(side={self.width})"', 'print(Square(3), Square(3).get_area(), Rectangle(9, 6).get_amount_inside(Square(3)))'],
          solution: ['class Square(Rectangle):', '    def __init__(self, side):', '        super().__init__(side, side)', '    def __str__(self):', '        return f"Square(side={self.width})"', 'print(Square(3), Square(3).get_area(), Rectangle(9, 6).get_amount_inside(Square(3)))'],
        },
      ],
      learn: [{ title: 'Shape calculator', code: 'class Square(Rectangle):\n    def __init__(self, side):\n        super().__init__(side, side)', text: 'Inherit the maths; change only what differs.' }],
    },
    {
      id: '50-5', title: 'The Probability Hat', bg: 'observatory', npc: 'marshal', mentor: 'marshal', tags: ['projhat'],
      steps: [
        { type: 'talk', who: 'marshal', text: 'Fifth trial: freeCodeCamp\'s probability calculator. A Hat holds coloured balls: Hat(red=3, blue=2). draw(n) takes n at random, without putting them back. Then we ESTIMATE a probability by running the experiment many times and counting successes.' },
        { type: 'talk', who: 'marshal', text: 'Each experiment needs a fresh hat, so copy.deepcopy the original first. And random.seed(...) makes the "random" draws repeatable, so we can check our answers.' },
        { type: 'demo', text: 'A hat. Run it.', code: [...G50_HAT, 'random.seed(7)', 'hat = Hat(red=3, blue=2)', 'print(hat.contents)', 'print(hat.draw(2), hat.contents)'] },
        {
          type: 'predict', text: 'Drawing more than the hat holds. What will it say?', code: [...G50_HAT, 'hat = Hat(green=1, gold=2)', 'print(hat.draw(10), hat.contents)'],
          explain: 'Asking for too many returns everything and empties the hat.',
        },
        {
          type: 'predict', text: 'A fresh copy each time. What will it say?', code: [...G50_HAT, 'hat = Hat(red=2)', 'trial = copy.deepcopy(hat)', 'trial.draw(1)', 'print(len(hat.contents), len(trial.contents))'],
          explain: 'Drawing from the copy leaves the original hat full.',
        },
        {
          type: 'predict', text: 'Did we get what we wanted? What will it say?', code: ['from collections import Counter', 'expected = {"red": 2, "blue": 1}', 'for drawn in [["red", "blue", "red"], ["red", "blue", "blue"]]:', '    got = Counter(drawn)', '    print(all(got[c] >= n for c, n in expected.items()))'],
          explain: 'Success means at least the expected number of every colour.',
        },
        {
          type: 'fill', text: 'Each experiment must use a fresh copy of the hat.',
          lines: [...G50_HAT, 'hat = Hat(red=3)', 'for i in range(2):', '    trial = copy.[](hat)', '    trial.draw(3)', 'print(len(hat.contents))'], chips: ['deepcopy', 'copy', 'Hat'], answer: [['deepcopy']],
          require: s => (s[0] === 'deepcopy' ? null : 'A shallow copy would share the contents list. Copy deeply.'),
          hints: ['A full, independent copy.', 'copy.deepcopy(hat)'],
        },
        {
          type: 'write', text: 'Write experiment(hat, expected, n_drawn, runs): repeat runs times, drawing n_drawn balls from a deepcopy of hat, counting a success when the drawn Counter has at least expected[c] of every colour c. Return successes / runs. With random.seed(1), print experiment(Hat(red=2, blue=3, green=1), {"red": 1, "blue": 1}, 3, 40).',
          starter: [...G50_HAT, 'from collections import Counter'], keys: ['def', 'experiment', '(', ')', ':', 'hat', 'expected', 'n_drawn', 'runs', ',', 'wins', '=', '0', 'for', 'i', 'in', 'range', 'got', 'Counter', 'copy.deepcopy(hat)', '.draw(n_drawn)', 'if', 'all', 'got[c] >= n', 'c, n', 'expected.items()', '+=', '1', 'return', 'wins / runs', 'random.seed(1)', 'print', 'Hat(red=2, blue=3, green=1)', '{"red": 1, "blue": 1}', '3', '40'],
          require: l => (has(l, /deepcopy/) && has(l, /def experiment/) ? null : 'Write experiment and deepcopy the hat each run.'),
          hints: ['def experiment(hat, expected, n_drawn, runs):\n    wins = 0\n    for i in range(runs):\n        got = Counter(copy.deepcopy(hat).draw(n_drawn))\n        if all(got[c] >= n for c, n in expected.items()):\n            wins += 1\n    return wins / runs', 'random.seed(1)\nprint(experiment(Hat(red=2, blue=3, green=1), {"red": 1, "blue": 1}, 3, 40))'],
          solution: ['def experiment(hat, expected, n_drawn, runs):', '    wins = 0', '    for i in range(runs):', '        got = Counter(copy.deepcopy(hat).draw(n_drawn))', '        if all(got[c] >= n for c, n in expected.items()):', '            wins += 1', '    return wins / runs', 'random.seed(1)', 'print(experiment(Hat(red=2, blue=3, green=1), {"red": 1, "blue": 1}, 3, 40))'],
        },
      ],
      learn: [{ title: 'Probability by experiment', code: 'trial = copy.deepcopy(hat)\ndrawn = trial.draw(n)\nwins / runs', text: 'Repeat a random experiment many times; the success rate estimates the probability.' }],
    },
    {
      id: '50-6', title: 'The Mailbox Report', bg: 'archive', npc: 'marshal', mentor: 'marshal', tags: ['projmail'],
      steps: [
        { type: 'talk', who: 'marshal', text: 'Sixth trial, from Python for Everybody: a mailbox file. Every message starts with a line like "From ann@guild.org Sat Jan  5 09:14:16 2008". Read the file, find those lines, and report who sends the most mail and at which hours.' },
        { type: 'talk', who: 'marshal', text: 'Careful: only lines that START with "From " (with the space) count. split() breaks the line into words: the address is word 1, and the time is word 5, whose first two characters are the hour.' },
        { type: 'demo', files: G50_MBOX, text: 'The From lines. Run it.', code: ['with open("mbox.txt") as f:', '    for line in f:', '        if line.startswith("From "):', '            words = line.split()', '            print(words[1], words[5])'] },
        {
          type: 'predict', text: 'Picking out the parts. What will it say?', code: ['line = "From cy@guild.org Fri Jan  4 09:32:12 2008"', 'words = line.split()', 'print(words[1], words[1].split("@")[1], words[5][:2])'],
          explain: 'split() ignores the double space; the domain is after the @, the hour is the first two characters of the time.',
        },
        {
          type: 'predict', files: G50_MBOX, text: 'Counting senders. What will it say?', code: ['from collections import Counter', 'senders = Counter()', 'for line in open("mbox.txt"):', '    if line.startswith("From "):', '        senders[line.split()[1]] += 1', 'print(senders.most_common(1), len(senders))'],
          explain: 'ann wrote three of the five messages.',
        },
        {
          type: 'predict', files: G50_MBOX, text: 'Mail by hour, sorted. What will it say?', code: ['from collections import Counter', 'hours = Counter(line.split()[5][:2] for line in open("mbox.txt") if line.startswith("From "))', 'for hour, n in sorted(hours.items()):', '    print(hour, n)'],
          explain: 'Count the hour of each message, then print them in hour order.',
        },
        {
          type: 'fill', files: G50_MBOX, text: 'Only the lines that begin a message.',
          lines: ['n = 0', 'for line in open("mbox.txt"):', '    if line.[]("From "):', '        n += 1', 'print(n)'], chips: ['startswith', 'endswith', 'find'], answer: [['startswith']],
          hints: ['The line must BEGIN with "From ".', 'line.startswith("From ")'],
        },
        {
          type: 'write', files: G50_MBOX, text: 'Report the domains: count the part after "@" in each sender address with a Counter, then print each domain and count from most_common().',
          starter: ['from collections import Counter', 'domains = Counter()'], keys: ['for', 'line', 'in', 'open("mbox.txt")', ':', 'if', 'line.startswith("From ")', 'domain', '=', 'line.split()[1]', '.split("@")[1]', 'domains[domain]', '+=', '1', 'd', 'n', ',', 'domains.most_common()', 'print'],
          require: l => (has(l, /startswith\("From "\)/) && has(l, /most_common/) ? null : 'Use startswith("From ") and most_common().'),
          hints: ['for line in open("mbox.txt"):\n    if line.startswith("From "):\n        domain = line.split()[1].split("@")[1]\n        domains[domain] += 1', 'for d, n in domains.most_common():\n    print(d, n)'],
          solution: ['for line in open("mbox.txt"):', '    if line.startswith("From "):', '        domain = line.split()[1].split("@")[1]', '        domains[domain] += 1', 'for d, n in domains.most_common():', '    print(d, n)'],
        },
      ],
      learn: [{ title: 'Mailbox report', code: 'if line.startswith("From "):\n    words = line.split()\n    sender, hour = words[1], words[5][:2]', text: 'Filter the lines, split them, count what matters.' }],
    },
    {
      id: '50-7', title: 'The Text Adventure', bg: 'keep', npc: 'marshal', mentor: 'marshal', tags: ['projadventure'],
      steps: [
        { type: 'talk', who: 'marshal', text: 'Seventh trial, one of ours: a TEXT ADVENTURE. The world is data: a dict of rooms, each with text, exits and items. The game is a loop: read a command, split it into a verb and a noun, and match the verb.' },
        { type: 'talk', who: 'marshal', text: 'State lives in a few variables: the current room and the inventory. Every command either changes that state or explains why it cannot. Here the commands come from a list, so we can test the whole game.' },
        { type: 'demo', text: 'The rooms. Run it.', code: [...G50_ROOMS, 'room = "gate"', 'print(rooms[room]["text"], list(rooms[room]["exits"]))', 'room = rooms[room]["exits"]["north"]', 'print(rooms[room]["text"], rooms[room]["items"])'] },
        {
          type: 'predict', text: 'Splitting commands. What will it say?', code: ['for cmd in ["go north", "look", "take golden key"]:', '    verb, _, noun = cmd.partition(" ")', '    print(repr(verb), repr(noun))'],
          explain: 'partition splits at the first space only, so nouns can have spaces and a lone verb gets "".',
        },
        {
          type: 'predict', text: 'A short walk. What will it say?', code: [...G50_ROOMS, 'room, bag = "gate", list()', 'for cmd in ["go north", "take key", "go east", "go up"]:', '    verb, _, noun = cmd.partition(" ")', '    match verb:', '        case "go":', '            if noun in rooms[room]["exits"]:', '                room = rooms[room]["exits"][noun]', '            else:', '                print("You cannot go", noun)', '        case "take":', '            rooms[room]["items"].remove(noun)', '            bag.append(noun)', 'print(room, bag)'],
          explain: 'North to the hall, take the key, east to the vault; there is no way up.',
        },
        {
          type: 'predict', text: 'Winning needs the key. What will it say?', code: [...G50_ROOMS, 'def open_vault(bag):', '    return "The vault swings open!" if "key" in bag else "It is locked."', 'print(open_vault(list()))', 'print(open_vault(["key"]))'],
          explain: 'The ending depends on the state of the bag.',
        },
        {
          type: 'fill', text: 'Handle the "look" command.',
          lines: [...G50_ROOMS, 'room = "hall"', 'for cmd in ["look"]:', '    verb, _, noun = cmd.partition(" ")', '    match verb:', '        case []:', '            print(rooms[room]["text"], "Exits:", ", ".join(rooms[room]["exits"]))'], chips: ['"look"', 'look', '_look'], answer: [['"look"']],
          hints: ['Match the verb string.', 'case "look":'],
        },
        {
          type: 'write', text: 'Write the game loop for the commands ["go north", "take key", "take sword", "go east", "take crown"]. For "go": move if the exit exists. For "take": if noun is in the room\'s items, remove it and add it to bag, else print "No", noun, "here". At the end print room and bag.',
          starter: [...G50_ROOMS, 'room, bag = "gate", list()'], keys: ['for', 'cmd', 'in', '["go north", "take key", "take sword", "go east", "take crown"]', ':', 'verb, _, noun', '=', 'cmd.partition(" ")', 'match', 'verb', 'case', '"go"', '"take"', 'if', 'in', 'noun', 'rooms[room]["exits"]', 'room', 'rooms[room]["exits"][noun]', 'rooms[room]["items"]', '.remove(noun)', 'bag.append(noun)', 'else', 'print', '"No"', '"here"', ',', 'room, bag'],
          require: l => (has(l, /match verb/) ? null : 'Use match verb: with a case for each command.'),
          hints: ['for cmd in [...]:\n    verb, _, noun = cmd.partition(" ")\n    match verb:\n        case "go":\n            if noun in rooms[room]["exits"]:\n                room = rooms[room]["exits"][noun]', '        case "take":\n            if noun in rooms[room]["items"]:\n                rooms[room]["items"].remove(noun)\n                bag.append(noun)\n            else:\n                print("No", noun, "here")\nprint(room, bag)'],
          solution: ['for cmd in ["go north", "take key", "take sword", "go east", "take crown"]:', '    verb, _, noun = cmd.partition(" ")', '    match verb:', '        case "go":', '            if noun in rooms[room]["exits"]:', '                room = rooms[room]["exits"][noun]', '        case "take":', '            if noun in rooms[room]["items"]:', '                rooms[room]["items"].remove(noun)', '                bag.append(noun)', '            else:', '                print("No", noun, "here")', 'print(room, bag)'],
        },
      ],
      learn: [{ title: 'Text adventure', code: 'rooms = {"hall": {"exits": {...}, "items": [...]}}\nverb, _, noun = cmd.partition(" ")\nmatch verb: ...', text: 'The world is data; the game is a loop that changes state.' }],
    },
    {
      id: '50-8', title: 'The Grade Book', bg: 'study', npc: 'marshal', mentor: 'marshal', tags: ['projgrades'],
      steps: [
        { type: 'talk', who: 'marshal', text: 'Last project, ours too: a GRADE BOOK. Scores arrive as a CSV file, one row per test. Group them per student, average them, give each a letter grade, and print a tidy report table.' },
        { type: 'talk', who: 'marshal', text: 'The pieces: csv.DictReader to read rows, a defaultdict(list) to group, statistics.mean to average, a function for letters, and f-string alignment for the table. You know every one of them.' },
        { type: 'demo', files: G50_GRADES, text: 'Reading and grouping. Run it.', code: ['import csv', 'from collections import defaultdict', 'scores = defaultdict(list)', 'with open("grades.csv", newline="") as f:', '    for row in csv.DictReader(f):', '        scores[row["name"]].append(int(row["score"]))', 'print(dict(scores))'] },
        {
          type: 'predict', vars: R => ({ s: R.pick([95, 85, 72, 64, 40]) }), text: 'Letter grades. What will it say?', code: ['def letter(avg):', '    for cutoff, grade in [(90, "A"), (80, "B"), (70, "C"), (60, "D")]:', '        if avg >= cutoff:', '            return grade', '    return "F"', 'print(letter($s), letter(90), letter(59.9))'],
          explain: 'The first cutoff the average reaches gives the grade.',
        },
        {
          type: 'predict', text: 'Averages. What will it say?', code: ['from statistics import mean', 'print(mean([91, 87]), mean([78, 62]), round(mean([85, 95, 80]), 1))'],
          explain: 'mean adds and divides; round tidies the result.',
        },
        {
          type: 'predict', text: 'A tidy table row. What will it say?', code: ['for name, avg, grade in [("ada", 89.0, "B"), ("cy", 90.0, "A")]:', '    print(f"{name:<6}|{avg:>6.1f} | {grade}")'],
          explain: '<6 pads the name on the right, >6.1f right-aligns the average with one decimal.',
        },
        {
          type: 'fill', files: G50_GRADES, text: 'Group every score under its student.',
          lines: ['import csv', 'from collections import defaultdict', 'scores = defaultdict([])', 'for row in csv.DictReader(open("grades.csv", newline="")):', '    scores[row["name"]].append(int(row["score"]))', 'print(scores["bo"])'], chips: ['list', 'int', 'dict'], answer: [['list']],
          hints: ['Each student needs a list of scores.', 'defaultdict(list)'],
        },
        {
          type: 'write', files: G50_GRADES, text: 'Write the report: read grades.csv with DictReader into a defaultdict(list) of int scores, then for each name in sorted order print f"{name:<6}|{avg:>6.1f} | {letter(avg)}" where avg = mean(scores[name]).',
          starter: ['import csv', 'from collections import defaultdict', 'from statistics import mean', 'def letter(avg):', '    for cutoff, grade in [(90, "A"), (80, "B"), (70, "C"), (60, "D")]:', '        if avg >= cutoff:', '            return grade', '    return "F"'], keys: ['scores', '=', 'defaultdict', '(', ')', 'list', 'with', 'open', '"grades.csv"', 'newline=""', ',', 'as', 'f', ':', 'for', 'row', 'in', 'csv.DictReader(f)', 'scores[row["name"]]', '.append', 'int(row["score"])', 'name', 'sorted(scores)', 'avg', 'mean(scores[name])', 'print', 'f"{name:<6}|{avg:>6.1f} | {letter(avg)}"'],
          require: l => (has(l, /DictReader/) && has(l, /mean\(/) ? null : 'Use DictReader and mean.'),
          hints: ['scores = defaultdict(list)\nwith open("grades.csv", newline="") as f:\n    for row in csv.DictReader(f):\n        scores[row["name"]].append(int(row["score"]))', 'for name in sorted(scores):\n    avg = mean(scores[name])\n    print(f"{name:<6}|{avg:>6.1f} | {letter(avg)}")'],
          solution: ['scores = defaultdict(list)', 'with open("grades.csv", newline="") as f:', '    for row in csv.DictReader(f):', '        scores[row["name"]].append(int(row["score"]))', 'for name in sorted(scores):', '    avg = mean(scores[name])', '    print(f"{name:<6}|{avg:>6.1f} | {letter(avg)}")'],
        },
      ],
      learn: [{ title: 'Grade book', code: 'csv.DictReader  defaultdict(list)  mean  f"{name:<6}|{avg:>6.1f}"', text: 'Read, group, compute, report.' }],
    },
    {
      id: '50-9', title: 'The Gauntlet Champion', bg: 'proving', foe: { kind: 'champion', hp: 220, weak: 'fireball', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'champion', text: 'YOU BUILT TOYS, CHALLENGER. NOW BUILD A VICTORY.' },
        { type: 'talk', who: 'narrator', text: 'The Gauntlet Champion has 220 HP. Fireball breaks its guard: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Fireball is doubled.', code: [...G50_RECT, 'cast(fireball, Rectangle(4, 3).get_area())'],
          explain: '4 × 3 = 12, doubled.',
        },
        {
          type: 'fix', text: 'The ledger lets you overspend. Run it, then tap the broken line.',
          goal: { output: 'auto' },
          code: ['class Purse:', '    def __init__(self, gold):', '        self.gold = gold', '    def spend(self, n):', '        if n < self.gold:', '            self.gold -= n', '            return True', '        return False', 'p = Purse(10)', 'print(p.spend(10), p.gold)', 'cast(fireball, 10)'], bad: 4,
          options: ['        if n <= self.gold:', '        if n > self.gold:', '        if n != self.gold:'], answer: 0,
          explain: 'Spending exactly what you have is allowed: use <=.',
        },
        { type: 'talk', who: 'champion', text: 'THE CLOCK RUNS OUT FOR YOU!' },
        {
          type: 'fill', text: 'Midnight is 12 AM, not 0 AM.',
          lines: ['h = 0', 'shown = h % 12 [] 12', 'print(f"{shown}:00 AM")', 'cast(fireball, shown)'], chips: ['or', 'and', '+'], answer: [['or']],
          hints: ['0 is falsy, so ... picks 12.', 'h % 12 or 12'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and fireball is doubled. Make a Category("Victory") (it is defined for you), deposit $HP // 2 + 1, and cast fireball with its get_balance().',
          starter: G50_CATEGORY, keys: ['v', '=', 'Category', '(', ')', '"Victory"', 'v.deposit', '$HP', '//', '2', '+', '1', 'cast', 'fireball', ',', 'v.get_balance()'],
          goal: { foeDown: true },
          require: l => (has(l, /deposit\(/) && has(l, /get_balance\(\)/) ? null : 'Deposit, then strike with get_balance().'),
          hints: ['v = Category("Victory")\nv.deposit($HP // 2 + 1)', 'cast(fireball, v.get_balance())'],
          solution: ['v = Category("Victory")', 'v.deposit($HP // 2 + 1)', 'cast(fireball, v.get_balance())'],
        },
        { type: 'talk', who: 'champion', text: '...the Gauntlet... is yours... only the Heart remains...' },
      ],
      learn: [{ title: 'The Gauntlet', code: 'arranger  time calculator  budget  shapes  hat  mailbox  adventure  grade book', text: 'Real projects, built from everything you learned.' }],
    },
  ],
};
WORLDS.push(WORLD50);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    projarith: () => { const a = String(rnd(1, 999)), b = String(rnd(1, 99)); const w = Math.max(a.length, b.length) + 2; return makeQ([`a, b = "${a}", "${b}"`, 'w = max(len(a), len(b)) + 2', 'print(repr("+" + b.rjust(w - 1)))'], [`'+${b.padStart(w)}'`, `'+ ${b}'`, `'${b.padStart(w)}+'`]); },
    projtime: () => { const m = rnd(1500, 3000); return makeQ([`d, rest = divmod(${m}, 1440)`, 'h, mins = divmod(rest, 60)', 'print(d, h % 12 or 12)'], [`${Math.floor(m / 1440)} 0`, `${Math.floor(m / 60)} 12`, 'TypeError']); },
    projbudget: () => { const a = rnd(10, 50), b = rnd(51, 99); return makeQ(['ledger = []', `ledger.append({"amount": ${a}})`, `ok = ${b} <= sum(i["amount"] for i in ledger)`, `if ok:`, `    ledger.append({"amount": -${b}})`, 'print(ok, sum(i["amount"] for i in ledger))'], [`True ${a - b}`, `False ${a - b}`, `True ${a}`]); },
    projshapes: () => { const W = rnd(8, 20), H = rnd(6, 12), s = rnd(2, 4); return makeQ([`print((${W} // ${s}) * (${H} // ${s}))`], [Math.floor((W * H) / (s * s)) + 1, (W / s) * (H / s), W * H]); },
    projhat: () => makeQ(['import copy', 'a = {"balls": ["red", "blue"]}', 'b = copy.deepcopy(a)', 'b["balls"].pop()', 'print(len(a["balls"]), len(b["balls"]))'], ['1 1', '2 2', '1 2']),
    projmail: () => makeQ(['line = "From bo@keep.net Sat Jan  5 18:10:48 2008"', 'w = line.split()', 'print(w[1].split("@")[1], w[5][:2])'], ['bo 18', 'keep.net 10', 'keep.net 48']),
    projadventure: () => { const c = pick(['go north', 'look', 'take old map']); return makeQ([`verb, _, noun = "${c}".partition(" ")`, 'print(repr(verb), repr(noun))'], ["'go' 'north'", "'take' 'old'", "'look' None"]); },
    projgrades: () => { const s = rnd(55, 99); return makeQ(['def letter(avg):', '    for cut, g in [(90, "A"), (80, "B"), (70, "C"), (60, "D")]:', '        if avg >= cut:', '            return g', '    return "F"', `print(letter(${s}))`], ['A', 'B', 'F', 'D']); },
  });
})();
