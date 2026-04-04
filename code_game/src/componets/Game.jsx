import { useState } from "react";
import CharacterModal from "../utils/CharacterModal.jsx";


const characters = [
  { id: 1, name: "Eleven", image: "/Eleven.png" },
  { id: 2, name: "Steve", image: "/Steve.png" },
  { id: 3, name: "Max", image: "/Max.png" },
  { id: 4, name: "Will", image: "/Will.png" },
  { id: 5, name: "Demogorgon", image: "/Demogorgon.png" },
];


export default function Game() {
  const gridSize = 10;


  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);

  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [player, setPlayer] = useState({ x: 0, y: 0 });

  const moveRight = () => {
    setPlayer((prev) => ({
      ...prev,
      x: Math.min(prev.x + 1, gridSize - 1),
    }));
  };

  const moveLeft = () => {
    setPlayer((prev) => ({
      ...prev,
      x: Math.max(prev.x - 1, 0),
    }));
  };

  const moveUp = () => {
    setPlayer((prev) => ({
      ...prev,
      y: Math.max(prev.y - 1, 0),
    }));
  };

  const moveDown = () => {
    setPlayer((prev) => ({
      ...prev,
      y: Math.min(prev.y + 1, gridSize - 1),
    }));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Game Area </h2>

      {showCharacterModal && (
  <CharacterModal
    characters={characters}
    onClose={() => setShowCharacterModal(false)}
    onSelect={setSelectedCharacter}
  />
)}

<div
  style={{
    display: "grid",
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    width: "50vw",
    height: "50vw",
    gap: "0px",
  }}
>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);

          const isPlayer = player.x === x && player.y === y;

          return (
            <div
  key={index}
  style={{
    width: "100px",
    height: "100px",
    backgroundColor: "#4F0401",
    border: "2px solid #F06124",
    
  }}
>
  {isPlayer && (
    <img
      src={selectedCharacter.image}
      alt={selectedCharacter.name}
      style={{ width: "100px", height: "100px" }}
    />
  )}
</div>
          );
        })}
      </div>


      <div style={{ marginTop: "20px" }}>
        <button onClick={moveUp}>⬆️</button>
        <button onClick={moveDown}>⬇️</button>
        <button onClick={moveLeft}>⬅️</button>
        <button onClick={moveRight}>➡️</button>
      </div>

      <button onClick={() => setShowCharacterModal(true)}>
  Choose Character 🎭
</button>
      {/* DEBUG INFO */}
      <p style={{ marginTop: "10px" }}>
        Position: (x: {player.x}, y: {player.y})
      </p>
    </div>
  );
}