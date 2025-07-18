import { useState } from "react";
import "./App.css";
import Controls, { type Tool } from "./Controls/Controls";
import TileMap from "./TileMap/TileMap";

function App() {
	const [map, _setMap] = useState([
		[1, 1, 1, 1],
		[1, null, null, 1],
		[1, null, null, 1],
		[1, 1, 1, 1],
	]);

	const [palette, _setPalette] = useState({
		0: "#FFFFFF", // White
		1: "#000000", // Black
	});

	const [selectedTool, setSelectedTool] = useState<Tool>("paint");

	return (
		<>
			<div
				style={{
					position: "absolute",
					width: "100vw",
					height: "100vh",
					overflow: "hidden",
				}}
			>
				<TileMap map={map} palette={palette} selectedTool={selectedTool} />
			</div>
			<Controls selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
		</>
	);
}

export default App;
