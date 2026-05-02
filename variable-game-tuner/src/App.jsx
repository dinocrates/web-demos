import { useEffect, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { ChallengePanel } from "./components/ChallengePanel";
import { CodeEditorPanel } from "./components/CodeEditorPanel";
import { GamePanel } from "./components/GamePanel";
import { VariableWatch } from "./components/VariableWatch";
import { generateCode } from "./codegen/generateCode";
import { challenges } from "./data/challenges";
import { defaultConfig } from "./data/defaultConfig";
import { languageDefinitions } from "./data/languageDefinitions";
import { createInitialGameState } from "./game/createInitialGameState";
import { updateGameState } from "./game/updateGameState";
import { parseVariableFile } from "./parser/parseVariableFile";
import { renderGame } from "./renderers/renderGame";

const typeMap = languageDefinitions;

export default function VariableGameTunerPrototype() {
  const [language, setLanguage] = useState("cpp");
  const [config, setConfig] = useState(defaultConfig);
  const [code, setCode] = useState(() => generateCode(defaultConfig, "cpp"));
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([
    "Use WASD or arrow keys to move. Press Space or J to swing the sword."
  ]);
  const [status, setStatus] = useState("Default C++ variables loaded.");
  const [gameSnapshot, setGameSnapshot] = useState(() => createInitialGameState(defaultConfig));

  const canvasRef = useRef(null);
  const keysRef = useRef(new Set());
  const attackQueuedRef = useRef(false);
  const configRef = useRef(config);
  const gameRef = useRef(gameSnapshot);
  const lastTimeRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    gameRef.current = gameSnapshot;
  }, [gameSnapshot]);

  const resetGame = (nextConfig = configRef.current) => {
    const freshState = createInitialGameState(nextConfig);
    gameRef.current = freshState;
    setGameSnapshot(freshState);
  };

  const applyVariables = () => {
    const result = parseVariableFile(code, language, configRef.current);
    setErrors(result.errors);
    setWarnings(result.warnings.length ? result.warnings : ["Variables applied successfully."]);

    if (result.errors.length > 0) {
      setStatus("Fix the code errors before the game can use those variables.");
      return;
    }

    setConfig(result.config);
    configRef.current = result.config;
    setCode(generateCode(result.config, language));
    resetGame(result.config);
    setStatus(`${typeMap[language].label} variables applied. The game restarted with the new values.`);
  };

  const toggleLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setCode(generateCode(configRef.current, nextLanguage));
    setErrors([]);
    setWarnings([`Switched the declaration style to ${typeMap[nextLanguage].label}. The game values stayed the same.`]);
    setStatus(`Now editing ${typeMap[nextLanguage].label}-style variable declarations.`);
  };

  const restoreDefaults = () => {
    setConfig(defaultConfig);
    configRef.current = defaultConfig;
    setCode(generateCode(defaultConfig, language));
    setErrors([]);
    setWarnings(["Default variable values restored."]);
    resetGame(defaultConfig);
    setStatus("Defaults restored. Try changing one value at a time.");
  };

  const toggleRunning = () => {
    const next = { ...gameRef.current, running: !gameRef.current.running };
    if (next.gameOver || next.win) {
      resetGame(configRef.current);
      setStatus("Game restarted.");
      return;
    }
    gameRef.current = next;
    setGameSnapshot(next);
    setStatus(next.running ? "Game running." : "Game paused.");
  };

  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!target) return false;
      const tagName = target.tagName?.toLowerCase();
      return tagName === "textarea" || tagName === "input" || tagName === "select" || target.isContentEditable;
    };

    const handleKeyDown = (event) => {
      if (isTypingTarget(event.target)) return;

      const attackKeys = [" ", "Spacebar", "j", "J"];
      if (attackKeys.includes(event.key) || event.code === "Space") {
        attackQueuedRef.current = true;
        event.preventDefault();
        return;
      }

      const gameKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"];
      if (gameKeys.includes(event.key)) {
        keysRef.current.add(event.key);
        event.preventDefault();
      }
    };

    const handleKeyUp = (event) => {
      if (isTypingTarget(event.target)) return;
      keysRef.current.delete(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const tick = (time) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const delta = Math.min(40, time - lastTimeRef.current);
      lastTimeRef.current = time;

      const attackRequested = attackQueuedRef.current;
      attackQueuedRef.current = false;
      const nextState = updateGameState(gameRef.current, configRef.current, keysRef.current, attackRequested, delta, time);
      gameRef.current = nextState;
      renderGame(ctx, nextState, configRef.current, { now: time });

      if (Math.floor(time / 120) !== Math.floor((time - delta) / 120)) {
        setGameSnapshot(nextState);
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <AppHeader language={language} languages={typeMap} onLanguageChange={toggleLanguage} />

        <main className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <CodeEditorPanel
            code={code}
            errors={errors}
            fileName={typeMap[language].fileName}
            language={typeMap[language].label}
            onApply={applyVariables}
            onCodeChange={setCode}
            onResetCode={restoreDefaults}
            status={status}
            warnings={warnings}
          />

          <section className="space-y-4">
            <GamePanel
              canvasRef={canvasRef}
              gameSnapshot={gameSnapshot}
              onResetGame={() => resetGame(configRef.current)}
              onToggleRunning={toggleRunning}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <VariableWatch config={config} />
              <ChallengePanel challenges={challenges} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
