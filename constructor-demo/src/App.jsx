import { useEffect, useMemo, useState } from "react";

const mapWidth = 10;
const mapHeight = 7;
const firstWalkableRow = 1;
const moveDurationMs = 220;
const npcStepIntervalMs = 900;

const characterTypes = ["Warrior", "Mage", "Rogue", "Unknown"];
const genders = ["Male", "Female", "NonBinary"];
const genderSymbols = {
  Male: "\u2642",
  Female: "\u2640",
  NonBinary: "\u263f",
};
const skinTones = [
  { id: "Light", label: "Light", swatch: "#f2c59f" },
  { id: "Tan", label: "Tan", swatch: "#9b5a2e" },
  { id: "DarkBrown", label: "Dark Brown", swatch: "#4a2415" },
];

const typeDetails = {
  Warrior: { accent: "#dc4545", health: 120 },
  Mage: { accent: "#7557d6", health: 90 },
  Rogue: { accent: "#25845f", health: 100 },
  Unknown: { accent: "#a16207", health: 100 },
};

const skinToneVariantMap = {
  Light: "white",
  Tan: "tan",
  DarkBrown: "black",
};

const characterTypeSpriteMap = {
  Warrior: "warrior",
  Mage: "mage",
  Rogue: "rogue",
  Unknown: "townsperson",
};

function getSpriteConfig(characterType) {
  return {
    imagePath: `${import.meta.env.BASE_URL}sprites/${characterTypeSpriteMap[characterType]}/`,
    className: characterTypeSpriteMap[characterType],
    normalizedFrameWidth: 128,
    normalizedFrameHeight: 128,
    variantRows: {
      Male: ["male_white", "male_tan", "male_black"],
      Female: ["female_white", "female_tan", "female_black"],
      NonBinary: ["nonbinary_white", "nonbinary_tan", "nonbinary_black"],
    },
    skinToneVariantMap,
    renderer: "sliced-png-frames",
  };
}

const baseSpriteConfig = {
  frameWidth: 32,
  frameHeight: 32,
  directions: {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  },
  framesPerDirection: 3,
};

const directions = {
  ArrowUp: { direction: "up", dx: 0, dy: -1 },
  KeyW: { direction: "up", dx: 0, dy: -1 },
  ArrowDown: { direction: "down", dx: 0, dy: 1 },
  KeyS: { direction: "down", dx: 0, dy: 1 },
  ArrowLeft: { direction: "left", dx: -1, dy: 0 },
  KeyA: { direction: "left", dx: -1, dy: 0 },
  ArrowRight: { direction: "right", dx: 1, dy: 0 },
  KeyD: { direction: "right", dx: 1, dy: 0 },
};

const movementOptions = [
  { direction: "up", dx: 0, dy: -1 },
  { direction: "down", dx: 0, dy: 1 },
  { direction: "left", dx: -1, dy: 0 },
  { direction: "right", dx: 1, dy: 0 },
];

function Window({ title, subtitle, children, className = "" }) {
  return (
    <section className={`window ${className}`}>
      <div className="titlebar">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="window-body">{children}</div>
    </section>
  );
}

