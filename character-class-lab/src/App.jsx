import { useEffect, useMemo, useRef, useState } from "react";

const characterTypes = ["Warrior", "Mage", "Rogue", "Unknown"];
const previewGenders = ["Male", "Female", "NonBinary"];
const genderSymbols = {
  Male: "\u2642",
  Female: "\u2640",
  NonBinary: "\u263f",
};
const skinTones = [
  { id: "light", label: "Light", swatch: "#f2c59f" },
  { id: "tan", label: "Tan", swatch: "#9b5a2e" },
  { id: "dark", label: "Dark Brown", swatch: "#4a2415" },
];

const frameWidth = 256;
const frameHeight = 256;
const previewScale = 2;
const idleFrameDurationMs = 220;
const openIdleFrames = [0, 2];
const blinkFrame = 1;
const minOpenFramesBetweenBlinks = 3;
const randomExtraOpenFrames = 5;
const classSpriteSheets = {
  warrior: "./warriors-sprites.png",
  mage: "./mage-sprites.png",
  rogue: "./rogues-sprites.png",
  unknown: "./unknowns-sprites.png",
};

function buildStableClassFrames() {
  const columnCenters = [125, 340, 550, 850, 1050, 1260, 1540, 1754, 1974];
  const genderStart = { male: 0, female: 3, nonbinary: 6 };
  const rowSlots = {
    light: { y: 0, height: 240 },
    tan: { y: 240, height: 234 },
    dark: { y: 474, height: 250 },
  };
  const slotWidth = 240;

  return Object.fromEntries(
    skinTones.map((skinTone) => [
      skinTone.id,
      Object.fromEntries(
        Object.entries(genderStart).map(([gender, startIndex]) => [
          gender,
          [0, 1, 2].map((frameIndex) => ({
            x: Math.round(columnCenters[startIndex + frameIndex] - slotWidth / 2),
            y: rowSlots[skinTone.id].y,
            width: slotWidth,
            height: rowSlots[skinTone.id].height,
          })),
        ]),
      ),
    ]),
  );
}

function buildMageSpriteFrames() {
  const frames = buildStableClassFrames();
  const mageRowCrop = {
    light: { y: 23, height: 226 },
    tan: { y: 265, height: 222 },
    dark: { y: 494, height: 227 },
  };
  const mageMeasuredFrames = {
    light: {
      male: [
        { x: 48, y: 25, width: 176, height: 215 },
        { x: 244, y: 24, width: 192, height: 225 },
        { x: 457, y: 25, width: 187, height: 224 },
      ],
      female: [
        { x: 764, y: 24, width: 182, height: 225 },
        { x: 964, y: 23, width: 188, height: 226 },
        { x: 1171, y: 24, width: 182, height: 226 },
      ],
      nonbinary: [
        { x: 1466, y: 26, width: 177, height: 223 },
        { x: 1662, y: 25, width: 181, height: 223 },
        { x: 1865, y: 25, width: 181, height: 223 },
      ],
    },
    tan: {
      male: [
        { x: 46, y: 266, width: 179, height: 221 },
        { x: 243, y: 266, width: 193, height: 221 },
        { x: 457, y: 267, width: 187, height: 220 },
      ],
      female: [
        { x: 765, y: 267, width: 181, height: 220 },
        { x: 965, y: 266, width: 187, height: 221 },
        { x: 1172, y: 267, width: 181, height: 220 },
      ],
      nonbinary: [
        { x: 1466, y: 266, width: 177, height: 220 },
        { x: 1663, y: 265, width: 179, height: 221 },
        { x: 1866, y: 266, width: 180, height: 220 },
      ],
    },
    dark: {
      male: [
        { x: 24, y: 549, width: 220, height: 170 },
        { x: 230, y: 502, width: 220, height: 218 },
        { x: 452, y: 549, width: 220, height: 171 },
      ],
      female: [
        { x: 765, y: 502, width: 181, height: 217 },
        { x: 966, y: 502, width: 186, height: 217 },
        { x: 1172, y: 503, width: 181, height: 216 },
      ],
      nonbinary: [
        { x: 1466, y: 495, width: 183, height: 224 },
        { x: 1663, y: 494, width: 185, height: 225 },
        { x: 1866, y: 495, width: 189, height: 224 },
      ],
    },
  };

  for (const [skinTone, genderGroups] of Object.entries(mageMeasuredFrames)) {
    for (const [gender, measuredFrames] of Object.entries(genderGroups)) {
      frames[skinTone][gender] = measuredFrames.map((frame) => ({
        ...frame,
        y: mageRowCrop[skinTone].y,
        height: mageRowCrop[skinTone].height,
      }));
    }
  }

  return frames;
}

