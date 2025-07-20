import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import {
	forwardRef,
	type RefObject,
	useImperativeHandle,
	useState,
} from "react";
import type { TileMap } from "../../../types";

interface NewTileMapDialogProps {
	mapRef: RefObject<TileMap>;
}
export interface NewTileMapDialogRef {
	open: () => void;
}

const NewTileMapDialog = forwardRef<NewTileMapDialogRef, NewTileMapDialogProps>(
	({ mapRef }, ref) => {
		const [dialogVisible, setDialogVisible] = useState(false);
		const [width, setWidth] = useState(mapRef.current?.[0].length ?? 1);
		const [height, setHeight] = useState(mapRef.current?.length ?? 1);

		useImperativeHandle(ref, () => ({
			open: () => setDialogVisible(true),
		}));

		const handleCreate = () => {
			const createNewMap = () => {
				const newMap: TileMap = Array.from({ length: height }, () =>
					Array.from({ length: width }, () => null),
				);
				mapRef.current = newMap;
				setDialogVisible(false);
			};
			if (mapRef.current) {
				confirmDialog({
					message:
						"Are you sure you want to create a new map? This will overwrite the current map.",
					header: "Confirm",
					icon: "pi pi-exclamation-triangle",
					accept: createNewMap,
				});
			} else createNewMap();
		};
		const footerContent = (
			<Button
				label="Create"
				severity="success"
				disabled={!width || !height}
				onClick={handleCreate}
			/>
		);

		return (
			<Dialog
				visible={dialogVisible}
				onHide={() => setDialogVisible(false)}
				header="New"
				footer={footerContent}
			>
				<div className="ed-form">
					<span>Width:</span>
					<InputNumber
						value={width}
						onValueChange={(e) => setWidth(e.value ?? 1)}
						min={1}
						max={64}
					/>
					<span>Height:</span>
					<InputNumber
						value={height}
						onValueChange={(e) => setHeight(e.value ?? 1)}
						min={1}
						max={64}
					/>
				</div>
			</Dialog>
		);
	},
);

export default NewTileMapDialog;
