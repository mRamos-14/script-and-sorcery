# Script & Sorcery: the 51-world path

Every topic gets its own world. Sources: **CS50P** (Harvard), **Py4E** (Python for Everybody),
**MIT** 6.100L (and 6.0002 for some algorithms), **ATBS** (Automate the Boring Stuff), and **ours**
(extra worlds: gotchas, debugging, data structures, advanced Python).

Status: ✅ built · 🔨 being built (shown on the map, never blocks the path)

Each new world follows the same shape as the old ones: 8 lessons + a boss (about 9 levels),
review bosses (R) at the end of acts. Each lesson: talk → demo → predict / fill / fix / write,
with fresh values every play.

## Act I · First steps
| # | World | Topic | From | Status |
|---|---|---|---|---|
| 1 | Starter Village | print, variables, input | CS50P | ✅ |
| 2 | The Counting House | int and float, + - * /, //, %, **, precedence, round, abs, int()/float()/str(), float precision, math.floor/ceil | Py4E 2, MIT 1-2, CS50P 0 | ✅ |
| 3 | Whispering Library | string methods, f-strings | CS50P 0 | ✅ |
| 4 | The Scriptorium | indexing, negative indexes, slicing with steps, `in`, find/rfind, split/join, parsing a line (`From x@y.org Sat Jan 5`), strings are immutable | Py4E 6 | ✅ |
| 5 | Crossroads Forest | if/elif/else, and/or/not, match (+ R) | CS50P 1 | ✅ |
| 6 | Echo Caves | for, while, range, break/continue | CS50P 2, Py4E 5 | ✅ |

## Act II · Collections
| 7 | Merchant Town | lists | CS50P, Py4E 8 | ✅ |
| 8 | The Twin Isles | tuples, packing/unpacking, swapping, comparing tuples, sorting by value with tuples, enumerate, zip, returning many values | Py4E 10 | ✅ |
| 9 | Trading Port | dictionaries (+ R) | CS50P, Py4E 9 | ✅ |
| 10 | The Prism Gardens | sets: add/remove/discard, membership speed, union, intersection, difference, symmetric difference, subset, frozenset, set comprehensions | Py4E, ours | ✅ |

## Act III · Functions, errors and files
| 11 | Mage Tower | functions | CS50P, MIT | ✅ |
| 12 | The Hall of Echoes | scope (LEGB), local vs global, nonlocal, docstrings, pure functions vs side effects, functions as values, returning None | MIT 5-6 | 🔨 |
| 13 | Trap Dungeon | errors and try/except | CS50P | ✅ |
| 14 | The Ancient Archive | files, csv (+ R) | CS50P, Py4E 7 | ✅ |
| 15 | The Hall of Mirrors | mutable default args, aliasing vs copying (copy/deepcopy), is vs ==, float equality, shadowing built-ins, late binding, `+=` on lists, truthiness, chained comparisons, any/all, Pythonic loops | ours | 🔨 |

## Act IV · Thinking in algorithms
| 16 | The Spiral Depths | recursion: base case, call stack, factorial, fibonacci, sum of list, palindromes, Towers of Hanoi, recursion vs loops, RecursionError | MIT | 🔨 |
| 17 | The Guessing Halls | guess-and-check, exhaustive enumeration, approximation, epsilon, bisection search, Newton-Raphson | MIT 3-4 | 🔨 |
| 18 | The Measuring Tower | counting steps, O(1)/O(log n)/O(n)/O(n log n)/O(n²), linear vs binary search, choosing data structures | MIT 21-23 | 🔨 |
| 19 | The Sorting Spire | selection, bubble, insertion, merge sort, stability, `sorted` vs `.sort` | MIT 23 | 🔨 |
| 20 | The Memory Vaults | memoization, dynamic programming, knapsack, coin change, grid paths (+ R) | MIT 6.0002 | 🔨 |

