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
import {
	decodeAddress,
	encodeAddress,
	is2DArray,
	isAddressMap,
	isTileIdMap,
} from "../../../utils";

interface ImportDialogProps {
	mapRef: RefObject<TileMap>;
	onImportSuccess?: () => void;
}
export interface ImportDialogRef {
	open: () => void;
}

const ImportDialog = forwardRef<ImportDialogRef, ImportDialogProps>(
	({ mapRef, onImportSuccess }, ref) => {
		const { success, error } = useToast();
		const { palette, setPalette } = useTileMap();
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
					const value = JSON.parse(importData);
					let successStatus = false;

					if (isAddressMap(value)) {
						// format 1
						const pos = Object.keys(value).map(decodeAddress);
						const width = Math.max(...pos.map((p) => p.x)) + 1;
						const height = Math.max(...pos.map((p) => p.y)) + 1;

						mapRef.current = { data: value, width, height };
						successStatus = true;
					} else if (isTileIdMap(value)) {
						// format 2
						const newMap: Record<string, number> = {};
						for (const [tileId, addresses] of Object.entries(value)) {
							for (const addr of addresses) {
								const { x, y } = decodeAddress(addr);
								newMap[encodeAddress(x, y)] = parseInt(tileId, 10);
							}
						}
						const pos = Object.keys(newMap).map(decodeAddress);
						const width = Math.max(...pos.map((p) => p.x)) + 1;
						const height = Math.max(...pos.map((p) => p.y)) + 1;

						mapRef.current = { data: newMap, width, height };
						successStatus = true;
					} else if (is2DArray(value)) {
						// format 3
						const newMap: Record<string, number> = {};
						value.forEach((row, y) => {
							row.forEach((tileId, x) => {
								const parsedNum = parseInt(String(tileId), 10);
								if (Number.isInteger(parsedNum)) {
									newMap[encodeAddress(x, y)] = parsedNum;
								}
							});
						});
						const width = value[0]?.length ?? 0;
						const height = value.length;

						mapRef.current = { data: newMap, width, height };
						successStatus = true;
					}

					if (successStatus) {
						// Generate missing colors.
						const map = mapRef.current;
						const colors = Object.values(map?.data ?? {});

						colors.forEach((tileId) => {
							if (tileId !== null && !(tileId in palette))
								setPalette((p: typeof palette) => ({
									...p,
									[tileId]: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
								}));
						});

						success({ detail: "Import successful!" });
						setDialogVisible(false);
						onImportSuccess?.();
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