function buildRogueSpriteFrames() {
  const rogueRowCrop = {
    light: { y: 18, height: 228 },
    tan: { y: 257, height: 227 },
    dark: { y: 492, height: 227 },
  };
  const slotWidth = 210;
  const centers = {
    male: [134, 347, 558],
    female: [850, 1066, 1285],
    nonbinary: {
      light: [1580, 1794, 2005],
      tan: [1580, 1794, 2005],
      dark: [1580, 1794, 2005],
    },
  };

  return Object.fromEntries(
    skinTones.map((skinTone) => [
      skinTone.id,
      Object.fromEntries(
        ["male", "female", "nonbinary"].map((gender) => {
          const frameCenters = gender === "nonbinary" ? centers.nonbinary[skinTone.id] : centers[gender];

          return [
            gender,
            frameCenters.map((centerX) => ({
              x: Math.round(centerX - slotWidth / 2),
              y: rogueRowCrop[skinTone.id].y,
              width: slotWidth,
              height: rogueRowCrop[skinTone.id].height,
            })),
          ];
        }),
      ),
    ]),
  );
}

function buildUnknownSpriteFrames() {
  const unknownRowCrop = {
    light: { y: 22, height: 218 },
    tan: { y: 240, height: 234 },
    dark: { y: 474, height: 236 },
  };
  const slotWidth = 160;
  const centers = {
    male: [141, 339, 538],
    female: [843, 1043, 1243],
    nonbinary: [1565, 1765, 1972],
  };

  return Object.fromEntries(
    skinTones.map((skinTone) => [
      skinTone.id,
      Object.fromEntries(
        Object.entries(centers).map(([gender, frameCenters]) => [
          gender,
          frameCenters.map((centerX) => ({
            x: Math.round(centerX - slotWidth / 2),
            y: unknownRowCrop[skinTone.id].y,
            width: slotWidth,
            height: unknownRowCrop[skinTone.id].height,
          })),
        ]),
      ),
    ]),
  );
}

