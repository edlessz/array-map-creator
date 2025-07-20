import { useRef } from "react";
import "./App.css";
import { ConfirmDialog } from "primereact/confirmdialog";
import TileMapCanvas from "./components/TileMapCanvas/TileMapCanvas";
import Toolbar from "./components/Toolbar/Toolbar";
import { TileMapProvider } from "./contexts/TileMapContext";
import type { TileMap } from "./types";

function App() {
	const mapRef = useRef<TileMap>(null);

	return (
		<TileMapProvider>
			<div
				style={{
					position: "absolute",
					width: "100vw",
					height: "100vh",
					overflow: "hidden",
				}}
			>
				<TileMapCanvas mapRef={mapRef} />
			</div>
			<Toolbar mapRef={mapRef} />
			<ConfirmDialog />
		</TileMapProvider>
	);
}

export default App;
