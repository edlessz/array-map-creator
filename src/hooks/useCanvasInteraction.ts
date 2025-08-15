import { type RefObject, useEffect, useRef, useState } from "react";
import { DEFAULT_PPU, MIN_PPU, ZOOM_FACTOR } from "../constants";
import type { TileMap, Tool } from "../types";
import { encodeAddress } from "../utils";

interface UseCanvasInteractionProps {
	mapRef: RefObject<TileMap>;
	selectedTool: Tool;
	selectedColor: number;
	canvasRef: RefObject<HTMLCanvasElement | null>;
	canvasContainerRef: RefObject<HTMLDivElement | null>;
}

export const useCanvasInteraction = ({
	mapRef,
	selectedTool,
	selectedColor,
	canvasRef,
	canvasContainerRef,
}: UseCanvasInteractionProps) => {
	const [ppu, setPpu] = useState(DEFAULT_PPU);
	const [position, setPosition] = useState({
		x: window.innerWidth / 2 - ((mapRef.current?.width ?? 0) * ppu) / 2,
		y: window.innerHeight / 2 - ((mapRef.current?.height ?? 0) * ppu) / 2,
	});
	const hoveredTileRef = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		const handleClick = () => {
			if (!mapRef.current) return;
			const hoveredTile = hoveredTileRef.current;
			if (hoveredTile) {
				const address = encodeAddress(hoveredTile.x, hoveredTile.y);
				switch (selectedTool) {
					case "paint":
						mapRef.current.data[address] = selectedColor;
						break;
					case "erase":
						delete mapRef.current.data[address];
						break;
					case "fill": {
						const targetColor = mapRef.current.data[address];
						const fillColor = selectedColor;

						if (targetColor === fillColor) break;

						const stack: { x: number; y: number }[] = [
							{ x: hoveredTile.x, y: hoveredTile.y },
						];
						let filledTiles = 0;
						const maxTiles = 10000;

						while (stack.length > 0 && filledTiles < maxTiles) {
							const val = stack.pop();
							if (!val) break;
							const { x, y } = val;

							if (
								x < 0 ||
								x >= mapRef.current.width ||
								y < 0 ||
								y >= mapRef.current.height
							) {
								continue;
							}

							const currentAddress = encodeAddress(x, y);
							const currentColor = mapRef.current.data[currentAddress];

							if (currentColor === fillColor || currentColor !== targetColor)
								continue;

							mapRef.current.data[currentAddress] = fillColor;
							filledTiles++;

							stack.push(
								{ x: x - 1, y },
								{ x: x + 1, y },
								{ x, y: y - 1 },
								{ x, y: y + 1 },
							);
						}

						break;
					}
				}
			}
		};

		const handleMouseDown = (mouseDownEvent: MouseEvent) => {
			const mouseMove = (moveEvent: MouseEvent) => {
				if (mouseDownEvent.button === 2 || selectedTool === "pan") {
					setPosition((prev) => ({
						x: prev.x + moveEvent.movementX,
						y: prev.y + moveEvent.movementY,
					}));
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
			if (!rect) return;

			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			setPosition((prev) => ({
				x: prev.x - mouseX * (zoomFactor - 1),
				y: prev.y - mouseY * (zoomFactor - 1),
			}));

			setPpu((prev) => Math.round(Math.max(MIN_PPU, prev * zoomFactor)));
		};
		const handleMouseMove = (e: MouseEvent) => {
			if (!mapRef.current) return;
			const canvas = canvasRef.current;
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			hoveredTileRef.current = null;
			const mouseInCanvas = Array.from(
				document.querySelectorAll(":hover"),
			).includes(canvas);
			if (
				mouseX >= 0 &&
				mouseX < rect.width &&
				mouseY >= 0 &&
				mouseY < rect.height &&
				mouseInCanvas
			) {
				const tileX = Math.floor(mouseX / ppu);
				const tileY = Math.floor(mouseY / ppu);
				if (
					tileX >= 0 &&
					tileX < mapRef.current.width &&
					tileY >= 0 &&
					tileY < mapRef.current.height
				)
					hoveredTileRef.current = { x: tileX, y: tileY };
			}
		};

		const canvasContainer = canvasContainerRef.current;
		canvasContainer?.addEventListener("mousedown", handleMouseDown);
		canvasContainer?.addEventListener("click", handleClick);
		canvasContainer?.addEventListener("contextmenu", handleContextMenu);
		canvasContainer?.addEventListener("wheel", handleWheel, { passive: false });
		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			canvasContainer?.removeEventListener("mousedown", handleMouseDown);
			canvasContainer?.removeEventListener("click", handleClick);
			canvasContainer?.removeEventListener("contextmenu", handleContextMenu);
			canvasContainer?.removeEventListener("wheel", handleWheel);
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [selectedTool, ppu, mapRef, canvasRef, canvasContainerRef, selectedColor]);

	const recenterAndFit = () => {
		if (!mapRef.current) return;

		const map = mapRef.current;
		const screenWidth = window.innerWidth;
		const screenHeight = window.innerHeight;

		// Calculate ppu to fit the map comfortably (80% of screen)
		const maxWidth = screenWidth * 0.8;
		const maxHeight = screenHeight * 0.8;
		const calculatedPpu = Math.min(
			Math.floor(maxWidth / map.width),
			Math.floor(maxHeight / map.height),
		);

		const newPpu = Math.max(MIN_PPU, calculatedPpu);
		setPpu(newPpu);

		// Center the map
		const mapPixelWidth = map.width * newPpu;
		const mapPixelHeight = map.height * newPpu;
		setPosition({
			x: (screenWidth - mapPixelWidth) / 2,
			y: (screenHeight - mapPixelHeight) / 2,
		});
	};

	return {
		ppu,
		position,
		hoveredTileRef,
		recenterAndFit,
	};
};
