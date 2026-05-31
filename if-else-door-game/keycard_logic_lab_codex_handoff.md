# Keycard Logic Lab — Module 2 If/Else Game Handoff

## Project Purpose

**Keycard Logic Lab** is a top-down, fixed-screen arcade logic game for Module 2 of an introductory C++ course. The module topic is **if / else statements**.

The instructional goal is for students to experience this idea through gameplay:

> A condition evaluates to `true` or `false`, and that result determines which branch of code runs.

Students should not only read about conditional logic. They should **change a rule, apply it, then play-test the game behavior**.

---

## Core Design Pitch

A Doom-inspired / Smash TV-inspired top-down arcade room game.

Students move through small fixed-screen rooms. Each room contains a programming rule that controls doors, locks, alarms, rewards, or other game behavior.

The core loop is:

1. Enter a fixed-screen room.
2. Review the objective.
3. Edit a conditional rule using a structured code editor.
4. Click **Apply Rule**.
5. Play the room.
6. Touch the edge-door exit.
7. The game evaluates the condition.
8. If the condition is true, the room clears.
9. If the condition is false, the player is blocked and the else behavior runs.
10. The player can replay or continue manually.

---

## Important Design Decisions Already Made

### 1. Fixed changing screens, not scrolling

The game should use discrete rooms, similar to **Smash TV** or the original **Legend of Zelda**.

Do **not** convert this into a scrolling map.

Rationale:

- Each room can isolate one programming concept.
- The whole logic puzzle stays visible.
- Students do not waste cognitive energy navigating a large map.
- Fixed screens are easier to embed in Canvas.
- Room-by-room progression supports a module sequence.

---

### 2. Top-down arcade style

The target visual/game feel is:

> Doom keycards + Smash TV room structure + simple C++ conditional logic.

This should feel like a small retro arcade game, not a worksheet.

---

### 3. The door tile is the exit tile

This is a critical design rule.

A locked door is not a separate object placed in front of an exit. The **door tile itself** is the exit.

If the player touches a closed door tile:

- evaluate the rule
- if false: block the player
- if true: clear the room

Do not use a separate `X` tile behind the door.

Correct model:

```text
########D########
```

Where `D` is both:

- the visible door / lock
- the transition trigger

---

### 4. Manual room advance

Do not auto-advance after a timer.

When a room is cleared, show an in-game **Room Clear** overlay inside the arena.

Students should manually advance using:

- **Space**
- **Enter**
- an in-game **Continue** button

They should also be able to replay the room using:

- **R**
- an in-game **Replay Room** button

Rationale:

The moment after clearing the room is when students process:

```cpp
blueKeys >= 1
1 >= 1
true
if branch ran
```

Auto-advance would rush past the learning moment.

---

### 5. Prototype movement is grid-based; final movement may become smooth

The current prototype uses old-school grid movement similar to Zelda / StarTropics.

That is acceptable for the prototype.

For the final product, consider smooth arcade movement with tile-based collision. However, do not change this until the core systems are refactored and stable.

Final desired model:

```text
tile map = walls, doors, pickups, hazards
player = smooth x/y movement
collision = tile-based
logic = room-object / tile-object driven
```

---

## Current Prototype State

The current prototype is a single React component using Tailwind classes.

Current title:

```text
Keycard Logic Lab
```

Current module label:

```text
Module 2 · Fixed-Screen If/Else Arena
```

Current controls:

- WASD
- Arrow keys
- On-screen directional buttons
- `R` to replay room
- Space / Enter to continue after clearing a room

Current room count:

```text
4 rooms
```

---

## Current Rooms

### Room 1 — Blue Key Door

Concept:

```text
basic if
```

Objective:

```text
Grab the blue keycard, then test the door rule at the south exit.
```

Map:

```js
[
  "#################",
  "#...............#",
  "#..P....b.......#",
  "#...............#",
  "#...............#",
  "#...............#",
  "#...............#",
  "#...............#",
  "#...............#",
  "########D########",
]
```

Initial stats:

```js
{ blueKeys: 0, redKeys: 0, yellowKeys: 0, health: 100, coins: 0 }
```

Rule:

```cpp
if (blueKeys >= 1) {
    openBlueDoor();
}
else {
    keepDoorLocked();
}
```

Behavior:

- If `blueKeys >= 1` is true, the room clears.
- If false, the door blocks the player.

---

### Room 2 — Red Alarm Door

Concept:

```text
if / else
```

Objective:

```text
Open the red exit if you have the red key. Otherwise the alarm fires.
```

Map:

```js
[
  "#################",
  "#...............#",
  "#..P..r.........#",
  "#....^^^^.......#",
  "#...............#",
  "#...............#",
  "#...............#",
  "#...............#",
  "#...............#",
  "########D########",
]
```

Initial stats:

```js
{ blueKeys: 0, redKeys: 0, yellowKeys: 0, health: 100, coins: 0 }
```

Rule:

```cpp
if (redKeys >= 1) {
    openRedDoor();
}
else {
    triggerAlarm();
}
```

Behavior:

