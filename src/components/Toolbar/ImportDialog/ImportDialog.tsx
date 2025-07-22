import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
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
import { decodeAddress } from "../../../utils";
import { useCanvasInteraction } from "../../../hooks/useCanvasInteraction";

interface ImportDialogProps {
	mapRef: RefObject<TileMap>;
}
export interface ImportDialogRef {
	open: () => void;
}

const ImportDialog = forwardRef<ImportDialogRef, ImportDialogProps>(
	({ mapRef }, ref) => {
		const { success, error } = useToast();
		const { palette } = useTileMap();
		const [dialogVisible, setDialogVisible] = useState(false);
		const [dataValid, setDataValid] = useState(true);

		useImperativeHandle(ref, () => ({
			open: () => setDialogVisible(true),
		}));

		const [importData, setImportData] = useState("");

		const handleImport = () =>
			confirmDialog({
				message:
					"Are you sure you want to import this data? This will overwrite the current map.",
				header: "Confirm Import",
				icon: "pi pi-exclamation-triangle",
				accept: () => {
					if (!dataValid) return error({ detail: "Invalid data format!" });
					const value: object = JSON.parse(importData);
					if (
						Object.keys(value).every((k) => k.includes(",")) &&
						Object.values(value).every((q) => typeof q === "number")
					) {
						const pos = Object.keys(value).map((x) => decodeAddress(x));
						const width = Math.max(...pos.map((p) => p.x)) + 1;
						const height = Math.max(...pos.map((p) => p.y)) + 1;
						mapRef.current = {
							data: value as Record<string, number>,
							width,
							height,
						};

						success({ detail: "Import successful!" });
						setDialogVisible(false);
					} else error({ detail: "Invalid tile map format!" });
				},
			});

		const updateImportData = (data: string) => {
			setImportData(data);
			try {
				JSON.parse(data);
				setDataValid(true);
			} catch {
				setDataValid(!data.trim());
			}
		};

		const footerContent = (
			<Button severity="success" label="Import" onClick={handleImport} />
		);
		return (
			<Dialog
				header="Import"
				visible={dialogVisible}
				onHide={() => setDialogVisible(false)}
				footer={footerContent}
			>
				<InputTextarea
					value={importData}
					onChange={(e) => updateImportData(e.target.value)}
					style={{
						width: "100%",
						height: "calc(100% - 0.25rem)",
						resize: "none",
					}}
					placeholder="Paste your tile map data here"
					invalid={!dataValid}
				/>
			</Dialog>
		);
	},
);

export default ImportDialog;
