import { useEffect, useMemo, useRef, useState } from "react";

const characterTypes = ["Warrior", "Mage", "Rogue", "Unknown"];
const previewGenders = ["Male", "Female"];
const genderSymbols = {
  Male: "♂",
  Female: "♀",
};

const frameWidth = 256;
const frameHeight = 256;
const previewScale = 2;
const idleFrameDurationMs = 220;
const openIdleFrames = [0, 2];
const blinkFrame = 1;
const minOpenFramesBetweenBlinks = 3;
const randomExtraOpenFrames = 5;
const spriteSheetPath = "./spritesheet.png";

const spriteFrames = {
  warrior: {
    male: [
      { x: 69, y: 29, width: 160, height: 212 },
      { x: 283, y: 28, width: 160, height: 214 },
      { x: 494, y: 28, width: 161, height: 214 },
    ],
    female: [
      { x: 839, y: 25, width: 153, height: 216 },
      { x: 1055, y: 26, width: 151, height: 215 },
      { x: 1269, y: 25, width: 154, height: 216 },
    ],
  },
  mage: {
    male: [
      { x: 53, y: 274, width: 174, height: 211 },
      { x: 273, y: 274, width: 167, height: 211 },
      { x: 486, y: 274, width: 167, height: 211 },
    ],
    female: [
      { x: 821, y: 283, width: 171, height: 202 },
      { x: 1039, y: 283, width: 168, height: 202 },
      { x: 1255, y: 283, width: 167, height: 202 },
    ],
  },
  rogue: {
    male: [
      { x: 80, y: 514, width: 165, height: 211 },
      { x: 294, y: 515, width: 167, height: 211 },
      { x: 508, y: 515, width: 164, height: 210 },
    ],
    female: [
      { x: 847, y: 516, width: 161, height: 209 },
      { x: 1063, y: 516, width: 161, height: 209 },
      { x: 1278, y: 516, width: 160, height: 209 },
    ],
  },
  unknown: {
    male: [
      { x: 80, y: 747, width: 137, height: 224 },
      { x: 295, y: 747, width: 136, height: 224 },
      { x: 509, y: 747, width: 134, height: 224 },
    ],
    female: [
      { x: 856, y: 757, width: 118, height: 213 },
      { x: 1072, y: 756, width: 118, height: 215 },
      { x: 1288, y: 757, width: 117, height: 213 },
    ],
  },
};

const spriteAnimationBoxes = Object.fromEntries(
  Object.entries(spriteFrames).map(([className, genderGroups]) => [
    className,
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

function CharacterSpritePreview({ selectedClass, gender }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const animationRef = useRef(null);
  const currentFrameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const openFrameCursorRef = useRef(0);
  const openFramesUntilBlinkRef = useRef(minOpenFramesBetweenBlinks);

  useEffect(() => {
    const spriteSheet = new Image();
    spriteSheet.src = spriteSheetPath;
    imageRef.current = spriteSheet;

    return () => {
      imageRef.current = null;
    };
  }, []);

  useEffect(() => {
    const draw = (time) => {
      const canvas = canvasRef.current;
      const spriteSheet = imageRef.current;
      const ctx = canvas?.getContext("2d");

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

      const classKey = selectedClass.toLowerCase();
      const genderKey = gender.toLowerCase();

      const measuredFrame = spriteFrames[classKey][genderKey][currentFrameRef.current];
      const animationBox = spriteAnimationBoxes[classKey][genderKey];
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
  }, [gender, selectedClass]);

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
                  <div className="sprite-frame">
                    <CharacterSpritePreview selectedClass={previewClass} gender={previewGender} />
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
