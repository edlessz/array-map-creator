import type { TileMap } from "../types";

const STORAGE_PREFIX = "tile-mapster_";
const STORAGE_KEYS = Object.entries({
	MAP_DATA: `mapData`,
	CAMERA_POSITION: "cameraPosition",
	PALETTE: "palette",
	SELECTED_TOOL: "selectedTool",
}).reduce(
	(acc, [k, v]) => {
		acc[k] = STORAGE_PREFIX + v;
		return acc;
	},
	{} as Record<string, string>,
);

export const useDb = () => {
	const saveMap = (mapData: TileMap) => {
		localStorage.setItem(STORAGE_KEYS.MAP_DATA, JSON.stringify(mapData));
	};

	const loadMap = (): TileMap => {
		try {
			const data = localStorage.getItem(STORAGE_KEYS.MAP_DATA);
			return data ? JSON.parse(data) : {};
		} catch {
			return {};
		}
	};

	const saveCamera = (position: { x: number; y: number; ppu: number }) => {
		localStorage.setItem(
			STORAGE_KEYS.CAMERA_POSITION,
			JSON.stringify(position),
		);
	};

	const loadCamera = (): { x: number; y: number; ppu: number } | null => {
		try {
			const data = localStorage.getItem(STORAGE_KEYS.CAMERA_POSITION);
			return data ? JSON.parse(data) : null;
		} catch {
			return null;
		}
	};

	const savePalette = (palette: Record<number, string>) => {
		localStorage.setItem(STORAGE_KEYS.PALETTE, JSON.stringify(palette));
	};

	const loadPalette = (): Record<number, string> | null => {
		try {
			const data = localStorage.getItem(STORAGE_KEYS.PALETTE);
			return data ? JSON.parse(data) : null;
		} catch {
			return null;
		}
	};

	return {
		saveMap,
		loadMap,
		saveCamera,
		loadCamera,
		savePalette,
		loadPalette,
	};
};
