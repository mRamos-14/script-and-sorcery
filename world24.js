/* World 24: The Builder's Yard. Data structures built from lists and classes: stacks
   (last in, first out), bracket matching, queues (first in, first out), a Stack class,
   linked lists made of Node objects, walking and growing a chain.
   Sources: our own, MIT 6.0002 ideas. (collections.deque comes later, in World 46.) */
Object.assign(EXTRA.npcs, {
  wright: { name: 'Yardwright Bex', colors: ['#c8742a', '#5a3a24', '#ecb98d'] },
});
Object.assign(EXTRA.foes, {
  cratemimic: { base: 'mimic', name: 'Crate mimic', pal: { B: '#a8711a', Y: '#d9c79a' } },
  chainbot: { base: 'gearbot', name: 'Chain bot', pal: { S: '#6a6a7a', Y: '#ff7a2b' } },
  cranegolem: { base: 'colossus', name: 'The Crane Golem', pal: { S: '#c8742a', G: '#ffd75f' } },
});

const WORLD24 = {
  id: 24, name: "The Builder's Yard", topic: 'stacks, queues and linked lists',
  nodes: [[50, 92], [28, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [40, 21], [52, 8]],
  levels: [
    {
      id: '24-1', title: 'Stacks of crates', bg: 'foundry', npc: 'wright', mentor: 'wright', tags: ['stack'],
      steps: [
        { type: 'talk', who: 'wright', text: "Hard hats on, {NAME}! I'm Bex, and in my yard we build the shapes data lives in. First: the STACK. Like a pile of crates, you only ever touch the TOP. Last in, first out." },
        { type: 'talk', who: 'wright', text: 'A Python list is a perfect stack: append() puts a crate on top, pop() takes the top one off, and stack[-1] peeks at the top without removing it.' },
        { type: 'demo', text: 'Run it.', code: ['stack = []', 'stack.append("rope")', 'stack.append("lamp")', 'stack.append("axe")', 'print(stack.pop())', 'print(stack[-1])', 'print(stack)'] },
        {
          type: 'predict', vars: R => ({ a: R.sample(['rope', 'lamp', 'axe', 'map', 'salt'], 3) }),
          text: 'What will it say?', code: ['s = []', 'for item in $(JSON.stringify(a)):', '    s.append(item)', 'print(s.pop(), s.pop())'],
          explain: 'The last crate in is the first out: $(a[2]), then $(a[1]).',
        },
        {
          type: 'predict', text: 'Pushes and pops mixed. What will it say?', code: ['s = []', 's.append(1)', 's.append(2)', 's.pop()', 's.append(3)', 's.append(4)', 's.pop()', 'print(s)'],
          explain: 'Follow it crate by crate: [1] → [1, 2] → [1] → [1, 3] → [1, 3, 4] → [1, 3].',
        },
        {
          type: 'predict', measure: 'errtype', text: 'Popping an empty stack. Which error?', code: ['s = []', 's.pop()'],
          explain: 'There is nothing to take: IndexError (pop from empty list). Check "if s:" first.',
        },
        {
          type: 'fill', vars: R => ({ w: R.pick(['stone', 'quill', 'brick']) }),
          text: 'Reverse a word with a stack: push every letter, then pop them all.',
          lines: ['s = list()', 'for ch in "$w":', '    s.append(ch)', 'out = ""', 'while s:', '    out += s.[]()', 'print(out)'], chips: ['pop', 'append', 'copy'], answer: [['pop']],
          hints: ['Take from the top each time.', 's.pop()'],
        },
        {
          type: 'write', text: 'Undo history: push "type a", "type b", "delete" onto actions; then undo twice (pop twice, printing each), and print what is left.',
          starter: ['actions = []'], keys: ['actions', '.append', '(', ')', '"type a"', '"type b"', '"delete"', 'print', '.pop()'],
          require: l => ((typed(l).match(/\.pop\(\)/g) || []).length >= 2 ? null : 'Pop twice to undo twice.'),
          hints: ['Three appends, then print(actions.pop()) twice.', 'Finally print(actions).'],
          solution: ['actions.append("type a")', 'actions.append("type b")', 'actions.append("delete")', 'print(actions.pop())', 'print(actions.pop())', 'print(actions)'],
        },
      ],
      learn: [{ title: 'Stacks', code: 's.append(x)   # push\ns.pop()       # take the top\ns[-1]         # peek', text: 'Last in, first out. Undo buttons and the call stack work this way.' }],
    },
    {
      id: '24-2', title: 'Matching brackets', bg: 'foundry', npc: 'wright', mentor: 'wright', tags: ['brackets'],
      steps: [
        { type: 'talk', who: 'wright', text: 'Stacks solve a classic puzzle: are the brackets balanced? Push every opener. At every closer, the top of the stack must be its partner. At the end, the stack must be empty.' },
        { type: 'demo', text: 'Run it.', code: ['def balanced(text):', '    pairs = {")": "(", "]": "[", "}": "{"}', '    stack = []', '    for ch in text:', '        if ch in "([{":', '            stack.append(ch)', '        elif ch in pairs:', '            if not stack or stack.pop() != pairs[ch]:', '                return False', '    return not stack', 'print(balanced("(a[b]{c})"), balanced("(]"), balanced("(("))'] },
        {
          type: 'predict', vars: R => ({ t: R.pick(['([])', '([)]', '{[()()]}', '((())', '())']) }),
          text: 'What will it say?', code: ['def balanced(text):', '    pairs = {")": "(", "]": "[", "}": "{"}', '    stack = []', '    for ch in text:', '        if ch in "([{":', '            stack.append(ch)', '        elif ch in pairs:', '            if not stack or stack.pop() != pairs[ch]:', '                return False', '    return not stack', 'print(balanced("$t"))'],
          explain: 'Every closer must match the most recent unclosed opener, and nothing may be left open.',
        },
        {
          type: 'predict', vars: R => ({ t: R.pick(['((x)(y))', '(((a)))', '()()()']) }),
          text: 'How deep do the brackets go? What will it say?', code: ['depth = deepest = 0', 'for ch in "$t":', '    if ch == "(":', '        depth += 1', '        deepest = max(deepest, depth)', '    elif ch == ")":', '        depth -= 1', 'print(deepest)'],
          explain: 'The stack height at its tallest is the nesting depth.',
        },
        {
          type: 'fill', text: 'A closer must match the opener on TOP of the stack.',
          lines: ['def ok(text):', '    stack = list()', '    for ch in text:', '        if ch == "(":', '            stack.append(ch)', '        elif ch == ")":', '            if not stack:', '                return False', '            stack.[]()', '    return not stack', 'print(ok("(()())"), ok("())("))'], chips: ['pop', 'append', 'clear'], answer: [['pop']],
          hints: ['Remove the matching opener.', 'stack.pop()'],
        },
        {
          type: 'write', vars: R => ({ t: R.pick(['(()', '(())', ')(', '(()())']) }),
          text: 'Print True if the round brackets in text are balanced, using a counter (add 1 for "(", subtract 1 for ")", fail if it ever goes below 0, and it must end at 0).',
          starter: ['text = "$t"'], keys: ['count', '=', '0', 'good', 'True', 'False', 'for', 'ch', 'in', 'text', ':', 'if', '==', '"("', '")"', '+=', '-=', '1', 'elif', '<', 'and', 'print'],
          require: l => (has(l, /for\s+ch\s+in\s+text/) ? null : 'Walk through the text with a for loop.'),
          hints: ['count = 0 / good = True / for ch in text: ...', 'if count < 0: good = False; at the end print(good and count == 0)'],
          solution: ['count = 0', 'good = True', 'for ch in text:', '    if ch == "(":', '        count += 1', '    elif ch == ")":', '        count -= 1', '        if count < 0:', '            good = False', 'print(good and count == 0)'],
        },
      ],
      learn: [{ title: 'Bracket matching', code: 'push openers\nat a closer: pop and compare\nend: stack empty?', text: 'Stacks remember what is still open, most recent first.' }],
    },
    {
      id: '24-3', title: 'Queues at the gate', bg: 'village', npc: 'wright', mentor: 'wright', tags: ['queue'],
      steps: [
        { type: 'talk', who: 'wright', text: 'A QUEUE is the opposite of a stack: first in, first out, like people at a gate. Add at the back with append(), serve from the front with pop(0).' },
        { type: 'talk', who: 'wright', text: 'A small secret: pop(0) on a long list is slow, O(n), because every item shuffles forward. For big queues Python has collections.deque, which you will meet in the Collector\'s Hoard.' },
        { type: 'demo', text: 'Run it.', code: ['queue = []', 'queue.append("Ada")', 'queue.append("Wren")', 'queue.append("Tam")', 'print(queue.pop(0), "is served")', 'print(queue)'] },
        {
          type: 'predict', vars: R => ({ a: R.sample(['Ada', 'Wren', 'Tam', 'Mira', 'Kip'], 3) }),
          text: 'What will it say?', code: ['q = []', 'for name in $(JSON.stringify(a)):', '    q.append(name)', 'print(q.pop(0), q.pop(0))'],
          explain: 'First in, first out: $(a[0]), then $(a[1]).',
        },
        {
          type: 'predict', text: 'Taking turns. What will it say?', code: ['q = ["Ada", "Wren", "Tam"]', 'for turn in range(4):', '    p = q.pop(0)', '    print(p)', '    q.append(p)'],
          explain: 'Each player takes a turn and goes to the back of the queue.',
        },
        {
          type: 'fill', text: 'Serve customers in the order they arrived.',
          lines: ['q = ["Ada", "Wren", "Tam"]', 'while q:', '    print("serving", q.pop([]))'], chips: ['0', '-1', '1'], answer: [['0']],
          hints: ['The front of the queue is index 0.', 'q.pop(0)'],
        },
        {
          type: 'write', vars: R => ({ k: R.int(2, 3) }),
          text: 'Hot potato: players pass the potato $k times (pop from the front, append to the back), then the player at the front is out. Repeat until one player is left, and print the winner.',
          starter: ['q = ["Ada", "Wren", "Tam", "Mira", "Kip"]'], keys: ['while', 'len', '(', ')', 'q', '>', '1', ':', 'for', 'i', 'in', 'range', '$k', '.append', '.pop', '0', 'print', '[', ']'],
          require: l => (has(l, /\.pop\s*\(\s*0\s*\)/) ? null : 'Use q.pop(0) to take from the front.'),
          hints: ['while len(q) > 1: / for i in range($k): q.append(q.pop(0))', 'q.pop(0)  (the player who is out), then print(q[0])'],
          solution: ['while len(q) > 1:', '    for i in range($k):', '        q.append(q.pop(0))', '    q.pop(0)', 'print(q[0])'],
        },
      ],
      learn: [{ title: 'Queues', code: 'q.append(x)   # join the back\nq.pop(0)      # serve the front', text: 'First in, first out. (deque makes this fast for big queues.)' }],
    },
    {
      id: '24-4', title: 'Crate mimics', bg: 'foundry', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), p = [R.int(3, 7), R.int(3, 7), R.int(3, 7)]; return { kind: 'cratemimic', hp: d + p[0] + p[1] + p[2], d, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Crate mimics! $HP HP. Your spell crates are stacked: use them from the top down.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p }),
          text: 'It has $HP HP left. Pop every crate off the stack and cast fireball with it.',
          lines: ['crates = $(JSON.stringify(p))', 'while crates:', '    cast(fireball, crates.[]())'], chips: ['pop', 'copy', 'clear'], answer: [['pop']],
          goal: { foeDown: true },
          hints: ['Take crates off the top.', 'crates.pop()'],
        },
        { type: 'talk', who: 'narrator', text: 'The mimic queen waits in line for her turn!' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9); return { p, hp: 3 * p }; },
          spawn: v => ({ kind: 'cratemimic', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Three icebolts of $p wait in a queue. Serve them from the front, casting each.',
          starter: ['q = [$p, $p, $p]'], keys: ['while', 'q', ':', 'cast', 'icebolt', '(', ')', ',', '.pop', '0'],
          goal: { foeDown: true },
          require: l => (has(l, /\.pop\s*\(\s*0\s*\)/) ? null : 'Serve from the front with q.pop(0).'),
          hints: ['while q:', '    cast(icebolt, q.pop(0))'],
          solution: ['while q:', '    cast(icebolt, q.pop(0))'],
        },
      ],
      learn: [{ title: 'Stacks and queues in battle', code: 'pop()   pop(0)', text: 'Same list, two ways to take from it.' }],
    },
    {
      id: '24-5', title: 'A stack you can trust', bg: 'forge', npc: 'wright', mentor: 'wright', tags: ['stackclass'],
      steps: [
        { type: 'talk', who: 'wright', text: 'A list lets anyone poke into the middle of your stack. Wrap it in a CLASS and only offer the stack moves: push, pop, peek, is_empty and len.' },
        { type: 'demo', text: 'Run it.', code: ['class Stack:', '    def __init__(self):', '        self.items = []', '    def push(self, x):', '        self.items.append(x)', '    def pop(self):', '        return self.items.pop()', '    def peek(self):', '        return self.items[-1]', '    def is_empty(self):', '        return not self.items', '    def __len__(self):', '        return len(self.items)', 's = Stack()', 's.push("a"); s.push("b")', 'print(s.peek(), len(s), s.is_empty())'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9), b: R.int(10, 19), c: R.int(20, 29) }),
          text: 'What will it say?', code: ['class Stack:', '    def __init__(self):', '        self.items = []', '    def push(self, x):', '        self.items.append(x)', '    def pop(self):', '        return self.items.pop()', '    def __len__(self):', '        return len(self.items)', 's = Stack()', 's.push($a)', 's.push($b)', 's.push($c)', 's.pop()', 'print(s.pop(), len(s))'],
          explain: '$c is popped first, then $b. One item, $a, remains.',
        },
        {
          type: 'fill', text: 'peek looks at the top WITHOUT removing it.',
          lines: ['class Stack:', '    def __init__(self):', '        self.items = list()', '    def push(self, x):', '        self.items.append(x)', '    def peek(self):', '        return self.items[[]]', 's = Stack()', 's.push("rope"); s.push("lamp")', 'print(s.peek(), s.peek())'], chips: ['-1', '0', '1'], answer: [['-1']],
          hints: ['The top is the last item.', 'self.items[-1]'],
        },
        {
          type: 'fix', text: 'pop should hand back the item it removes. Run it, then tap the broken line.',
          code: ['class Stack:', '    def __init__(self):', '        self.items = []', '    def push(self, x):', '        self.items.append(x)', '    def pop(self):', '        self.items.pop()', 's = Stack()', 's.push("gem")', 'print(s.pop())'], bad: 6,
          options: ['        return self.items.pop()', '        return self.items', '        self.items.pop(0)'], answer: 0,
          explain: 'Without return, the method hands back None.',
        },
        {
          type: 'write', text: 'Write class Queue with __init__ (an empty list), enqueue(x) (append), dequeue() (return pop(0)) and __len__. Enqueue "Ada" then "Wren", print dequeue() and len(q).',
          starter: [], keys: ['class', 'Queue', ':', 'def', '__init__', '(self)', 'self.items', '=', '[]', 'enqueue', '(self, x)', '.append', 'x', 'dequeue', 'return', '.pop(0)', '__len__', 'len', 'q', 'Queue()', 'print', '"Ada"', '"Wren"', '(', ')', ','],
          require: l => (has(l, /class\s+Queue/) && has(l, /def\s+dequeue/) ? null : 'Write class Queue with enqueue and dequeue.'),
          hints: ['class Queue: / def __init__(self): self.items = [] / def enqueue(self, x): self.items.append(x)', 'def dequeue(self): return self.items.pop(0) / def __len__(self): return len(self.items)'],
          solution: ['class Queue:', '    def __init__(self):', '        self.items = []', '    def enqueue(self, x):', '        self.items.append(x)', '    def dequeue(self):', '        return self.items.pop(0)', '    def __len__(self):', '        return len(self.items)', 'q = Queue()', 'q.enqueue("Ada")', 'q.enqueue("Wren")', 'print(q.dequeue(), len(q))'],
        },
      ],
      learn: [{ title: 'Wrapping a structure', code: 'class Stack:\n    def push(self, x): ...\n    def pop(self): ...', text: 'A class offers only the moves that make sense, hiding the list inside.' }],
    },
    {
      id: '24-6', title: 'Linked chains', bg: 'forge', npc: 'wright', mentor: 'wright', tags: ['linked'],
      steps: [
        { type: 'talk', who: 'wright', text: 'A LINKED LIST is a chain of little boxes called nodes. Each node holds a value and a link, .next, to the following node. The last one links to None.' },
        { type: 'demo', text: 'Run it.', code: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'chain = Node("a", Node("b", Node("c")))', 'node = chain', 'while node:', '    print(node.value)', '    node = node.next'] },
        {
          type: 'predict', vars: R => ({ a: R.int(1, 9), b: R.int(10, 19), c: R.int(20, 29) }),
          text: 'What will it say?', code: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'head = Node($a, Node($b, Node($c)))', 'print(head.next.value, head.next.next.next)'],
          explain: 'head.next is the $b node. Three steps along you fall off the end: None.',
        },
        {
          type: 'predict', vars: R => ({ n: R.int(3, 6) }),
          text: 'Counting the chain. What will it say?', code: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'head = None', 'for v in range($n):', '    head = Node(v, head)', 'count, node = 0, head', 'while node:', '    count += 1', '    node = node.next', 'print(count, head.value)'],
          explain: 'Each new node goes in FRONT of the old head, so the newest value, $(n - 1), is first.',
        },
        {
          type: 'fill', text: 'Walk the chain: move to the next node each time.',
          lines: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'node = Node(1, Node(2, Node(3)))', 'total = 0', 'while node:', '    total += node.value', '    node = node.[]', 'print(total)'], chips: ['next', 'value', 'head'], answer: [['next']],
          hints: ['Follow the link.', 'node = node.next'],
        },
        {
          type: 'write', text: 'Using this Node class, print the values of chain joined by " -> ".',
          starter: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'chain = Node("rope", Node("lamp", Node("map")))'], keys: ['parts', '=', '[]', 'node', 'chain', 'while', ':', '.append', '.value', '.next', 'print', '" -> ".join', '(', ')'],
          require: l => (has(l, /while\s+node/) ? null : 'Walk the chain with while node:.'),
          hints: ['parts = [] / node = chain / while node: parts.append(node.value); node = node.next', 'print(" -> ".join(parts))'],
          solution: ['parts = []', 'node = chain', 'while node:', '    parts.append(node.value)', '    node = node.next', 'print(" -> ".join(parts))'],
        },
      ],
      learn: [{ title: 'Linked lists', code: 'class Node:\n    value, next\nwhile node:\n    node = node.next', text: 'A chain of nodes, each pointing to the next. Walk it until you reach None.' }],
    },
    {
      id: '24-7', title: 'Growing the chain', bg: 'foundry', npc: 'wright', mentor: 'wright', tags: ['linkedops'],
      steps: [
        { type: 'talk', who: 'wright', text: 'Why chains? Adding at the FRONT is instant, O(1): the new node just points at the old head. Adding at the END means walking the whole chain, O(n), unless you also keep a tail.' },
        { type: 'demo', text: 'Run it.', code: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'class Chain:', '    def __init__(self):', '        self.head = None', '    def push_front(self, v):', '        self.head = Node(v, self.head)', '    def append(self, v):', '        if not self.head:', '            self.head = Node(v)', '            return', '        node = self.head', '        while node.next:', '            node = node.next', '        node.next = Node(v)', '    def to_list(self):', '        out, node = [], self.head', '        while node:', '            out.append(node.value)', '            node = node.next', '        return out', 'c = Chain()', 'c.append(2); c.append(3); c.push_front(1)', 'print(c.to_list())'] },
        {
          type: 'predict', text: 'Removing the front node. What will it say?', code: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'head = Node("a", Node("b", Node("c")))', 'head = head.next', 'node, out = head, []', 'while node:', '    out.append(node.value)', '    node = node.next', 'print(out)'],
          explain: 'Pointing head at the second node drops the first one from the chain.',
        },
        {
          type: 'predict', vars: R => ({ t: R.pick(['b', 'c', 'z']) }),
          text: 'Searching the chain. What will it say?', code: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'def find(head, target):', '    steps, node = 0, head', '    while node:', '        steps += 1', '        if node.value == target:', '            return steps', '        node = node.next', '    return -1', 'print(find(Node("a", Node("b", Node("c"))), "$t"))'],
          explain: 'Searching a chain means walking it from the head: O(n).',
        },
        {
          type: 'fill', text: 'Walk to the LAST node (the one whose next is None) before attaching.',
          lines: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'head = Node(1, Node(2))', 'node = head', 'while node.[]:', '    node = node.next', 'node.next = Node(3)', 'print(head.next.next.value)'], chips: ['next', 'value', 'head'], answer: [['next']],
          hints: ['Stop when there is no next node.', 'while node.next:'],
        },
        {
          type: 'write', text: 'Write length(head) that RETURNS the number of nodes in a chain, then print length(chain).',
          starter: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'chain = Node(4, Node(8, Node(15, Node(16))))'], keys: ['def', 'length', '(', ')', 'head', ':', 'count', '=', '0', 'node', 'while', '+=', '1', '.next', 'return', 'print', 'chain'],
          require: l => (has(l, /def\s+length/) && has(l, /\.next/) ? null : 'Walk the chain inside length(head).'),
          hints: ['count, node = 0, head / while node: count += 1; node = node.next', 'return count, then print(length(chain))'],
          solution: ['def length(head):', '    count, node = 0, head', '    while node:', '        count += 1', '        node = node.next', '    return count', 'print(length(chain))'],
        },
      ],
      learn: [{ title: 'Chain operations', code: 'front: head = Node(v, head)   O(1)\nend:   walk to the last node  O(n)', text: 'Linked lists are fast at the front, slow to search.' }],
    },
    {
      id: '24-8', title: 'Chain bots', bg: 'gearworks', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8), p = [R.int(3, 7), R.int(3, 7), R.int(3, 7)]; return { kind: 'chainbot', hp: d + p[0] + p[1] + p[2], d, p }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Chain bots rattle in! $HP HP. Walk the chain of power nodes and strike with each.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', vars: (R, c) => ({ p: c.foe.p }),
          text: 'It has $HP HP left. Walk the chain, casting fireball with every node value.',
          lines: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'node = Node($(p[0]), Node($(p[1]), Node($(p[2]))))', 'while node:', '    cast(fireball, node.value)', '    node = []'], chips: ['node.next', 'node.value', 'None'], answer: [['node.next']],
          goal: { foeDown: true },
          hints: ['Move along the chain.', 'node = node.next'],
        },
        { type: 'talk', who: 'narrator', text: 'The master bot is guarded by a stack of shields!' },
        {
          type: 'write', vars: R => { const p = R.int(5, 9); return { p, hp: 2 * p }; },
          spawn: v => ({ kind: 'chainbot', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Using the Stack class, push $p twice, then pop and cast icebolt until the stack is empty.',
          starter: ['class Stack:', '    def __init__(self):', '        self.items = []', '    def push(self, x):', '        self.items.append(x)', '    def pop(self):', '        return self.items.pop()', '    def is_empty(self):', '        return not self.items', 's = Stack()'], keys: ['s.push', '(', ')', '$p', 'while', 'not', 's.is_empty()', ':', 'cast', 'icebolt', ',', 's.pop()'],
          goal: { foeDown: true },
          require: l => (has(l, /s\.push/) && has(l, /s\.pop\(\)/) ? null : 'Use s.push and s.pop().'),
          hints: ['s.push($p) twice', 'while not s.is_empty(): cast(icebolt, s.pop())'],
          solution: ['s.push($p)', 's.push($p)', 'while not s.is_empty():', '    cast(icebolt, s.pop())'],
        },
      ],
      learn: [{ title: 'Structures in battle', code: 'while node: ... node = node.next', text: 'Walking chains and draining stacks.' }],
    },
    {
      id: '24-9', title: 'The Crane Golem', bg: 'foundry', foe: { kind: 'cranegolem', hp: 170, weak: 'icebolt', resist: 'spark' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'cranegolem', text: 'LIFT... STACK... LIFT... STACK...' },
        { type: 'talk', who: 'narrator', text: 'The Crane Golem has 170 HP. Icebolt freezes its gears: double damage. Spark: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Icebolt is doubled.', code: ['s = [3, 9, 5]', 's.pop()', 's.append(7)', 'cast(icebolt, s.pop() + s.pop())'],
          explain: 'After the pop and push, the top two crates are 7 and 9: 16, doubled.',
        },
        {
          type: 'fix', text: 'The queue should serve Ada first. Run it, then tap the broken line.',
          code: ['q = []', 'for name in ["Ada", "Wren", "Tam"]:', '    q.append(name)', 'first = q.pop()', 'print(first)', 'cast(icebolt, len(first))'], bad: 3,
          options: ['first = q.pop(0)', 'first = q[-1]', 'first = q.pop(-1)'], answer: 0,
          explain: 'A queue serves from the FRONT: pop(0).',
        },
        { type: 'talk', who: 'cranegolem', text: 'MY... CHAIN... IS... LONG...' },
        {
          type: 'fill', text: 'Count the chain links and cast icebolt with 4 times the count.',
          lines: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'node = Node(1, Node(1, Node(1, Node(1))))', 'count = 0', 'while []:', '    count += 1', '    node = node.next', 'cast(icebolt, count * 4)'], chips: ['node', 'node.next', 'count'], answer: [['node']],
          hints: ['Keep going while there is a node.', 'while node:'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Push $HP // 2 + 1 onto a stack list, then cast icebolt with whatever you pop.',
          starter: ['stack = []'], keys: ['stack', '.append', '(', ')', '$HP', '//', '2', '+', '1', 'cast', 'icebolt', ',', '.pop()'],
          goal: { foeDown: true },
          require: l => (has(l, /\.pop\(\)/) ? null : 'Pop the power off the stack.'),
          hints: ['stack.append($HP // 2 + 1)', 'cast(icebolt, stack.pop())'],
          solution: ['stack.append($HP // 2 + 1)', 'cast(icebolt, stack.pop())'],
        },
        { type: 'talk', who: 'cranegolem', text: '...the... yard... is... quiet...' },
      ],
      learn: [{ title: 'Yard toolkit', code: 'stack: append/pop  queue: append/pop(0)  Node(value, next)', text: 'Everything from the Builder\'s Yard.' }],
    },
  ],
};
WORLDS.push(WORLD24);