const classSpriteFrames = {
  warrior: {
    light: {
      male: [
        { x: 44, y: 12, width: 158, height: 221 },
        { x: 251, y: 12, width: 158, height: 221 },
        { x: 456, y: 12, width: 157, height: 221 },
      ],
      female: [
        { x: 748, y: 14, width: 158, height: 218 },
        { x: 970, y: 13, width: 157, height: 219 },
        { x: 1191, y: 14, width: 153, height: 218 },
      ],
      nonbinary: [
        { x: 1487, y: 18, width: 154, height: 214 },
        { x: 1711, y: 18, width: 153, height: 214 },
        { x: 1934, y: 18, width: 152, height: 214 },
      ],
    },
    tan: {
      male: [
        { x: 44, y: 245, width: 158, height: 221 },
        { x: 251, y: 244, width: 158, height: 222 },
        { x: 456, y: 245, width: 157, height: 221 },
      ],
      female: [
        { x: 747, y: 247, width: 158, height: 219 },
        { x: 968, y: 247, width: 157, height: 219 },
        { x: 1187, y: 247, width: 156, height: 219 },
      ],
      nonbinary: [
        { x: 1488, y: 252, width: 153, height: 214 },
        { x: 1711, y: 252, width: 152, height: 214 },
        { x: 1934, y: 252, width: 151, height: 214 },
      ],
    },
    dark: {
      male: [
        { x: 44, y: 480, width: 158, height: 224 },
        { x: 251, y: 479, width: 158, height: 225 },
        { x: 456, y: 480, width: 157, height: 224 },
      ],
      female: [
        { x: 748, y: 491, width: 158, height: 213 },
        { x: 960, y: 482, width: 167, height: 221 },
        { x: 1185, y: 482, width: 160, height: 222 },
      ],
      nonbinary: [
        { x: 1486, y: 491, width: 155, height: 213 },
        { x: 1708, y: 491, width: 156, height: 212 },
        { x: 1932, y: 480, width: 155, height: 224 },
      ],
    },
  },
  mage: buildMageSpriteFrames(),
  rogue: buildRogueSpriteFrames(),
  unknown: buildUnknownSpriteFrames(),
};
const classAnimationBoxes = Object.fromEntries(
  Object.entries(classSpriteFrames).map(([className, skinToneGroups]) => [
    className,
    Object.fromEntries(
      Object.entries(skinToneGroups).map(([skinTone, genderGroups]) => [
        skinTone,
        Object.fromEntries(
          Object.entries(genderGroups).map(([gender, frames]) => [
            gender,
            {
              width: Math.max(...frames.map((frame) => frame.width)),
              height: Math.max(...frames.map((frame) => frame.height)),
            },
          ]),
        ),
      ]),
    ),
  ]),
);
const typeDetails = {
  Warrior: {
    accent: "#dc4545",
  },
  Mage: {
    accent: "#7557d6",
  },
  Rogue: {
    accent: "#25845f",
  },
  Unknown: {
    accent: "#a16207",
  },
};

const initialCharacter = {
  name: "Unnamed",
  type: "Unknown",
  health: 100,
  level: 1,
};

const sourceFiles = {
  "Character.h": `#ifndef CHARACTER_H
#define CHARACTER_H

#include <string>

enum class CharacterType
{
    Warrior,
    Mage,
    Rogue,
    Unknown
};

std::string characterTypeToString(CharacterType type);

class Character
{
private:
    std::string name = "Unnamed";
    CharacterType type = CharacterType::Unknown;
    int health = 100;
    int level = 1;

public:
    void setName(const std::string& newName);
    void setType(CharacterType newType);

    void takeDamage(int amount);
    void heal(int amount);

    std::string getName() const;
    CharacterType getType() const;
    int getHealth() const;
    int getLevel() const;
    bool isAlive() const;

    void displayStatus() const;
};

#endif`,
  "Character.cpp": `#include "Character.h"
#include <iostream>

void Character::setName(const std::string& newName)
{
    if (!newName.empty())
    {
        name = newName;
    }
}

void Character::setType(CharacterType newType)
{
    type = newType;
}

void Character::takeDamage(int amount)
{
    if (amount > 0)
    {
        health -= amount;

        if (health < 0)
        {
            health = 0;
        }
    }
}

void Character::heal(int amount)
{
    if (amount > 0)
    {
        health += amount;

        if (health > 100)
        {
            health = 100;
        }
    }
}

std::string Character::getName() const
{
    return name;
}

CharacterType Character::getType() const
{
    return type;
}

int Character::getHealth() const
{
    return health;
}

int Character::getLevel() const
{
    return level;
}

bool Character::isAlive() const
{
    return health > 0;
}`,
  "main.cpp": `#include <iostream>
#include "Character.h"

int main()
{
    Character hero;

    hero.setName("Rin");
    hero.setType(CharacterType::Warrior);

    hero.displayStatus();

    hero.takeDamage(35);
    hero.displayStatus();

    hero.heal(20);
    hero.displayStatus();

    hero.takeDamage(200);
    hero.displayStatus();

    return 0;
}`,
};

function isAlive(character) {
  return character.health > 0;
}

function clampHealth(value) {
  return Math.max(0, Math.min(100, value));
}

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

function Button({ children, onClick, variant = "default", type = "button" }) {
  return (
    <button className={`button ${variant}`} type={type} onClick={onClick}>
      {children}
    </button>
  );
}

function nextBlinkDelay() {
  return minOpenFramesBetweenBlinks + Math.floor(Math.random() * (randomExtraOpenFrames + 1));
}

