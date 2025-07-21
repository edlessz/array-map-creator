import { useRef } from "react";
import "./App.css";
import { ConfirmDialog } from "primereact/confirmdialog";
import TileMapCanvas from "./components/TileMapCanvas/TileMapCanvas";
import Toolbar from "./components/Toolbar/Toolbar";
import { TileMapProvider } from "./contexts/TileMapContext";
import type { TileMap } from "./types";

function App() {
	const mapRef = useRef<TileMap>(null);
	const recenterFnRef = useRef<(() => void) | null>(null);

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
				<TileMapCanvas 
					mapRef={mapRef} 
					onRecenterAndFit={(fn) => (recenterFnRef.current = fn)}
				/>
			</div>
			<Toolbar mapRef={mapRef} recenterFn={() => recenterFnRef.current?.()} />
			<ConfirmDialog />
		</TileMapProvider>
	);
}

export default App;
