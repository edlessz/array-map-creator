export type TileMap = {
	data: Record<string, number>;
	width: number;
	height: number;
} | null;

export type Tool = "pan" | "paint" | "erase" | "fill";
