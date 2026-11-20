/* World 27: The Sundial Plaza. Dates and times with the datetime module: date objects,
   days between dates with timedelta, datetime and times of day, formatting with
   strftime, parsing with strptime, comparing and sorting dates, leap years and weekdays.
   Source: Automate the Boring Stuff, chapter 17. ("Today" is always a fixed date in
   lessons, so the answers never change.) */
Object.assign(EXTRA.npcs, {
  helia: { name: 'Sundial-keeper Helia', colors: ['#e2b34a', '#7a4424', '#ecb98d'] },
});
Object.assign(EXTRA.foes, {
  hourwisp: { base: 'wisp', name: 'Hour wisp', pal: { F: '#ff9a3b', L: '#ffe0a8' } },
  dawnbat: { base: 'bat', name: 'Dawn bat', pal: { P: '#e2b34a', W: '#ff5f6d' } },
  suntitan: { base: 'sandtitan', name: 'The Sun Titan' },
});
const SUN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const sunDate = R => ({ y: R.int(2020, 2028), m: R.int(1, 12), d: R.int(1, 28) });

const WORLD27 = {
  id: 27, name: 'The Sundial Plaza', topic: 'dates and times',
  nodes: [[50, 92], [26, 82], [68, 72], [34, 62], [66, 52], [30, 42], [64, 32], [38, 21], [52, 8]],
  levels: [
    {
      id: '27-1', title: 'Calendar stones', bg: 'court', npc: 'helia', mentor: 'helia', tags: ['dates'],
      steps: [
        { type: 'talk', who: 'helia', text: "Good day, {NAME}! I'm Helia, keeper of the great sundial. Dates are tricky: months have different lengths, leap years come and go. Python's datetime module handles all of that for you." },
        { type: 'talk', who: 'helia', text: 'from datetime import date gives you date objects: date(2024, 1, 15) is 15 January 2024. They know their .year, .month and .day, and weekday() says which day of the week it is (Monday is 0).' },
        { type: 'demo', vars: sunDate, text: 'Run it.', code: ['from datetime import date', 'd = date($y, $m, $d)', 'print(d)', 'print(d.year, d.month, d.day)', 'print(d.weekday())'] },
        {
          type: 'predict', vars: sunDate,
          text: 'How does a date print? What will it say?', code: ['from datetime import date', 'print(date($y, $m, $d))'],
          wrong: ['$y-$m-$d', '$d/$m/$y', 'date($y, $m, $d)'],
          explain: 'A date prints as year-month-day, with two digits for the month and day.',
        },
        {
          type: 'predict', vars: R => R.pick([{ y: 2024, m: 1, d: 1 }, { y: 2023, m: 12, d: 25 }, { y: 2026, m: 11, d: 21 }, { y: 2000, m: 1, d: 1 }]),
          text: 'Which day of the week? What will it say?', code: ['from datetime import date', 'names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]', 'print(names[date($y, $m, $d).weekday()])'],
          explain: 'weekday() gives 0 for Monday up to 6 for Sunday, so it can index a list of names.',
        },
        {
          type: 'predict', measure: 'errtype', vars: R => R.pick([{ y: 2023, m: 2, d: 29 }, { y: 2024, m: 4, d: 31 }, { y: 2024, m: 13, d: 1 }]),
          text: 'A date that does not exist. Which error?', code: ['from datetime import date', 'print(date($y, $m, $d))'],
          explain: 'date() checks the calendar for you and raises ValueError for impossible dates.',
        },
        {
          type: 'fill', vars: sunDate,
          text: 'Print just the month number of the date.',
          lines: ['from datetime import date', 'd = date($y, $m, $d)', 'print(d.[])'], chips: ['month', 'day', 'year'], answer: [['month']],
          hints: ['Dates have .year, .month and .day.', 'd.month'],
        },
        {
          type: 'write', vars: R => { const v = sunDate(R); return { ...v, mn: SUN_MONTHS[v.m - 1] }; },
          text: 'Make a date for $d $mn $y and print its year and its weekday number.',
          starter: ['from datetime import date'], keys: ['d', '=', 'date', '(', ')', '$y', '$m', '$d', ',', 'print', '.year', '.weekday()'],
          require: l => (has(l, /date\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/) ? null : 'Make the date with date(year, month, day).'),
          hints: ['d = date($y, $m, $d)', 'print(d.year, d.weekday())'],
          solution: ['d = date($y, $m, $d)', 'print(d.year, d.weekday())'],
        },
      ],
      learn: [{ title: 'Dates', code: 'from datetime import date\nd = date(2024, 1, 15)\nd.year  d.month  d.day  d.weekday()', text: 'A date knows its parts and its day of the week (Monday is 0). Impossible dates raise ValueError.' }],
    },
    {
      id: '27-2', title: 'Days between', bg: 'court', npc: 'helia', mentor: 'helia', tags: ['timedelta'],
      steps: [
        { type: 'talk', who: 'helia', text: 'A timedelta is a length of time. Add one to a date to move through the calendar: date + timedelta(days=30). Subtract two dates and you get a timedelta; its .days says how far apart they are.' },
        { type: 'demo', text: 'Run it.', code: ['from datetime import date, timedelta', 'start = date(2024, 1, 15)', 'print(start + timedelta(days=20))', 'print((date(2024, 3, 1) - start).days)'] },
        {
          type: 'predict', vars: R => ({ ...sunDate(R), n: R.int(5, 40) }),
          text: 'What will it say?', code: ['from datetime import date, timedelta', 'print(date($y, $m, $d) + timedelta(days=$n))'],
          explain: 'Python rolls into the next month (or year) for you.',
        },
        {
          type: 'predict', vars: R => R.pick([{ a: '2024, 2, 28', b: '2024, 3, 1' }, { a: '2023, 2, 28', b: '2023, 3, 1' }, { a: '2024, 12, 25', b: '2025, 1, 1' }]),
          text: 'Leap years count. What will it say?', code: ['from datetime import date', 'print((date($b) - date($a)).days)'],
          explain: '2024 is a leap year with a 29 February; 2023 is not.',
        },
        {
          type: 'predict', vars: R => ({ w: R.int(1, 4) }),
          text: 'Weeks become days. What will it say?', code: ['from datetime import date, timedelta', 'trip = timedelta(weeks=$w)', 'print(trip.days, date(2024, 6, 1) + trip)'],
          explain: '$w weeks is $(w * 7) days.',
        },
        {
          type: 'fill', vars: R => ({ n: R.int(10, 100) }),
          text: 'The festival is $n days after 1 May 2024. Print its date.',
          lines: ['from datetime import date, timedelta', 'start = date(2024, 5, 1)', 'print(start [] timedelta(days=$n))'], chips: ['+', '-', '*'], answer: [['+']],
          hints: ['Move forward through the calendar.', 'start + timedelta(days=$n)'],
        },
        {
          type: 'write', vars: R => { const v = R.pick([{ m: 6, d: 21 }, { m: 10, d: 31 }, { m: 12, d: 25 }, { m: 9, d: 1 }]); return { ...v, mn: SUN_MONTHS[v.m - 1] }; },
          text: 'Today is 1 May 2024. Print how many days until $d $mn 2024.',
          starter: ['from datetime import date', 'today = date(2024, 5, 1)'], keys: ['party', '=', 'date', '(', ')', '2024', '$m', '$d', ',', 'print', '-', 'today', '.days'],
          require: l => (has(l, /\.days/) ? null : 'Subtract the dates and use .days.'),
          hints: ['party = date(2024, $m, $d)', 'print((party - today).days)'],
          solution: ['party = date(2024, $m, $d)', 'print((party - today).days)'],
        },
      ],
      learn: [{ title: 'timedelta', code: 'date + timedelta(days=30)\n(d2 - d1).days\ntimedelta(weeks=2)', text: 'Lengths of time: add them to dates, or get them by subtracting dates.' }],
    },
    {
      id: '27-3', title: 'Hours on the dial', bg: 'clocktower', npc: 'helia', mentor: 'helia', tags: ['datetimes'],
      steps: [
        { type: 'talk', who: 'helia', text: 'For a time of day too, use datetime: datetime(2024, 5, 6, 14, 30) is 2:30 in the afternoon. It has .hour, .minute and .second, and timedelta can hold hours and minutes.' },
        { type: 'demo', text: 'Run it.', code: ['from datetime import datetime, timedelta', 'start = datetime(2024, 5, 6, 14, 30)', 'print(start)', 'print(start + timedelta(hours=10))', 'print(timedelta(minutes=90))'] },
        {
          type: 'predict', vars: R => ({ h: R.int(8, 20), m: R.pick([0, 15, 30, 45]), add: R.int(30, 200) }),
          text: 'What will it say?', code: ['from datetime import datetime, timedelta', 't = datetime(2024, 1, 1, $h, $m)', 'print(t + timedelta(minutes=$add))'],
          explain: 'Minutes roll over into hours, and hours into days.',
        },
        {
          type: 'predict', vars: R => ({ h: R.int(1, 50) }),
          text: 'How does a timedelta print? What will it say?', code: ['from datetime import timedelta', 'print(timedelta(hours=$h))'],
          explain: 'Whole days are shown first, then hours:minutes:seconds.',
        },
        {
          type: 'predict', vars: R => ({ a: R.int(6, 11), b: R.int(13, 22) }),
          text: 'A shift at the dial. What will it say?', code: ['from datetime import datetime', 'start = datetime(2024, 3, 2, $a, 0)', 'end = datetime(2024, 3, 2, $b, 30)', 'shift = end - start', 'print(shift, shift.total_seconds() / 3600)'],
          explain: 'Subtracting datetimes gives a timedelta; total_seconds() turns it into a number.',
        },
        {
          type: 'fill', vars: R => ({ h: R.int(1, 12) }),
          text: 'Add $h hours to the start time.',
          lines: ['from datetime import datetime, timedelta', 'start = datetime(2024, 7, 1, 9, 0)', 'print(start + timedelta([]=$h))'], chips: ['hours', 'days', 'minutes'], answer: [['hours']],
          hints: ['timedelta takes named lengths.', 'timedelta(hours=$h)'],
        },
        {
          type: 'write', vars: R => ({ a: R.int(7, 10), b: R.int(14, 18) }),
          text: 'A guard starts at $a:00 and ends at $b:45 on 2 March 2024. Print how many MINUTES the watch lasted.',
          starter: ['from datetime import datetime'], keys: ['start', 'end', '=', 'datetime', '(', ')', '2024', '3', '2', '$a', '$b', '0', '45', ',', 'print', '-', '.total_seconds()', '//', '60'],
          require: l => (has(l, /total_seconds\s*\(\s*\)/) ? null : 'Use total_seconds() on the difference.'),
          hints: ['start = datetime(2024, 3, 2, $a, 0) / end = datetime(2024, 3, 2, $b, 45)', 'print((end - start).total_seconds() // 60)'],
          solution: ['start = datetime(2024, 3, 2, $a, 0)', 'end = datetime(2024, 3, 2, $b, 45)', 'print((end - start).total_seconds() // 60)'],
        },
      ],
      learn: [{ title: 'datetime', code: 'datetime(2024, 5, 6, 14, 30)\n.hour  .minute\ntimedelta(hours=2, minutes=15)\n(t2 - t1).total_seconds()', text: 'Dates with a time of day. Differences are timedeltas.' }],
    },
    {
      id: '27-4', title: 'Hour wisps', bg: 'court', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8), n = R.int(10, 25); return { kind: 'hourwisp', hp: d0 + n, d0, n }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Hour wisps flicker across the plaza! $HP HP. Their weakness is measured in days.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', vars: (R, c) => ({ n: c.foe.n }),
          text: 'It has $HP HP left: the number of days from 1 June to the date below. Cast fireball with it.',
          lines: ['from datetime import date', 'gap = date(2024, 6, $(1 + n)) - date(2024, 6, 1)', 'cast(fireball, gap.[])'], chips: ['days', 'seconds', 'month'], answer: [['days']],
          goal: { foeDown: true },
          hints: ['A timedelta knows its whole days.', 'gap.days'],
        },
        { type: 'talk', who: 'narrator', text: 'The great wisp burns for a number of hours!' },
        {
          type: 'write', vars: R => { const h = R.int(4, 9); return { h, hp: h * 2 }; },
          spawn: v => ({ kind: 'hourwisp', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Work out how many hours lie between 06:00 and $(6 + h):00 on 1 June 2024, then cast icebolt with that number, twice.',
          starter: ['from datetime import datetime'], keys: ['hours', '=', 'datetime', '(', ')', '2024', '6', '1', '$(6 + h)', '0', ',', '-', '.total_seconds()', '//', '3600', 'cast', 'icebolt'],
          goal: { foeDown: true },
          require: l => (has(l, /total_seconds/) ? null : 'Use total_seconds() of the difference.'),
          hints: ['hours = (datetime(2024, 6, 1, $(6 + h), 0) - datetime(2024, 6, 1, 6, 0)).total_seconds() // 3600', 'cast(icebolt, hours) twice'],
          solution: ['hours = (datetime(2024, 6, 1, $(6 + h), 0) - datetime(2024, 6, 1, 6, 0)).total_seconds() // 3600', 'cast(icebolt, hours)', 'cast(icebolt, hours)'],
        },
      ],
      learn: [{ title: 'Time as power', code: '(d2 - d1).days', text: 'Lengths of time are numbers you can use anywhere.' }],
    },
    {
      id: '27-5', title: 'Writing the date', bg: 'scriptorium', npc: 'helia', mentor: 'helia', tags: ['strftime'],
      steps: [
        { type: 'talk', who: 'helia', text: 'strftime turns a date into text in any style you like. Codes start with %: %Y year, %m month number, %d day, %B month name, %A weekday name, %H:%M hours and minutes. Everything else is copied as it is.' },
        { type: 'demo', text: 'Run it.', code: ['from datetime import datetime', 't = datetime(2024, 7, 4, 18, 5)', 'print(t.strftime("%A %d %B %Y"))', 'print(t.strftime("%d/%m/%Y %H:%M"))', 'print(f"{t:%b %d}")'] },
        {
          type: 'predict', vars: sunDate,
          text: 'What will it say?', code: ['from datetime import date', 'print(date($y, $m, $d).strftime("%d.%m.%Y"))'],
          explain: 'Day, month and year, with dots between them.',
        },
        {
          type: 'predict', vars: sunDate,
          text: 'Names instead of numbers. What will it say?', code: ['from datetime import date', 'print(date($y, $m, $d).strftime("%B %Y"))'],
          explain: '%B is the full month name.',
        },
        {
          type: 'predict', vars: R => ({ h: R.int(0, 23), mi: R.int(0, 59) }),
          text: 'A 12-hour clock. What will it say?', code: ['from datetime import datetime', 'print(datetime(2024, 1, 1, $h, $mi).strftime("%I:%M %p"))'],
          explain: '%I is the hour on a 12-hour clock and %p says AM or PM.',
        },
        {
          type: 'fill', text: 'Print the date like 2024-07-04.',
          lines: ['from datetime import date', 'd = date(2024, 7, 4)', 'print(d.strftime("[]-%m-%d"))'], chips: ['%Y', '%y', '%B'], answer: [['%Y']],
          hints: ['Four-digit year.', '%Y'],
        },
        {
          type: 'write', vars: sunDate,
          text: 'Print the date like: Monday, 15 January 2024 (weekday name, day, month name, year).',
          starter: ['from datetime import date', 'd = date($y, $m, $d)'], keys: ['print', '(', ')', 'd', '.strftime', '"%A, %d %B %Y"'],
          require: l => (has(l, /strftime\s*\(/) ? null : 'Use d.strftime(...).'),
          hints: ['%A is the weekday name.', 'print(d.strftime("%A, %d %B %Y"))'],
          solution: ['print(d.strftime("%A, %d %B %Y"))'],
        },
      ],
      learn: [{ title: 'strftime', code: '%Y %m %d   %B %A   %H:%M   %I %p', text: 'Format dates and times as any text you like.' }],
    },
    {
      id: '27-6', title: 'Reading the date', bg: 'scriptorium', npc: 'helia', mentor: 'helia', tags: ['strptime'],
      steps: [
        { type: 'talk', who: 'helia', text: 'strptime does the opposite: it READS text into a datetime. You give the text and a pattern with the same % codes. If the text does not fit the pattern, it raises ValueError.' },
        { type: 'demo', text: 'Run it.', code: ['from datetime import datetime', 'd = datetime.strptime("2024-02-03 10:05", "%Y-%m-%d %H:%M")', 'print(d)', 'print(datetime.strptime("March 5, 2021", "%B %d, %Y").month)'] },
        {
          type: 'predict', vars: sunDate,
          text: 'What will it say?', code: ['from datetime import datetime', 'd = datetime.strptime("$d/$m/$y", "%d/%m/%Y")', 'print(d.year, d.month, d.day)'],
          explain: 'The pattern says day, month, year, so the numbers land in the right places.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'The pattern does not match. Which error?', code: ['from datetime import datetime', 'datetime.strptime("2024/07/04", "%Y-%m-%d")'],
          explain: 'The text uses slashes but the pattern wants dashes: ValueError.',
        },
        {
          type: 'predict', vars: R => ({ s: R.pick(['2024-11-21', '2025-01-09', '2023-06-30']) }),
          text: 'ISO dates have their own shortcut. What will it say?', code: ['from datetime import date', 'd = date.fromisoformat("$s")', 'print(d.strftime("%d %b"))'],
          explain: 'fromisoformat reads year-month-day text directly.',
        },
        {
          type: 'fill', vars: sunDate,
          text: 'Read the American-style date (month/day/year).',
          lines: ['from datetime import datetime', 'd = datetime.strptime("$m/$d/$y", "[]/%d/%Y")', 'print(d.strftime("%d %B %Y"))'], chips: ['%m', '%d', '%B'], answer: [['%m']],
          hints: ['The month comes first.', '%m/%d/%Y'],
        },
        {
          type: 'write', text: 'Read "2024-08-15" with strptime, add 10 days, and print the new date with strftime("%d.%m.%Y").',
          starter: ['from datetime import datetime, timedelta'], keys: ['d', '=', 'datetime.strptime', '(', ')', '"2024-08-15"', '"%Y-%m-%d"', ',', '+', 'timedelta', 'days=10', 'print', '.strftime', '"%d.%m.%Y"'],
          require: l => (has(l, /strptime\s*\(/) ? null : 'Use datetime.strptime to read the text.'),
          hints: ['d = datetime.strptime("2024-08-15", "%Y-%m-%d") + timedelta(days=10)', 'print(d.strftime("%d.%m.%Y"))'],
          solution: ['d = datetime.strptime("2024-08-15", "%Y-%m-%d") + timedelta(days=10)', 'print(d.strftime("%d.%m.%Y"))'],
        },
      ],
      learn: [{ title: 'strptime', code: 'datetime.strptime("03/02/2024", "%d/%m/%Y")\ndate.fromisoformat("2024-02-03")', text: 'Read text into dates using a pattern. A mismatch raises ValueError.' }],
    },
    {
      id: '27-7', title: 'The festival calendar', bg: 'court', npc: 'helia', mentor: 'helia', tags: ['schedule'],
      steps: [
        { type: 'talk', who: 'helia', text: 'Dates compare like numbers: earlier is smaller. So sorted(), min(), max() and "<" all work on them. Perfect for calendars.' },
        { type: 'demo', text: 'Run it.', code: ['from datetime import date', 'events = [date(2024, 9, 1), date(2024, 2, 14), date(2024, 6, 21)]', 'for e in sorted(events):', '    print(e.strftime("%d %b"))', 'print(min(events) < max(events))'] },
        {
          type: 'predict', text: 'Upcoming only. What will it say?', code: ['from datetime import date', 'today = date(2024, 5, 1)', 'events = {"feast": date(2024, 3, 3), "fair": date(2024, 6, 1), "games": date(2024, 5, 20)}', 'for name, day in events.items():', '    if day >= today:', '        print(name, (day - today).days)'],
          explain: 'Only events on or after 1 May are printed, with their days to go.',
        },
        {
          type: 'predict', vars: R => R.pick([{ y: 2024 }, { y: 2023 }, { y: 2100 }, { y: 2000 }]),
          text: 'Is it a leap year? Check whether 28 February is followed by 29 February. What will it say?', code: ['from datetime import date, timedelta', 'nxt = date($y, 2, 28) + timedelta(days=1)', 'print(nxt.month == 2)'],
          explain: 'Leap years are divisible by 4, except centuries, unless divisible by 400.',
        },
        {
          type: 'predict', vars: R => R.pick([{ m: 5, d: 1 }, { m: 5, d: 8 }, { m: 11, d: 21 }]),
          text: 'Find the next Friday. What will it say?', code: ['from datetime import date, timedelta', 'd = date(2024, $m, $d)', 'while d.weekday() != 4:', '    d += timedelta(days=1)', 'print(d)'],
          explain: 'Step forward a day at a time until weekday() is 4 (Friday).',
        },
        {
          type: 'fill', text: 'Print the EARLIEST deadline.',
          lines: ['from datetime import date', 'due = [date(2024, 9, 1), date(2024, 4, 15), date(2024, 7, 30)]', 'print([](due))'], chips: ['min', 'max', 'len'], answer: [['min']],
          hints: ['Earlier dates are smaller.', 'min(due)'],
        },
        {
          type: 'write', text: 'Print every date in March 2024 that falls on a Sunday (weekday 6), one per line.',
          starter: ['from datetime import date, timedelta', 'd = date(2024, 3, 1)'], keys: ['while', 'd', '.month', '==', '3', ':', 'if', '.weekday()', '6', 'print', '+=', 'timedelta', '(', ')', 'days=1'],
          require: l => (has(l, /weekday\s*\(\s*\)/) && has(l, /timedelta/) ? null : 'Step through the days with timedelta and check weekday().'),
          hints: ['while d.month == 3:', '    if d.weekday() == 6: print(d) / d += timedelta(days=1)'],
          solution: ['while d.month == 3:', '    if d.weekday() == 6:', '        print(d)', '    d += timedelta(days=1)'],
        },
      ],
      learn: [{ title: 'Calendars', code: 'sorted(dates)  min(dates)  d1 < d2\nwhile d.weekday() != 4: d += timedelta(days=1)', text: 'Dates compare, sort and step like numbers.' }],
    },
    {
      id: '27-8', title: 'Dawn bats', bg: 'clocktower', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'dawnbat', hp: d0 + 31 + 29, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Dawn bats swarm the sundial! $HP HP. They fear the length of the months.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left: the days in January plus February 2024. Count from 1 January to 1 March.',
          lines: ['from datetime import date', 'gap = date(2024, 3, 1) - date(2024, [], 1)', 'cast(fireball, gap.days)'], chips: ['1', '2', '3'], answer: [['1']],
          goal: { foeDown: true },
          require: s => (s[0] === '1' ? null : 'Count from 1 January.'),
          hints: ['January is month 1.', 'date(2024, 1, 1)'],
        },
        { type: 'talk', who: 'narrator', text: 'The bat elder only wakes on Fridays!' },
        {
          type: 'write', vars: R => ({ hp: 2 * 7 }),
          spawn: v => ({ kind: 'dawnbat', hp: v.hp, tint: 'big' }),
          text: 'It has $hp HP. Step forward from 1 May 2024 to the first Friday (weekday 4), then cast icebolt twice with that day of the month plus 4.',
          starter: ['from datetime import date, timedelta', 'd = date(2024, 5, 1)'], keys: ['while', 'd', '.weekday()', '!=', '4', ':', '+=', 'timedelta', '(', ')', 'days=1', 'cast', 'icebolt', ',', '.day', '+'],
          goal: { foeDown: true },
          require: l => (has(l, /weekday\s*\(\s*\)/) ? null : 'Use weekday() to find the Friday.'),
          hints: ['while d.weekday() != 4: d += timedelta(days=1)', 'cast(icebolt, d.day + 4) twice'],
          solution: ['while d.weekday() != 4:', '    d += timedelta(days=1)', 'cast(icebolt, d.day + 4)', 'cast(icebolt, d.day + 4)'],
        },
      ],
      learn: [{ title: 'Calendar battles', code: '(date(2024, 3, 1) - date(2024, 1, 1)).days', text: 'Let datetime count the days in months for you.' }],
    },
    {
      id: '27-9', title: 'The Sun Titan', bg: 'sandtemple', foe: { kind: 'suntitan', hp: 180, weak: 'icebolt', resist: 'fireball' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'suntitan', text: 'I... AM... NOON... FOREVER...' },
        { type: 'talk', who: 'narrator', text: 'The Sun Titan has 180 HP. Icebolt cools the sun: double damage. Fireball: half.' },
        {
          type: 'predict', measure: 'damage', vars: R => ({ n: R.int(5, 12) }),
          text: 'How much damage? Icebolt is doubled.', code: ['from datetime import date, timedelta', 'later = date(2024, 1, 1) + timedelta(days=$n)', 'cast(icebolt, later.day)'],
          explain: '$n days after 1 January is the $(1 + n)th. Doubled.',
        },
        {
          type: 'fix', text: 'This should print the date like 15/01/2024. Run it, then tap the broken line.',
          code: ['from datetime import date', 'd = date(2024, 1, 15)', 'print(d.strftime("%d/%M/%Y"))', 'cast(icebolt, 10)'], bad: 2,
          options: ['print(d.strftime("%d/%m/%Y"))', 'print(d.strftime("%D/%M/%Y"))', 'print(d.strftime(%d/%m/%Y))'], answer: 0,
          explain: '%m (small m) is the month. %M (capital) means minutes!',
        },
        { type: 'talk', who: 'suntitan', text: 'READ... MY... BIRTHDAY...' },
        {
          type: 'fill', text: 'Read the Titan\'s birthday and strike with icebolt, its day of the month.',
          lines: ['from datetime import datetime', 'born = datetime.strptime("21 June 1000", "%d [] %Y")', 'cast(icebolt, born.day)'], chips: ['%B', '%m', '%b'], answer: [['%B']],
          hints: ['The month is written as a full name.', '%d %B %Y'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and icebolt is doubled. Count the days from 1 January 2024 to the date $HP // 2 + 1 days later, and cast icebolt with that count.',
          starter: ['from datetime import date, timedelta'], keys: ['start', '=', 'date', '(', ')', '2024', '1', ',', 'end', '+', 'timedelta', 'days=', '$HP', '//', '2', 'cast', 'icebolt', '-', '.days'],
          goal: { foeDown: true },
          require: l => (has(l, /\.days/) ? null : 'Subtract the dates and use .days.'),
          hints: ['start = date(2024, 1, 1) / end = start + timedelta(days=$HP // 2 + 1)', 'cast(icebolt, (end - start).days)'],
          solution: ['start = date(2024, 1, 1)', 'end = start + timedelta(days=$HP // 2 + 1)', 'cast(icebolt, (end - start).days)'],
        },
        { type: 'talk', who: 'suntitan', text: '...the... sun... sets...' },
      ],
      learn: [{ title: 'Sundial toolkit', code: 'date  datetime  timedelta  strftime  strptime', text: 'Everything from the Sundial Plaza.' }],
    },
  ],
};
WORLDS.push(WORLD27);

