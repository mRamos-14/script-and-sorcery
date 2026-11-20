/* World 13: The Great Bazaar. Libraries: import / from / as, math, random, statistics,
   sys.argv and sys.exit, json, your own modules and __name__, and web data with requests.
   Steps can set argv: [...] (the command line) and web: { url: data } (pages requests can fetch). */
const WARES = ['amulet', 'lantern', 'carpet', 'compass', 'teapot', 'dagger'];
const API = 'https://api.bazaar.dev';

const WORLD13 = {
  id: 13, name: 'The Great Bazaar', topic: 'libraries and modules', map: 'bg-map13.jpg',
  nodes: [[50, 94], [26, 86], [70, 78], [32, 70], [68, 61], [30, 52], [70, 43], [32, 34], [66, 25], [38, 16], [50, 7]],
  levels: [
    {
      id: '13-1', title: 'Borrowing spells', bg: 'bazaar', npc: 'vendor', mentor: 'vendor', tags: ['modules'],
      steps: [
        { type: 'talk', who: 'vendor', text: "Welcome to the Great Bazaar, friend {NAME}! I'm Vendor Oro. Why write every spell yourself? Python comes with libraries full of them. import math borrows the math library." },
        { type: 'talk', who: 'vendor', text: 'After import math, its spells live behind a dot: math.sqrt, math.floor, math.pi. from math import sqrt brings one spell in without the dot.' },
        { type: 'demo', vars: R => ({ n: R.int(2, 12) }), text: 'Run it.', code: ['import math', 'print(math.sqrt($(n * n)))', 'print(math.floor(7.9), math.ceil(7.1))', 'print(round(math.pi, 2))'] },
        {
          type: 'predict', vars: R => ({ x: R.int(1, 30) + R.pick([0.2, 0.5, 0.8]) }), text: 'What will it say?',
          code: ['import math', 'x = $x', 'print(math.floor(x), math.ceil(x))'],
          explain: 'floor rounds down, ceil rounds up.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(2, 9) }), text: 'sqrt always gives a float. What will it say?',
          code: ['from math import sqrt', 'from math import factorial as fact', 'print(sqrt($(n * n)), fact(4))'],
          wrong: ['$n 24', '$n.0 4'],
          explain: 'sqrt returns a float like $n.0. factorial was renamed fact with as: 4! is 24.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => ({ n: R.int(2, 9) }), text: 'Imported the library, then forgot the dot. Which error will this cause?',
          code: ['import math', 'print(sqrt($(n * n)))'],
          explain: 'import math only creates the name math. sqrt alone is unknown: NameError.',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(3, 9), b: R.int(10, 30) }), text: 'Bring gcd straight in, no dot needed.',
          lines: ['from math [] gcd', 'print([]($a * 2, $b * 2))'], chips: ['import', 'gcd', 'math', 'as'], answer: [['import', 'gcd']],
          hints: ['from library import name', 'from math import gcd, then call gcd(...)'],
        },
        {
          type: 'write', vars: R => ({ k: R.int(3, 7) }), text: 'Import the math library and print math.factorial($k).',
          starter: [], keys: ['import', 'math', 'print', '(', ')', 'math.factorial', '$k'],
          require: l => (has(l, /import\s+math/) ? null : 'Start with import math.'),
          hints: ['import math', 'print(math.factorial($k))'],
          solution: ['import math', 'print(math.factorial($k))'],
        },
      ],
      learn: [{ title: 'import', code: 'import math\nfrom math import sqrt\nimport math as m', text: 'Borrow code from a library. Keep the dot, pull one name in, or rename it with as.' }],
    },

    {
      id: '13-1b', title: 'Installing new spells', bg: 'bazaar', npc: 'courier', mentor: 'courier', tags: [], late: true,
      steps: [
        { type: 'talk', who: 'courier', text: 'Python comes with lots of libraries, but thousands more live on PyPI, the Python Package Index. You install them in the terminal, not inside Python: pip install cowsay.' },
        { type: 'talk', who: 'courier', text: 'Each project can get its own virtual environment, a private shelf of libraries: python -m venv .venv makes one, and activating it makes pip install into it. Then two projects can never break each other.' },
        { type: 'predict', shell: true, text: 'You want the requests library on your computer. What do you type in the terminal?', code: ['$ ...'], choices: ['pip install requests', 'import requests', 'python requests'], answer: 0, explain: 'pip install downloads a library from PyPI. import is what you write in your .py file afterwards.' },
        { type: 'predict', shell: true, text: 'cowsay is installed. Which line goes at the top of your Python file?', code: ['$ pip install cowsay', 'Successfully installed cowsay'], choices: ['import cowsay', 'pip install cowsay', 'install cowsay'], answer: 0, explain: 'Installing happens once in the terminal. import is how each program uses it.' },
        { type: 'predict', shell: true, text: 'What does this command do?', code: ['$ python -m venv .venv'], choices: ['Makes a private folder for this project\'s libraries', 'Installs Python itself', 'Runs a program called venv'], answer: 0, explain: 'venv creates a virtual environment in the .venv folder.' },
        { type: 'predict', shell: true, text: 'In a brand new virtual environment, before any pip install, this runs. What happens?', code: ['$ python', '>>> import requests'], choices: ['ModuleNotFoundError', 'It works', 'SyntaxError'], answer: 0, explain: 'A fresh environment only has the standard library. Install requests into it first.' },
        { type: 'predict', shell: true, text: 'How do you save the list of libraries your project needs, so someone else can install the same ones?', code: ['$ ...'], choices: ['pip freeze > requirements.txt', 'pip save', 'python -m list'], answer: 0, explain: 'requirements.txt lists the libraries. Others run pip install -r requirements.txt.' },
      ],
      learn: [{ title: 'pip and venv', code: 'python -m venv .venv\npip install cowsay\npip freeze > requirements.txt', text: 'Install libraries from PyPI into a private environment for each project.' }],
    },
    {
      id: '13-2', title: 'Dice of fate', bg: 'bazaar', npc: 'vendor', mentor: 'vendor', tags: ['randomq'],
      steps: [
        { type: 'talk', who: 'vendor', text: 'The random library rolls dice for you. random.randint(1, 6) is a die roll, both ends included. random.choice picks from a list. random.shuffle mixes a list in place.' },
        { type: 'demo', vars: R => ({ its: R.sample(WARES, 4) }), text: 'Run it. Real random results change every run.', code: ['import random', 'print(random.randint(1, 6))', 'print(random.choice($(JSON.stringify(its))))', 'stock = $(JSON.stringify(its))', 'random.shuffle(stock)', 'print(stock)'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 5), b: R.int(6, 20) }), text: 'We cannot know the roll, but we do know this. What will it say?',
          code: ['import random', 'roll = random.randint($a, $b)', 'print($a <= roll <= $b)'],
          wrong: ['False', '$a'],
          explain: 'randint always lands between $a and $b, both ends included.',
        },
        {
          type: 'predict', vars: R => ({ its: R.sample(WARES, 5), k: R.int(2, 4) }), text: 'What will it say?',
          code: ['import random', 'stock = $(JSON.stringify(its))', 'picks = random.sample(stock, $k)', 'random.shuffle(stock)', 'print(len(picks), len(stock), sorted(stock) == $(JSON.stringify(its.slice().sort())))'],
          explain: 'sample picks $k different items. shuffle only changes the order, never what is in the list.',
        },
        {
          type: 'predict', vars: R => ({ s: R.int(1, 99) }), text: 'A seed makes the dice repeat. What will it say?',
          code: ['import random', 'random.seed($s)', 'a = random.randint(1, 1000)', 'random.seed($s)', 'b = random.randint(1, 1000)', 'print(a == b)'],
          explain: 'The same seed gives the same rolls every time. Games use seeds to replay a level.',
        },
        {
          type: 'fill', vars: R => ({ its: R.sample(WARES, 3) }), text: 'Pick one ware at random, then mix up the list.',
          lines: ['import random', 'wares = $(JSON.stringify(its))', 'gift = random.[](wares)', 'random.[](wares)', 'print(gift in wares, len(wares))'],
          chips: ['choice', 'shuffle', 'randint', 'sorted'], answer: [['choice', 'shuffle']],
          hints: ['choice picks one item.', 'shuffle mixes the list in place.'],
        },
        {
          type: 'write', text: 'Import random and print a single die roll from 1 to 6.',
          starter: [], keys: ['import', 'random', 'print', '(', ')', 'random.randint', '1', '6', ','],
          goal: { anyOutput: true },
          require: l => (has(l, /import\s+random/) && has(l, /randint\s*\(\s*1\s*,\s*6\s*\)/) && has(l, /print/) ? null : 'Use import random and print(random.randint(1, 6)).'),
          hints: ['import random', 'print(random.randint(1, 6))'],
          solution: ['import random', 'print(random.randint(1, 6))'],
        },
      ],
      learn: [{ title: 'random', code: 'random.randint(1, 6)\nrandom.choice(items)\nrandom.shuffle(items)', text: 'Dice, picks and shuffles. The same seed gives the same results.' }],
    },
    {
      id: '13-3', title: 'Counting the coins', bg: 'bazaar', npc: 'courier', mentor: 'courier', tags: ['stats'],
      steps: [
        { type: 'talk', who: 'courier', text: "Courier Pim, quick as a cat! The statistics library sums up the day's sales: mean is the average, median the middle value, mode the most common one." },
        { type: 'demo', vars: R => ({ xs: Array.from({ length: 5 }, () => R.int(1, 20)) }), text: 'Run it.', code: ['import statistics', 'sales = $(JSON.stringify(xs))', 'print(statistics.mean(sales))', 'print(statistics.median(sales))'] },
        {
          type: 'predict', vars: R => { const a = R.int(1, 10), d = R.int(1, 5); return { xs: [a, a + d, a + 2 * d] }; }, text: 'What will it say?',
          code: ['import statistics', 'print(statistics.mean($(JSON.stringify(xs))))'],
          explain: 'The mean adds them up and divides by 3. Here it comes out whole: $(xs[1]).',
        },
        {
          type: 'predict', vars: R => ({ xs: R.sample([2, 5, 8, 11, 14, 17, 20], 4) }), text: 'An even number of values. What will it say?',
          code: ['import statistics', 'print(statistics.median($(JSON.stringify(xs))))'],
          explain: 'With 4 values the median is the average of the middle two, always a float.',
        },
        {
          type: 'predict', vars: R => { const [a, b] = R.sample(WARES, 2); return { a, b, L: JSON.stringify(R.shuffle([a, a, a, b, b])) }; }, text: 'The best seller. What will it say?',
          code: ['import statistics', 'print(statistics.mode($L))'],
          explain: '$a was sold most often.',
        },
        {
          type: 'fix', vars: R => ({ xs: [R.int(1, 9), R.int(1, 9), R.int(1, 9)] }), text: 'This average will not work. Run it, then tap the broken line.',
          code: ['import statistic', 'print(statistics.mean($(JSON.stringify(xs))))'], bad: 0,
          options: ['import statistics', 'import mean', 'from statistic import mean'], answer: 0,
          explain: 'The library is called statistics, with an s.',
        },
        {
          type: 'write', vars: R => ({ xs: Array.from({ length: 5 }, () => R.int(1, 50)) }), text: 'Import statistics and print the median of prices.',
          starter: ['prices = $(JSON.stringify(xs))'], keys: ['import', 'statistics', 'print', '(', ')', 'statistics.median', 'prices'],
          require: l => (has(l, /statistics/) && has(l, /median/) ? null : 'Use statistics.median.'),
          hints: ['import statistics', 'print(statistics.median(prices))'],
          solution: ['import statistics', 'print(statistics.median(prices))'],
        },
      ],
      learn: [{ title: 'statistics', code: 'statistics.mean(xs)\nstatistics.median(xs)\nstatistics.mode(xs)', text: 'Average, middle value and most common value of a list.' }],
    },
    {
      id: '13-4', title: 'Lucky strikes', bg: 'caravan', mentor: 'narrator', tags: [],
      foe: R => ({ kind: 'bandit', hp: 10 }),
      steps: [
        { type: 'talk', who: 'narrator', text: 'A bandit raids the caravan! Your spells roll their power with random.randint. Plan for the lowest possible roll.' },
        { type: 'demo', text: 'Watch a few rolls. Each is between 4 and 9.', code: ['import random', 'for i in range(3):', '    print(random.randint(4, 9))'] },
        {
          type: 'fill', text: 'The bandit has $HP HP. Even the lowest roll must win: roll between 10 and 15.',
          lines: ['import random', 'cast(fireball, random.[](10, []))'], chips: ['randint', 'choice', '15', '5'], answer: [['randint', '15']],
          goal: { foeDown: true },
          hints: ['randint(a, b) rolls from a to b.', 'random.randint(10, 15)'],
        },
        { type: 'talk', who: 'narrator', text: 'The bandit chief appears with 30 HP!' },
        {
          type: 'write', spawn: () => ({ kind: 'bandit', hp: 30, tint: 'big' }), text: 'It has 30 HP. Cast fireball 3 times, each with power random.randint(10, 20). Even three lowest rolls are enough.',
          starter: ['import random'], keys: ['for', 'i', 'in', 'range(3)', ':', 'cast', 'fireball', ',', 'random.randint', '(10, 20)', '(', ')'],
          goal: { foeDown: true },
          require: l => (has(l, /randint\s*\(\s*10\s*,\s*20\s*\)/) && has(l, /for\b/) ? null : 'Loop 3 times and roll random.randint(10, 20).'),
          hints: ['for i in range(3):', '    cast(fireball, random.randint(10, 20))'],
          solution: ['for i in range(3):', '    cast(fireball, random.randint(10, 20))'],
        },
      ],
      learn: [{ title: 'Planning for luck', code: 'random.randint(10, 20)', text: 'When a result is random, think about the worst case and make sure it is still good enough.' }],
    },
    {
      id: '13-5', title: 'Command-line spells', bg: 'bazaar', npc: 'courier', mentor: 'courier', tags: ['argv'],
      steps: [
        { type: 'talk', who: 'courier', text: 'Real programs are run from a terminal: python greet.py Ada. Words typed after the file name arrive in sys.argv, a list. sys.argv[0] is the file name, sys.argv[1] the first word after it.' },
        { type: 'demo', vars: R => ({ n: R.name() }), argv: ['greet.py', '$n'], text: 'Run it. The command line is shown at the top of the spellbook output.', code: ['import sys', 'print(sys.argv)', 'print("hello,", sys.argv[1])'] },
        {
          type: 'predict', vars: R => { const [a, b] = R.sample(Engine.NAMES, 2); return { a, b }; }, argv: ['party.py', '$a', '$b'], text: 'Typed: python party.py $a $b. What will it say?',
          code: ['import sys', 'print(len(sys.argv), sys.argv[-1])'],
          wrong: ['2 $b', '3 party.py'],
          explain: 'The list is ["party.py", "$a", "$b"]: 3 items, the last is $b.',
        },
        {
          type: 'predict', argv: ['greet.py'], text: 'Typed with no name at all. What will it say?',
          code: ['import sys', 'if len(sys.argv) < 2:', '    sys.exit("Usage: python greet.py NAME")', 'print("hello,", sys.argv[1])'],
          explain: 'Only the file name was typed, so the program exits with its usage message and never reaches the last line.',
        },
        {
          type: 'fix', vars: R => ({ n: R.name() }), argv: ['greet.py', '$n'], text: 'This greets the file instead of the hero. Run it, then tap the broken line.',
          code: ['import sys', 'name = sys.argv[0]', 'print("hello,", name)'], bad: 1,
          options: ['name = sys.argv[1]', 'name = sys.argv', 'name = sys.argv[2]'], answer: 0,
          explain: 'argv[0] is the file name. The first word after it is argv[1].',
        },
        {
          type: 'write', vars: R => ({ a: R.int(2, 40), b: R.int(2, 40) }), argv: ['add.py', '$a', '$b'], text: 'Typed: python add.py $a $b. Print the sum of the two numbers. Remember argv holds text.',
          starter: ['import sys'], keys: ['print', '(', ')', 'int', 'sys.argv[1]', 'sys.argv[2]', '+'],
          require: l => (has(l, /sys\.argv\[1\]/) && has(l, /int\(/) ? null : 'Convert sys.argv[1] and sys.argv[2] with int().'),
          hints: ['Words from the command line are strings.', 'print(int(sys.argv[1]) + int(sys.argv[2]))'],
          solution: ['print(int(sys.argv[1]) + int(sys.argv[2]))'],
        },
      ],
      learn: [{ title: 'sys.argv', code: 'import sys\nsys.argv[1]\nsys.exit("message")', text: 'The words typed after the file name, as a list of strings. sys.exit stops the program.' }],
    },

    {
      id: '13-5b', title: 'Options and flags', bg: 'bazaar', npc: 'courier', mentor: 'courier', tags: ['argparseq'], late: true,
      steps: [
        { type: 'talk', who: 'courier', text: 'Reading options like -n 3 from sys.argv by hand gets messy fast. The argparse library does it for you: it reads the options, converts their types, fills in defaults, and even writes a help page for -h.' },
        { type: 'demo', argv: ['meow.py', '-n', '3'], text: 'Run it. Typed: python meow.py -n 3', code: ['import argparse', 'parser = argparse.ArgumentParser(description="Meow like a cat")', 'parser.add_argument("-n", default=1, help="number of times to meow", type=int)', 'args = parser.parse_args()', 'for _ in range(args.n):', '    print("meow")'] },
        {
          type: 'predict', argv: ['meow.py'], text: 'Typed with no options at all: python meow.py. What will it say?',
          code: ['import argparse', 'parser = argparse.ArgumentParser()', 'parser.add_argument("-n", default=1, type=int)', 'args = parser.parse_args()', 'print("meow" * args.n)'],
          wrong: ['Error', 'meowmeow', ''],
          explain: 'No -n was typed, so args.n is the default, 1.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(['hello', 'dragon', 'quest']) }), argv: ['shout.py', '$w', '--loud'], text: 'Typed: python shout.py $w --loud. What will it say?',
          code: ['import argparse', 'parser = argparse.ArgumentParser()', 'parser.add_argument("--loud", action="store_true")', 'parser.add_argument("word")', 'args = parser.parse_args()', 'print(args.word.upper() if args.loud else args.word)'],
          wrong: ['$w', '--loud', 'True'],
          explain: 'action="store_true" makes --loud a switch: True when typed. word gets the other word.',
        },
        {
          type: 'predict', argv: ['meow.py', '-h'], text: 'Typed: python meow.py -h. What will it say?',
          code: ['import argparse', 'parser = argparse.ArgumentParser()', 'parser.add_argument("-n", default=1, help="number of times", type=int)', 'args = parser.parse_args()', 'print("meow")'],
          wrong: ['meow', 'usage: meow.py [-h] [-n N] / meow'],
          explain: '-h prints the help page that argparse writes for you, then stops the program before the last line.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(2, 5) }), argv: ['roll.py', '--dice', '$n'], text: 'Typed: python roll.py --dice $n. Make args.dice a number.',
          lines: ['import argparse', 'parser = argparse.ArgumentParser()', 'parser.add_argument("--dice", type=[], default=1)', 'args = parser.parse_args()', 'print(args.[] * 6, "sides in total")'],
          chips: ['int', 'dice', 'str', 'n'], answer: [['int', 'dice']],
          hints: ['type=int converts the typed text.', 'The value is stored as args.dice.'],
        },
        {
          type: 'write', vars: R => ({ n: R.pick(Engine.NAMES), t: R.int(2, 4) }), argv: ['greet.py', '$n', '-t', '$t'],
          text: 'Typed: python greet.py $n -t $t. Use argparse with a positional argument "name" and an option "-t" (type=int, default=1). Print "hi " + the name, args.t times.',
          starter: ['import argparse', 'parser = argparse.ArgumentParser()'], keys: ['parser.add_argument', '(', ')', '"name"', '"-t"', 'type=int', 'default=1', ',', 'args', '=', 'parser.parse_args()', 'for', '_', 'in', 'range', 'args.t', ':', 'print', '"hi " + args.name'],
          require: l => (has(l, /add_argument\(\s*"name"/) && has(l, /parse_args\(\)/) ? null : 'Add the "name" argument and call parse_args().'),
          hints: ['parser.add_argument("name") / parser.add_argument("-t", type=int, default=1)', 'args = parser.parse_args() / for _ in range(args.t): / print("hi " + args.name)'],
          solution: ['parser.add_argument("name")', 'parser.add_argument("-t", type=int, default=1)', 'args = parser.parse_args()', 'for _ in range(args.t):', '    print("hi " + args.name)'],
        },
      ],
      learn: [{ title: 'argparse', code: 'parser.add_argument("-n", type=int, default=1)\nargs = parser.parse_args()', text: 'Reads command-line options, converts them and writes a -h help page.' }],
    },
    {
      id: '13-6', title: 'Scrolls that travel', bg: 'bazaar', npc: 'vendor', mentor: 'vendor', tags: ['jsonq'],
      steps: [
        { type: 'talk', who: 'vendor', text: 'Traders send data as JSON, plain text any program can read. json.dumps turns a dict into JSON text. json.loads turns JSON text back into a dict.' },
        { type: 'demo', vars: R => ({ w: R.pick(WARES), p: R.int(5, 90) }), text: 'Run it.', code: ['import json', 'item = {"name": "$w", "price": $p, "sold": False}', 'text = json.dumps(item)', 'print(text)', 'print(type(text).__name__)'] },
        {
          type: 'predict', vars: R => ({ w: R.pick(WARES) }), text: 'JSON spells some things differently. What will it say?',
          code: ['import json', 'print(json.dumps({"rare": True, "owner": None, "tags": ["$w"]}))'],
          wrong: ['{\'rare\': True, \'owner\': None, \'tags\': [\'$w\']}'],
          explain: 'JSON uses double quotes, true, false and null.',
        },
        {
          type: 'predict', vars: R => ({ w: R.pick(WARES), p: R.int(5, 90) }), text: 'Back from text. What will it say?',
          code: ['import json', 'data = json.loads(\'{"name": "$w", "price": $p}\')', 'print(data["price"] + 1, type(data).__name__)'],
          explain: 'loads gives a real dict, and the price is a real number.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'A trader wrote their JSON by hand. Which error will this cause?',
          code: ['import json', 'data = json.loads("{\'name\': \'carpet\'}")'],
          explain: 'JSON demands double quotes. Single quotes are a JSONDecodeError.',
        },
        {
          type: 'fill', vars: R => ({ h: R.int(10, 99), g: R.int(1, 500) }), text: 'Save the game to a JSON scroll.',
          lines: ['import json', 'save = {"hp": $h, "gold": $g}', 'with open("save.json", "w") as f:', '    json.[](save, f)'], chips: ['dump', 'dumps', 'load'], answer: [['dump']],
          goal: { files: ['save.json'] },
          hints: ['dump writes straight to a file. dumps only makes a string.', 'json.dump(save, f)'],
        },
        {
          type: 'write', vars: R => ({ h: R.int(10, 99), g: R.int(1, 500) }), files: { 'save.json': '{"hp": $h, "gold": $g}' }, text: 'Load save.json with json.load and print the gold.',
          starter: ['import json'], keys: ['with', 'open', '("save.json")', 'as', 'f', ':', 'data', '=', 'json.load', '(f)', 'print', 'data["gold"]', '(', ')'],
          require: l => (has(l, /json\.load\(/) ? null : 'Use json.load(f).'),
          hints: ['with open("save.json") as f: / data = json.load(f)', 'print(data["gold"])'],
          solution: ['with open("save.json") as f:', '    data = json.load(f)', 'print(data["gold"])'],
        },
      ],
      learn: [{ title: 'json', code: 'json.dumps(d)  json.loads(text)\njson.dump(d, f)  json.load(f)', text: 'Turn data into text and back. The s versions work with strings, the others with files.' }],
    },
    {
      id: '13-7', title: 'Your own library', bg: 'bazaar', npc: 'courier', mentor: 'courier', tags: ['mymodule'],
      steps: [
        { type: 'talk', who: 'courier', text: 'Any .py file is a library too! Put functions in spells.py, then import spells from another file. The shelf shows the files you can import.' },
        { type: 'demo', vars: R => ({ k: R.int(2, 9) }), files: { 'spells.py': 'def double(n):\n    return n * 2\n' }, text: 'Run it.', code: ['import spells', 'print(spells.double($k))'] },
        {
          type: 'predict', vars: R => ({ k: R.int(2, 9) }), files: { 'spells.py': 'print("spells loading")\ndef triple(n):\n    return n * 3\n' }, text: 'Importing runs the file. What will it say?',
          code: ['from spells import triple', 'print(triple($k))'],
          explain: 'import runs spells.py from the top, so its print happens first.',
        },
        {
          type: 'predict', files: { 'tools.py': 'def main():\n    print("tools running")\nif __name__ == "__main__":\n    main()\n' }, text: 'A guard at the bottom of tools.py. What will it say?',
          code: ['import tools', 'print("main program", __name__)'],
          explain: 'When imported, a file\'s __name__ is its own name, not "__main__", so the guard skips main(). The file you run is "__main__".',
        },
        {
          type: 'fill', vars: R => ({ a: R.int(2, 9), b: R.int(2, 9) }), files: { 'calc.py': 'def add(a, b):\n    return a + b\n' }, text: 'Use the add spell from calc.py.',
          lines: ['[] calc', 'print(calc.[]($a, $b))'], chips: ['import', 'add', 'calc', 'from'], answer: [['import', 'add']],
          hints: ['import calc', 'calc.add($a, $b)'],
        },
        {
          type: 'write', vars: R => ({ n: R.name() }), text: 'Write the classic layout: a function main() that prints "hello, $n", and an if __name__ == "__main__": guard that calls main().',
          starter: [], keys: ['def', 'main', '():', 'print', '("hello, $n")', 'if', '__name__', '==', '"__main__"', ':', 'main()'],
          require: l => (has(l, /def\s+main\s*\(\s*\)/) && has(l, /if\s+__name__\s*==\s*["']__main__["']/) ? null : 'Define main() and guard it with if __name__ == "__main__":'),
          hints: ['def main(): / print("hello, $n")', 'if __name__ == "__main__": / main()'],
          solution: ['def main():', '    print("hello, $n")', 'if __name__ == "__main__":', '    main()'],
        },
      ],
      learn: [{ title: 'Modules and main', code: 'import spells\nif __name__ == "__main__":\n    main()', text: 'Your files are libraries. The guard runs main() only when the file is run directly.' }],
    },
    {
      id: '13-8', title: 'Messages from afar', bg: 'caravan', mentor: 'narrator', tags: ['requestsq'],
      foe: R => { const p = R.int(15, 25); return { kind: 'bandit', hp: p * 2, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'A courier bird brings the address of a spell server! requests.get(url) fetches a page from the web. .json() turns the reply into Python data.' },
        { type: 'demo', vars: (R, c) => ({ p: c.foe.p }), web: { [API + '/spell']: { name: 'frost lance', element: 'ice', power: '$p' } }, text: 'Run it. This spellbook can only reach the bazaar\'s own server.', code: ['import requests', 'r = requests.get("' + API + '/spell")', 'print(r.status_code)', 'data = r.json()', 'print(data["name"], data["power"])'] },
        {
          type: 'predict', web: { [API + '/prices']: { carpet: 40, lamp: 15 } }, text: 'A page that does not exist. What will it say?',
          code: ['import requests', 'r = requests.get("' + API + '/treasure")', 'print(r.status_code)'],
          explain: '404 means the server has no such page. 200 means OK.',
        },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p }), web: { [API + '/spell']: { name: 'frost lance', power: '$p' } }, text: 'The bandit has $HP HP. Fetch the spell and cast icebolt twice with its power.',
          lines: ['import requests', 'data = requests.get("' + API + '/spell").[]()', 'for i in range(2):', '    cast(icebolt, int(data[[]]))'], chips: ['json', 'text', '"power"', '"name"'], answer: [['json', '"power"']],
          goal: { foeDown: true },
          hints: ['.json() turns the reply into a dict.', 'data["power"] holds the number.'],
        },
      ],
      learn: [{ title: 'requests', code: 'r = requests.get(url)\nr.status_code\nr.json()', text: 'Fetch data from the web. 200 means OK, 404 means not found. .json() gives Python data.' }],
    },
    {
      id: '13-9', title: 'The Merchant Prince', bg: 'palace', foe: { kind: 'prince', hp: 230, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'prince', text: 'Everything in this bazaar has a price, little mage. My libraries are not for sale.' },
        { type: 'talk', who: 'narrator', text: 'The Merchant Prince has 230 HP. Icebolt cools his greed for double. Fireball is half as strong.' },
        {
          type: 'predict', measure: 'damage', vars: R => { const a = R.int(4, 10), d = R.int(1, 4); return { xs: [a, a + d, a + 2 * d] }; }, text: 'How much damage will this deal? Icebolt is doubled.',
          code: ['import statistics', 'cast(icebolt, statistics.mean($(JSON.stringify(xs))))'],
          explain: 'The mean is $(xs[1]), doubled by icebolt: $(2 * xs[1]).',
        },
        {
          type: 'fix', vars: R => ({ p: R.int(10, 15) }), files: { 'frost.py': 'POWER = $p\n' }, text: 'The Prince scrambled your import! Run it, then tap the broken line.',
          code: ['import frost.py', 'cast(icebolt, frost.POWER)', 'print("cast", frost.POWER)'], bad: 0,
          options: ['import frost', 'import "frost"', 'from frost import frost'], answer: 0,
          explain: 'You import a module by name, without .py.',
        },
        { type: 'talk', who: 'prince', text: 'Then let the dice decide your fate!' },
        {
          type: 'fill', vars: R => ({ p: R.int(20, 30) }), text: 'Read the shipment and freeze him with its total weight.',
          lines: ['import json', 'cargo = json.[](\'{"crates": [$(Math.floor(p / 2)), $(Math.ceil(p / 2))]}\')', 'cast(icebolt, [](cargo["crates"]))'],
          chips: ['loads', 'dumps', 'sum', 'len'], answer: [['loads', 'sum']],
          hints: ['loads turns JSON text into data.', 'Add up the crates with sum.'],
        },
        {
          type: 'write', vars: (R, c) => ({ q: Math.ceil(c.foe.hp / 2) }), argv: ['strike.py', '$q'], text: 'Final blow! $HP HP left, icebolt is doubled. You ran: python strike.py $q. Cast icebolt with that number from sys.argv.',
          starter: [], keys: ['import', 'sys', 'cast', '(', ')', 'icebolt', ',', 'int', 'sys.argv[1]'],
          goal: { foeDown: true },
          require: l => (has(l, /sys\.argv\[1\]/) ? null : 'Read the power from sys.argv[1].'),
          hints: ['import sys', 'cast(icebolt, int(sys.argv[1]))'],
          solution: ['import sys', 'cast(icebolt, int(sys.argv[1]))'],
        },
        { type: 'talk', who: 'prince', text: 'Some things... cannot be bought. Take the bazaar\'s libraries. They were always free.' },
      ],
      learn: [{ title: 'The library toolkit', code: 'import  from ... import  as\nmath  random  statistics  sys  json  requests', text: 'Python\'s power is its libraries. CS50P week 4, done.' }],
    },
  ],
};
WORLDS.push(WORLD13);
