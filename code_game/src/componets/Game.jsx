import { useState, useEffect, useRef } from "react";
import CharacterModal from "../utils/CharacterModal.jsx";
import useSpikeAttack from "./Spikes.jsx";
import CodeEditor from "./CodeEditor.jsx";

const characters = [
  { id: 1, name: "Eleven", image: "/Eleven.png" },
  { id: 2, name: "Steve", image: "/Steve.png" },
  { id: 3, name: "Max", image: "/Max.png" },
  { id: 4, name: "Will", image: "/Will.png" },
  { id: 5, name: "Demogorgon", image: "/Demogorgon.png" },
];

const obstacles = [
  { x: 3, y: 2 },
  { x: 1, y: 5 },
  { x: 8, y: 2 },
  { x: 6, y: 5 },
  { x: 3, y: 7 },
  { x: 6, y: 1 },
  { x: 8, y: 8 },
];

export default function Game() {
  const gridSize = 10;

  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  // BUG FIX 1: Declare gameOver before useSpikeAttack so it can be referenced in the hook call
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Use a ref for restartSwarmCycle so we can reference it before it's assigned
  const restartSwarmCycleRef = useRef(null);

  const { isSpikeCell, timeLeft, highlightDirection, restartSwarmCycle } =
    useSpikeAttack({
      gridSize,
      player,
      obstacles,
      paused: gameOver || gameWon,
      onSurvive: () => setScore((s) => s + 1),
      onFail: () => {
        setGameOver(true);
        setTimeout(() => {
          setPlayer({ x: 0, y: 0 });
          // BUG FIX 4: Reset score on fail
          setScore(0);
          setGameOver(false);
          restartSwarmCycleRef.current?.();
        }, 1000);
      },
    });

  // Keep the ref in sync with the latest restartSwarmCycle
  useEffect(() => {
    restartSwarmCycleRef.current = restartSwarmCycle;
  }, [restartSwarmCycle]);

  const parseCode = (code) => {
    return code
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  // Score >= 5 means the player wins — pause the game and show win screen
  useEffect(() => {
    if (score < 5) return;
    setGameWon(true);
  }, [score]);

  const moveRight = () => {
    setPlayer((prev) => {
      const newX = Math.min(prev.x + 1, gridSize - 1);
      const blocked = obstacles.some((obs) => obs.x === newX && obs.y === prev.y);
      if (blocked) return prev;
      return { ...prev, x: newX };
    });
  };

  const moveLeft = () => {
    setPlayer((prev) => {
      const newX = Math.max(prev.x - 1, 0);
      const blocked = obstacles.some((obs) => obs.x === newX && obs.y === prev.y);
      if (blocked) return prev;
      return { ...prev, x: newX };
    });
  };

  const moveUp = () => {
    setPlayer((prev) => {
      const newY = Math.max(prev.y - 1, 0);
      const blocked = obstacles.some((obs) => obs.x === prev.x && obs.y === newY);
      if (blocked) return prev;
      return { ...prev, y: newY };
    });
  };

  const moveDown = () => {
    setPlayer((prev) => {
      const newY = Math.min(prev.y + 1, gridSize - 1);
      const blocked = obstacles.some((obs) => obs.x === prev.x && obs.y === newY);
      if (blocked) return prev;
      return { ...prev, y: newY };
    });
  };

  const runUserCode = (code) => {
    const steps = parseCode(code);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(interval);
        return;
      }
      const command = steps[i];
      const clean = command.replace(";", "");
      if (clean === "moveRight()") moveRight();
      else if (clean === "moveLeft()") moveLeft();
      else if (clean === "moveUp()") moveUp();
      else if (clean === "moveDown()") moveDown();
      i++;
    }, 400);
  };

  const sideLabel =
    highlightDirection === "up"
      ? "TOP (↑)"
      : highlightDirection === "down"
      ? "BOTTOM (↓)"
      : highlightDirection === "left"
      ? "LEFT (←)"
      : "RIGHT (→)";

  const edgeHighlight =
    highlightDirection === "up"
      ? "inset 0 14px 0 0 rgba(239,68,68,0.95)"
      : highlightDirection === "down"
      ? "inset 0 -14px 0 0 rgba(239,68,68,0.95)"
      : highlightDirection === "left"
      ? "inset 14px 0 0 0 rgba(239,68,68,0.95)"
      : highlightDirection === "right"
      ? "inset -14px 0 0 0 rgba(239,68,68,0.95)"
      : "";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, padding: "20px" }}>
        {showCharacterModal && (
          <CharacterModal
            characters={characters}
            onClose={() => setShowCharacterModal(false)}
            onSelect={setSelectedCharacter}
          />
        )}

        <div
          style={{
            width: "50vw",
            height: "50vw",
            boxSizing: "border-box",
            borderRadius: 6,
            boxShadow: edgeHighlight || undefined,
            transition: "box-shadow 0.35s ease",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: "100%",
              height: "100%",
              gap: "0px",
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, index) => {
              const x = index % gridSize;
              const y = Math.floor(index / gridSize);

              const isPlayer = player.x === x && player.y === y;
              const isObstacle = obstacles.some((obs) => obs.x === x && obs.y === y);
              // BUG FIX 5: Don't show spikes on obstacle cells
              const isSpike = !isObstacle && isSpikeCell(x, y);

              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    backgroundColor: isPlayer ? "#96bcb7" : "#dcf7f3",
                    border: "2px solid #7EA19C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {isObstacle && (
                    <img
                      src="/wall.png"
                      alt="wall"
                      style={{ width: "100%", height: "100%" }}
                    />
                  )}

                  {isSpike && (
                    <img
                      src="/Demogorgon.png"
                      alt="vine"
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        top: 0,
                        left: 0,
                        transition: "transform 1s linear",
                        zIndex: 2,
                      }}
                    />
                  )}

                  {isPlayer && (
                    <img
                      src={selectedCharacter.image}
                      alt={selectedCharacter.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p style={{ marginTop: 12, maxWidth: 480, fontSize: 14, color: "#2d4a45" }}>
          Swarm inbound from <strong>{sideLabel}</strong>. Stand in the tile{" "}
          <em>against</em> that edge with a wall on the swarm side (+1 survival).
          Commands: <code>moveRight()</code>, <code>moveLeft()</code>,{" "}
          <code>moveUp()</code>, <code>moveDown()</code>
        </p>

        <div style={{ marginTop: "20px" }}>
          <button onClick={moveUp}>⬆️</button>
          <button onClick={moveDown}>⬇️</button>
          <button onClick={moveLeft}>⬅️</button>
          <button onClick={moveRight}>➡️</button>
        </div>

        <button onClick={() => setShowCharacterModal(true)}>
          Choose Character 🎭
        </button>

        <h2>⏱ Next swarm: {timeLeft}s</h2>
        <p style={{ marginTop: 4, fontSize: 14 }}>Score: {score}</p>

        {gameWon && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              background: "#e8ffe8",
              borderRadius: 8,
              border: "1px solid #88c888",
              maxWidth: 420,
            }}
          >
            <strong>🎉 You survived the Upside Down!</strong>
            <p style={{ margin: "8px 0", fontSize: 14 }}>
              Score: {score} — the swarm has been defeated.
            </p>
            <button
              type="button"
              onClick={() => {
                setGameWon(false);
                setScore(0);
                setPlayer({ x: 0, y: 0 });
                restartSwarmCycle();
              }}
              style={{
                padding: "10px 16px",
                background: "#2d7a74",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Play again
            </button>
          </div>
        )}

        {gameOver && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              background: "#ffe8e8",
              borderRadius: 8,
              border: "1px solid #f08888",
              maxWidth: 420,
            }}
          >
            <strong>Game over</strong>
            <p style={{ margin: "8px 0", fontSize: 14 }}>
              Get behind a wall on the flashing side before the timer hits zero.
            </p>
            <button
              type="button"
              onClick={() => {
                setGameOver(false);
                setScore(0);
                restartSwarmCycle();
              }}
              style={{
                padding: "10px 16px",
                background: "#2d7a74",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Play again
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          padding: "20px",
          background: "#111",
          color: "white",
        }}
      >
        <CodeEditor onRun={runUserCode} />
      </div>
    </div>
  );
}