function CharacterSpritePreview({ selectedClass, gender, skinTone }) {
  const canvasRef = useRef(null);
  const imageRefs = useRef({});
  const animationRef = useRef(null);
  const currentFrameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const openFrameCursorRef = useRef(0);
  const openFramesUntilBlinkRef = useRef(minOpenFramesBetweenBlinks);

  useEffect(() => {
    imageRefs.current = Object.fromEntries(
      Object.entries(classSpriteSheets).map(([className, path]) => {
        const image = new Image();
        image.src = path;
        return [className, image];
      }),
    );

    return () => {
      imageRefs.current = {};
    };
  }, []);

  useEffect(() => {
    const draw = (time) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const classKey = selectedClass.toLowerCase();
      const genderKey = gender.toLowerCase();
      const spriteSheet = imageRefs.current[classKey];

      if (!canvas || !ctx || !spriteSheet?.complete) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      if (time - lastFrameTimeRef.current > idleFrameDurationMs) {
        if (openFramesUntilBlinkRef.current <= 0) {
          currentFrameRef.current = blinkFrame;
          openFramesUntilBlinkRef.current = nextBlinkDelay();
        } else {
          currentFrameRef.current = openIdleFrames[openFrameCursorRef.current];
          openFrameCursorRef.current = (openFrameCursorRef.current + 1) % openIdleFrames.length;
          openFramesUntilBlinkRef.current -= 1;
        }
        lastFrameTimeRef.current = time;
      }

      const frameSet = classSpriteFrames[classKey][skinTone][genderKey];
      const animationBox = classAnimationBoxes[classKey][skinTone][genderKey];
      const measuredFrame = frameSet[currentFrameRef.current];
      const drawWidth = measuredFrame.width * previewScale;
      const drawHeight = measuredFrame.height * previewScale;
      const animationBoxWidth = animationBox.width * previewScale;
      const animationBoxHeight = animationBox.height * previewScale;
      const animationBoxX = (canvas.width - animationBoxWidth) / 2;
      const animationBoxY = (canvas.height - animationBoxHeight) / 2;
      const drawX = animationBoxX + (animationBoxWidth - drawWidth) / 2;
      const drawY = animationBoxY + (animationBoxHeight - drawHeight);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      // This sheet has transparent padding, but the visible sprites are not
      // aligned to exact 256px column starts. These measured source rectangles
      // slice the actual frames. A shared animation box keeps sizing stable,
      // and bottom alignment keeps the character's feet planted.
      ctx.drawImage(
        spriteSheet,
        measuredFrame.x,
        measuredFrame.y,
        measuredFrame.width,
        measuredFrame.height,
        drawX,
        drawY,
        drawWidth,
        drawHeight,
      );

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gender, selectedClass, skinTone]);

  return (
    <canvas
      ref={canvasRef}
      className="sprite-canvas"
      width={frameWidth * previewScale}
      height={frameHeight * previewScale}
      aria-label={`${gender} ${selectedClass} idle animation`}
    />
  );
}

