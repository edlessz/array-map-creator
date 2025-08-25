import { useRef } from "react";
import "./App.css";
import { ConfirmDialog } from "primereact/confirmdialog";
import CanvasEditor from "./components/CanvasEditor/CanvasEditor";
import Toolbar from "./components/Toolbar/Toolbar";
import { TileMapProvider } from "./contexts/TileMapContext";
import { ToastProvider } from "./contexts/ToastContext";
import type { TileMap } from "./types";
import { useDb } from "./hooks/useDb";

function App() {
	const { loadMap } = useDb();
	const mapRef = useRef<TileMap>(loadMap() ?? {});

	return (
		<ToastProvider>
			<TileMapProvider>
				<CanvasEditor mapRef={mapRef} />
				<Toolbar mapRef={mapRef} />
				<ConfirmDialog />
			</TileMapProvider>
		</ToastProvider>
	);
}

export default App;
