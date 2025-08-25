import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useContext,
	useState,
} from "react";
import { DEFAULT_PALETTE } from "../constants";
import type { Tool } from "../types";
import { useDb } from "../hooks/useDb";

interface TileMapContextType {
	palette: Record<number, string>;
	setPalette: Dispatch<SetStateAction<Record<number, string>>>;
	selectedTool: Tool;
	setSelectedTool: Dispatch<SetStateAction<Tool>>;
	selectedColor: number;
	setSelectedColor: Dispatch<SetStateAction<number>>;
	addColor: (color: string) => void;
	updateColor: (colorId: number, color: string) => void;
	deleteColor: (colorId: number) => void;
}

const TileMapContext = createContext<TileMapContextType | undefined>(undefined);

interface TileMapProviderProps {
	children: ReactNode;
}

export function TileMapProvider({ children }: TileMapProviderProps) {
	const { savePalette, loadPalette } = useDb();
	const [palette, setPalette] = useState<Record<number, string>>(
		loadPalette() ?? DEFAULT_PALETTE,
	);

	const [selectedTool, setSelectedTool] = useState<Tool>("paint");
	const [selectedColor, setSelectedColor] = useState<number>(1);

	const addColor = (color: string) => {
		const existingIds = Object.keys(palette).map(Number);
		const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0;
		setPalette({ ...palette, [newId]: color });
		savePalette({ ...palette, [newId]: color });
		setSelectedColor(newId);
	};

	const updateColor = (colorId: number, color: string) => {
		setPalette({ ...palette, [colorId]: color });
		savePalette({ ...palette, [colorId]: color });
	};

	const deleteColor = (colorId: number) => {
		if (Object.keys(palette).length <= 1) return;

		const newPalette = { ...palette };
		delete newPalette[colorId];
		setPalette(newPalette);

		if (selectedColor === colorId) {
			const lastAvailableId = Object.keys(newPalette).length - 1;
			setSelectedColor(lastAvailableId);
		}
	};

	return (
		<TileMapContext.Provider
			value={{
				palette,
				setPalette,
				selectedTool,
				setSelectedTool,
				selectedColor,
				setSelectedColor,
				addColor,
				updateColor,
				deleteColor,
			}}
		>
			{children}
		</TileMapContext.Provider>
	);
}

export function useTileMap() {
	const context = useContext(TileMapContext);
	if (!context)
		throw new Error("useTileMap must be used within a TileMapProvider");
	return context;
}
