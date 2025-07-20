import { TriangleAlert } from "lucide-react";
import { Button } from "primereact/button";
import { ColorPicker } from "primereact/colorpicker";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import {
	type Dispatch,
	forwardRef,
	type SetStateAction,
	useImperativeHandle,
	useState,
} from "react";

interface EditColorDialogProps {
	palette: Record<number, string>;
	setPalette: Dispatch<SetStateAction<Record<number, string>>>;
	setSelectedColor: Dispatch<SetStateAction<number>>;
}

export interface EditColorDialogRef {
	edit: (colorId: number) => void;
	add: () => void;
}

const EditColorDialog = forwardRef<EditColorDialogRef, EditColorDialogProps>(
	({ palette, setPalette, setSelectedColor }, ref) => {
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
						if (dialogUpdating && colorId !== null)
							setPalette({ ...palette, [colorId]: dialogColor });
						else {
							setPalette({
								...palette,
								[Object.keys(palette).length]: dialogColor,
							});
							setSelectedColor(Object.keys(palette).length);
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
								const newPalette = { ...palette };
								delete newPalette[colorId];
								setPalette(newPalette);
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
	},
);

export default EditColorDialog;
