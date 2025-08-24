export const DEFAULT_PPU = 32;

export const DEFAULT_PALETTE = {
	0: "#FFFFFF", // White
	1: "#000000", // Black
};

export const ZOOM_FACTOR = {
	IN: 1.1,
	OUT: 0.9,
};

export const MIN_PPU = 16;

export const RENDERING_CONSTANTS = {
	GRID_LINE_WIDTH: 2,
	EMPTY_TILE_BACKGROUND: "#ddd",
	EMPTY_TILE_PATTERN: "#fff",
	CHECKERBOARD_SIZE: 0.5,
} as const;

export const ANIMATION_CONSTANTS = {
	PULSE_BASE_ALPHA: 0.1,
	PULSE_INTENSITY: 0.1,
	PULSE_FREQUENCY: 100,
	SINE_AMPLITUDE: 0.5,
} as const;

export const FILL_CONSTANTS = {
	MAX_TILES: 1000,
} as const;
