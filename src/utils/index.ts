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
