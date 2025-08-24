import type { RefObject } from "react";
import { FILL_CONSTANTS } from "../constants";
import { useToast } from "../contexts/ToastContext";
import type { TileMap, Tool } from "../types";
import { encodeAddress } from "../utils";

interface UseToolOperationsProps {
	mapRef: RefObject<TileMap>;
	selectedTool: Tool;
	selectedColor: number;
}

export const useToolOperations = ({
	mapRef,
	selectedTool,
	selectedColor,
}: UseToolOperationsProps) => {
	const { error } = useToast();

	const executeTool = (tileX: number, tileY: number) => {
		if (!mapRef.current) return;

		const address = encodeAddress(tileX, tileY);

		switch (selectedTool) {
			case "paint":
				mapRef.current[address] = selectedColor;
				break;
			case "erase":
				delete mapRef.current[address];
				break;
			case "fill":
				executeFloodFill(tileX, tileY);
				break;
		}
	};

	const executeFloodFill = (startX: number, startY: number) => {
		if (!mapRef.current) return;

		const startAddress = encodeAddress(startX, startY);
		const targetColor = mapRef.current[startAddress];
		const fillColor = selectedColor;

		if (targetColor === fillColor) return;

		// First pass: find all tiles to fill
		const tilesToFill = new Set<string>();
		const stack: { x: number; y: number }[] = [{ x: startX, y: startY }];
		const maxTiles = FILL_CONSTANTS.MAX_TILES;

		while (stack.length > 0 && tilesToFill.size < maxTiles) {
			const val = stack.pop();
			if (!val) break;
			const { x, y } = val;

			const currentAddress = encodeAddress(x, y);
			const currentColor = mapRef.current[currentAddress];

			if (currentColor === fillColor || currentColor !== targetColor) continue;

			if (tilesToFill.has(currentAddress)) continue;

			tilesToFill.add(currentAddress);

			stack.push(
				{ x: x - 1, y },
				{ x: x + 1, y },
				{ x, y: y - 1 },
				{ x, y: y + 1 },
			);
		}

		// Check if we exceeded the limit
		if (tilesToFill.size >= maxTiles) {
			error({
				detail: `Fill operation too large (${maxTiles}+ tiles).`,
			});
			return;
		}

		// Second pass: actually fill the tiles
		for (const tileAddress of tilesToFill)
			mapRef.current[tileAddress] = fillColor;
	};

	return { executeTool };
};
