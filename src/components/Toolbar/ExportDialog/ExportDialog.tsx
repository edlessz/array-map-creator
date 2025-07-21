import { Dialog } from "primereact/dialog";
import {
	forwardRef,
	useImperativeHandle,
	useState,
	type RefObject,
} from "react";
import type { TileMap } from "../../../types";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { encodeAddress } from "../../../utils";
import { Checkbox } from "primereact/checkbox";
import { useTileMap } from "../../../contexts/TileMapContext";

interface ExportDialogProps {
	mapRef: RefObject<TileMap>;
}
export interface ExportDialogRef {
	open: () => void;
}

const ExportDialog = forwardRef<ExportDialogRef, ExportDialogProps>(
	({ mapRef }, ref) => {
		const { palette } = useTileMap();
		const [dialogVisible, setDialogVisible] = useState(false);

		useImperativeHandle(ref, () => ({
			open: () => setDialogVisible(true),
		}));

		const exportTypes = [
			{ label: "Position Key", value: "position-key" },
			{ label: "Tile Key", value: "tile-key" },
			{ label: "2D Array", value: "2d-array" },
		];
		const [selectedType, setSelectedType] = useState(exportTypes[0].value);
		const [commentPalette, setCommentPalette] = useState(false);

		const getExportValue = (): string => {
			if (!mapRef.current) return "";
			let result = "";

			if (commentPalette) {
				result += `// Palette:\n`;
				Object.entries(palette).forEach(([key, value]) => {
					result += `// ${key}: ${value}\n`;
				});
				result += `\n`;
			}

			const data: Record<string, string> = {
				"position-key": JSON.stringify(mapRef.current?.data ?? {}, null, "\t"),
				"tile-key": JSON.stringify(
					Object.values(mapRef.current?.data ?? {}).reduce(
						(acc, value) => {
							acc[value] = Object.entries(mapRef.current?.data ?? {})
								.filter(([, v]) => v === value)
								.map(([k]) => k);
							return acc;
						},
						{} as Record<number, string[]>,
					),
					null,
					"\t",
				),
				"2d-array": `[\n${Array.from(
					{ length: mapRef.current?.height ?? 0 },
					(_, y) =>
						Array.from(
							{ length: mapRef.current?.width ?? 0 },
							(_, x) => mapRef.current?.data[encodeAddress(x, y)] ?? null,
						),
				)
					.map((row) => `\t[${row.map((cell) => cell ?? "null").join(", ")}]`)
					.join(",\n")}\n]`,
			};
			result += data[selectedType] ?? "";

			return result;
		};

		const copy = () => {
			const exportValue = getExportValue();
			navigator.clipboard.writeText(exportValue).then(
				() => {
					console.log("Export value copied to clipboard");
				},
				(err) => {
					console.error("Failed to copy export value: ", err);
				},
			);
		};

		const footerContent = (
			<Button
				label="Copy"
				severity="success"
				disabled={!mapRef.current}
				onClick={copy}
			/>
		);

		return (
			<Dialog
				header="Export"
				visible={dialogVisible}
				onHide={() => setDialogVisible(false)}
				footer={footerContent}
			>
				<div className="ed-form">
					<span>Type:</span>
					<Dropdown
						value={selectedType}
						options={exportTypes}
						onChange={(e) => setSelectedType(e.value)}
					/>
					<span>Comment Palette:</span>
					<Checkbox
						checked={commentPalette}
						onChange={(e) => setCommentPalette(e.checked ?? false)}
					/>
				</div>
				<InputTextarea
					value={getExportValue()}
					readOnly
					style={{ width: "100%", cursor: "pointer", marginTop: "1rem" }}
					onClick={copy}
				/>
			</Dialog>
		);
	},
);

export default ExportDialog;
