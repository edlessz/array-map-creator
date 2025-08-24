import { type RefObject, useCallback, useEffect, useRef } from "react";
import "./TileMapCanvas.css";
import { ANIMATION_CONSTANTS, RENDERING_CONSTANTS } from "../../constants";
import { useTileMap } from "../../contexts/TileMapContext";
import { useCanvasInteraction } from "../../hooks/useCanvasInteraction";
import type { TileMap } from "../../types";
import { encodeAddress, getContrastColor } from "../../utils";

interface TileMapCanvasProps {
	mapRef: RefObject<TileMap>;
}

function TileMapCanvas({ mapRef }: TileMapCanvasProps) {
	const { palette, selectedTool, selectedColor } = useTileMap();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | null>(null);

	const { cameraRef, hoveredTileRef } = useCanvasInteraction({
		mapRef,
		canvasRef,
		selectedTool,
		selectedColor,
	});

	const render = useCallback(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas.style.width = `100vw`;
		canvas.style.height = `100vh`;

		ctx.resetTransform();
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const camera = cameraRef.current;
		if (!camera) return;

		ctx.scale(camera.ppu, camera.ppu);
		ctx.translate(
			-camera.x + canvas.width / 2 / camera.ppu,
			-camera.y + canvas.height / 2 / camera.ppu,
		);

		const topLeft = {
			x: camera.x - canvas.width / 2 / camera.ppu,
			y: camera.y - canvas.height / 2 / camera.ppu,
		};
		const bottomRight = {
			x: camera.x + canvas.width / 2 / camera.ppu,
			y: camera.y + canvas.height / 2 / camera.ppu,
		};

		for (let y = Math.floor(topLeft.y); y < Math.ceil(bottomRight.y); y++) {
			for (let x = Math.floor(topLeft.x); x < Math.ceil(bottomRight.x); x++) {
				const address = encodeAddress(x, y);
				if (address in mapRef.current) {
					const value = mapRef.current[address];
					if (value < Object.keys(palette).length) {
						ctx.fillStyle = palette[value];
						ctx.fillRect(x, y, 1, 1);
					} else delete mapRef.current[address];
				}
				if (!(address in mapRef.current)) {
					ctx.fillStyle = RENDERING_CONSTANTS.EMPTY_TILE_BACKGROUND;
					ctx.fillRect(x, y, 1, 1);
					ctx.fillStyle = RENDERING_CONSTANTS.EMPTY_TILE_PATTERN;
					ctx.fillRect(
						x,
						y,
						RENDERING_CONSTANTS.CHECKERBOARD_SIZE,
						RENDERING_CONSTANTS.CHECKERBOARD_SIZE,
					);
					ctx.fillRect(
						x + RENDERING_CONSTANTS.CHECKERBOARD_SIZE,
						y + RENDERING_CONSTANTS.CHECKERBOARD_SIZE,
						RENDERING_CONSTANTS.CHECKERBOARD_SIZE,
						RENDERING_CONSTANTS.CHECKERBOARD_SIZE,
					);
				}
			}
		}

		// Draw grid lines at x=0 and y=0
		ctx.strokeStyle = "#000";
		ctx.lineWidth = RENDERING_CONSTANTS.GRID_LINE_WIDTH / camera.ppu;

		// Vertical line at x=0
		if (topLeft.x <= 0 && bottomRight.x >= 0) {
			ctx.beginPath();
			ctx.moveTo(0, topLeft.y);
			ctx.lineTo(0, bottomRight.y);
			ctx.stroke();
		}

		// Horizontal line at y=0
		if (topLeft.y <= 0 && bottomRight.y >= 0) {
			ctx.beginPath();
			ctx.moveTo(topLeft.x, 0);
			ctx.lineTo(bottomRight.x, 0);
			ctx.stroke();
		}

		const hoveredTile = hoveredTileRef.current;
		if (hoveredTile && selectedTool !== "pan") {
			const address = encodeAddress(hoveredTile.x, hoveredTile.y);
			if (!(address in mapRef.current)) {
				ctx.fillStyle = "#000";
			} else {
				const value = mapRef.current[address];
				const tileColor = value !== null ? (palette[value] ?? "#000") : "#000";
				ctx.fillStyle = getContrastColor(tileColor);
			}

			const pulseAlpha =
				ANIMATION_CONSTANTS.PULSE_BASE_ALPHA +
				(Math.sin(performance.now() / ANIMATION_CONSTANTS.PULSE_FREQUENCY) *
					ANIMATION_CONSTANTS.SINE_AMPLITUDE +
					ANIMATION_CONSTANTS.SINE_AMPLITUDE) *
					ANIMATION_CONSTANTS.PULSE_INTENSITY;
			ctx.globalAlpha = pulseAlpha;
			ctx.fillRect(hoveredTile.x, hoveredTile.y, 1, 1);
			ctx.globalAlpha = 1.0;
		}
	}, [palette, mapRef, cameraRef, hoveredTileRef, selectedTool]);

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

	return <canvas className="TileMap" ref={canvasRef} />;
}

export default TileMapCanvas;
