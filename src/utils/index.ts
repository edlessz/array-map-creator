export const getContrastColor = (hexColor: string): string => {
	const hex = hexColor.replace("#", "");
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness > 128 ? "#000000" : "#ffffff";
};

export const encodeAddress = (x: number, y: number): string => `${x},${y}`;

export const decodeAddress = (address: string): { x: number; y: number } => {
	const [x, y] = address.split(",").map(Number);
	return { x, y };
};

// Format 1: { "x,y": tileId }
export const isAddressMap = (val: unknown): val is Record<string, number> =>
	!!val &&
	typeof val === "object" &&
	Object.entries(val).every(
		([k, v]) =>
			typeof k === "string" &&
			k.includes(",") &&
			(typeof v === "number" || v === null || v === undefined),
	);

// Format 2: { tileId: [ "x,y", ... ] }
export const isTileIdMap = (val: unknown): val is Record<string, string[]> =>
	!!val &&
	typeof val === "object" &&
	Object.entries(val).every(
		([k, v]) =>
			!Number.isNaN(k) &&
			Array.isArray(v) &&
			v.every((addr) => typeof addr === "string" && addr.includes(",")),
	);

// Format 3: 2D array
export const is2DArray = (val: unknown): val is unknown[][] =>
	Array.isArray(val) &&
	val.every(
		(row) =>
			Array.isArray(row) &&
			row.every(
				(col) => typeof col === "number" || col === null || col === undefined,
			),
	);
