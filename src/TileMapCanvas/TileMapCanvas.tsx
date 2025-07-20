import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import "./TileMapCanvas.css";
import { getContrastColor, type TileMap } from "../App";
import type { Tool } from "../Controls/Controls";

interface TileMapCanvas {
	mapRef: RefObject<TileMap>;
	palette: Record<number, string>;
	selectedTool: Tool;
	selectedColor: number;
}

function TileMapCanvas({
	mapRef,
	palette,
	selectedTool,
	selectedColor,
}: TileMapCanvas) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);

	const animationFrameRef = useRef<number | null>(null);
	const [ppu, setPpu] = useState(32);
	const [position, setPosition] = useState({
		x: window.innerWidth / 2 - ((mapRef.current?.[0]?.length ?? 0) * ppu) / 2,
		y: window.innerHeight / 2 - ((mapRef.current?.length ?? 0) * ppu) / 2,
	});
	const hoveredTileRef = useRef<{
		x: number;
		y: number;
	} | null>(null);

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
				const tile = map[y][x];
				if (tile !== null) {
					ctx.fillStyle = palette[tile] ?? "#000";
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
	}, [palette, ppu, position, selectedTool, mapRef]);

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

	useEffect(() => {
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
		const handleContextMenu = (e: MouseEvent) => e.preventDefault();
		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return;

			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			setPosition((prev) => ({
				x: prev.x - mouseX * (zoomFactor - 1),
				y: prev.y - mouseY * (zoomFactor - 1),
			}));

			setPpu((prev) => Math.round(Math.max(1, prev * zoomFactor)));
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
	}, [selectedTool, ppu, mapRef, selectedColor]);

	return (
		<div className="TileMap" ref={canvasContainerRef}>
			<canvas ref={canvasRef} />
		</div>
	);
}

export default TileMapCanvas;