- If true, the red exit opens and the room clears.
- If false, the alarm fires and the player takes damage.

Current damage:

```js
failDamage: 10
```

---

### Room 3 — Two-Key Vault

Concept:

```text
thresholds
```

Objective:

```text
Make the vault require two yellow keys. Play-test one key vs. two keys.
```

Map:

```js
[
  "#################",
  "#...............#",
  "#..P..y.........#",
  "#...............#",
  "#.......y.......#",
  "#...............#",
  "#...............#",
  "#...............#",
  "#...............#",
  "########D########",
]
```

Initial stats:

```js
{ blueKeys: 0, redKeys: 0, yellowKeys: 0, health: 100, coins: 0 }
```

Rule:

```cpp
if (yellowKeys >= 2) {
    openVault();
}
else {
    denyAccess();
}
```

Behavior:

- With one yellow key, the vault should still be locked.
- With two yellow keys, the room clears.
- This room teaches threshold changes like `>= 1` vs. `>= 2`.

---

### Room 4 — Reward Vault

Concept:

```text
else if
```

Objective:

```text
Collect coins, apply the ladder, then test which edge door opens first.
```

Map:

```js
[
  "####N###S###G####",
  "#...............#",
  "#..P...c...c....#",
  "#...............#",
  "#..c.......c....#",
  "#...............#",
  "#...............#",
  "#...............#",
  "#...............#",
  "#################",
]
```

Initial stats:

```js
{ blueKeys: 0, redKeys: 0, yellowKeys: 0, health: 100, coins: 0 }
```

Current ladder defaults:

```js
{ first: "gold", second: "silver", gold: 3, silver: 2 }
```

Correct order:

```cpp
if (coins >= 3) {
    openGoldDoor();
}
else if (coins >= 2) {
    openSilverDoor();
}
else {
    openBronzeDoor();
}
```

Buggy order:

```cpp
if (coins >= 2) {
    openSilverDoor();
}
else if (coins >= 3) {
    openGoldDoor();
}
else {
    openBronzeDoor();
}
```

This room teaches:

> In an `else if` ladder, the first true branch wins.

---

## Tile Legend

Current tile symbols:

```text
# = wall
. = floor
P = player start; converted to floor after room load
D = conditional edge-door exit
b = blue keycard
r = red keycard
y = yellow keycard
c = coin
^ = hazard
N = bronze reward edge-door
S = silver reward edge-door
G = gold reward edge-door
```

Important:

- `D`, `N`, `S`, and `G` are not interior objects.
- They are edge-door transition tiles.
- They should normally appear embedded in the boundary wall.

---

## Rule Evaluation Model

### Door rule

Door rooms use a structured rule:

```js
{
  variable: "blueKeys",
  operator: ">=",
  value: 1
}
```

The engine evaluates:

```js
compare(stats[variable], operator, value)
```

Then displays a trace:

```text
blueKeys >= 1
1 >= 1
if branch ran
```

---

### Ladder rule

The reward room uses an `else if` ladder.

The ladder checks the first branch first, then the second branch, then the `else`.

The key learning objective is that only the **first true branch** runs.

---

## UI / UX Requirements

### Main layout

The game currently has:

- header
- stat HUD
- arena
- message box
- movement buttons
- room rule editor
- trace panel
- design notes

For Canvas, the future layout should be responsive:

- On wide screens: arena and side panel can sit side-by-side.
- On narrower Canvas embeds: stack the side panel below the game.
- Avoid horizontal scrolling.
- Keep the room-clear overlay inside the arena.

---

### Room Clear overlay

When a room clears, show an overlay inside the arena.

It should display:

- `Room Clear` or `Module Clear`
- evaluated expression
- substituted values
- selected branch
- short result message
- Continue button
- Replay button

Do not instantly advance.

---

### Trace panel

Trace should appear after the player tests a door.

Trace should include:

1. condition checked
2. substituted value
3. branch selected

Example:

```text
condition checked:
blueKeys >= 1

substitute value:
1 >= 1

branch selected:
if branch
```

---

## What Codex Should Preserve

These are non-negotiable design rules unless explicitly changed later.

1. Preserve fixed-screen room progression.
2. Do not convert to a scrolling map.
3. Preserve the edge-door model.
4. Do not reintroduce separate `X` exit tiles.
5. Preserve the edit → apply → play-test loop.
6. Preserve manual room advance.
7. Keep programming logic visible.
8. Keep each room focused on one concept.
9. Keep the game playable in a Canvas embed.
10. Keep structured rule editing for beginners; do not require raw C++ typing in early rooms.

---

## What Codex Should Do Next

### Phase 1 — Productize the prototype

Refactor the single React component into a maintainable project structure.

Suggested structure:

```text
src/
  components/
    GameArena.jsx
    Hud.jsx
    RuleEditor.jsx
    TracePanel.jsx
    RoomClearOverlay.jsx
    MovementControls.jsx
  data/
    rooms.js
    tiles.js
  engine/
    collision.js
    rules.js
    roomLoader.js
    movement.js
```

Acceptance criteria:

