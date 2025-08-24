import { type RefObject, useEffect, useRef } from "react";
import {
	DEFAULT_PPU,
	FILL_CONSTANTS,
	MIN_PPU,
	ZOOM_FACTOR,
} from "../constants";
import { useToast } from "../contexts/ToastContext";
import type { TileMap, Tool } from "../types";
import { encodeAddress } from "../utils";

interface UseCanvasInteractionProps {
	mapRef: RefObject<TileMap>;
	canvasRef: RefObject<HTMLCanvasElement | null>;
	selectedTool: Tool;
	selectedColor: number;
}

export const useCanvasInteraction = ({
	mapRef,
	canvasRef,
	selectedTool,
	selectedColor,
}: UseCanvasInteractionProps) => {
	const cameraRef = useRef({ x: 0, y: 0, ppu: DEFAULT_PPU });
	const hoveredTileRef = useRef<{ x: number; y: number } | null>(null);
	const { error } = useToast();

	useEffect(() => {
		const handleClick = () => {
			const hoveredTile = hoveredTileRef.current;
			if (hoveredTile) {
				const address = encodeAddress(hoveredTile.x, hoveredTile.y);
				switch (selectedTool) {
					case "paint":
						mapRef.current[address] = selectedColor;
						break;
					case "erase":
						delete mapRef.current[address];
						break;
					case "fill": {
						const targetColor = mapRef.current[address];
						const fillColor = selectedColor;

						if (targetColor === fillColor) break;

						// First pass: find all tiles to fill
						const tilesToFill = new Set<string>();
						const stack: { x: number; y: number }[] = [
							{ x: hoveredTile.x, y: hoveredTile.y },
						];
						const maxTiles = FILL_CONSTANTS.MAX_TILES;

						while (stack.length > 0 && tilesToFill.size < maxTiles) {
							const val = stack.pop();
							if (!val) break;
							const { x, y } = val;

							const currentAddress = encodeAddress(x, y);
							const currentColor = mapRef.current[currentAddress];

							if (currentColor === fillColor || currentColor !== targetColor)
								continue;

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
							break;
						}

						// Second pass: actually fill the tiles
						for (const tileAddress of tilesToFill)
							mapRef.current[tileAddress] = fillColor;

						break;
					}
				}
			}
		};

		const handleMouseDown = (mouseDownEvent: MouseEvent) => {
			const mouseMove = (moveEvent: MouseEvent) => {
				if (mouseDownEvent.button === 2 || selectedTool === "pan") {
					cameraRef.current.x -= moveEvent.movementX / cameraRef.current.ppu;
					cameraRef.current.y -= moveEvent.movementY / cameraRef.current.ppu;
				} else if (mouseDownEvent.button === 0 && hoveredTileRef.current)
					handleClick();
			};
			window.addEventListener("mousemove", mouseMove);
			window.addEventListener(
				"mouseup",
				() => window.removeEventListener("mousemove", mouseMove),
				{ once: true },
			);
		};

		const handleContextMenu = (e: MouseEvent) => e.preventDefault();
		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			const zoomFactor = e.deltaY > 0 ? ZOOM_FACTOR.OUT : ZOOM_FACTOR.IN;
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect || !canvas) return;

			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			const oldPpu = cameraRef.current.ppu;
			const newPpu = Math.round(Math.max(MIN_PPU, oldPpu * zoomFactor));

			// Convert mouse position to world coordinates before zoom
			const worldMouseX =
				cameraRef.current.x + (mouseX - canvas.width / 2) / oldPpu;
			const worldMouseY =
				cameraRef.current.y + (mouseY - canvas.height / 2) / oldPpu;

			// Update PPU first
			cameraRef.current.ppu = newPpu;

			// Adjust camera to keep mouse position fixed in world space
			cameraRef.current.x = worldMouseX - (mouseX - canvas.width / 2) / newPpu;
			cameraRef.current.y = worldMouseY - (mouseY - canvas.height / 2) / newPpu;
		};
		const handleMouseMove = (e: MouseEvent) => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			// Convert screen coordinates to world tile coordinates
			const worldX =
				cameraRef.current.x +
				(mouseX - canvas.width / 2) / cameraRef.current.ppu;
			const worldY =
				cameraRef.current.y +
				(mouseY - canvas.height / 2) / cameraRef.current.ppu;

			hoveredTileRef.current = {
				x: Math.floor(worldX),
				y: Math.floor(worldY),
			};
		};

		const canvas = canvasRef.current;
		canvas?.addEventListener("mousedown", handleMouseDown);
		canvas?.addEventListener("click", handleClick);
		canvas?.addEventListener("contextmenu", handleContextMenu);
		canvas?.addEventListener("wheel", handleWheel, { passive: false });
		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			canvas?.removeEventListener("mousedown", handleMouseDown);
			canvas?.removeEventListener("click", handleClick);
			canvas?.removeEventListener("contextmenu", handleContextMenu);
			canvas?.removeEventListener("wheel", handleWheel);
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [selectedTool, mapRef, canvasRef, selectedColor, error]);

	return {
		cameraRef,
		hoveredTileRef,
	};
};
