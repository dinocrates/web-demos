import { useCallback, useEffect, useMemo, useState } from "react";
import { GameArena } from "./components/GameArena";
import { FeedbackPanel } from "./components/FeedbackPanel";
import { Hud } from "./components/Hud";
import { MiniButton } from "./components/MiniButton";
import { MovementControls } from "./components/MovementControls";
import { RuleEditor } from "./components/RuleEditor";
import { TracePanel } from "./components/TracePanel";
import { generateRuleCode } from "./codegen/generateRuleCode";
import { languageDefinitions } from "./data/languageDefinitions";
import { defaultDoorRule, defaultLadder, rooms } from "./data/rooms";
import { pickupCells, rewardDoorCells } from "./data/tiles";
import { applyDamage, applyPickup, getTargetCell, keyMoves, pickupMessage, removeCellFromGrid } from "./engine/movement";
import { buildRoom } from "./engine/roomLoader";
import { evaluateDoorRule, evaluateLadder, ladderBranchData } from "./engine/rules";
import { parseRuleCode } from "./parser/parseRuleCode";

const introMessage =
  "Use WASD, arrow keys, or the movement buttons. Change the rule, apply it, then play-test.";

function cloneRule(rule) {
  return { ...rule };
}

function cloneLadder(ladder) {
  return { ...ladder };
}