export default function App() {
  const [character, setCharacter] = useState(initialCharacter);
  const [draftName, setDraftName] = useState("Rin");
  const [draftType, setDraftType] = useState("Warrior");
  const [previewClass, setPreviewClass] = useState("Warrior");
  const [previewGender, setPreviewGender] = useState("Male");
  const [previewSkinTone, setPreviewSkinTone] = useState("light");
  const [amount, setAmount] = useState(35);
  const [activeFile, setActiveFile] = useState("Character.h");
  const [trace, setTrace] = useState([
    "Character hero; created one object from the Character class.",
    "Private data starts with the default values from Character.h.",
  ]);
  const [accessorResult, setAccessorResult] = useState("Click an accessor to see the returned value.");

  const healthPercent = character.health;
  const details = typeDetails[previewClass];

  const displayStatus = useMemo(
    () => [
      `Character: ${character.name}`,
      `Type:      ${character.type}`,
      `Health:    ${character.health}`,
      `Level:     ${character.level}`,
      `Alive:     ${isAlive(character) ? "Yes" : "No"}`,
    ],
    [character],
  );

  function setName() {
    const before = character.name;
    const nextName = draftName.trim();

    if (!nextName) {
      setTrace([
        `hero.setName("${draftName}");`,
        "newName.empty() was true, so the private name field did not change.",
      ]);
      return;
    }

    setCharacter((current) => ({ ...current, name: nextName }));
    setTrace([
      `hero.setName("${nextName}");`,
      `name was "${before}".`,
      `name is now "${nextName}".`,
      "The mutator changed private data through the public interface.",
    ]);
  }

  function setType() {
    const before = character.type;
    setCharacter((current) => ({ ...current, type: draftType }));
    setPreviewClass(draftType);
    setTrace([
      `hero.setType(CharacterType::${draftType});`,
      `type was CharacterType::${before}.`,
      `type is now CharacterType::${draftType}.`,
      "The sprite changes because the object's type changed.",
    ]);
  }

  function takeDamage() {
    const numericAmount = Number(amount);
    const before = character.health;

    if (numericAmount <= 0) {
      setTrace([
        `hero.takeDamage(${numericAmount});`,
        "amount > 0 was false, so health did not change.",
      ]);
      return;
    }

    const rawHealth = before - numericAmount;
    const nextHealth = clampHealth(rawHealth);
    setCharacter((current) => ({ ...current, health: nextHealth }));
    setTrace([
      `hero.takeDamage(${numericAmount});`,
      `health was ${before}.`,
      `health -= amount gives ${rawHealth}.`,
      rawHealth < 0 ? "health dropped below 0, so the method clamped it to 0." : "health stayed within range.",
      `isAlive() now returns ${nextHealth > 0 ? "true" : "false"}.`,
    ]);
  }

  function heal() {
    const numericAmount = Number(amount);
    const before = character.health;

    if (numericAmount <= 0) {
      setTrace([`hero.heal(${numericAmount});`, "amount > 0 was false, so health did not change."]);
      return;
    }

    const rawHealth = before + numericAmount;
    const nextHealth = clampHealth(rawHealth);
    setCharacter((current) => ({ ...current, health: nextHealth }));
    setTrace([
      `hero.heal(${numericAmount});`,
      `health was ${before}.`,
      `health += amount gives ${rawHealth}.`,
      rawHealth > 100 ? "health went above 100, so the method clamped it to 100." : "health stayed within range.",
      `isAlive() now returns ${nextHealth > 0 ? "true" : "false"}.`,
    ]);
  }

  function runAccessor(name) {
    const values = {
      getName: `"${character.name}"`,
      getType: `CharacterType::${character.type}`,
      getHealth: String(character.health),
      getLevel: String(character.level),
      isAlive: isAlive(character) ? "true" : "false",
    };
    setAccessorResult(`hero.${name}() returned ${values[name]};`);
    setTrace([
      `hero.${name}();`,
      "An accessor reads private data without changing the object.",
      `Returned value: ${values[name]}`,
    ]);
  }

  function runDisplayStatus() {
    setAccessorResult("hero.displayStatus() printed the current object state.");
    setTrace(["hero.displayStatus();", "The method prints a report using the object's current private data."]);
  }

  function reset() {
    setCharacter(initialCharacter);
    setDraftName("Rin");
    setDraftType("Warrior");
    setPreviewClass("Warrior");
    setPreviewGender("Male");
    setPreviewSkinTone("light");
    setAmount(35);
    setAccessorResult("Click an accessor to see the returned value.");
    setTrace(["Character hero; created one object from the Character class.", "The object is back to its defaults."]);
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Level 2 C++</p>
          <h1>Character Class Lab</h1>
          <p>
            Use the public methods from the course Character class and watch one object's private data
            change.
          </p>
        </div>
      </header>

      <main className="layout">
        <section className="left-stack">
          <Window title="Character Object" subtitle="Private state shown as a game status card">
            <div className="snes-status-card" style={{ "--accent": details.accent }}>
              <div className="snes-nameplate">
                <span>{character.name}</span>
                <span className="nameplate-class">{previewClass}</span>
                <strong>LV {character.level}</strong>
              </div>

              <div className="snes-card-body">
                <div className="sprite-column">
                  <div className="sprite-picker-row">
                    <div className="skin-tone-toggle" aria-label="Warrior skin tone">
                      {skinTones.map((skinTone) => (
                        <button
                          aria-label={skinTone.label}
                          aria-pressed={previewSkinTone === skinTone.id}
                          className={previewSkinTone === skinTone.id ? "swatch-button active" : "swatch-button"}
                          key={skinTone.id}
                          style={{ "--swatch": skinTone.swatch }}
                          title={skinTone.label}
                          type="button"
                          onClick={() => setPreviewSkinTone(skinTone.id)}
                        />
                      ))}
                    </div>
                    <div className="sprite-frame">
                      <CharacterSpritePreview
                        gender={previewGender}
                        selectedClass={previewClass}
                        skinTone={previewSkinTone}
                      />
                    </div>
                  </div>
                  <div className="gender-toggle" aria-label="Sprite gender">
                    {previewGenders.map((gender) => (
                      <button
                        aria-pressed={previewGender === gender}
                        className={previewGender === gender ? "symbol-button active" : "symbol-button"}
                        key={gender}
                        title={gender}
                        type="button"
                        onClick={() => setPreviewGender(gender)}
                      >
                        {genderSymbols[gender]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="character-info">
                  <div className="hp-row">
                    <span className="menu-label">HP</span>
                    <div className="health-shell" aria-label={`Health ${character.health} out of 100`}>
                      <div className="health-fill" style={{ width: `${healthPercent}%` }} />
                    </div>
                    <strong>{character.health}/100</strong>
                  </div>

                  <div className="snes-stat-grid">
                    <div>
                      <span className="menu-label">ALIVE</span>
                      <strong>{isAlive(character) ? "YES" : "NO"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="snes-footer">
                <span>Character hero</span>
                <span>private data</span>
              </div>
            </div>
          </Window>

          <Window title="Mutators" subtitle="Public methods that can change private data">
            <div className="control-grid">
              <label>
                New name
                <input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
              </label>
              <Button variant="primary" onClick={setName}>
                hero.setName(...)
              </Button>
              <label>
                New type
                <select value={draftType} onChange={(event) => setDraftType(event.target.value)}>
                  {characterTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <Button variant="primary" onClick={setType}>
                hero.setType(...)
              </Button>
              <label>
                Amount
                <input
                  min="-50"
                  max="250"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>
              <div className="button-pair">
                <Button onClick={takeDamage}>takeDamage</Button>
                <Button onClick={heal}>heal</Button>
              </div>
            </div>
          </Window>

          <Window title="Accessors" subtitle="Public methods that read private data">
            <div className="accessor-grid">
              {["getName", "getType", "getHealth", "getLevel", "isAlive"].map((name) => (
                <Button key={name} onClick={() => runAccessor(name)}>
                  {name}()
                </Button>
              ))}
              <Button variant="primary" onClick={runDisplayStatus}>
                displayStatus()
              </Button>
            </div>
            <output className="accessor-output">{accessorResult}</output>
          </Window>
        </section>

        <section className="right-stack">
          <Window title="Course Code" subtitle="The demo follows this Character class">
            <div className="tabs" role="tablist" aria-label="Source files">
              {Object.keys(sourceFiles).map((fileName) => (
                <button
                  className={fileName === activeFile ? "tab active" : "tab"}
                  key={fileName}
                  type="button"
                  onClick={() => setActiveFile(fileName)}
                >
                  {fileName}
                </button>
              ))}
            </div>
            <pre className="code-window">
              <code>{sourceFiles[activeFile]}</code>
            </pre>
          </Window>

          <div className="split">
            <Window title="Trace" subtitle="What just happened">
              <ol className="trace-list">
                {trace.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </Window>

            <Window title="displayStatus()" subtitle="Console-style output">
              <pre className="status-output">{displayStatus.join("\n")}</pre>
              <Button onClick={reset}>Reset Object</Button>
            </Window>
          </div>
        </section>
      </main>
    </div>
  );
}





