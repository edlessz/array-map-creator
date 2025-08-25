import { type RefObject, useRef } from "react";
import { DEFAULT_PPU, MIN_PPU, ZOOM_FACTOR } from "../constants";
import { useDb } from "./useDb";

interface UseCameraControlsProps {
	canvasRef: RefObject<HTMLCanvasElement | null>;
}

export const useCameraControls = ({ canvasRef }: UseCameraControlsProps) => {
	const { loadCamera, saveCamera } = useDb();
	const cameraRef = useRef(loadCamera() ?? { x: 0, y: 0, ppu: DEFAULT_PPU });

	const panBy = (deltaX: number, deltaY: number) => {
		cameraRef.current.x -= deltaX / cameraRef.current.ppu;
		cameraRef.current.y -= deltaY / cameraRef.current.ppu;
		saveCamera(cameraRef.current);
	};

	const zoomAt = (
		mouseX: number,
		mouseY: number,
		zoomDirection: "in" | "out",
	) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const zoomFactor =
			zoomDirection === "in" ? ZOOM_FACTOR.IN : ZOOM_FACTOR.OUT;
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

		saveCamera(cameraRef.current);
	};

	const screenToWorld = (screenX: number, screenY: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };

		return {
			x:
				cameraRef.current.x +
				(screenX - canvas.width / 2) / cameraRef.current.ppu,
			y:
				cameraRef.current.y +
				(screenY - canvas.height / 2) / cameraRef.current.ppu,
		};
	};

	return {
		cameraRef,
		panBy,
		zoomAt,
		screenToWorld,
	};
};
