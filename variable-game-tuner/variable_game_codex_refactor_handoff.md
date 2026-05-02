# Variable Game Tuner — Codex Refactor Handoff

## Project Summary

This project is a React-based teaching demo for introductory programming students. The goal is to help students understand variables by letting them edit a small C++- or Java-style variable file and immediately see those variables affect a playable mini-game.

The current prototype is a single React component that includes:

- a code editor textarea
- C++ / Java declaration style toggle
- parser for beginner-friendly variable declarations
- a playable canvas game
- player movement with WASD / arrow keys
- Space / J sword attack
- coins, enemies, health, score, shield, and win/loss logic
- a variable watch panel
- challenge prompts
- shape-based rendering with a future sprite path

The next task is **not** to add sprites yet. The next task is to refactor the prototype into a maintainable project structure, add better instructional comments, and prepare the rendering architecture for later sprites.

---

## Current State to Preserve

Do not remove or break these features:

### Core UI

- Two-column layout
- Left panel: editable code window
- Right panel: playable game pane
- Variable Watch panel
- Try This challenge panel
- Compiler-ish feedback area
- C++ / Java toggle
- Apply Variables button
- Reset Code button
- Start/Pause button
- Reset Game button

### Supported Languages

The demo supports two declaration styles:

1. C++-style include file
2. Java-style `GameVariables` class

C++ should remain the default.

### Current C++ Variable Style

```cpp
// game_variables.h
// This is not the whole game.
// Imagine this file is included by the larger game engine.
// Change the values below, then click Apply Variables.

string playerName = "Ada";
char playerIcon = '@';

int playerHealth = 3;
double playerSpeed = 4.0;

int coinValue = 10;
int coinCount = 8;

int enemyCount = 4;
double enemySpeed = 1.5;
int enemyHealth = 1;

bool swordEnabled = true;
int swordDamage = 1;
double swordRange = 42.0;
double attackCooldown = 0.5;

bool shieldEnabled = false;
```

### Current Java Variable Style

```java
// GameVariables.java
// This is not the whole game.
// Java does not use C++-style header files, so this version uses a small class.
// Imagine the larger game engine reads these static fields.
// Change the values below, then click Apply Variables.

public class GameVariables {
    static String playerName = "Ada";
    static char playerIcon = '@';

    static int playerHealth = 3;
    static double playerSpeed = 4.0;

    static int coinValue = 10;
    static int coinCount = 8;

    static int enemyCount = 4;
    static double enemySpeed = 1.5;
    static int enemyHealth = 1;

    static boolean swordEnabled = true;
    static int swordDamage = 1;
    static double swordRange = 42.0;
    static double attackCooldown = 0.5;

    static boolean shieldEnabled = false;
}
```

### Current Game Controls

- Move: WASD or arrow keys
- Attack: Space or J
- Player faces the last movement direction
- Sword hitbox appears in the facing direction
- Enemies are damaged by the sword
- Enemies disappear when health reaches zero
- Coins increase score
- Player loses health when colliding with enemies
- Shield can block the first hit when enabled

### Current Variables

| Variable | Type | Purpose |
|---|---|---|
| `playerName` | string / String | Name shown in HUD |
| `playerIcon` | char | Character drawn on shape-based player |
| `playerHealth` | int | Starting player health |
| `playerSpeed` | double | Player movement speed |
| `coinValue` | int | Score gained per coin |
| `coinCount` | int | Number of coins spawned |
| `enemyCount` | int | Number of enemies spawned |
| `enemySpeed` | double | Enemy movement speed |
| `enemyHealth` | int | Health each enemy starts with |
| `swordEnabled` | bool / boolean | Enables or disables sword attack |
| `swordDamage` | int | Damage dealt per attack |
| `swordRange` | double | Sword attack reach |
| `attackCooldown` | double | Seconds between attacks |
| `shieldEnabled` | bool / boolean | Enables first-hit shield |

---

## Primary Refactor Goal

Refactor the current single-file React prototype into a maintainable multi-file structure.

The refactor should preserve existing behavior first. Do not add major new features until the refactor is complete and working.

The major goal is separation of concerns:

> Parser logic, game simulation logic, rendering logic, UI components, configuration data, and generated student code should not all live in one React component.

---

## Recommended File Structure

Use this structure or something very close to it.

