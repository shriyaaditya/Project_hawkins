import { useEffect, useState, useRef, useCallback } from "react";

const DIRECTIONS = ["left", "right", "up", "down"];

function pickRandomDirection() {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}

/** Mob comes from edge `direction`; safe if obstacle is adjacent between player and that edge */
function isBehindBlock(player, obstacles, direction) {
  const { x, y } = player;
  const hasObs = (ox, oy) =>
    obstacles.some((o) => o.x === ox && o.y === oy);

  switch (direction) {
    case "up":
      return hasObs(x, y - 1);
    case "down":
      return hasObs(x, y + 1);
    case "left":
      return hasObs(x - 1, y);
    case "right":
      return hasObs(x + 1, y);
    default:
      return false;
  }
}

const SWARM_MOVE_MS = 100;
/** How long swarm animation runs before scoring */
const SWARM_DURATION_MS = 3500;

export default function useSpikeAttack({
  gridSize,
  player,
  obstacles,
  onSurvive,
  onFail,
  paused = false,
}) {
  const [attackDirection, setAttackDirection] = useState(() => pickRandomDirection());
  const [timeLeft, setTimeLeft] = useState(40);
  const [swarmActive, setSwarmActive] = useState(false);
  const [spikes, setSpikes] = useState([]);

  const playerRef = useRef(player);
  const obstaclesRef = useRef(obstacles);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  const attackDirectionRef = useRef(attackDirection);
  useEffect(() => {
    attackDirectionRef.current = attackDirection;
  }, [attackDirection]);


  const swarmDirForRoundRef = useRef(null);

  const onSurviveRef = useRef(onSurvive);
  const onFailRef = useRef(onFail);
  useEffect(() => {
    onSurviveRef.current = onSurvive;
    onFailRef.current = onFail;
  }, [onSurvive, onFail]);

  const finalizeRound = useCallback((dir) => {
    if (!dir) return;
    if (spikes.length === 0) return;
  
    const survives = isBehindBlock(
      playerRef.current,
      obstaclesRef.current,
      dir
    );
  
    setSpikes([]);
    setSwarmActive(false);
  
    if (survives) {
      onSurviveRef.current?.();
      setAttackDirection(pickRandomDirection());
      setTimeLeft(60);
    } else {
      onFailRef.current?.();
    }
  }, [spikes]);

  const restartSwarmCycle = useCallback(() => {
    setAttackDirection(pickRandomDirection());
    setTimeLeft(60);
    setSpikes([]);
    setSwarmActive(false);
  }, []);

  const isBlockedAt = useCallback(
    (x, y) => obstacles.some((obs) => obs.x === x && obs.y === y),
    [obstacles]
  );

  const launchSwarm = useCallback(
    (dir) => {
      swarmDirForRoundRef.current = dir;
      let newSpikes = [];

      if (dir === "left") {
        for (let y = 0; y < gridSize; y++) {
          newSpikes.push({ x: 0, y, dir: "left" });
        }
      } else if (dir === "right") {
        for (let y = 0; y < gridSize; y++) {
          newSpikes.push({ x: gridSize - 1, y, dir: "right" });
        }
      } else if (dir === "up") {
        for (let x = 0; x < gridSize; x++) {
          newSpikes.push({ x, y: 0, dir: "up" });
        }
      } else if (dir === "down") {
        for (let x = 0; x < gridSize; x++) {
          newSpikes.push({ x, y: gridSize - 1, dir: "down" });
        }
      }

      setSpikes(newSpikes);
      setSwarmActive(true);
    },
    [gridSize]
  );

  // Countdown only during warning phase (not paused, not swarming)
  useEffect(() => {
    if (paused || swarmActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [paused, swarmActive]);

  useEffect(() => {
    if (paused || swarmActive || timeLeft > 0) return;
  
    launchSwarm(attackDirectionRef.current);
  }, [paused, swarmActive, timeLeft, launchSwarm]);

  // Spike movement during swarm (walls block traversal)
  useEffect(() => {
    if (!swarmActive) return;

    const moveInterval = setInterval(() => {
      setSpikes((prev) =>
        prev.map((spike) => {
          let { x, y, dir } = spike;
          let newX = x;
          let newY = y;

          if (dir === "left") newX = x + 1;
          if (dir === "right") newX = x - 1;
          if (dir === "up") newY = y + 1;
          if (dir === "down") newY = y - 1;

          if (
            newX < 0 ||
            newY < 0 ||
            newX >= gridSize ||
            newY >= gridSize
          ) {
            return spike;
          }

          if (isBlockedAt(newX, newY)) return spike;

          return { x: newX, y: newY, dir };
        })
      );
    }, SWARM_MOVE_MS);

    return () => clearInterval(moveInterval);
  }, [swarmActive, gridSize, isBlockedAt]);


  
  useEffect(() => {
    if (!swarmActive) return;

    const swarmDir = swarmDirForRoundRef.current;
    const t = window.setTimeout(() => {
      finalizeRound(swarmDir);
    }, SWARM_DURATION_MS);

    return () => window.clearTimeout(t);
  }, [swarmActive, finalizeRound]);

  const isSpikeCell = (x, y) => spikes.some((s) => s.x === x && s.y === y);

  const getSpikeDirection = (x, y) => {
    const spike = spikes.find((s) => s.x === x && s.y === y);
    return spike?.dir ?? null;
  };

  return {
    attack: { active: swarmActive, direction: attackDirection },
    /** Highlight this side during countdown (next inbound swarm) */
    highlightDirection: attackDirection,
    isSpikeCell,
    getSpikeDirection,
    timeLeft,
    swarmActive,
    restartSwarmCycle,
  };
}
