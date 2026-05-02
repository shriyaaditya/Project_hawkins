import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function CodeEditor({ onRun }) {
  const [code, setCode] = useState();

  return (
    <div>
      <h2 style={{ color: "white" }}>Code Editor 💻</h2>

      <Editor
        height="400px"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: "on",
        }}
      />

      <button
        onClick={() => onRun(code)}
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ▶ Run Code
      </button>
    </div>
  );
}