import { useRef, useState } from "react";
import "./App.css";
import { ConfirmDialog } from "primereact/confirmdialog";
import Controls, { type Tool } from "./Controls/Controls";
import TileMapCanvas from "./TileMapCanvas/TileMapCanvas";

function App() {
	const mapRef = useRef<TileMap>(null);

	const [palette, setPalette] = useState<Record<number, string>>({
		0: "#FFFFFF", // White
		1: "#000000", // Black
	});

	const [selectedTool, setSelectedTool] = useState<Tool>("paint");
	const [selectedColor, setSelectedColor] = useState<number>(1);

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
				<TileMapCanvas
					mapRef={mapRef}
					palette={palette}
					selectedTool={selectedTool}
					selectedColor={selectedColor}
				/>
			</div>
			<Controls
				mapRef={mapRef}
				selectedTool={selectedTool}
				setSelectedTool={setSelectedTool}
				palette={palette}
				setPalette={setPalette}
				selectedColor={selectedColor}
				setSelectedColor={setSelectedColor}
			/>
			<ConfirmDialog />
		</>
	);
}

export default App;

export type TileMap = (number | null)[][] | null;

export const getContrastColor = (hexColor: string): string => {
	const hex = hexColor.replace("#", "");
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness > 128 ? "#000000" : "#ffffff";
};
