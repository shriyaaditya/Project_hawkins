import { useState } from "react";

export default function CharacterModal({ characters, onClose, onSelect }) {
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((prev) => (prev + 1) % characters.length);
  };

  const prev = () => {
    setIndex((prev) =>
      prev === 0 ? characters.length - 1 : prev - 1
    );
  };

  const current = characters[index];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <h2>Select Character 🎭</h2>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button onClick={prev}>⬅️</button>

          <div>
            <img
              src={current.image}
              alt={current.name}
              style={{ width: "200px", height: "300px" }}
            />
            <p>{current.name}</p>
          </div>

          <button onClick={next}>➡️</button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => {
              onSelect(current);
              onClose();
            }}
          >
            Select ✅
          </button>

          <button onClick={onClose} style={{ marginLeft: "10px" }}>
            Cancel ❌
          </button>
        </div>
      </div>
    </div>
  );
}