(() => {
  const { makeQ, pick, rnd } = Arena;
  Object.assign(Arena.GEN, {
    dates: () => { const y = pick([2023, 2024]), m = rnd(1, 12), d = rnd(1, 28); return makeQ(['from datetime import date', `print(date(${y}, ${m}, ${d}).month)`], [d, y]); },
    timedelta: () => { const n = rnd(3, 9); return makeQ(['from datetime import date, timedelta', `print(date(2024, 1, 28) + timedelta(days=${n}))`], [`2024-01-${28 + n}`, `2024-02-${String(n).padStart(2, '0')}`]); },
    datetimes: () => { const h = rnd(1, 40); return makeQ(['from datetime import timedelta', `print(timedelta(hours=${h}))`], [`${h}:00:00`, `0:${h}:00`]); },
    strftime: () => makeQ(['from datetime import date', 'print(date(2024, 7, 4).strftime("%d/%m/%Y"))'], ['07/04/2024', '2024/07/04']),
    strptime: () => makeQ(['from datetime import datetime', 'print(datetime.strptime("05/06/2024", "%d/%m/%Y").month)'], [5, 2024]),
    schedule: () => makeQ(['from datetime import date', 'print(max([date(2024, 3, 1), date(2023, 12, 31)]).year)'], [2023, 2025]),
  });
})();
