import { type RefObject, useCallback, useEffect, useRef } from "react";
import "./TileMapCanvas.css";
import { useTileMap } from "../../contexts/TileMapContext";
import { useCanvasInteraction } from "../../hooks/useCanvasInteraction";
import type { TileMap } from "../../types";
import { encodeAddress, getContrastColor } from "../../utils";

interface TileMapCanvasProps {
	mapRef: RefObject<TileMap>;
	onRecenterAndFit?: (fn: () => void) => void;
}

function TileMapCanvas({ mapRef, onRecenterAndFit }: TileMapCanvasProps) {
	const { palette, selectedTool, selectedColor } = useTileMap();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const animationFrameRef = useRef<number | null>(null);

	const { ppu, position, hoveredTileRef, recenterAndFit } =
		useCanvasInteraction({
			mapRef,
			selectedTool,
			selectedColor,
			canvasRef,
			canvasContainerRef,
		});

	useEffect(() => {
		onRecenterAndFit?.(recenterAndFit);
	}, [onRecenterAndFit, recenterAndFit]);

	const render = useCallback(() => {
		const map = mapRef.current;
		if (!map) return;

		const hoveredTile = hoveredTileRef.current;

		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const width = (map.width ?? 0) * ppu;
		const height = (map.height ?? 0) * ppu;

		canvas.width = width;
		canvas.height = height;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		canvas.style.left = `${position.x}px`;
		canvas.style.top = `${position.y}px`;

		ctx.clearRect(0, 0, width, height);
		for (let y = 0; y < map.height; y++) {
			for (let x = 0; x < map.width; x++) {
				const address = encodeAddress(x, y);
				if (address in map.data) {
					const value = map.data[address];
					if (value < Object.keys(palette).length) {
						ctx.fillStyle = palette[value];
						ctx.fillRect(x * ppu, y * ppu, ppu, ppu);
					} else delete map.data[address];
				}
				if (!(address in map.data)) {
					ctx.fillStyle = "#ddd";
					ctx.fillRect(x * ppu, y * ppu, ppu, ppu);
					ctx.fillStyle = "#fff";
					ctx.fillRect(x * ppu, y * ppu, ppu * 0.5, ppu * 0.5);
					ctx.fillRect((x + 0.5) * ppu, (y + 0.5) * ppu, ppu * 0.5, ppu * 0.5);
				}
			}
		}

		if (hoveredTile && selectedTool !== "pan") {
			const address = encodeAddress(hoveredTile.x, hoveredTile.y);
			if (!(address in map.data)) {
				ctx.fillStyle = "#000";
			} else {
				const value = map.data[address];
				const tileColor = value !== null ? (palette[value] ?? "#000") : "#000";
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