## Act V · Objects
| 21 | The Golem Forge | classes and objects | CS50P, MIT, Py4E 14 | ✅ |
| 22 | The Bloodline Keep | inheritance and dunders | CS50P, MIT | ✅ |
| 23 | The Clockwork Citadel | properties, classmethods, composition (+ R) | CS50P | ✅ |
| 24 | The Builder's Yard | stack, queue, linked list, building them with classes | ours, MIT 6.0002 | 🔨 |
| 25 | The Rootwood | trees, binary search trees, graphs, BFS, DFS, shortest path (+ R) | MIT 6.0002 | 🔨 |

## Act VI · Practical Python
| 26 | The Great Bazaar | libraries, pip, argparse | CS50P | ✅ |
| 27 | The Sundial Plaza | datetime, date, timedelta, strftime/strptime, comparing dates, time | ATBS 17 | 🔨 |
| 28 | The Labyrinth of Folders | pathlib, os.path, listing and walking folders, shutil copy/move | ATBS 9-10 | 🔨 |
| 29 | The Pattern Marsh | regular expressions | CS50P, Py4E 11, ATBS 7 | ✅ |
| 30 | The Copyist's Guild | text processing: parsing logs and mail, cleaning data, formatting reports, str.format specs | Py4E 11, ATBS 6 | 🔨 |
| 31 | The Watchtower | debugging: reading tracebacks, print debugging, assert, logging levels, rubber duck, binary search for bugs | ATBS 11, MIT, ours | 🔨 |
| 32 | The Proving Grounds | testing (+ R) | CS50P, MIT | ✅ |

## Act VII · Data and the web
| 33 | The Ledger Hall | CSV and JSON in depth: DictReader/Writer, json.load/dump, nested JSON | Py4E 13, ATBS 16 | 🔨 |
| 34 | The Root Library | XML with ElementTree: find, findall, attributes | Py4E 13 | 🔨 |
| 35 | The Vault of Records | sqlite3: CREATE, INSERT, SELECT, WHERE, ORDER BY, UPDATE, DELETE, ? parameters | Py4E 15 | 🔨 |
| 36 | The Web of Tables | keys, many tables, JOIN, many-to-many | Py4E 15 | 🔨 |
| 37 | The Sky Post | HTTP, urllib, APIs, JSON from the web | Py4E 12-13, CS50P 4 | 🔨 |
| 38 | The Spider's Lair | web scraping: HTML, BeautifulSoup, links (+ R) | Py4E 12, ATBS 12 | 🔨 |

## Act VIII · Advanced Python
| 39 | The Skyward Gardens | lambda, map, filter, sorting keys | CS50P | ✅ |
| 40 | The Shifting Sands | *args, **kwargs, type hints | CS50P | ✅ |
| 41 | The River of Time | iterators, generators, comprehensions (+ R) | CS50P | ✅ |
| 42 | The Nesting Woods | closures, factories, nonlocal state | ours | 🔨 |
| 43 | The Enchanter's Workshop | decorators, wraps, decorators with arguments | ours | 🔨 |
| 44 | The Sealed Chambers | context managers, __enter__/__exit__, contextlib | ours | 🔨 |
| 45 | The Court of Exceptions | custom exceptions, hierarchies, raise from | ours, CS50P | 🔨 |
| 46 | The Collector's Hoard | Counter, defaultdict, namedtuple, deque | ours | 🔨 |
| 47 | The Archetype Forge | dataclasses, Enum | ours | 🔨 |
| 48 | The Loom of Fate | itertools | ours | 🔨 |
| 49 | The Alchemist's Tools | functools: reduce, partial, lru_cache (+ R) | ours | 🔨 |

## Act IX · Mastery
| 50 | The Gauntlet | capstone projects: arithmetic formatter, budget app, text adventure, grade book | Py4E, fCC, ours | 🔨 |
| 51 | The Heart of Code | the final trial: everything | all | 🔨 |

## Build order
Path order, so the front of the journey fills first: 2, 4, 8, 10, 12, 15, 16-20, 24-25, 27-28, 30-31, 33-38, 42-51.
New interpreter features land with the world that needs them (copy, datetime, pathlib/os/shutil,
logging, xml, sqlite3, urllib, bs4, collections, dataclasses, enum, itertools, functools, contextlib).
