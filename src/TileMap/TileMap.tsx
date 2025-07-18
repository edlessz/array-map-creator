import { useCallback, useEffect, useRef, useState } from "react";
import "./TileMap.css";
import type { Tool } from "../Controls/Controls";

interface MapProps {
	map: (number | null)[][];
	setMap: React.Dispatch<React.SetStateAction<(number | null)[][]>>;
	palette: Record<number, string>;
	selectedTool: Tool;
}

const getContrastColor = (hexColor: string): string => {
	const hex = hexColor.replace("#", "");
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness > 128 ? "#000000" : "#ffffff";
};

function TileMap({ map, setMap, palette, selectedTool }: MapProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const [ppu, setPpu] = useState(32);
	const [position, setPosition] = useState({
		x: window.innerWidth / 2 - ((map[0]?.length ?? 0) * ppu) / 2,
		y: window.innerHeight / 2 - (map.length * ppu) / 2,
	});
	const [hoveredTile, setHoveredTile] = useState<{
		x: number;
		y: number;
	} | null>(null);

	const render = useCallback(() => {
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
	}, [map, palette, ppu, position, hoveredTile, selectedTool]);

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
				} else if (mouseDownEvent.button === 0 && hoveredTile) handleClick();
			};
			window.addEventListener("mousemove", mouseMove);
			window.addEventListener(
				"mouseup",
				() => window.removeEventListener("mousemove", mouseMove),
				{ once: true },
			);
		};

		const handleClick = () => {
			if (hoveredTile)
				switch (selectedTool) {
					case "paint":
						setMap((currentMap) =>
							currentMap.map((row, y) =>
								row.map((cell, x) =>
									x === hoveredTile.x && y === hoveredTile.y ? 1 : cell,
								),
							),
						);
						break;
					case "erase":
						setMap((currentMap) =>
							currentMap.map((row, y) =>
								row.map((cell, x) =>
									x === hoveredTile.x && y === hoveredTile.y ? null : cell,
								),
							),
						);
						break;
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
			const canvas = canvasRef.current;
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			if (
				mouseX >= 0 &&
				mouseX < rect.width &&
				mouseY >= 0 &&
				mouseY < rect.height
			) {
				const tileX = Math.floor(mouseX / ppu);
				const tileY = Math.floor(mouseY / ppu);
				setHoveredTile({ x: tileX, y: tileY });
			} else setHoveredTile(null);
		};

		window.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("click", handleClick);
		window.addEventListener("contextmenu", handleContextMenu);
		window.addEventListener("wheel", handleWheel, { passive: false });
		window.addEventListener("mousemove", handleMouseMove);
		return () => {
			window.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("click", handleClick);
			window.removeEventListener("contextmenu", handleContextMenu);
			window.removeEventListener("wheel", handleWheel);
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [selectedTool, setMap, hoveredTile, ppu]);

	return (
		<div className="TileMap">
			<canvas ref={canvasRef} className="TileMap" />
		</div>
	);
}

export default TileMap;