(() => {
  const { makeQ, shuffle, rnd } = Arena;
  Object.assign(Arena.GEN, {
    stack: () => { const a = shuffle([1, 2, 3, 4]).slice(0, 3); return makeQ(['s = []', ...a.map(x => `s.append(${x})`), 'print(s.pop())'], [a[0], a[1]]); },
    brackets: () => makeQ(['d = 0', 'for c in "(()(()))":', '    if c == "(":', '        d += 1', '    else:', '        d -= 1', 'print(d)'], [8, 4]),
    queue: () => { const a = shuffle(['Ada', 'Wren', 'Tam']); return makeQ([`q = ${JSON.stringify(a)}`, 'q.append(q.pop(0))', 'print(q[0])'], [a[0], a[2]]); },
    stackclass: () => makeQ(['class S:', '    def __init__(self):', '        self.i = []', '    def push(self, x):', '        self.i.append(x)', 's = S()', 's.push(4); s.push(9)', 'print(s.i[-1], len(s.i))'], ['4 2', '9 1']),
    linked: () => { const n = rnd(2, 4); return makeQ(['class N:', '    def __init__(self, v, nx=None):', '        self.v, self.nx = v, nx', 'h = None', `for v in range(${n}):`, '    h = N(v, h)', 'print(h.v)'], [0, n]); },
    linkedops: () => makeQ(['class N:', '    def __init__(self, v, nx=None):', '        self.v, self.nx = v, nx', 'h = N(1, N(2, N(3)))', 'h = h.nx', 'print(h.v, h.nx.v)'], ['1 2', '3 None']),
  });
})();
