/* World 45: The Court of Exceptions. Custom exceptions: defining your own error classes,
   hierarchies (an app base class, except order, the built-in family tree), errors that carry
   data, chaining with raise ... from (and from None), re-raising and translating errors at a
   boundary, and EAFP versus catching too much.
   Sources: our own, CS50P lecture 3 (exceptions), the Python tutorial chapter 8. */
Object.assign(EXTRA.npcs, {
  justicar: { name: 'Justicar Ione', colors: ['#7a1a1a', '#f0c53a', '#91603e'] },
});
Object.assign(EXTRA.foes, {
  blameimp: { base: 'goblin', name: 'Blame imp', pal: { G: '#b04f4f', B: '#3a2a4a' } },
  chainwraith: { base: 'lich', name: 'Chain wraith', pal: { W: '#f0c53a' } },
  highjudge: { base: 'tribunal', name: 'The High Judge', pal: {} },
});

const COURT = ['class CourtError(Exception):', '    pass', 'class Perjury(CourtError):', '    pass', 'class Contempt(CourtError):', '    pass'];

const WORLD45 = {
  id: 45, name: 'The Court of Exceptions', topic: 'custom exceptions',
  nodes: [[50, 92], [72, 82], [38, 72], [66, 62], [34, 52], [64, 42], [36, 32], [60, 21], [48, 8]],
  levels: [
    {
      id: '45-1', title: 'Errors of your own', bg: 'court', npc: 'justicar', mentor: 'justicar', tags: ['excclass'],
      steps: [
        { type: 'talk', who: 'justicar', text: 'Order in the court, {NAME}! You know ValueError and KeyError. But when YOUR code fails in its own way (an empty spellbook, a forged seal), a built-in error says too little. Make your own: class SealBroken(Exception): pass.' },
        { type: 'talk', who: 'justicar', text: 'A custom error is an ordinary class that inherits from Exception. Raise it with a message, catch it by name. Callers can then catch exactly YOUR problem and nothing else. By custom its name ends in Error, or names the problem plainly.' },
        { type: 'demo', text: 'A brand-new error. Run it.', code: ['class SealBroken(Exception):', '    pass', 'def open_scroll(sealed):', '    if not sealed:', '        raise SealBroken("the wax is cracked")', '    return "scroll text"', 'try:', '    open_scroll(False)', 'except SealBroken as e:', '    print("caught:", e)'] },
        {
          type: 'predict', vars: R => ({ s: R.pick(['True', 'False']) }), text: 'What will it say?', code: ['class EmptyBook(Exception):', '    pass', 'def first_spell(book):', '    if not book:', '        raise EmptyBook("no spells")', '    return book[0]', 'book = ["fire"] if $s else []', 'try:', '    print(first_spell(book))', 'except EmptyBook as e:', '    print("error:", e)'],
          explain: 'The custom error is raised only when the book is empty.',
        },
        {
          type: 'predict', text: 'Name, message and type. What will it say?', code: ['class Forgery(Exception):', '    pass', 'try:', '    raise Forgery("fake seal")', 'except Forgery as e:', '    print(type(e).__name__, "|", e, "|", repr(e))', '    print(isinstance(e, Exception))'],
          explain: 'str(e) is the message; repr shows the class too. It is an Exception like any other.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Nobody catches it. Which error ends the program?', code: ['class OutOfInk(Exception):', '    pass', 'def write(ink):', '    if ink == 0:', '        raise OutOfInk("quill is dry")', 'write(0)'],
          explain: 'An uncaught custom error stops the program, named just like a built-in one: OutOfInk.',
        },
        {
          type: 'predict', text: 'A ValueError is not your error. What will it say?', code: ['class BadVerdict(Exception):', '    pass', 'try:', '    try:', '        int("guilty")', '    except BadVerdict:', '        print("bad verdict")', 'except ValueError:', '    print("plain ValueError")'],
          explain: 'except BadVerdict only catches BadVerdict; the ValueError passes it by.',
        },
        {
          type: 'fill', text: 'Make Mistrial a real error class.',
          lines: ['class Mistrial([]):', '    pass', 'try:', '    raise Mistrial("jury asleep")', 'except Mistrial as e:', '    print("declared:", e)'], chips: ['Exception', 'object', 'str'], answer: [['Exception']],
          hints: ['Errors must inherit from Exception.', 'class Mistrial(Exception):'],
        },
        {
          type: 'write', text: 'Define an error class NoWitness. Write call_witness(name) that raises NoWitness("nobody came") when name is "", and returns "witness " + name otherwise. Try call_witness("") and print "error: " plus the message when it fails.',
          starter: [], keys: ['class', 'NoWitness', '(', ')', ':', 'Exception', 'pass', 'def', 'call_witness', 'name', 'if', '==', '""', 'raise', '"nobody came"', 'return', '"witness "', '+', 'try', 'except', 'as', 'e', 'print', '"error:"', ','],
          require: l => (has(l, /class NoWitness\(Exception\)/) && has(l, /except NoWitness/) ? null : 'Define class NoWitness(Exception) and catch it with except NoWitness.'),
          hints: ['class NoWitness(Exception):\n    pass\ndef call_witness(name):\n    if name == "":\n        raise NoWitness("nobody came")\n    return "witness " + name', 'try:\n    call_witness("")\nexcept NoWitness as e:\n    print("error:", e)'],
          solution: ['class NoWitness(Exception):', '    pass', 'def call_witness(name):', '    if name == "":', '        raise NoWitness("nobody came")', '    return "witness " + name', 'try:', '    call_witness("")', 'except NoWitness as e:', '    print("error:", e)'],
        },
      ],
      learn: [{ title: 'Custom exceptions', code: 'class SealBroken(Exception):\n    pass\nraise SealBroken("cracked")', text: 'Inherit from Exception. Raise and catch it by name.' }],
    },
    {
      id: '45-2', title: 'Families of errors', bg: 'court', npc: 'justicar', mentor: 'justicar', tags: ['exchier'],
      steps: [
        { type: 'talk', who: 'justicar', text: 'Errors come in families. Give your program ONE base error, class CourtError(Exception), and make the specific ones inherit from it. Then except CourtError catches the whole family, while except Perjury catches just one member.' },
        { type: 'talk', who: 'justicar', text: 'Python checks except clauses from top to bottom and takes the FIRST match. Put the specific ones first: a base class first would swallow everything below it. Built-in errors are a family tree too: KeyError and IndexError are LookupErrors; ZeroDivisionError is an ArithmeticError; nearly all are Exceptions.' },
        { type: 'demo', text: 'One family. Run it.', code: [...COURT, 'for err in [Perjury("lied"), Contempt("shouted")]:', '    try:', '        raise err', '    except CourtError as e:', '        print("court handles", type(e).__name__, e)'] },
        {
          type: 'predict', vars: R => ({ e: R.pick(['Perjury', 'Contempt']) }), text: 'Specific first. What will it say?', code: [...COURT, 'try:', '    raise $e("order!")', 'except Perjury:', '    print("perjury")', 'except CourtError:', '    print("some court error")'],
          explain: 'The first matching except wins.',
        },
        {
          type: 'predict', text: 'The base class placed first. What will it say?', code: [...COURT, 'try:', '    raise Perjury("lied")', 'except CourtError:', '    print("caught by the base")', 'except Perjury:', '    print("caught as perjury")'],
          explain: 'CourtError matches first, so the Perjury clause can never run.',
        },
        {
          type: 'predict', text: 'Family questions. What will it say?', code: [...COURT, 'print(issubclass(Perjury, CourtError), issubclass(CourtError, Perjury))', 'print(issubclass(Contempt, Exception), isinstance(Perjury("x"), Contempt))'],
          explain: 'Children are their parents; parents are not their children; siblings are not each other.',
        },
        {
          type: 'predict', vars: R => ({ c: R.pick(['{}["x"]', '[][0]']) }), text: 'The built-in family. What will it say?', code: ['try:', '    $c', 'except LookupError as e:', '    print("lookup failed:", type(e).__name__)', 'print(issubclass(ZeroDivisionError, ArithmeticError))'],
          explain: 'KeyError and IndexError both inherit from LookupError.',
        },
        {
          type: 'fill', text: 'Catch the whole family with one clause.',
          lines: [...COURT, 'for e in [Perjury("a"), Contempt("b")]:', '    try:', '        raise e', '    except []:', '        print("handled", type(e).__name__)'], chips: ['CourtError', 'Perjury', 'Contempt'], answer: [['CourtError']],
          hints: ['Catch the shared parent.', 'except CourtError:'],
        },
        {
          type: 'write', text: 'Build a family: SpellError(Exception), with children Fizzle and Backfire. Raise Backfire("singed"). Catch Fizzle first (print "fizzle"), then SpellError (print "spell error" and the message).',
          starter: [], keys: ['class', 'SpellError', 'Fizzle', 'Backfire', '(', ')', ':', 'Exception', 'pass', 'try', 'raise', '"singed"', 'except', 'as', 'e', 'print', '"fizzle"', '"spell error"', ','],
          require: l => (has(l, /class Fizzle\(SpellError\)/) && has(l, /class Backfire\(SpellError\)/) ? null : 'Fizzle and Backfire must inherit from SpellError.'),
          hints: ['class SpellError(Exception):\n    pass\nclass Fizzle(SpellError):\n    pass\nclass Backfire(SpellError):\n    pass', 'try:\n    raise Backfire("singed")\nexcept Fizzle:\n    print("fizzle")\nexcept SpellError as e:\n    print("spell error", e)'],
          solution: ['class SpellError(Exception):', '    pass', 'class Fizzle(SpellError):', '    pass', 'class Backfire(SpellError):', '    pass', 'try:', '    raise Backfire("singed")', 'except Fizzle:', '    print("fizzle")', 'except SpellError as e:', '    print("spell error", e)'],
        },
      ],
      learn: [{ title: 'Error hierarchies', code: 'class AppError(Exception): ...\nclass NotFound(AppError): ...\nexcept NotFound: ...   # specific first\nexcept AppError: ...', text: 'One base per program. The first matching except wins.' }],
    },
    {
      id: '45-3', title: 'Errors that carry evidence', bg: 'archive', npc: 'justicar', mentor: 'justicar', tags: ['excdata'],
      steps: [
        { type: 'talk', who: 'justicar', text: 'A good error carries EVIDENCE. Give it an __init__ that stores useful attributes, and pass a readable message to super().__init__(message) so str(e) and e.args still work. The handler can then read e.item, e.amount and decide what to do.' },
        { type: 'demo', text: 'An error with evidence. Run it.', code: ['class NotEnoughGold(Exception):', '    def __init__(self, needed, have):', '        super().__init__(f"need {needed}, have {have}")', '        self.needed = needed', '        self.have = have', 'try:', '    raise NotEnoughGold(50, 20)', 'except NotEnoughGold as e:', '    print(e)', '    print("short by", e.needed - e.have)'] },
        {
          type: 'predict', vars: R => ({ n: R.pick(['map', 'key', 'lamp']) }), text: 'What will it say?', code: ['class Missing(Exception):', '    def __init__(self, item):', '        super().__init__(f"{item} not found")', '        self.item = item', 'try:', '    raise Missing("$n")', 'except Missing as e:', '    print(e, "|", e.item, "|", e.args)'],
          explain: 'The message went to Exception (so str and args), and the item is kept separately.',
        },
        {
          type: 'predict', text: 'A custom __str__. What will it say?', code: ['class Verdict(Exception):', '    def __init__(self, who, guilty):', '        super().__init__(who, guilty)', '        self.who = who', '        self.guilty = guilty', '    def __str__(self):', '        return f"{self.who}: {\'guilty\' if self.guilty else \'innocent\'}"', 'print(str(Verdict("Pip", False)))', 'print(Verdict("Rook", True).args)'],
          explain: '__str__ decides how the error reads; args still holds what was passed to super().__init__.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Forgot to pass the fields. Which error?', code: ['class Overdue(Exception):', '    def __init__(self, days):', '        super().__init__(f"{days} days late")', '        self.days = days', 'raise Overdue()'],
          explain: 'Overdue needs days. Calling it without: TypeError (missing argument), before anything is raised.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(3, 9) }), text: 'The handler uses the evidence. What will it say?', code: ['class TooHeavy(Exception):', '    def __init__(self, weight, limit):', '        super().__init__(f"{weight} > {limit}")', '        self.extra = weight - limit', 'def load(weight):', '    if weight > 10:', '        raise TooHeavy(weight, 10)', '    return "loaded"', 'for w in [5, 10 + $a]:', '    try:', '        print(load(w))', '    except TooHeavy as e:', '        print("drop", e.extra, "kg")'],
          explain: 'The second load is $a kg too heavy, and the handler reads that from e.extra.',
        },
        {
          type: 'fill', text: 'Send the message up to Exception so str(e) works.',
          lines: ['class Fine(Exception):', '    def __init__(self, amount):', '        [].__init__(f"pay {amount} gold")', '        self.amount = amount', 'try:', '    raise Fine(30)', 'except Fine as e:', '    print(e, e.amount)'], chips: ['super()', 'self', 'Fine'], answer: [['super()']],
          hints: ['Call the parent class\'s __init__.', 'super().__init__(...)'],
        },
        {
          type: 'write', text: 'Write class BadSeal(Exception) whose __init__(self, code) passes f"bad seal {code}" to super().__init__ and stores self.code. Raise BadSeal(7), catch it, and print the error and then e.code * 2.',
          starter: [], keys: ['class', 'BadSeal', '(', ')', ':', 'Exception', 'def', '__init__', 'self', 'code', ',', 'super().__init__', 'f"bad seal {code}"', 'self.code', '=', 'try', 'raise', '7', 'except', 'as', 'e', 'print', 'e.code', '*', '2'],
          require: l => (has(l, /super\(\)\.__init__/) && has(l, /self\.code\s*=/) ? null : 'Call super().__init__ with the message and store self.code.'),
          hints: ['class BadSeal(Exception):\n    def __init__(self, code):\n        super().__init__(f"bad seal {code}")\n        self.code = code', 'try:\n    raise BadSeal(7)\nexcept BadSeal as e:\n    print(e)\n    print(e.code * 2)'],
          solution: ['class BadSeal(Exception):', '    def __init__(self, code):', '        super().__init__(f"bad seal {code}")', '        self.code = code', 'try:', '    raise BadSeal(7)', 'except BadSeal as e:', '    print(e)', '    print(e.code * 2)'],
        },
      ],
      learn: [{ title: 'Errors with data', code: 'class Missing(Exception):\n    def __init__(self, item):\n        super().__init__(f"{item} not found")\n        self.item = item', text: 'Keep the message for str(e); keep the evidence in attributes.' }],
    },
    {
      id: '45-4', title: 'Blame imps', bg: 'court', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'blameimp', hp: d0 + 16, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Blame imps pelt the court with accusations! $HP HP. Catch each error and strike with the evidence it carries.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Strike with every accusation\'s power.',
          lines: ['class Accusation(Exception):', '    def __init__(self, power):', '        super().__init__("blame!")', '        self.power = power', 'for p in [7, 9]:', '    try:', '        raise Accusation(p)', '    except Accusation as e:', '        cast(fireball, e.[])'], chips: ['power', 'args', 'p'], answer: [['power']],
          goal: { foeDown: true },
          require: s => (s[0] === 'power' ? null : 'Read the evidence the error carries.'),
          hints: ['The error stored its power.', 'e.power'],
        },
        { type: 'talk', who: 'narrator', text: 'The imp chief points every claw at you!' },
        {
          type: 'write', vars: R => ({ n: R.int(5, 9) }),
          spawn: v => ({ kind: 'blameimp', hp: v.n * 2, tint: 'big' }),
          text: 'It has $n × 2 HP. Define class Counterclaim(Exception). Twice (in a loop of 2), raise Counterclaim and catch it, casting icebolt with $n in the except.',
          starter: [], keys: ['class', 'Counterclaim', '(', ')', ':', 'Exception', 'pass', 'for', 'i', 'in', 'range', '2', 'try', 'raise', 'except', 'cast', 'icebolt', ',', '$n'],
          goal: { foeDown: true },
          require: l => (has(l, /except Counterclaim/) ? null : 'Catch it with except Counterclaim:'),
          hints: ['class Counterclaim(Exception):\n    pass', 'for i in range(2):\n    try:\n        raise Counterclaim\n    except Counterclaim:\n        cast(icebolt, $n)'],
          solution: ['class Counterclaim(Exception):', '    pass', 'for i in range(2):', '    try:', '        raise Counterclaim', '    except Counterclaim:', '        cast(icebolt, $n)'],
        },
      ],
      learn: [{ title: 'Evidence in battle', code: 'except Accusation as e:\n    cast(fireball, e.power)', text: 'Errors can carry exactly the data the handler needs.' }],
    },
    {
      id: '45-5', title: 'Chains of blame', bg: 'archive', npc: 'justicar', mentor: 'justicar', tags: ['raisefrom'],
      steps: [
        { type: 'talk', who: 'justicar', text: 'Often one error CAUSES another: a missing key makes your config loader fail. raise ConfigError("bad config") from e links them: the new error\'s __cause__ is e, and the traceback shows both, "The above exception was the direct cause...".' },
        { type: 'talk', who: 'justicar', text: 'Even without from, raising inside an except remembers the first error as __context__ ("During handling of the above exception, another occurred"). And raise ... from None hides the old one when it is just noise.' },
        { type: 'demo', text: 'A chain of blame. Run it.', code: ['class ConfigError(Exception):', '    pass', 'def load(settings):', '    try:', '        return settings["level"]', '    except KeyError as e:', '        raise ConfigError("no level set") from e', 'try:', '    load({})', 'except ConfigError as err:', '    print(err, "| caused by", repr(err.__cause__))'] },
        {
          type: 'predict', text: 'Implicit chaining. What will it say?', code: ['try:', '    try:', '        1 / 0', '    except ZeroDivisionError:', '        raise ValueError("bad maths")', 'except ValueError as e:', '    print(e, "|", type(e.__context__).__name__, "|", e.__cause__)'],
          explain: 'No from, so __cause__ is None, but __context__ remembers the ZeroDivisionError.',
        },
        {
          type: 'predict', text: 'from None. What will it say?', code: ['class LookupFailed(Exception):', '    pass', 'try:', '    try:', '        {}["x"]', '    except KeyError:', '        raise LookupFailed("x is missing") from None', 'except LookupFailed as e:', '    print(e, e.__cause__, e.__suppress_context__)'],
          explain: 'from None sets no cause and marks the context as hidden.',
        },
        {
          type: 'predict', vars: R => ({ v: R.pick(['"12"', '"twelve"']) }), text: 'Translate a low-level error. What will it say?', code: ['class AgeError(Exception):', '    pass', 'def parse_age(text):', '    try:', '        return int(text)', '    except ValueError as e:', '        raise AgeError(f"not an age: {text}") from e', 'try:', '    print(parse_age($v) + 1)', 'except AgeError as e:', '    print(e, "<-", type(e.__cause__).__name__)'],
          explain: 'A bad number becomes an AgeError whose cause is the original ValueError.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'The chain is not caught. Which error ends the program?', code: ['class LoadError(Exception):', '    pass', 'try:', '    open("missing.txt")', 'except FileNotFoundError as e:', '    raise LoadError("could not load") from e'],
          explain: 'The program ends with the LAST error raised: LoadError (with the FileNotFoundError shown as its cause).',
        },
        {
          type: 'fill', text: 'Link the new error to its cause.',
          lines: ['class ScrollError(Exception):', '    pass', 'try:', '    try:', '        [1, 2][5]', '    except IndexError as e:', '        raise ScrollError("page missing") [] e', 'except ScrollError as err:', '    print(err, type(err.__cause__).__name__)'], chips: ['from', 'with', 'as'], answer: [['from']],
          hints: ['raise NewError(...) ___ old_error', 'from e'],
        },
        {
          type: 'write', text: 'Write class PriceError(Exception). Write price(text) that returns float(text), but turns a ValueError into PriceError("bad price") from the original. Call price("ten") in a try, and print the error and the type name of its __cause__.',
          starter: [], keys: ['class', 'PriceError', '(', ')', ':', 'Exception', 'pass', 'def', 'price', 'text', 'try', 'return', 'float', 'except', 'ValueError', 'as', 'e', 'raise', '"bad price"', 'from', 'err', '"ten"', 'print', 'type', 'err.__cause__', '.__name__', ','],
          require: l => (has(l, /raise PriceError\(.*\) from e/) ? null : 'Chain it: raise PriceError("bad price") from e'),
          hints: ['class PriceError(Exception):\n    pass\ndef price(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise PriceError("bad price") from e', 'try:\n    price("ten")\nexcept PriceError as err:\n    print(err, type(err.__cause__).__name__)'],
          solution: ['class PriceError(Exception):', '    pass', 'def price(text):', '    try:', '        return float(text)', '    except ValueError as e:', '        raise PriceError("bad price") from e', 'try:', '    price("ten")', 'except PriceError as err:', '    print(err, type(err.__cause__).__name__)'],
        },
      ],
      learn: [{ title: 'Exception chaining', code: 'raise NewError("...") from e   # __cause__\nraise NewError("...")          # __context__\nraise NewError("...") from None # hide it', text: 'Keep the trail of blame, or hide it on purpose.' }],
    },
    {
      id: '45-6', title: 'Passing the case upward', bg: 'court', npc: 'justicar', mentor: 'justicar', tags: ['reraise'],
      steps: [
        { type: 'talk', who: 'justicar', text: 'Sometimes a handler should note the error and then let it CONTINUE upward: a bare raise inside except re-raises the very same error, traceback intact. Log here, decide higher up.' },
        { type: 'talk', who: 'justicar', text: 'Handle an error where you can actually DO something about it. Low-level code often cannot, so it lets errors through, or translates them into your program\'s own error type at the boundary.' },
        { type: 'demo', text: 'Note it, then pass it on. Run it.', code: ['def risky():', '    try:', '        return 1 / 0', '    except ZeroDivisionError:', '        print("logging: division failed")', '        raise', 'try:', '    risky()', 'except ZeroDivisionError as e:', '    print("handled upstairs:", e)'] },
        {
          type: 'predict', text: 'What will it say?', code: ['def clerk(case):', '    try:', '        return {"a": 1}[case]', '    except KeyError:', '        print("clerk: no such case")', '        raise', 'def judge(case):', '    try:', '        return clerk(case)', '    except KeyError as e:', '        return "dismissed " + str(e)', 'print(judge("a"))', 'print(judge("z"))'],
          explain: 'The clerk notes the missing case and re-raises; the judge handles it.',
        },
        {
          type: 'predict', text: 'Re-raising keeps the same error object. What will it say?', code: ['try:', '    try:', '        raise ValueError("original")', '    except ValueError as inner:', '        first = inner', '        raise', 'except ValueError as outer:', '    print(outer is first, outer)'],
          explain: 'A bare raise passes on the same object, not a copy.',
        },
        {
          type: 'predict', vars: R => ({ x: R.pick(['"5"', '"five"', '0']) }), text: 'Each layer does its job. What will it say?', code: ['class InputError(Exception):', '    pass', 'def parse(text):', '    try:', '        return int(text)', '    except ValueError as e:', '        raise InputError(f"{text!r} is not a number") from e', 'def compute(text):', '    return 100 // parse(text)', 'try:', '    print(compute($x))', 'except InputError as e:', '    print("input:", e)', 'except ZeroDivisionError:', '    print("cannot divide by zero")'],
          explain: 'parse translates bad text into InputError; a zero gets through and fails in compute.',
        },
        {
          type: 'predict', text: 'finally runs before the error leaves. What will it say?', code: ['def hearing():', '    try:', '        print("opening")', '        raise RuntimeError("riot")', '    finally:', '        print("court adjourned")', 'try:', '    hearing()', 'except RuntimeError as e:', '    print("outside:", e)'],
          explain: 'finally runs on the way out, then the error continues to the caller.',
        },
        {
          type: 'fill', text: 'Note the failure, then send the same error upward.',
          lines: ['def fetch(book, page):', '    try:', '        return book[page]', '    except IndexError:', '        print("no page", page)', '        []', 'try:', '    fetch(["intro"], 3)', 'except IndexError as e:', '    print("caller saw:", e)'], chips: ['raise', 'return', 'pass'], answer: [['raise']],
          hints: ['A bare statement that re-raises.', 'raise'],
        },
        {
          type: 'write', text: 'Write check(n) that, inside try, returns 10 // n; on ZeroDivisionError it prints "zero given" and re-raises. Call check(0) inside a try in the main code, and print "caught again" in its except.',
          starter: [], keys: ['def', 'check', '(', ')', ':', 'n', 'try', 'return', '10', '//', 'except', 'ZeroDivisionError', 'print', '"zero given"', 'raise', '0', '"caught again"'],
          require: l => (has(l, /^\s+raise\s*$/m) ? null : 'Re-raise with a bare raise.'),
          hints: ['def check(n):\n    try:\n        return 10 // n\n    except ZeroDivisionError:\n        print("zero given")\n        raise', 'try:\n    check(0)\nexcept ZeroDivisionError:\n    print("caught again")'],
          solution: ['def check(n):', '    try:', '        return 10 // n', '    except ZeroDivisionError:', '        print("zero given")', '        raise', 'try:', '    check(0)', 'except ZeroDivisionError:', '    print("caught again")'],
        },
      ],
      learn: [{ title: 'Re-raising', code: 'except KeyError:\n    log("missing")\n    raise', text: 'A bare raise passes the same error on. Handle errors where you can act on them.' }],
    },
    {
      id: '45-7', title: 'Ask forgiveness, not too much', bg: 'library', npc: 'justicar', mentor: 'justicar', tags: ['eafp'],
      steps: [
        { type: 'talk', who: 'justicar', text: 'Python style favours EAFP, "easier to ask forgiveness than permission": just try it and catch the failure, instead of LBYL, "look before you leap", checking every condition first. EAFP avoids races and double work.' },
        { type: 'talk', who: 'justicar', text: 'But catch NARROWLY. A bare except: or except Exception: also swallows your own bugs, like a misspelled name, and the program limps on silently wrong. Keep the try block small and name the error you expect. Use else for the code that should run only on success.' },
        { type: 'demo', text: 'Two styles. Run it.', code: ['stock = {"rope": 3}', '# look before you leap', 'if "lamp" in stock:', '    print(stock["lamp"])', 'else:', '    print("LBYL: none")', '# easier to ask forgiveness', 'try:', '    print(stock["lamp"])', 'except KeyError:', '    print("EAFP: none")'] },
        {
          type: 'predict', text: 'A bare except hides a typo. What will it say?', code: ['def total(prices):', '    try:', '        return sum(prices) * taxx', '    except:', '        return 0', 'tax = 2', 'print(total([1, 2, 3]))'],
          explain: 'taxx is a typo: the NameError is swallowed and you silently get 0!',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Catch only what you expect, and the bug shows itself. Which error?', code: ['def total(prices):', '    try:', '        return sum(prices) * taxx', '    except TypeError:', '        return 0', 'tax = 2', 'print(total([1, 2, 3]))'],
          explain: 'Only TypeError is handled, so the typo surfaces: NameError.',
        },
        {
          type: 'predict', vars: R => ({ s: R.pick(['"8"', '"eight"']) }), text: 'try / except / else. What will it say?', code: ['text = $s', 'try:', '    n = int(text)', 'except ValueError:', '    print("not a number")', 'else:', '    print("double is", n * 2)', 'print("done")'],
          explain: 'else runs only when the try block raised nothing.',
        },
        {
          type: 'predict', text: 'Keep the try block small. What will it say?', code: ['data = {"a": "1", "b": "x"}', 'for key in ["a", "b", "c"]:', '    try:', '        raw = data[key]', '    except KeyError:', '        print(key, "missing")', '        continue', '    try:', '        print(key, int(raw))', '    except ValueError:', '        print(key, "not a number")'],
          explain: 'Two small trys tell you exactly which step failed for each key.',
        },
        {
          type: 'fill', text: 'Name the one error you expect.',
          lines: ['ages = {"pip": 30}', 'for name in ["pip", "rook"]:', '    try:', '        print(name, ages[name])', '    except []:', '        print(name, "unknown")'], chips: ['KeyError', 'IndexError', 'ValueError'], answer: [['KeyError']],
          hints: ['A missing dict key.', 'except KeyError:'],
        },
        {
          type: 'write', text: 'EAFP style: for each text in ["4", "x", "6"], try n = int(text); on ValueError print "skip", text; in else print n * n.',
          starter: [], keys: ['for', 'text', 'in', '["4", "x", "6"]', ':', 'try', 'n', '=', 'int', '(', ')', 'except', 'ValueError', 'print', '"skip"', ',', 'else', '*'],
          require: l => (has(l, /^\s+else:/m) && has(l, /except ValueError/) ? null : 'Use except ValueError and an else block.'),
          hints: ['for text in ["4", "x", "6"]:\n    try:\n        n = int(text)\n    except ValueError:\n        print("skip", text)', '    else:\n        print(n * n)'],
          solution: ['for text in ["4", "x", "6"]:', '    try:', '        n = int(text)', '    except ValueError:', '        print("skip", text)', '    else:', '        print(n * n)'],
        },
      ],
      learn: [{ title: 'EAFP, narrowly', code: 'try:\n    value = d[key]\nexcept KeyError:\n    ...\nelse:\n    use(value)', text: 'Try it and catch the specific failure. Never a bare except.' }],
    },
    {
      id: '45-8', title: 'Chain wraiths', bg: 'archive', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'chainwraith', hp: d0 + 18, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Chain wraiths rattle in the archive! $HP HP. Follow each chain back to its cause.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Strike with the number stored in the original error, found through __cause__.',
          lines: ['class Rattle(Exception):', '    pass', 'try:', '    try:', '        raise ValueError(18)', '    except ValueError as e:', '        raise Rattle("chains") from e', 'except Rattle as r:', '    cast(fireball, r.[].args[0])'], chips: ['__cause__', '__name__', 'args'], answer: [['__cause__']],
          goal: { foeDown: true },
          hints: ['The direct cause of the error.', 'r.__cause__.args[0]'],
        },
        { type: 'talk', who: 'narrator', text: 'The wraith king swings its longest chain!' },
        {
          type: 'write', vars: R => ({ n: R.int(5, 9) }),
          spawn: v => ({ kind: 'chainwraith', hp: v.n * 2, tint: 'big' }),
          text: 'It has $n × 2 HP. Write shatter() that raises KeyError, catches it, and re-raises with a bare raise. In the main code call shatter() inside a try and, in except KeyError, cast icebolt with $n twice.',
          starter: [], keys: ['def', 'shatter', '(', ')', ':', 'try', 'raise', 'KeyError', 'except', 'cast', 'icebolt', ',', '$n'],
          goal: { foeDown: true },
          require: l => (has(l, /^\s+raise\s*$/m) ? null : 'Re-raise with a bare raise inside shatter.'),
          hints: ['def shatter():\n    try:\n        raise KeyError\n    except KeyError:\n        raise', 'try:\n    shatter()\nexcept KeyError:\n    cast(icebolt, $n)\n    cast(icebolt, $n)'],
          solution: ['def shatter():', '    try:', '        raise KeyError', '    except KeyError:', '        raise', 'try:', '    shatter()', 'except KeyError:', '    cast(icebolt, $n)', '    cast(icebolt, $n)'],
        },
      ],
      learn: [{ title: 'Chains in battle', code: 'r.__cause__.args[0]', text: 'The cause keeps the original evidence.' }],
    },
    {
      id: '45-9', title: 'The High Judge', bg: 'throne', foe: { kind: 'highjudge', hp: 200, weak: 'icebolt', resist: 'spark' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'highjudge', text: 'EVERY FAILURE IN THIS COURT HAS A NAME, A FAMILY, AND A CAUSE. CAN YOU NAME THEM ALL?' },
        { type: 'talk', who: 'narrator', text: 'The High Judge has 200 HP. Icebolt chills the bench: double damage. Spark: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Icebolt is doubled.', code: [...COURT, 'try:', '    raise Contempt("noise")', 'except Perjury:', '    cast(icebolt, 3)', 'except CourtError:', '    cast(icebolt, 9)'],
          explain: 'Contempt is not Perjury, but it is a CourtError: 9, doubled.',
        },
        {
          type: 'fix', text: 'It should print perjury! and strike, but the specific clause never runs. Run it, then tap the broken line.',
          goal: { output: 'auto' },
          code: [...COURT, 'try:', '    raise Perjury("lied")', 'except Exception:', '    print("generic error")', 'except Perjury:', '    print("perjury!")', '    cast(icebolt, 8)'], bad: 8,
          options: ['except Contempt:', 'except CourtError:', 'except BaseException:'], answer: 0,
          explain: 'except Exception caught Perjury before its own clause. Narrowed to Contempt, Perjury reaches except Perjury. (Rule: specific clauses go first.)',
        },
        { type: 'talk', who: 'highjudge', text: 'THEN EXPLAIN THIS EVIDENCE!' },
        {
          type: 'fill', text: 'Read the evidence the error carries.',
          lines: ['class Evidence(Exception):', '    def __init__(self, weight):', '        super().__init__("exhibit A")', '        self.weight = weight', 'try:', '    raise Evidence(6)', 'except Evidence as e:', '    cast(icebolt, e.[])'], chips: ['weight', 'args', 'Evidence'], answer: [['weight']],
          hints: ['The attribute set in __init__.', 'e.weight'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Define class Verdict(Exception) whose __init__(self, power) stores self.power (and calls super().__init__("final")). Raise Verdict($HP // 2 + 1), catch it, and cast icebolt with e.power.',
          starter: [], keys: ['class', 'Verdict', '(', ')', ':', 'Exception', 'def', '__init__', 'self', 'power', ',', 'super().__init__', '"final"', 'self.power', '=', 'try', 'raise', '$HP', '//', '2', '+', '1', 'except', 'as', 'e', 'cast', 'icebolt', 'e.power'],
          goal: { foeDown: true },
          require: l => (has(l, /class Verdict\(Exception\)/) && has(l, /except Verdict/) ? null : 'Define Verdict(Exception) and catch it by name.'),
          hints: ['class Verdict(Exception):\n    def __init__(self, power):\n        super().__init__("final")\n        self.power = power', 'try:\n    raise Verdict($HP // 2 + 1)\nexcept Verdict as e:\n    cast(icebolt, e.power)'],
          solution: ['class Verdict(Exception):', '    def __init__(self, power):', '        super().__init__("final")', '        self.power = power', 'try:', '    raise Verdict($HP // 2 + 1)', 'except Verdict as e:', '    cast(icebolt, e.power)'],
        },
        { type: 'talk', who: 'highjudge', text: '...case... closed... the court rules in your favour...' },
      ],
      learn: [{ title: 'Exception toolkit', code: 'class MyError(Exception)   hierarchies   super().__init__(msg)   raise ... from e   raise', text: 'Everything from the Court of Exceptions.' }],
    },
  ],
};
WORLDS.push(WORLD45);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    excclass: () => makeQ(['class Oops(Exception):', '    pass', 'try:', `    raise Oops("${pick(['ink', 'wax', 'seal'])}")`, 'except Oops as e:', '    print(type(e).__name__, e)'], ['Exception Oops', 'Oops', 'NameError']),
    exchier: () => { const first = pick(['Base', 'Child']); return makeQ(['class Base(Exception):', '    pass', 'class Child(Base):', '    pass', 'try:', '    raise Child()', `except ${first}:`, `    print("${first.toLowerCase()}")`, `except ${first === 'Base' ? 'Child' : 'Base'}:`, `    print("${first === 'Base' ? 'child' : 'base'}")`], [first === 'Base' ? 'child' : 'base', 'Child', 'TypeError']); },
    excdata: () => { const n = rnd(2, 9); return makeQ(['class E(Exception):', '    def __init__(self, n):', '        super().__init__(f"n={n}")', '        self.n = n', 'try:', `    raise E(${n})`, 'except E as e:', '    print(e, e.n * 2)'], [`${n} ${n * 2}`, `n=${n} ${n}`, 'E']); },
    raisefrom: () => pick([
      () => makeQ(['try:', '    try:', '        {}["k"]', '    except KeyError as e:', '        raise ValueError("v") from e', 'except ValueError as v:', '    print(type(v.__cause__).__name__)'], ['ValueError', 'None', 'Exception']),
      () => makeQ(['try:', '    try:', '        {}["k"]', '    except KeyError:', '        raise ValueError("v") from None', 'except ValueError as v:', '    print(v.__cause__)'], ['KeyError', "'k'", 'v']),
    ])(),
    reraise: () => makeQ(['def f():', '    try:', '        1 / 0', '    except ZeroDivisionError:', '        print("log")', '        raise', 'try:', '    f()', 'except ZeroDivisionError:', '    print("up")'], ['log', 'up', 'log\nNone']),
    eafp: () => makeQ(['try:', '    x = undefined_name', 'except:', '    x = 0', 'print(x)'], ['NameError', 'None', 'undefined_name']),
  });
})();
