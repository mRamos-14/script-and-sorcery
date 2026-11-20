/* World 25: The Rootwood. Trees and graphs: tree nodes with children, counting and
   height by recursion, binary search trees (insert, search, min), traversals
   (in-order, pre-order, post-order), graphs as dicts of neighbour lists, breadth-first
   search (and shortest hops), depth-first search, connected parts, and the Act V review.
   Source: MIT 6.0002 (graphs, BFS/DFS) plus our own. */
Object.assign(EXTRA.npcs, {
  sylva: { name: 'Root-warden Sylva', colors: ['#4d7a2e', '#7a4424', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  barkling: { base: 'treant', name: 'Barkling', s: 3 },
  rootwurm: { base: 'wurm', name: 'Root wurm', pal: {} },
  worldtree: { base: 'treant', name: 'The World Tree', s: 5 },
  architect: { base: 'knight', name: 'The Grand Architect', s: 4, pal: { S: '#e2b34a', K: '#7d4fc9' } },
});
const BST_CODE = ['class Node:', '    def __init__(self, v):', '        self.v, self.left, self.right = v, None, None', 'def insert(root, v):', '    if root is None:', '        return Node(v)', '    if v < root.v:', '        root.left = insert(root.left, v)', '    else:', '        root.right = insert(root.right, v)', '    return root'];
const ROADS = ['roads = {', '    "Ash": ["Elm", "Oak"],', '    "Elm": ["Ash", "Fen"],', '    "Oak": ["Ash", "Fen"],', '    "Fen": ["Elm", "Oak", "Gil"],', '    "Gil": ["Fen"],', '}'];

const WORLD25 = {
  id: 25, name: 'The Rootwood', topic: 'trees and graphs',
  nodes: [[50, 93], [26, 84], [66, 75], [34, 66], [68, 57], [30, 48], [66, 39], [36, 29], [62, 19], [50, 7]],
  levels: [
    {
      id: '25-1', title: 'Branches and leaves', bg: 'forest', npc: 'sylva', mentor: 'sylva', tags: ['treebasics'],
      steps: [
        { type: 'talk', who: 'sylva', text: "Welcome to the Rootwood, {NAME}. I'm Sylva. A TREE in programming starts at one ROOT node, and every node can have children. Nodes with no children are LEAVES." },
        { type: 'talk', who: 'sylva', text: 'Trees are made for recursion: the size of a tree is 1 (this node) plus the sizes of all its children\'s trees.' },
        { type: 'demo', text: 'Run it.', code: ['class Tree:', '    def __init__(self, name, kids=None):', '        self.name = name', '        self.kids = kids or []', 'def size(t):', '    return 1 + sum(size(k) for k in t.kids)', 'oak = Tree("root", [Tree("a", [Tree("c")]), Tree("b")])', 'print(size(oak))'] },
        {
          type: 'predict', text: 'Count the leaves. What will it say?', code: ['class Tree:', '    def __init__(self, name, kids=None):', '        self.name = name', '        self.kids = kids or []', 'def leaves(t):', '    if not t.kids:', '        return 1', '    return sum(leaves(k) for k in t.kids)', 't = Tree("r", [Tree("a", [Tree("c"), Tree("d")]), Tree("b")])', 'print(leaves(t))'],
          explain: 'c, d and b have no children: three leaves.',
        },
        {
          type: 'predict', vars: R => ({ line: R.pick(['t = Tree("r", [Tree("a", [Tree("b", [Tree("c")])])])', 't = Tree("r", [Tree("a"), Tree("b"), Tree("c")])']) }),
          text: 'How tall is it? What will it say?', code: ['class Tree:', '    def __init__(self, name, kids=None):', '        self.name = name', '        self.kids = kids or []', 'def height(t):', '    if not t.kids:', '        return 1', '    return 1 + max(height(k) for k in t.kids)', '$line', 'print(height(t))'],
          explain: 'Height counts the nodes on the longest path from the root down.',
        },
        {
          type: 'fill', text: 'Print every name in the tree, parent before children.',
          lines: ['class Tree:', '    def __init__(self, name, kids=None):', '        self.name = name', '        self.kids = kids or list()', 'def show(t, depth=0):', '    print("  " * depth + t.name)', '    for k in t.kids:', '        show(k, depth [] 1)', 'show(Tree("root", [Tree("a", [Tree("c")]), Tree("b")]))'], chips: ['+', '-', '*'], answer: [['+']],
          hints: ['Children are one level deeper.', 'depth + 1'],
        },
        {
          type: 'write', text: 'Write total(t) that RETURNS the sum of all node values in the tree, then print total(t).',
          starter: ['class Tree:', '    def __init__(self, value, kids=None):', '        self.value = value', '        self.kids = kids or []', 't = Tree(5, [Tree(3, [Tree(1)]), Tree(8)])'], keys: ['def', 'total', '(', ')', 't', ':', 'return', '.value', '+', 'sum', 'k', 'for', 'in', '.kids', 'print'],
          require: l => (has(l, /def\s+total/) && has(l, /total\s*\(\s*k\s*\)/) ? null : 'Recurse into each child: total(k).'),
          hints: ['A node\'s total is its value plus its children\'s totals.', 'return t.value + sum(total(k) for k in t.kids)'],
          solution: ['def total(t):', '    return t.value + sum(total(k) for k in t.kids)', 'print(total(t))'],
        },
      ],
      learn: [{ title: 'Trees', code: 'size(t) = 1 + sum(size(k) for k in t.kids)', text: 'A root, children, and leaves. Recursion fits trees perfectly.' }],
    },
    {
      id: '25-2', title: 'Sorted roots', bg: 'grove', npc: 'sylva', mentor: 'sylva', tags: ['bst'],
      steps: [
        { type: 'talk', who: 'sylva', text: 'A BINARY SEARCH TREE gives each node at most two children, with a rule: everything in the LEFT subtree is smaller, everything in the RIGHT subtree is bigger (or equal). Searching it is like binary search.' },
        { type: 'demo', text: 'Build one and search it.', code: [...BST_CODE, 'def has(root, v):', '    if root is None:', '        return False', '    if v == root.v:', '        return True', '    return has(root.left, v) if v < root.v else has(root.right, v)', 'root = None', 'for v in [8, 3, 10, 1, 6]:', '    root = insert(root, v)', 'print(root.v, root.left.v, root.right.v, has(root, 6), has(root, 7))'] },
        {
          type: 'predict', vars: R => ({ a: R.pick([[5, 2, 8, 6], [5, 7, 3, 4], [5, 1, 9, 2]]) }),
          text: 'Where do the values land? What will it say?', code: [...BST_CODE, 'root = None', 'for v in $(JSON.stringify(a)):', '    root = insert(root, v)', 'left = root.left.v if root.left else None', 'right = root.right.v if root.right else None', 'print(root.v, left, right)'],
          explain: 'The first value is the root. Smaller values go left, bigger ones right.',
        },
        {
          type: 'predict', vars: R => ({ a: R.pick([[7, 3, 9, 1, 5], [6, 8, 2, 4, 1], [10, 4, 12, 2, 3]]) }),
          text: 'The smallest value is as far LEFT as you can go. What will it say?', code: [...BST_CODE, 'root = None', 'for v in $(JSON.stringify(a)):', '    root = insert(root, v)', 'node = root', 'while node.left:', '    node = node.left', 'print(node.v)'],
          explain: 'Keep going left until there is no left child: that is the minimum.',
        },
        {
          type: 'fill', text: 'Smaller values go to the LEFT subtree.',
          lines: ['class Node:', '    def __init__(self, v):', '        self.v, self.left, self.right = v, None, None', 'def insert(root, v):', '    if root is None:', '        return Node(v)', '    if v [] root.v:', '        root.left = insert(root.left, v)', '    else:', '        root.right = insert(root.right, v)', '    return root', 'r = None', 'for v in [5, 3, 7]:', '    r = insert(r, v)', 'print(r.left.v, r.right.v)'], chips: ['<', '>', '=='], answer: [['<']],
          hints: ['Left means smaller.', 'if v < root.v:'],
        },
        {
          type: 'write', vars: R => ({ t: R.pick([6, 7, 14]) }),
          text: 'Write has(root, v) that RETURNS True if v is in the BST (go left or right, never both). Print has(root, $t).',
          starter: [...BST_CODE, 'root = None', 'for v in [8, 3, 10, 1, 6, 14]:', '    root = insert(root, v)'], keys: ['def', 'has', '(', ')', 'root', 'v', ',', ':', 'if', 'is', 'None', 'return', 'False', 'True', '==', '.v', '<', '.left', '.right', 'else', 'print', '$t'],
          require: l => (has(l, /def\s+has/) && has(l, /\.left/) && has(l, /\.right/) ? null : 'Recurse into root.left or root.right.'),
          hints: ['if root is None: return False / if v == root.v: return True', 'if v < root.v: return has(root.left, v) / return has(root.right, v)'],
          solution: ['def has(root, v):', '    if root is None:', '        return False', '    if v == root.v:', '        return True', '    if v < root.v:', '        return has(root.left, v)', '    return has(root.right, v)', 'print(has(root, $t))'],
        },
      ],
      learn: [{ title: 'Binary search trees', code: 'left < node <= right', text: 'Each step down halves the search, when the tree is balanced: O(log n).' }],
    },
    {
      id: '25-3', title: 'Walking the tree', bg: 'forest', npc: 'sylva', mentor: 'sylva', tags: ['traversal'],
      steps: [
        { type: 'talk', who: 'sylva', text: 'Three classic ways to walk a binary tree. IN-ORDER: left, node, right; on a BST this gives the values SORTED. PRE-ORDER: node, left, right. POST-ORDER: left, right, node.' },
        { type: 'demo', text: 'Run it.', code: [...BST_CODE, 'def inorder(n):', '    if n:', '        inorder(n.left)', '        print(n.v, end=" ")', '        inorder(n.right)', 'root = None', 'for v in [5, 2, 8, 1, 3]:', '    root = insert(root, v)', 'inorder(root)'] },
        {
          type: 'predict', vars: R => ({ a: R.pick([[4, 2, 6, 1, 3], [5, 3, 7, 6], [6, 1, 8, 4]]) }),
          text: 'In-order. What will it say?', code: [...BST_CODE, 'def inorder(n, out):', '    if n:', '        inorder(n.left, out)', '        out.append(n.v)', '        inorder(n.right, out)', '    return out', 'root = None', 'for v in $(JSON.stringify(a)):', '    root = insert(root, v)', 'print(inorder(root, []))'],
          explain: 'In-order on a BST always comes out sorted.',
        },
        {
          type: 'predict', vars: R => ({ a: R.pick([[4, 2, 6, 1, 3], [5, 3, 7, 6]]) }),
          text: 'Pre-order. What will it say?', code: [...BST_CODE, 'def preorder(n, out):', '    if n:', '        out.append(n.v)', '        preorder(n.left, out)', '        preorder(n.right, out)', '    return out', 'root = None', 'for v in $(JSON.stringify(a)):', '    root = insert(root, v)', 'print(preorder(root, []))'],
          explain: 'Each node is recorded BEFORE its children, so the root comes first.',
        },
        {
          type: 'fill', text: 'Make it a POST-order walk: children first, then the node.',
          lines: [...BST_CODE, 'def post(n, out):', '    if n:', '        post(n.left, out)', '        post(n.right, out)', '        out.[](n.v)', '    return out', 'r = None', 'for v in [5, 2, 8]:', '    r = insert(r, v)', 'print(post(r, list()))'], chips: ['append', 'pop', 'remove'], answer: [['append']],
          hints: ['Record the node after both children.', 'out.append(n.v)'],
        },
        {
          type: 'write', text: 'Write sorted_values(n) that RETURNS a list of the BST values in order, using in-order recursion (return [] for None). Print it for root.',
          starter: [...BST_CODE, 'root = None', 'for v in [7, 3, 9, 1, 5, 8]:', '    root = insert(root, v)'], keys: ['def', 'sorted_values', '(', ')', 'n', ':', 'if', 'is', 'None', 'return', '[]', '+', '[', ']', '.v', '.left', '.right', 'print', 'root'],
          require: l => (has(l, /sorted_values\s*\(\s*n\.left\s*\)/) && !has(l, /sorted\s*\(/) ? null : 'Recurse on n.left and n.right, no sorted().'),
          hints: ['if n is None: return []', 'return sorted_values(n.left) + [n.v] + sorted_values(n.right)'],
          solution: ['def sorted_values(n):', '    if n is None:', '        return []', '    return sorted_values(n.left) + [n.v] + sorted_values(n.right)', 'print(sorted_values(root))'],
        },
      ],
      learn: [{ title: 'Traversals', code: 'in:   left, node, right  (sorted)\npre:  node, left, right\npost: left, right, node', text: 'Three orders for visiting every node.' }],
    },
    {
      id: '25-4', title: 'Barklings', bg: 'thorns', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8); return { kind: 'barkling', hp: d + 4 * 3, d }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Barklings creak to life! $HP HP. Every leaf on your spell tree strikes once.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', text: 'It has $HP HP left. Count the leaves and cast fireball with 3 for each.',
          lines: ['class Tree:', '    def __init__(self, kids=None):', '        self.kids = kids or list()', 'def leaves(t):', '    if not t.kids:', '        return []', '    return sum(leaves(k) for k in t.kids)', 't = Tree([Tree([Tree(), Tree()]), Tree(), Tree()])', 'for i in range(leaves(t)):', '    cast(fireball, 3)'], chips: ['1', '0', 'len(t.kids)'], answer: [['1']],
          goal: { foeDown: true },
          hints: ['A node with no children IS one leaf.', 'return 1'],
        },
        { type: 'talk', who: 'narrator', text: 'An old barkling, heavy with sorted roots!' },
        {
          type: 'write', vars: R => ({ hp: 2 * (1 + 3 + 9) }),
          spawn: v => ({ kind: 'barkling', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Walk the BST in order and cast icebolt with each value, twice.',
          starter: [...BST_CODE, 'root = None', 'for v in [3, 1, 9]:', '    root = insert(root, v)'], keys: ['def', 'walk', '(', ')', 'n', ':', 'if', 'n', '.left', '.right', '.v', 'cast', 'icebolt', ',', 'root'],
          goal: { foeDown: true },
          require: l => (has(l, /def\s+\w+\s*\(\s*n\s*\)/) && has(l, /\.left/) ? null : 'Write a recursive walk(n).'),
          hints: ['def walk(n): / if n: walk(n.left); cast twice; walk(n.right)', 'walk(root)'],
          solution: ['def walk(n):', '    if n:', '        walk(n.left)', '        cast(icebolt, n.v)', '        cast(icebolt, n.v)', '        walk(n.right)', 'walk(root)'],
        },
      ],
      learn: [{ title: 'Trees in battle', code: 'leaves(t)  walk(root)', text: 'Recursive walks reach every node.' }],
    },
    {
      id: '25-5', title: 'Roads between villages', bg: 'crossroads', npc: 'sylva', mentor: 'sylva', tags: ['graphs'],
      steps: [
        { type: 'talk', who: 'sylva', text: 'A GRAPH is a set of places (nodes) joined by roads (edges). Unlike a tree it can have loops, and no root. In Python, a dict mapping each node to a list of its neighbours does the job.' },
        { type: 'demo', text: 'Run it.', code: [...ROADS, 'print(roads["Fen"])', 'print(len(roads))', 'print("Gil" in roads["Ash"])'] },
        {
          type: 'predict', vars: R => ({ n: R.pick(['Ash', 'Elm', 'Fen', 'Gil']) }),
          text: 'How many roads leave this village? What will it say?', code: [...ROADS, 'print(len(roads["$n"]))'],
          explain: 'The number of neighbours is called the DEGREE of the node.',
        },
        {
          type: 'predict', text: 'Each road is listed from both ends. What will it say?', code: [...ROADS, 'total = sum(len(n) for n in roads.values())', 'print(total, total // 2)'],
          explain: 'Every road appears twice (once from each end), so halve the total.',
        },
        {
          type: 'fill', text: 'Add a new road between Gil and Ash, both ways.',
          lines: [...ROADS, 'roads["Gil"].append("Ash")', 'roads["Ash"].[]("Gil")', 'print(roads["Ash"], roads["Gil"])'], chips: ['append', 'remove', 'pop'], answer: [['append']],
          hints: ['Roads go both ways in this map.', 'roads["Ash"].append("Gil")'],
        },
        {
          type: 'write', text: 'Print the name of the village with the MOST roads.',
          starter: ROADS, keys: ['best', '=', 'max', '(', ')', 'roads', 'key', 'lambda', 'n', ':', 'len', '[', ']', 'print', 'for', 'in', 'if', '>'],
          require: l => (has(l, /len\s*\(\s*roads\s*\[/) ? null : 'Compare len(roads[name]).'),
          hints: ['Walk the names, remembering the one with the longest list.', 'best = None / for n in roads: if best is None or len(roads[n]) > len(roads[best]): best = n'],
          solution: ['best = None', 'for n in roads:', '    if best is None or len(roads[n]) > len(roads[best]):', '        best = n', 'print(best)'],
        },
      ],
      learn: [{ title: 'Graphs', code: 'roads = {"A": ["B", "C"], ...}', text: 'A dict from each node to its neighbours: an adjacency list.' }],
    },
    {
      id: '25-6', title: 'Ripples', bg: 'river', npc: 'sylva', mentor: 'sylva', tags: ['bfs'],
      steps: [
        { type: 'talk', who: 'sylva', text: 'BREADTH-FIRST SEARCH spreads out like ripples in a pond. Visit the start, then all its neighbours, then THEIR neighbours. A queue keeps the order, and a "seen" set stops you going round in circles.' },
        { type: 'talk', who: 'sylva', text: 'Because BFS goes ring by ring, the first time it reaches a place is by the FEWEST roads. That makes it the tool for shortest hops.' },
        { type: 'demo', text: 'Run it.', code: [...ROADS, 'queue, seen, order = ["Ash"], {"Ash"}, []', 'while queue:', '    here = queue.pop(0)', '    order.append(here)', '    for n in roads[here]:', '        if n not in seen:', '            seen.add(n)', '            queue.append(n)', 'print(order)'] },
        {
          type: 'predict', vars: R => ({ s: R.pick(['Gil', 'Elm', 'Oak']) }),
          text: 'Start somewhere else. What will it say?', code: [...ROADS, 'queue, seen, order = ["$s"], {"$s"}, []', 'while queue:', '    here = queue.pop(0)', '    order.append(here)', '    for n in roads[here]:', '        if n not in seen:', '            seen.add(n)', '            queue.append(n)', 'print(order)'],
          explain: 'Neighbours are visited in the order they are listed, ring by ring outward from $s.',
        },
        {
          type: 'predict', vars: R => ({ t: R.pick(['Fen', 'Gil', 'Oak']) }),
          text: 'Shortest hops from Ash. What will it say?', code: [...ROADS, 'dist = {"Ash": 0}', 'queue = ["Ash"]', 'while queue:', '    here = queue.pop(0)', '    for n in roads[here]:', '        if n not in dist:', '            dist[n] = dist[here] + 1', '            queue.append(n)', 'print(dist["$t"])'],
          explain: 'Each ring is one more road away from Ash.',
        },
        {
          type: 'fill', text: 'Only queue places you have not seen yet.',
          lines: [...ROADS, 'queue, seen = ["Ash"], {"Ash"}', 'count = 0', 'while queue:', '    here = queue.pop(0)', '    count += 1', '    for n in roads[here]:', '        if n [] seen:', '            seen.add(n)', '            queue.append(n)', 'print(count)'], chips: ['not in', 'in', '=='], answer: [['not in']],
          hints: ['Skip places already seen, or you loop forever.', 'if n not in seen:'],
        },
        {
          type: 'write', text: 'Using BFS with a dist dict, print the number of roads on the shortest route from Gil to Ash.',
          starter: ROADS, keys: ['dist', '=', '{', '}', '"Gil"', '0', 'queue', '[', ']', 'while', ':', 'here', '.pop(0)', 'for', 'n', 'in', 'roads', 'if', 'not', '+', '1', '.append', 'print', '"Ash"'],
          require: l => (has(l, /\.pop\s*\(\s*0\s*\)/) && has(l, /dist\s*\[/) ? null : 'Use a queue (pop(0)) and a dist dict.'),
          hints: ['dist = {"Gil": 0} / queue = ["Gil"] / while queue: here = queue.pop(0) ...', 'for n in roads[here]: if n not in dist: dist[n] = dist[here] + 1; queue.append(n), then print(dist["Ash"])'],
          solution: ['dist = {"Gil": 0}', 'queue = ["Gil"]', 'while queue:', '    here = queue.pop(0)', '    for n in roads[here]:', '        if n not in dist:', '            dist[n] = dist[here] + 1', '            queue.append(n)', 'print(dist["Ash"])'],
        },
      ],
      learn: [{ title: 'Breadth-first search', code: 'queue = [start]; seen = {start}\nwhile queue:\n    here = queue.pop(0)\n    for n in graph[here]: ...', text: 'Ring by ring outward. Finds the fewest hops.' }],
    },
    {
      id: '25-7', title: 'Deep paths', bg: 'cave', npc: 'sylva', mentor: 'sylva', tags: ['dfs'],
      steps: [
        { type: 'talk', who: 'sylva', text: 'DEPTH-FIRST SEARCH dives down one road as far as it can, then backs up and tries the next. Recursion does the backing up for you. Keep a seen set here too.' },
        { type: 'demo', text: 'Run it.', code: [...ROADS, 'seen = []', 'def dfs(here):', '    seen.append(here)', '    for n in roads[here]:', '        if n not in seen:', '            dfs(n)', 'dfs("Ash")', 'print(seen)'] },
        {
          type: 'predict', vars: R => ({ s: R.pick(['Gil', 'Oak', 'Elm']) }),
          text: 'What will it say?', code: [...ROADS, 'seen = []', 'def dfs(here):', '    seen.append(here)', '    for n in roads[here]:', '        if n not in seen:', '            dfs(n)', 'dfs("$s")', 'print(seen)'],
          explain: 'DFS follows the first unseen neighbour each time, going deep before going wide.',
        },
        {
          type: 'predict', text: 'Two islands of villages. How many separate parts? What will it say?', code: ['g = {"a": ["b"], "b": ["a"], "c": ["d"], "d": ["c"], "e": []}', 'seen = set()', 'def dfs(x):', '    seen.add(x)', '    for n in g[x]:', '        if n not in seen:', '            dfs(n)', 'parts = 0', 'for v in g:', '    if v not in seen:', '        parts += 1', '        dfs(v)', 'print(parts)'],
          explain: 'Each DFS from an unseen node colours one whole connected part: a-b, c-d, and e alone.',
        },
        {
          type: 'fill', text: 'Can you get from Gil to Ash? DFS returns True as soon as it arrives.',
          lines: [...ROADS, 'def reach(here, goal, seen):', '    if here == goal:', '        return True', '    seen.add(here)', '    for n in roads[here]:', '        if n not in seen and reach(n, goal, seen):', '            return []', '    return False', 'print(reach("Gil", "Ash", set()))'], chips: ['True', 'False', 'n'], answer: [['True']],
          hints: ['If a neighbour can reach the goal, so can we.', 'return True'],
        },
        {
          type: 'write', text: 'Write dfs(here) that adds each place to the seen list (recursively, unseen neighbours only). Call dfs("Fen") and print len(seen).',
          starter: [...ROADS, 'seen = []'], keys: ['def', 'dfs', '(', ')', 'here', ':', 'seen', '.append', 'for', 'n', 'in', 'roads', '[', ']', 'if', 'not', '"Fen"', 'print', 'len'],
          require: l => (has(l, /def\s+dfs/) && has(l, /dfs\s*\(\s*n\s*\)/) ? null : 'Recurse with dfs(n).'),
          hints: ['def dfs(here): seen.append(here); for n in roads[here]: if n not in seen: dfs(n)', 'dfs("Fen") then print(len(seen))'],
          solution: ['def dfs(here):', '    seen.append(here)', '    for n in roads[here]:', '        if n not in seen:', '            dfs(n)', 'dfs("Fen")', 'print(len(seen))'],
        },
      ],
      learn: [{ title: 'Depth-first search', code: 'def dfs(x):\n    seen.add(x)\n    for n in g[x]:\n        if n not in seen: dfs(n)', text: 'Deep first, back up, try the next. Great for "can I reach it?" and finding connected parts.' }],
    },
    {
      id: '25-8', title: 'Root wurms', bg: 'cave', mentor: 'narrator', tags: [],
      foe: R => { const d = R.int(4, 8); return { kind: 'rootwurm', hp: d + 5 * 4, d }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Root wurms burrow between the villages! $HP HP. Every village you can reach strikes once.' },
        { type: 'demo', vars: (R, c) => ({ d: c.foe.d }), text: 'A spark.', code: ['cast(spark, $d)'] },
        {
          type: 'fill', text: 'It has $HP HP left. BFS from Ash and cast fireball with 4 for every village reached.',
          lines: [...ROADS, 'queue, seen = ["Ash"], {"Ash"}', 'while queue:', '    here = queue.pop([])', '    cast(fireball, 4)', '    for n in roads[here]:', '        if n not in seen:', '            seen.add(n)', '            queue.append(n)'], chips: ['0', '-1', '1'], answer: [['0']],
          goal: { foeDown: true },
          require: s => (s[0] === '0' ? null : 'Breadth-first serves the FRONT of the queue.'),
          hints: ['A queue serves from the front.', 'queue.pop(0)'],
        },
        { type: 'talk', who: 'narrator', text: 'The wurm queen hides at the far end of the roads!' },
        {
          type: 'write', vars: R => ({ hp: 3 * 2 * 2 }),
          spawn: v => ({ kind: 'rootwurm', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Find the shortest hops from Ash to Gil with BFS, then cast icebolt with hops × 2, twice.',
          starter: ROADS, keys: ['dist', '=', '{', '}', '"Ash"', '0', 'queue', '[', ']', 'while', ':', 'here', '.pop(0)', 'for', 'n', 'in', 'roads', 'if', 'not', '+', '1', '.append', 'cast', 'icebolt', '(', ')', ',', '"Gil"', '*', '2'],
          goal: { foeDown: true },
          require: l => (has(l, /dist\s*\[/) ? null : 'Use a dist dict with BFS.'),
          hints: ['BFS from Ash filling dist', 'cast(icebolt, dist["Gil"] * 2) twice'],
          solution: ['dist = {"Ash": 0}', 'queue = ["Ash"]', 'while queue:', '    here = queue.pop(0)', '    for n in roads[here]:', '        if n not in dist:', '            dist[n] = dist[here] + 1', '            queue.append(n)', 'cast(icebolt, dist["Gil"] * 2)', 'cast(icebolt, dist["Gil"] * 2)'],
        },
      ],
      learn: [{ title: 'Graphs in battle', code: 'BFS: reach everything, shortest hops', text: 'Graph searches find every place you can reach.' }],
    },
    {
      id: '25-9', title: 'The World Tree', bg: 'grove', foe: { kind: 'worldtree', hp: 180, weak: 'fireball', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'worldtree', text: 'MY... ROOTS... HOLD... EVERY... PATH...' },
        { type: 'talk', who: 'narrator', text: 'The World Tree has 180 HP. Fireball burns bark: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Fireball is doubled.', code: [...BST_CODE, 'root = None', 'for v in [6, 2, 9, 4]:', '    root = insert(root, v)', 'cast(fireball, root.left.right.v)'],
          explain: '2 goes left of 6, and 4 goes right of 2: root.left.right is 4. Doubled.',
        },
        {
          type: 'fix', text: 'BFS should reach all 5 villages and print 5. It never stops! Run it, then tap the broken line.',
          code: [...ROADS, 'queue, seen, count = ["Ash"], {"Ash"}, 0', 'while queue and count < 40:', '    here = queue.pop(0)', '    count += 1', '    for n in roads[here]:', '        if n not in seen:', '            queue.append(n)', 'print(count)', 'cast(fireball, count)'], bad: 13,
          options: ['            queue.append(n); seen.add(n)', '            seen.append(n)', '            queue.pop(0)'], answer: 0,
          explain: 'Without marking places as seen, the search keeps going round and round.',
        },
        { type: 'talk', who: 'worldtree', text: 'HOW... DEEP... DO... MY... ROOTS... GO...' },
        {
          type: 'fill', text: 'Measure the tree\'s height and strike with fireball, 5 times the height.',
          lines: ['class Tree:', '    def __init__(self, kids=None):', '        self.kids = kids or list()', 'def height(t):', '    if not t.kids:', '        return 1', '    return 1 + [](height(k) for k in t.kids)', 't = Tree([Tree([Tree()]), Tree()])', 'cast(fireball, height(t) * 5)'], chips: ['max', 'min', 'sum'], answer: [['max']],
          hints: ['Height follows the LONGEST branch.', '1 + max(...)'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and fireball is doubled. Insert $HP // 2 + 1 into an empty BST (root = insert(None, ...)) and cast fireball with root.v.',
          starter: BST_CODE, keys: ['root', '=', 'insert', '(', ')', 'None', ',', '$HP', '//', '2', '+', '1', 'cast', 'fireball', '.v'],
          goal: { foeDown: true },
          require: l => (has(l, /insert\s*\(\s*None/) ? null : 'Start the tree with insert(None, ...).'),
          hints: ['root = insert(None, $HP // 2 + 1)', 'cast(fireball, root.v)'],
          solution: ['root = insert(None, $HP // 2 + 1)', 'cast(fireball, root.v)'],
        },
        { type: 'talk', who: 'worldtree', text: '...the... roots... rest...' },
      ],
      learn: [{ title: 'Rootwood toolkit', code: 'trees  BST  traversals  graphs  BFS  DFS', text: 'Everything from the Rootwood.' }],
    },
    {
      id: '25-R', title: 'The Grand Architect', bg: 'citadel', foe: { kind: 'architect', hp: 280 }, mentor: 'narrator', boss: true, review: true, tags: [],
      steps: [
        { type: 'talk', who: 'architect', text: 'You can build your own kinds of things now, {NAME}: golems, families of classes, stacks, chains, trees. Prove that you can design.' },
        { type: 'talk', who: 'narrator', text: 'The Act V review! Classes, inheritance, properties and the data structures you built. 280 HP. Each right answer strikes.' },
        { type: 'review', tags: ['class', 'init', 'method', 'state', 'strdunder', 'objlist'], reward: { spell: 'spark', power: 25 }, text: 'The Golem Forge. What will it say?' },
        { type: 'review', tags: ['inherit', 'override', 'superc', 'isinst', 'eqdunder', 'opdunder'], reward: { spell: 'fireball', power: 25 }, text: 'The Bloodline Keep. What will it say?' },
        { type: 'review', tags: ['classattr', 'property', 'setter', 'clsmethod', 'staticm', 'compose'], reward: { spell: 'icebolt', power: 25 }, text: 'The Clockwork Citadel. What will it say?' },
        { type: 'review', tags: ['stack', 'brackets', 'queue', 'stackclass', 'linked', 'linkedops'], reward: { spell: 'spark', power: 25 }, text: "The Builder's Yard. What will it say?" },
        { type: 'review', tags: ['treebasics', 'bst', 'traversal', 'graphs', 'bfs', 'dfs'], reward: { spell: 'fireball', power: 25 }, text: 'The Rootwood. What will it say?' },
        { type: 'review', tags: ['memo', 'recurlist', 'binsearch', 'sideeffect', 'mutdefault', 'dsu'], reward: { spell: 'icebolt', power: 25 }, text: 'Older lessons, still sharp. What will it say?' },
        { type: 'talk', who: 'architect', text: 'Now design. Build a class that holds a chain, and walk it.' },
        {
          type: 'write', vars: (R, c) => ({ h: c.foe.hp, a: Math.floor(c.foe.hp / 2), b: c.foe.hp - Math.floor(c.foe.hp / 2) }),
          text: 'Write class Node(value, next=None) and class Chain with push_front(v) and total() (sum of all values). Push $a and $b, then cast fireball with chain.total().',
          starter: [], keys: ['class', 'Node', 'Chain', ':', 'def', '__init__', '(self, value, next=None)', '(self)', 'self.value', 'self.next', 'self.head', '=', 'None', 'push_front', '(self, v)', 'Node(v, self.head)', 'total', 's', '0', 'node', 'while', '+=', '.value', '.next', 'return', 'chain', 'Chain()', 'cast', 'fireball', '(', ')', ',', '$a', '$b'],
          goal: { foeDown: true },
          require: l => (has(l, /class\s+Node/) && has(l, /class\s+Chain/) && has(l, /while\s+/) ? null : 'Write both classes and walk the chain in total().'),
          hints: ['class Node: __init__ stores value and next / class Chain: __init__ sets self.head = None', 'push_front: self.head = Node(v, self.head) / total: walk from self.head adding values'],
          solution: ['class Node:', '    def __init__(self, value, next=None):', '        self.value = value', '        self.next = next', 'class Chain:', '    def __init__(self):', '        self.head = None', '    def push_front(self, v):', '        self.head = Node(v, self.head)', '    def total(self):', '        s, node = 0, self.head', '        while node:', '            s += node.value', '            node = node.next', '        return s', 'chain = Chain()', 'chain.push_front($a)', 'chain.push_front($b)', 'cast(fireball, chain.total())'],
        },
        { type: 'talk', who: 'architect', text: 'A true architect. Act VI awaits: Python at work, with dates, folders, patterns, logs and tests.' },
      ],
      learn: [{ title: 'Act V', code: 'classes  inheritance  properties  stacks  chains  trees  graphs', text: 'Building your own kinds of things.' }],
    },
  ],
};
WORLDS.push(WORLD25);

(() => {
  const { makeQ, pick } = Arena;
  const bst = ['class N:', '    def __init__(self, v):', '        self.v, self.l, self.r = v, None, None', 'def ins(t, v):', '    if t is None:', '        return N(v)', '    if v < t.v:', '        t.l = ins(t.l, v)', '    else:', '        t.r = ins(t.r, v)', '    return t'];
  const g = 'g = {"a": ["b", "c"], "b": ["a", "d"], "c": ["a"], "d": ["b"]}';
  Object.assign(Arena.GEN, {
    treebasics: () => makeQ(['class T:', '    def __init__(self, k=None):', '        self.k = k or []', 'def size(t):', '    return 1 + sum(size(c) for c in t.k)', 'print(size(T([T(), T([T()])])))'], [3, 2]),
    bst: () => { const a = pick([[5, 3, 8], [5, 7, 2], [4, 6, 1]]); return makeQ([...bst, 't = None', `for v in ${JSON.stringify(a)}:`, '    t = ins(t, v)', 'print(t.l.v if t.l else None)'], [a[0], Math.max(...a)]); },
    traversal: () => makeQ([...bst, 'def ino(t):', '    return ino(t.l) + [t.v] + ino(t.r) if t else []', 't = None', 'for v in [4, 7, 1, 5]:', '    t = ins(t, v)', 'print(ino(t))'], ['[4, 7, 1, 5]', '[4, 1, 7, 5]']),
    graphs: () => makeQ([g, 'print(sum(len(v) for v in g.values()) // 2)'], [6, 4]),
    bfs: () => makeQ([g, 'q, seen, out = ["a"], {"a"}, []', 'while q:', '    x = q.pop(0)', '    out.append(x)', '    for n in g[x]:', '        if n not in seen:', '            seen.add(n)', '            q.append(n)', 'print(out)'], ["['a', 'b', 'd', 'c']", "['a', 'c', 'b', 'd']"]),
    dfs: () => makeQ([g, 'seen = []', 'def dfs(x):', '    seen.append(x)', '    for n in g[x]:', '        if n not in seen:', '            dfs(n)', 'dfs("a")', 'print(seen)'], ["['a', 'b', 'c', 'd']", "['a', 'c', 'b', 'd']"]),
  });
})();
