import { createContext, type ReactNode, useContext, useState } from "react";
import { DEFAULT_PALETTE } from "../constants";
import type { Tool } from "../types";

interface TileMapContextType {
	palette: Record<number, string>;
	setPalette: (palette: Record<number, string>) => void;
	selectedTool: Tool;
	setSelectedTool: (tool: Tool) => void;
	selectedColor: number;
	setSelectedColor: (color: number) => void;
	addColor: (color: string) => void;
	updateColor: (colorId: number, color: string) => void;
	deleteColor: (colorId: number) => void;
}

const TileMapContext = createContext<TileMapContextType | undefined>(undefined);

interface TileMapProviderProps {
	children: ReactNode;
}

export function TileMapProvider({ children }: TileMapProviderProps) {
	const [palette, setPalette] =
		useState<Record<number, string>>(DEFAULT_PALETTE);
	const [selectedTool, setSelectedTool] = useState<Tool>("paint");
	const [selectedColor, setSelectedColor] = useState<number>(1);

	const addColor = (color: string) => {
		const newId = Object.keys(palette).length;
		setPalette({ ...palette, [newId]: color });
		setSelectedColor(newId);
	};

	const updateColor = (colorId: number, color: string) => {
		setPalette({ ...palette, [colorId]: color });
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