function Button({ children, onClick, variant = "default", type = "button", disabled = false }) {
  return (
    <button className={`button ${variant}`} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

class Character {
  constructor(name, characterType, gender, skinTone, health, level, tileX, tileY, spriteConfig) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.characterType = characterType;
    this.gender = gender;
    this.skinTone = skinTone;
    this.health = health;
    this.level = level;
    this.tileX = tileX;
    this.tileY = tileY;
    this.renderX = tileX;
    this.renderY = tileY;
    this.direction = "down";
    this.animationFrame = 0;
    this.isMoving = false;
    this.spriteConfig = { ...baseSpriteConfig, ...spriteConfig };
  }
}

function spriteVariant(character) {
  const gender = character.gender.toLowerCase();
  const skin = skinToneVariantMap[character.skinTone] ?? "tan";
  return `${gender}_${skin}`;
}

function spriteFramePath(character) {
  const className = character.spriteConfig?.className ?? characterTypeSpriteMap[character.characterType];
  const frame = Math.max(0, Math.min(character.animationFrame ?? 0, baseSpriteConfig.framesPerDirection - 1));

  return `${import.meta.env.BASE_URL}sprites/${className}/${spriteVariant(character)}/walk_${character.direction}_${frame}.png`;
}

function cppVariableName(character) {
  if (!character) {
    return "hero";
  }

  const cleanedName = character.name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .map((part, index) => (index === 0 ? part.toLowerCase() : part[0].toUpperCase() + part.slice(1)))
    .join("");

  return cleanedName || character.characterType.toLowerCase();
}

function constructorCall(character, mode) {
  if (!character) {
    return mode === "default"
      ? "Character defaultCharacter;"
      : 'Character warrior("Ari",\n                  CharacterType::Warrior,\n                  Gender::NonBinary,\n                  SkinTone::Tan,\n                  120,\n                  1);';
  }

  if (character.constructorMode === "default") {
    return "Character defaultCharacter;";
  }

  return `Character ${cppVariableName(character)}("${character.name}",\n` +
    `                  CharacterType::${character.characterType},\n` +
    `                  Gender::${character.gender},\n` +
    `                  SkinTone::${character.skinTone},\n` +
    `                  ${character.health},\n` +
    `                  ${character.level});`;
}

function initializerList(mode) {
  if (mode === "default") {
    return `Character::Character()\n` +
      `    : name("Unknown Hero"),\n` +
      `      characterType(CharacterType::Unknown),\n` +
      `      gender(Gender::NonBinary),\n` +
      `      skinTone(SkinTone::Tan),\n` +
      `      health(100),\n` +
      `      level(1) {\n` +
      `}`;
  }

  return `Character::Character(std::string newName,\n` +
    `                     CharacterType newType,\n` +
    `                     Gender newGender,\n` +
    `                     SkinTone newSkinTone,\n` +
    `                     int newHealth,\n` +
    `                     int newLevel)\n` +
    `    : name(newName),\n` +
    `      characterType(newType),\n` +
    `      gender(newGender),\n` +
    `      skinTone(newSkinTone),\n` +
    `      health(newHealth),\n` +
    `      level(newLevel) {\n` +
    `}`;
}

function isOccupied(characters, tileX, tileY) {
  return characters.some((character) => character.tileX === tileX && character.tileY === tileY);
}

function isWalkableTile(tileX, tileY) {
  return tileX >= 0 && tileY >= firstWalkableRow && tileX < mapWidth && tileY < mapHeight;
}

function isTypingTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  );
}

function findOpenSpawnTile(characters) {
  const preferredTiles = [
    [2, 3],
    [3, 3],
    [2, 4],
    [3, 4],
    [4, 3],
    [1, 3],
    [5, 3],
    [2, 2],
    [2, 5],
  ];

  for (const [tileX, tileY] of preferredTiles) {
    if (!isOccupied(characters, tileX, tileY)) {
      return { tileX, tileY };
    }
  }

  for (let tileY = firstWalkableRow; tileY < mapHeight; tileY += 1) {
    for (let tileX = 0; tileX < mapWidth; tileX += 1) {
      if (isWalkableTile(tileX, tileY) && !isOccupied(characters, tileX, tileY)) {
        return { tileX, tileY };
      }
    }
  }

  return null;
}

function createDefaultCharacter(characters) {
  const spawn = findOpenSpawnTile(characters);
  if (!spawn) {
    return null;
  }

  const character = new Character(
    "Unknown Hero",
    "Unknown",
    "NonBinary",
    "Tan",
    100,
    1,
    spawn.tileX,
    spawn.tileY,
    getSpriteConfig("Unknown"),
  );
  character.constructorMode = "default";
  return character;
}

function createCustomCharacter({ name, characterType, gender, skinTone, health, level }, characters) {
  const spawn = findOpenSpawnTile(characters);
  if (!spawn) {
    return null;
  }

  const character = new Character(
    name.trim() || "Unknown Hero",
    characterType,
    gender,
    skinTone,
    Number(health) || typeDetails[characterType].health,
    Number(level) || 1,
    spawn.tileX,
    spawn.tileY,
    getSpriteConfig(characterType),
  );
  character.constructorMode = "custom";
  return character;
}

function CharacterSquare({ character, selected, onClick }) {
  return (
    <button
      aria-label={`${character.name}, ${character.characterType}, tile ${character.tileX}, ${character.tileY}`}
      className={`map-character ${selected ? "selected" : ""} ${character.isMoving ? "moving" : ""} ${
        character.isDespawning ? "despawning" : ""
      }`}
      style={{
        "--frame": character.animationFrame,
        transform: `translate(${character.renderX * 100}%, ${character.renderY * 100}%)`,
      }}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        if (!character.isDespawning) {
          onClick(character.id);
        }
      }}
    >
      <span className="map-nameplate">{character.name}</span>
      <img alt="" className="map-sprite-image" src={spriteFramePath(character)} />
    </button>
  );
}