```text
src/
  App.jsx
  main.jsx

  data/
    defaultConfig.js
    variableRules.js
    languageDefinitions.js
    challenges.js

  codegen/
    generateCode.js
    codeComments.js

  parser/
    parseVariableFile.js
    parseValue.js
    normalizeType.js

  game/
    constants.js
    createInitialGameState.js
    updateGameState.js
    collision.js
    input.js

  renderers/
    renderGame.js
    shapeRenderer.js
    spriteRenderer.js
    rendererUtils.js

  components/
    AppHeader.jsx
    CodeEditorPanel.jsx
    FeedbackPanel.jsx
    GamePanel.jsx
    VariableWatch.jsx
    ChallengePanel.jsx
    RetroWindow.jsx
    RetroButton.jsx

  styles/
    retro.css
```

If the project is TypeScript, use `.tsx` / `.ts`; otherwise plain `.jsx` / `.js` is fine.

The current prototype is plain React/JavaScript, so JavaScript is acceptable.

---

## Refactor Boundaries

### Do refactor

- Split the large component into modules.
- Keep the current game behavior working.
- Keep the current parser behavior working.
- Keep C++ as the default language.
- Keep Java mode as a class with static fields.
- Keep shape rendering as the default renderer.
- Add a renderer interface so sprites can be added later.
- Add meaningful comments in the source code where they explain design decisions.
- Add student-facing comments in generated C++/Java code.
- Add a modern retro desktop UI theme.

### Do not refactor yet

- Do not add actual sprite files.
- Do not add real code execution.
- Do not support arbitrary student-created variables.
- Do not add arrays, functions, expressions, loops, or objects to the parser.
- Do not make this a full IDE.
- Do not overbuild the game engine.

---

## Source Code Comment Expectations

The implementation should model good professional comments.

Use comments to explain:

- why the parser is intentionally limited
- why student code is parsed but never executed
- why game config and game state are separate
- why rendering is separated from game logic
- how the language toggle affects generated code and parsing
- why values are clamped
- how the attack cooldown works
- how keyboard input avoids interfering with the code editor
- how shape rendering will later fall back from sprite rendering

Avoid noisy comments that simply repeat the code.

Bad comment:

```js
// Add one to x
x = x + 1;
```

Better comment:

```js
// The parser accepts only simple declarations so students can focus on variables,
// not the full syntax rules of C++ or Java.
```

---

## Student-Facing Code Comment Requirements

Improve the generated C++ and Java code so it models good beginner-friendly comments.

Each variable should have a concise comment explaining what it controls in the game.

### C++ example

```cpp
// The name shown in the game HUD.
string playerName = "Ada";

// A single character drawn on the player in shape mode.
char playerIcon = '@';

// How many hits the player can take before losing.
int playerHealth = 3;

// How fast the player moves around the room.
double playerSpeed = 4.0;
```

### Java example

```java
public class GameVariables {
    // The name shown in the game HUD.
    static String playerName = "Ada";

    // A single character drawn on the player in shape mode.
    static char playerIcon = '@';

    // How many hits the player can take before losing.
    static int playerHealth = 3;
}
```

Comments should be helpful but not excessive.

---

## Parser Requirements

The parser should remain deliberately limited.

### Supported C++ declaration forms

```cpp
string playerName = "Ada";
char playerIcon = '@';
int playerHealth = 3;
double playerSpeed = 4.0;
bool shieldEnabled = true;
```

### Supported Java declaration forms

```java
static String playerName = "Ada";
static char playerIcon = '@';
static int playerHealth = 3;
static double playerSpeed = 4.0;
static boolean shieldEnabled = true;
```

The Java parser should also tolerate visibility modifiers if present:

```java
public static int playerHealth = 3;
private static double playerSpeed = 4.0;
```

The Java parser should ignore the class wrapper:

```java
public class GameVariables {
}
```

### Unsupported on purpose

The parser should reject:

- missing semicolons
- unknown variables
- unsupported types
- `float` for now
- multiple declarations on one line
- expressions such as `2 + 1`
- function calls
- arrays
- objects
- comments at the end of a declaration, unless easy to support safely

Supporting trailing comments is optional. If implemented, this should work:

```cpp
int playerHealth = 3; // starting health
```

But it is acceptable to skip this in the first refactor.

---

## Validation and Clamping

Keep the current variable constraints.

