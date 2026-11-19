# Script & Sorcery

A pixel RPG that teaches Python. Spells are real Python code: 18 worlds from `print()` to
generators, 168 levels, review bosses, an endless Tower and a hard mode. The questions are
rebuilt every time you play, so replays never repeat exactly.

## Play

Play at **https://mramos-14.github.io/script-and-sorcery/**. On an Android phone, open it in Chrome and use
⋮ → **Install app** (or Add to Home screen). It then opens full-screen and works offline.

## Updates and your save

Your progress is saved in the browser, tied to the address you play at. Every update is
published to the same address, so your save carries over automatically.

To move progress between devices or addresses (for example from the old Claude link),
use **Back up save** on the title screen, copy the code, then **Restore save** on the other one.

## Run it on your own computer

Needs Python 3. From this folder:

```
python serve.py
```

Then open http://localhost:5252. The server also prints an address for a phone on the same Wi-Fi.
To update a downloaded copy, `git pull` (or download the ZIP again). Playing at the same
localhost address keeps your save.

## For development

```
node tools/check-levels.js      # plays every level across 40 random variants
node tools/check-arena.js       # checks the Training-grounds questions
node tools/diff-python.js 2     # compares the game's Python with real Python
node tools/fuzz.js              # makes sure broken spells never crash the game
python tools/build_site.py      # builds the site into _site/
```
