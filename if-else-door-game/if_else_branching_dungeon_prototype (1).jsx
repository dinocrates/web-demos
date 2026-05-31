import React, { useEffect, useMemo, useState } from "react";

const operators = ["==", "!=", ">", ">=", "<", "<="];
const variableOptions = ["blueKeys", "redKeys", "yellowKeys", "health", "coins"];

const rooms = [
  {
    id: "blue-door",
    title: "Blue Key Door",
    tag: "basic if",
    objective: "Grab the blue keycard, then test the door rule at the south exit.",
    map: [
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
    ],
    initialStats: { blueKeys: 0, redKeys: 0, yellowKeys: 0, health: 100, coins: 0 },
    mode: "door",
    doorColor: "blue",
    draftRule: { variable: "blueKeys", operator: ">=", value: 1 },
    ifAction: "openBlueDoor();",
    elseAction: "keepDoorLocked();",
    failText: "Blue exit stays locked. The else branch ran.",
    successText: "Access granted. The blue exit opens.",
  },
  {
    id: "red-alarm",
    title: "Red Alarm Door",
    tag: "if / else",
    objective: "Open the red exit if you have the red key. Otherwise the alarm fires.",
    map: [
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
    ],
    initialStats: { blueKeys: 0, redKeys: 0, yellowKeys: 0, health: 100, coins: 0 },
    mode: "door",
    doorColor: "red",
    draftRule: { variable: "redKeys", operator: ">=", value: 1 },
    ifAction: "openRedDoor();",
    elseAction: "triggerAlarm();",
    failText: "ALARM! The red exit stays locked.",
    successText: "Red clearance confirmed. Exit open.",
    failDamage: 10,
  },
  {
    id: "yellow-vault",
    title: "Two-Key Vault",
    tag: "thresholds",
    objective: "Make the vault require two yellow keys. Play-test one key vs. two keys.",
    map: [
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
    ],
    initialStats: { blueKeys: 0, redKeys: 0, yellowKeys: 0, health: 100, coins: 0 },
    mode: "door",
    doorColor: "yellow",
    draftRule: { variable: "yellowKeys", operator: ">=", value: 2 },
    ifAction: "openVault();",
    elseAction: "denyAccess();",
    failText: "Vault exit locked. The condition is false.",
    successText: "Two-key vault opens. Exit clear.",
  },
  {
    id: "reward-vault",
    title: "Reward Vault",
    tag: "else if",
    objective: "Collect coins, apply the ladder, then test which edge door opens first.",
    map: [
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
    ],
    initialStats: { blueKeys: 0, redKeys: 0, yellowKeys: 0, health: 100, coins: 0 },
    mode: "ladder",
    draftLadder: { first: "gold", second: "silver", gold: 3, silver: 2 },
  },
];

function compare(left, operator, right) {
  switch (operator) {
    case "==": return left === right;
    case "!=": return left !== right;
    case ">": return left > right;
    case ">=": return left >= right;
    case "<": return left < right;
    case "<=": return left <= right;
    default: return false;
  }
}

function buildRoom(room) {
  let start = { x: 1, y: 1 };
  const grid = room.map.map((row, y) =>
    row.split("").map((cell, x) => {
      if (cell === "P") {
        start = { x, y };
        return ".";
      }
      return cell;
    })
  );
  return { grid, start };
}

function evaluateDoorRule(rule, stats) {
  const left = Number(stats[rule.variable] ?? 0);
  const right = Number(rule.value);
  const result = compare(left, rule.operator, right);
  return {
    result,
    expression: `${rule.variable} ${rule.operator} ${right}`,
    substituted: `${left} ${rule.operator} ${right}`,
    branch: result ? "if" : "else",
  };
}

function ladderBranchData(ladder, name) {
  if (name === "gold") {
    return { name: "gold", door: "G", action: "openGoldDoor();", condition: `coins >= ${ladder.gold}` };
  }
  return { name: "silver", door: "S", action: "openSilverDoor();", condition: `coins >= ${ladder.silver}` };
}