| Variable | Min | Max |
|---|---:|---:|
| `playerHealth` | 1 | 20 |
| `playerSpeed` | 1.0 | 12.0 |
| `coinValue` | 1 | 1000 |
| `coinCount` | 1 | 30 |
| `enemyCount` | 0 | 20 |
| `enemySpeed` | 0.0 | 8.0 |
| `enemyHealth` | 1 | 10 |
| `swordDamage` | 1 | 10 |
| `swordRange` | 15.0 | 95.0 |
| `attackCooldown` | 0.1 | 3.0 |

If a value is outside the range, clamp it and show a warning.

Example:

```text
Line 12: 'enemyCount' was set to 999, but the game limits it to 20.
```

---

## Game Logic Requirements

Move all game logic out of the React component.

Recommended files:

```text
game/createInitialGameState.js
game/updateGameState.js
game/collision.js
game/constants.js
```

### Game state should include

```js
{
  player: {
    x,
    y,
    radius,
    health,
    invincibleUntil,
    shieldUsed,
    facing,
  },
  enemies: [
    {
      id,
      x,
      y,
      radius,
      health,
      vx,
      vy,
    }
  ],
  coins: [
    {
      id,
      x,
      y,
      radius,
    }
  ],
  attack: {
    activeUntil,
    cooldownUntil,
    direction,
  },
  score,
  elapsed,
  running,
  gameOver,
  win,
}
```

### Game update should handle

- movement
- facing direction
- enemy movement and wall bounce
- attack input
- attack cooldown
- attack hitbox
- enemy damage
- coin collection
- shield use
- enemy collision damage
- win condition
- loss condition

---

## Input Handling Requirements

Keep input handling in React or a custom hook, but isolate it from UI rendering.

Recommended:

```text
game/useGameInput.js
```

Input should track:

- held movement keys
- queued attack request

Important behavior:

> Keyboard controls must not steal keystrokes while the user is typing in the code editor.

The current prototype already checks for textarea/input/select/contenteditable targets. Preserve that behavior.

---

## Renderer Requirements

Do not add actual sprites yet.

Create a rendering abstraction that makes sprites easy to add later.

Recommended files:

```text
renderers/renderGame.js
renderers/shapeRenderer.js
renderers/spriteRenderer.js
renderers/rendererUtils.js
```

### renderGame responsibilities

`renderGame` should coordinate the drawing order:

1. background / floor
2. HUD strip
3. coins
4. active attack effect
5. enemies
6. player
7. pause/win/loss overlay

### shapeRenderer responsibilities

`shapeRenderer` should preserve the current visuals:

- gradient background
- subtle grid
- diamond coins
- rectangle sword hitbox
- red circle enemies
- blue/green circle player
- shield ring
- HUD text

### spriteRenderer responsibilities for later

Create the file now, but it may simply call the shape renderer as a fallback.

Add comments explaining that later it will:

- draw player sprites based on facing direction
- mirror side-facing sprites for left movement
- rotate one sword sprite based on facing direction
- animate coins
- animate enemies
- fall back to shapes if assets are missing

Do not add sprite files in this refactor.

---

## Retro Desktop UI Requirements

Restyle the UI after the refactor is stable.

The design should feel like:

> modern retro classroom software

Avoid directly copying any specific operating system.

### Visual requirements

- major panels should look like faux desktop windows
- each faux window should have a title bar
- title bars should contain panel titles, such as:
  - `game_variables.h`
  - `Game Pane`
  - `Variable Watch`
  - `Compiler-ish Feedback`
  - `Try This`
- use beveled borders
- use chunky buttons
- use crisp black/gray borders
- keep code editor dark and readable
- maintain high contrast
- preserve responsive layout for Canvas embedding

### Suggested reusable components

```text
components/RetroWindow.jsx
components/RetroButton.jsx
```

### Suggested RetroWindow API

```jsx
<RetroWindow title="Code Window" subtitle="Editing: game_variables.h">
  ...content...
</RetroWindow>
```

### Suggested RetroButton API

```jsx
<RetroButton variant="primary" onClick={applyVariables}>
  Apply Variables
</RetroButton>
```

---

## Component Requirements

### App.jsx

Should coordinate:

- language state
- config state
- code text state
- parser feedback
- game state refs
- high-level layout

But it should not contain:

- parser internals
- collision math
- rendering details
- long generated code templates
- large blocks of repeated panel markup

### CodeEditorPanel.jsx

Props might include:

```js
{
  language,
  fileName,
  code,
  onCodeChange,
  onApply,
  onResetCode,
}
```

### FeedbackPanel.jsx

Props might include:

```js
{
  status,
  errors,
  warnings,
}
```

### GamePanel.jsx

Props might include:

