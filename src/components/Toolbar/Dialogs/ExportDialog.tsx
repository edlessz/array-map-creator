import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import {
	forwardRef,
	type RefObject,
	useImperativeHandle,
	useState,
} from "react";
import { useTileMap } from "../../../contexts/TileMapContext";
import { useToast } from "../../../contexts/ToastContext";
import type { TileMap } from "../../../types";
import { decodeAddress, encodeAddress } from "../../../utils";

interface ExportDialogProps {
	mapRef: RefObject<TileMap>;
}
export interface ExportDialogRef {
	open: () => void;
}

const ExportDialog = forwardRef<ExportDialogRef, ExportDialogProps>(
	({ mapRef }, ref) => {
		const { success, error } = useToast();
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
		const [template, setTemplate] = useState("x,y");

		const toTemplate = (encodedAddress: string): string => {
			if (!template) return encodedAddress;
			const { x, y } = decodeAddress(encodedAddress);
			return template.replace("x", x.toString()).replace("y", y.toString());
		};

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
				"position-key": JSON.stringify(
					Object.fromEntries(
						Object.entries(mapRef.current?.data ?? {}).map(([k, v]) => [
							toTemplate(k),
							v,
						]),
					),
					null,
					"\t",
				),
				"tile-key": JSON.stringify(
					Object.values(mapRef.current?.data ?? {}).reduce(
						(acc, value) => {
							acc[value] = Object.entries(mapRef.current?.data ?? {})
								.filter(([, v]) => v === value)
								.map(([k]) => toTemplate(k));
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
				() => success({ detail: "Export copied to clipboard!" }),
				() => error({ detail: `Failed to copy to clipboard.` }),
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
					{selectedType !== "2d-array" && (
						<>
							<span>Template:</span>
							<InputText
								value={template}
								spellCheck="false"
								onChange={(e) => setTemplate(e.target.value ?? "x,y")}
								placeholder="x,y"
							/>
						</>
					)}
					<span>Comment Palette:</span>
					<Checkbox
						checked={commentPalette}
						onChange={(e) => setCommentPalette(e.checked ?? false)}
					/>
				</div>
				<InputTextarea
					value={getExportValue()}
					readOnly
					style={{
						width: "100%",
						height: "150px",
						cursor: "pointer",
						marginTop: "1rem",
					}}
					onClick={copy}
				/>
			</Dialog>
		);
	},
);

export default ExportDialog;