export default function App() {
  const initialRoom = buildRoom(rooms[0]);
  const [roomIndex, setRoomIndex] = useState(0);
  const [grid, setGrid] = useState(initialRoom.grid);
  const [player, setPlayer] = useState(initialRoom.start);
  const [stats, setStats] = useState(rooms[0].initialStats);
  const [message, setMessage] = useState(introMessage);
  const [trace, setTrace] = useState(null);
  const [complete, setComplete] = useState(false);
  const [appliedRule, setAppliedRule] = useState(cloneRule(rooms[0].draftRule));
  const [appliedLadder, setAppliedLadder] = useState(cloneLadder(rooms[0].draftLadder ?? defaultLadder));
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(() =>
    generateRuleCode(rooms[0], "cpp", rooms[0].draftRule, rooms[0].draftLadder ?? defaultLadder),
  );
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState(["Default C++ room rule loaded."]);
  const [status, setStatus] = useState("Edit the condition, apply the rule, then test the door.");

  const room = rooms[roomIndex];
  const isFinalRoom = roomIndex === rooms.length - 1;

  const loadRoom = useCallback((index) => {
    const nextRoom = rooms[index];
    const built = buildRoom(nextRoom);
    const nextRule = cloneRule(nextRoom.draftRule ?? defaultDoorRule);
    const nextLadder = cloneLadder(nextRoom.draftLadder ?? defaultLadder);

    setRoomIndex(index);
    setGrid(built.grid);
    setPlayer(built.start);
    setStats(nextRoom.initialStats);
    setTrace(null);
    setComplete(false);
    setAppliedRule(nextRule);
    setAppliedLadder(nextLadder);
    setCode(generateRuleCode(nextRoom, language, nextRule, nextLadder));
    setErrors([]);
    setWarnings([`${languageDefinitions[language].label} room rule loaded.`]);
    setStatus("Edit the condition, apply the rule, then test the door.");
    setMessage(`${nextRoom.title}: ${nextRoom.objective}`);
  }, [language]);

  const clearCurrentRoom = useCallback(
    (nextMessage) => {
      setComplete(true);
      setMessage(isFinalRoom ? "Module clear. The conditional logic gauntlet is complete." : nextMessage);
    },
    [isFinalRoom],
  );

  const continueToNextRoom = useCallback(() => {
    if (!complete || isFinalRoom) return;
    loadRoom(roomIndex + 1);
  }, [complete, isFinalRoom, loadRoom, roomIndex]);

  const handlePickup = useCallback(
    (cell, x, y) => {
      setGrid(removeCellFromGrid(grid, x, y));
      setPlayer({ x, y });
      setStats((currentStats) => applyPickup(currentStats, cell));
      setMessage(pickupMessage(cell));
    },
    [grid],
  );

  const move = useCallback(
    (dx, dy) => {
      if (complete) return;

      const { x, y, cell } = getTargetCell(grid, player, dx, dy);
      if (!cell) return;

      if (cell === "#") {
        setMessage("Wall. No code path through that.");
        return;
      }

      if (pickupCells.includes(cell)) {
        handlePickup(cell, x, y);
        return;
      }

      if (cell === "^") {
        setPlayer({ x, y });
        setStats((currentStats) => applyDamage(currentStats, 15));
        setMessage("Hazard tile: health dropped by 15.");
        return;
      }

      if (cell === "D") {
        const check = evaluateDoorRule(appliedRule, stats);
        setTrace({ ...check, kind: "door" });

        if (check.result) {
          setPlayer({ x, y });
          clearCurrentRoom(room.successText);
        } else {
          if (room.failDamage) {
            setStats((currentStats) => applyDamage(currentStats, room.failDamage));
          }
          setMessage(room.failText);
        }
        return;
      }

      if (rewardDoorCells.includes(cell)) {
        const check = evaluateLadder(appliedLadder, stats);
        setTrace({ ...check, kind: "ladder" });

        if (cell === check.door) {
          setPlayer({ x, y });
          clearCurrentRoom(`${check.branch.toUpperCase()} branch ran: ${check.action}`);
        } else {
          setMessage(`Locked. The ladder selected ${check.branch.toUpperCase()}, not this door.`);
        }
        return;
      }

      setPlayer({ x, y });
    },
    [appliedLadder, appliedRule, clearCurrentRoom, complete, grid, handlePickup, player, room, stats],
  );

  useEffect(() => {
    function onKeyDown(event) {
      const key = event.key.toLowerCase();

      if (complete && (key === " " || key === "enter")) {
        event.preventDefault();
        continueToNextRoom();
        return;
      }

      if (key === "r") {
        event.preventDefault();
        loadRoom(roomIndex);
        return;
      }

      if (keyMoves[key]) {
        const tagName = event.target?.tagName?.toLowerCase();
        if (tagName === "textarea" || tagName === "input" || tagName === "select" || event.target?.isContentEditable) {
          return;
        }
        event.preventDefault();
        move(keyMoves[key][0], keyMoves[key][1]);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [complete, continueToNextRoom, loadRoom, move, roomIndex]);

  const appliedCode = useMemo(() => {
    if (room.mode === "ladder") {
      const first = ladderBranchData(appliedLadder, appliedLadder.first);
      const second = ladderBranchData(appliedLadder, appliedLadder.second);
      return `if (${first.condition}) / else if (${second.condition}) / else`;
    }
    return `if (${appliedRule.variable} ${appliedRule.operator} ${appliedRule.value})`;
  }, [appliedLadder, appliedRule, room.mode]);

  const columns = grid[0]?.length ?? 17;

  function applyRule() {
    const result = parseRuleCode(code, room);
    setErrors(result.errors);

    if (result.errors.length > 0) {
      setWarnings(result.warnings);
      setStatus("Fix the code errors before the game can use this rule.");
      setMessage("Rule did not apply. Check the feedback panel.");
      return;
    }

    if (room.mode === "ladder") {
      setAppliedLadder(cloneLadder(result.ladder));
      setCode(generateRuleCode(room, language, appliedRule, result.ladder));
    } else {
      setAppliedRule(cloneRule(result.rule));
      setCode(generateRuleCode(room, language, result.rule, appliedLadder));
    }

    setWarnings(result.warnings.length ? result.warnings : ["Rule applied successfully."]);
    setStatus(`${languageDefinitions[language].label} rule applied. Now play-test the room.`);
    setTrace(null);
    setMessage("Rule applied. Now play-test the room.");
  }

  function switchLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setCode(generateRuleCode(room, nextLanguage, appliedRule, appliedLadder));
    setErrors([]);
    setWarnings([`Switched to ${languageDefinitions[nextLanguage].label}. The applied game rule stayed the same.`]);
    setStatus(`Now editing ${languageDefinitions[nextLanguage].label}-style conditional logic.`);
  }

  function resetCode() {
    setCode(generateRuleCode(room, language, appliedRule, appliedLadder));
    setErrors([]);
    setWarnings(["Code reset to the currently applied room rule."]);
    setStatus("The editor matches the active game rule again.");
  }

  function useLadderOrder(first) {
    const nextLadder = {
      ...appliedLadder,
      first,
      second: first === "gold" ? "silver" : "gold",
    };
    setCode(generateRuleCode(room, language, appliedRule, nextLadder));
    setErrors([]);
    setWarnings(["Quick order inserted into the editor. Click Apply Rule before testing a door."]);
    setStatus("The editor changed, but the game will not use it until you apply the rule.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-black p-4 text-slate-100 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-4">
        <Hud stats={stats} />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_440px]">
          <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold uppercase tracking-wide text-red-200">
                  Room {roomIndex + 1} / {rooms.length} - {room.tag}
                </div>
                <h2 className="text-2xl font-black">{room.title}</h2>
                <p className="text-sm text-slate-400">{room.objective}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {rooms.map((nextRoom, index) => (
                  <MiniButton key={nextRoom.id} active={index === roomIndex} onClick={() => loadRoom(index)}>
                    {index + 1}
                  </MiniButton>
                ))}
              </div>
            </div>

            <GameArena
              columns={columns}
              complete={complete}
              grid={grid}
              isFinalRoom={isFinalRoom}
              message={message}
              onContinue={continueToNextRoom}
              onReplay={() => loadRoom(roomIndex)}
              player={player}
              room={room}
              trace={trace}
            />

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
                {message}
              </div>
              <MovementControls onMove={move} onReset={() => loadRoom(roomIndex)} />
            </div>
          </section>

          <aside className="space-y-4">
            <RuleEditor
              appliedCode={appliedCode}
              code={code}
              language={language}
              onApply={applyRule}
              onCodeChange={setCode}
              onLanguageChange={switchLanguage}
              onResetCode={resetCode}
              onUseLadderOrder={useLadderOrder}
              room={room}
            />

            <FeedbackPanel errors={errors} status={status} warnings={warnings} />

            <TracePanel trace={trace} />

            <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 text-sm leading-6 text-slate-300 shadow-xl">
              <h2 className="text-xl font-black text-slate-100">Design Notes</h2>
              <p className="mt-2">
                This prototype uses edge-door room transitions. The door tile is both the visible lock
                and the exit trigger.
              </p>
              <p className="mt-2 text-slate-400">
                Next development pass: add sprites, sound, room intro cards, student prediction prompts,
                and more bug-fix rooms.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