```js
{
  canvasRef,
  gameSnapshot,
  onToggleRunning,
  onResetGame,
}
```

### VariableWatch.jsx

Props might include:

```js
{
  config,
}
```

### ChallengePanel.jsx

Props might include:

```js
{
  challenges,
}
```

---

## Acceptance Criteria

The refactor is successful if:

1. The app still loads.
2. C++ mode is still the default.
3. Java mode still generates a `GameVariables` class.
4. The code editor is still editable.
5. Apply Variables still updates the game.
6. Invalid code still produces friendly errors.
7. Out-of-range values still clamp and warn.
8. WASD / arrow movement still works.
9. Space / J sword attack still works.
10. Typing in the code editor does not move or attack in the game.
11. Coins can still be collected.
12. Enemies can still damage the player.
13. Sword attacks can still defeat enemies.
14. Shield still blocks the first hit when enabled.
15. Variable Watch still updates after applying code.
16. The code is split into clear modules.
17. Shape renderer remains the default.
18. Sprite renderer file exists as a future extension point.
19. UI uses the new retro desktop style.
20. Generated student code includes helpful comments above variables.

---

## Suggested Codex Prompt

Copy/paste this into Codex:

```text
Refactor the current Variable Game Tuner React prototype into a maintainable multi-file project.

Context:
This is a teaching demo for introductory programming students. Students edit a small C++- or Java-style variable file and then see those variables affect a playable canvas game. C++ should remain the default. Java mode should generate a small GameVariables class with static fields.

Important:
Do not add sprites yet. Keep shape-based rendering as the default. Create a sprite renderer extension point, but it can fall back to the shape renderer for now.

Preserve existing behavior:
- editable code window
- C++ / Java toggle
- Apply Variables
- Reset Code
- Start/Pause
- Reset Game
- Variable Watch
- Try This challenge panel
- parser for int, double, string/String, char, bool/boolean
- Java static field declarations
- player movement with WASD/arrow keys
- Space/J sword attack
- coins, enemies, health, shield, score, win/loss logic
- keyboard controls should not fire while typing in the code editor

Refactor into modules:
- data/defaultConfig.js
- data/variableRules.js
- data/languageDefinitions.js
- data/challenges.js
- codegen/generateCode.js
- parser/parseVariableFile.js
- parser/parseValue.js
- parser/normalizeType.js
- game/constants.js
- game/createInitialGameState.js
- game/updateGameState.js
- game/collision.js
- renderers/renderGame.js
- renderers/shapeRenderer.js
- renderers/spriteRenderer.js
- components/AppHeader.jsx
- components/CodeEditorPanel.jsx
- components/FeedbackPanel.jsx
- components/GamePanel.jsx
- components/VariableWatch.jsx
- components/ChallengePanel.jsx
- components/RetroWindow.jsx
- components/RetroButton.jsx
- styles/retro.css

Add student-facing comments in the generated C++ and Java code. Each variable should have a short comment explaining what it controls in the game.

Add source-code comments where they explain design decisions, especially:
- why the parser is intentionally limited
- why student code is parsed but never executed
- why game config and game state are separate
- why rendering is separated from game logic
- why the shape renderer remains as fallback

Restyle the UI with a modern retro desktop classroom software aesthetic:
- faux desktop windows
- title bars
- beveled borders
- chunky buttons
- crisp panel divisions
- dark readable code editor
- high contrast
- responsive enough for Canvas embedding

Acceptance criteria:
The app should run after the refactor and preserve all current functionality. Do not change the teaching purpose. Do not add actual sprites yet.
```

---

## Recommended Codex Workflow

Ask Codex to work in checkpoints.

### Checkpoint 1

Refactor parser, data, and code generation.

### Checkpoint 2

Refactor game logic and rendering.

### Checkpoint 3

Refactor React UI components.

### Checkpoint 4

Add generated code comments.

### Checkpoint 5

Apply retro desktop UI styling.

### Checkpoint 6

Run/build/test and fix regressions.

This is safer than asking Codex to do everything in one giant pass.

---

## Notes for Stephen

Sprites are intentionally excluded from this refactor.

The goal of this Codex pass is to turn the current successful prototype into a maintainable foundation. Once the structure is clean, later work becomes much easier:

- sprite rendering
- asset loading
- animation
- sound effects
- additional challenge missions
- Canvas embedding polish
- worksheet/reflection integration

The most important thing is not to let the project become a full game engine. It should remain a focused teaching tool about variables.