- Current gameplay still works after refactor.
- Room data is separated from UI components.
- Rule evaluation is separated from rendering.
- Adding a new room does not require changing core game logic.
- No behavior regressions.

---

### Phase 2 — Canvas-friendly responsiveness

Make the tool work well inside Canvas.

Tasks:

- reduce dependence on very wide layouts
- stack side panel below game on narrower widths
- prevent horizontal scroll
- keep arena readable
- keep Room Clear overlay contained in game area
- test approximate widths:
  - 800 px
  - 1000 px
  - 1200 px

---

### Phase 3 — Improve game feel

Possible improvements:

- smoother movement
- better wall collision
- locked-door bump animation
- door flash on evaluation
- key pickup animation
- alarm flash
- hazard flash
- room transition animation
- optional sound effects

Keep sound muted or easy to disable.

---

### Phase 4 — Add sprites / art direction

Replace text tiles with sprites.

Target style:

```text
8-bit / 16-bit retro sci-fi base
Doom-inspired keycards
Smash TV-inspired top-down room
red / black / steel / neon accent palette
```

Needed sprites:

- player
- floor
- wall
- blue keycard
- red keycard
- yellow keycard
- blue edge door
- red edge door
- yellow edge door
- bronze reward door
- silver reward door
- gold reward door
- coin
- hazard
- alarm effect

Sprite model should support tile states:

```text
closedBlueDoor
openBlueDoor
closedRedDoor
openRedDoor
closedYellowDoor
openYellowDoor
```

But for the current room-clear model, opening a door can simply trigger the clear overlay.

---

### Phase 5 — Add prediction prompts

This is the biggest instructional improvement.

Before testing a door, ask students to predict:

```text
Will this condition be true or false?
```

Then compare their prediction to the actual result.

This turns the game from passive play-testing into active code reasoning.

Possible data collected:

```text
prediction
actual result
correct / incorrect
room cleared
```

---

### Phase 6 — Add more rooms

Possible room sequence:

1. Basic `if`: blue key door
2. `if / else`: red alarm door
3. Threshold: two-key vault
4. Numeric comparison: health station
5. Equality / inequality: ammo or switch check
6. `else if`: bronze / silver / gold reward
7. Bug room: wrong threshold
8. Bug room: bad `else if` order
9. Bug room: assignment vs. equality, represented conceptually
10. Mastery room: several conditional rules in one room

---

### Phase 7 — Add completion summary

Optional if this becomes a Canvas assignment.

At the end, show a summary:

```text
Module 2 Logic Lab Complete

Rooms cleared: 8 / 8
Predictions correct: 7 / 8
Concepts practiced:
- if
- if / else
- else if
- comparison operators
- thresholds
- branch order
```

Add copy-to-clipboard export if useful.

---

## Known Prototype Limitations

These are acceptable for now.

1. Grid movement feels more Zelda / StarTropics than Smash TV.
2. Layout may be too wide for Canvas embeds.
3. Text tiles are placeholders for future sprites.
4. Rule editor is functional but visually basic.
5. There are only four rooms.
6. No sound or animation yet.
7. No prediction prompts yet.
8. No completion reporting yet.
9. Everything currently lives in one React file.
10. The prototype uses Tailwind utility classes directly.

---

## Suggested Codex Prompt

Use the following as a starting prompt for Codex:

```text
We have a working React prototype for a C++ Module 2 if/else game called Keycard Logic Lab. Your task is to productize it without changing the core instructional model.

Preserve these design rules:
- Fixed-screen room progression, not scrolling.
- Top-down arcade layout inspired by Smash TV and Doom keycard logic.
- A door tile is the exit tile. Do not use separate X exit tiles.
- Students edit a structured conditional rule, click Apply Rule, then play-test the room.
- Successful exits show an in-game Room Clear overlay. Do not auto-advance.
- Space/Enter continues after room clear; R replays the current room.
- Each room should focus on one programming concept.
- Keep the tool Canvas-friendly and avoid horizontal scrolling.

First, refactor the single React component into a maintainable project structure:
components, data, and engine logic. Preserve all current behavior. After refactoring, test that all four rooms still work:
1. Blue key door
2. Red alarm door
3. Two-key yellow vault
4. Reward vault else-if ladder

Do not add major new gameplay systems until the refactor is stable.
```

---

## Current Prototype Learning Goals

By the end of the current prototype, students should be able to explain:

1. A condition evaluates to `true` or `false`.
2. An `if` branch runs only when the condition is true.
3. An `else` branch runs when the `if` condition is false.
4. Changing a comparison threshold changes game behavior.
5. An `else if` ladder checks conditions in order.
6. In an `else if` ladder, the first true branch wins.
7. Program behavior depends on variable values at the moment the condition is checked.

---

## Future Name Options

Current name:

```text
Keycard Logic Lab
```

Other possible names:

```text
If/Else Arena
Branch Blaster
Logic Lockdown
Access Granted
Conditional Carnage
Decision Dungeon
```

Current recommendation:

```text
Keycard Logic Lab
```

It clearly connects the game mechanic to the learning goal.
