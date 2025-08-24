import { useRef } from "react";
import "./App.css";
import { ConfirmDialog } from "primereact/confirmdialog";
import TileMapCanvas from "./components/TileMapCanvas/TileMapCanvas";
import Toolbar from "./components/Toolbar/Toolbar";
import { TileMapProvider } from "./contexts/TileMapContext";
import { ToastProvider } from "./contexts/ToastContext";
import type { TileMap } from "./types";

function App() {
	const mapRef = useRef<TileMap>({});

	return (
		<ToastProvider>
			<TileMapProvider>
				<TileMapCanvas mapRef={mapRef} />
				<Toolbar mapRef={mapRef} />
				<ConfirmDialog />
			</TileMapProvider>
		</ToastProvider>
	);
}

export default App;
