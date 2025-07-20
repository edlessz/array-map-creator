import { type RefObject, useEffect, useRef, useState } from "react";
import { DEFAULT_PPU, MIN_PPU, ZOOM_FACTOR } from "../constants";
import type { TileMap, Tool } from "../types";

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
		x: window.innerWidth / 2 - ((mapRef.current?.[0]?.length ?? 0) * ppu) / 2,
		y: window.innerHeight / 2 - ((mapRef.current?.length ?? 0) * ppu) / 2,
	});
	const hoveredTileRef = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		const handleClick = () => {
			if (!mapRef.current) return;
			const hoveredTile = hoveredTileRef.current;
			if (hoveredTile)
				switch (selectedTool) {
					case "paint":
						mapRef.current[hoveredTile.y][hoveredTile.x] = selectedColor;
						break;
					case "erase":
						mapRef.current[hoveredTile.y][hoveredTile.x] = null;
						break;
					case "fill": {
						const targetColor = mapRef.current[hoveredTile.y][hoveredTile.x];
						const fillColor = selectedColor;

						const floodFill = (x: number, y: number) => {
							if (!mapRef.current) return;
							if (
								x < 0 ||
								x >= mapRef.current[0].length ||
								y < 0 ||
								y >= mapRef.current.length
							)
								return;
							if (
								mapRef.current[y][x] === fillColor ||
								mapRef.current[y][x] !== targetColor
							)
								return;
							mapRef.current[y][x] = fillColor;
							floodFill(x - 1, y);
							floodFill(x + 1, y);
							floodFill(x, y - 1);
							floodFill(x, y + 1);
						};
						floodFill(hoveredTile.x, hoveredTile.y);
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
					tileX < mapRef.current[0].length &&
					tileY >= 0 &&
					tileY < mapRef.current.length
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

	return {
		ppu,
		position,
		hoveredTileRef,
	};
};
