import { Button } from "primereact/button";
import "./Controls.css";
import {
	Brush,
	Check,
	Download,
	Edit,
	Eraser,
	FilePlus,
	Hand,
	PaintBucket,
	Plus,
	TriangleAlert,
	Upload,
} from "lucide-react";
import { ColorPicker } from "primereact/colorpicker";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { type Dispatch, type SetStateAction, useState } from "react";
import { getContrastColor } from "../App";

export type Tool = "pan" | "paint" | "erase" | "fill";

interface ControlsProps {
	selectedTool: Tool;
	setSelectedTool: Dispatch<SetStateAction<Tool>>;
	palette: Record<number, string>;
	setPalette: Dispatch<SetStateAction<Record<number, string>>>;
	selectedColor: number;
	setSelectedColor: Dispatch<SetStateAction<number>>;
}
function Controls({
	selectedTool,
	setSelectedTool,
	palette,
	setPalette,
	selectedColor,
	setSelectedColor,
}: ControlsProps) {
	const toolButtons: {
		icon: React.ReactNode;
		tool: Tool;
	}[] = [
		{ icon: <Hand />, tool: "pan" },
		{ icon: <Brush />, tool: "paint" },
		{ icon: <Eraser />, tool: "erase" },
		{ icon: <PaintBucket />, tool: "fill" },
	];

	const selectColor = (colorId: number) => {
		if (selectedColor === colorId) {
			setDialogColor(palette[colorId]);
			setDialogVisible(true);
			setDialogUpdating(true);
			return;
		}
		setSelectedColor(colorId);
	};

	const [dialogVisible, setDialogVisible] = useState(false);
	const [hoveredColor, setHoveredColor] = useState<number | null>(null);
	const [dialogColor, setDialogColor] = useState<string>("#FF0000");
	const [dialogUpdating, setDialogUpdating] = useState(false);

	const footerContent = (
		<>
			<Button
				label={dialogUpdating ? "Save Color" : "Add Color"}
				onClick={() => {
					if (dialogUpdating)
						setPalette({ ...palette, [selectedColor]: dialogColor });
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
							const newPalette = { ...palette };
							delete newPalette[selectedColor];
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
		<>
			<div className="Controls">
				<div>
					<Button icon={<FilePlus />} />
					<Button icon={<Upload />} />
					<Button icon={<Download />} />
				</div>
				<div>
					{toolButtons.map(({ icon, tool }) => (
						<Button
							key={tool}
							icon={icon}
							text={selectedTool !== tool}
							onClick={() => setSelectedTool?.(tool)}
						/>
					))}
				</div>
				<div>
					{Object.entries(palette).map(([colorId, color]) => (
						<Button
							key={colorId}
							style={{ backgroundColor: color, color: getContrastColor(color) }}
							onClick={() => selectColor(parseInt(colorId))}
							onMouseEnter={() => setHoveredColor(parseInt(colorId))}
							onMouseLeave={() => setHoveredColor(null)}
							icon={
								selectedColor === parseInt(colorId) ? (
									hoveredColor === parseInt(colorId) ? (
										<Edit />
									) : (
										<Check />
									)
								) : (
									<span>{colorId}</span>
								)
							}
						/>
					))}
					<Button
						icon={<Plus />}
						onClick={() => {
							setDialogVisible(true);
							setDialogUpdating(false);
						}}
					/>
				</div>
			</div>
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
		</>
	);
}

export default Controls;
