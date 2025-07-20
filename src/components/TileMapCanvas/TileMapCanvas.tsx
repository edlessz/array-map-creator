import { type RefObject, useCallback, useEffect, useRef } from "react";
import "./TileMapCanvas.css";
import { useTileMap } from "../../contexts/TileMapContext";
import { useCanvasInteraction } from "../../hooks/useCanvasInteraction";
import type { TileMap } from "../../types";
import { getContrastColor } from "../../utils";

interface TileMapCanvasProps {
	mapRef: RefObject<TileMap>;
}

function TileMapCanvas({ mapRef }: TileMapCanvasProps) {
	const { palette, selectedTool, selectedColor } = useTileMap();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const animationFrameRef = useRef<number | null>(null);

	const { ppu, position, hoveredTileRef } = useCanvasInteraction({
		mapRef,
		selectedTool,
		selectedColor,
		canvasRef,
		canvasContainerRef,
	});

	const render = useCallback(() => {
		const map = mapRef.current;
		if (!map) return;

		const hoveredTile = hoveredTileRef.current;

		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const width = (map[0]?.length ?? 0) * ppu;
		const height = map.length * ppu;

		canvas.width = width;
		canvas.height = height;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		canvas.style.left = `${position.x}px`;
		canvas.style.top = `${position.y}px`;

		ctx.clearRect(0, 0, width, height);
		for (let y = 0; y < map.length; y++) {
			for (let x = 0; x < map[y].length; x++) {
				if (map[y][x] !== null && !palette[map[y][x] as number])
					map[y][x] = null; // Remove invalid tiles
				const tile = map[y][x];
				if (tile !== null) {
					ctx.fillStyle = palette[tile];
					ctx.fillRect(x * ppu, y * ppu, ppu, ppu);
				} else {
					ctx.fillStyle = "#ddd";
					ctx.fillRect(x * ppu, y * ppu, ppu, ppu);
					ctx.fillStyle = "#fff";
					ctx.fillRect(x * ppu, y * ppu, ppu * 0.5, ppu * 0.5);
					ctx.fillRect((x + 0.5) * ppu, (y + 0.5) * ppu, ppu * 0.5, ppu * 0.5);
				}
			}
		}

		if (hoveredTile && selectedTool !== "pan") {
			const tileValue = map[hoveredTile.y][hoveredTile.x];
			if (tileValue === null) {
				ctx.fillStyle = "#000";
			} else {
				const tileColor =
					tileValue !== null ? (palette[tileValue] ?? "#000") : "#000";
				ctx.fillStyle = getContrastColor(tileColor);
			}

			const pulseAlpha =
				0.1 + (Math.sin(performance.now() / 100) * 0.5 + 0.5) * 0.1;
			ctx.globalAlpha = pulseAlpha;
			ctx.fillRect(hoveredTile.x * ppu, hoveredTile.y * ppu, ppu, ppu);
			ctx.globalAlpha = 1.0;
		}
	}, [palette, ppu, position, selectedTool, mapRef, hoveredTileRef]);

	useEffect(() => {
		const animate = () => {
			render();
			animationFrameRef.current = requestAnimationFrame(animate);
		};
		animationFrameRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationFrameRef.current)
				cancelAnimationFrame(animationFrameRef.current);
		};
	}, [render]);

	return (
		<div className="TileMap" ref={canvasContainerRef}>
			<canvas ref={canvasRef} />
		</div>
	);
}

export default TileMapCanvas;