export default function App() {
  const [constructorMode, setConstructorMode] = useState("custom");
  const [draftName, setDraftName] = useState("Ari");
  const [draftType, setDraftType] = useState("Warrior");
  const [draftGender, setDraftGender] = useState("NonBinary");
  const [draftSkinTone, setDraftSkinTone] = useState("Tan");
  const [draftHealth, setDraftHealth] = useState(120);
  const [draftLevel, setDraftLevel] = useState(1);
  const [characters, setCharacters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [clickMode, setClickMode] = useState("delete");
  const [npcMovementEnabled, setNpcMovementEnabled] = useState(true);
  const [message, setMessage] = useState("Click a constructor button to create a Character object.");
  const [trace, setTrace] = useState([
    "No active Character objects yet.",
    "Constructor calls will push new objects into the active array.",
  ]);

  const selectedCharacter = characters.find((character) => character.id === selectedId) ?? null;
  const activeConstructorMode = selectedCharacter?.constructorMode ?? constructorMode;

  useEffect(() => {
    function handleKeyDown(event) {
      if (isTypingTarget(event.target)) {
        return;
      }

      const movement = directions[event.code];
      if (!movement || !selectedId) {
        return;
      }

      event.preventDefault();

      const selectedCharacter = characters.find((character) => character.id === selectedId);
      if (!selectedCharacter || selectedCharacter.isMoving || selectedCharacter.isDespawning) {
        return;
      }

      const destinationX = selectedCharacter.tileX + movement.dx;
      const destinationY = selectedCharacter.tileY + movement.dy;

      if (!isWalkableTile(destinationX, destinationY)) {
        const nextFacing = { ...selectedCharacter, direction: movement.direction };

        setCharacters((currentCharacters) =>
          currentCharacters.map((character) => (character.id === selectedId ? nextFacing : character)),
        );
        setMessage(`${selectedCharacter.name} faced ${movement.direction}, but the wall stopped movement.`);
        setTrace([
          `${selectedCharacter.name}.direction = "${movement.direction}";`,
          destinationY < firstWalkableRow ? "Destination was in the keep-out wall row." : "Destination was outside the tile map.",
          "The object stayed on a walkable tile.",
        ]);
        return;
      }

      const nextCharacter = {
        ...selectedCharacter,
        tileX: destinationX,
        tileY: destinationY,
        renderX: destinationX,
        renderY: destinationY,
        direction: movement.direction,
        animationFrame: (selectedCharacter.animationFrame + 1) % selectedCharacter.spriteConfig.framesPerDirection,
        isMoving: true,
      };

      setCharacters((currentCharacters) =>
        currentCharacters.map((character) => (character.id === selectedId ? nextCharacter : character)),
      );
      setMessage(`${nextCharacter.name} moved ${movement.direction} to tile (${nextCharacter.tileX}, ${nextCharacter.tileY}).`);
      setTrace([
        `selectedCharacter.move("${movement.direction}");`,
        `tileX: ${nextCharacter.tileX}`,
        `tileY: ${nextCharacter.tileY}`,
        "The object still exists, and its state changed over time.",
      ]);

      window.setTimeout(() => {
        setCharacters((currentCharacters) =>
          currentCharacters.map((character) =>
            character.id === selectedId ? { ...character, animationFrame: 2 } : character,
          ),
        );
      }, moveDurationMs / 2);

      window.setTimeout(() => {
        setCharacters((currentCharacters) =>
          currentCharacters.map((character) =>
            character.id === selectedId ? { ...character, animationFrame: 0, isMoving: false } : character,
          ),
        );
      }, moveDurationMs);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [characters, selectedId]);

  useEffect(() => {
    if (!npcMovementEnabled) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const movedIds = [];

      setCharacters((currentCharacters) =>
        currentCharacters.map((character) => {
          if (character.id === selectedId || character.isMoving || character.isDespawning || Math.random() > 0.48) {
            return character;
          }

          const movement = movementOptions[Math.floor(Math.random() * movementOptions.length)];
          const destinationX = character.tileX + movement.dx;
          const destinationY = character.tileY + movement.dy;

          if (!isWalkableTile(destinationX, destinationY)) {
            return { ...character, direction: movement.direction };
          }

          movedIds.push(character.id);
          return {
            ...character,
            tileX: destinationX,
            tileY: destinationY,
            renderX: destinationX,
            renderY: destinationY,
            direction: movement.direction,
            animationFrame: 1,
            isMoving: true,
          };
        }),
      );

      window.setTimeout(() => {
        setCharacters((currentCharacters) =>
          currentCharacters.map((character) =>
            movedIds.includes(character.id) ? { ...character, animationFrame: 2 } : character,
          ),
        );
      }, moveDurationMs / 2);

      window.setTimeout(() => {
        setCharacters((currentCharacters) =>
          currentCharacters.map((character) =>
            movedIds.includes(character.id) ? { ...character, animationFrame: 0, isMoving: false } : character,
          ),
        );
      }, moveDurationMs);
    }, npcStepIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [npcMovementEnabled, selectedId]);

  function spawnDefault() {
    const character = createDefaultCharacter(characters);
    if (!character) {
      setMessage("No open spawn tile is available.");
      return;
    }

    setCharacters((currentCharacters) => [...currentCharacters, character]);
    setSelectedId(character.id);
    setConstructorMode("default");
    setMessage(`${character.name} was constructed with default private data.`);
    setTrace([
      "Character defaultCharacter;",
      "characters.push(defaultCharacter);",
      "Default constructor values initialized the object.",
    ]);
  }

  function spawnCustom() {
    const character = createCustomCharacter(
      {
        name: draftName,
        characterType: draftType,
        gender: draftGender,
        skinTone: draftSkinTone,
        health: draftHealth,
        level: draftLevel,
      },
      characters,
    );

    if (!character) {
      setMessage("No open spawn tile is available.");
      return;
    }

    setCharacters((currentCharacters) => [...currentCharacters, character]);
    setSelectedId(character.id);
    setConstructorMode("custom");
    setMessage(`${character.name} was constructed and added to the map.`);
    setTrace([
      constructorCall(character, "custom"),
      "characters.push(newCharacter);",
      "The constructor initialized every private field at creation time.",
    ]);
  }

  function handleCharacterClick(id) {
    const target = characters.find((character) => character.id === id);
    if (!target) {
      return;
    }

    if (clickMode === "select") {
      setSelectedId(id);
      setMessage(`${target.name} is selected. Move with Arrow keys or WASD.`);
      setTrace([
        `selectedCharacter = ${target.name};`,
        "Only the selected object responds to keyboard movement.",
      ]);
      return;
    }

    setCharacters((currentCharacters) =>
      currentCharacters.map((character) =>
        character.id === id ? { ...character, animationFrame: 1, isDespawning: true, isMoving: false } : character,
      ),
    );
    setSelectedId((currentSelectedId) => {
      if (currentSelectedId !== id) {
        return currentSelectedId;
      }

      const nextCharacter = characters.find((character) => character.id !== id && !character.isDespawning);
      return nextCharacter?.id ?? null;
    });
    setMessage(`${target.name} has left the party.`);
    setTrace([
      "Character::~Character()",
      `std::cout << "${target.name} has left the party." << std::endl;`,
      "The sprite plays a warp-out animation.",
      "The object is removed from the active character array after the animation.",
    ]);

    window.setTimeout(() => {
      setCharacters((currentCharacters) => currentCharacters.filter((character) => character.id !== id));
    }, 680);
  }

  function selectFromList(id) {
    const character = characters.find((item) => item.id === id);
    setSelectedId(id);
    setMessage(`${character.name} is selected. Move with Arrow keys or WASD.`);
  }

  const previewCharacter = useMemo(
    () =>
      selectedCharacter ?? {
        name: draftName.trim() || "Unknown Hero",
        characterType: draftType,
        gender: draftGender,
        skinTone: draftSkinTone,
        health: Number(draftHealth) || typeDetails[draftType].health,
        level: Number(draftLevel) || 1,
        tileX: 0,
        tileY: 0,
        direction: "down",
        animationFrame: 0,
        isMoving: false,
        isDespawning: false,
        constructorMode,
      },
    [constructorMode, draftGender, draftHealth, draftLevel, draftName, draftSkinTone, draftType, selectedCharacter],
  );

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Guided Practice 2</p>
          <h1>Character Constructor Demo</h1>
          <p>
            Choose constructor values, create Character objects on a tile map, move the selected object,
            then click a square to trigger the destructor-style lifecycle message.
          </p>
        </div>
        <div className="hero-counter">
          <span>{characters.length}</span>
          <strong>active objects</strong>
        </div>
      </header>

      <main className="layout">
        <section className="left-stack">
          <Window title="Constructor Controls" subtitle="Create objects with initialized private data">
            <div className="mode-row" role="tablist" aria-label="Constructor mode">
              <button
                aria-pressed={constructorMode === "custom"}
                className={constructorMode === "custom" ? "tab active" : "tab"}
                type="button"
                onClick={() => setConstructorMode("custom")}
              >
                Overloaded
              </button>
              <button
                aria-pressed={constructorMode === "default"}
                className={constructorMode === "default" ? "tab active" : "tab"}
                type="button"
                onClick={() => setConstructorMode("default")}
              >
                Default
              </button>
            </div>

            {constructorMode === "custom" ? (
              <div className="constructor-form">
                <div className="control-cluster identity-cluster">
                  <span className="cluster-label">Identity</span>
                  <label>
                    Name
                    <input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
                  </label>
                  <label>
                    Type
                    <select
                      value={draftType}
                      onChange={(event) => {
                        const nextType = event.target.value;
                        setDraftType(nextType);
                        setDraftHealth(typeDetails[nextType].health);
                      }}
                    >
                      {characterTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="control-cluster appearance-cluster">
                  <span className="cluster-label">Appearance</span>
                  <div className="field-group">
                    <span className="field-label">Gender</span>
                    <div className="symbol-toggle" role="radiogroup" aria-label="Gender">
                      {genders.map((gender) => (
                        <button
                          aria-label={gender}
                          aria-pressed={draftGender === gender}
                          className={draftGender === gender ? "symbol-button active" : "symbol-button"}
                          key={gender}
                          title={gender}
                          type="button"
                          onClick={() => setDraftGender(gender)}
                        >
                          {genderSymbols[gender]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field-group">
                    <span className="field-label">Skin tone</span>
                    <div className="swatch-group" role="radiogroup" aria-label="Skin tone">
                      {skinTones.map((skinTone) => (
                        <button
                          aria-label={skinTone.label}
                          aria-pressed={draftSkinTone === skinTone.id}
                          className={draftSkinTone === skinTone.id ? "swatch-button active" : "swatch-button"}
                          key={skinTone.id}
                          style={{ "--swatch": skinTone.swatch }}
                          title={skinTone.label}
                          type="button"
                          onClick={() => setDraftSkinTone(skinTone.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="control-cluster stat-cluster">
                  <span className="cluster-label">Stats</span>
                  <label>
                    Health
                    <input
                      min="1"
                      max="200"
                      type="number"
                      value={draftHealth}
                      onChange={(event) => setDraftHealth(event.target.value)}
                    />
                  </label>
                  <label>
                    Level
                    <input
                      min="1"
                      max="99"
                      type="number"
                      value={draftLevel}
                      onChange={(event) => setDraftLevel(event.target.value)}
                    />
                  </label>
                </div>

                <Button variant="primary" onClick={spawnCustom}>
                  Character(...)
                </Button>
              </div>
            ) : (
              <div className="default-card">
                <dl>
                  <div>
                    <dt>name</dt>
                    <dd>Unknown Hero</dd>
                  </div>
                  <div>
                    <dt>type</dt>
                    <dd>Unknown</dd>
                  </div>
                  <div>
                    <dt>gender</dt>
                    <dd>NonBinary</dd>
                  </div>
                  <div>
                    <dt>skinTone</dt>
                    <dd>Tan</dd>
                  </div>
                  <div>
                    <dt>health</dt>
                    <dd>100</dd>
                  </div>
                  <div>
                    <dt>level</dt>
                    <dd>1</dd>
                  </div>
                </dl>
                <Button variant="primary" onClick={spawnDefault}>
                  Character defaultCharacter
                </Button>
              </div>
            )}
          </Window>

          <Window title="Character Object" subtitle="Selected object private state">
            <div className="snes-status-card" style={{ "--accent": typeDetails[previewCharacter.characterType].accent }}>
              <div className="snes-nameplate">
                <span>{previewCharacter.name}</span>
                <span className="nameplate-class">{previewCharacter.characterType}</span>
                <strong>LV {previewCharacter.level}</strong>
              </div>

              <div className="snes-card-body">
                <div className="sprite-column">
                  <div className="sprite-stage">
                    <div className="sprite-frame">
                      <img
                        alt={`${previewCharacter.name} ${previewCharacter.characterType}`}
                        className="preview-sprite-image"
                        src={spriteFramePath(previewCharacter)}
                      />
                    </div>
                  </div>
                </div>

                <div className="character-info">
                  <div className="hp-row">
                    <span className="menu-label">HP</span>
                    <div className="health-shell" aria-label={`Health ${previewCharacter.health}`}>
                      <div className="health-fill" style={{ width: `${Math.min(previewCharacter.health, 120) / 1.2}%` }} />
                    </div>
                    <strong>{previewCharacter.health}</strong>
                  </div>

                  <div className="snes-stat-grid">
                    <div>
                      <span className="menu-label">GENDER</span>
                      <strong className="gender-symbol">{genderSymbols[previewCharacter.gender]}</strong>
                    </div>
                    <div>
                      <span className="menu-label">SKIN</span>
                      <strong>{previewCharacter.skinTone}</strong>
                    </div>
                    <div>
                      <span className="menu-label">TILE</span>
                      <strong>
                        {selectedCharacter ? `(${selectedCharacter.tileX}, ${selectedCharacter.tileY})` : "not spawned"}
                      </strong>
                    </div>
                    <div>
                      <span className="menu-label">FACING</span>
                      <strong>{previewCharacter.direction}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="snes-footer">
                <span>{selectedCharacter ? "Character object" : "Constructor preview"}</span>
                <span>{selectedCharacter ? "private data" : "not in array yet"}</span>
              </div>
            </div>
          </Window>

          <Window title="Active Character Array" subtitle="Source of truth for rendered objects">
            {characters.length > 0 ? (
              <div className="character-list">
                {characters.map((character) => (
                  <button
                    className={character.id === selectedId ? "list-item active" : "list-item"}
                    key={character.id}
                    type="button"
                    onClick={() => selectFromList(character.id)}
                  >
                    <span>{character.name}</span>
                    <strong>{character.characterType}</strong>
                    <em>
                      ({character.tileX}, {character.tileY})
                    </em>
                  </button>
                ))}
              </div>
            ) : (
              <p className="empty-state">characters = []</p>
            )}
          </Window>
        </section>

        <section className="right-stack">
          <Window title="Tile Map" subtitle="Arrow keys or WASD move the selected object one tile at a time">
            <div className="toolbar">
              <div className="mode-row compact" aria-label="Map click behavior">
                <button
                  aria-pressed={clickMode === "delete"}
                  className={clickMode === "delete" ? "tab active danger" : "tab"}
                  type="button"
                  onClick={() => setClickMode("delete")}
                >
                  Click = destructor
                </button>
                <button
                  aria-pressed={clickMode === "select"}
                  className={clickMode === "select" ? "tab active" : "tab"}
                  type="button"
                  onClick={() => setClickMode("select")}
                >
                  Click = select
                </button>
              </div>
              <button
                aria-pressed={npcMovementEnabled}
                className={npcMovementEnabled ? "tab active" : "tab"}
                type="button"
                onClick={() => setNpcMovementEnabled((enabled) => !enabled)}
              >
                NPC wander
              </button>
              <output className="message-line">{message}</output>
            </div>
            <div
              className="map-board"
              style={{
                "--map-width": mapWidth,
                "--map-height": mapHeight,
                "--map-background": `url("${import.meta.env.BASE_URL}backgrounds/background-constructor.png")`,
              }}
              onClick={() => setMessage("Click a character square, not an empty tile.")}
            >
              {Array.from({ length: mapWidth * mapHeight }, (_, index) => (
                <div className="map-tile" key={index} />
              ))}
              <div className="character-layer">
                {characters.map((character) => (
                  <CharacterSquare
                    character={character}
                    key={character.id}
                    selected={character.id === selectedId}
                    onClick={handleCharacterClick}
                  />
                ))}
              </div>
            </div>
          </Window>

          <div className="split">
            <Window title="Constructor Call" subtitle="The code that created the current object">
              <pre className="code-window">
                <code>{constructorCall(selectedCharacter ?? previewCharacter, activeConstructorMode)}</code>
              </pre>
            </Window>

            <Window title="Initializer List" subtitle="Private fields initialized as the object is born">
              <pre className="code-window">
                <code>{initializerList(activeConstructorMode)}</code>
              </pre>
            </Window>
          </div>

          <Window title="Lifecycle Trace" subtitle="Constructor, movement state, destructor">
            <ol className="trace-list">
              {trace.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </Window>
        </section>
      </main>
    </div>
  );
}