function evaluateLadder(ladder, stats) {
  const coins = Number(stats.coins ?? 0);
  const first = ladderBranchData(ladder, ladder.first);
  const second = ladderBranchData(ladder, ladder.second);

  if (coins >= Number(ladder[first.name])) {
    return {
      result: true,
      door: first.door,
      branch: first.name,
      expression: first.condition,
      substituted: `${coins} >= ${ladder[first.name]}`,
      action: first.action,
    };
  }
  if (coins >= Number(ladder[second.name])) {
    return {
      result: true,
      door: second.door,
      branch: second.name,
      expression: second.condition,
      substituted: `${coins} >= ${ladder[second.name]}`,
      action: second.action,
    };
  }
  return {
    result: true,
    door: "N",
    branch: "bronze / else",
    expression: "else",
    substituted: "no earlier condition was true",
    action: "openBronzeDoor();",
  };
}

function cellStyle(cell, room) {
  const base = "relative flex aspect-square items-center justify-center rounded-md border text-xs font-black shadow-inner select-none";
  const doorStyles = {
    blue: "border-sky-200 bg-sky-700 text-white shadow-sky-500/30",
    red: "border-red-200 bg-red-700 text-white shadow-red-500/30",
    yellow: "border-yellow-200 bg-yellow-500 text-black shadow-yellow-500/30",
  };
  const styles = {
    "#": "border-slate-950 bg-slate-800 text-slate-700",
    ".": "border-slate-800 bg-slate-950",
    "^": "border-red-500/50 bg-red-950 text-red-200",
    "D": doorStyles[room?.doorColor] ?? "border-sky-300 bg-sky-700 text-white",
    "b": "border-sky-200 bg-sky-500 text-white",
    "r": "border-red-200 bg-red-600 text-white",
    "y": "border-yellow-200 bg-yellow-500 text-black",
    "c": "border-amber-200 bg-amber-500 text-black",
    "G": "border-yellow-200 bg-yellow-600 text-black",
    "S": "border-slate-200 bg-slate-400 text-black",
    "N": "border-orange-200 bg-orange-700 text-white",
  };
  return `${base} ${styles[cell] || styles["."]}`;
}

function cellLabel(cell) {
  const labels = {
    "#": "",
    ".": "",
    "^": "!",
    "D": "EXIT",
    "b": "B",
    "r": "R",
    "y": "Y",
    "c": "$",
    "G": "GOLD",
    "S": "SILV",
    "N": "BRNZ",
  };
  return labels[cell] ?? "";
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="font-mono text-lg font-black text-slate-100">{value}</div>
    </div>
  );
}

