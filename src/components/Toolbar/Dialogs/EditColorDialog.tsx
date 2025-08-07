import { TriangleAlert } from "lucide-react";
import { Button } from "primereact/button";
import { ColorPicker } from "primereact/colorpicker";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTileMap } from "../../../contexts/TileMapContext";

export interface EditColorDialogRef {
	edit: (colorId: number) => void;
	add: () => void;
}

const EditColorDialog = forwardRef<EditColorDialogRef>((_, ref) => {
	const { palette, updateColor, addColor, deleteColor } = useTileMap();
	const [dialogVisible, setDialogVisible] = useState(false);
	const [dialogUpdating, setDialogUpdating] = useState(false);
	const [dialogColor, setDialogColor] = useState<string>("#FF0000");
	const [colorId, setColorId] = useState<number | null>(null);

	useImperativeHandle(ref, () => ({
		edit: (colorId: number) => {
			setDialogColor(palette[colorId]);
			setDialogUpdating(true);
			setDialogVisible(true);
			setColorId(colorId);
		},
		add: () => {
			setDialogColor("#FF0000");
			setDialogUpdating(false);
			setDialogVisible(true);
			setColorId(null);
		},
	}));

	const footerContent = (
		<>
			<Button
				label={dialogUpdating ? "Save Color" : "Add Color"}
				onClick={() => {
					if (dialogUpdating && colorId !== null) {
						updateColor(colorId, dialogColor);
					} else {
						addColor(dialogColor);
					}
					setDialogVisible(false);
				}}
				disabled={!dialogColor}
				severity="success"
			/>
			<Button
				label="Delete Color"
				onClick={() => {
					confirmDialog({
						header: "Delete Color",
						icon: <TriangleAlert />,
						message: "Are you sure you want to delete this color?",
						accept: () => {
							if (colorId === null) return;
							deleteColor(colorId);
							setDialogVisible(false);
						},
					});
				}}
				visible={dialogUpdating}
				disabled={Object.keys(palette).length <= 1}
				severity="danger"
			/>
		</>
	);

	return (
		<Dialog
			visible={dialogVisible}
			header={dialogUpdating ? "Update Color" : "Add Color"}
			onHide={() => setDialogVisible(false)}
			footer={footerContent}
		>
			<div className="ed-form">
				<span>Color:</span>
				<ColorPicker
					value={dialogColor}
					format="hex"
					onChange={(e) => setDialogColor(`#${e.value}`)}
				/>
			</div>
		</Dialog>
	);
});

export default EditColorDialog;
