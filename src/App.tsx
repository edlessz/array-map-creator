import { useState } from "react";
import "./App.css";
import TileMap from "./TileMap/TileMap";

function App() {
  const [map, setMap] = useState([
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
  ]);

  const [palette, setPalette] = useState({
    0: "#FFFFFF", // White
    1: "#000000", // Black
  });

  return (
    <div
      style={{
        position: "absolute",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <TileMap map={map} palette={palette} />
    </div>
  );
}

export default App;
