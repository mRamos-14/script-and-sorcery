// Feature programs for the differential test (tools/diff-python.js).
// Each one must behave exactly like real Python.
const P = (code, extra = {}) => ({ code: code.split('\n'), ...extra });
module.exports = [
  // classes
  P(`class Hero:
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp
    def hit(self, n):
        self.hp -= n
        return self.hp
h = Hero("Ada", 20)
print(h.hit(5), h.hp, h.name)
print(type(h).__name__, isinstance(h, Hero))`),
  P(`class Dog:
    sound = "woof"
    count = 0
    def __init__(self):
        Dog.count += 1
a = Dog()
b = Dog()
print(Dog.count, a.sound, b.count)
a.sound = "yip"
print(a.sound, b.sound, Dog.sound)`),
  P(`class P:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __str__(self):
        return f"({self.x}, {self.y})"
    def __repr__(self):
        return f"P({self.x}, {self.y})"
    def __add__(self, o):
        return P(self.x + o.x, self.y + o.y)
    def __eq__(self, o):
        return self.x == o.x and self.y == o.y
p = P(1, 2) + P(3, 4)
print(p, [p], p == P(4, 6), p != P(4, 6))
print(str(p), repr(p), f"{p}", f"{p!r}")`),
  P(`class A:
    def __init__(self):
        pass
a = A()
print(a.missing)`),
  P(`class A:
    def hello(self):
        return "A"
class B(A):
    def hello(self):
        return "B+" + super().hello()
class C(B):
    pass
c = C()
print(c.hello(), isinstance(c, A), issubclass(C, A), issubclass(A, C))
print([k.__name__ for k in C.__mro__])`),
  P(`class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "..."
    def intro(self):
        return f"{self.name} says {self.speak()}"
class Cat(Animal):
    def __init__(self, name, lives=9):
        super().__init__(name)
        self.lives = lives
    def speak(self):
        return "meow"
for a in [Animal("Rock"), Cat("Tom")]:
    print(a.intro())
print(Cat("Kit", 3).lives)`),
  P(`class Box:
    def __init__(self, items):
        self.items = items
    def __len__(self):
        return len(self.items)
    def __contains__(self, x):
        return x in self.items
    def __getitem__(self, i):
        return self.items[i]
    def __iter__(self):
        return iter(self.items)
b = Box([3, 1, 2])
print(len(b), 2 in b, 9 in b, b[0], list(b), sorted(b), bool(Box([])))`),
  P(`class Temp:
    def __init__(self, c):
        self._c = c
    @property
    def c(self):
        return self._c
    @c.setter
    def c(self, v):
        if v < -273:
            raise ValueError("too cold")
        self._c = v
    @property
    def f(self):
        return self._c * 9 / 5 + 32
t = Temp(100)
print(t.c, t.f)
t.c = 0
print(t.f)
try:
    t.c = -300
except ValueError as e:
    print("error:", e)
try:
    t.f = 3
except AttributeError:
    print("no setter")`),
  P(`class Coin:
    made = 0
    def __init__(self, v):
        self.v = v
        Coin.made += 1
    @classmethod
    def gold(cls):
        return cls(100)
    @staticmethod
    def valid(v):
        return v > 0
g = Coin.gold()
print(g.v, Coin.made, Coin.valid(-1), g.valid(5))`),
  P(`class Card:
    def __init__(self, r):
        self.r = r
    def __lt__(self, o):
        return self.r < o.r
    def __repr__(self):
        return f"Card({self.r})"
cs = [Card(3), Card(1), Card(2)]
print(sorted(cs), max(cs), min(cs), Card(1) < Card(2), Card(5) > Card(2))`),
  P(`class Money:
    def __init__(self, n):
        self.n = n
    def __radd__(self, o):
        return Money(self.n + o)
    def __add__(self, o):
        return Money(self.n + (o.n if isinstance(o, Money) else o))
    def __str__(self):
        return f"{self.n} gold"
print(sum([Money(2), Money(3)]), Money(1) + 4, 4 + Money(1))`),
  P(`class Gold(Exception):
    pass
class NoGold(Gold):
    def __init__(self, need):
        super().__init__(f"need {need} more")
        self.need = need
try:
    raise NoGold(5)
except Gold as e:
    print("caught", e, e.need, type(e).__name__, e.args)
try:
    raise Gold
except Exception as e:
    print(repr(e))
raise NoGold(2)`),
  P(`class A:
    pass
a = A()
a.x = 1
setattr(a, "y", 2)
print(hasattr(a, "x"), getattr(a, "z", 0), a.y, vars(a))
del a.x
print(hasattr(a, "x"))`),
  P(`class Counter:
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        return self
    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n
print(list(Counter(3)))
for x in Counter(2):
    print(x)`),
  P(`class Stack:
    def __init__(self):
        self._items = []
    def push(self, x):
        self._items.append(x)
        return self
    def pop(self):
        return self._items.pop()
    def __bool__(self):
        return bool(self._items)
s = Stack().push(1).push(2)
while s:
    print(s.pop())`),
  P(`class V:
    def __init__(self, x):
        self.x = x
print(V(1) == V(1), V(1) is V(1))
a = V(2)
b = a
print(a is b, a == b)
d = {a: "yes"}
print(d[b])`),
  P(`class Shape:
    def area(self):
        raise NotImplementedError("child classes decide")
class Sq(Shape):
    def __init__(self, s):
        self.s = s
    def area(self):
        return self.s ** 2
print(Sq(3).area())
Shape().area()`),
  P(`class A:
    def __init__(self, x):
        self.x = x
A()`),
  P(`class A:
    def f(self):
        return 1
A.f()`),
  P(`class Party:
    def __init__(self):
        self.members = []
    def add(self, hero):
        self.members.append(hero)
    def names(self):
        return [m.name for m in self.members]
class Hero:
    def __init__(self, name):
        self.name = name
p = Party()
for n in ["Ada", "Bo"]:
    p.add(Hero(n))
print(p.names(), len(p.members))`),
  P(`class Point:
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y
print(Point().x, Point(3).x, Point(y=4).y)
print(Point(1, 2).__dict__)`),
  P(`class Base:
    def __init__(self):
        print("base init")
class Kid(Base):
    pass
k = Kid()
print(type(k) == Kid, type(k) == Base, isinstance(k, Base))`),
  // generators and iterators
  P(`def count_up(n):
    i = 0
    while i < n:
        print("making", i)
        yield i
        i += 1
for x in count_up(3):
    print("got", x)`),
  P(`def gen():
    yield 1
    yield 2
g = gen()
print(next(g), next(g), next(g, "done"))
print(next(g))`),
  P(`def evens():
    n = 0
    while True:
        yield n
        n += 2
for e in evens():
    if e > 6:
        break
    print(e)
g = evens()
print([next(g) for _ in range(4)])`),
  P(`def sq(xs):
    for x in xs:
        if x % 2:
            continue
        yield x * x
    return
print(list(sq(range(7))), sum(sq([2, 4])))`),
  P(`def inner():
    yield "a"
    yield "b"
def outer():
    yield 0
    yield from inner()
    yield from [1, 2]
print(list(outer()))`),
  P(`squares = (x * x for x in range(5))
print(type(squares).__name__)
print(next(squares), list(squares), list(squares))
print(sum(x for x in range(10) if x % 3 == 0))`),
  P(`it = iter([1, 2, 3])
print(next(it))
print(list(it))
s = iter("ab")
print(next(s), next(s), next(s, None))`),
  P(`def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
out = []
for n in fib():
    if n > 50:
        break
    out.append(n)
print(out)`),
  P(`def g():
    try:
        yield 1
        yield 2
    finally:
        print("cleanup")
for x in g():
    print(x)`),
  // sets
  P(`s = {3, 1, 2}
s.add(2)
s.add(0)
print(s, len(s), 2 in s, 5 not in s)
t = {1, 5}
print(s | t, s & t, s - t, s ^ t)
print(sorted({"pear", "fig", "apple"}))
print(set(), {1, 2} <= {1, 2, 3}, {1} < {1})`),
  P(`s = set([1, 2, 2, 3, 3, 3])
s.discard(9)
s.remove(1)
print(s, len(set("banana")))
s.remove(9)`),
  P(`a = {x % 4 for x in range(10)}
print(a)
words = ["a", "b", "a"]
print(len(set(words)), {1, 2}.union({3}), {1, 2, 3}.intersection([2, 3, 4]))`),
  // lambda, map, filter, sorted key, zip, any, all
  P(`double = lambda x: x * 2
add = lambda a, b=10: a + b
print(double(4), add(1), add(1, 2), (lambda: "hi")())
nums = [5, 3, 8]
print(list(map(double, nums)), list(filter(lambda n: n > 4, nums)))
print(sorted(["bb", "a", "ccc"], key=len), sorted(nums, reverse=True))
pairs = [("a", 3), ("b", 1), ("c", 2)]
print(sorted(pairs, key=lambda p: p[1]), max(pairs, key=lambda p: p[1]))
print(list(zip([1, 2, 3], "ab")), dict(zip(["x", "y"], [1, 2])))
print(any([0, "", 3]), all([1, 2, 0]), all([]), any([]))
print(list(map(str.upper, ["a", "b"])), list(enumerate("hi", start=1)))
print(min(["bob", "al"], key=len), list(reversed([1, 2, 3])))`),
  P(`m = map(int, ["1", "2"])
print(m.__class__.__name__ if False else "map")
print(list(m), list(m))
words = ["Kiwi", "apple", "Banana"]
words.sort(key=str.lower)
print(words)
print(sorted([3, 1, 2], key=lambda n: -n))`),
  // *args, **kwargs, unpacking
  P(`def total(*nums):
    return sum(nums)
def show(**opts):
    return sorted(opts.items())
def mix(a, b=2, *rest, c, **kw):
    return a, b, rest, c, kw
print(total(), total(1, 2, 3), show(x=1, y=2))
print(mix(1, c=3), mix(1, 2, 3, 4, c=5, d=6))
nums = [4, 5]
print(total(*nums), total(*nums, 6))
cfg = {"x": 1, "y": 2}
print(show(**cfg))
first, *rest = [1, 2, 3, 4]
*init, last = "abc"
a, (b, c) = 1, (2, 3)
print(first, rest, init, last, a, b, c)
print(*[1, 2, 3], sep="-")
print([*"ab", *[1]], {**cfg, "z": 3})`),
  P(`def f(a, *, key):
    return a + key
print(f(1, key=2))
f(1, 2)`),
  P(`def f(x: int, y: int = 0) -> int:
    """Add two numbers."""
    return x + y
n: int = 5
print(f(n), f.__doc__, f.__name__)`),
  P(`def f(a, b):
    return a - b
print(f(b=1, a=5))
f(1, a=2)`),
  // walrus, comprehensions
  P(`data = [1, 5, 9, 2]
if (n := len(data)) > 3:
    print("long", n)
print([y for x in data if (y := x * 2) > 5])
grid = [[r * 3 + c for c in range(3)] for r in range(2)]
print(grid, [v for row in grid for v in row if v % 2])
print({w: len(w) for w in ["hi", "hey"]}, {k: v for k, v in [("a", 1)]})`),
  // is, None, misc builtins
  P(`x = None
print(x is None, x is not None, [] is [], type(3) == int, type("a") is str)
print(isinstance(True, int), isinstance(3, (str, float)), isinstance(3.0, (str, float)))
print(divmod(17, 5), pow(2, 10), pow(3, 4, 5), chr(65), ord("a"), abs(-2.5))
print(round(2.5), round(3.5), round(2.675, 2), round(0.125, 2), round(1234.5, -2))
print(int("ff", 16), int("101", 2), float("1e3"), int(-3.9), str(1e16), str(1.5e-7))
print(callable(len), callable(3), list(range(10, 0, -3)), range(5)[2])`),
  P(`print("{} and {}".format("a", "b"), "{1}{0}".format("x", "y"), "{name}!".format(name="Ada"))
print("{:>5}|{:<5}|{:^5}|".format("a", "b", "c"), "{:05.1f}".format(3.14159))
print(f"{42:x} {42:b} {42:o} {42:#x} {1234567:,} {0.25:.0%} {7:03d} {-5:+d} {5:+d}")
print(f"{3.14159:.2} {2.0:.3} {1234.5678:.3} {0.000012345:.2} {100:g} {1.5e10:g}")
print(f"{'hi':*^8} {'x':>3} {12:<4}| {3.5:e}")
x = 7
print(f"{x=} {x * 2 = }")`),
  P(`s = "Hello, World"
print(s.center(20, "*"), s.ljust(14, "."), s.rjust(14), "7".zfill(3), "-7".zfill(4))
print(s.partition(", "), s.removeprefix("Hello"), s.rfind("o"), s.index("W"))
print("a,b,,c".split(","), "a b  c".split(), "x-y-z".split("-", 1), "x-y-z".rsplit("-", 1))
print("ABC".isupper(), "abc".islower(), "  ".isspace(), "ab12".isalnum(), s.swapcase())
print(s.startswith(("He", "x")), "ab" * 0 == "", "%" in "50%")`),
  P(`d = {"a": 1}
print(d.setdefault("b", 2), d.setdefault("a", 9), d)
print(d.popitem(), d, dict(a=1, b=2), dict([("x", 1)]))
d2 = {"a": 0} | {"b": 1}
print(d2, list(d2.items()), {}.get("q"))`),
  // modules
  P(`import random
random.seed(42)
print(random.randint(1, 10), random.random(), random.choice(["a", "b", "c"]))
xs = list(range(10))
random.shuffle(xs)
print(xs, random.sample(range(100), 5), random.uniform(1, 2))
print(random.randrange(10), random.randrange(5, 50, 5), random.choices("abc", k=4))
print(random.choices([1, 2, 3], weights=[1, 0, 5], k=5))`),
  P(`import random
random.seed(7)
print([random.randint(1, 6) for _ in range(10)])
random.seed(123456789)
print(random.choice(range(1000)), random.sample(["a", "b", "c", "d", "e", "f", "g"], 3))`),
  P(`import random
print(random.randint(1, 100), random.randint(1, 100))
deck = ["A", "K", "Q", "J"]
random.shuffle(deck)
print(deck)`),
  P(`import math
from math import sqrt, pi as PI
print(math.sqrt(16), sqrt(2), round(PI, 3), math.floor(3.7), math.ceil(3.2), math.floor(-3.5))
print(math.factorial(5), math.gcd(12, 18), math.pow(2, 3), math.isqrt(17), math.log(math.e), math.log(8, 2))
print(math.inf > 10**9, math.fabs(-3), math.trunc(-2.7), math.hypot(3, 4), math.log10(1000), math.lcm(4, 6))
math.sqrt(-1)`),
  P(`import statistics
print(statistics.mean([1, 2, 3, 4]), statistics.mean([1, 2, 3]), statistics.median([3, 1, 2]))
print(statistics.median([4, 1, 3, 2]), statistics.mode(["a", "b", "b", "a", "c", "a"]), statistics.mean([1.5, 2.5]))
statistics.mean([])`),
  P(`import json
d = {"name": "Ada", "lvl": 3, "tags": ["a", "b"], "ok": True, "x": None, "f": 1.5}
s = json.dumps(d)
print(s)
back = json.loads(s)
print(back == d, back["tags"][1], type(back["lvl"]).__name__)
print(json.dumps([1, "two", {"3": 4}], indent=2))
print(json.dumps({"b": 1, "a": 2}, sort_keys=True), json.dumps("caf\\u00e9"), json.dumps((1, 2)))
print(json.loads('{"a": [1, 2.0, "x"], "b": false}'))
json.loads("{'bad': 1}")`),
  P(`import json
with open("save.json", "w") as f:
    json.dump({"hp": 10, "items": ["key"]}, f)
with open("save.json") as f:
    data = json.load(f)
print(data["items"], data["hp"] + 1)`),
  P(`import csv
with open("crew.csv") as f:
    for row in csv.reader(f):
        print(row)
with open("crew.csv") as f:
    for row in csv.DictReader(f):
        print(row["name"], int(row["lvl"]) + 1)`, { files: { 'crew.csv': 'name,lvl\nAda,3\n"Bo, Jr",5\n' } }),
  P(`import csv
with open("out.csv", "w") as f:
    w = csv.writer(f)
    w.writerow(["name", "note"])
    w.writerow(["Ada", "hi, there"])
with open("out2.csv", "w") as f:
    w = csv.DictWriter(f, fieldnames=["a", "b"])
    w.writeheader()
    w.writerow({"a": 1, "b": 2})`),
  P(`import sys
print(len(sys.argv), sys.argv[1:])
if len(sys.argv) < 3:
    sys.exit("Too few arguments")
print("never")`, { argv: ['hello.py', 'Ada'] }),
  P(`import sys
name = sys.argv[1]
print(f"hello, {name}")
sys.exit(0)
print("not here")`, { argv: ['hello.py', 'Wren'] }),
  P(`import sys
try:
    sys.exit("bye")
except Exception:
    print("not caught by Exception")`),
  P(`import sys
try:
    sys.exit("bye")
except SystemExit as e:
    print("caught exit", e)`),
  P(`import nonsense`),
  P(`from math import squareroot`),
  P(`import math as m, random
print(m.floor(2.5), m.__name__, type(random).__name__)`),
  // regex
  P(`import re
print(re.search(r"\\d+", "abc 123 def").group())
print(re.search(r"z", "abc"))
m = re.match(r"(\\w+)@(\\w+)\\.com", "ada@spell.com")
print(m.group(1), m.group(2), m.groups(), m.group(0), m.start(), m.end(), m.span())
print(re.fullmatch(r"\\d{3}", "123") is not None, re.fullmatch(r"\\d{3}", "1234"))
print(re.findall(r"\\d+", "a1b22c333"), re.findall(r"(\\w)(\\d)", "a1 b2"), re.findall(r"(\\d)x", "1x2x"))
print(re.sub(r"\\s+", " ", "a   b    c"), re.sub(r"(\\w+) (\\w+)", r"\\2 \\1", "hello world"))
print(re.split(r"[,;]\\s*", "a, b;c"), re.sub(r"\\d", lambda m: str(int(m.group()) * 2), "a1b4"))
print(re.search(r"^h.*o$", "hello", re.IGNORECASE), bool(re.search(r"^H", "hello", re.I)))`),
  P(`import re
p = re.compile(r"(?P<user>\\w+)@(?P<site>[\\w.]+)")
m = p.search("mail ada@x.org now")
print(m.group("user"), m["site"], m.groupdict())
print(p.findall("a@b.c d@e.f"), p.pattern)
email = "ada@spell"
if re.search(r"^\\w+@(\\w+\\.)?\\w+\\.(com|org)$", email):
    print("valid")
else:
    print("invalid")
if m := re.search(r"(\\d+)-(\\d+)", "pages 10-25"):
    print(int(m.group(2)) - int(m.group(1)))
print(re.sub(r"^(\\w+), (\\w+)$", r"\\2 \\1", "Malan, David"))
print(re.search(r"\\.", "a.b"), re.findall(r"[aeiou]", "education"))`),
  P(`import re
print(re.findall(r"\\b\\w{4}\\b", "this is some text with four"), re.search(r"colou?r", "nice color").group())
print(re.sub(r"(?i)cat", "dog", "Cat cat CAT"), re.split(r"\\s", "a b"), re.findall(r"a*", "baa"))
print(re.match(r"\\d", "a1"), re.search(r"[A-Z][a-z]+", "hi Bob").group(), re.findall(r"\\d{2,3}", "1 12 123 1234"))`),
  P(`import re
re.search(r"(", "x")`),
  // assert, input
  P(`def square(n):
    return n * n
assert square(3) == 9
assert square(2) == 4, "two"
print("ok")
assert square(2) == 5, "square is wrong"`),
  P(`x = 3
assert x > 5`),
  P(`name = input("Name? ")
age = int(input("Age? "))
print(f"{name} is {age}")
print(input())`, { input: ['Ada', '30'] }),
  P(`n = input("Number: ")
print(n.isdigit())`, { input: ['12'] }),
  // with + custom context manager, exceptions
  P(`class Door:
    def __enter__(self):
        print("open")
        return self
    def __exit__(self, kind, value, tb):
        print("close", kind.__name__ if kind else None)
        return kind is ValueError
with Door() as d:
    print("inside", type(d).__name__)
with Door():
    raise ValueError("swallowed")
print("after")
with Door():
    raise KeyError("x")`),
  P(`try:
    try:
        int("x")
    except ValueError:
        print("inner")
        raise
except ValueError as e:
    print("outer", e)
try:
    raise TypeError("a") from None
except (KeyError, TypeError) as e:
    print(type(e).__name__, e.args)
for i in range(3):
    pass
else:
    print("loop finished", i)
while False:
    pass
else:
    print("while else")
for i in range(3):
    if i == 1:
        break
else:
    print("no")`),
  P(`def f():
    return f"{1/0}"
try:
    f()
except ZeroDivisionError as e:
    print("caught", e, str(e), repr(e), e.args)
try:
    [].pop()
except IndexError as e:
    print(e)
try:
    {}["k"]
except KeyError as e:
    print(e, repr(e))
print(repr(ValueError("bad")), str(ValueError()), ValueError("a", 2))`),
  // files + modules on the shelf
  P(`from calc import add, NAME
import calc
print(add(2, 3), NAME, calc.mul(2, 4))`, { files: { 'calc.py': 'NAME = "calc"\ndef add(a, b):\n    return a + b\ndef mul(a, b):\n    return a * b\nif __name__ == "__main__":\n    print("ran as main")\n' } }),
  P(`def main():
    print("hello from main")
if __name__ == "__main__":
    main()`),
  // misc numeric and repr
  P(`print(1e16, 1.5e-7, 0.1 + 0.2, 1/3, 2**0.5, 10/4, 7//2, -7//2, -7 % 3, 3 * 1.1, 100.0, 1e-4, 123456789.0 * 10)
print(float("inf"), -float("inf"), 5 & 3, 5 | 3, 5 ^ 3, ~5, True + True, 2 ** -1)
print(type(1 == 1), type(None).__name__, type([]).__name__, type(len).__name__, type(lambda: 0).__name__)`),
  P(`print(sorted({3: "c", 1: "a"}), sorted("hello"), sorted([(2, "b"), (1, "z"), (2, "a")]))
print(list("ab") + ["c"], [1, 2] * 2, (1,) + (2,), [[0] * 2] * 2, "-".join(map(str, [1, 2, 3])))
print(max(3, 7, 2), min("b", "a"), max([], default=0), sum([0.1] * 3), sum([[1], [2]], []))
print(list(range(0)), list(range(-3)), [i for i in range(3)][::-1], "abc"[::-1], "abcdef"[1:5:2])`),
  P(`x = [1, 2, 3]
y = x
y.append(4)
print(x, x is y, x == [1, 2, 3, 4])
z = x.copy()
z.append(5)
print(x, z)
def add_item(item, bag=[]):
    bag.append(item)
    return bag
print(add_item(1), add_item(2))`),
  P(`nums = [3, 1, 4, 1, 5]
print(nums.index(4), nums.count(1), sorted(nums), nums)
nums.sort(reverse=True)
print(nums, nums[::2], list(enumerate(nums))[:2])
print(sum(n for n in nums if n > 2), [n * 2 for n in nums if n % 2 == 1])`),
  // match / case
  P(`for cmd in ["north", "south", "dance", "w"]:
    match cmd:
        case "north" | "n":
            print("up")
        case "south":
            print("down")
        case "w" | "west":
            print("left")
        case _:
            print("unknown", cmd)`),
  P(`def where(point):
    match point:
        case [0, 0]:
            return "origin"
        case [x, 0]:
            return f"x-axis {x}"
        case [0, y]:
            return f"y-axis {y}"
        case [x, y] if x == y:
            return "diagonal"
        case [first, *rest]:
            return f"starts {first} then {len(rest)}"
        case _:
            return "?"
for p in [[0, 0], [3, 0], [0, 5], [2, 2], [1, 2, 3], [7, 8], 5]:
    print(where(p))`),
  P(`n = 7
match n:
    case 1 | 2 | 3:
        print("small")
    case 7 as lucky:
        print("lucky", lucky)
    case None:
        print("none")
match = 3
print(match + 1)`),
  P(`x = None
match x:
    case None:
        print("nothing")
    case _:
        print("something")`),
  // global and nonlocal
  P(`gold = 10
def earn(n):
    global gold
    gold += n
def spend(n):
    global gold
    gold = gold - n
earn(5)
spend(3)
print(gold)
def peek():
    return gold * 2
print(peek())`),
  P(`count = 0
def bump():
    count += 1
bump()`),
  P(`def counter():
    n = 0
    def tick():
        nonlocal n
        n += 1
        return n
    tick()
    tick()
    return tick()
print(counter())`),
  // argparse
  P(`import argparse
parser = argparse.ArgumentParser(description="Greets people")
parser.add_argument("-n", default=1, help="number of times", type=int)
parser.add_argument("name")
args = parser.parse_args()
for _ in range(args.n):
    print("meow", args.name)
print(args)`, { argv: ['meow.py', '-n', '3', 'Ada'] }),
  P(`import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--loud", action="store_true")
parser.add_argument("word")
args = parser.parse_args()
w = args.word.upper() if args.loud else args.word
print(w, args.loud)`, { argv: ['shout.py', 'hi', '--loud'] }),
  P(`import argparse
parser = argparse.ArgumentParser()
parser.add_argument("-n", type=int, default=2)
args = parser.parse_args(["-n", "5"])
print(args.n * 2)`),
  // input() and csv
  P(`def get_int(prompt):
    while True:
        try:
            return int(input(prompt))
        except ValueError:
            print("Not a number")
n = get_int("Number: ")
print(n * 2)`, { input: ['cat', '4.5', '21'] }),
  P(`name = input("What's your name? ").strip().title()
print(f"hello, {name}")`, { input: ['  ada lovelace '] }),
  P(`import csv
students = list()
with open("students.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        students.append({"name": row["name"], "house": row["house"]})
for s in sorted(students, key=lambda s: s["name"]):
    print(f"{s['name']} is in {s['house']}")`, { files: { 'students.csv': 'name,house\nRon,Gryffindor\nDraco,Slytherin\nHermione,Gryffindor\n' } }),
  P(`import csv
with open("out.csv", "a", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "home"])
    writer.writerow({"name": "Ada", "home": "London"})
with open("out.csv") as f:
    for name, home in csv.reader(f):
        print(name, "/", home)`, { files: { 'out.csv': 'Wren,Oslo\n' } }),
];