function MiniButton({ children, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${active ? "border-red-300 bg-red-500/20 text-red-100" : "border-slate-600 bg-slate-950 text-slate-200 hover:bg-slate-800"}`}
    >
      {children}
    </button>
  );
}

function CodePanel({ room, ruleDraft, ladderDraft }) {
  if (room.mode === "ladder") {
    const first = ladderBranchData(ladderDraft, ladderDraft.first);
    const second = ladderBranchData(ladderDraft, ladderDraft.second);
    return (
      <pre className="overflow-x-auto rounded-2xl border border-slate-700 bg-black p-4 text-sm leading-6 text-slate-100 shadow-inner">
        <code>{`if (${first.condition}) {\n    ${first.action}\n}\nelse if (${second.condition}) {\n    ${second.action}\n}\nelse {\n    openBronzeDoor();\n}`}</code>
      </pre>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-2xl border border-slate-700 bg-black p-4 text-sm leading-6 text-slate-100 shadow-inner">
      <code>{`if (${ruleDraft.variable} ${ruleDraft.operator} ${ruleDraft.value}) {\n    ${room.ifAction}\n}\nelse {\n    ${room.elseAction}\n}`}</code>
    </pre>
  );
}

export default function IfElseArenaPrototype() {
  const firstRoom = buildRoom(rooms[0]);
  const [roomIndex, setRoomIndex] = useState(0);
  const [grid, setGrid] = useState(firstRoom.grid);
  const [player, setPlayer] = useState(firstRoom.start);
  const [stats, setStats] = useState(rooms[0].initialStats);
  const [message, setMessage] = useState("Use WASD, arrow keys, or the movement buttons. Change the rule, apply it, then play-test.");
  const [trace, setTrace] = useState(null);
  const [complete, setComplete] = useState(false);
  const [ruleDraft, setRuleDraft] = useState(rooms[0].draftRule);
  const [appliedRule, setAppliedRule] = useState(rooms[0].draftRule);
  const [ladderDraft, setLadderDraft] = useState(rooms[0].draftLadder ?? { first: "gold", second: "silver", gold: 3, silver: 2 });
  const [appliedLadder, setAppliedLadder] = useState(rooms[0].draftLadder ?? { first: "gold", second: "silver", gold: 3, silver: 2 });

  const room = rooms[roomIndex];

  function loadRoom(index) {
    const nextRoom = rooms[index];
    const built = buildRoom(nextRoom);
    setRoomIndex(index);
    setGrid(built.grid);
    setPlayer(built.start);
    setStats(nextRoom.initialStats);
    setTrace(null);
    setComplete(false);
    setRuleDraft(nextRoom.draftRule ?? { variable: "blueKeys", operator: ">=", value: 1 });
    setAppliedRule(nextRoom.draftRule ?? { variable: "blueKeys", operator: ">=", value: 1 });
    setLadderDraft(nextRoom.draftLadder ?? { first: "gold", second: "silver", gold: 3, silver: 2 });
    setAppliedLadder(nextRoom.draftLadder ?? { first: "gold", second: "silver", gold: 3, silver: 2 });
    setMessage(`${nextRoom.title}: ${nextRoom.objective}`);
  }

  function movePlayerTo(x, y) {
    setPlayer({ x, y });
  }

  function clearCurrentRoom(nextMessage) {
    setComplete(true);
    setMessage(roomIndex === rooms.length - 1 ? "Module clear. The conditional logic gauntlet is complete." : nextMessage);
  }

  function continueToNextRoom() {
    if (!complete) return;
    if (roomIndex < rooms.length - 1) {
      loadRoom(roomIndex + 1);
    }
  }

  function handlePickup(cell, x, y) {
    const updatedGrid = grid.map((row) => [...row]);
    updatedGrid[y][x] = ".";
    setGrid(updatedGrid);
    movePlayerTo(x, y);

    if (cell === "b") {
      setStats((s) => ({ ...s, blueKeys: s.blueKeys + 1 }));
      setMessage("Picked up blue keycard. Try the blue exit again.");
    } else if (cell === "r") {
      setStats((s) => ({ ...s, redKeys: s.redKeys + 1 }));
      setMessage("Picked up red keycard. The if condition should now be true.");
    } else if (cell === "y") {
      setStats((s) => ({ ...s, yellowKeys: s.yellowKeys + 1 }));
      setMessage("Picked up yellow key. Does the vault need one key or two?");
    } else if (cell === "c") {
      setStats((s) => ({ ...s, coins: s.coins + 1 }));
      setMessage("Coin collected. Coin thresholds control the reward doors.");
    }
  }

  function move(dx, dy) {
    if (complete) return;
    const nx = player.x + dx;
    const ny = player.y + dy;
    const cell = grid[ny]?.[nx];
    if (!cell) return;

    if (cell === "#") {
      setMessage("Wall. No code path through that.");
      return;
    }

    if (["b", "r", "y", "c"].includes(cell)) {
      handlePickup(cell, nx, ny);
      return;
    }

    if (cell === "^") {
      movePlayerTo(nx, ny);
      setStats((s) => ({ ...s, health: Math.max(0, s.health - 15) }));
      setMessage("Hazard tile: health dropped by 15.");
      return;
    }

    if (cell === "D") {
      const check = evaluateDoorRule(appliedRule, stats);
      setTrace({ ...check, kind: "door" });
      if (check.result) {
        movePlayerTo(nx, ny);
        clearCurrentRoom(room.successText);
      } else {
        if (room.failDamage) {
          setStats((s) => ({ ...s, health: Math.max(0, s.health - room.failDamage) }));
        }
        setMessage(room.failText);
      }
      return;
    }

    if (["G", "S", "N"].includes(cell)) {
      const check = evaluateLadder(appliedLadder, stats);
      setTrace({ ...check, kind: "ladder" });
      if (cell === check.door) {
        movePlayerTo(nx, ny);
        clearCurrentRoom(`${check.branch.toUpperCase()} branch ran: ${check.action}`);
      } else {
        setMessage(`Locked. The ladder selected ${check.branch.toUpperCase()}, not this door.`);
      }
      return;
    }

    movePlayerTo(nx, ny);
  }

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

      const moves = {
        arrowup: [0, -1],
        w: [0, -1],
        arrowdown: [0, 1],
        s: [0, 1],
        arrowleft: [-1, 0],
        a: [-1, 0],
        arrowright: [1, 0],
        d: [1, 0],
      };
      if (moves[key]) {
        event.preventDefault();
        move(moves[key][0], moves[key][1]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const appliedCode = useMemo(() => {
    if (room.mode === "ladder") {
      const first = ladderBranchData(appliedLadder, appliedLadder.first);
      const second = ladderBranchData(appliedLadder, appliedLadder.second);
      return `if (${first.condition}) / else if (${second.condition}) / else`;
    }
    return `if (${appliedRule.variable} ${appliedRule.operator} ${appliedRule.value})`;
  }, [room.mode, appliedRule, appliedLadder]);

  const columns = grid[0]?.length ?? 17;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-black p-4 text-slate-100 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-4">
        <header className="rounded-3xl border border-red-500/30 bg-black/70 p-5 shadow-2xl shadow-red-950/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 text-sm font-bold text-red-100">
                Module 2 · Fixed-Screen If/Else Arena
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Keycard Logic Lab</h1>
              <p className="mt-2 max-w-3xl text-slate-300">
                Change the condition, apply it, then play the room. The door tile is the exit tile: false blocks, true clears the screen.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <StatPill label="blue" value={stats.blueKeys} />
              <StatPill label="red" value={stats.redKeys} />
              <StatPill label="yellow" value={stats.yellowKeys} />
              <StatPill label="health" value={stats.health} />
              <StatPill label="coins" value={stats.coins} />
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(760px,1fr)_440px]">
          <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold uppercase tracking-wide text-red-200">Room {roomIndex + 1} / {rooms.length} · {room.tag}</div>
                <h2 className="text-2xl font-black">{room.title}</h2>
                <p className="text-sm text-slate-400">{room.objective}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {rooms.map((r, i) => (
                  <MiniButton key={r.id} active={i === roomIndex} onClick={() => loadRoom(i)}>{i + 1}</MiniButton>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-black p-4">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {grid.map((row, y) =>
                  row.map((cell, x) => {
                    const isPlayer = player.x === x && player.y === y;
                    return (
                      <div key={`${x}-${y}`} className={cellStyle(cell, room)}>
                        {isPlayer ? (
                          <div className="absolute inset-1 flex items-center justify-center rounded-md border border-cyan-200 bg-cyan-400 text-black shadow-lg shadow-cyan-500/40">▲</div>
                        ) : (
                          <span className="text-[10px] sm:text-xs">{cellLabel(cell)}</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {complete && (
                <div className="absolute inset-3 flex items-center justify-center rounded-2xl border border-emerald-300/60 bg-black/85 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-3xl border border-emerald-300/50 bg-slate-950/95 p-5 text-center shadow-2xl shadow-emerald-950/40">
                    <div className="text-sm font-black uppercase tracking-[0.35em] text-emerald-200">
                      {roomIndex === rooms.length - 1 ? "Module Clear" : "Room Clear"}
                    </div>
                    <div className="mt-3 text-3xl font-black text-white">
                      {trace?.kind === "ladder" ? trace.branch.toUpperCase() : trace?.branch === "if" ? "TRUE" : "ACCESS GRANTED"}
                    </div>
                    {trace && (
                      <div className="mx-auto mt-4 grid max-w-sm gap-2 text-left font-mono text-sm">
                        <div className="rounded-xl border border-slate-700 bg-black p-3 text-amber-200">{trace.expression}</div>
                        <div className="rounded-xl border border-slate-700 bg-black p-3 text-amber-200">{trace.substituted}</div>
                        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-emerald-100">
                          {trace.kind === "ladder" ? `${trace.branch} branch ran` : `${trace.branch} branch ran`}
                        </div>
                      </div>
                    )}
                    <p className="mt-4 text-sm text-slate-300">{message}</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      {roomIndex < rooms.length - 1 && (
                        <button className="rounded-2xl border border-emerald-300 bg-emerald-500/20 px-5 py-3 font-black text-emerald-100 hover:bg-emerald-500/30" onClick={continueToNextRoom}>
                          Continue: Space / Enter
                        </button>
                      )}
                      <button className="rounded-2xl border border-slate-500 bg-slate-900 px-5 py-3 font-black text-slate-100 hover:bg-slate-800" onClick={() => loadRoom(roomIndex)}>
                        Replay Room: R
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
                {message}
              </div>
              <div className="mx-auto grid w-40 grid-cols-3 gap-2 text-center">
                <div />
                <MiniButton onClick={() => move(0, -1)}>▲</MiniButton>
                <div />
                <MiniButton onClick={() => move(-1, 0)}>◀</MiniButton>
                <MiniButton onClick={() => loadRoom(roomIndex)}>Reset</MiniButton>
                <MiniButton onClick={() => move(1, 0)}>▶</MiniButton>
                <div />
                <MiniButton onClick={() => move(0, 1)}>▼</MiniButton>
                <div />
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Room Rule</h2>
                  <p className="text-xs text-slate-400">Applied rule: <span className="font-mono text-amber-200">{appliedCode}</span></p>
                </div>
                <button
                  className="rounded-xl border border-red-300 bg-red-500/20 px-3 py-2 text-sm font-black text-red-100 hover:bg-red-500/30"
                  onClick={() => {
                    if (room.mode === "ladder") {
                      setAppliedLadder(ladderDraft);
                    } else {
                      setAppliedRule(ruleDraft);
                    }
                    setTrace(null);
                    setMessage("Rule applied. Now play-test the room.");
                  }}
                >
                  Apply Rule
                </button>
              </div>

              {room.mode === "door" ? (
                <div className="grid gap-3">
                  <div className="grid grid-cols-[1fr_90px_90px] gap-2">
                    <select className="rounded-xl border border-slate-600 bg-black px-2 py-2 font-mono" value={ruleDraft.variable} onChange={(e) => setRuleDraft({ ...ruleDraft, variable: e.target.value })}>
                      {variableOptions.map((v) => <option key={v}>{v}</option>)}
                    </select>
                    <select className="rounded-xl border border-slate-600 bg-black px-2 py-2 font-mono" value={ruleDraft.operator} onChange={(e) => setRuleDraft({ ...ruleDraft, operator: e.target.value })}>
                      {operators.map((op) => <option key={op}>{op}</option>)}
                    </select>
                    <input className="rounded-xl border border-slate-600 bg-black px-2 py-2 font-mono" type="number" value={ruleDraft.value} onChange={(e) => setRuleDraft({ ...ruleDraft, value: Number(e.target.value) })} />
                  </div>
                  <CodePanel room={room} ruleDraft={ruleDraft} ladderDraft={ladderDraft} />
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs uppercase tracking-wide text-slate-400">Gold threshold
                      <input className="mt-1 w-full rounded-xl border border-slate-600 bg-black px-2 py-2 font-mono text-slate-100" type="number" value={ladderDraft.gold} onChange={(e) => setLadderDraft({ ...ladderDraft, gold: Number(e.target.value) })} />
                    </label>
                    <label className="text-xs uppercase tracking-wide text-slate-400">Silver threshold
                      <input className="mt-1 w-full rounded-xl border border-slate-600 bg-black px-2 py-2 font-mono text-slate-100" type="number" value={ladderDraft.silver} onChange={(e) => setLadderDraft({ ...ladderDraft, silver: Number(e.target.value) })} />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniButton onClick={() => setLadderDraft({ ...ladderDraft, first: "gold", second: "silver" })} active={ladderDraft.first === "gold"}>Correct order</MiniButton>
                    <MiniButton onClick={() => setLadderDraft({ ...ladderDraft, first: "silver", second: "gold" })} active={ladderDraft.first === "silver"}>Buggy order</MiniButton>
                  </div>
                  <CodePanel room={room} ruleDraft={ruleDraft} ladderDraft={ladderDraft} />
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl">
              <h2 className="text-xl font-black">Trace</h2>
              {trace ? (
                <div className="mt-3 grid gap-3">
                  <div className="rounded-2xl border border-slate-700 bg-black p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">condition checked</div>
                    <div className="mt-1 font-mono text-lg text-amber-200">{trace.expression}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-black p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">substitute value</div>
                    <div className="mt-1 font-mono text-lg text-amber-200">{trace.substituted}</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-3">
                    <div className="text-xs uppercase tracking-wide text-emerald-200">branch selected</div>
                    <div className="mt-1 text-lg font-black text-emerald-100">{trace.kind === "ladder" ? trace.branch : `${trace.branch} branch`}</div>
                  </div>
                </div>
              ) : (
                <p className="mt-2 rounded-2xl border border-slate-700 bg-black p-3 text-sm text-slate-400">Walk into an edge door to see the condition evaluate.</p>
              )}
            </section>

            <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 text-sm leading-6 text-slate-300 shadow-xl">
              <h2 className="text-xl font-black text-slate-100">Design Notes</h2>
              <p className="mt-2">This prototype now uses edge-door room transitions. The door tile is both the visible lock and the exit trigger.</p>
              <p className="mt-2 text-slate-400">Next development pass: add sprites, sound, room intro cards, student prediction prompts, and more bug-fix rooms.</p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
