import { type RefObject, useEffect, useRef } from "react";
import type { TileMap, Tool } from "../types";
import { useCameraControls } from "./useCameraControls";
import { useToolOperations } from "./useToolOperations";
import { useDb } from "./useDb";

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
	const { saveMap } = useDb();
	const { cameraRef, panBy, zoomAt, screenToWorld } = useCameraControls({
		canvasRef,
	});
	const { executeTool } = useToolOperations({
		mapRef,
		selectedTool,
		selectedColor,
	});
	const hoveredTileRef = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		const handleTool = () => {
			const hoveredTile = hoveredTileRef.current;
			if (hoveredTile) executeTool(hoveredTile.x, hoveredTile.y);
		};

		const handlePan = (mouseDownEvent: MouseEvent) => {
			const mouseMove = (moveEvent: MouseEvent) => {
				if (mouseDownEvent.button === 2 || selectedTool === "pan") {
					panBy(moveEvent.movementX, moveEvent.movementY);
				} else if (
					mouseDownEvent.button === 0 &&
					hoveredTileRef.current &&
					selectedTool !== "fill"
				)
					handleTool();
			};
			window.addEventListener("mousemove", mouseMove);
			window.addEventListener(
				"mouseup",
				() => {
					window.removeEventListener("mousemove", mouseMove);
					saveMap(mapRef.current);
				},
				{ once: true },
			);
		};

		const handleZoom = (e: WheelEvent) => {
			e.preventDefault();
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return;

			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const zoomDirection = e.deltaY > 0 ? "out" : "in";

			zoomAt(mouseX, mouseY, zoomDirection);
		};
		const handleHoveredTile = (e: MouseEvent) => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			const worldPos = screenToWorld(mouseX, mouseY);
			hoveredTileRef.current = {
				x: Math.floor(worldPos.x),
				y: Math.floor(worldPos.y),
			};
		};

		const handleContextMenu = (e: MouseEvent) => e.preventDefault();

		const canvas = canvasRef.current;
		canvas?.addEventListener("mousedown", handlePan);
		canvas?.addEventListener("click", handleTool);
		canvas?.addEventListener("contextmenu", handleContextMenu);
		canvas?.addEventListener("wheel", handleZoom, { passive: false });
		window.addEventListener("mousemove", handleHoveredTile);

		return () => {
			canvas?.removeEventListener("mousedown", handlePan);
			canvas?.removeEventListener("click", handleTool);
			canvas?.removeEventListener("contextmenu", handleContextMenu);
			canvas?.removeEventListener("wheel", handleZoom);
			window.removeEventListener("mousemove", handleHoveredTile);
		};
	}, [
		selectedTool,
		canvasRef,
		panBy,
		zoomAt,
		screenToWorld,
		executeTool,
		saveMap,
		mapRef,
	]);

	return {
		cameraRef,
		hoveredTileRef,
	};
};
